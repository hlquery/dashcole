import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';
import { models, sequelize } from './database.js';
import { ApiError } from './http.js';
import { annualResultsCsv, isValidStudentIdentifier, MINEDUC_REGULATION_VERSION, normalizeRut, promotionRecommendation, weightedFinal } from './services/mineduc.js';
import {
  buildSigeEx4,
  buildSigeEx5,
  validateSigeActa,
} from './services/mineduc-sige-acta.js';
import { applyCourseSigeDefaults, resolveSigeSubjectCode } from './services/sige-defaults.js';
import { pdfSignerSlot } from './services/pdf-signature.js';
import { drawSignatures } from './services/finance-pdf.js';
import {
  buildValidationSummary,
  buildWorkflowSteps,
  closurePermissions,
  deriveStage,
  stageLabel,
  stageRank,
} from './services/course-closure.js';

const filenamePart = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'curso';

function courseSigeFields(course, courseName = '') {
  const applied = applyCourseSigeDefaults(courseName || course.name, course);
  return {
    sigeTeachingTypeCode: applied.sigeTeachingTypeCode,
    sigeGradeCode: applied.sigeGradeCode,
    sigeEvaluationDecreeCode: applied.sigeEvaluationDecreeCode,
    sigeStudyPlanCode: applied.sigeStudyPlanCode,
    sigeSubjectCode: course.sigeSubjectCode || '',
  };
}

async function userNameMap(ids = []) {
  const unique = [...new Set(ids.filter(Boolean).map(Number))];
  if (!unique.length) return new Map();
  const users = await models.User.findAll({ where: { id: unique }, attributes: ['id', 'fullName', 'role'], raw: true });
  return new Map(users.map((user) => [user.id, user]));
}

async function findCourseClosure(schoolId, academicYearId, courseName, section) {
  return models.CourseClosure.findOne({
    where: { schoolId, academicYearId, courseName, section },
  });
}

async function getOrCreateClosure(schoolId, academicYearId, courseName, section, transaction) {
  const [row] = await models.CourseClosure.findOrCreate({
    where: { schoolId, academicYearId, courseName, section },
    defaults: { schoolId, academicYearId, courseName, section, stage: 'preparation' },
    transaction,
  });
  return row;
}

async function writeClosureAudit(req, action, payload, transaction) {
  await models.AuditLog.create({
    schoolId: req.user.schoolId,
    createdBy: req.user.id,
    action,
    entity: 'course_closure',
    payload,
  }, transaction ? { transaction } : undefined);
}

