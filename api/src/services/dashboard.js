import { pool } from '../database.js';

function learnerStudentFilter(user) {
  if (user.role === 'student') {
    return { sql: 's.user_id = ?', params: [user.id] };
  }
  if (user.role === 'guardian') {
    return {
      sql: 'EXISTS (SELECT 1 FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id WHERE sg.student_id = s.id AND gu.school_id = s.school_id AND gu.user_id = ?)',
      params: [user.id],
    };
  }
  return { sql: '', params: [] };
}

async function familyDashboardAttention(user, courseIds) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const scope = courseIds.length ? courseIds : [0];
  const learner = learnerStudentFilter(user);
  const isGuardian = user.role === 'guardian';
  const studentNoun = isGuardian ? 'estudiantes a tu cargo' : 'tu ficha';

  const [students] = await pool.query(`
    SELECT s.id AS studentId,
      CONCAT(s.first_name, ' ', s.last_name) AS student,
      s.avatar_color AS avatarColor,
      (
        SELECT CONCAT(c.name, ' ', c.section)
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id AND c.school_id = e.school_id
        WHERE e.school_id = s.school_id AND e.student_id = s.id AND e.status <> 'withdrawn'
        ORDER BY c.name, c.section
        LIMIT 1
      ) AS course,
      (
        SELECT ROUND(AVG(g.score), 1)
        FROM grades g
        WHERE g.school_id = s.school_id AND g.student_id = s.id AND g.course_id IN (?)
      ) AS average,
      (
        SELECT COUNT(*)
        FROM grades g
        WHERE g.school_id = s.school_id AND g.student_id = s.id AND g.course_id IN (?)
      ) AS gradeCount
    FROM students s
    WHERE s.school_id = ? AND s.active = TRUE ${learner.sql ? `AND ${learner.sql}` : ''}
    ORDER BY s.last_name, s.first_name, s.id
  `, [scope, scope, user.schoolId, ...learner.params]);

  const [recentGrades] = await pool.query(`
    SELECT g.id,
      s.id AS studentId,
      CONCAT(s.first_name, ' ', s.last_name) AS student,
      CONCAT(c.name, ' ', c.section, ' · ', c.subject) AS course,
      g.assessment,
      g.score,
      g.graded_at AS date
    FROM grades g
    JOIN students s ON s.id = g.student_id AND s.school_id = g.school_id
    JOIN courses c ON c.id = g.course_id AND c.school_id = g.school_id
    WHERE g.school_id = ? AND g.course_id IN (?) AND s.active = TRUE ${learner.sql ? `AND ${learner.sql}` : ''}
    ORDER BY g.graded_at DESC, g.id DESC
    LIMIT 20
  `, [user.schoolId, scope, ...learner.params]);

  const [attendance] = await pool.query(`
    SELECT a.id,
      s.id AS studentId,
      CONCAT(s.first_name, ' ', s.last_name) AS student,
      CONCAT(c.name, ' ', c.section, ' · ', c.subject) AS course,
      a.status,
      a.attended_on AS date
    FROM attendance a
    JOIN students s ON s.id = a.student_id AND s.school_id = a.school_id
    JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
    WHERE a.school_id = ?
      AND a.course_id IN (?)
      AND s.active = TRUE
      AND a.status IN ('absent', 'late')
      AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
      ${learner.sql ? `AND ${learner.sql}` : ''}
    ORDER BY a.attended_on DESC, a.id DESC
    LIMIT 50
  `, [user.schoolId, scope, today, ...learner.params]);

  const [lowGrades] = await pool.query(`
    SELECT g.id,
      s.id AS studentId,
      CONCAT(s.first_name, ' ', s.last_name) AS student,
      CONCAT(c.name, ' ', c.section, ' · ', c.subject) AS course,
      g.assessment,
      g.score,
      g.graded_at AS date
    FROM grades g
    JOIN students s ON s.id = g.student_id AND s.school_id = g.school_id
    JOIN courses c ON c.id = g.course_id AND c.school_id = g.school_id
    WHERE g.school_id = ? AND g.course_id IN (?) AND s.active = TRUE AND g.score < 4
      ${learner.sql ? `AND ${learner.sql}` : ''}
    ORDER BY g.score ASC, g.graded_at DESC, g.id DESC
    LIMIT 30
  `, [user.schoolId, scope, ...learner.params]);

  const studentRows = students.map((row) => ({
    ...row,
    average: row.average == null ? '—' : Number(row.average),
    gradeCount: Number(row.gradeCount || 0),
    course: row.course || 'Sin curso',
  }));

  const items = [
      {
        key: 'my-students',
        label: isGuardian ? 'Estudiantes a tu cargo' : 'Tu ficha',
        definition: isGuardian
          ? 'Estudiantes vinculados a tu cuenta de apoderado, con su curso y promedio de las notas visibles.'
          : 'Resumen de tu matrícula y promedio de notas.',
        count: studentRows.length,
        rows: studentRows,
        columns: [
          { key: 'student', label: 'Estudiante' },
          { key: 'course', label: 'Curso' },
          { key: 'average', label: 'Promedio' },
          { key: 'gradeCount', label: 'Notas' },
        ],
      },
      {
        key: 'recent-grades',
        label: 'Notas recientes',
        definition: `Últimas calificaciones de ${studentNoun}. Abre un estudiante para ver el detalle completo.`,
        count: recentGrades.length,
        rows: recentGrades,
        columns: [
          ...(isGuardian ? [{ key: 'student', label: 'Estudiante' }] : []),
          { key: 'course', label: 'Asignatura' },
          { key: 'assessment', label: 'Evaluación' },
          { key: 'score', label: 'Nota' },
          { key: 'date', label: 'Fecha' },
        ],
      },
    ];
  if (isGuardian) {
    items.push({
      key: 'family-attendance',
      label: 'Ausencias y atrasos',
      definition: 'Inasistencias y atrasos de los últimos 30 días en los cursos visibles.',
      count: attendance.length,
      rows: attendance,
      columns: [
        { key: 'student', label: 'Estudiante' },
        { key: 'course', label: 'Asignatura' },
        { key: 'status', label: 'Estado' },
        { key: 'date', label: 'Fecha' },
      ],
    });
  }
  items.push({
    key: 'low-grades',
    label: 'Notas bajo 4,0',
    definition: isGuardian
      ? 'Calificaciones bajo 4,0 de tus estudiantes asociados. Sirve para seguir el rendimiento, no es un plan de apoyo del colegio.'
      : 'Tus calificaciones bajo 4,0. Sirve para seguir el rendimiento.',
    count: lowGrades.length,
    rows: lowGrades,
    columns: [
      ...(isGuardian ? [{ key: 'student', label: 'Estudiante' }] : []),
      { key: 'course', label: 'Asignatura' },
      { key: 'assessment', label: 'Evaluación' },
      { key: 'score', label: 'Nota' },
      { key: 'date', label: 'Fecha' },
    ],
  });
  return { today, items };
}

