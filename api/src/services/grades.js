import { sequelize, models } from '../database.js';
import { ApiError } from '../http.js';
import { getSchoolContext } from '../school-context.js';
import { isValidDate } from '../validation.js';
import { teacherSubjectMatchSql, teacherSubjectMatchParams } from './teacher-scope.js';

export async function createGrade(user, body) {
  getSchoolContext(user);
  return sequelize.transaction(async transaction => {
    const pool = { query: async (sql, replacements) => {
      const result = await sequelize.query(sql, { replacements, transaction });
      return /^\s*INSERT\b/i.test(sql) && Number.isInteger(result[0]) ? [{ insertId: result[0], affectedRows: result[1] }, result[1]] : result;
    } };
  const { studentId, courseId, assessment, score, maxScore = 7, weight = 25, gradedAt, feedback = null } = body;
  const normalizedStudentId = Number(studentId);
  const normalizedCourseId = Number(courseId);
  const normalizedScore = Number(score);
  const normalizedMaxScore = Number(maxScore);
  const normalizedWeight = Number(weight);
  if (!Number.isSafeInteger(normalizedStudentId) || normalizedStudentId < 1 || !Number.isSafeInteger(normalizedCourseId) || normalizedCourseId < 1
    || !String(assessment || '').trim() || String(assessment).trim().length > 120 || !isValidDate(String(gradedAt || ''))
    || !Number.isFinite(normalizedScore) || !Number.isFinite(normalizedMaxScore)
    || normalizedMaxScore < 1 || normalizedMaxScore > 7 || normalizedScore < 1 || normalizedScore > normalizedMaxScore
    || (feedback != null && (typeof feedback !== 'string' || feedback.length > 500))
    || !Number.isFinite(normalizedWeight) || normalizedWeight < 1 || normalizedWeight > 100) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa los datos de la calificación.');
  }
  const courseConditions = ['c.id = ?', 'c.school_id = ?'];
  const courseParams = [normalizedCourseId, user.schoolId];
  if (user.role === 'teacher') {
    courseConditions.push(teacherSubjectMatchSql('c'));
    courseParams.push(...teacherSubjectMatchParams(user));
  }
  const [authorizedCourses] = await pool.query(`SELECT c.id FROM courses c WHERE ${courseConditions.join(' AND ')}`, courseParams);
  if (!authorizedCourses.length) throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso al asignatura.');
  const [enrollments] = await pool.query(`
    SELECT e.student_id FROM courses c JOIN enrollments e ON e.course_id = c.id
    JOIN students s ON s.id = e.student_id AND s.school_id = c.school_id AND s.active = TRUE
    WHERE ${courseConditions.join(' AND ')} AND e.student_id = ? AND e.status = 'active'
  `, [...courseParams, normalizedStudentId]);
  if (!enrollments.length) {
    const [existing] = await pool.query('SELECT status FROM enrollments WHERE school_id = ? AND student_id = ? AND course_id = ?', [user.schoolId, normalizedStudentId, normalizedCourseId]);
    if (existing.length) throw new ApiError(403, 'FORBIDDEN', 'El estudiante no está matriculado en este curso o no tienes acceso al asignatura.');
    const [siblings] = await pool.query(`
      SELECT 1
      FROM courses selected
        JOIN courses module ON module.school_id = selected.school_id
          AND module.name = selected.name
          AND module.section = selected.section
          AND (module.academic_year_id <=> selected.academic_year_id)
        JOIN enrollments e ON e.course_id = module.id AND e.school_id = selected.school_id
        JOIN students s ON s.id = e.student_id AND s.school_id = selected.school_id AND s.active = TRUE
      WHERE selected.id = ? AND selected.school_id = ? AND e.student_id = ? AND e.status = 'active'
      LIMIT 1
    `, [normalizedCourseId, user.schoolId, normalizedStudentId]);
    if (!siblings.length) throw new ApiError(403, 'FORBIDDEN', 'El estudiante no está matriculado en este curso o no tienes acceso al asignatura.');
    await pool.query(`
      INSERT INTO enrollments (school_id, student_id, course_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', NOW(), NOW())
    `, [user.schoolId, normalizedStudentId, normalizedCourseId]);
  }
  const [result] = await pool.query(`
    INSERT INTO grades (school_id, created_by, student_id, course_id, assessment, score, max_score, weight, graded_at, feedback, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [user.schoolId, user.id, normalizedStudentId, normalizedCourseId, String(assessment).trim(), normalizedScore, normalizedMaxScore, normalizedWeight, gradedAt, feedback]);
  const [recipients] = await pool.query(`
    SELECT DISTINCT recipient.user_id FROM (
      SELECT user_id FROM students WHERE id = ? AND school_id = ? AND user_id IS NOT NULL
      UNION
      SELECT gu.user_id FROM student_guardians sg JOIN guardians gu ON gu.id = sg.guardian_id
        WHERE sg.student_id = ? AND gu.school_id = ? AND gu.user_id IS NOT NULL
    ) recipient
  `, [normalizedStudentId, user.schoolId, normalizedStudentId, user.schoolId]);
  await Promise.all(recipients.map((recipient) => pool.query(`
    INSERT INTO user_notifications (school_id, created_by, user_id, student_id, grade_id, subject, body, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [user.schoolId, user.id, recipient.user_id, normalizedStudentId, result.insertId, 'Nueva calificación', `${String(assessment).trim()}: ${normalizedScore}`])));
  await models.AuditLog.create({ schoolId: user.schoolId, createdBy: user.id, action: 'create', entity: 'grade', entityId: result.insertId, payload: { studentId: normalizedStudentId, courseId: normalizedCourseId } }, { transaction });
  return { id: result.insertId };
  });
}