async function annualPreview(req) {
  const academicYearId = Number(req.query.academicYearId || req.body?.academicYearId);
  const courseName = String(req.query.courseName || req.body?.courseName || '').trim();
  const section = String(req.query.section || req.body?.section || '').trim();
  if (!Number.isInteger(academicYearId) || !courseName || !section) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona año académico, curso y sección.');
  const academicYear = await models.AcademicYear.findOne({ where: { id: academicYearId, schoolId: req.user.schoolId } });
  if (!academicYear) throw new ApiError(404, 'NOT_FOUND', 'Año académico no encontrado.');
  const courses = await models.Course.findAll({ where: { schoolId: req.user.schoolId, academicYearId, name: courseName, section }, order: [['subject', 'ASC']], raw: true });
  if (!courses.length) throw new ApiError(404, 'NOT_FOUND', 'Curso no encontrado para ese año.');
  const courseIds = courses.map(course => course.id);
  const enrollments = await models.Enrollment.findAll({ where: { schoolId: req.user.schoolId, courseId: courseIds }, raw: true });
  const studentIds = [...new Set(enrollments.filter(row => row.status !== 'withdrawn').map(row => row.studentId))];
  const [students, grades, attendance, subjects, saved, closure] = await Promise.all([
    models.Student.findAll({ where: { schoolId: req.user.schoolId, id: studentIds }, order: [['lastName', 'ASC'], ['firstName', 'ASC']], raw: true }),
    models.Grade.findAll({ where: { schoolId: req.user.schoolId, courseId: courseIds, studentId: studentIds, gradedAt: { [Op.between]: [academicYear.startsOn, academicYear.endsOn] } }, raw: true }),
    models.Attendance.findAll({ where: { schoolId: req.user.schoolId, courseId: courseIds, studentId: studentIds, attendedOn: { [Op.between]: [academicYear.startsOn, academicYear.endsOn] } }, raw: true }),
    models.Subject.findAll({ where: { schoolId: req.user.schoolId, id: courses.map(course => course.subjectId).filter(Boolean) }, raw: true }),
    models.AnnualResult.findAll({ where: { schoolId: req.user.schoolId, academicYearId, courseName, section }, raw: true }),
    findCourseClosure(req.user.schoolId, academicYearId, courseName, section),
  ]);
  const subjectMap = new Map(subjects.map(subject => [subject.id, subject]));
  const savedMap = new Map(saved.map(row => [row.studentId, row]));
  const coursesWithCodes = courses.map((course) => {
    const subject = subjectMap.get(course.subjectId);
    const sigeSubjectCode = resolveSigeSubjectCode(course.subject, subject?.sigeSubjectCode);
    return {
      ...course,
      ...courseSigeFields(course, courseName),
      sigeSubjectCode,
      subjectName: course.subject,
      affectsPromotion: subject?.affectsPromotion !== false,
    };
  });
  const courseDefaults = applyCourseSigeDefaults(courseName, coursesWithCodes[0] || {});
  const rows = students.map(student => {
    const existing = savedMap.get(student.id);
    const subjectResults = coursesWithCodes.map(course => {
      const enrollment = enrollments.find(row => row.studentId === student.id && row.courseId === course.id);
      const subject = subjectMap.get(course.subjectId);
      const exempt = enrollment?.status === 'exempt';
      const studentAttendance = attendance.filter(record => record.studentId === student.id && record.courseId === course.id);
      return {
        courseId: course.id,
        code: subject?.code || '',
        sigeSubjectCode: course.sigeSubjectCode || '',
        name: course.subject,
        affectsPromotion: subject?.affectsPromotion !== false,
        exempt,
        finalGrade: exempt ? null : weightedFinal(grades.filter(grade => grade.studentId === student.id && grade.courseId === course.id)),
        daysPresent: studentAttendance.filter((record) => ['present', 'late'].includes(record.status)).length,
        daysRecorded: studentAttendance.length,
      };
    });
    const records = attendance.filter(record => record.studentId === student.id);
    const daysPresent = records.filter(record => ['present', 'late'].includes(record.status)).length;
    const daysAbsent = records.filter(record => record.status === 'absent').length;
    const attendanceReference = records.length ? Math.round(daysPresent / records.length * 10000) / 100 : null;
    const recommendation = promotionRecommendation(subjectResults, existing?.attendancePercentage ?? attendanceReference ?? 0);
    const mergedSubjects = (existing?.subjectResults || subjectResults).map((subject) => {
      const live = subjectResults.find((item) => item.courseId === subject.courseId) || subject;
      return { ...subject, sigeSubjectCode: resolveSigeSubjectCode(live.name || subject.name, live.sigeSubjectCode || subject.sigeSubjectCode), affectsPromotion: live.affectsPromotion !== false };
    });
    const criteria = {
      averageOk: recommendation.academicEligible,
      failedOk: recommendation.failedSubjects <= 2,
      attendanceOk: recommendation.attendanceEligible,
    };
    return {
      studentId: student.id, firstName: student.firstName, lastName: student.lastName,
      nationalId: existing?.nationalId || student.nationalId || '', identifierType: existing?.identifierType || student.identifierType || 'rut',
      subjectResults: mergedSubjects, attendanceReference,
      attendancePercentage: existing ? Number(existing.attendancePercentage) : attendanceReference,
      attendanceStats: {
        daysWorked: records.length,
        daysPresent,
        daysAbsent,
        percentage: existing ? Number(existing.attendancePercentage) : attendanceReference,
      },
      criteria,
      ...recommendation,
      finalStatus: existing?.finalStatus || null,
      decisionBasis: existing?.decisionBasis || '',
      decisionNotes: existing?.decisionNotes || '',
      decisionBy: existing?.decisionBy || null,
      decisionAt: existing?.decisionAt || null,
      finalizedAt: existing?.finalizedAt || null,
      actaClosedAt: existing?.actaClosedAt || null,
      issues: [
        ...(!existing && !isValidStudentIdentifier(student.identifierType || 'rut', student.nationalId) ? ['Falta RUT/IPE válido'] : []),
        ...(subjectResults.some(subject => subject.affectsPromotion && !subject.exempt && subject.finalGrade === null) ? ['Faltan calificaciones finales'] : []),
        ...(attendanceReference === null && !existing ? ['Falta porcentaje anual de asistencia'] : []),
      ],
    };
  });
  const actaClosedAt = saved.find((row) => row.actaClosedAt)?.actaClosedAt || closure?.closedAt || null;
  const actaClosedBy = saved.find((row) => row.actaClosedBy)?.actaClosedBy || closure?.closedBy || null;
  const stage = deriveStage({ closure: closure?.toJSON?.() || closure, rows, actaClosedAt });
  return {
    academicYear: academicYear.toJSON(),
    courseName,
    section,
    courses: coursesWithCodes,
    headTeacher: coursesWithCodes[0]?.headTeacher || coursesWithCodes[0]?.head_teacher || '',
    sigeCodes: {
      sigeTeachingTypeCode: courseDefaults.sigeTeachingTypeCode,
      sigeGradeCode: courseDefaults.sigeGradeCode,
      sigeEvaluationDecreeCode: courseDefaults.sigeEvaluationDecreeCode,
      sigeStudyPlanCode: courseDefaults.sigeStudyPlanCode,
      subjects: coursesWithCodes.map((course) => ({
        courseId: course.id,
        subjectId: course.subjectId,
        name: course.subject,
        sigeSubjectCode: course.sigeSubjectCode || '',
        affectsPromotion: course.affectsPromotion !== false,
      })),
    },
    closure: closure ? closure.toJSON() : null,
    stage,
    stageLabel: stageLabel(stage),
    actaClosedAt,
    actaClosedBy,
    rows,
  };
}

