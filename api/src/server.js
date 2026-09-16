import './config.js';
import { startWhatsAppWorker } from './services/whatsapp.js';
import { dashboardAttention, dashboardCharts } from './services/dashboard.js';
import { gradeGroups, courseGroups } from './services/summaries.js';
import { teacherCourseMatchSql, teacherCourseMatchParams, teacherOwnedCourseIdsSql, teacherOwnedCourseIdsParams, teacherSubjectCourseIdsSql, teacherSubjectCourseIdsParams } from './services/teacher-scope.js';
import { startMailWorker, stopMailWorker } from './services/mail.js';
import { listQuery } from './services/lists.js';
import { cleanupFailedUpload, migrateUploadLayout, safeUploadPath } from './uploads.js';
import { apiContract, apiErrorHandler } from './http.js';
import { isValidDate } from './validation.js';
import { createGrade } from './services/grades.js';
import cors from 'cors';
import { startListeners } from './listeners.js';
import { registerClassroomRoutes } from './classroom.js';
import express from 'express';
import fs from 'node:fs/promises';
import { Op } from 'sequelize';
import { cached, clearDashboardCache, controlSequelize, initializeDatabase, models, pool, redis, sequelize } from './database.js';
import { ensureCourseLevelModules } from './services/school-structure.js';
import { avatarUpload, changePassword, createUser, currentUser, deactivateStaffUser, deleteOwnSignature, forgotPassword, getOwnSignature, getUserAvatar, listOwnSessions, listUsers, login, logout, requireAuth, requireDirector, requireGradeAccess, restoreStaffUser, revokeOwnOtherSessions, setStaffPlatformAccess, switchTenant, updateOwnProfile, updateUser, uploadOwnSignature, uploadUserAvatar } from './auth.js';
import { registerScheduleRoutes } from './schedules.js';
import { registerPayrollRoutes } from './payroll.js';
import { registerErpRoutes } from './erp.js';
import { registerAcademicRoutes } from './academics.js';
import { registerPlatformRoutes } from './platform.js';
import { registerAdmissionsRoutes, registerAdmissionsAdminRoutes } from './admissions.js';
import { registerPlanningRoutes } from './planning.js';
import { registerLeaveRoutes } from './leave.js';
import { registerMineducRoutes } from './mineduc.js';
import { registerSigeRoutes } from './sige.js';
import { startSigeWorker, stopSigeWorker } from './services/sige/queue.js';
import { attachTenantContext } from './tenant-routing.js';
import { markTenantDatabaseOffline } from './database-routing.js';
import { startBackupScheduler, stopBackupScheduler } from './backups.js';
import { startDemoResetScheduler, stopDemoResetScheduler } from './services/demo-reset.js';
import { blockDemoWrites, demoModeInfo } from './demo-mode.js';

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); res.set('Cache-Control', 'no-store'); next(); });
const configuredWebOrigins = (process.env.WEB_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const privateDevelopmentOrigin = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/i;

function isAllowedWebOrigin(origin) {
  if (!origin) return true;
  if (configuredWebOrigins.includes(origin)) return true;
  return process.env.NODE_ENV !== 'production' && privateDevelopmentOrigin.test(origin);
}

app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedWebOrigin(origin));
  },
  credentials: true,
}));
app.use('/api', apiContract, cleanupFailedUpload);
app.use(express.json());
app.use(blockDemoWrites);

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  await controlSequelize.authenticate();
  res.json({
    status: 'ok',
    mysql: 'connected',
    control: 'connected',
    redis: redis.isReady ? 'connected' : 'degraded',
    ...demoModeInfo(req),
  });
});
app.get('/api/settings', (req, res) => res.json({
  success: true,
  data: {
    app_name: 'DashCole',
    api_url: '/api',
    maintenance_mode: false,
    features: {},
    ...demoModeInfo(req),
  },
}));
registerAdmissionsRoutes(app);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', forgotPassword);
app.get('/api/auth/me', requireAuth, currentUser);
app.post('/api/auth/logout', requireAuth, logout);
app.post('/api/auth/switch-tenant', requireAuth, switchTenant);
app.use('/api', requireAuth);
app.use('/api', attachTenantContext);
app.put('/api/auth/profile', updateOwnProfile);
app.put('/api/auth/password', changePassword);
app.get('/api/auth/sessions', listOwnSessions);
app.delete('/api/auth/sessions', revokeOwnOtherSessions);
app.get('/api/auth/signature', getOwnSignature);
app.post('/api/auth/signature', avatarUpload.single('file'), uploadOwnSignature);
app.delete('/api/auth/signature', deleteOwnSignature);

function requireAcademicModuleAccess(req, res, next) {
  if (['finance', 'agente_finanzas'].includes(req.user.role)) {
    return res.status(403).json({ message: 'El rol de agente de finanzas no tiene acceso a módulos académicos.' });
  }
  next();
}

app.use(['/api/courses', '/api/dashboard', '/api/students', '/api/grades', '/api/subjects', '/api/materials'], requireAcademicModuleAccess);

