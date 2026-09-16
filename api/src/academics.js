import { isValidDate, isValidMoney } from './validation.js';
import { ApiError } from './http.js';
import { getSchoolContext, assertOwnedBySchool } from './school-context.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { createUpload, safeUploadPath, persistUpload, tenantUploadKey } from './uploads.js';
import { clearDashboardCache, controlModels, models, sequelize } from './database.js';
import { linkTenantIdentity, setTenantMembershipAccess } from './tenant-identity.js';
import { canManageDocuments, documentScope } from './document-access.js';
import { queueWelcome } from './services/mail.js';
import { isValidRut, normalizeRut } from './services/mineduc.js';
import { ensureDefaultJobTitles, backfillDefaultJobTitleHierarchies } from './services/job-titles.js';
import { ensureCourseLevelModules, SUBJECT_COLORS, normalizeSubjectColor, nextAvailableSubjectColor, COURSE_TRACKS, EDUCATION_STAGES, normalizeEducationStages, levelsForEducationStages, templatesForEducationStages, stageIdForLevelName, educationStageLabel } from './services/school-structure.js';
import { defaultSigeSubjectCode, DEFAULT_SIGE_SUBJECT_CODES } from './services/sige-defaults.js';
import { teacherCourseMatchSql, teacherCourseMatchParams } from './services/teacher-scope.js';
import { formatTeacherNames, parseTeacherNames, readTeacherNames } from './services/course-teachers.js';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || new URL('../uploads', import.meta.url).pathname);
const upload = createUpload({ kind: 'material', disk: true });
const documentUpload = createUpload({ disk: true });

function normalizeOptionalSigeSubjectCode(value) {
  const code = String(value || '').trim();
  if (!code) return '';
  if (code.length > 20 || !/^\d+$/.test(code)) return null;
  return code;
}

function subjectCreateDefaults({ createdBy, name, code = null, sigeSubjectCode = '' } = {}) {
  const resolved = String(sigeSubjectCode || '').trim() || defaultSigeSubjectCode(name) || null;
  return {
    createdBy,
    ...(code != null ? { code } : {}),
    sigeSubjectCode: resolved,
  };
}

function canManageCourseStructure(req, res, next) {
  if (req.user.role === 'teacher') {
    return res.status(403).json({ message: 'No tienes permiso para crear asignaturas o cursos.' });
  }
  if (req.user.permissions?.manageSchool || req.user.role === 'utp') {
    return next();
  }
  return res.status(403).json({ message: 'No tienes permiso para crear asignaturas o cursos.' });
}

function canManageMonthlyFees(req, res, next) {
  if (!req.user.permissions?.manageSchool) {
    return res.status(403).json({ message: 'No tienes permiso para configurar mensualidades.' });
  }
  next();
}

function canManageMaterials(req, res, next) {
  if (['student', 'guardian'].includes(req.user.role) || (!req.user.permissions?.manageGrades && !req.user.permissions?.manageSchool)) return res.status(403).json({ message: 'No tienes permiso para gestionar materiales.' });
  next();
}

function canManageCourseLinks(req, res, next) {
  if (req.user.readOnly || ['student', 'guardian'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Solo el profesor o administración pueden gestionar enlaces.' });
  }
  if (req.user.permissions?.manageSchool || req.user.permissions?.manageGrades || req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ message: 'Solo el profesor o administración pueden gestionar enlaces.' });
}

function normalizeCourseLinkUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 2000) return '';
  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function canManagePeople(req, res, next) {
  if (!req.user.permissions?.manageUsers) return res.status(403).json({ message: 'No tienes permiso para gestionar estudiantes.' });
  next();
}

function canDeactivateStudent(req, res, next) {
  if (!['director', 'school_admin', 'super_admin', 'utp', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Solo dirección, administración, UTP o managers pueden dar de baja estudiantes.' });
  }
  if (!req.user.permissions?.manageUsers) return res.status(403).json({ message: 'No tienes permiso para gestionar estudiantes.' });
  next();
}

export async function canAccessCourse(user, courseId) {
  const scope = getSchoolContext(user);
  if (!(await models.Course.count({ where: { id: courseId, ...scope } }))) return false;
  // Platform operators and school admins see every course in the tenant.
  if (
    user.platformPermissions?.includes('platform.accounts.read')
    || user.permissions?.manageSchool
    || ['super_admin', 'school_admin', 'director', 'manager', 'monitor', 'utp'].includes(user.role)
  ) {
    return true;
  }
  if (user.role === 'teacher') {
    const [rows] = await sequelize.query(
      `SELECT c.id FROM courses c WHERE c.id = ? AND c.school_id = ? AND ${teacherCourseMatchSql('c')} LIMIT 1`,
      { replacements: [courseId, user.schoolId, ...teacherCourseMatchParams(user)] }
    );
    return Boolean(rows.length);
  }
  if (!['student', 'guardian'].includes(user.role)) return true;
  let studentIds = [];
  if (user.role === 'student') {
    studentIds = (await models.Student.findAll({ where: { schoolId: user.schoolId, userId: user.id }, attributes: ['id'], raw: true })).map((student) => student.id);
  } else {
    const guardian = await models.Guardian.findOne({ where: { schoolId: user.schoolId, userId: user.id }, attributes: ['id'], raw: true });
    if (guardian) studentIds = (await models.StudentGuardian.findAll({ where: { guardianId: guardian.id }, attributes: ['studentId'], raw: true })).map((link) => link.studentId);
  }
  if (!studentIds.length) return false;
  const enrollmentWhere = { schoolId: user.schoolId, courseId, studentId: studentIds };
  if (!(user.readOnly || user.accessMode === 'historical')) {
    enrollmentWhere.status = { [Op.ne]: 'withdrawn' };
  }
  return Boolean(await models.Enrollment.count({ where: enrollmentWhere }));
}

function classScope(course) {
  return { name: course.name, section: course.section, academicYearId: course.academicYearId };
}

function normalizeSidebarColor(value, fallback) {
  const color = String(value || '').trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(color)) return color;
  return fallback;
}

function normalizeSidebarFontSize(value, fallback = 14.7) {
  const size = Number(value);
  if (!Number.isFinite(size)) return fallback;
  const rounded = Math.round(size * 10) / 10;
  if (rounded < 11 || rounded > 22) return fallback;
  return rounded;
}

function schoolSidebarTheme(school) {
  const fontSize = normalizeSidebarFontSize(school?.sidebarFontSize, 14.7);
  return {
    sidebarBgColor: normalizeSidebarColor(school?.sidebarBgColor, '#0E2535'),
    sidebarTextColor: normalizeSidebarColor(school?.sidebarTextColor, '#F3F7FB'),
    sidebarFontSize: fontSize,
    sidebarLineHeight: Math.round(fontSize * (20 / 14) * 10) / 10,
  };
}

async function educationStageImpact(schoolId, nextStagesInput) {
  const nextStages = normalizeEducationStages(nextStagesInput);
  const nextSet = new Set(nextStages);
  const school = await models.School.findByPk(schoolId, { attributes: ['educationStages'] });
  const currentStages = normalizeEducationStages(school?.educationStages);
  const removedStages = currentStages
    .filter((id) => !nextSet.has(id))
    .map((id) => ({ id, name: educationStageLabel(id) }));
  const removedIds = new Set(removedStages.map((row) => row.id));
  if (!removedIds.size) {
    return {
      removedStages: [],
      grades: [],
      gradeCount: 0,
      courseCount: 0,
      blockedGradeCount: 0,
      canRemove: true,
    };
  }
  const courses = await models.Course.findAll({
    where: { schoolId },
    attributes: ['id', 'name', 'section', 'subject', 'academicYearId'],
    raw: true,
  });
  const groups = new Map();
  for (const course of courses) {
    const stageId = stageIdForLevelName(course.name);
    if (!removedIds.has(stageId)) continue;
    const key = `${course.name}\0${course.section}\0${course.academicYearId || ''}`;
    const group = groups.get(key) || {
      name: course.name,
      section: course.section,
      stageId,
      stageName: educationStageLabel(stageId),
      subjectCount: 0,
      courseIds: [],
      hasGrades: false,
    };
    group.subjectCount += 1;
    group.courseIds.push(course.id);
    groups.set(key, group);
  }
  const grades = [...groups.values()].sort((a, b) => (
    a.stageName.localeCompare(b.stageName, 'es')
    || a.name.localeCompare(b.name, 'es')
    || a.section.localeCompare(b.section, 'es')
  ));
  const allCourseIds = grades.flatMap((row) => row.courseIds);
  const gradedCourseIds = allCourseIds.length
    ? new Set((await models.Grade.findAll({
      where: { schoolId, courseId: allCourseIds },
      attributes: ['courseId'],
      raw: true,
    })).map((row) => row.courseId))
    : new Set();
  for (const grade of grades) {
    grade.hasGrades = grade.courseIds.some((id) => gradedCourseIds.has(id));
  }
  const blockedGradeCount = grades.filter((row) => row.hasGrades).length;
  return {
    removedStages,
    grades: grades.map(({ courseIds, ...rest }) => rest),
    gradeCount: grades.length,
    courseCount: allCourseIds.length,
    blockedGradeCount,
    canRemove: blockedGradeCount === 0,
    courseIds: grades.filter((row) => !row.hasGrades).flatMap((row) => row.courseIds),
  };
}

async function destroyCoursesByIds(schoolId, courseIds, transaction) {
  const ids = [...new Set((courseIds || []).map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) return 0;
  if (await models.Grade.count({ where: { schoolId, courseId: ids }, transaction })) {
    throw new ApiError(409, 'COURSES_HAVE_GRADES', 'Hay grados con calificaciones. No se pueden eliminar hasta quitar esas notas.');
  }
  const assignments = await models.Assignment.findAll({ where: { schoolId, courseId: ids }, attributes: ['id'], raw: true, transaction });
  const assignmentIds = assignments.map((item) => item.id);
  const forums = await models.Forum.findAll({ where: { schoolId, courseId: ids }, attributes: ['id'], raw: true, transaction });
  const forumIds = forums.map((item) => item.id);
  const enrollments = await models.Enrollment.findAll({ where: { schoolId, courseId: ids }, attributes: ['id'], raw: true, transaction });
  const enrollmentIds = enrollments.map((item) => item.id);
  const planningUnits = await models.PlanningUnit.findAll({ where: { schoolId, courseId: ids }, attributes: ['id'], raw: true, transaction });
  const planningUnitIds = planningUnits.map((row) => row.id);

  if (assignmentIds.length) {
    await models.Submission.destroy({ where: { schoolId, assignmentId: assignmentIds }, transaction });
  }
  await models.Assignment.destroy({ where: { schoolId, courseId: ids }, transaction });
  if (forumIds.length) {
    await models.ForumPost.destroy({ where: { schoolId, forumId: forumIds }, transaction });
  }
  await models.Forum.destroy({ where: { schoolId, courseId: ids }, transaction });
  await models.TeachingMaterial.destroy({ where: { schoolId, courseId: ids }, transaction });
  if (models.CourseLink) await models.CourseLink.destroy({ where: { schoolId, courseId: ids }, transaction });
  if (enrollmentIds.length && models.SigeEnrollmentMapping) {
    await models.SigeEnrollmentMapping.destroy({ where: { schoolId, enrollmentId: enrollmentIds }, transaction });
  }
  await models.Enrollment.destroy({ where: { schoolId, courseId: ids }, transaction });
  await models.Attendance.destroy({ where: { schoolId, courseId: ids }, transaction });
  await models.ClassSession.destroy({ where: { schoolId, courseId: ids }, transaction });
  await models.Observation.update({ courseId: null }, { where: { schoolId, courseId: ids }, transaction });
  if (models.Communication) {
    await models.Communication.update({ courseId: null }, { where: { schoolId, courseId: ids }, transaction });
  }
  if (planningUnitIds.length && models.PlanningComment) {
    await models.PlanningComment.destroy({ where: { schoolId, unitId: planningUnitIds }, transaction });
  }
  await models.PlanningUnit.destroy({ where: { schoolId, courseId: ids }, transaction });
  await models.CourseSchedule.destroy({ where: { schoolId, courseId: ids }, transaction });
  if (models.SigeCourseMapping) {
    await models.SigeCourseMapping.destroy({ where: { schoolId, courseId: ids }, transaction });
  }
  await models.Course.destroy({ where: { schoolId, id: ids }, transaction });
  return ids.length;
}

function parseNamedSubjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { name: String(item || '').trim(), color: '', sigeSubjectCode: '' };
    }
    const sigeSubjectCode = String(item?.sigeSubjectCode || item?.sige_subject_code || '').trim();
    return {
      name: String(item?.name || item?.subject || '').trim(),
      color: normalizeSubjectColor(item?.color || ''),
      sigeSubjectCode,
    };
  }).filter((item) => item.name);
}

function pickSubjectColor(preferred, usedColors = []) {
  const next = normalizeSubjectColor(preferred);
  const taken = new Set((usedColors || []).map((value) => normalizeSubjectColor(value)).filter(Boolean));
  if (next && !taken.has(next)) return next;
  return nextAvailableSubjectColor(usedColors);
}

async function classModuleIds(schoolId, courseId) {
  const course = await models.Course.findOne({
    where: { id: courseId, schoolId },
    attributes: ['id', 'name', 'section', 'academicYearId'],
    raw: true,
  });
  if (!course) return [];
  const modules = await models.Course.findAll({
    where: { schoolId, ...classScope(course) },
    attributes: ['id'],
    raw: true,
  });
  return modules.map((row) => row.id);
}