// Counts and drill-down rows share one result set and the same authorized course scope.
export async function dashboardAttention(user, courseIds) {
  if (['guardian', 'student'].includes(user.role)) {
    return familyDashboardAttention(user, courseIds);
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const scope = courseIds.length ? courseIds : [0];
  const [risk] = await pool.query(`SELECT g.id, s.id AS studentId, CONCAT(s.first_name, ' ', s.last_name) student,
    CONCAT(c.name, ' ', c.section, ' · ', c.subject) course, g.assessment, g.score, g.graded_at date
    FROM grades g JOIN students s ON s.id = g.student_id AND s.school_id = g.school_id
    JOIN courses c ON c.id = g.course_id AND c.school_id = g.school_id
    WHERE g.school_id = ? AND g.course_id IN (?) AND s.active = TRUE AND g.score < 4
    ORDER BY g.graded_at DESC, g.id DESC`, [user.schoolId, scope]);
  const riskByStudent = new Map();
  for (const grade of risk) {
    let student = riskByStudent.get(grade.studentId);
    if (!student) {
      student = { id: grade.studentId, studentId: grade.studentId, student: grade.student, courses: new Set(), gradeCount: 0, score: Number(grade.score), date: grade.date };
      riskByStudent.set(grade.studentId, student);
    }
    student.courses.add(grade.course);
    student.gradeCount++;
    student.score = Math.min(student.score, Number(grade.score));
  }
  const riskStudents = [...riskByStudent.values()].map(({ courses, ...student }) => {
    const list = [...courses].sort((a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base', numeric: true }));
    return {
      ...student,
      courses: list,
      course: list[0] || '',
      courseCount: list.length,
    };
  });
  const items = [{ key: 'academic-risk', label: 'Estudiantes que requieren apoyo', definition: 'Estudiantes activos con notas inferiores a 4,0 en tus asignaturas visibles. Cada estudiante aparece una sola vez; haz clic para abrir el registro de nota y elegir el curso.', count: riskStudents.length, rows: riskStudents,
    columns: [{ key: 'student', label: 'Estudiante' }, { key: 'course', label: 'Asignaturas' }, { key: 'gradeCount', label: 'Notas bajo 4,0' }, { key: 'score', label: 'Nota más baja' }, { key: 'date', label: 'Última nota bajo 4,0' }] }];
  const [attendance] = await pool.query(`SELECT a.id, CONCAT(s.first_name, ' ', s.last_name) student,
    CONCAT(c.name, ' ', c.section, ' · ', c.subject) course, a.status, a.attended_on date
    FROM attendance a JOIN students s ON s.id = a.student_id AND s.school_id = a.school_id
    JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
    WHERE a.school_id = ? AND a.course_id IN (?) AND a.attended_on = ? ORDER BY s.last_name, a.id`, [user.schoolId, scope, today]);
  items.push({ key: 'attendance-today', label: 'Asistencia registrada hoy', definition: `Registros por estudiante y asignatura del ${today}, según la hora de Chile. No representa porcentaje de cobertura.`, count: attendance.length, rows: attendance,
    columns: [{ key: 'student', label: 'Estudiante' }, { key: 'course', label: 'Curso y asignatura' }, { key: 'status', label: 'Estado' }] });
  if (user.permissions?.manageSchool) {
    const [unassigned] = await pool.query("SELECT id, name, section, CONCAT(name, ' ', section) course, subject, teacher FROM courses WHERE school_id = ? AND id IN (?) AND (teacher IS NULL OR TRIM(teacher) = '') ORDER BY name, section, subject", [user.schoolId, scope]);
    items.push({ key: 'unassigned', label: 'Asignaturas sin profesor', definition: 'Asignaturas visibles sin profesor asignado. Haz clic en una asignatura para abrirla o asignar profesor.', count: unassigned.length, rows: unassigned,
      columns: [{ key: 'course', label: 'Curso' }, { key: 'subject', label: 'Asignatura' }] });
  }
  if (user.permissions?.manageFinance) {
    const [overdue] = await pool.query("SELECT id, number, amount, due_on date FROM invoices WHERE school_id = ? AND status IN ('pending', 'overdue') AND due_on < ? ORDER BY due_on, id", [user.schoolId, today]);
    items.push({ key: 'overdue', label: 'Cobros vencidos', definition: 'Documentos pendientes o vencidos con vencimiento anterior a hoy. Incluye todos los años del colegio.', count: overdue.length, rows: overdue,
      columns: [{ key: 'number', label: 'Documento' }, { key: 'amount', label: 'Monto' }, { key: 'date', label: 'Vencimiento' }] });
  }
  return { today, items };
}

function seriesFromRows(rows) {
  const series = {};
  for (const row of rows) {
    const label = String(row.label || '').trim() || 'Sin curso';
    const value = Number(row.value);
    if (!Number.isFinite(value)) continue;
    series[label] = value;
  }
  return series;
}

function chileToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function limitSeries(series, max = 12) {
  const entries = Object.entries(series);
  if (entries.length <= max) return { series, truncated: false };
  return { series: Object.fromEntries(entries.slice(0, max)), truncated: true };
}

function isSchoolAdmin(user) {
  return Boolean(
    user.permissions?.manageSchool
    || ['director', 'manager', 'monitor', 'school_admin', 'super_admin', 'utp'].includes(user.role)
  );
}

async function coursesWhereHeadTeacher(user, courseIds) {
  const scope = courseIds.length ? courseIds : [0];
  const [rows] = await pool.query(`
    SELECT c.id
    FROM courses c
    WHERE c.school_id = ?
      AND c.id IN (?)
      AND (
        LOWER(TRIM(c.head_teacher)) = (
          SELECT LOWER(TRIM(u.full_name)) FROM users u WHERE u.id = ? LIMIT 1
        )
        OR FIND_IN_SET(
          (SELECT LOWER(TRIM(u.full_name)) FROM users u WHERE u.id = ? LIMIT 1),
          REPLACE(REPLACE(LOWER(TRIM(c.head_teacher)), ', ', ','), ' ,', ',')
        ) > 0
      )
  `, [user.schoolId, scope, user.id, user.id]);
  return rows.map((row) => Number(row.id)).filter(Boolean);
}

async function coursesWhereSubjectTeacher(user, courseIds) {
  const scope = courseIds.length ? courseIds : [0];
  const [rows] = await pool.query(`
    SELECT c.id
    FROM courses c
    WHERE c.school_id = ?
      AND c.id IN (?)
      AND (
        LOWER(TRIM(c.teacher)) = (
          SELECT LOWER(TRIM(u.full_name)) FROM users u WHERE u.id = ? LIMIT 1
        )
        OR FIND_IN_SET(
          (SELECT LOWER(TRIM(u.full_name)) FROM users u WHERE u.id = ? LIMIT 1),
          REPLACE(REPLACE(LOWER(TRIM(c.teacher)), ', ', ','), ' ,', ',')
        ) > 0
      )
  `, [user.schoolId, scope, user.id, user.id]);
  return rows.map((row) => Number(row.id)).filter(Boolean);
}

async function buildAbsenceAndStudentCharts(user, ids) {
  const today = chileToday();
  const [students] = await pool.query(`
    SELECT CONCAT(TRIM(c.name), ' ', TRIM(c.section)) AS label,
      COUNT(DISTINCT e.student_id) AS value
    FROM courses c
    LEFT JOIN enrollments e
      ON e.course_id = c.id
      AND e.school_id = c.school_id
      AND e.status = 'active'
    WHERE c.school_id = ? AND c.id IN (?)
    GROUP BY c.name, c.section
    HAVING COUNT(DISTINCT e.student_id) > 0
    ORDER BY value DESC, c.name, c.section
  `, [user.schoolId, ids]);

  const [absences] = await pool.query(`
    SELECT CONCAT(TRIM(c.name), ' ', TRIM(c.section)) AS label,
      COUNT(DISTINCT CONCAT(a.student_id, '-', DATE(a.attended_on))) AS value
    FROM attendance a
    JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
    WHERE a.school_id = ?
      AND a.course_id IN (?)
      AND a.status = 'absent'
      AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
    GROUP BY c.name, c.section
    HAVING COUNT(DISTINCT CONCAT(a.student_id, '-', DATE(a.attended_on))) > 0
    ORDER BY value DESC, c.name, c.section
  `, [user.schoolId, ids, today]);

  const [[totals]] = await pool.query(`
    SELECT
      (
        SELECT COUNT(DISTINCT e.student_id)
        FROM enrollments e
        WHERE e.school_id = ? AND e.status = 'active' AND e.course_id IN (?)
      ) AS uniqueStudents,
      (
        SELECT COUNT(DISTINCT CONCAT(a.student_id, '-', DATE(a.attended_on), '-', TRIM(c.name), '-', TRIM(c.section)))
        FROM attendance a
        JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
        WHERE a.school_id = ?
          AND a.course_id IN (?)
          AND a.status = 'absent'
          AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
      ) AS totalAbsences
  `, [user.schoolId, ids, user.schoolId, ids, today]);

  const studentsLimited = limitSeries(seriesFromRows(students));
  const absencesLimited = limitSeries(seriesFromRows(absences));

  return {
    absencesByCourse: absencesLimited.series,
    studentsByCourse: studentsLimited.series,
    summary: {
      totalAbsences: Number(totals?.totalAbsences) || 0,
      uniqueStudents: Number(totals?.uniqueStudents) || 0,
      truncated: studentsLimited.truncated || absencesLimited.truncated,
    },
  };
}

async function buildGradeAndAttendanceCharts(user, gradeIds, attendanceIds, { isHeadTeacher = false } = {}) {
  const today = chileToday();
  let gradesBySubject = {};
  let averageGrade = null;
  let gradeCount = 0;
  let gradesTruncated = false;

  if (gradeIds.length) {
    const [grades] = await pool.query(`
      SELECT CONCAT(TRIM(c.subject), ' · ', TRIM(c.name), ' ', TRIM(c.section)) AS label,
        ROUND(AVG(g.score), 1) AS value
      FROM grades g
      JOIN courses c ON c.id = g.course_id AND c.school_id = g.school_id
      WHERE g.school_id = ? AND g.course_id IN (?)
      GROUP BY c.id, c.subject, c.name, c.section
      ORDER BY AVG(g.score) ASC, c.subject, c.name, c.section
    `, [user.schoolId, gradeIds]);
    const limited = limitSeries(seriesFromRows(grades));
    gradesBySubject = limited.series;
    gradesTruncated = limited.truncated;

    const [[stats]] = await pool.query(`
      SELECT ROUND(AVG(g.score), 1) AS average, COUNT(*) AS gradeCount
      FROM grades g
      WHERE g.school_id = ? AND g.course_id IN (?)
    `, [user.schoolId, gradeIds]);
    averageGrade = stats?.average == null ? null : Number(stats.average);
    gradeCount = Number(stats?.gradeCount) || 0;
  }

  let attendanceByCourse = {};
  let averageAttendance = null;
  let attendanceRecords = 0;
  let attendanceTruncated = false;

  if (attendanceIds.length) {
    const [attendance] = await pool.query(`
      SELECT CONCAT(TRIM(c.name), ' ', TRIM(c.section)) AS label,
        ROUND(SUM(a.status IN ('present', 'late')) / COUNT(*) * 100) AS value
      FROM attendance a
      JOIN courses c ON c.id = a.course_id AND c.school_id = a.school_id
      WHERE a.school_id = ?
        AND a.course_id IN (?)
        AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
      GROUP BY c.name, c.section
      HAVING COUNT(*) > 0
      ORDER BY value ASC, c.name, c.section
    `, [user.schoolId, attendanceIds, today]);
    const limited = limitSeries(seriesFromRows(attendance));
    attendanceByCourse = limited.series;
    attendanceTruncated = limited.truncated;

    const [[stats]] = await pool.query(`
      SELECT
        ROUND(SUM(a.status IN ('present', 'late')) / COUNT(*) * 100) AS average,
        COUNT(*) AS records
      FROM attendance a
      WHERE a.school_id = ?
        AND a.course_id IN (?)
        AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
    `, [user.schoolId, attendanceIds, today]);
    averageAttendance = stats?.average == null || !Number(stats.records) ? null : Number(stats.average);
    attendanceRecords = Number(stats?.records) || 0;
  }

  return {
    gradesBySubject,
    attendanceByCourse,
    summary: {
      averageGrade,
      gradeCount,
      averageAttendance,
      attendanceRecords,
      isHeadTeacher,
      truncated: gradesTruncated || attendanceTruncated,
    },
  };
}

async function adminDashboardCharts(user, ids) {
  const data = await buildAbsenceAndStudentCharts(user, ids);
  return {
    mode: 'admin',
    periodLabel: 'Últimos 30 días',
    ...data,
  };
}

async function teacherDashboardCharts(user, courseIds) {
  const subjectIds = await coursesWhereSubjectTeacher(user, courseIds);
  const headIds = await coursesWhereHeadTeacher(user, courseIds);
  const ownedIds = [...new Set([...subjectIds, ...headIds])];
  if (!ownedIds.length) return null;

  const isHeadTeacher = headIds.length > 0;
  const gradeIds = isHeadTeacher ? ownedIds : subjectIds;
  const academic = await buildGradeAndAttendanceCharts(user, gradeIds, ownedIds, { isHeadTeacher });

  // Profesor jefe: también ve inasistencias y alumnos de sus cursos a cargo.
  if (isHeadTeacher) {
    const roster = await buildAbsenceAndStudentCharts(user, headIds);
    return {
      mode: 'head',
      periodLabel: 'Últimos 30 días',
      gradesBySubject: academic.gradesBySubject,
      attendanceByCourse: academic.attendanceByCourse,
      absencesByCourse: roster.absencesByCourse,
      studentsByCourse: roster.studentsByCourse,
      summary: {
        ...academic.summary,
        ...roster.summary,
        truncated: Boolean(academic.summary.truncated || roster.summary.truncated),
        isHeadTeacher: true,
      },
    };
  }

  return {
    mode: 'teacher',
    periodLabel: 'Últimos 30 días',
    ...academic,
  };
}

async function guardianDashboardCharts(user, courseIds) {
  const scope = courseIds.length ? courseIds : [0];
  const learner = learnerStudentFilter(user);
  const today = chileToday();

  const [gradeRows] = await pool.query(`
    SELECT CONCAT(s.first_name, ' ', s.last_name) AS label,
      ROUND(AVG(g.score), 1) AS value,
      COUNT(*) AS gradeCount
    FROM students s
    JOIN grades g ON g.student_id = s.id AND g.school_id = s.school_id AND g.course_id IN (?)
    WHERE s.school_id = ? AND s.active = TRUE ${learner.sql ? `AND ${learner.sql}` : ''}
    GROUP BY s.id, s.first_name, s.last_name
    ORDER BY AVG(g.score) ASC, s.last_name, s.first_name
  `, [scope, user.schoolId, ...learner.params]);

  const [attendanceRows] = await pool.query(`
    SELECT CONCAT(s.first_name, ' ', s.last_name) AS label,
      ROUND(SUM(a.status IN ('present', 'late')) / COUNT(*) * 100) AS value,
      COUNT(*) AS records
    FROM students s
    JOIN attendance a ON a.student_id = s.id AND a.school_id = s.school_id AND a.course_id IN (?)
    WHERE s.school_id = ?
      AND s.active = TRUE
      AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
      ${learner.sql ? `AND ${learner.sql}` : ''}
    GROUP BY s.id, s.first_name, s.last_name
    HAVING COUNT(*) > 0
    ORDER BY value ASC, s.last_name, s.first_name
  `, [scope, user.schoolId, today, ...learner.params]);

  // Ensure all linked students appear even without grades/attendance yet.
  const [linkedStudents] = await pool.query(`
    SELECT CONCAT(s.first_name, ' ', s.last_name) AS label
    FROM students s
    WHERE s.school_id = ? AND s.active = TRUE ${learner.sql ? `AND ${learner.sql}` : ''}
    ORDER BY s.last_name, s.first_name
  `, [user.schoolId, ...learner.params]);

  if (!linkedStudents.length) return null;

  const gradesByStudent = limitSeries(seriesFromRows(gradeRows));
  const attendanceByStudent = limitSeries(seriesFromRows(attendanceRows));

  const [[stats]] = await pool.query(`
    SELECT
      ROUND(AVG(g.score), 1) AS averageGrade,
      COUNT(*) AS gradeCount
    FROM grades g
    JOIN students s ON s.id = g.student_id AND s.school_id = g.school_id
    WHERE g.school_id = ? AND g.course_id IN (?) AND s.active = TRUE
      ${learner.sql ? `AND ${learner.sql}` : ''}
  `, [user.schoolId, scope, ...learner.params]);

  const [[attStats]] = await pool.query(`
    SELECT
      ROUND(SUM(a.status IN ('present', 'late')) / COUNT(*) * 100) AS averageAttendance,
      COUNT(*) AS records
    FROM attendance a
    JOIN students s ON s.id = a.student_id AND s.school_id = a.school_id
    WHERE a.school_id = ?
      AND a.course_id IN (?)
      AND s.active = TRUE
      AND a.attended_on >= DATE_SUB(?, INTERVAL 30 DAY)
      ${learner.sql ? `AND ${learner.sql}` : ''}
  `, [user.schoolId, scope, today, ...learner.params]);

  return {
    mode: 'guardian',
    periodLabel: 'Últimos 30 días',
    gradesByStudent: gradesByStudent.series,
    attendanceByStudent: attendanceByStudent.series,
    summary: {
      studentCount: linkedStudents.length,
      averageGrade: stats?.averageGrade == null ? null : Number(stats.averageGrade),
      gradeCount: Number(stats?.gradeCount) || 0,
      averageAttendance: attStats?.averageAttendance == null || !Number(attStats.records)
        ? null
        : Number(attStats.averageAttendance),
      attendanceRecords: Number(attStats?.records) || 0,
      truncated: gradesByStudent.truncated || attendanceByStudent.truncated,
    },
  };
}

/** Charts for school admins (inasistencias/alumnos) and teachers (notas/asistencia). */
export async function dashboardCharts(user, courseIds) {
  const scope = (courseIds.length ? courseIds : []).map(Number).filter((id) => id > 0);
  if (!scope.length) return null;

  if (user.role === 'guardian') {
    return guardianDashboardCharts(user, scope);
  }

  if (user.role === 'teacher') {
    const teacherCharts = await teacherDashboardCharts(user, scope);
    if (teacherCharts) return teacherCharts;
    if (isSchoolAdmin(user)) return adminDashboardCharts(user, scope);
    return null;
  }

  if (isSchoolAdmin(user)) return adminDashboardCharts(user, scope);

  const headIds = await coursesWhereHeadTeacher(user, scope);
  if (headIds.length) return adminDashboardCharts(user, headIds);

  return null;
}