app.get('/api/admin/users', requireDirector, listUsers);
app.post('/api/admin/users', requireDirector, createUser);
app.put('/api/admin/users/:id', requireDirector, updateUser);
app.post('/api/admin/users/:id/deactivate', requireDirector, deactivateStaffUser);
app.post('/api/admin/users/:id/restore', requireDirector, restoreStaffUser);
app.put('/api/admin/users/:id/platform-access', requireDirector, setStaffPlatformAccess);
app.post('/api/admin/users/:id/avatar', requireDirector, avatarUpload.single('file'), uploadUserAvatar);
app.get('/api/admin/users/:id/avatar', requireDirector, getUserAvatar);
registerScheduleRoutes(app);
registerPayrollRoutes(app);
registerErpRoutes(app);
registerAcademicRoutes(app);
registerClassroomRoutes(app);
registerAdmissionsAdminRoutes(app);
registerPlanningRoutes(app);
registerLeaveRoutes(app);
registerMineducRoutes(app);
registerSigeRoutes(app);
registerPlatformRoutes(app);

function learnerGradeScope(user) {
  if (user.role === 'student') return { sql: 'g.student_id IN (SELECT id FROM students WHERE user_id = ?)', params: [user.id] };
  if (user.role === 'guardian') return {
    sql: 'g.student_id IN (SELECT sg.student_id FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id WHERE gu.user_id = ?)',
    params: [user.id],
  };
  if (user.role === 'teacher') return {
    sql: `g.course_id IN (${teacherOwnedCourseIdsSql()})`,
    params: teacherOwnedCourseIdsParams(user),
  };
  return { sql: '', params: [] };
}


function learnerCourseScope(user) {
  const includeWithdrawn = user.readOnly || user.accessMode === 'historical';
  const enrollmentFilter = includeWithdrawn ? '' : " AND e.status <> 'withdrawn'";
  if (
    user.platformPermissions?.includes('platform.accounts.read')
    || user.permissions?.manageSchool
    || ['super_admin', 'school_admin', 'director', 'manager', 'monitor', 'utp'].includes(user.role)
  ) {
    return { sql: '', params: [] };
  }
  if (user.role === 'student') {
    return {
      sql: `c.id IN (SELECT e.course_id FROM enrollments e JOIN students st ON st.id = e.student_id WHERE st.user_id = ?${enrollmentFilter})`,
      params: [user.id],
    };
  }
  if (user.role === 'guardian') {
    return {
      sql: `c.id IN (SELECT e.course_id FROM enrollments e JOIN student_guardians sg ON sg.student_id = e.student_id JOIN guardians gu ON gu.id = sg.guardian_id WHERE gu.user_id = ?${enrollmentFilter})`,
      params: [user.id],
    };
  }
  if (user.role === 'teacher') {
    return {
      sql: `${teacherCourseMatchSql('c')}`,
      params: teacherCourseMatchParams(user),
    };
  }
  return { sql: '', params: [] };
}

async function canAccessStudent(user, studentId) {
  if (user.role === 'teacher') {
    const [rows] = await pool.query(`
      SELECT s.id FROM students s
      WHERE s.id = ? AND s.school_id = ? AND EXISTS (
        SELECT 1 FROM enrollments e JOIN courses c ON c.id = e.course_id
        WHERE e.student_id = s.id AND c.school_id = s.school_id
          AND ${teacherCourseMatchSql('c')}
      )
    `, [studentId, user.schoolId, ...teacherCourseMatchParams(user)]);
    return Boolean(rows.length);
  }
  if (!['student', 'guardian'].includes(user.role)) return true;
  const condition = user.role === 'student'
    ? 's.user_id = ?'
    : 'EXISTS (SELECT 1 FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id WHERE sg.student_id = s.id AND gu.user_id = ?)';
  const [rows] = await pool.query(`SELECT s.id FROM students s WHERE s.id = ? AND s.school_id = ? AND ${condition}`, [studentId, user.schoolId, user.id]);
  return Boolean(rows.length);
}