async function enrichPreview(req, preview, school) {
  const perms = closurePermissions(req.user);
  const closure = preview.closure || {};
  const users = await userNameMap([
    closure.teacherReadyBy,
    closure.utpApprovedBy,
    closure.directorApprovedBy,
    closure.closedBy,
    preview.actaClosedBy,
    ...preview.rows.map((row) => row.decisionBy),
  ]);
  const staff = await models.User.findAll({
    where: {
      schoolId: req.user.schoolId,
      role: { [Op.in]: ['utp', 'director', 'school_admin'] },
      active: true,
    },
    attributes: ['id', 'fullName', 'role'],
    raw: true,
  });
  const validation = buildValidationSummary({ school, preview, stage: preview.stage });
  const history = await models.AuditLog.findAll({
    where: {
      schoolId: req.user.schoolId,
      entity: { [Op.in]: ['course', 'course_closure'] },
      action: {
        [Op.in]: [
          'annual_results_finalized', 'annual_results_rectified', 'annual_acta_closed', 'annual_acta_reopened',
          'closure_teacher_submit', 'closure_utp_approve', 'closure_utp_request_fix',
          'closure_director_approve', 'closure_locked', 'closure_reopened', 'closure_student_resolution',
          'closure_sige_codes_updated',
        ],
      },
    },
    order: [['createdAt', 'DESC']],
    limit: 80,
    raw: true,
  });
  const scopedHistory = history.filter((row) => {
    const payload = row.payload || {};
    return Number(payload.academicYearId) === Number(preview.academicYear.id)
      && payload.courseName === preview.courseName
      && payload.section === preview.section;
  });
  const actorIds = [...new Set(scopedHistory.map((row) => row.createdBy).filter(Boolean))];
  const historyUsers = await userNameMap(actorIds);
  return {
    ...preview,
    school,
    regulation: MINEDUC_REGULATION_VERSION,
    permissions: perms,
    staff: {
      headTeacher: preview.headTeacher || '—',
      utp: staff.find((user) => user.role === 'utp')?.fullName || '—',
      director: staff.find((user) => ['director', 'school_admin'].includes(user.role))?.fullName || '—',
    },
    workflow: buildWorkflowSteps(closure, {
      teacher: users.get(closure.teacherReadyBy)?.fullName,
      utp: users.get(closure.utpApprovedBy)?.fullName,
      director: users.get(closure.directorApprovedBy)?.fullName,
      closer: users.get(closure.closedBy || preview.actaClosedBy)?.fullName,
    }),
    validation,
    history: scopedHistory.map((row) => ({
      id: row.id,
      action: row.action,
      at: row.createdAt || row.created_at,
      comment: row.payload?.comment || row.payload?.rectificationReason || row.payload?.reason || '',
      studentId: row.payload?.studentId || null,
      actor: historyUsers.get(row.createdBy)?.fullName || 'Usuario',
      role: historyUsers.get(row.createdBy)?.role || '',
    })),
    actaStatus: preview.actaClosedAt
      ? 'Cerrado en DashCole — pendiente de carga/cierre oficial en SIGE'
      : null,
  };
}

function assertNotClosed(preview, user) {
  const perms = closurePermissions(user);
  if ((preview.actaClosedAt || preview.stage === 'closed') && !perms.canUnlock) {
    throw new ApiError(409, 'ACTA_CLOSED', 'El cierre está bloqueado. Solo un administrador puede reabrirlo.');
  }
}

function assertCanRead(user) {
  if (!closurePermissions(user).canRead) {
    throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para ver el cierre anual.');
  }
}

