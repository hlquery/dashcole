import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createUpload, safeUploadPath, tenantUploadKey } from './uploads.js';
import { models, sequelize } from './database.js';
import { canAccessCourse } from './academics.js';
import { assertLearnerCanWrite } from './auth.js';
import { enqueueMail } from './services/mail.js';
import { isSmtpConfigured } from './services/smtp-config.js';
import { teacherCourseMatchSql, teacherCourseMatchParams } from './services/teacher-scope.js';
import { Op } from 'sequelize';

const upload = createUpload();

const canTeach = (user) => {
  if (['student', 'guardian'].includes(user.role)) return false;
  if (user.readOnly) return false;
  if (user.permissions?.manageSchool || user.permissions?.manageGrades) return true;
  return user.role === 'teacher';
};
const text = (value, max) => typeof value === 'string' && value.trim().length <= max ? value.trim() : '';
const scope = req => ({ schoolId: req.user.schoolId, courseId: Number(req.params.id) });
const wantsEmailNotify = (body) => ['1', 'true', 'yes', 'on'].includes(String(body?.notifyEmail ?? '').trim().toLowerCase());
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

function canParticipateInForum(user, course, teach) {
  if (user.readOnly || user.accessMode === 'historical') return false;
  if (user.role === 'guardian') return false;
  if (teach) return true;
  if (user.role === 'student') return course?.allowStudentsReplyForum !== false;
  return false;
}

async function enrolledStudentRecipients(schoolId, courseId, { excludeUserId } = {}) {
  const replacements = [courseId, schoolId, schoolId];
  let excludeSql = '';
  if (excludeUserId) {
    excludeSql = 'AND (s.user_id IS NULL OR s.user_id <> ?)';
    replacements.push(excludeUserId);
  }
  const [rows] = await sequelize.query(`
    SELECT DISTINCT
      s.id AS studentId,
      s.user_id AS userId,
      s.email AS studentEmail,
      u.username AS username
    FROM enrollments e
    JOIN students s ON s.id = e.student_id
    LEFT JOIN users u ON u.id = s.user_id AND u.school_id = s.school_id
    WHERE e.course_id = ?
      AND e.school_id = ?
      AND e.status IN ('active', 'exempt')
      AND s.school_id = ?
      AND s.active = 1
      ${excludeSql}
  `, { replacements });
  return rows.map((row) => ({
    studentId: Number(row.studentId || row.studentid) || null,
    userId: Number(row.userId || row.userid) || null,
    emails: [row.studentEmail || row.studentemail, row.username]
      .map((value) => String(value || '').trim().toLowerCase())
      .filter((email) => looksLikeEmail(email)),
  }));
}

async function enrolledStudentUserIds(schoolId, courseId, { excludeUserId } = {}) {
  const rows = await enrolledStudentRecipients(schoolId, courseId, { excludeUserId });
  return [...new Set(rows.map((row) => row.userId).filter((id) => Number.isInteger(id) && id > 0))];
}

function clipNotification(value, max = 500) {
  const textValue = String(value || '').trim();
  if (textValue.length <= max) return textValue;
  return `${textValue.slice(0, Math.max(0, max - 1))}…`;
}

async function notifyCourseStudents({
  schoolId,
  courseId,
  actorUserId,
  subject,
  body,
}) {
  const recipients = await enrolledStudentRecipients(schoolId, courseId, { excludeUserId: actorUserId });
  const withAccount = recipients.filter((row) => row.userId);
  if (!withAccount.length) return { notified: 0 };
  await models.UserNotification.bulkCreate(
    withAccount.map((row) => ({
      schoolId,
      createdBy: actorUserId || null,
      userId: row.userId,
      studentId: row.studentId || null,
      gradeId: null,
      subject: clipNotification(subject, 180),
      body: clipNotification(body, 500),
    })),
  );
  return { notified: withAccount.length };
}

async function enrolledStudentEmails(schoolId, courseId) {
  const recipients = await enrolledStudentRecipients(schoolId, courseId);
  const emails = new Set();
  for (const row of recipients) {
    for (const email of row.emails) emails.add(email);
  }
  return [...emails];
}