app.get('/api/courses', async (req, res) => {
  const learner = learnerCourseScope(req.user);
  const data = await cached(`dashcole:cache:${req.user.schoolId}:courses:${req.user.role}:${req.user.id}`, 120, async () => {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(DISTINCT e.student_id) student_count,
        ROUND(AVG(g.score), 1) average
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
      LEFT JOIN grades g ON g.course_id = c.id
      WHERE c.school_id = ? ${learner.sql ? `AND ${learner.sql}` : ''}
      GROUP BY c.id ORDER BY c.id DESC
    `, [req.user.schoolId, ...learner.params]);
    return rows;
  });
  res.json(req.query.grouped === 'true' ? courseGroups(data) : data);
});

app.get('/api/dashboard', async (req, res) => {
  const courseId = Number(req.query.courseId || 0);
  let courseModuleIds = [];
  if (courseId) {
    const [[course]] = await pool.query(
      'SELECT name, section, academic_year_id FROM courses WHERE id = ? AND school_id = ?',
      [courseId, req.user.schoolId],
    );
    if (course) {
      const [modules] = await pool.query(`
        SELECT id FROM courses
        WHERE school_id = ? AND name = ? AND section = ? AND (academic_year_id <=> ?)
      `, [req.user.schoolId, course.name, course.section, course.academic_year_id]);
      courseModuleIds = modules.map((module) => Number(module.id)).filter((id) => id > 0);
    }
    if (!courseModuleIds.length) courseModuleIds = [courseId];
  }
  const learner = learnerGradeScope(req.user);
  const key = `dashcole:cache:${req.user.schoolId}:dashboard:${courseModuleIds.length ? courseModuleIds.slice().sort((a, b) => a - b).join('-') : 'all'}:${req.user.role}:${req.user.id}`;
  const data = await cached(key, 45, async () => {
    const filters = ['g.school_id = ?'];
    const params = [req.user.schoolId];
    if (courseModuleIds.length) { filters.push('g.course_id IN (?)'); params.push(courseModuleIds); }
    if (learner.sql) { filters.push(learner.sql); params.push(...learner.params); }
    const filter = `WHERE ${filters.join(' AND ')}`;
    const [[stats]] = await pool.query(`
      SELECT COUNT(DISTINCT g.student_id) students, ROUND(AVG(g.score), 1) average,
        COUNT(DISTINCT g.assessment) assessments,
        ROUND(SUM(g.score >= 4) / COUNT(*) * 100) approval_rate
      FROM grades g ${filter}
    `, params);
    if (['director', 'manager', 'monitor', 'school_admin', 'super_admin', 'utp'].includes(req.user.role) && !courseModuleIds.length) {
      const [[organization]] = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM students WHERE school_id = ? AND active = TRUE) active_students,
          (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'teacher' AND active = TRUE) active_teachers,
          (SELECT COUNT(*) FROM employees WHERE school_id = ? AND active = TRUE) active_employees,
          (SELECT COUNT(*) FROM courses WHERE school_id = ?) active_courses
      `, [req.user.schoolId, req.user.schoolId, req.user.schoolId, req.user.schoolId]);
      Object.assign(stats, organization);
    }
    const [distribution] = await pool.query(`
      SELECT CASE
        WHEN g.score < 4 THEN 'Insuficiente'
        WHEN g.score < 5 THEN 'Elemental'
        WHEN g.score < 6 THEN 'Adecuado'
        ELSE 'Destacado' END label, COUNT(*) value
      FROM grades g ${filter} GROUP BY label ORDER BY MIN(g.score)
    `, params);
    const [recent] = await pool.query(`
      SELECT g.id, g.assessment, g.score, g.max_score, g.graded_at,
        s.id student_id, CONCAT(s.first_name, ' ', s.last_name) student, s.avatar_color,
        c.subject, c.name, c.section
      FROM grades g JOIN students s ON s.id = g.student_id JOIN courses c ON c.id = g.course_id
      ${filter} ORDER BY g.updated_at DESC, g.id DESC LIMIT 5
    `, params);
    return { stats, distribution, recent };
  });
  const courseScope = learnerCourseScope(req.user);
  const visibleParams = [req.user.schoolId, ...courseScope.params];
  let visibleSql = `SELECT c.id FROM courses c WHERE c.school_id = ? ${courseScope.sql ? 'AND ' + courseScope.sql : ''}`;
  if (courseModuleIds.length) {
    visibleSql += ' AND c.id IN (?)';
    visibleParams.push(courseModuleIds);
  }
  const [visibleCourses] = await pool.query(visibleSql, visibleParams);
  const visibleIds = visibleCourses.map(course => course.id);
  const [attention, charts] = await Promise.all([
    dashboardAttention(req.user, visibleIds),
    dashboardCharts(req.user, visibleIds),
  ]);
  res.json({ ...data, attention, charts });
});

