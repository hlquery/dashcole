/** SQL helpers so teachers only see courses they teach (subject) or lead as profesor jefe. */

import { teacherNameInColumnSql } from './course-teachers.js';

/** Match teacher/head_teacher lists against the logged-in teacher's full name (one ?). */
function teacherNameExistsSql(courseAlias, columnExpr) {
  return `EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = ?
      AND u.school_id = ${courseAlias}.school_id
      AND u.role = 'teacher'
      AND ${teacherNameInColumnSql(columnExpr, 'LOWER(TRIM(u.full_name))')}
  )`;
}

export function teacherCourseMatchSql(courseAlias = 'c') {
  return `(
    ${teacherNameExistsSql(courseAlias, `${courseAlias}.teacher`)}
    OR ${teacherNameExistsSql(courseAlias, `${courseAlias}.head_teacher`)}
  )`;
}

export function teacherCourseMatchParams(user) {
  return [user.id, user.id];
}

/** Write access: only the assigned subject teacher (not profesor jefe of other ramos). */
export function teacherSubjectMatchSql(courseAlias = 'c') {
  return teacherNameExistsSql(courseAlias, `${courseAlias}.teacher`);
}

export function teacherSubjectMatchParams(user) {
  return [user.id];
}

export function teacherOwnedCourseIdsSql() {
  return `SELECT tc.id FROM courses tc
    WHERE tc.school_id = ?
      AND (
        ${teacherNameExistsSql('tc', 'tc.teacher')}
        OR ${teacherNameExistsSql('tc', 'tc.head_teacher')}
      )`;
}

export function teacherOwnedCourseIdsParams(user) {
  return [user.schoolId, user.id, user.id];
}

/** Course IDs where the teacher is the assigned subject teacher (write scope). */
export function teacherSubjectCourseIdsSql() {
  return `SELECT tc.id FROM courses tc
    WHERE tc.school_id = ?
      AND ${teacherNameExistsSql('tc', 'tc.teacher')}`;
}

export function teacherSubjectCourseIdsParams(user) {
  return [user.schoolId, user.id];
}

export function isHeadTeacherPosition(position = '') {
  return /jefe/i.test(String(position || ''));
}