async function emailCourseStudents({ user, courseId, subject, body, key }) {
  if (!(await isSmtpConfigured())) return { emailed: 0, skipped: true };
  const school = await models.School.findByPk(user.schoolId, {
    attributes: ['name', 'phone', 'email', 'website', 'address'],
    raw: true,
  });
  const recipients = await enrolledStudentEmails(user.schoolId, courseId);
  let emailed = 0;
  for (const email of recipients) {
    try {
      await enqueueMail({
        user,
        template: 'communication',
        recipient: email,
        payload: {
          emails: [email],
          subject,
          body,
          school: school || { name: 'DashCole' },
        },
        key: `${key}:${email}`,
      });
      emailed += 1;
    } catch {
      /* Keep publishing even if one recipient fails. */
    }
  }
  return { emailed, skipped: false };
}

export function registerClassroomRoutes(app) {
  app.get('/api/assignments', async (req, res) => {
    if (!canTeach(req.user)) {
      return res.status(403).json({ message: 'Solo el profesor o administración pueden ver el listado de tareas.' });
    }
    const panel = String(req.query.panel || 'active').trim().toLowerCase() === 'history' ? 'history' : 'active';
    const now = new Date();
    const schoolId = req.user.schoolId;
    const isFullAccess = Boolean(
      req.user.permissions?.manageSchool
      || req.user.permissions?.manageGrades
      || ['super_admin', 'school_admin', 'director', 'manager', 'monitor', 'utp'].includes(req.user.role)
    );

    let courses;
    if (isFullAccess) {
      courses = await models.Course.findAll({
        where: { schoolId },
        attributes: ['id', 'name', 'section', 'subject'],
        raw: true,
      });
    } else {
      const [rows] = await sequelize.query(
        `SELECT c.id, c.name, c.section, c.subject
         FROM courses c
         WHERE c.school_id = ?
           AND ${teacherCourseMatchSql('c')}`,
        { replacements: [schoolId, ...teacherCourseMatchParams(req.user)] }
      );
      courses = rows;
    }

    const courseIds = courses.map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0);
    if (!courseIds.length) {
      return res.json({ panel, assignments: [], total: 0 });
    }

    const dueFilter = panel === 'history'
      ? { [Op.lt]: now }
      : { [Op.gte]: now };

    const assignments = await models.Assignment.findAll({
      where: {
        schoolId,
        courseId: { [Op.in]: courseIds },
        dueAt: dueFilter,
      },
      order: [['dueAt', panel === 'history' ? 'DESC' : 'ASC'], ['id', 'DESC']],
    });

    const assignmentIds = assignments.map((row) => row.id);
    const [submissions, enrollments] = await Promise.all([
      assignmentIds.length
        ? models.Submission.findAll({
          where: { schoolId, assignmentId: { [Op.in]: assignmentIds } },
          attributes: ['assignmentId', 'feedback', 'updatedAt'],
          raw: true,
        })
        : Promise.resolve([]),
      models.Enrollment.findAll({
        where: { schoolId, courseId: { [Op.in]: courseIds }, status: 'active' },
        attributes: ['courseId'],
        raw: true,
      }),
    ]);

    const courseMap = new Map(courses.map((row) => [Number(row.id), row]));
    const enrolledByCourse = new Map();
    for (const row of enrollments) {
      const courseId = Number(row.courseId || row.course_id);
      enrolledByCourse.set(courseId, (enrolledByCourse.get(courseId) || 0) + 1);
    }
    const submissionsByAssignment = new Map();
    for (const row of submissions) {
      const assignmentId = Number(row.assignmentId || row.assignment_id);
      if (!submissionsByAssignment.has(assignmentId)) submissionsByAssignment.set(assignmentId, []);
      submissionsByAssignment.get(assignmentId).push(row);
    }

    const rows = assignments.map((item) => {
      const plain = item.toJSON();
      const { storageKey, ...safe } = plain;
      const course = courseMap.get(Number(plain.courseId)) || {};
      const submissionRows = submissionsByAssignment.get(Number(plain.id)) || [];
      const enrolled = enrolledByCourse.get(Number(plain.courseId)) || 0;
      return {
        ...safe,
        hasAttachment: Boolean(storageKey),
        submissionCount: submissionRows.length,
        feedbackCount: submissionRows.filter((row) => row.feedback).length,
        enrolled,
        courseName: course.name || '',
        courseSection: course.section || '',
        courseSubject: course.subject || '',
        courseLabel: `${course.name || ''} ${course.section || ''} · ${course.subject || ''}`.replace(/\s+/g, ' ').trim(),
        status: new Date(plain.dueAt) < now ? 'Vencida' : 'Activa',
      };
    });

    res.json({ panel, assignments: rows, total: rows.length });
  });

  // Authorize before parsing uploads; every operation is scoped to the school and course.
  app.use('/api/courses/:id/classroom', async (req, res, next) => {
    const courseId = Number(req.params.id);
    if (!Number.isSafeInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Curso inválido.' });
    const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
    if (!course || !(await canAccessCourse(req.user, courseId))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    req.classCourseId = courseId;
    next();
  });
  const teacher = (req, res, next) => canTeach(req.user) ? next() : res.status(403).json({ message: 'Solo el profesor o administración pueden realizar esta acción.' });
  const assignmentFor = req => models.Assignment.findOne({ where: { ...scope(req), id: req.params.assignmentId } });
  const forumFor = req => models.Forum.findOne({ where: { ...scope(req), id: req.params.forumId } });
  const denyGuardianForums = (req, res, next) => {
    if (req.user.role === 'guardian') {
      return res.status(403).json({ message: 'Los foros del aula son solo para docentes y estudiantes.' });
    }
    return next();
  };

  app.get('/api/courses/:id/classroom', async (req, res) => {
    const course = await models.Course.findOne({ where: { id: req.classCourseId, schoolId: req.user.schoolId } });
    const teach = Boolean(canTeach(req.user));
    const isGuardian = req.user.role === 'guardian';
    const allowCreate = Boolean(course?.allowStudentsCreateForum);
    const allowReply = course?.allowStudentsReplyForum !== false;
    const forumGuidelines = typeof course?.forumGuidelines === 'string' ? course.forumGuidelines : '';
    const [assignments, forums, enrolled, communications] = await Promise.all([
      models.Assignment.findAll({ where: scope(req), order: [['dueAt', 'ASC']] }),
      isGuardian
        ? Promise.resolve([])
        : models.Forum.findAll({ where: scope(req), order: [['pinned', 'DESC'], ['id', 'DESC']] }),
      models.Enrollment.count({ where: { ...scope(req), status: 'active' } }),
      models.Communication.findAll({
        where: { schoolId: req.user.schoolId, courseId: req.classCourseId },
        order: [['sentAt', 'DESC'], ['id', 'DESC']],
        limit: 50,
      }),
    ]);
    const [submissions, forumPosts] = await Promise.all([
      models.Submission.findAll({ where: { schoolId: req.user.schoolId, assignmentId: assignments.map(item => item.id), ...(!teach ? { createdBy: req.user.id } : {}) }, raw: true }),
      forums.length
        ? models.ForumPost.findAll({ where: { schoolId: req.user.schoolId, forumId: forums.map(item => item.id) }, raw: true })
        : Promise.resolve([]),
    ]);
    const assignmentRows = assignments.map(item => {
      const rows = submissions.filter(row => row.assignmentId === item.id);
      const plain = item.toJSON();
      const { storageKey, ...safe } = plain;
      return {
        ...safe,
        hasAttachment: Boolean(storageKey),
        submissionCount: rows.length,
        feedbackCount: rows.filter(row => row.feedback).length,
        submitted: rows.length > 0,
        hasFeedback: rows.some(row => row.feedback),
        lastSubmissionAt: rows.map(row => row.updatedAt).sort().at(-1) || null,
      };
    });
    const authors = forums.length
      ? await models.User.findAll({ where: { schoolId: req.user.schoolId, id: [...new Set(forums.map(item => item.createdBy))] }, attributes: ['id', 'fullName'], raw: true })
      : [];
    const authorNames = new Map(authors.map(item => [item.id, item.fullName]));
    const forumRows = forums.map(item => {
      const rows = forumPosts.filter(row => row.forumId === item.id);
      const latest = [...rows].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
      return { ...item.toJSON(), authorName: authorNames.get(item.createdBy) || 'Usuario del curso', lastAuthorName: latest?.authorName || authorNames.get(item.createdBy), postCount: rows.length, participantCount: new Set(rows.map(row => row.createdBy)).size, lastActivityAt: latest?.updatedAt || item.updatedAt };
    });
    res.json({
      assignments: assignmentRows,
      forums: forumRows,
      communications: communications.map(row => row.toJSON()),
      enrolled,
      canTeach: teach,
      canCreateForum: teach || (req.user.role === 'student' && allowCreate),
      canParticipate: canParticipateInForum(req.user, course, teach),
      settings: {
        allowStudentsCreateForum: allowCreate,
        allowStudentsReplyForum: allowReply,
        allowGuardiansReplyForum: false,
        forumGuidelines,
      },
    });
  });
  app.put('/api/courses/:id/classroom/settings', teacher, async (req, res) => {
    const course = await models.Course.findOne({ where: { id: req.classCourseId, schoolId: req.user.schoolId } });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
    const values = { allowGuardiansReplyForum: false };
    if (typeof req.body.allowStudentsCreateForum === 'boolean') values.allowStudentsCreateForum = req.body.allowStudentsCreateForum;
    if (typeof req.body.allowStudentsReplyForum === 'boolean') values.allowStudentsReplyForum = req.body.allowStudentsReplyForum;
    if (typeof req.body.forumGuidelines === 'string') {
      const guidelines = req.body.forumGuidelines.trim();
      if (guidelines.length > 5000) return res.status(400).json({ message: 'Las normas del foro no pueden superar 5000 caracteres.' });
      values.forumGuidelines = guidelines || null;
    }
    const hasForumPreference = typeof req.body.allowStudentsCreateForum === 'boolean'
      || typeof req.body.allowStudentsReplyForum === 'boolean'
      || typeof req.body.forumGuidelines === 'string';
    if (!hasForumPreference) return res.status(400).json({ message: 'Indica al menos una preferencia de foro.' });
    await course.update(values);
    res.json({
      allowStudentsCreateForum: Boolean(course.allowStudentsCreateForum),
      allowStudentsReplyForum: course.allowStudentsReplyForum !== false,
      allowGuardiansReplyForum: false,
      forumGuidelines: course.forumGuidelines || '',
    });
  });
  app.post('/api/courses/:id/classroom/assignments', teacher, upload.single('file'), async (req, res) => {
    const title = text(req.body.title, 180), instructions = text(req.body.instructions, 10000);
    const dueAt = new Date(req.body.dueAt);
    if (!title || !instructions || !Number.isFinite(dueAt.getTime())) {
      return res.status(400).json({ message: 'Completa título, instrucciones y fecha de entrega.' });
    }
    let storageKey = null;
    if (req.file) {
      if (!/\.(pdf|pptx?|docx?|xlsx?|png|jpe?g)$/i.test(req.file.originalname) || req.file.originalname.length > 255) {
        return res.status(400).json({ message: 'Formato no permitido. Usa PDF, Office o una imagen.' });
      }
      storageKey = tenantUploadKey(req.user.schoolId, `assignment-${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`);
      const filename = safeUploadPath(storageKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    }
    try {
      const assignment = await models.Assignment.create({
        ...scope(req),
        createdBy: req.user.id,
        title,
        instructions,
        dueAt,
        ...(storageKey ? {
          storageKey,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size || 0,
        } : {}),
      });
      const course = await models.Course.findOne({
        where: { id: req.classCourseId, schoolId: req.user.schoolId },
        attributes: ['id', 'name', 'section', 'subject'],
        raw: true,
      });
      const courseLabel = course
        ? `${course.subject} · ${course.name} ${course.section}`
        : `Curso #${req.classCourseId}`;
      const notifyBody = `${title} — ${courseLabel}. Entrega: ${dueAt.toISOString().slice(0, 10)}.`;
      const notifyResult = await notifyCourseStudents({
        schoolId: req.user.schoolId,
        courseId: req.classCourseId,
        actorUserId: req.user.id,
        subject: `Nueva tarea #${req.classCourseId}`,
        body: notifyBody,
      });
      let emailResult = { emailed: 0, skipped: true };
      if (wantsEmailNotify(req.body)) {
        emailResult = await emailCourseStudents({
          user: req.user,
          courseId: req.classCourseId,
          subject: `Nueva tarea: ${title}`,
          body: [
            `Se publicó una nueva tarea en ${courseLabel}.`,
            '',
            title,
            `Fecha de entrega: ${dueAt.toLocaleString('es-CL')}`,
            '',
            instructions.length > 600 ? `${instructions.slice(0, 597)}…` : instructions,
            '',
            'Ingresá a DashCole para ver las instrucciones y entregar.',
          ].join('\n'),
          key: `assignment-email:${assignment.id}`,
        });
      }
      const plain = assignment.toJSON();
      const { storageKey: _key, ...safe } = plain;
      res.status(201).json({
        ...safe,
        hasAttachment: Boolean(_key),
        notified: notifyResult.notified || 0,
        emailed: emailResult.emailed || 0,
        emailSkipped: Boolean(emailResult.skipped),
        emailRequested: wantsEmailNotify(req.body),
      });
    } catch (error) {
      if (storageKey) await fs.unlink(safeUploadPath(storageKey)).catch(() => {});
      throw error;
    }
  });
  app.put('/api/courses/:id/classroom/assignments/:assignmentId', teacher, upload.single('file'), async (req, res) => {
    const assignment = await assignmentFor(req);
    if (!assignment) return res.status(404).json({ message: 'Tarea no encontrada.' });
    const title = text(req.body.title, 180), instructions = text(req.body.instructions, 10000);
    const dueAt = new Date(req.body.dueAt);
    if (!title || !instructions || !Number.isFinite(dueAt.getTime())) {
      return res.status(400).json({ message: 'Completa título, instrucciones y fecha de entrega.' });
    }
    const removeAttachment = ['1', 'true', 'yes'].includes(String(req.body.removeAttachment || '').toLowerCase());
    let storageKey = null;
    const previousKey = assignment.storageKey || null;
    if (req.file) {
      if (!/\.(pdf|pptx?|docx?|xlsx?|png|jpe?g)$/i.test(req.file.originalname) || req.file.originalname.length > 255) {
        return res.status(400).json({ message: 'Formato no permitido. Usa PDF, Office o una imagen.' });
      }
      storageKey = tenantUploadKey(req.user.schoolId, `assignment-${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`);
      const filename = safeUploadPath(storageKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    }
    try {
      const values = { title, instructions, dueAt };
      if (storageKey) {
        Object.assign(values, {
          storageKey,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size || 0,
        });
      } else if (removeAttachment) {
        Object.assign(values, {
          storageKey: null,
          originalName: null,
          mimeType: null,
          size: 0,
        });
      }
      await assignment.update(values);
      if ((storageKey || removeAttachment) && previousKey && previousKey !== storageKey) {
        await fs.unlink(safeUploadPath(previousKey)).catch(() => {});
      }
      const plain = assignment.toJSON();
      const { storageKey: _key, ...safe } = plain;
      res.json({ ...safe, hasAttachment: Boolean(_key) });
    } catch (error) {
      if (storageKey) await fs.unlink(safeUploadPath(storageKey)).catch(() => {});
      throw error;
    }
  });
  app.delete('/api/courses/:id/classroom/assignments/:assignmentId', teacher, async (req, res) => {
    const assignment = await assignmentFor(req);
    if (!assignment) return res.status(404).json({ message: 'Tarea no encontrada.' });
    const where = { schoolId: req.user.schoolId, assignmentId: assignment.id };
    const submissions = await models.Submission.findAll({ where, attributes: ['storageKey'] });
    const assignmentKey = assignment.storageKey;
    await sequelize.transaction(async transaction => {
      await models.Submission.destroy({ where, transaction });
      await assignment.destroy({ transaction });
    });
    await Promise.all([
      ...submissions.filter(item => item.storageKey).map(item => fs.unlink(safeUploadPath(item.storageKey)).catch(() => {})),
      ...(assignmentKey ? [fs.unlink(safeUploadPath(assignmentKey)).catch(() => {})] : []),
    ]);
    res.json({ deleted: true });
  });
  app.get('/api/courses/:id/classroom/assignments/:assignmentId/download', async (req, res) => {
    const assignment = await assignmentFor(req);
    if (!assignment?.storageKey) return res.status(404).json({ message: 'Esta tarea no tiene archivo adjunto.' });
    res.download(safeUploadPath(assignment.storageKey), assignment.originalName || 'adjunto-tarea');
  });
  app.get('/api/courses/:id/classroom/assignments/:assignmentId/submissions', async (req, res) => {
    if (!(await assignmentFor(req))) return res.status(404).json({ message: 'Tarea no encontrada.' });
    const where = { schoolId: req.user.schoolId, assignmentId: req.params.assignmentId };
    if (!canTeach(req.user)) where.createdBy = req.user.id;
    const submissions = await models.Submission.findAll({ where, attributes: { exclude: ['storageKey'] }, order: [['id', 'DESC']] });
    const students = await models.Student.findAll({ where: { schoolId: req.user.schoolId, id: submissions.map(s => s.studentId) }, attributes: ['id', 'firstName', 'lastName'] });
    const names = new Map(students.map(s => [s.id, s.firstName + ' ' + s.lastName]));
    res.json(submissions.map(s => ({ ...s.toJSON(), studentName: names.get(s.studentId) || 'Estudiante' })));
  });
  app.post('/api/courses/:id/classroom/assignments/:assignmentId/submissions', async (req, res, next) => {
    const writeError = assertLearnerCanWrite(req.user);
    if (writeError) return res.status(403).json({ message: writeError.message });
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Solo los estudiantes pueden entregar tareas.' });
    const assignment = await assignmentFor(req);
    const student = await models.Student.findOne({ where: { schoolId: req.user.schoolId, userId: req.user.id, active: true } });
    const active = student && await models.Enrollment.count({ where: { schoolId: req.user.schoolId, courseId: req.params.id, studentId: student.id, status: 'active' } });
    if (!assignment || !active) return res.status(403).json({ message: 'No puedes entregar esta tarea.' });
    if (new Date() > assignment.dueAt) return res.status(400).json({ message: 'El plazo de entrega terminó.' });
    req.submissionStudent = student;
    next();
  }, upload.single('file'), async (req, res) => {
    const content = text(req.body.text, 10000);
    if (!content && !req.file) return res.status(400).json({ message: 'Escribe una respuesta o adjunta un archivo.' });
    let storageKey = null;
    if (req.file) {
      if (!/\.(pdf|pptx?|docx?|xlsx?|png|jpe?g)$/i.test(req.file.originalname) || req.file.originalname.length > 255) return res.status(400).json({ message: 'Formato no permitido. Usa PDF, Office o una imagen.' });
      storageKey = tenantUploadKey(req.user.schoolId, 'submission-' + crypto.randomUUID() + path.extname(req.file.originalname).toLowerCase());
      const filename = safeUploadPath(storageKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    }
    try {
      const saved = await sequelize.transaction(async transaction => {
        const where = { schoolId: req.user.schoolId, assignmentId: Number(req.params.assignmentId), studentId: req.submissionStudent.id };
        const existing = await models.Submission.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
        const values = { ...where, createdBy: req.user.id, text: content, feedback: null,
          ...(storageKey ? { storageKey, originalName: req.file.originalname } : {}) };
        if (existing) {
          const oldKey = existing.storageKey;
          await existing.update(values, { transaction });
          return { id: existing.id, oldKey };
        }
        return { id: (await models.Submission.create(values, { transaction })).id };
      });
      if (storageKey && saved.oldKey) await fs.unlink(safeUploadPath(saved.oldKey)).catch(() => {});
      res.status(201).json({ id: saved.id });
    } catch (error) {
      if (storageKey) await fs.unlink(safeUploadPath(storageKey)).catch(() => {});
      throw error;
    }
  });
  app.get('/api/courses/:id/classroom/assignments/:assignmentId/submissions/:submissionId/download', async (req, res) => {
    if (!(await assignmentFor(req))) return res.status(404).end();
    const submission = await models.Submission.findOne({ where: { id: req.params.submissionId, assignmentId: req.params.assignmentId, schoolId: req.user.schoolId } });
    if (!submission || (!canTeach(req.user) && submission.createdBy !== req.user.id)) return res.status(403).end();
    if (!submission.storageKey) return res.status(404).end();
    res.download(safeUploadPath(submission.storageKey), submission.originalName);
  });
  app.put('/api/courses/:id/classroom/assignments/:assignmentId/submissions/:submissionId', teacher, async (req, res) => {
    if (!(await assignmentFor(req))) return res.status(404).end();
    const feedback = text(req.body.feedback, 10000);
    if (!feedback) return res.status(400).json({ message: 'Escribe una devolución de hasta 10000 caracteres.' });
    const submission = await models.Submission.findOne({
      where: { id: req.params.submissionId, assignmentId: req.params.assignmentId, schoolId: req.user.schoolId },
    });
    if (!submission) return res.status(404).json({ message: 'Entrega no encontrada.' });
    await submission.update({ feedback });
    if (submission.createdBy && submission.createdBy !== req.user.id) {
      const assignment = await assignmentFor(req);
      await models.UserNotification.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        userId: submission.createdBy,
        studentId: null,
        gradeId: null,
        subject: `Nueva tarea #${req.classCourseId}`,
        body: `Devolución en “${assignment?.title || 'tu tarea'}”: ${feedback.length > 140 ? `${feedback.slice(0, 137)}…` : feedback}`,
      }).catch(() => null);
    }
    res.status(200).json({ saved: true });
  });
  app.post('/api/courses/:id/classroom/forums', denyGuardianForums, async (req, res) => {
    const writeError = assertLearnerCanWrite(req.user);
    if (writeError) return res.status(403).json({ message: writeError.message });
    const course = await models.Course.findOne({ where: { id: req.classCourseId, schoolId: req.user.schoolId } });
    const teach = canTeach(req.user);
    const allowCreate = Boolean(course?.allowStudentsCreateForum);
    if (!teach && !(req.user.role === 'student' && allowCreate)) {
      return res.status(403).json({ message: 'No puedes crear temas en este foro.' });
    }
    const title = text(req.body.title, 180), description = text(req.body.description, 10000);
    if (!title || !description) return res.status(400).json({ message: 'Completa título y descripción.' });
    const forum = await models.Forum.create({ ...scope(req), createdBy: req.user.id, title, description });
    const courseLabel = course
      ? `${course.subject || ''} · ${course.name} ${course.section}`.trim()
      : `Curso #${req.classCourseId}`;
    await notifyCourseStudents({
      schoolId: req.user.schoolId,
      courseId: req.classCourseId,
      actorUserId: req.user.id,
      subject: `Nuevo foro #${req.classCourseId}:${forum.id}`,
      body: `${title} — ${courseLabel}`,
    });
    if (teach && wantsEmailNotify(req.body)) {
      await emailCourseStudents({
        user: req.user,
        courseId: req.classCourseId,
        subject: `Nuevo tema en el foro: ${title}`,
        body: [
          `Se abrió un nuevo tema en el foro de ${courseLabel}.`,
          '',
          title,
          description.length > 400 ? `${description.slice(0, 397)}…` : description,
          '',
          'Ingresá a DashCole para participar en la conversación.',
        ].join('\n'),
        key: `forum-email:${forum.id}`,
      });
    }
    res.status(201).json(forum);
  });
  app.get('/api/courses/:id/classroom/forums/:forumId/posts', denyGuardianForums, async (req, res) => {
    if (!(await forumFor(req))) return res.status(404).end();
    const page = Math.max(1, Math.min(100000, Number(req.query.page) || 1));
    const result = await models.ForumPost.findAndCountAll({ where: { schoolId: req.user.schoolId, forumId: req.params.forumId }, order: [['id', 'ASC']], limit: 20, offset: (Math.floor(page) - 1) * 20 });
    const authorIds = [...new Set(result.rows.map((row) => row.createdBy).filter(Boolean))];
    const authors = authorIds.length
      ? await models.User.findAll({ where: { schoolId: req.user.schoolId, id: authorIds }, attributes: ['id', 'role', 'avatarKey'], raw: true })
      : [];
    const students = authorIds.length
      ? await models.Student.findAll({ where: { schoolId: req.user.schoolId, userId: authorIds }, attributes: ['userId', 'avatarKey'], raw: true })
      : [];
    const roles = new Map(authors.map((row) => [row.id, row.role]));
    const userAvatars = new Map(authors.map((row) => [row.id, Boolean(row.avatarKey || row.avatar_key)]));
    const studentAvatars = new Map(students.map((row) => [row.userId || row.userid, Boolean(row.avatarKey || row.avatar_key)]));
    const offset = (Math.floor(page) - 1) * 20;
    res.json({
      posts: result.rows.map((row, index) => {
        const role = roles.get(row.createdBy) || 'student';
        const hasAvatar = Boolean(studentAvatars.get(row.createdBy) || userAvatars.get(row.createdBy));
        return {
          ...row.toJSON(),
          postNumber: offset + index + 1,
          authorRole: role,
          hasAvatar,
          mine: row.createdBy === req.user.id,
          canEdit: row.createdBy === req.user.id || canTeach(req.user),
        };
      }),
      total: result.count,
    });
  });
  app.get('/api/courses/:id/classroom/authors/:userId/avatar', async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 1) return res.status(400).end();
    const student = await models.Student.findOne({
      where: { schoolId: req.user.schoolId, userId },
      attributes: ['id', 'avatarKey'],
    });
    if (student?.avatarKey) {
      const enrolled = await models.Enrollment.findOne({
        where: {
          schoolId: req.user.schoolId,
          courseId: req.classCourseId,
          studentId: student.id,
          status: 'active',
        },
        attributes: ['studentId'],
      });
      if (enrolled) {
        res.set('Cache-Control', 'private, max-age=300');
        return res.sendFile(safeUploadPath(student.avatarKey));
      }
    }
    const user = await models.User.findOne({
      where: { id: userId, schoolId: req.user.schoolId },
      attributes: ['avatarKey'],
    });
    if (user?.avatarKey) {
      res.set('Cache-Control', 'private, max-age=300');
      return res.sendFile(safeUploadPath(user.avatarKey));
    }
    return res.status(404).end();
  });
  app.post('/api/courses/:id/classroom/forums/:forumId/posts', denyGuardianForums, async (req, res) => {
    const writeError = assertLearnerCanWrite(req.user);
    if (writeError) return res.status(403).json({ message: writeError.message });
    const forum = await forumFor(req);
    if (!forum) return res.status(404).end();
    const course = await models.Course.findOne({ where: { id: req.classCourseId, schoolId: req.user.schoolId } });
    const teach = canTeach(req.user);
    if (forum.closed || !canParticipateInForum(req.user, course, teach)) {
      return res.status(403).json({ message: 'No puedes publicar en este foro.' });
    }
    const content = text(req.body.text, 5000);
    if (!content) return res.status(400).json({ message: 'Escribe un mensaje de hasta 5000 caracteres.' });
    const post = await models.ForumPost.create({
      schoolId: req.user.schoolId,
      forumId: forum.id,
      createdBy: req.user.id,
      authorName: req.user.fullName,
      text: content,
    });
    const courseLabel = course
      ? `${course.subject || ''} · ${course.name} ${course.section}`.trim()
      : `Curso #${req.classCourseId}`;
    const preview = content.length > 120 ? `${content.slice(0, 117)}…` : content;
    await notifyCourseStudents({
      schoolId: req.user.schoolId,
      courseId: req.classCourseId,
      actorUserId: req.user.id,
      subject: `Mensaje en foro #${req.classCourseId}:${forum.id}`,
      body: `${req.user.fullName || 'Alguien'} en “${forum.title}” (${courseLabel}): ${preview}`,
    });
    res.status(201).json(post);
  });
  app.put('/api/courses/:id/classroom/forums/:forumId', teacher, async (req, res) => {
    const forum = await forumFor(req);
    if (!forum) return res.status(404).end();
    const values = {};
    if (typeof req.body.closed === 'boolean') values.closed = req.body.closed;
    if (typeof req.body.pinned === 'boolean') values.pinned = req.body.pinned;
    if (!Object.keys(values).length) return res.status(400).json({ message: 'Indica si deseas cerrar o destacar el foro.' });
    await forum.update(values);
    res.json(forum);
  });
  app.put('/api/courses/:id/classroom/forums/:forumId/posts/:postId', denyGuardianForums, async (req, res) => {
    const forum = await forumFor(req), post = await models.ForumPost.findOne({ where: { id: req.params.postId, forumId: req.params.forumId, schoolId: req.user.schoolId } });
    if (!forum || !post) return res.status(404).json({ message: 'Mensaje no encontrado.' });
    if (post.createdBy !== req.user.id && !canTeach(req.user)) return res.status(403).json({ message: 'No puedes editar este mensaje.' });
    const content = text(req.body.text, 5000);
    if (!content) return res.status(400).json({ message: 'Escribe un mensaje de hasta 5000 caracteres.' });
    await post.update({ text: content });
    res.json(post);
  });
  app.delete('/api/courses/:id/classroom/forums/:forumId/posts/:postId', denyGuardianForums, async (req, res) => {
    const forum = await forumFor(req), post = await models.ForumPost.findOne({ where: { id: req.params.postId, forumId: req.params.forumId, schoolId: req.user.schoolId } });
    if (!forum || !post) return res.status(404).json({ message: 'Mensaje no encontrado.' });
    if (post.createdBy !== req.user.id && !canTeach(req.user)) return res.status(403).json({ message: 'No puedes eliminar este mensaje.' });
    await post.destroy();
    res.json({ removed: true });
  });
}