app.get('/api/students', async (req, res) => {
  const courseId = Number(req.query.courseId || 0);
  const search = String(req.query.q ?? req.query.search ?? '').trim();
  if (search.length > 150) return res.status(400).json({ message: 'La búsqueda es demasiado larga.' });
  const status = String(req.query.status || 'active');
  const showAllStatuses = status === 'all' && Boolean(req.user.permissions?.manageUsers);
  const conditions = ['s.school_id = ?'];
  const params = [req.user.schoolId];
  if (!showAllStatuses && !(req.user.role === 'student' || req.user.readOnly)) conditions.push('s.active = TRUE');
  let courseModuleIds = [];
  if (courseId) {
    const [[course]] = await pool.query('SELECT name, section, academic_year_id FROM courses WHERE id = ? AND school_id = ?', [courseId, req.user.schoolId]);
    if (!course) return res.json([]);
    const [modules] = await pool.query(`
      SELECT id FROM courses
      WHERE school_id = ? AND name = ? AND section = ? AND (academic_year_id <=> ?)
    `, [req.user.schoolId, course.name, course.section, course.academic_year_id]);
    courseModuleIds = modules.map((module) => Number(module.id)).filter((id) => id > 0);
    if (!courseModuleIds.length) courseModuleIds = [courseId];
  }
  const gradeScope = req.user.role === 'teacher'
    ? ` AND g.course_id IN (${teacherOwnedCourseIdsSql()})`
    : '';
  const gradeParams = req.user.role === 'teacher' ? teacherOwnedCourseIdsParams(req.user) : [];
  if (req.user.role === 'student') { conditions.push('s.user_id = ?'); params.push(req.user.id); }
  if (req.user.role === 'guardian') { conditions.push('EXISTS (SELECT 1 FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id WHERE sg.student_id = s.id AND gu.user_id = ?)'); params.push(req.user.id); }
  if (req.user.role === 'teacher') {
    conditions.push(courseId
      ? `EXISTS (SELECT 1 FROM courses tc WHERE tc.id = e.course_id AND tc.school_id = s.school_id AND ${teacherCourseMatchSql('tc')})`
      : `EXISTS (SELECT 1 FROM enrollments te JOIN courses tc ON tc.id = te.course_id WHERE te.student_id = s.id AND tc.school_id = s.school_id AND ${teacherCourseMatchSql('tc')})`);
    params.push(...teacherCourseMatchParams(req.user));
  }
  if (courseId) { conditions.push("e.course_id IN (?) AND e.status = 'active'"); params.push(courseModuleIds); }
  if (search) { conditions.push("CONCAT(s.first_name, ' ', s.last_name) LIKE ?"); params.push(`%${search}%`); }
  const rows = await listQuery(pool, `
    SELECT s.id, s.first_name, s.last_name, s.email, s.avatar_color, s.avatar_key, s.active,
      ROUND(AVG(g.score), 1) average, COUNT(DISTINCT g.id) grade_count,
      ROUND(SUM(g.score >= 4) / NULLIF(COUNT(g.id), 0) * 100) approval_rate,
      (
        SELECT GROUP_CONCAT(DISTINCT CONCAT(c2.name, ' ', c2.section) ORDER BY c2.name, c2.section SEPARATOR ' · ')
        FROM enrollments e2
        JOIN courses c2 ON c2.id = e2.course_id AND c2.school_id = s.school_id
        WHERE e2.student_id = s.id AND e2.status = 'active'
      ) AS courses,
      (
        SELECT COUNT(DISTINCT CONCAT(c3.name, '\\0', c3.section, '\\0', COALESCE(c3.academic_year_id, 0)))
        FROM enrollments e3
        JOIN courses c3 ON c3.id = e3.course_id AND c3.school_id = s.school_id
        WHERE e3.student_id = s.id AND e3.status = 'active'
      ) AS course_count
    FROM students s
    LEFT JOIN enrollments e ON e.student_id = s.id
    LEFT JOIN grades g ON g.student_id = s.id ${courseId ? 'AND g.course_id = e.course_id' : ''}${gradeScope}
    WHERE ${conditions.join(' AND ')}
    GROUP BY s.id ORDER BY s.last_name, s.first_name
  `, [...gradeParams, ...params], req.query, { lastName: 's.last_name', firstName: 's.first_name', id: 's.id' });
  res.json(rows);
});