export function registerMineducRoutes(app) {
  app.get('/api/mineduc/options', async (req, res) => {
    assertCanRead(req.user);
    const [years, courses] = await Promise.all([
      models.AcademicYear.findAll({ where: { schoolId: req.user.schoolId }, order: [['startsOn', 'DESC']], attributes: ['id', 'name', 'active'], raw: true }),
      models.Course.findAll({ where: { schoolId: req.user.schoolId }, order: [['name', 'ASC'], ['section', 'ASC']], attributes: ['academicYearId', 'name', 'section'], raw: true }),
    ]);
    const seen = new Set();
    res.json({
      years,
      courses: courses.filter(course => {
        const key = `${course.academicYearId}:${course.name}:${course.section}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }),
      permissions: closurePermissions(req.user),
    });
  });

  app.get('/api/mineduc/annual-results', async (req, res) => {
    assertCanRead(req.user);
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });
    const preview = await annualPreview(req);
    res.json(await enrichPreview(req, preview, school));
  });

  app.put('/api/mineduc/annual-results/sige-codes', async (req, res) => {
    const perms = closurePermissions(req.user);
    if (!perms.canConfigureSige) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o dirección pueden configurar códigos SIGE.');
    const preview = await annualPreview(req);
    assertNotClosed(preview, req.user);
    const teachingType = String(req.body.sigeTeachingTypeCode || '').trim();
    const grade = String(req.body.sigeGradeCode || '').trim();
    const decree = String(req.body.sigeEvaluationDecreeCode || '').trim();
    const plan = String(req.body.sigeStudyPlanCode || '').trim();
    const subjectCodes = Array.isArray(req.body.subjects) ? req.body.subjects : [];
    await sequelize.transaction(async (transaction) => {
      await models.Course.update({
        sigeTeachingTypeCode: teachingType || null,
        sigeGradeCode: grade || null,
        sigeEvaluationDecreeCode: decree || null,
        sigeStudyPlanCode: plan || null,
      }, {
        where: {
          schoolId: req.user.schoolId,
          academicYearId: preview.academicYear.id,
          name: preview.courseName,
          section: preview.section,
        },
        transaction,
      });
      for (const item of subjectCodes) {
        const courseId = Number(item.courseId);
        const code = String(item.sigeSubjectCode || '').trim();
        const course = preview.courses.find((row) => row.id === courseId);
        if (!course?.subjectId) continue;
        const patch = { sigeSubjectCode: code || null };
        if (typeof item.affectsPromotion === 'boolean') patch.affectsPromotion = item.affectsPromotion;
        await models.Subject.update(patch, { where: { id: course.subjectId, schoolId: req.user.schoolId }, transaction });
      }
      await writeClosureAudit(req, 'closure_sige_codes_updated', {
        academicYearId: preview.academicYear.id,
        courseName: preview.courseName,
        section: preview.section,
      }, transaction);
    });
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });
    res.json(await enrichPreview(req, await annualPreview(req), school));
  });

  app.post('/api/mineduc/annual-results/finalize', async (req, res) => {
    const perms = closurePermissions(req.user);
    if (!perms.canSubmitTeacher) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para finalizar calificaciones del cierre.');
    const preview = await annualPreview(req);
    assertNotClosed(preview, req.user);
    const rbd = String(req.body.rbd || '').trim().toUpperCase();
    if (!/^\d{1,6}(?:-[\dK])?$/.test(rbd)) throw new ApiError(400, 'VALIDATION_ERROR', 'Ingresa un RBD válido.');
    if (!Array.isArray(req.body.rows) || req.body.rows.length !== preview.rows.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Debes revisar a todos los estudiantes del curso.');
    const inputMap = new Map(req.body.rows.map(row => [Number(row.studentId), row]));
    const existingCount = await models.AnnualResult.count({ where: { schoolId: req.user.schoolId, academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section } });
    if (existingCount && req.body.replace !== true) throw new ApiError(409, 'ANNUAL_RESULTS_LOCKED', 'El curso ya fue cerrado. Usa rectificación e indica el fundamento.');
    const rectificationReason = String(req.body.rectificationReason || '').trim();
    if (existingCount && rectificationReason.length < 20) throw new ApiError(400, 'RECTIFICATION_REASON_REQUIRED', 'La rectificación requiere un fundamento de al menos 20 caracteres.');
    const comment = String(req.body.comment || '').trim();
    const finalized = [];
    for (const computed of preview.rows) {
      const input = inputMap.get(computed.studentId);
      if (!input) throw new ApiError(400, 'VALIDATION_ERROR', `Falta revisar a ${computed.firstName} ${computed.lastName}.`);
      const identifierType = String(input.identifierType || 'rut');
      const nationalId = identifierType === 'rut' ? normalizeRut(input.nationalId) : String(input.nationalId || '').trim().toUpperCase();
      const attendancePercentage = Number(input.attendancePercentage);
      const finalStatus = String(input.finalStatus || '');
      const decisionBasis = String(input.decisionBasis || '').trim();
      const decisionNotes = String(input.decisionNotes || '').trim();
      if (!isValidStudentIdentifier(identifierType, nationalId) || !Number.isFinite(attendancePercentage) || attendancePercentage < 0 || attendancePercentage > 100 || !['promoted', 'not_promoted', 'withdrawn'].includes(finalStatus)) {
        throw new ApiError(400, 'VALIDATION_ERROR', `Revisa identificación, asistencia y situación final de ${computed.firstName} ${computed.lastName}.`);
      }
      if (computed.subjectResults.some(subject => subject.affectsPromotion && !subject.exempt && subject.finalGrade === null)) {
        throw new ApiError(409, 'MISSING_FINAL_GRADES', `${computed.firstName} ${computed.lastName} tiene asignaturas sin nota final.`);
      }
      const recommendation = promotionRecommendation(computed.subjectResults, attendancePercentage);
      if (recommendation.annualAverage === null && finalStatus !== 'withdrawn') {
        throw new ApiError(409, 'MISSING_STUDY_PLAN', `${computed.firstName} ${computed.lastName} no tiene asignaturas que incidan en promoción.`);
      }
      if ((recommendation.recommendedStatus === 'review_required' || finalStatus === 'not_promoted') && decisionBasis.length < 20) {
        throw new ApiError(400, 'DECISION_BASIS_REQUIRED', `Registra el análisis fundado de ${computed.firstName} ${computed.lastName}.`);
      }
      finalized.push({
        ...computed,
        ...recommendation,
        identifierType,
        nationalId,
        attendancePercentage,
        finalStatus,
        decisionBasis,
        decisionNotes,
      });
    }
    await sequelize.transaction(async transaction => {
      await models.School.update({ rbd }, { where: { id: req.user.schoolId }, transaction });
      for (const row of finalized) {
        await models.Student.update({ nationalId: row.nationalId, identifierType: row.identifierType }, { where: { id: row.studentId, schoolId: req.user.schoolId }, transaction });
        await models.AnnualResult.upsert({
          schoolId: req.user.schoolId,
          academicYearId: preview.academicYear.id,
          studentId: row.studentId,
          courseName: preview.courseName,
          section: preview.section,
          identifierType: row.identifierType,
          nationalId: row.nationalId,
          subjectResults: row.subjectResults,
          annualAverage: row.annualAverage ?? 0,
          attendancePercentage: row.attendancePercentage,
          finalStatus: row.finalStatus,
          decisionBasis: [row.decisionBasis, existingCount ? `Rectificación: ${rectificationReason}` : ''].filter(Boolean).join('\n'),
          decisionNotes: row.decisionNotes || null,
          decisionBy: row.decisionBasis ? req.user.id : null,
          decisionAt: row.decisionBasis ? new Date() : null,
          regulationVersion: MINEDUC_REGULATION_VERSION,
          finalizedBy: req.user.id,
          finalizedAt: new Date(),
          actaClosedAt: null,
          actaClosedBy: null,
        }, { transaction });
      }
      const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
      await closure.update({
        stage: 'teacher_ready',
        teacherReadyAt: new Date(),
        teacherReadyBy: req.user.id,
        teacherComment: comment || null,
        utpApprovedAt: null,
        utpApprovedBy: null,
        directorApprovedAt: null,
        directorApprovedBy: null,
        closedAt: null,
        closedBy: null,
      }, { transaction });
      await writeClosureAudit(req, existingCount ? 'annual_results_rectified' : 'annual_results_finalized', {
        academicYearId: preview.academicYear.id,
        courseName: preview.courseName,
        section: preview.section,
        students: finalized.length,
        rectificationReason: rectificationReason || null,
        comment: comment || null,
      }, transaction);
      await writeClosureAudit(req, 'closure_teacher_submit', {
        academicYearId: preview.academicYear.id,
        courseName: preview.courseName,
        section: preview.section,
        comment: comment || 'Calificaciones enviadas a UTP',
      }, transaction);
    });
    res.json({ finalized: finalized.length, stage: 'teacher_ready' });
  });

  app.post('/api/mineduc/annual-results/student-resolution', async (req, res) => {
    const perms = closurePermissions(req.user);
    if (!perms.canResolveStudent) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o dirección pueden registrar la resolución.');
    const preview = await annualPreview(req);
    assertNotClosed(preview, req.user);
    const studentId = Number(req.body.studentId);
    const row = preview.rows.find((item) => item.studentId === studentId);
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Estudiante no encontrado en este curso.');
    const finalStatus = String(req.body.finalStatus || '');
    const decisionBasis = String(req.body.decisionBasis || '').trim();
    const decisionNotes = String(req.body.decisionNotes || '').trim();
    if (!['promoted', 'not_promoted', 'withdrawn'].includes(finalStatus)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona promover o repetir.');
    }
    if (decisionBasis.length < 20) throw new ApiError(400, 'DECISION_BASIS_REQUIRED', 'El fundamento debe tener al menos 20 caracteres.');
    const attendancePercentage = Number(req.body.attendancePercentage ?? row.attendancePercentage);
    const identifierType = String(req.body.identifierType || row.identifierType || 'rut');
    const nationalId = identifierType === 'rut' ? normalizeRut(req.body.nationalId || row.nationalId) : String(req.body.nationalId || row.nationalId || '').trim().toUpperCase();
    if (!isValidStudentIdentifier(identifierType, nationalId)) throw new ApiError(400, 'VALIDATION_ERROR', 'RUN/IPE inválido.');
    const recommendation = promotionRecommendation(row.subjectResults, attendancePercentage);
    await sequelize.transaction(async (transaction) => {
      await models.Student.update({ nationalId, identifierType }, { where: { id: studentId, schoolId: req.user.schoolId }, transaction });
      await models.AnnualResult.upsert({
        schoolId: req.user.schoolId,
        academicYearId: preview.academicYear.id,
        studentId,
        courseName: preview.courseName,
        section: preview.section,
        identifierType,
        nationalId,
        subjectResults: row.subjectResults,
        annualAverage: recommendation.annualAverage ?? 0,
        attendancePercentage,
        finalStatus,
        decisionBasis,
        decisionNotes: decisionNotes || null,
        decisionBy: req.user.id,
        decisionAt: new Date(),
        regulationVersion: MINEDUC_REGULATION_VERSION,
        finalizedBy: req.user.id,
        finalizedAt: row.finalizedAt || new Date(),
        actaClosedAt: null,
        actaClosedBy: null,
      }, { transaction });
      await writeClosureAudit(req, 'closure_student_resolution', {
        academicYearId: preview.academicYear.id,
        courseName: preview.courseName,
        section: preview.section,
        studentId,
        finalStatus,
        comment: decisionBasis,
      }, transaction);
    });
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });
    res.json(await enrichPreview(req, await annualPreview(req), school));
  });

  app.post('/api/mineduc/annual-results/workflow', async (req, res) => {
    const action = String(req.body.action || '').trim();
    const comment = String(req.body.comment || '').trim();
    const perms = closurePermissions(req.user);
    const preview = await annualPreview(req);
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });

    if (action === 'request_corrections') {
      if (!perms.canReviewUtp) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP puede solicitar correcciones.');
      assertNotClosed(preview, req.user);
      if (!comment) throw new ApiError(400, 'VALIDATION_ERROR', 'Indica qué debe corregir el profesor.');
      await sequelize.transaction(async (transaction) => {
        const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
        await closure.update({
          stage: 'preparation',
          teacherReadyAt: null,
          teacherReadyBy: null,
          utpApprovedAt: null,
          utpApprovedBy: null,
          utpComment: comment,
          directorApprovedAt: null,
          directorApprovedBy: null,
        }, { transaction });
        await writeClosureAudit(req, 'closure_utp_request_fix', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment,
        }, transaction);
      });
      return res.json(await enrichPreview(req, await annualPreview(req), school));
    }

    if (action === 'approve_utp') {
      if (!perms.canReviewUtp) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP puede aprobar la revisión académica.');
      assertNotClosed(preview, req.user);
      if (stageRank(preview.stage) < stageRank('teacher_ready') && !preview.rows.every((row) => row.finalizedAt)) {
        throw new ApiError(409, 'TEACHER_NOT_READY', 'El profesor aún no ha finalizado las calificaciones.');
      }
      const validation = buildValidationSummary({ school, preview, stage: 'teacher_ready' });
      if (validation.blockingErrors.some((item) => ['grades', 'attendance', 'ids', 'analysis'].includes(item.id))) {
        throw new ApiError(409, 'VALIDATION_INCOMPLETE', 'Hay errores bloqueantes antes de enviar a dirección.', { errors: validation.blockingErrors.map((item) => item.label) });
      }
      await sequelize.transaction(async (transaction) => {
        const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
        await closure.update({
          stage: 'utp_approved',
          utpApprovedAt: new Date(),
          utpApprovedBy: req.user.id,
          utpComment: comment || null,
          directorApprovedAt: null,
          directorApprovedBy: null,
        }, { transaction });
        await writeClosureAudit(req, 'closure_utp_approve', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment: comment || 'Revisión académica aprobada',
        }, transaction);
      });
      return res.json(await enrichPreview(req, await annualPreview(req), school));
    }

    if (action === 'approve_director') {
      if (!perms.canApproveDirector) throw new ApiError(403, 'FORBIDDEN', 'Solo dirección puede autorizar el cierre.');
      assertNotClosed(preview, req.user);
      if (stageRank(preview.stage) < stageRank('utp_approved')) {
        throw new ApiError(409, 'UTP_NOT_READY', 'UTP aún no ha aprobado la revisión académica.');
      }
      await sequelize.transaction(async (transaction) => {
        const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
        await closure.update({
          stage: 'director_approved',
          directorApprovedAt: new Date(),
          directorApprovedBy: req.user.id,
          directorComment: comment || null,
        }, { transaction });
        await writeClosureAudit(req, 'closure_director_approve', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment: comment || 'Cierre autorizado por dirección',
        }, transaction);
      });
      return res.json(await enrichPreview(req, await annualPreview(req), school));
    }

    if (action === 'lock') {
      if (!perms.canLock) throw new ApiError(403, 'FORBIDDEN', 'Solo dirección puede bloquear el cierre.');
      if (String(req.body.confirm || '').trim().toUpperCase() !== 'CERRAR CURSO') {
        throw new ApiError(400, 'CONFIRMATION_REQUIRED', 'Escribe CERRAR CURSO para confirmar.');
      }
      if (stageRank(preview.stage) < stageRank('director_approved')) {
        throw new ApiError(409, 'DIRECTOR_NOT_READY', 'La dirección debe autorizar antes de bloquear.');
      }
      if (preview.rows.some(row => !row.finalizedAt)) throw new ApiError(409, 'ANNUAL_RESULTS_NOT_FINALIZED', 'Finaliza todos los resultados antes de cerrar.');
      const validation = validateSigeActa({ school, ...preview });
      if (!validation.ready) throw new ApiError(409, 'SIGE_VALIDATION_FAILED', validation.message, { errors: validation.errors });
      await sequelize.transaction(async (transaction) => {
        await models.AnnualResult.update(
          { actaClosedAt: new Date(), actaClosedBy: req.user.id },
          { where: { schoolId: req.user.schoolId, academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section }, transaction },
        );
        const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
        await closure.update({
          stage: 'closed',
          closedAt: new Date(),
          closedBy: req.user.id,
        }, { transaction });
        await writeClosureAudit(req, 'annual_acta_closed', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
        }, transaction);
        await writeClosureAudit(req, 'closure_locked', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment: comment || 'Cierre anual bloqueado',
        }, transaction);
      });
      return res.json(await enrichPreview(req, await annualPreview(req), school));
    }

    if (action === 'reopen') {
      if (!perms.canUnlock) throw new ApiError(403, 'FORBIDDEN', 'Solo un administrador puede reabrir el cierre.');
      if (!preview.actaClosedAt && preview.stage !== 'closed') throw new ApiError(409, 'ACTA_NOT_CLOSED', 'El curso no está cerrado.');
      const reason = comment;
      if (reason.length < 20) throw new ApiError(400, 'VALIDATION_ERROR', 'Indica el fundamento de la reapertura (mín. 20 caracteres).');
      await sequelize.transaction(async (transaction) => {
        await models.AnnualResult.update(
          { actaClosedAt: null, actaClosedBy: null },
          { where: { schoolId: req.user.schoolId, academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section }, transaction },
        );
        const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
        await closure.update({
          stage: 'director_approved',
          closedAt: null,
          closedBy: null,
          reopenReason: reason,
        }, { transaction });
        await writeClosureAudit(req, 'annual_acta_reopened', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment: reason,
        }, transaction);
        await writeClosureAudit(req, 'closure_reopened', {
          academicYearId: preview.academicYear.id,
          courseName: preview.courseName,
          section: preview.section,
          comment: reason,
        }, transaction);
      });
      return res.json(await enrichPreview(req, await annualPreview(req), school));
    }

    throw new ApiError(400, 'VALIDATION_ERROR', 'Acción de workflow no reconocida.');
  });

  app.post('/api/mineduc/annual-results/validate-sige', async (req, res) => {
    assertCanRead(req.user);
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['name', 'rbd'], raw: true });
    const preview = await annualPreview(req);
    const summary = buildValidationSummary({ school, preview, stage: preview.stage });
    if (preview.rows.some(row => !row.finalizedAt)) {
      return res.json({
        ready: false,
        message: 'Acta no lista para SIGE',
        errors: ['Finaliza todos los resultados del curso antes de validar para SIGE.'],
        validation: summary,
      });
    }
    res.json({ ...validateSigeActa({ school, ...preview }), validation: summary });
  });

  app.post('/api/mineduc/annual-results/close-acta', async (req, res) => {
    const perms = closurePermissions(req.user);
    if (!perms.canLock) throw new ApiError(403, 'FORBIDDEN', 'Solo dirección puede cerrar el acta.');
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });
    const preview = await annualPreview(req);
    if (preview.rows.some(row => !row.finalizedAt)) throw new ApiError(409, 'ANNUAL_RESULTS_NOT_FINALIZED', 'Finaliza todos los resultados antes de cerrar el acta.');
    const validation = validateSigeActa({ school, ...preview });
    if (!validation.ready) throw new ApiError(409, 'SIGE_VALIDATION_FAILED', validation.message, { errors: validation.errors });
    await sequelize.transaction(async (transaction) => {
      await models.AnnualResult.update(
        { actaClosedAt: new Date(), actaClosedBy: req.user.id },
        { where: { schoolId: req.user.schoolId, academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section }, transaction },
      );
      const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
      await closure.update({ stage: 'closed', closedAt: new Date(), closedBy: req.user.id }, { transaction });
      await writeClosureAudit(req, 'annual_acta_closed', {
        academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section,
      }, transaction);
      await writeClosureAudit(req, 'closure_locked', {
        academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section, comment: 'Cierre anual bloqueado',
      }, transaction);
    });
    res.json(await enrichPreview(req, await annualPreview(req), school));
  });

  app.post('/api/mineduc/annual-results/reopen-acta', async (req, res) => {
    const perms = closurePermissions(req.user);
    if (!perms.canUnlock) throw new ApiError(403, 'FORBIDDEN', 'Solo un administrador puede reabrir el acta.');
    const preview = await annualPreview(req);
    if (!preview.actaClosedAt && preview.stage !== 'closed') throw new ApiError(409, 'ACTA_NOT_CLOSED', 'El acta no está cerrada.');
    const reason = String(req.body.comment || req.body.reason || 'Reapertura administrativa del cierre anual.').trim();
    await sequelize.transaction(async (transaction) => {
      await models.AnnualResult.update(
        { actaClosedAt: null, actaClosedBy: null },
        { where: { schoolId: req.user.schoolId, academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section }, transaction },
      );
      const closure = await getOrCreateClosure(req.user.schoolId, preview.academicYear.id, preview.courseName, preview.section, transaction);
      await closure.update({
        stage: 'director_approved',
        closedAt: null,
        closedBy: null,
        reopenReason: reason,
      }, { transaction });
      await writeClosureAudit(req, 'annual_acta_reopened', {
        academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section, comment: reason,
      }, transaction);
      await writeClosureAudit(req, 'closure_reopened', {
        academicYearId: preview.academicYear.id, courseName: preview.courseName, section: preview.section, comment: reason,
      }, transaction);
    });
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['id', 'name', 'rbd'], raw: true });
    res.json(await enrichPreview(req, await annualPreview(req), school));
  });

  app.get('/api/mineduc/annual-results/export.csv', async (req, res) => {
    assertCanRead(req.user);
    if (!closurePermissions(req.user).canExport) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para exportar.');
    const preview = await annualPreview(req);
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['name', 'rbd'], raw: true });
    if (!school?.rbd || preview.rows.some(row => !row.finalizedAt)) throw new ApiError(409, 'ANNUAL_RESULTS_NOT_FINALIZED', 'Finaliza todos los resultados antes de exportar.');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="preacta-mineduc-${filenamePart(preview.academicYear.name)}-${filenamePart(preview.courseName)}-${filenamePart(preview.section)}.csv"`);
    res.send(annualResultsCsv({ school, ...preview }));
  });

  app.get('/api/mineduc/annual-results/export.pdf', async (req, res) => {
    assertCanRead(req.user);
    if (!closurePermissions(req.user).canExport) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para exportar.');
    const preview = await annualPreview(req);
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['name', 'rbd'], raw: true });
    if (!school?.rbd || preview.rows.some(row => !row.finalizedAt)) throw new ApiError(409, 'ANNUAL_RESULTS_NOT_FINALIZED', 'Finaliza todos los resultados antes de exportar.');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="preacta-${filenamePart(preview.academicYear.name)}-${filenamePart(preview.courseName)}-${filenamePart(preview.section)}.pdf"`);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36, info: { Title: 'Pre-acta de calificaciones y promoción escolar', Author: school.name } });
    doc.pipe(res);
    doc.fontSize(16).fillColor('#075f98').text('Pre-acta de calificaciones y promoción escolar');
    doc.moveDown(.3).fontSize(9).fillColor('#263746').text(`${school.name} · RBD ${school.rbd} · ${preview.courseName} ${preview.section} · Año ${preview.academicYear.name}`);
    doc.fontSize(7).fillColor('#687986').text('Preparación conforme a los campos del artículo 20 del Decreto 67/2018. El acta oficial debe generarse y firmarse en SIGE por la dirección.');
    doc.moveDown();
    for (const row of preview.rows) {
      if (doc.y > 520) doc.addPage();
      const grades = row.subjectResults.map(subject => `${subject.name}: ${subject.exempt ? 'EX' : Number(subject.finalGrade).toFixed(1)}`).join(' · ');
      doc.fontSize(8).fillColor('#263746').text(`${row.lastName}, ${row.firstName} · ${row.identifierType.toUpperCase()} ${row.nationalId} · Promedio ${Number(row.annualAverage).toFixed(1)} · Asistencia ${Number(row.attendancePercentage).toFixed(2)}% · ${row.finalStatus === 'promoted' ? 'PROMOVIDO' : row.finalStatus === 'withdrawn' ? 'RETIRADO' : 'NO PROMOVIDO'}`);
      doc.fontSize(7).fillColor('#687986').text(grades);
      if (row.decisionBasis) doc.text(`Fundamento: ${row.decisionBasis}`);
      doc.moveDown(.5);
    }
    drawSignatures(doc, {
      slots: [
        pdfSignerSlot(req.user, { label: 'Dirección / validación del establecimiento' }),
        { label: 'Secretaría / Administración' },
      ],
    });
    doc.end();
  });

  async function exportSigeFile(req, res, kind) {
    assertCanRead(req.user);
    if (!closurePermissions(req.user).canExport) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para exportar.');
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['name', 'rbd'], raw: true });
    const preview = await annualPreview(req);
    if (preview.rows.some(row => !row.finalizedAt)) throw new ApiError(409, 'ANNUAL_RESULTS_NOT_FINALIZED', 'Finaliza todos los resultados antes de exportar.');
    const validation = validateSigeActa({ school, ...preview });
    if (!validation.ready) throw new ApiError(409, 'SIGE_VALIDATION_FAILED', validation.message, { errors: validation.errors });
    const body = kind === 'ex4'
      ? buildSigeEx4({ school, ...preview })
      : buildSigeEx5({ school, ...preview });
    const filename = kind === 'ex4' ? 'calificaciones_ex4.txt' : 'situacion_final_ex5.txt';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  }

  app.get('/api/mineduc/annual-results/export.ex4.txt', async (req, res) => exportSigeFile(req, res, 'ex4'));
  app.get('/api/mineduc/annual-results/export.ex5.txt', async (req, res) => exportSigeFile(req, res, 'ex5'));
}