async function enrolledStudentIdsForCourse(schoolId, courseId) {
  const moduleIds = await classModuleIds(schoolId, courseId);
  if (!moduleIds.length) return [];
  const enrollments = await models.Enrollment.findAll({
    where: { schoolId, courseId: moduleIds, status: { [Op.ne]: 'withdrawn' } },
    attributes: ['studentId'],
    raw: true,
  });
  return [...new Set(enrollments.map((row) => row.studentId))];
}

async function linkedLearnerStudentIds(user) {
  if (user.role === 'student') {
    return (await models.Student.findAll({
      where: { schoolId: user.schoolId, userId: user.id, active: true },
      attributes: ['id'],
      raw: true,
    })).map((row) => Number(row.id)).filter((id) => id > 0);
  }
  if (user.role === 'guardian') {
    const guardian = await models.Guardian.findOne({
      where: { schoolId: user.schoolId, userId: user.id },
      attributes: ['id'],
      raw: true,
    });
    if (!guardian) return [];
    return (await models.StudentGuardian.findAll({
      where: { guardianId: guardian.id },
      attributes: ['studentId'],
      raw: true,
    })).map((row) => Number(row.studentId || row.student_id)).filter((id) => id > 0);
  }
  return [];
}

function daysAgoIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function registerAcademicRoutes(app) {
  app.get('/api/attendance/me', async (req, res) => {
    if (!['student', 'guardian'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Esta vista es solo para estudiantes y apoderados.' });
    }
    const linkedIds = await linkedLearnerStudentIds(req.user);
    if (!linkedIds.length) {
      return res.json({
        students: [],
        selectedStudentId: null,
        from: daysAgoIso(90),
        to: new Date().toISOString().slice(0, 10),
        records: [],
        summary: { total: 0, present: 0, late: 0, absent: 0, percentage: null },
      });
    }
    let selectedStudentId = Number(req.query.studentId || 0);
    if (req.user.role === 'student' || !linkedIds.includes(selectedStudentId)) {
      selectedStudentId = linkedIds[0];
    }
    const to = isValidDate(String(req.query.to || '')) ? String(req.query.to) : new Date().toISOString().slice(0, 10);
    const from = isValidDate(String(req.query.from || '')) ? String(req.query.from) : daysAgoIso(90);
    if (from > to) throw new ApiError(400, 'VALIDATION_ERROR', 'El rango de fechas no es válido.');
    const students = await models.Student.findAll({
      where: { schoolId: req.user.schoolId, id: linkedIds, active: true },
      attributes: ['id', 'firstName', 'lastName'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      raw: true,
    });
    const [records] = await sequelize.query(`
      SELECT
        a.id,
        a.student_id AS studentId,
        a.course_id AS courseId,
        a.attended_on AS attendedOn,
        a.status,
        a.arrival_time AS arrivalTime,
        a.late_minutes AS lateMinutes,
        a.late_justification AS lateJustification,
        a.late_observation AS lateObservation,
        c.name AS courseName,
        c.section,
        c.subject
      FROM attendance a
      JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
      WHERE a.school_id = ?
        AND a.student_id = ?
        AND a.attended_on BETWEEN ? AND ?
      ORDER BY a.attended_on DESC, c.subject ASC, a.id DESC
      LIMIT 500
    `, { replacements: [req.user.schoolId, selectedStudentId, from, to] });
    const present = records.filter((row) => row.status === 'present').length;
    const late = records.filter((row) => row.status === 'late').length;
    const absent = records.filter((row) => row.status === 'absent').length;
    const total = records.length;
    const attended = present + late;
    res.json({
      students: students.map((row) => ({
        id: row.id,
        firstName: row.firstName || row.first_name,
        lastName: row.lastName || row.last_name,
        fullName: `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`.trim(),
      })),
      selectedStudentId,
      from,
      to,
      records: records.map((row) => ({
        id: row.id,
        studentId: row.studentId || row.studentid,
        courseId: row.courseId || row.courseid,
        attendedOn: row.attendedOn || row.attendedon,
        status: row.status,
        arrivalTime: row.arrivalTime || row.arrivaltime || null,
        lateMinutes: row.lateMinutes ?? row.lateminutes ?? null,
        lateJustification: row.lateJustification || row.latejustification || null,
        lateObservation: row.lateObservation || row.lateobservation || null,
        courseLabel: `${row.subject || ''} · ${row.courseName || row.coursename || ''} ${row.section || ''}`.trim(),
      })),
      summary: {
        total,
        present,
        late,
        absent,
        percentage: total ? Math.round((attended / total) * 1000) / 10 : null,
      },
    });
  });
  app.get('/api/courses/:id/attendance', async (req, res) => {
    const courseId = Number(req.params.id), attendedOn = String(req.query.date || '');
    if (!isValidDate(attendedOn) || !await canAccessCourse(req.user, courseId)) throw new ApiError(404, 'NOT_FOUND', 'Curso o fecha no disponibles.');
    let studentIds = await enrolledStudentIdsForCourse(req.user.schoolId, courseId);
    if (['student', 'guardian'].includes(req.user.role)) {
      const linked = new Set(await linkedLearnerStudentIds(req.user));
      studentIds = studentIds.filter((id) => linked.has(id));
    }
    const [students, attendance] = await Promise.all([
      studentIds.length
        ? models.Student.findAll({ where: { schoolId: req.user.schoolId, id: studentIds, active: true }, attributes: ['id', 'firstName', 'lastName'], order: [['lastName', 'ASC'], ['firstName', 'ASC']], raw: true })
        : Promise.resolve([]),
      studentIds.length
        ? models.Attendance.findAll({ where: { schoolId: req.user.schoolId, courseId, attendedOn, studentId: studentIds }, raw: true })
        : Promise.resolve([]),
    ]);
    res.json(students.map(student => ({ ...student, attendance: attendance.find(row => row.studentId === student.id) || null })));
  });
  app.put('/api/courses/:id/attendance', async (req, res) => {
    const courseId = Number(req.params.id), attendedOn = String(req.body.date || '');
    const canTakeAttendance = Boolean(
      req.user.permissions?.manageGrades
      || req.user.permissions?.manageSchool
      || req.user.role === 'teacher',
    );
    if (!canTakeAttendance || !isValidDate(attendedOn) || !await canAccessCourse(req.user, courseId)) {
      throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para registrar asistencia en este curso.');
    }
    if (!Array.isArray(req.body.records) || req.body.records.length > 500) throw new ApiError(400, 'VALIDATION_ERROR', 'Envía una lista válida de asistencia.');
    const enrolled = new Set(await enrolledStudentIdsForCourse(req.user.schoolId, courseId));
    const records = req.body.records.map(record => {
      const studentId = Number(record.studentId), status = String(record.status || '');
      if (!enrolled.has(studentId) || !['present', 'absent', 'late'].includes(status)) throw new ApiError(400, 'VALIDATION_ERROR', 'La asistencia contiene un estudiante o estado inválido.');
      let lateMinutes = null;
      let arrivalTime = null;
      if (status === 'late') {
        const parsedMinutes = Number(record.lateMinutes);
        lateMinutes = Number.isSafeInteger(parsedMinutes) && parsedMinutes >= 1 && parsedMinutes <= 720 ? parsedMinutes : 5;
        const rawArrival = String(record.arrivalTime || '').trim();
        if (rawArrival) {
          if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(rawArrival)) throw new ApiError(400, 'VALIDATION_ERROR', 'La hora de llegada no es válida.');
          arrivalTime = rawArrival.length === 5 ? `${rawArrival}:00` : rawArrival;
        }
      }
      return {
        schoolId: req.user.schoolId, createdBy: req.user.id, studentId, courseId, attendedOn, status,
        arrivalTime, lateMinutes,
        lateReason: ['late', 'absent'].includes(status) ? String(record.lateReason || '').trim().slice(0, 500) || null : null,
        lateJustification: ['late', 'absent'].includes(status) ? String(record.lateJustification || '').trim().slice(0, 1000) || null : null,
        lateObservation: ['late', 'absent'].includes(status) ? String(record.lateObservation || '').trim().slice(0, 1000) || null : null,
      };
    });
    await sequelize.transaction(async transaction => {
      for (const record of records) {
        await models.Attendance.upsert(record, { transaction });
      }
      await models.AuditLog.create({ schoolId: req.user.schoolId, createdBy: req.user.id, entity: 'course', entityId: courseId, action: 'attendance_updated', payload: { date: attendedOn, records: records.length, late: records.filter(row => row.status === 'late').length } }, { transaction });
    });
    res.json({ saved: records.length, late: records.filter(row => row.status === 'late').length });
  });
  app.get('/api/documents', async (req, res) => {
    const filters = {};
    for (const key of ['studentId', 'employeeId', 'userId']) {
      if (req.query[key]) {
        const id = Number(req.query[key]);
        if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Persona inválida.' });
        filters[key] = id;
      }
    }
    let ownerFilter = filters;
    if (filters.userId && Object.keys(filters).length === 1) {
      const userStudents = await models.Student.findAll({ where: { schoolId: req.user.schoolId, userId: filters.userId }, attributes: ['id'], raw: true });
      const userEmployees = await models.Employee.findAll({ where: { schoolId: req.user.schoolId, userId: filters.userId }, attributes: ['id'], raw: true });
      ownerFilter = { [Op.or]: [filters, { studentId: userStudents.map(s => s.id) }, { employeeId: userEmployees.map(e => e.id) }] };
    }
    res.json(await models.Document.findAll({ where: { [Op.and]: [await documentScope(req.user), ownerFilter] }, order: [['id', 'DESC']] }));
  });
  const avatarUpload = createUpload({ kind: 'avatar' });
  app.post('/api/students/:id/avatar', canManagePeople, avatarUpload.single('file'), async (req, res) => {
    const student = await models.Student.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    const data = req.file?.buffer;
    const png = data?.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpg = data?.[0] === 255 && data?.[1] === 216 && data?.[2] === 255;
    if (!png && !jpg) return res.status(400).json({ message: 'Selecciona una imagen JPG o PNG de hasta 5 MB.' });
    const key = tenantUploadKey(req.user.schoolId, `avatar-${crypto.randomUUID()}.${png ? 'png' : 'jpg'}`);
    const oldKey = student.avatarKey;
    student.avatarKey = key;
    await persistUpload(key, data, () => student.save());
    if (oldKey) await fs.unlink(safeUploadPath(oldKey)).catch(() => {});
    await clearDashboardCache();
    res.json({ saved: true, avatarKey: key });
  });
  app.delete('/api/students/:id/avatar', canManagePeople, async (req, res) => {
    const student = await models.Student.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    const oldKey = student.avatarKey;
    if (!oldKey) return res.json({ removed: false });
    student.avatarKey = null;
    await student.save();
    await fs.unlink(safeUploadPath(oldKey)).catch(() => {});
    await clearDashboardCache();
    res.json({ removed: true });
  });
  app.get('/api/students/:id/avatar', async (req, res) => {
    const student = await models.Student.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!student?.avatarKey) return res.status(404).end();
    const courses = await models.Enrollment.findAll({ where: { schoolId: req.user.schoolId, studentId: student.id }, attributes: ['courseId'], raw: true });
    if (req.user.role === 'teacher' && !(await Promise.all(courses.map(c => canAccessCourse(req.user, c.courseId)))).some(Boolean)) return res.status(403).end();
    if (req.user.role === 'student' && student.userId !== req.user.id) return res.status(403).end();
    if (req.user.role === 'guardian') {
      const guardian = await models.Guardian.findOne({ where: { schoolId: req.user.schoolId, userId: req.user.id } });
      if (!guardian || !(await models.StudentGuardian.count({ where: { studentId: student.id, guardianId: guardian.id } }))) return res.status(403).end();
    }
    if (['finance', 'agente_finanzas'].includes(req.user.role)) return res.status(403).end();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.sendFile(safeUploadPath(student.avatarKey));
  });
  app.get('/api/school', async (req, res) => {
    const school = await models.School.findByPk(req.user.schoolId, {
      attributes: ['id', 'name', 'slug', 'rbd', 'address', 'city', 'phone', 'email', 'website', 'schoolType', 'monthlyFee', 'originBank', 'originAccountType', 'originAccountNumberEncrypted', 'companyRut', 'companyName', 'logoKey', 'showLogoInSidebar', 'sidebarCollapsible', 'sidebarPanelCollapsible', 'sidebarBgColor', 'sidebarTextColor', 'sidebarFontSize', 'educationStages'],
    });
    if (!school) return res.status(404).json({ message: 'Colegio no encontrado.' });
    const { publicSchoolBank } = await import('./services/payroll-banking.js');
    const json = school.toJSON();
    delete json.originAccountNumberEncrypted;
    delete json.logoKey;
    res.json({
      ...json,
      ...schoolSidebarTheme(school),
      educationStages: normalizeEducationStages(school.educationStages),
      educationStageOptions: EDUCATION_STAGES,
      hasLogo: Boolean(school.logoKey),
      showLogoInSidebar: school.showLogoInSidebar !== false,
      sidebarCollapsible: school.sidebarCollapsible !== false,
      sidebarPanelCollapsible: school.sidebarPanelCollapsible !== false,
      banking: publicSchoolBank(school),
    });
  });

  app.get('/api/school/info/export.pdf', async (req, res) => {
    if (!req.user.permissions?.manageSchool && !['director', 'school_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para exportar la información del colegio.' });
    }
    const { SCHOOL_INFO_PACKS, schoolInfoFilename, streamSchoolInfoPdf } = await import('./services/school-info-pdf.js');
    const { publicSchoolBank, publicEmployeeBank } = await import('./services/payroll-banking.js');
    const { signatureSlotsForExport } = await import('./services/pdf-signature.js');
    const pack = String(req.query.pack || 'full').trim();
    if (!SCHOOL_INFO_PACKS.includes(pack)) {
      return res.status(400).json({ message: 'Tipo de informe inválido.' });
    }
    const schoolId = req.user.schoolId;
    const [school, employeesRaw, teachers, accounts, jobTitles, courses, allCoursesForStages, studentCount] = await Promise.all([
      models.School.findByPk(schoolId, {
        attributes: ['id', 'name', 'slug', 'rbd', 'address', 'city', 'phone', 'email', 'website', 'schoolType', 'originBank', 'originAccountType', 'originAccountNumberEncrypted', 'companyRut', 'companyName', 'educationStages'],
      }),
      models.Employee.findAll({
        where: { schoolId, active: true },
        attributes: ['fullName', 'position', 'contractType', 'hiredOn', 'bank', 'accountType', 'accountNumberEncrypted', 'holderRut', 'email', 'paymentMethod'],
        order: [['fullName', 'ASC'], ['id', 'ASC']],
      }),
      models.User.findAll({
        where: { schoolId, role: 'teacher', active: true },
        attributes: ['fullName', 'username', 'phone', 'active', 'teamActive'],
        order: [['fullName', 'ASC'], ['id', 'ASC']],
        raw: true,
      }),
      models.User.findAll({
        where: {
          schoolId,
          active: true,
          role: { [Op.notIn]: ['student', 'guardian'] },
        },
        attributes: ['fullName', 'username', 'role', 'active', 'teamActive'],
        order: [['role', 'ASC'], ['fullName', 'ASC'], ['id', 'ASC']],
        raw: true,
      }),
      models.JobTitle.findAll({
        where: { schoolId, active: true },
        attributes: ['id', 'name', 'hierarchy'],
        order: [['hierarchy', 'ASC'], ['name', 'ASC'], ['id', 'ASC']],
        raw: true,
      }),
      models.Course.findAll({
        where: { schoolId },
        attributes: ['name', 'section', 'subject', 'teacher', 'headTeacher'],
        order: [['name', 'ASC'], ['section', 'ASC'], ['subject', 'ASC'], ['id', 'ASC']],
        raw: true,
      }),
      models.Course.findAll({
        where: { schoolId },
        attributes: ['id', 'name', 'section', 'academicYearId'],
        raw: true,
      }),
      models.Student.count({ where: { schoolId, active: true } }).catch(() => 0),
    ]);
    if (!school) return res.status(404).json({ message: 'Colegio no encontrado.' });
    const enabledStages = new Set(normalizeEducationStages(school.educationStages));
    const byStage = Object.fromEntries(EDUCATION_STAGES.map((stage) => [stage.id, { id: stage.id, name: stage.name, gradeKeys: new Set(), courseCount: 0 }]));
    for (const course of allCoursesForStages) {
      const stageId = stageIdForLevelName(course.name);
      if (!byStage[stageId]) continue;
      byStage[stageId].courseCount += 1;
      byStage[stageId].gradeKeys.add(`${course.name}\0${course.section}\0${course.academicYearId || ''}`);
    }
    const stages = EDUCATION_STAGES.map((stage) => ({
      id: stage.id,
      name: stage.name,
      enabled: enabledStages.has(stage.id),
      courseCount: byStage[stage.id]?.courseCount || 0,
      gradeCount: byStage[stage.id]?.gradeKeys.size || 0,
    }));
    const employeeCountByTitle = {};
    for (const employee of employeesRaw) {
      const key = employee.position || '';
      employeeCountByTitle[key] = (employeeCountByTitle[key] || 0) + 1;
    }
    const employees = employeesRaw.map((row) => {
      const bank = publicEmployeeBank(row);
      return {
        fullName: row.fullName,
        position: row.position,
        contractType: row.contractType,
        hiredOn: row.hiredOn,
        bank: bank.bank,
        accountNumberMasked: bank.accountNumberMasked,
      };
    });
    const banking = publicSchoolBank(school);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${schoolInfoFilename(school.name, pack)}"`);
    const signatureLabels = pack === 'banking'
      ? ['Director/a del establecimiento', 'Sostenedor/a o representante']
      : ['Director/a del establecimiento', 'Secretaría / Administración', 'Sostenedor/a o representante'];
    streamSchoolInfoPdf(res, {
      pack,
      school: school.toJSON(),
      banking,
      stages,
      employees,
      teachers,
      accounts,
      jobTitles: jobTitles.map((title) => ({
        ...title,
        employeeCount: employeeCountByTitle[title.name] || 0,
      })),
      courses,
      counts: {
        employees: employees.length,
        teachers: teachers.length,
        accounts: accounts.length,
        courses: courses.length,
        students: studentCount,
      },
      generatedBy: req.user.fullName || req.user.username,
      signatureSlots: signatureSlotsForExport(req.user, signatureLabels),
    });
  });

  app.get('/api/school/education-stages/summary', async (req, res) => {
    if (!req.user.permissions?.manageSchool && !['director', 'utp'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para consultar los niveles del colegio.' });
    }
    const courses = await models.Course.findAll({
      where: { schoolId: req.user.schoolId },
      attributes: ['id', 'name', 'section', 'academicYearId'],
      raw: true,
    });
    const byStage = Object.fromEntries(EDUCATION_STAGES.map((stage) => [stage.id, { id: stage.id, name: stage.name, gradeKeys: new Set(), courseCount: 0 }]));
    for (const course of courses) {
      const stageId = stageIdForLevelName(course.name);
      if (!byStage[stageId]) continue;
      byStage[stageId].courseCount += 1;
      byStage[stageId].gradeKeys.add(`${course.name}\0${course.section}\0${course.academicYearId || ''}`);
    }
    res.json({
      stages: EDUCATION_STAGES.map((stage) => ({
        id: stage.id,
        name: stage.name,
        gradeCount: byStage[stage.id].gradeKeys.size,
        courseCount: byStage[stage.id].courseCount,
      })),
    });
  });

  app.post('/api/school/education-stages/impact', async (req, res) => {
    if (!req.user.permissions?.manageSchool && !['director', 'utp'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para configurar los niveles del colegio.' });
    }
    const impact = await educationStageImpact(req.user.schoolId, req.body?.educationStages);
    const { courseIds, ...publicImpact } = impact;
    res.json(publicImpact);
  });

  const schoolLogoUpload = createUpload({ kind: 'avatar' });
  app.get('/api/school/logo', async (req, res) => {
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['logoKey'] });
    if (!school?.logoKey) return res.status(404).json({ message: 'Este colegio aún no tiene logo.' });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.sendFile(safeUploadPath(school.logoKey));
  });
  app.post('/api/school/logo', (req, res, next) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({ message: 'No tienes permiso para configurar el colegio.' });
    next();
  }, schoolLogoUpload.single('file'), async (req, res) => {
    const school = await models.School.findByPk(req.user.schoolId);
    if (!school) return res.status(404).json({ message: 'Colegio no encontrado.' });
    const data = req.file?.buffer;
    const png = data?.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpg = data?.[0] === 255 && data?.[1] === 216 && data?.[2] === 255;
    if (!png && !jpg) return res.status(400).json({ message: 'Selecciona una imagen JPG o PNG de hasta 5 MB.' });
    const key = tenantUploadKey(req.user.schoolId, `logo-${crypto.randomUUID()}.${png ? 'png' : 'jpg'}`);
    const oldKey = school.logoKey;
    school.logoKey = key;
    if (school.showLogoInSidebar == null) school.showLogoInSidebar = true;
    await persistUpload(key, data, () => school.save());
    if (oldKey) await fs.unlink(safeUploadPath(oldKey)).catch(() => {});
    res.json({ saved: true, hasLogo: true, showLogoInSidebar: school.showLogoInSidebar !== false });
  });
  app.delete('/api/school/logo', async (req, res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({ message: 'No tienes permiso para configurar el colegio.' });
    const school = await models.School.findByPk(req.user.schoolId);
    if (!school) return res.status(404).json({ message: 'Colegio no encontrado.' });
    const oldKey = school.logoKey;
    school.logoKey = null;
    await school.save();
    if (oldKey) await fs.unlink(safeUploadPath(oldKey)).catch(() => {});
    res.json({ saved: true, hasLogo: false, showLogoInSidebar: school.showLogoInSidebar !== false });
  });

  app.put('/api/school', async (req, res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({ message: 'No tienes permiso para configurar el colegio.' });
    const name = String(req.body.name || '').trim();
    const address = String(req.body.address || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const website = String(req.body.website || '').trim();
    const schoolType = String(req.body.schoolType || 'subvencionado').trim();
    const rbdRaw = Object.prototype.hasOwnProperty.call(req.body, 'rbd')
      ? String(req.body.rbd || '').trim().toUpperCase()
      : undefined;
    const cityRaw = Object.prototype.hasOwnProperty.call(req.body, 'city')
      ? String(req.body.city || '').trim()
      : undefined;
    if (name.length < 3 || name.length > 150) return res.status(400).json({ message: 'Ingresa un nombre de colegio válido.' });
    if (address.length > 255 || phone.length > 40 || email.length > 150 || website.length > 255) return res.status(400).json({ message: 'Revisa la extensión de los datos institucionales.' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Ingresa un correo institucional válido.' });
    if (website && !/^https?:\/\/[^\s]+$/i.test(website)) return res.status(400).json({ message: 'El sitio web debe comenzar con http:// o https://.' });
    if (!['subvencionado', 'particular', 'publico'].includes(schoolType)) return res.status(400).json({ message: 'Selecciona un tipo de colegio válido.' });
    if (rbdRaw !== undefined && rbdRaw && !/^\d{1,8}(?:-[0-9K])?$/i.test(rbdRaw)) {
      return res.status(400).json({ message: 'Ingresa un Rol Base de Datos MINEDUC (RBD) válido. Ej. 12345-6.' });
    }
    let normalizedCity;
    if (cityRaw !== undefined) {
      const { isChileCity, normalizeChileCity } = await import('./data/chile-cities.js');
      if (cityRaw && !isChileCity(cityRaw)) {
        return res.status(400).json({ message: 'Selecciona una ciudad válida de Chile.' });
      }
      normalizedCity = normalizeChileCity(cityRaw);
    }
    const school = await models.School.findByPk(req.user.schoolId);
    if (!school) return res.status(404).json({ message: 'Colegio no encontrado.' });
    if (rbdRaw !== undefined && rbdRaw) {
      const duplicate = await models.School.findOne({
        where: { rbd: rbdRaw, id: { [Op.ne]: req.user.schoolId } },
        attributes: ['id'],
      });
      if (duplicate) return res.status(409).json({ message: 'Ese RBD ya está registrado en otro colegio.' });
    }
    const { normalizeSchoolBankInput, publicSchoolBank } = await import('./services/payroll-banking.js');
    const hasBankingPayload = Object.prototype.hasOwnProperty.call(req.body, 'banking')
      || Object.prototype.hasOwnProperty.call(req.body, 'originBank')
      || Object.prototype.hasOwnProperty.call(req.body, 'originAccountType')
      || Object.prototype.hasOwnProperty.call(req.body, 'companyRut')
      || Object.prototype.hasOwnProperty.call(req.body, 'companyName')
      || Object.prototype.hasOwnProperty.call(req.body, 'originAccountNumber');
    const banking = hasBankingPayload ? normalizeSchoolBankInput(req.body.banking || req.body) : {};
    Object.assign(school, {
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      schoolType,
      ...banking,
    });
    if (rbdRaw !== undefined) {
      school.rbd = rbdRaw || null;
    }
    if (cityRaw !== undefined) {
      school.city = normalizedCity;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'showLogoInSidebar')) {
      school.showLogoInSidebar = Boolean(req.body.showLogoInSidebar);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'sidebarCollapsible')) {
      school.sidebarCollapsible = Boolean(req.body.sidebarCollapsible);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'sidebarPanelCollapsible')) {
      school.sidebarPanelCollapsible = Boolean(req.body.sidebarPanelCollapsible);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'sidebarBgColor')) {
      const bg = normalizeSidebarColor(req.body.sidebarBgColor, '');
      if (!bg) return res.status(400).json({ message: 'Selecciona un color de fondo válido para el sidepanel.' });
      school.sidebarBgColor = bg;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'sidebarTextColor')) {
      const fg = normalizeSidebarColor(req.body.sidebarTextColor, '');
      if (!fg) return res.status(400).json({ message: 'Selecciona un color de texto válido para el sidepanel.' });
      school.sidebarTextColor = fg;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'sidebarFontSize')) {
      const size = Number(req.body.sidebarFontSize);
      if (!Number.isFinite(size) || size < 11 || size > 22) {
        return res.status(400).json({ message: 'El tamaño de fuente del sidepanel debe estar entre 11 y 22 px.' });
      }
      school.sidebarFontSize = normalizeSidebarFontSize(size, 14.7);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'educationStages')) {
      const stages = normalizeEducationStages(req.body.educationStages);
      if (!stages.length) return res.status(400).json({ message: 'Selecciona al menos un nivel educativo.' });
      const removeAssociatedCourses = Boolean(req.body.removeAssociatedCourses);
      const impact = await educationStageImpact(req.user.schoolId, stages);
      if (impact.removedStages.length && removeAssociatedCourses) {
        if (!impact.canRemove) {
          return res.status(409).json({
            message: `No se pueden quitar ${impact.removedStages.map((row) => row.name).join(', ')}: ${impact.blockedGradeCount} grado${impact.blockedGradeCount === 1 ? '' : 's'} tienen calificaciones.`,
            impact: { ...impact, courseIds: undefined },
          });
        }
        await sequelize.transaction(async (transaction) => {
          await destroyCoursesByIds(req.user.schoolId, impact.courseIds, transaction);
          school.educationStages = stages;
          await school.save({ transaction });
        });
        await clearDashboardCache();
      } else if (impact.removedStages.length && impact.gradeCount > 0 && !removeAssociatedCourses) {
        return res.status(409).json({
          message: `Hay ${impact.gradeCount} grado${impact.gradeCount === 1 ? '' : 's'} asociados a ${impact.removedStages.map((row) => row.name).join(', ')}. Confirma la eliminación para continuar.`,
          impact: { ...impact, courseIds: undefined },
        });
      } else {
        school.educationStages = stages;
      }
    }
    await school.save();
    await clearDashboardCache();
    if (rbdRaw !== undefined && models.SigeIntegration) {
      const integration = await models.SigeIntegration.findOne({ where: { schoolId: req.user.schoolId } });
      if (integration && rbdRaw) await integration.update({ rbd: rbdRaw });
    }
    const json = school.toJSON();
    delete json.originAccountNumberEncrypted;
    delete json.logoKey;
    res.json({
      school: {
        ...json,
        ...schoolSidebarTheme(school),
        educationStages: normalizeEducationStages(school.educationStages),
        educationStageOptions: EDUCATION_STAGES,
        hasLogo: Boolean(school.logoKey),
        showLogoInSidebar: school.showLogoInSidebar !== false,
        sidebarCollapsible: school.sidebarCollapsible !== false,
        sidebarPanelCollapsible: school.sidebarPanelCollapsible !== false,
        banking: publicSchoolBank(school),
      },
    });
  });

  app.get('/api/job-titles', async (req, res) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !req.user.permissions?.manageUsers && !['director', 'manager', 'monitor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para consultar cargos.' });
    }
    let titles = await models.JobTitle.findAll({
      where: { schoolId: req.user.schoolId, active: true },
      order: [
        [sequelize.literal('hierarchy IS NULL'), 'ASC'],
        ['hierarchy', 'ASC'],
        ['name', 'ASC'],
      ],
    });
    if (!titles.length) {
      await ensureDefaultJobTitles(models.JobTitle, req.user.schoolId, req.user.id);
      titles = await models.JobTitle.findAll({
        where: { schoolId: req.user.schoolId, active: true },
        order: [
          [sequelize.literal('hierarchy IS NULL'), 'ASC'],
          ['hierarchy', 'ASC'],
          ['name', 'ASC'],
        ],
      });
    } else if (titles.some((title) => title.hierarchy == null)) {
      await backfillDefaultJobTitleHierarchies(models.JobTitle, req.user.schoolId);
      titles = await models.JobTitle.findAll({
        where: { schoolId: req.user.schoolId, active: true },
        order: [
          [sequelize.literal('hierarchy IS NULL'), 'ASC'],
          ['hierarchy', 'ASC'],
          ['name', 'ASC'],
        ],
      });
    }
    const names = titles.map((title) => title.name);
    const employees = names.length
      ? await models.Employee.findAll({
        where: { schoolId: req.user.schoolId, active: true, position: { [Op.in]: names } },
        attributes: ['id', 'position'],
        raw: true,
      })
      : [];
    const counts = new Map();
    for (const employee of employees) {
      counts.set(employee.position, (counts.get(employee.position) || 0) + 1);
    }
    res.json(titles.map((title) => ({
      ...title.toJSON(),
      employeeCount: counts.get(title.name) || 0,
    })));
  });

  function parseJobTitleHierarchy(value) {
    if (value == null || value === '') return null;
    const hierarchy = Number(value);
    if (!Number.isInteger(hierarchy) || hierarchy < 1 || hierarchy > 999) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'La jerarquía debe ser un número entero entre 1 y 999, o quedar vacía.');
    }
    return hierarchy;
  }

  async function employeesForJobTitle(schoolId, positionName) {
    return models.Employee.findAll({
      where: { schoolId, active: true, position: positionName },
      attributes: ['id', 'fullName', 'position', 'contractType', 'hiredOn', 'monthlySalary', 'active'],
      order: [['fullName', 'ASC']],
    });
  }

  app.get('/api/job-titles/:id/employees', async (req, res) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !req.user.permissions?.manageUsers && !['director', 'manager', 'monitor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para consultar cargos.' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Cargo inválido.' });
    const jobTitle = await models.JobTitle.findOne({ where: { id, schoolId: req.user.schoolId, active: true } });
    if (!jobTitle) return res.status(404).json({ message: 'Cargo no encontrado.' });
    const employees = await employeesForJobTitle(req.user.schoolId, jobTitle.name);
    res.json({
      jobTitle: { id: jobTitle.id, name: jobTitle.name, hierarchy: jobTitle.hierarchy },
      employees,
      employeeCount: employees.length,
    });
  });

  app.post('/api/job-titles', async (req, res) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !['director', 'school_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para administrar cargos.' });
    }
    const name = String(req.body.name || '').trim();
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Ingresa un cargo válido.' });
    let hierarchy;
    try { hierarchy = parseJobTitleHierarchy(req.body.hierarchy); }
    catch (error) { return res.status(error.status || 400).json({ message: error.message }); }
    try {
      const [jobTitle] = await models.JobTitle.findOrCreate({
        where: { schoolId: req.user.schoolId, name },
        defaults: { active: true, hierarchy, createdBy: req.user.id },
      });
      const updates = {};
      if (!jobTitle.active) updates.active = true;
      if (Object.prototype.hasOwnProperty.call(req.body, 'hierarchy') && jobTitle.hierarchy !== hierarchy) updates.hierarchy = hierarchy;
      if (Object.keys(updates).length) await jobTitle.update(updates);
      const employeeCount = await models.Employee.count({ where: { schoolId: req.user.schoolId, active: true, position: jobTitle.name } });
      res.status(201).json({ ...jobTitle.toJSON(), employeeCount });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Ese cargo ya existe.' });
      throw error;
    }
  });

  app.put('/api/job-titles/:id', async (req, res) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !['director', 'school_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para administrar cargos.' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Cargo inválido.' });
    const jobTitle = await models.JobTitle.findOne({ where: { id, schoolId: req.user.schoolId, active: true } });
    if (!jobTitle) return res.status(404).json({ message: 'Cargo no encontrado.' });
    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      const name = String(req.body.name || '').trim();
      if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Ingresa un cargo válido.' });
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'hierarchy')) {
      try { updates.hierarchy = parseJobTitleHierarchy(req.body.hierarchy); }
      catch (error) { return res.status(error.status || 400).json({ message: error.message }); }
    }
    if (!Object.keys(updates).length) {
      const employeeCount = await models.Employee.count({ where: { schoolId: req.user.schoolId, active: true, position: jobTitle.name } });
      return res.json({ ...jobTitle.toJSON(), employeeCount });
    }
    try {
      const previousName = jobTitle.name;
      await jobTitle.update(updates);
      if (updates.name && updates.name !== previousName) {
        await models.Employee.update(
          { position: updates.name },
          { where: { schoolId: req.user.schoolId, position: previousName } },
        );
      }
      const employeeCount = await models.Employee.count({ where: { schoolId: req.user.schoolId, active: true, position: jobTitle.name } });
      res.json({ ...jobTitle.toJSON(), employeeCount });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Ese cargo ya existe.' });
      throw error;
    }
  });

  app.delete('/api/job-titles/:id', async (req, res) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !['director', 'school_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para administrar cargos.' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Cargo inválido.' });
    const jobTitle = await models.JobTitle.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!jobTitle) return res.status(404).json({ message: 'Cargo no encontrado.' });
    const employees = await employeesForJobTitle(req.user.schoolId, jobTitle.name);
    if (employees.length) {
      return res.status(409).json({
        message: `No se puede desactivar “${jobTitle.name}”: hay ${employees.length} empleado${employees.length === 1 ? '' : 's'} activo${employees.length === 1 ? '' : 's'} con ese cargo. Cámbiales el cargo antes de desactivarlo.`,
        code: 'JOB_TITLE_IN_USE',
        details: {
          jobTitle: { id: jobTitle.id, name: jobTitle.name },
          employeeCount: employees.length,
          employees,
        },
      });
    }
    await jobTitle.update({ active: false });
    res.json({ saved: true });
  });

  app.get('/api/guardians', async (req, res) => {
    const canSendCommunications = !['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role);
    if (!req.user.permissions?.manageUsers && !canSendCommunications) {
      return res.status(403).json({ message: 'No tienes permiso para consultar apoderados.' });
    }
    const q = String(req.query.q || '').trim().toLowerCase();
    const guardians = await models.Guardian.findAll({ where: { schoolId: req.user.schoolId }, order: [['fullName', 'ASC']], raw: true });
    const filtered = q.length < 2 ? guardians.slice(0, 20) : guardians.filter(guardian => `${guardian.fullName} ${guardian.email || ''} ${guardian.nationalId || ''}`.toLowerCase().includes(q)).slice(0, 20);
    res.json(filtered);
  });

  app.get('/api/guardians/directory', canManagePeople, async (req, res) => {
    const schoolId = req.user.schoolId;
    const q = String(req.query.q || '').trim().toLowerCase();
    const guardians = await models.Guardian.findAll({ where: { schoolId }, order: [['fullName', 'ASC']], raw: true });
    const guardianIds = guardians.map((row) => row.id);
    const links = guardianIds.length
      ? await models.StudentGuardian.findAll({ where: { guardianId: { [Op.in]: guardianIds } }, raw: true })
      : [];
    const studentIds = [...new Set(links.map((row) => row.studentId))];
    const students = studentIds.length
      ? await models.Student.findAll({
          where: { schoolId, id: { [Op.in]: studentIds } },
          attributes: ['id', 'firstName', 'lastName', 'email', 'active'],
          raw: true,
        })
      : [];
    const studentById = new Map(students.map((row) => [row.id, row]));
    const studentsByGuardian = new Map();
    for (const link of links) {
      const student = studentById.get(link.studentId);
      if (!student) continue;
      if (!studentsByGuardian.has(link.guardianId)) studentsByGuardian.set(link.guardianId, []);
      studentsByGuardian.get(link.guardianId).push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        active: student.active !== false,
        relationship: link.relationship || 'Apoderado',
      });
    }
    const rows = guardians
      .map((guardian) => {
        const linked = studentsByGuardian.get(guardian.id) || [];
        return {
          id: guardian.id,
          fullName: guardian.fullName,
          email: guardian.email,
          phone: guardian.phone,
          nationalId: guardian.nationalId,
          userId: guardian.userId,
          studentCount: linked.length,
          students: linked.sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'es')),
        };
      })
      .filter((row) => {
        if (!q) return true;
        const haystack = `${row.fullName} ${row.email || ''} ${row.nationalId || ''} ${row.students.map((s) => `${s.firstName} ${s.lastName}`).join(' ')}`.toLowerCase();
        return haystack.includes(q);
      });
    res.json({
      rows,
      summary: {
        total: guardians.length,
        withStudents: guardians.filter((g) => (studentsByGuardian.get(g.id) || []).length > 0).length,
        withoutStudents: guardians.filter((g) => !(studentsByGuardian.get(g.id) || []).length).length,
        links: links.length,
      },
    });
  });

  app.post('/api/guardians', canManagePeople, async (req, res) => {
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim() || null;
    const nationalIdRaw = String(req.body.nationalId || req.body.rut || '').trim();
    let nationalId = null;
    if (nationalIdRaw) {
      if (!isValidRut(nationalIdRaw)) return res.status(400).json({ message: 'Ingresa un RUT válido para el apoderado.' });
      const match = normalizeRut(nationalIdRaw).match(/^(\d{1,9})-?([0-9K])$/);
      nationalId = match ? `${match[1]}-${match[2]}` : normalizeRut(nationalIdRaw);
    }
    if (!fullName || fullName.length > 120 || !email || email.length > 150 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Completa nombre, correo y contraseña del apoderado.' });
    }
    if (phone && phone.length > 40) return res.status(400).json({ message: 'Teléfono inválido.' });
    try {
      const guardian = await sequelize.transaction(async (transaction) => {
        const existingUser = await models.User.findOne({
          where: { schoolId: req.user.schoolId, username: email },
          transaction,
        });
        if (existingUser && existingUser.role !== 'guardian') {
          const err = new Error('ROLE_CLASH');
          err.code = 'ROLE_CLASH';
          throw err;
        }
        const [user] = await models.User.findOrCreate({
          where: { schoolId: req.user.schoolId, username: email },
          defaults: {
            passwordHash: await bcrypt.hash(password, 12),
            fullName,
            role: 'guardian',
            createdBy: req.user.id,
            active: true,
          },
          transaction,
        });
        const [created] = await models.Guardian.findOrCreate({
          where: { schoolId: req.user.schoolId, email },
          defaults: { userId: user.id, fullName, email, phone, nationalId, createdBy: req.user.id },
          transaction,
        });
        const patch = {};
        if (fullName && created.fullName !== fullName) patch.fullName = fullName;
        if (phone && created.phone !== phone) patch.phone = phone;
        if (nationalId && !created.nationalId) patch.nationalId = nationalId;
        if (!created.userId) patch.userId = user.id;
        if (Object.keys(patch).length) await created.update(patch, { transaction });
        return { guardian: created, user };
      });
      let linkedExistingAccount = false;
      try {
        const identity = await linkTenantIdentity({
          email,
          schoolId: req.user.schoolId,
          userId: guardian.user.id,
          role: 'guardian',
          fullName,
          passwordHash: guardian.user.passwordHash,
          phone,
        });
        linkedExistingAccount = Boolean(identity.reusedExisting);
      } catch (error) {
        console.warn('No fue posible vincular identidad global del apoderado:', error.message);
      }
      res.status(201).json({
        guardian: guardian.guardian,
        linkedExistingAccount,
      });
    } catch (error) {
      if (error.code === 'ROLE_CLASH') {
        return res.status(409).json({ message: 'Ese correo ya pertenece a otra cuenta del colegio (no apoderado).' });
      }
      if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Ese correo de apoderado ya está registrado.' });
      throw error;
    }
  });

  app.get('/api/guardians/:id', canManagePeople, async (req, res) => {
    const guardianId = Number(req.params.id);
    if (!Number.isInteger(guardianId) || guardianId < 1) return res.status(400).json({ message: 'Apoderado inválido.' });
    const guardian = await models.Guardian.findOne({
      where: { id: guardianId, schoolId: req.user.schoolId },
      raw: true,
    });
    if (!guardian) return res.status(404).json({ message: 'Apoderado no encontrado.' });
    const links = await models.StudentGuardian.findAll({ where: { guardianId: guardian.id }, raw: true });
    const studentIds = links.map((row) => row.studentId);
    const students = studentIds.length
      ? await models.Student.findAll({
          where: { schoolId: req.user.schoolId, id: { [Op.in]: studentIds } },
          attributes: ['id', 'firstName', 'lastName', 'email', 'active'],
          raw: true,
        })
      : [];
    const studentById = new Map(students.map((row) => [row.id, row]));
    const linked = links
      .map((link) => {
        const student = studentById.get(link.studentId);
        if (!student) return null;
        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          active: student.active !== false,
          relationship: link.relationship || 'Apoderado',
        };
      })
      .filter(Boolean)
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'es'));
    res.json({
      guardian: {
        id: guardian.id,
        fullName: guardian.fullName,
        email: guardian.email,
        phone: guardian.phone,
        nationalId: guardian.nationalId,
        userId: guardian.userId,
        studentCount: linked.length,
        students: linked,
      },
    });
  });

  app.put('/api/guardians/:id', canManagePeople, async (req, res) => {
    const guardianId = Number(req.params.id);
    if (!Number.isInteger(guardianId) || guardianId < 1) return res.status(400).json({ message: 'Apoderado inválido.' });
    const guardian = await models.Guardian.findOne({ where: { id: guardianId, schoolId: req.user.schoolId } });
    if (!guardian) return res.status(404).json({ message: 'Apoderado no encontrado.' });
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim() || null;
    const nationalIdRaw = String(req.body.nationalId || req.body.rut || '').trim();
    let nationalId = null;
    if (nationalIdRaw) {
      if (!isValidRut(nationalIdRaw)) return res.status(400).json({ message: 'Ingresa un RUT válido para el apoderado.' });
      const match = normalizeRut(nationalIdRaw).match(/^(\d{1,9})-?([0-9K])$/);
      nationalId = match ? `${match[1]}-${match[2]}` : normalizeRut(nationalIdRaw);
    }
    if (!fullName || fullName.length > 120 || !email || email.length > 150 || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Completa nombre y correo válidos.' });
    }
    if (phone && phone.length > 40) return res.status(400).json({ message: 'Teléfono inválido.' });
    if (email !== guardian.email) {
      const clash = await models.Guardian.count({ where: { schoolId: req.user.schoolId, email, id: { [Op.ne]: guardian.id } } });
      if (clash) return res.status(409).json({ message: 'Ese correo ya está usado por otro apoderado.' });
    }
    await sequelize.transaction(async (transaction) => {
      await guardian.update({ fullName, email, phone, nationalId }, { transaction });
      if (guardian.userId) {
        await models.User.update(
          { fullName, username: email },
          { where: { id: guardian.userId, schoolId: req.user.schoolId }, transaction },
        );
        const membership = await controlModels.TenantMembership.findOne({
          where: { userId: guardian.userId, schoolId: req.user.schoolId },
          transaction,
        });
        if (membership) {
          const emailTaken = await controlModels.GlobalUser.findOne({
            where: { email, id: { [Op.ne]: membership.globalUserId } },
            transaction,
          });
          if (emailTaken) throw new ApiError(409, 'EMAIL_TAKEN', 'Ese correo ya está usado por otra cuenta global.');
          await controlModels.GlobalUser.update(
            { fullName, email },
            { where: { id: membership.globalUserId }, transaction },
          );
        }
      }
    });
    res.json({ guardian });
  });

  app.post('/api/students/:id/guardians', canManagePeople, async (req, res) => {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId < 1) return res.status(400).json({ message: 'Estudiante inválido.' });
    const student = await models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    const guardianId = Number(req.body.guardianId || 0);
    const relationship = String(req.body.relationship || 'Apoderado').trim() || 'Apoderado';
    if (relationship.length > 60) return res.status(400).json({ message: 'Parentesco inválido.' });
    let guardian = guardianId > 0
      ? await models.Guardian.findOne({ where: { id: guardianId, schoolId: req.user.schoolId } })
      : null;
    if (!guardian) {
      const fullName = String(req.body.fullName || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      const nationalIdRaw = String(req.body.nationalId || req.body.rut || '').trim();
      let nationalId = null;
      if (nationalIdRaw) {
        if (!isValidRut(nationalIdRaw)) return res.status(400).json({ message: 'Ingresa un RUT válido para el apoderado.' });
        const match = normalizeRut(nationalIdRaw).match(/^(\d{1,9})-?([0-9K])$/);
        nationalId = match ? `${match[1]}-${match[2]}` : normalizeRut(nationalIdRaw);
      }
      if (!fullName || fullName.length > 120 || !email || email.length > 150 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6 || password.length > 128) {
        return res.status(400).json({ message: 'Completa nombre, correo y contraseña del apoderado, o selecciona uno existente.' });
      }
      try {
        guardian = await sequelize.transaction(async (transaction) => {
          const existingUser = await models.User.findOne({
            where: { schoolId: req.user.schoolId, username: email },
            transaction,
          });
          if (existingUser && existingUser.role !== 'guardian') {
            const err = new Error('ROLE_CLASH');
            err.code = 'ROLE_CLASH';
            throw err;
          }
          const passwordHash = await bcrypt.hash(password, 12);
          const [user] = await models.User.findOrCreate({
            where: { schoolId: req.user.schoolId, username: email },
            defaults: {
              passwordHash,
              fullName,
              role: 'guardian',
              createdBy: req.user.id,
              active: true,
            },
            transaction,
          });
          const [created] = await models.Guardian.findOrCreate({
            where: { schoolId: req.user.schoolId, email },
            defaults: { userId: user.id, fullName, email, nationalId, createdBy: req.user.id },
            transaction,
          });
          if (nationalId && !created.nationalId) await created.update({ nationalId }, { transaction });
          if (!created.userId) await created.update({ userId: user.id }, { transaction });
          created._user = user;
          created._passwordHash = user.passwordHash || passwordHash;
          return created;
        });
        await linkTenantIdentity({
          email,
          schoolId: req.user.schoolId,
          userId: guardian.userId || guardian._user?.id,
          role: 'guardian',
          fullName,
          passwordHash: guardian._passwordHash || guardian._user?.passwordHash,
        });
      } catch (error) {
        if (error.code === 'ROLE_CLASH') {
          return res.status(409).json({ message: 'Ese correo ya pertenece a otra cuenta del colegio (no apoderado).' });
        }
        if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Ese correo de apoderado ya está registrado.' });
        throw error;
      }
    }
    await models.StudentGuardian.findOrCreate({
      where: { studentId: student.id, guardianId: guardian.id },
      defaults: { relationship },
    });
    if (guardian.userId) {
      const gu = await models.User.findByPk(guardian.userId);
      if (gu) {
        await linkTenantIdentity({
          email: gu.username,
          schoolId: req.user.schoolId,
          userId: gu.id,
          role: 'guardian',
          fullName: gu.fullName,
          passwordHash: gu.passwordHash,
        }).catch((error) => console.warn('No fue posible vincular apoderado existente:', error.message));
      }
    }
    res.status(201).json({ guardian, relationship });
  });

  app.delete('/api/students/:id/guardians/:guardianId', canManagePeople, async (req, res) => {
    const studentId = Number(req.params.id);
    const guardianId = Number(req.params.guardianId);
    if (!Number.isInteger(studentId) || studentId < 1 || !Number.isInteger(guardianId) || guardianId < 1) {
      return res.status(400).json({ message: 'Estudiante o apoderado inválido.' });
    }
    const student = await models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId } });
    const guardian = await models.Guardian.findOne({ where: { id: guardianId, schoolId: req.user.schoolId } });
    if (!student || !guardian) return res.status(404).json({ message: 'Estudiante o apoderado no encontrado.' });
    await models.StudentGuardian.destroy({ where: { studentId, guardianId } });
    res.json({ saved: true });
  });

  app.post('/api/students', canManagePeople, async (req, res) => {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const username = String(req.body.username || req.body.email || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    const generatedStudentPassword = req.body.generateStudentPassword === true;
    const studentPassword = generatedStudentPassword ? crypto.randomBytes(12).toString('base64url') : String(req.body.studentPassword || '');
    const guardianName = String(req.body.guardianName || '').trim();
    const guardianEmail = String(req.body.guardianEmail || '').trim().toLowerCase();
    const guardianPassword = String(req.body.guardianPassword || '');
    const relationship = String(req.body.relationship || 'Apoderado').trim();
    if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80) return res.status(400).json({ message: 'Ingresa un nombre y apellido válidos para el estudiante.' });
    if (!/^[a-z0-9][a-z0-9._@-]{2,149}$/.test(username) || studentPassword.length < 6 || studentPassword.length > 128) {
      return res.status(400).json({ message: 'Ingresa un usuario válido y una contraseña de entre 6 y 128 caracteres.' });
    }
    if (email && (email.length > 150 || !/^\S+@\S+\.\S+$/.test(email))) return res.status(400).json({ message: 'Ingresa un correo válido o deja ese campo vacío.' });
    const hasGuardian = guardianName || guardianEmail || guardianPassword;
    if (hasGuardian && (!guardianName || guardianName.length > 120 || guardianEmail.length > 150 || !/^\S+@\S+\.\S+$/.test(guardianEmail) || guardianPassword.length < 6 || guardianPassword.length > 128 || !relationship || relationship.length > 60)) {
      return res.status(400).json({ message: 'Completa nombre, correo y contraseña del apoderado.' });
    }
    const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
    if (courseIds.length && (new Set(courseIds).size !== courseIds.length || await models.Course.count({ where: { id: courseIds, schoolId: req.user.schoolId } }) !== courseIds.length)) {
      return res.status(400).json({ message: 'Selecciona un curso válido del colegio, o deja la matrícula para después.' });
    }
    let student;
    let linkedStudentIdentity = null;
    let linkedGuardianIdentity = null;
    let studentUserRef = null;
    let guardianUserRef = null;
    try {
      student = await sequelize.transaction(async (transaction) => {
        const studentPasswordHash = await bcrypt.hash(studentPassword, 12);
        const studentUser = await models.User.create({
          schoolId: req.user.schoolId, createdBy: req.user.id, username,
          passwordHash: studentPasswordHash, fullName: `${firstName} ${lastName}`, role: 'student',
        }, { transaction });
        studentUserRef = studentUser;
        const createdStudent = await models.Student.create({
          schoolId: req.user.schoolId, createdBy: req.user.id, userId: studentUser.id, firstName, lastName, email: email || null,
        }, { transaction });
        if (courseIds.length) {
          const selected = await models.Course.findAll({ where: { id: courseIds, schoolId: req.user.schoolId }, transaction });
          const courses = selected.length ? await models.Course.findAll({ where: {
            schoolId: req.user.schoolId, [Op.or]: selected.map(classScope),
          }, transaction }) : [];
          await models.Enrollment.bulkCreate(courses.map((course) => ({ schoolId: req.user.schoolId, studentId: createdStudent.id, courseId: course.id })), { ignoreDuplicates: true, transaction });
        }
        if (hasGuardian) {
          const guardianPasswordHash = await bcrypt.hash(guardianPassword, 12);
          const guardianUser = await models.User.create({
            schoolId: req.user.schoolId, createdBy: req.user.id, username: guardianEmail,
            passwordHash: guardianPasswordHash, fullName: guardianName, role: 'guardian',
          }, { transaction });
          guardianUserRef = guardianUser;
          const guardian = await models.Guardian.create({
            schoolId: req.user.schoolId, createdBy: req.user.id, userId: guardianUser.id, fullName: guardianName, email: guardianEmail,
          }, { transaction });
          await models.StudentGuardian.create({ studentId: createdStudent.id, guardianId: guardian.id, relationship }, { transaction });
        }
        return createdStudent;
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El usuario del estudiante o correo del apoderado ya está registrado en este colegio. Si viene de otro colegio, usa el mismo correo para vincular su acceso.' });
      }
      throw error;
    }
    try {
      linkedStudentIdentity = await linkTenantIdentity({
        email: username,
        schoolId: req.user.schoolId,
        userId: student.userId,
        role: 'student',
        fullName: `${firstName} ${lastName}`,
        passwordHash: studentUserRef?.passwordHash,
      });
      if (hasGuardian && guardianUserRef) {
        linkedGuardianIdentity = await linkTenantIdentity({
          email: guardianEmail,
          schoolId: req.user.schoolId,
          userId: guardianUserRef.id,
          role: 'guardian',
          fullName: guardianName,
          passwordHash: guardianUserRef.passwordHash,
        });
      }
    } catch (error) {
      console.warn('No fue posible vincular identidad global del estudiante/apoderado:', error.message);
    }
    await clearDashboardCache();
    let emailStatus = null;
    if (hasGuardian && !linkedGuardianIdentity?.reusedExisting) {
      const school = await models.School.findByPk(req.user.schoolId, { attributes: ['name'] });
      emailStatus = await queueWelcome(req.user, 'guardianWelcome', {
        email: guardianEmail, guardianName, studentName: `${firstName} ${lastName}`,
        username: guardianEmail, password: guardianPassword,
        schoolName: school?.name || process.env.SCHOOL_NAME || 'IDCE Unknown High School',
      }, student.id).catch(() => ({ sent: false, reason: 'No fue posible programar el correo.' }));
    } else if (hasGuardian && linkedGuardianIdentity?.reusedExisting) {
      emailStatus = { sent: false, reason: 'El apoderado ya tenía acceso en otro colegio; se reutilizó su contraseña actual.' };
    }
    if (generatedStudentPassword && !linkedStudentIdentity?.reusedExisting) res.set('Cache-Control', 'no-store');
    res.status(201).json({
      student,
      guardianEmail: emailStatus,
      linkedExistingAccount: Boolean(linkedStudentIdentity?.reusedExisting),
      guardianLinkedExistingAccount: Boolean(linkedGuardianIdentity?.reusedExisting),
      ...(generatedStudentPassword && !linkedStudentIdentity?.reusedExisting ? { temporaryPassword: studentPassword, username } : {}),
    });
  });

  app.delete('/api/students/:id', canDeactivateStudent, async (req, res) => {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId < 1) return res.status(400).json({ message: 'Estudiante inválido.' });
    const student = await models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    const revokeAccess = Boolean(req.body?.revokeAccess);
    await sequelize.transaction(async (transaction) => {
      await student.update({ active: false }, { transaction });
      // Por defecto el usuario permanece activo (historial). Solo se revoca si se pide explícitamente.
      if (student.userId) {
        await models.User.update(
          { active: !revokeAccess },
          { where: { id: student.userId, schoolId: req.user.schoolId, role: 'student' }, transaction }
        );
      }
      await models.Enrollment.update({ status: 'withdrawn' }, { where: { schoolId: req.user.schoolId, studentId }, transaction });
      await models.AuditLog.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        action: 'deactivate',
        entity: 'student',
        entityId: student.id,
        payload: {
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          email: student.email,
          userId: student.userId,
          revokeAccess,
          historicalAccess: !revokeAccess,
        },
      }, { transaction });
    });
    // Revocar acceso = suspender membresía del colegio (evita conflicto al entrar a otro colegio).
    // Sin revocar, se mantiene membresía activa para historial.
    if (student.userId) {
      await setTenantMembershipAccess({
        userId: student.userId,
        schoolId: req.user.schoolId,
        active: !revokeAccess,
      });
    }
    await clearDashboardCache();
    res.json({ saved: true, revokeAccess });
  });

  app.post('/api/students/:id/restore', canDeactivateStudent, async (req, res) => {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId < 1) return res.status(400).json({ message: 'Estudiante inválido.' });
    const student = await models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    const restoreAccess = req.body?.restoreAccess !== false;
    await sequelize.transaction(async (transaction) => {
      await student.update({ active: true }, { transaction });
      if (restoreAccess && student.userId) {
        await models.User.update(
          { active: true },
          { where: { id: student.userId, schoolId: req.user.schoolId, role: 'student' }, transaction }
        );
      }
      await models.AuditLog.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        action: 'restore',
        entity: 'student',
        entityId: student.id,
        payload: {
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          email: student.email,
          userId: student.userId,
          restoreAccess,
        },
      }, { transaction });
    });
    if (student.userId && restoreAccess) {
      await setTenantMembershipAccess({
        userId: student.userId,
        schoolId: req.user.schoolId,
        active: true,
      });
    }
    await clearDashboardCache();
    res.json({ saved: true, restoreAccess });
  });

  app.put('/api/students/:id/platform-access', canManagePeople, async (req, res) => {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId < 1) return res.status(400).json({ message: 'Estudiante inválido.' });
    const student = await models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId } });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
    if (!student.userId) return res.status(400).json({ message: 'Este estudiante no tiene cuenta de plataforma.' });
    const active = Boolean(req.body?.active);
    await models.User.update(
      { active },
      { where: { id: student.userId, schoolId: req.user.schoolId, role: 'student' } }
    );
    await setTenantMembershipAccess({
      userId: student.userId,
      schoolId: req.user.schoolId,
      active,
    });
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      action: active ? 'restore_access' : 'revoke_access',
      entity: 'student',
      entityId: student.id,
      payload: { userId: student.userId, active },
    });
    res.json({ saved: true, platformAccess: active });
  });

  app.get('/api/subjects', async (req, res) => res.json(await models.Subject.findAll({ where: { schoolId: req.user.schoolId }, order: [['name', 'ASC']] })));
  app.post('/api/subjects', canManageCourseStructure, async (req, res) => {
    const name = String(req.body.name || '').trim();
    const code = String(req.body.code || '').trim() || null;
    const sigeCode = normalizeOptionalSigeSubjectCode(req.body.sigeSubjectCode);
    if (sigeCode === null) return res.status(400).json({ message: 'El código SIGE debe ser numérico (máx. 20 dígitos).' });
    if (!name || name.length > 120) return res.status(400).json({ message: 'Ingresa un nombre de asignatura válido.' });
    if (code && code.length > 40) return res.status(400).json({ message: 'El código de la asignatura es demasiado largo.' });
    const existing = await models.Subject.findOne({ where: { schoolId: req.user.schoolId, name } });
    if (existing) return res.status(409).json({ message: 'Esa asignatura ya existe en el catálogo del colegio.' });
    const subject = await models.Subject.create({
      schoolId: req.user.schoolId,
      ...subjectCreateDefaults({ createdBy: req.user.id, name, code, sigeSubjectCode: sigeCode }),
      name,
    });
    res.status(201).json({ subject });
  });

  app.get('/api/course-templates', async (req, res) => {
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['educationStages'] });
    const stages = normalizeEducationStages(school?.educationStages);
    res.json({
      levels: levelsForEducationStages(stages),
      tracks: COURSE_TRACKS,
      templates: templatesForEducationStages(stages),
      educationStages: stages,
      educationStageOptions: EDUCATION_STAGES,
      sigeSubjectDefaults: DEFAULT_SIGE_SUBJECT_CODES,
    });
  });

  app.post('/api/courses', canManageCourseStructure, async (req, res) => {
    const { name, section, subjectId } = req.body;
    const normalizedSubjectId = Number(subjectId);
    const normalizedName = String(name || '').trim();
    const normalizedSection = String(section || '').trim();
    const requestedTeacher = String(req.body.teacher || '').trim();
    const color = normalizeSubjectColor(req.body.color || '');
    if (req.body.color != null && String(req.body.color).trim() && !color) {
      return res.status(400).json({ message: 'Selecciona un color válido para el curso.' });
    }
    if (!isValidMoney(req.body.monthlyFee ?? 0)) return res.status(400).json({ message: 'La mensualidad del curso debe ser un monto mayor o igual a cero.' });
    const monthlyFee = Number(req.body.monthlyFee ?? 0);
    if (!normalizedName || normalizedName.length > 80 || !normalizedSection || normalizedSection.length > 10) {
      return res.status(400).json({ message: 'Revisa el nombre y la sección del curso.' });
    }
    if (requestedTeacher.length > 120) return res.status(400).json({ message: 'Selecciona un profesor válido.' });
    const subject = Number.isInteger(normalizedSubjectId) && normalizedSubjectId > 0
      ? await models.Subject.findOne({ where: { id: normalizedSubjectId, schoolId: req.user.schoolId } })
      : null;
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['educationStages'] });
    const allowedTemplates = templatesForEducationStages(school?.educationStages);
    const template = allowedTemplates.find(item => item.id === req.body.templateId);
    if (req.body.templateId && !template) return res.status(400).json({ message: 'Selecciona una plantilla válida para los niveles activos del colegio.' });
    const selectedSubjects = template
      ? (Array.isArray(req.body.subjects) ? req.body.subjects.map((item) => String(item || '').trim()).filter(Boolean) : null)
      : null;
    const customSubjects = parseNamedSubjects(req.body.customSubjects);
    if (template && (!Array.isArray(selectedSubjects) || (!selectedSubjects.length && !customSubjects.length) || selectedSubjects.some(name => !template.subjects.includes(name)) || new Set(selectedSubjects).size !== selectedSubjects.length)) {
      return res.status(400).json({ message: template.subjects.length ? 'Selecciona al menos una asignatura de la plantilla, sin duplicados.' : 'Agrega al menos un ramo personalizado.' });
    }
    if (customSubjects.some(item => item.name.length > 100) || new Set(customSubjects.map(item => item.name.toLocaleLowerCase('es'))).size !== customSubjects.length) {
      return res.status(400).json({ message: 'Agrega asignaturas personalizados válidos, sin duplicados.' });
    }
    if (customSubjects.some((item) => normalizeOptionalSigeSubjectCode(item.sigeSubjectCode) === null)) {
      return res.status(400).json({ message: 'El código SIGE debe ser numérico (máx. 20 dígitos).' });
    }
    if (template && customSubjects.some(item => selectedSubjects.some(selected => selected.toLocaleLowerCase('es') === item.name.toLocaleLowerCase('es')))) {
      return res.status(400).json({ message: 'Las asignaturas personalizados no pueden duplicar la plantilla.' });
    }
    if (!template && !subject) return res.status(400).json({ message: 'Selecciona una plantilla o una asignatura del colegio.' });
    if (template && await models.Course.count({ where: { schoolId: req.user.schoolId, name: normalizedName, section: normalizedSection } })) {
      return res.status(409).json({ message: 'Ya existe un curso con ese nombre y sección.' });
    }
    const teacher = requestedTeacher ? await models.User.findOne({
      where: { schoolId: req.user.schoolId, fullName: requestedTeacher, role: 'teacher', active: true },
      attributes: ['fullName'],
    }) : null;
    const academicYear = await models.AcademicYear.findOne({ where: { schoolId: req.user.schoolId, active: true }, order: [['startsOn', 'DESC']] });
    if (requestedTeacher && !teacher) return res.status(400).json({ message: 'Selecciona un profesor activo del colegio.' });
    const createdCourses = await sequelize.transaction(async transaction => {
      const courseSubjects = [];
      if (template) {
        for (const subjectName of selectedSubjects) {
          const [item] = await models.Subject.findOrCreate({
            where: { schoolId: req.user.schoolId, name: subjectName },
            defaults: subjectCreateDefaults({ createdBy: req.user.id, name: subjectName }),
            transaction,
          });
          if (!item.sigeSubjectCode) {
            const suggested = defaultSigeSubjectCode(subjectName);
            if (suggested) await item.update({ sigeSubjectCode: suggested }, { transaction });
          }
          courseSubjects.push({ subject: item, color: '' });
        }
        for (const entry of customSubjects) {
          const [item] = await models.Subject.findOrCreate({
            where: { schoolId: req.user.schoolId, name: entry.name },
            defaults: subjectCreateDefaults({
              createdBy: req.user.id,
              name: entry.name,
              sigeSubjectCode: entry.sigeSubjectCode,
            }),
            transaction,
          });
          const wanted = normalizeOptionalSigeSubjectCode(entry.sigeSubjectCode) || '';
          if (wanted && item.sigeSubjectCode !== wanted) {
            await item.update({ sigeSubjectCode: wanted }, { transaction });
          } else if (!item.sigeSubjectCode) {
            const suggested = defaultSigeSubjectCode(entry.name);
            if (suggested) await item.update({ sigeSubjectCode: suggested }, { transaction });
          }
          courseSubjects.push({ subject: item, color: entry.color });
        }
      } else courseSubjects.push({ subject, color });
      const result = [];
      const usedColors = [];
      for (const entry of courseSubjects) {
        const preferred = entry.color || (!usedColors.length ? color : '');
        const subjectColor = pickSubjectColor(preferred, usedColors);
        usedColors.push(subjectColor);
        const created = await models.Course.create({
          schoolId: req.user.schoolId, createdBy: req.user.id, subjectId: entry.subject.id, academicYearId: academicYear?.id || null,
          name: normalizedName, section: normalizedSection, subject: entry.subject.name,
            teacher: teacher?.fullName || null, headTeacher: teacher?.fullName || null, color: subjectColor, monthlyFee,
        }, { transaction });
        const siblings = await models.Course.findAll({ where: { schoolId: req.user.schoolId, ...classScope(created), id: { [Op.ne]: created.id } }, attributes: ['id'], transaction });
        const members = await models.Enrollment.findAll({ where: { schoolId: req.user.schoolId, courseId: siblings.map(c => c.id), status: { [Op.ne]: 'withdrawn' } }, attributes: ['studentId'], raw: true, transaction });
        await models.Enrollment.bulkCreate([...new Set(members.map(e => e.studentId))].map(studentId => ({ schoolId: req.user.schoolId, studentId, courseId: created.id, status: 'active' })), { ignoreDuplicates: true, transaction });
        result.push(created);
      }
      return result;
    });
    await clearDashboardCache();
    res.status(201).json({ course: createdCourses[0], courses: createdCourses });
  });

  app.post('/api/courses/:id/subjects', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const base = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!base) return res.status(404).json({ message: 'Curso no encontrado.' });
    const school = await models.School.findByPk(req.user.schoolId, { attributes: ['educationStages'] });
    const allowedTemplates = templatesForEducationStages(school?.educationStages);
    const template = allowedTemplates.find(item => item.id === req.body.templateId) || null;
    const selectedSubjects = Array.isArray(req.body.subjects)
      ? req.body.subjects.map((name) => String(name || '').trim()).filter(Boolean)
      : [];
    const customSubjects = parseNamedSubjects(req.body.customSubjects);
    if (!selectedSubjects.length && !customSubjects.length) {
      return res.status(400).json({ message: 'Selecciona o escribe al menos una asignatura para agregar.' });
    }
    if (template && selectedSubjects.some((name) => !template.subjects.includes(name))) {
      return res.status(400).json({ message: 'Hay asignaturas que no pertenecen a la plantilla seleccionada.' });
    }
    if (customSubjects.some((item) => item.name.length > 100) || new Set(customSubjects.map((item) => item.name.toLocaleLowerCase('es'))).size !== customSubjects.length) {
      return res.status(400).json({ message: 'Agrega asignaturas personalizadas válidas, sin duplicados.' });
    }
    if (customSubjects.some((item) => normalizeOptionalSigeSubjectCode(item.sigeSubjectCode) === null)) {
      return res.status(400).json({ message: 'El código SIGE debe ser numérico (máx. 20 dígitos).' });
    }
    const namedEntries = [
      ...selectedSubjects.map((name) => ({ name, color: '', sigeSubjectCode: '' })),
      ...customSubjects,
    ];
    if (new Set(namedEntries.map((item) => item.name.toLocaleLowerCase('es'))).size !== namedEntries.length) {
      return res.status(400).json({ message: 'Hay asignaturas duplicadas en la solicitud.' });
    }
    let createdCourses;
    try {
      createdCourses = await sequelize.transaction(async (transaction) => {
        const siblings = await models.Course.findAll({
          where: { schoolId: req.user.schoolId, ...classScope(base) },
          transaction,
        });
        const existing = new Set(siblings.map((row) => String(row.subject || '').toLocaleLowerCase('es')));
        const toCreate = namedEntries.filter((item) => !existing.has(item.name.toLocaleLowerCase('es')));
        if (!toCreate.length) {
          const error = new Error('Esas asignaturas ya existen en el curso.');
          error.status = 409;
          throw error;
        }
        const members = await models.Enrollment.findAll({
          where: { schoolId: req.user.schoolId, courseId: siblings.map((row) => row.id), status: { [Op.ne]: 'withdrawn' } },
          attributes: ['studentId'],
          raw: true,
          transaction,
        });
        const studentIds = [...new Set(members.map((row) => row.studentId))];
        const usedColors = siblings.map((row) => row.color);
        const result = [];
        for (const entry of toCreate) {
          const wantedCode = normalizeOptionalSigeSubjectCode(entry.sigeSubjectCode) || '';
          const [subject] = await models.Subject.findOrCreate({
            where: { schoolId: req.user.schoolId, name: entry.name },
            defaults: subjectCreateDefaults({
              createdBy: req.user.id,
              name: entry.name,
              sigeSubjectCode: wantedCode,
            }),
            transaction,
          });
          if (wantedCode && subject.sigeSubjectCode !== wantedCode) {
            await subject.update({ sigeSubjectCode: wantedCode }, { transaction });
          } else if (!subject.sigeSubjectCode) {
            const suggested = defaultSigeSubjectCode(entry.name);
            if (suggested) await subject.update({ sigeSubjectCode: suggested }, { transaction });
          }
          const subjectColor = pickSubjectColor(entry.color, usedColors);
          usedColors.push(subjectColor);
          const created = await models.Course.create({
            schoolId: req.user.schoolId,
            createdBy: req.user.id,
            subjectId: subject.id,
            academicYearId: base.academicYearId || null,
            name: base.name,
            section: base.section,
            subject: subject.name,
            teacher: base.teacher || null,
            headTeacher: base.headTeacher || null,
            color: subjectColor,
            monthlyFee: Number(base.monthlyFee || 0),
          }, { transaction });
          if (studentIds.length) {
            await models.Enrollment.bulkCreate(
              studentIds.map((studentId) => ({ schoolId: req.user.schoolId, studentId, courseId: created.id, status: 'active' })),
              { ignoreDuplicates: true, transaction },
            );
          }
          result.push(created);
        }
        return result;
      });
    } catch (error) {
      if (error.status === 409) return res.status(409).json({ message: error.message });
      throw error;
    }
    await clearDashboardCache();
    res.status(201).json({ courses: createdCourses });
  });

  app.put('/api/courses/:id/teacher', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    const requestedNames = readTeacherNames(req.body, { multiKeys: ['teachers'], singleKeys: ['teacher'] });
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Selecciona un curso válido.' });
    }
    if (requestedNames.length > 20) {
      return res.status(400).json({ message: 'Puedes asignar hasta 20 profesores por asignatura.' });
    }
    if (requestedNames.some((name) => name.length > 120)) {
      return res.status(400).json({ message: 'Selecciona profesores válidos.' });
    }
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    let teacherNames = [];
    if (requestedNames.length) {
      const teachers = await models.User.findAll({
        where: { schoolId: req.user.schoolId, fullName: requestedNames, role: 'teacher', active: true },
        attributes: ['fullName'],
      });
      const found = new Map(teachers.map((row) => [String(row.fullName).toLocaleLowerCase('es'), row.fullName]));
      const missing = requestedNames.filter((name) => !found.has(name.toLocaleLowerCase('es')));
      if (missing.length) return res.status(400).json({ message: 'Selecciona profesores activos del colegio.' });
      teacherNames = requestedNames.map((name) => found.get(name.toLocaleLowerCase('es')));
    }
    course.teacher = formatTeacherNames(teacherNames);
    await course.save();
    await clearDashboardCache();
    res.json({
      course,
      teachers: parseTeacherNames(course.teacher),
      teacher: course.teacher,
    });
  });

  app.put('/api/courses/:id/head-teacher', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    const requestedNames = readTeacherNames(req.body, { multiKeys: ['headTeachers', 'teachers'], singleKeys: ['headTeacher', 'teacher'] });
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: 'Selecciona un curso válido.' });
    }
    if (requestedNames.length > 20) {
      return res.status(400).json({ message: 'Puedes asignar hasta 20 profesores jefes por curso.' });
    }
    if (requestedNames.some((name) => name.length > 120)) {
      return res.status(400).json({ message: 'Selecciona profesores jefes válidos.' });
    }
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    let headTeacherNames = [];
    if (requestedNames.length) {
      const teachers = await models.User.findAll({
        where: { schoolId: req.user.schoolId, fullName: requestedNames, role: 'teacher', active: true },
        attributes: ['fullName'],
      });
      const found = new Map(teachers.map((row) => [String(row.fullName).toLocaleLowerCase('es'), row.fullName]));
      const missing = requestedNames.filter((name) => !found.has(name.toLocaleLowerCase('es')));
      if (missing.length) return res.status(400).json({ message: 'Selecciona profesores activos del colegio.' });
      headTeacherNames = requestedNames.map((name) => found.get(name.toLocaleLowerCase('es')));
    }
    const headTeacherName = formatTeacherNames(headTeacherNames);
    await models.Course.update(
      { headTeacher: headTeacherName },
      { where: { schoolId: req.user.schoolId, ...classScope(course) } }
    );
    await clearDashboardCache();
    const siblings = await models.Course.findAll({
      where: { schoolId: req.user.schoolId, ...classScope(course) },
      order: [['subject', 'ASC']],
    });
    res.json({
      headTeacher: headTeacherName,
      headTeachers: parseTeacherNames(headTeacherName),
      courses: siblings,
      course: siblings.find((row) => Number(row.id) === courseId) || course,
    });
  });

  app.put('/api/courses/:id/subject', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    const name = String(req.body.subject || req.body.name || '').trim();
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Asignatura inválida.' });
    if (!name || name.length > 100) return res.status(400).json({ message: 'Ingresa un nombre de asignatura válido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Asignatura no encontrada.' });
    if (name.toLocaleLowerCase('es') === String(course.subject || '').toLocaleLowerCase('es')) {
      return res.json({ course });
    }
    const siblings = await models.Course.findAll({
      where: {
        schoolId: req.user.schoolId,
        ...classScope(course),
        id: { [Op.ne]: course.id },
      },
      attributes: ['id', 'subject'],
    });
    if (siblings.some((row) => String(row.subject || '').toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))) {
      return res.status(409).json({ message: 'Esa asignatura ya existe en este curso.' });
    }
    const updated = await sequelize.transaction(async (transaction) => {
      const [subject] = await models.Subject.findOrCreate({
        where: { schoolId: req.user.schoolId, name },
        defaults: subjectCreateDefaults({ createdBy: req.user.id, name }),
        transaction,
      });
      if (!subject.sigeSubjectCode) {
        const suggested = defaultSigeSubjectCode(name);
        if (suggested) await subject.update({ sigeSubjectCode: suggested }, { transaction });
      }
      await course.update({ subject: subject.name, subjectId: subject.id }, { transaction });
      return course;
    });
    await clearDashboardCache();
    res.json({ course: updated });
  });

  app.put('/api/courses/:id/color', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    const color = normalizeSubjectColor(req.body.color);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Asignatura inválida.' });
    if (!color) {
      return res.status(400).json({ message: 'Selecciona un color válido (#RRGGBB).' });
    }
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Asignatura no encontrada.' });
    if (normalizeSubjectColor(course.color) === color) {
      return res.json({ course, colors: SUBJECT_COLORS });
    }
    const siblings = await models.Course.findAll({
      where: {
        schoolId: req.user.schoolId,
        ...classScope(course),
        id: { [Op.ne]: course.id },
      },
      attributes: ['id', 'subject', 'color'],
    });
    const conflict = siblings.find((row) => normalizeSubjectColor(row.color) === color);
    if (conflict) {
      return res.status(409).json({
        message: `El color ya lo usa “${conflict.subject}”. Elige otro color disponible.`,
        takenBy: conflict.subject,
        colors: SUBJECT_COLORS,
      });
    }
    await course.update({ color });
    await clearDashboardCache();
    res.json({ course, colors: SUBJECT_COLORS });
  });

  app.put('/api/courses/:id/monthly-fee', canManageMonthlyFees, async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1 || !isValidMoney(req.body.monthlyFee ?? 0)) {
      return res.status(400).json({ message: 'La mensualidad del curso debe ser un monto mayor o igual a cero.' });
    }
    const monthlyFee = Number(req.body.monthlyFee ?? 0);
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    await models.Course.update({ monthlyFee }, { where: { schoolId: req.user.schoolId, ...classScope(course) } });
    await clearDashboardCache();
    res.json({ monthlyFee, courseId: course.id, name: course.name, section: course.section });
  });

  app.delete('/api/courses/:id', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    if (await models.Grade.count({ where: { schoolId: req.user.schoolId, courseId } })) {
      return res.status(409).json({ message: 'No se puede eliminar una asignatura con calificaciones registradas.' });
    }
    await sequelize.transaction(async (transaction) => {
      const assignments = await models.Assignment.findAll({ where: { schoolId: req.user.schoolId, courseId }, attributes: ['id'], raw: true, transaction });
      const forums = await models.Forum.findAll({ where: { schoolId: req.user.schoolId, courseId }, attributes: ['id'], raw: true, transaction });
      await models.Submission.destroy({ where: { schoolId: req.user.schoolId, assignmentId: assignments.map(item => item.id) }, transaction });
      await models.Assignment.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await models.ForumPost.destroy({ where: { schoolId: req.user.schoolId, forumId: forums.map(item => item.id) }, transaction });
      await models.Forum.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await models.TeachingMaterial.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      if (models.CourseLink) await models.CourseLink.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await models.Enrollment.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await models.Attendance.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await models.ClassSession.destroy({ where: { schoolId: req.user.schoolId, courseId }, transaction });
      await course.destroy({ transaction });
    });
    await clearDashboardCache();
    res.status(204).end();
  });

  app.delete('/api/courses/:id/class', canManageCourseStructure, async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    const siblings = await models.Course.findAll({
      where: { schoolId: req.user.schoolId, ...classScope(course) },
      attributes: ['id', 'name', 'section', 'subject'],
      raw: true,
    });
    const ids = siblings.map((row) => row.id);
    if (!ids.length) return res.status(404).json({ message: 'Curso no encontrado.' });
    try {
      await sequelize.transaction(async (transaction) => {
        await destroyCoursesByIds(req.user.schoolId, ids, transaction);
      });
    } catch (err) {
      if (err?.status === 409 || err?.code === 'COURSES_HAVE_GRADES') {
        return res.status(409).json({
          message: err.message || 'No se puede eliminar el curso porque tiene calificaciones registradas.',
        });
      }
      throw err;
    }
    await clearDashboardCache();
    res.status(204).end();
  });

  app.post('/api/courses/:id/enrollments', canManagePeople, async (req, res) => {
    const courseId = Number(req.params.id);
    const studentIds = [...new Set(
      (Array.isArray(req.body.studentIds) ? req.body.studentIds : [])
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    )];
    if (!Number.isInteger(courseId) || courseId < 1 || !studentIds.length || studentIds.length > 500) {
      return res.status(400).json({ message: 'Selecciona al menos un estudiante válido.' });
    }
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId }, });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    await ensureCourseLevelModules({
      models,
      sequelize,
      schoolId: req.user.schoolId,
      course,
      createdBy: req.user.id,
    });
    const modules = await models.Course.findAll({ where: { schoolId: req.user.schoolId, ...classScope(course) } });
    const validStudents = await models.Student.findAll({
      where: { id: studentIds, schoolId: req.user.schoolId, active: true },
      attributes: ['id'],
      raw: true,
    });
    if (validStudents.length !== studentIds.length) {
      return res.status(400).json({ message: 'Uno o más estudiantes no pertenecen a este colegio o están inactivos.' });
    }
    let added = 0;
    await sequelize.transaction(async (transaction) => {
      for (const studentId of studentIds) {
        let changed = false;
        for (const module of modules) {
          const [entry, created] = await models.Enrollment.findOrCreate({
            where: { schoolId: req.user.schoolId, courseId: module.id, studentId },
            defaults: { status: 'active' }, transaction,
          });
          if (created) changed = true;
          if (entry.status === 'withdrawn') { await entry.update({ status: 'active' }, { transaction }); changed = true; }
        }
        if (changed) added++;
      }
    });
    await clearDashboardCache();
    res.status(201).json({ added });
  });

  app.delete('/api/courses/:id/enrollments/:studentId', canManagePeople, async (req, res) => {
    const course = await models.Course.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    const modules = await models.Course.findAll({ where: { schoolId: req.user.schoolId, ...classScope(course) }, attributes: ['id'] });
    await models.Enrollment.update({ status: 'withdrawn' }, { where: {
      schoolId: req.user.schoolId, studentId: req.params.studentId, courseId: modules.map(c => c.id),
    } });
    await clearDashboardCache();
    res.json({ saved: true });
  });

  app.put('/api/students/:studentId/courses/:courseId', canManagePeople, async (req, res) => {
    const studentId = Number(req.params.studentId);
    const courseId = Number(req.params.courseId);
    const status = req.body.status;
    if (!Number.isInteger(studentId) || studentId < 1 || !Number.isInteger(courseId) || courseId < 1 || !['active', 'exempt'].includes(status)) {
      return res.status(400).json({ message: 'Selecciona un estudiante, curso y estado válidos.' });
    }
    const where = { schoolId: req.user.schoolId, studentId, courseId };
    const [student, course] = await Promise.all([
      models.Student.findOne({ where: { id: studentId, schoolId: req.user.schoolId, active: true } }),
      models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } }),
    ]);
    if (!student || !course) return res.status(404).json({ message: 'Estudiante o curso no encontrado.' });
    const [enrollment] = await models.Enrollment.findOrCreate({ where, defaults: { status } });
    await enrollment.update({ status });
    await clearDashboardCache();
    res.json({ enrollment });
  });

  app.get('/api/courses/:id/materials', async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    if (!(await canAccessCourse(req.user, course.id))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    res.json(await models.TeachingMaterial.findAll({ where: { courseId: course.id, schoolId: req.user.schoolId }, order: [['created_at', 'DESC']] }));
  });
  app.post('/api/courses/:id/materials', canManageMaterials, upload.single('file'), async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Curso inválido.' });
    }
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course || !req.file) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Selecciona un curso y un archivo PPT, PPTX o PDF.' });
    }
    if (!(await canAccessCourse(req.user, course.id))) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    }
    const title = String(req.body.title || req.file.originalname).trim();
    const description = String(req.body.description || '').trim();
    if (!title || title.length > 180 || description.length > 10000) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Ingresa un título válido para el material.' });
    }
    const material = await models.TeachingMaterial.create({
      schoolId: req.user.schoolId, createdBy: req.user.id, courseId: course.id,
      title, description, originalName: req.file.originalname,
      mimeType: req.file.mimetype, storageKey: req.file.filename, size: req.file.size,
    });
    req.uploadCommitted = true;
    res.status(201).json({ material });
  });
  const editableMaterial = async (req, res, next) => {
    const materialId = Number(req.params.id);
    if (!Number.isSafeInteger(materialId) || materialId < 1) return res.status(400).json({ message: 'Material inválido.' });
    const material = await models.TeachingMaterial.findOne({ where: { id: materialId, schoolId: req.user.schoolId } });
    if (!material) return res.status(404).json({ message: 'Material no encontrado.' });
    if (!(await canAccessCourse(req.user, material.courseId))) return res.status(403).json({ message: 'No tienes acceso a este material.' });
    req.material = material;
    next();
  };
  app.put('/api/materials/:id', canManageMaterials, editableMaterial, upload.single('file'), async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    if (!title || title.length > 180 || description.length > 10000) return res.status(400).json({ message: 'Revisa el título y la descripción del material.' });
    const previousKey = req.material.storageKey;
    await req.material.update({ title, description, ...(req.file ? {
      originalName: req.file.originalname, mimeType: req.file.mimetype,
      storageKey: req.file.filename, size: req.file.size,
    } : {}) });
    req.uploadCommitted = true;
    if (req.file && previousKey !== req.file.filename) await fs.unlink(safeUploadPath(previousKey)).catch(() => {});
    res.json({ material: req.material });
  });
  app.delete('/api/materials/:id', canManageMaterials, editableMaterial, async (req, res) => {
    const storageKey = req.material.storageKey;
    await req.material.destroy();
    await fs.unlink(safeUploadPath(storageKey)).catch(() => {});
    res.json({ deleted: true });
  });
  app.get('/api/materials/:id/download', async (req, res) => {
    const materialId = Number(req.params.id);
    if (!Number.isInteger(materialId) || materialId < 1) return res.status(400).json({ message: 'Material inválido.' });
    const material = await assertOwnedBySchool(models.TeachingMaterial, materialId, req);
    if (!material) return res.status(404).json({ message: 'Material no encontrado.' });
    if (!(await canAccessCourse(req.user, material.courseId))) return res.status(403).json({ message: 'No tienes acceso a este material.' });
    res.download(safeUploadPath(material.storageKey), material.originalName);
  });

  app.get('/api/courses/:id/links', async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    if (!(await canAccessCourse(req.user, course.id))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    res.json(await models.CourseLink.findAll({
      where: { courseId: course.id, schoolId: req.user.schoolId },
      order: [['created_at', 'DESC']],
    }));
  });
  app.post('/api/courses/:id/links', canManageCourseLinks, async (req, res) => {
    const courseId = Number(req.params.id);
    if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    if (!(await canAccessCourse(req.user, course.id))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const url = normalizeCourseLinkUrl(req.body.url);
    if (!title || title.length > 180) return res.status(400).json({ message: 'Ingresa un título de hasta 180 caracteres.' });
    if (!url) return res.status(400).json({ message: 'Ingresa una URL válida (http o https).' });
    if (description.length > 5000) return res.status(400).json({ message: 'La descripción no puede superar 5000 caracteres.' });
    const link = await models.CourseLink.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      courseId: course.id,
      title,
      url,
      description: description || null,
    });
    res.status(201).json({ link });
  });
  const editableCourseLink = async (req, res, next) => {
    const linkId = Number(req.params.id);
    if (!Number.isSafeInteger(linkId) || linkId < 1) return res.status(400).json({ message: 'Enlace inválido.' });
    const link = await models.CourseLink.findOne({ where: { id: linkId, schoolId: req.user.schoolId } });
    if (!link) return res.status(404).json({ message: 'Enlace no encontrado.' });
    if (!(await canAccessCourse(req.user, link.courseId))) return res.status(403).json({ message: 'No tienes acceso a este enlace.' });
    req.courseLink = link;
    next();
  };
  app.put('/api/links/:id', canManageCourseLinks, editableCourseLink, async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const url = normalizeCourseLinkUrl(req.body.url);
    if (!title || title.length > 180) return res.status(400).json({ message: 'Ingresa un título de hasta 180 caracteres.' });
    if (!url) return res.status(400).json({ message: 'Ingresa una URL válida (http o https).' });
    if (description.length > 5000) return res.status(400).json({ message: 'La descripción no puede superar 5000 caracteres.' });
    await req.courseLink.update({ title, url, description: description || null });
    res.json({ link: req.courseLink });
  });
  app.delete('/api/links/:id', canManageCourseLinks, editableCourseLink, async (req, res) => {
    await req.courseLink.destroy();
    res.json({ deleted: true });
  });

  app.post('/api/documents', (req, res, next) => canManageDocuments(req.user) ? next() : res.status(403).json({ message: 'No tienes permiso para subir documentos.' }), documentUpload.single('file'), async (req, res) => {
    if (!canManageDocuments(req.user)) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ message: 'No tienes permiso para subir documentos.' });
    }
    if (!req.file) return res.status(400).json({ message: 'Selecciona un archivo.' });
    const name = String(req.body.name || req.file.originalname).trim();
    const kind = String(req.body.kind || 'General').trim();
    const studentId = req.body.studentId ? Number(req.body.studentId) : null;
    if (!name || name.length > 180 || !kind || kind.length > 60 || (studentId !== null && (!Number.isInteger(studentId) || studentId < 1))) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Revisa el nombre, tipo y estudiante del documento.' });
    }
    if (studentId && !(await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } }))) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'El estudiante seleccionado no pertenece al colegio.' });
    }
    const employeeId = req.body.employeeId ? Number(req.body.employeeId) : null;
    const userId = req.body.userId ? Number(req.body.userId) : null;
    for (const [id, model] of [[employeeId, models.Employee], [userId, models.User]]) {
      if (id !== null && (!Number.isInteger(id) || id < 1 || !(await model.count({ where: { id, schoolId: req.user.schoolId } })))) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: 'La persona seleccionada no pertenece al colegio.' });
      }
    }
    if ([studentId, employeeId, userId].filter(Boolean).length > 1 || (['finance', 'agente_finanzas'].includes(req.user.role) && !employeeId)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Selecciona una sola persona; Finanzas solo puede adjuntar documentos de empleados.' });
    }
    const document = await models.Document.create({
      schoolId: req.user.schoolId, createdBy: req.user.id, studentId, employeeId, userId, kind, name,
      storageKey: req.file.filename,
    });
    req.uploadCommitted = true;
    res.status(201).json({ document });
  });

  app.get('/api/documents/:id/download', async (req, res) => {

    const documentId = Number(req.params.id);
    if (!Number.isInteger(documentId) || documentId < 1) return res.status(400).json({ message: 'Documento inválido.' });
    const document = await models.Document.findOne({ where: { [Op.and]: [await documentScope(req.user), { id: documentId }] } });
    if (!document) return res.status(404).json({ message: 'Documento no encontrado.' });
    const extension = path.extname(document.storageKey);
    res.download(safeUploadPath(document.storageKey), `${document.name}${path.extname(document.name) ? '' : extension}`);
  });

  app.get('/api/hr/salaries', async (req, res) => {
    if (!req.user.permissions?.manageSchool && !req.user.permissions?.manageHr && !['director', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role)) return res.status(403).json({ message: 'No tienes permiso para consultar sueldos.' });
    res.json(await models.Employee.findAll({ where: { schoolId: req.user.schoolId }, include: [{ model: models.User, attributes: ['fullName', 'username', 'role'] }], order: [['position', 'ASC']] }));
  });
  app.put('/api/hr/salaries/:id', async (req, res) => {
    if (!req.user.permissions?.manageSchool && !req.user.permissions?.manageHr && !['director', 'finance', 'agente_finanzas'].includes(req.user.role)) return res.status(403).json({ message: 'No tienes permiso para modificar sueldos.' });
    const employeeId = Number(req.params.id);
    const salary = Number(req.body.monthlySalary);
    if (!Number.isInteger(employeeId) || employeeId < 1 || !isValidMoney(req.body.monthlySalary)) {
      return res.status(400).json({ message: 'Sueldo inválido.' });
    }
    const employee = await models.Employee.findOne({ where: { id: employeeId, schoolId: req.user.schoolId } });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    employee.monthlySalary = salary;
    await employee.save();
    res.json({ employee });
  });
}

export { uploadRoot };