app.get('/api/students/:id', async (req, res) => {
  const studentId = Number(req.params.id);
  if (!Number.isInteger(studentId) || studentId < 1) return res.status(400).json({ message: 'Estudiante inválido.' });
  if (!(await canAccessStudent(req.user, studentId))) return res.status(403).json({ message: 'No tienes acceso a este estudiante.' });
  const teacherGradeJoin = req.user.role === 'teacher'
    ? `AND g.course_id IN (${teacherOwnedCourseIdsSql()})`
    : '';
  const teacherParams = req.user.role === 'teacher' ? teacherOwnedCourseIdsParams(req.user) : [];
  const [students] = await pool.query(`
    SELECT s.id, s.first_name, s.last_name, s.email, s.national_id, s.identifier_type, s.avatar_color, s.avatar_key, s.active,
      s.user_id AS userId, MAX(u.active) AS platformAccess, s.created_at,
      LEAST(YEAR(s.created_at), COALESCE(MIN(YEAR(g.graded_at)), YEAR(s.created_at))) admission_year,
      ROUND(AVG(g.score), 1) average, COUNT(g.id) grade_count,
      ROUND(SUM(g.score >= 4) / NULLIF(COUNT(g.id), 0) * 100) approval_rate
    FROM students s
    LEFT JOIN users u ON u.id = s.user_id AND u.school_id = s.school_id
    LEFT JOIN grades g ON g.student_id = s.id ${teacherGradeJoin}
    WHERE s.id = ? AND s.school_id = ? ${req.user.permissions?.manageUsers || req.user.readOnly || ['student', 'guardian'].includes(req.user.role) ? '' : 'AND s.active = TRUE'} GROUP BY s.id
  `, [...teacherParams, studentId, req.user.schoolId]);
  if (!students.length) return res.status(404).json({ message: 'Estudiante no encontrado.' });
  if (req.user.permissions?.manageGrades || req.user.permissions?.manageUsers || req.user.role === 'teacher') {
    const [seedClasses] = await pool.query(`
      SELECT DISTINCT c.id, c.name, c.section, c.campus_id AS campusId, c.academic_year_id AS academicYearId,
        c.teacher, c.monthly_fee AS monthlyFee
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ? AND e.school_id = ? AND e.status IN ('active', 'exempt')
        ${req.user.role === 'teacher' ? `AND ${teacherCourseMatchSql('c')}` : ''}
    `, [studentId, req.user.schoolId, ...(req.user.role === 'teacher' ? teacherCourseMatchParams(req.user) : [])]);
    const seen = new Set();
    for (const row of seedClasses) {
      const key = `${row.name}|${row.section}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await ensureCourseLevelModules({
        models,
        sequelize,
        schoolId: req.user.schoolId,
        course: row,
        createdBy: req.user.id,
      });
    }
  }
  const [grades] = await pool.query(`
    SELECT g.id, g.assessment, g.score, g.max_score, g.weight, g.graded_at, g.feedback,
      c.subject, CONCAT(c.name, ' ', c.section) course, c.color,
      CAST(YEAR(g.graded_at) AS CHAR) academic_year
    FROM grades g JOIN courses c ON c.id = g.course_id
    WHERE g.student_id = ? AND g.school_id = ?
      ${req.user.role === 'teacher' ? `AND ${teacherCourseMatchSql('c')}` : ''}
    ORDER BY g.graded_at DESC, c.subject
  `, [studentId, req.user.schoolId, ...(req.user.role === 'teacher' ? teacherCourseMatchParams(req.user) : [])]);
  const [enrollments] = await pool.query(`
    SELECT e.id, e.status, e.created_at AS enrolledAt, e.updated_at AS updatedAt,
      c.id AS courseId, c.name, c.section, c.subject, c.color, c.teacher,
      c.head_teacher AS headTeacher, c.academic_year_id AS academicYearId,
      COALESCE(NULLIF(TRIM(ay.name), ''), CAST(YEAR(COALESCE(e.created_at, CURRENT_DATE)) AS CHAR)) AS academicYear
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id AND c.school_id = e.school_id
    LEFT JOIN academic_years ay ON ay.id = c.academic_year_id AND ay.school_id = c.school_id
    WHERE e.student_id = ? AND e.school_id = ?
      ${req.user.role === 'teacher' ? `AND ${teacherCourseMatchSql('c')}` : ''}
    ORDER BY academicYear DESC, c.name, c.section, c.subject
  `, [studentId, req.user.schoolId, ...(req.user.role === 'teacher' ? teacherCourseMatchParams(req.user) : [])]);
  const [guardians] = await pool.query(`
    SELECT g.id, g.full_name, g.email, g.phone, g.national_id, sg.relationship
    FROM student_guardians sg
    JOIN guardians g ON g.id = sg.guardian_id
    WHERE sg.student_id = ? AND g.school_id = ?
    ORDER BY g.full_name
  `, [studentId, req.user.schoolId]);
  let attendanceByYear = [];
  try {
    const [attendanceByYearRows] = await pool.query(`
      SELECT YEAR(attended_on) AS academicYear,
        COUNT(*) AS total,
        SUM(status = 'present') AS present,
        SUM(status = 'late') AS late,
        SUM(status = 'absent') AS absent
      FROM attendance
      WHERE student_id = ? AND school_id = ?
      GROUP BY academicYear
    `, [studentId, req.user.schoolId]);
    attendanceByYear = attendanceByYearRows
      .map((row) => {
        const total = Number(row.total) || 0;
        const present = Number(row.present) || 0;
        const late = Number(row.late) || 0;
        const absent = Number(row.absent) || 0;
        const attended = present + late;
        return {
          academicYear: String(row.academicYear),
          total,
          present,
          late,
          absent,
          percentage: total ? Math.round((attended / total) * 1000) / 10 : null,
        };
      })
      .sort((a, b) => Number(b.academicYear) - Number(a.academicYear));
  } catch {
    attendanceByYear = [];
  }
  // Keep a flat shape compatible with existing ficha UI (id/name/section/subject/color/status).
  const enrollmentRows = enrollments.map((row) => ({
    id: row.courseId,
    courseId: row.courseId,
    name: row.name,
    section: row.section,
    subject: row.subject,
    color: row.color,
    teacher: row.teacher,
    headTeacher: row.headTeacher,
    status: row.status,
    academicYear: String(row.academicYear || ''),
    academicYearId: row.academicYearId,
    enrolledAt: row.enrolledAt,
    updatedAt: row.updatedAt,
  }));
  const observationKinds = ['guardian', 'student'].includes(req.user.role)
    ? ['positive', 'negative']
    : ['positive', 'negative', 'general'];
  const observations = await models.Observation.findAll({
    where: {
      schoolId: req.user.schoolId,
      studentId,
      kind: { [Op.in]: observationKinds },
    },
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    attributes: ['id', 'kind', 'detail', 'created_at', 'createdBy', 'courseId', 'attachmentName', 'attachmentKey'],
    raw: true,
  });
  const observationCourseIds = [...new Set(observations.map((row) => row.courseId || row.course_id).filter(Boolean))];
  const observationCourses = observationCourseIds.length
    ? await models.Course.findAll({
      where: { schoolId: req.user.schoolId, id: { [Op.in]: observationCourseIds } },
      attributes: ['id', 'name', 'section', 'subject'],
      raw: true,
    })
    : [];
  const observationCourseById = new Map(observationCourses.map((course) => [course.id, course]));
  const observationAuthorIds = [...new Set(observations.map((row) => row.createdBy || row.created_by).filter(Boolean))];
  const observationAuthors = observationAuthorIds.length
    ? await models.User.findAll({
      where: { schoolId: req.user.schoolId, id: { [Op.in]: observationAuthorIds } },
      attributes: ['id', 'fullName', 'username'],
      raw: true,
    })
    : [];
  const observationAuthorById = new Map(
    observationAuthors.map((user) => [user.id, user.fullName || user.username || `Usuario #${user.id}`]),
  );
  const [gradeCourses] = await pool.query(`
    SELECT DISTINCT module.id
    FROM enrollments active
      JOIN courses enrolled ON enrolled.id = active.course_id
      JOIN courses module ON module.school_id = enrolled.school_id
        AND module.name = enrolled.name
        AND module.section = enrolled.section
        AND (module.academic_year_id <=> enrolled.academic_year_id)
      LEFT JOIN enrollments exact ON exact.school_id = active.school_id
        AND exact.student_id = active.student_id
        AND exact.course_id = module.id
    WHERE active.student_id = ? AND active.school_id = ? AND active.status = 'active'
      AND COALESCE(exact.status, 'active') = 'active'
      ${req.user.role === 'teacher' ? `AND ${teacherCourseMatchSql('module')}` : ''}
  `, [studentId, req.user.schoolId, ...(req.user.role === 'teacher' ? teacherCourseMatchParams(req.user) : [])]);
  const yearGroups = new Map();
  for (const grade of grades) {
    const year = String(grade.academic_year);
    const group = yearGroups.get(year) || { year, grade_count: 0, score_total: 0, approved: 0 };
    group.grade_count += 1;
    group.score_total += Number(grade.score);
    if (Number(grade.score) >= 4) group.approved += 1;
    yearGroups.set(year, group);
  }
  for (const row of enrollmentRows) {
    if (!row.academicYear) continue;
    if (!yearGroups.has(row.academicYear)) {
      yearGroups.set(row.academicYear, { year: row.academicYear, grade_count: 0, score_total: 0, approved: 0 });
    }
  }
  for (const row of attendanceByYear) {
    if (!yearGroups.has(row.academicYear)) {
      yearGroups.set(row.academicYear, { year: row.academicYear, grade_count: 0, score_total: 0, approved: 0 });
    }
  }
  const currentCalendarYear = new Date().getFullYear();
  const admissionYear = Number(students[0].admission_year);
  const firstYear = Number.isInteger(admissionYear) && admissionYear >= 1900 && admissionYear <= currentCalendarYear
    ? admissionYear
    : currentCalendarYear;
  for (let year = currentCalendarYear; year >= firstYear; year -= 1) {
    const key = String(year);
    if (!yearGroups.has(key)) yearGroups.set(key, { year: key, grade_count: 0, score_total: 0, approved: 0 });
  }
  const years = [...yearGroups.values()].map((group) => {
    const attendance = attendanceByYear.find((row) => row.academicYear === String(group.year));
    const yearEnrollments = enrollmentRows.filter((row) => row.academicYear === String(group.year));
    const classKeys = new Set(yearEnrollments.map((row) => `${row.name}|${row.section}`));
    return {
      year: group.year,
      grade_count: group.grade_count,
      average: group.grade_count ? Number((group.score_total / group.grade_count).toFixed(1)) : null,
      approval_rate: group.grade_count ? Math.round((group.approved / group.grade_count) * 100) : null,
      enrollment_count: yearEnrollments.length,
      class_count: classKeys.size,
      attendance_percentage: attendance?.percentage ?? null,
      isCurrent: String(group.year) === String(currentCalendarYear),
    };
  }).sort((a, b) => Number(b.year) - Number(a.year) || String(b.year).localeCompare(String(a.year), 'es'));
  const [[attendanceSummary]] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'present') AS present,
      SUM(status = 'late') AS late,
      SUM(status = 'absent') AS absent
    FROM attendance
    WHERE student_id = ? AND school_id = ?
  `, [studentId, req.user.schoolId]);
  const attendanceTotal = Number(attendanceSummary?.total || 0);
  const attendancePresent = Number(attendanceSummary?.present || 0) + Number(attendanceSummary?.late || 0);
  let annualResults = [];
  try {
    const [rows] = await pool.query(`
      SELECT ar.id, ar.course_name AS courseName, ar.section, ar.annual_average AS annualAverage,
        ar.attendance_percentage AS attendancePercentage, ar.final_status AS finalStatus,
        ar.finalized_at AS finalizedAt, ay.name AS academicYear
      FROM annual_results ar
      JOIN academic_years ay ON ay.id = ar.academic_year_id AND ay.school_id = ar.school_id
      WHERE ar.student_id = ? AND ar.school_id = ?
      ORDER BY ay.name DESC, ar.id DESC
    `, [studentId, req.user.schoolId]);
    annualResults = rows;
  } catch {
    annualResults = [];
  }
  const mappedObservations = observations.map((row) => {
    const courseId = row.courseId || row.course_id || null;
    const course = courseId ? observationCourseById.get(Number(courseId)) : null;
    const createdAt = row.createdAt || row.created_at;
    const createdBy = row.createdBy || row.created_by || null;
    return {
      id: row.id,
      kind: row.kind,
      detail: row.detail,
      courseId,
      courseName: course ? `${course.name} ${course.section} · ${course.subject}` : null,
      createdAt,
      createdBy,
      createdByName: createdBy ? (observationAuthorById.get(Number(createdBy)) || 'Usuario del colegio') : 'Usuario del colegio',
      academicYear: createdAt ? String(new Date(createdAt).getFullYear()) : null,
      attachmentName: row.attachmentName || row.attachment_name || null,
      hasAttachment: Boolean(row.attachmentKey || row.attachment_key),
    };
  });
  res.json({
    student: {
      ...students[0],
      userId: students[0].userId ? Number(students[0].userId) : null,
      platformAccess: students[0].platformAccess == null ? null : Boolean(students[0].platformAccess),
    },
    grades,
    gradeGroups: { all: gradeGroups(grades), ...Object.fromEntries(years.map(({ year }) => [year, gradeGroups(grades.filter(grade => String(grade.academic_year) === year))])) },
    years,
    annualResults,
    attendanceByYear,
    currentAcademicYear: String(currentCalendarYear),
    courseIds: gradeCourses.map((row) => row.id),
    enrollments: enrollmentRows,
    guardians,
    attendance: {
      total: attendanceTotal,
      present: Number(attendanceSummary?.present || 0),
      late: Number(attendanceSummary?.late || 0),
      absent: Number(attendanceSummary?.absent || 0),
      percentage: attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 1000) / 10 : null,
    },
    observations: mappedObservations,
  });
});

app.get('/api/classbook/observations/:id/download', async (req, res) => {
  const observationId = Number(req.params.id);
  if (!Number.isInteger(observationId) || observationId < 1) return res.status(400).json({ message: 'Anotación inválida.' });
  const observation = await models.Observation.findOne({ where: { id: observationId, schoolId: req.user.schoolId } });
  if (!observation?.attachmentKey) return res.status(404).json({ message: 'Esta anotación no tiene archivo adjunto.' });
  if (['guardian', 'student'].includes(req.user.role) && !['positive', 'negative'].includes(observation.kind)) {
    return res.status(403).json({ message: 'No tienes acceso a este archivo.' });
  }
  if (!(await canAccessStudent(req.user, observation.studentId))) {
    return res.status(403).json({ message: 'No tienes acceso a este estudiante.' });
  }
  let filename;
  try {
    filename = safeUploadPath(observation.attachmentKey);
  } catch {
    return res.status(404).json({ message: 'Archivo adjunto no disponible.' });
  }
  try {
    await fs.access(filename);
  } catch {
    return res.status(404).json({ message: 'Archivo adjunto no disponible.' });
  }
  return res.download(filename, observation.attachmentName || 'anotacion');
});

app.get('/api/grades', async (req, res) => {
  const courseId = Number(req.query.courseId || 0);
  const params = [req.user.schoolId];
  const conditions = ['g.school_id = ?'];
  if (courseId) { conditions.push('g.course_id = ?'); params.push(courseId); }
  const learner = learnerGradeScope(req.user);
  if (learner.sql) { conditions.push(learner.sql); params.push(...learner.params); }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const rows = await listQuery(pool, `
    SELECT g.*, CONCAT(s.first_name, ' ', s.last_name) student, s.avatar_color,
      c.subject, CONCAT(c.name, ' ', c.section) course
    FROM grades g JOIN students s ON s.id = g.student_id JOIN courses c ON c.id = g.course_id
    ${where} ORDER BY g.graded_at DESC, s.last_name
  `, params, req.query, { gradedAt: 'g.graded_at', id: 'g.id', score: 'g.score' });
  res.json(rows);
});

app.post('/api/grades', requireGradeAccess, async (req, res) => {
  const result = await createGrade(req.user, req.body);
  await clearDashboardCache();
  res.status(201).json({ ...result, message: 'Calificación guardada.' });
});

app.put('/api/grades/:id', requireGradeAccess, async (req, res) => {
  const { score, assessment, weight, feedback = null } = req.body;
  const gradeId = Number(req.params.id);
  const normalizedScore = Number(score);
  const normalizedWeight = Number(weight);
  const normalizedAssessment = String(assessment || '').trim();
  if (!Number.isInteger(gradeId) || gradeId < 1 || !normalizedAssessment || normalizedAssessment.length > 120
    || !Number.isFinite(normalizedScore) || normalizedScore < 1 || normalizedScore > 7
    || !Number.isFinite(normalizedWeight) || normalizedWeight < 1 || normalizedWeight > 100
    || (feedback != null && String(feedback).length > 500)) return res.status(400).json({ message: 'Calificación inválida.' });
  const teacherScope = req.user.role === 'teacher'
    ? ` AND course_id IN (${teacherSubjectCourseIdsSql()})`
    : '';
  const teacherParams = req.user.role === 'teacher' ? teacherSubjectCourseIdsParams(req.user) : [];
  const [[existingGrade]] = await pool.query(
    'SELECT id, student_id FROM grades WHERE id = ? AND school_id = ? LIMIT 1',
    [gradeId, req.user.schoolId],
  );
  const [result] = await pool.query(`UPDATE grades SET score = ?, assessment = ?, weight = ?, feedback = ? WHERE id = ? AND school_id = ?${teacherScope}`, [normalizedScore, normalizedAssessment, normalizedWeight, feedback, gradeId, req.user.schoolId, ...teacherParams]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Calificación no encontrada.' });
  if (existingGrade?.student_id) {
    const studentId = Number(existingGrade.student_id);
    const [recipients] = await pool.query(`
      SELECT DISTINCT recipient.user_id FROM (
        SELECT user_id FROM students WHERE id = ? AND school_id = ? AND user_id IS NOT NULL
        UNION
        SELECT gu.user_id FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id
          WHERE sg.student_id = ? AND gu.school_id = ? AND gu.user_id IS NOT NULL
      ) recipient
    `, [studentId, req.user.schoolId, studentId, req.user.schoolId]);
    await Promise.all(recipients.map((recipient) => pool.query(`
      INSERT INTO user_notifications (school_id, created_by, user_id, student_id, grade_id, subject, body, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [req.user.schoolId, req.user.id, recipient.user_id, studentId, gradeId, 'Calificación actualizada', `${normalizedAssessment}: ${normalizedScore}`]))).catch(() => null);
  }
  await clearDashboardCache();
  res.json({ message: 'Calificación actualizada.' });
});

app.delete('/api/grades/:id', requireGradeAccess, async (req, res) => {
  const gradeId = Number(req.params.id);
  if (!Number.isInteger(gradeId) || gradeId < 1) return res.status(400).json({ message: 'Calificación inválida.' });
  const teacherScope = req.user.role === 'teacher'
    ? ` AND course_id IN (${teacherSubjectCourseIdsSql()})`
    : '';
  const teacherParams = req.user.role === 'teacher' ? teacherSubjectCourseIdsParams(req.user) : [];
  const [result] = await pool.query(`DELETE FROM grades WHERE id = ? AND school_id = ?${teacherScope}`, [gradeId, req.user.schoolId, ...teacherParams]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Calificación no encontrada.' });
  await clearDashboardCache();
  res.status(204).end();
});

app.use('/api', (_req, res) => res.status(404).json({ message: 'Recurso no encontrado.' }));
app.use(async (error, req, _res, next) => {
  if (req.tenant?.id && /Sequelize(?:Connection|HostNotFound|HostNotReachable|ConnectionRefused|ConnectionTimedOut)Error/.test(error.name || '')) await markTenantDatabaseOffline(req.tenant.id, error).catch(() => {});
  next(error);
});
app.use(apiErrorHandler);

let mailWorker = null;
let stopWhatsApp = null;
let backupScheduler = null;
let demoResetScheduler = null;
let sigeWorker = null;
let servers = [];
initializeDatabase()
  .then(async () => {
    const uploadMigration = await migrateUploadLayout().catch((error) => {
      console.warn('No se pudo reorganizar uploads:', error.message);
      return null;
    });
    if (uploadMigration?.moved) console.log(`Uploads reorganizados: ${uploadMigration.moved} archivo(s) → avatars/ y files/.`);
    mailWorker = redis.isReady && process.env.MAIL_JOBS_ENABLED !== 'false' ? await startMailWorker().catch(error => { console.warn('Mail worker unavailable:', error.message); return null; }) : null;
    backupScheduler = redis.isReady
      ? await startBackupScheduler().catch((error) => { console.warn('Respaldos automáticos deshabilitados:', error.message); return null; })
      : null;
    demoResetScheduler = redis.isReady
      ? await startDemoResetScheduler().catch((error) => { console.warn('Demo reset automático deshabilitado:', error.message); return null; })
      : null;
    sigeWorker = redis.isReady
      ? await startSigeWorker().catch(error => { console.warn('SIGE worker unavailable:', error.message); return null; })
      : null;
    servers = await startListeners(app);
    stopWhatsApp = startWhatsAppWorker();
    // Seed demo after the API is listening so deploys don't return 502 while npm/seed run.
    if (process.env.DEMO_RESET_ENABLED !== 'false') {
      const { ensureDemoSchoolsInstalled } = await import('./services/demo-reset.js');
      ensureDemoSchoolsInstalled({ source: 'startup' }).catch((error) => {
        console.warn('No se pudieron instalar colegios demo al arranque:', error.message);
      });
    }
  })
  .catch((error) => { console.error('No fue posible iniciar la API:', error); process.exit(1); });

async function shutdown() {
  for (const server of servers) server.close();
  if (stopWhatsApp) await stopWhatsApp();
  await stopMailWorker(mailWorker);
  await stopBackupScheduler(backupScheduler);
  await stopDemoResetScheduler(demoResetScheduler);
  await stopSigeWorker(sigeWorker);
  if (redis.isOpen) await redis.quit();
  await pool.end();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
