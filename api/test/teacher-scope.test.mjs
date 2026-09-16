import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { teacherCourseMatchSql, teacherCourseMatchParams, teacherOwnedCourseIdsSql, teacherOwnedCourseIdsParams, teacherSubjectCourseIdsSql, teacherSubjectCourseIdsParams } from '../src/services/teacher-scope.js';

test('teacher course scope includes subject assignments and headships, excluding unrelated courses and schools', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE users (id INTEGER, school_id INTEGER, role TEXT, full_name TEXT);
      CREATE TABLE courses (id INTEGER, school_id INTEGER, teacher TEXT, head_teacher TEXT);
      INSERT INTO users VALUES (1, 10, 'teacher', ' Ana Perez '), (2, 10, 'teacher', 'Sin cursos'), (3, 20, 'teacher', 'Ana Perez');
      INSERT INTO courses VALUES
        (101, 10, 'ana perez', 'Otro Docente'),
        (102, 10, 'Otro Docente', 'ANA PEREZ'),
        (103, 10, 'Ana Perez', 'Ana Perez'),
        (104, 10, 'Otro Docente', NULL),
        (105, 10, NULL, NULL),
        (201, 20, 'Ana Perez', 'Ana Perez');
    `);
    const user = { id: 1, schoolId: 10 };
    const ids = rows => rows.map(row => row.id).sort((a, b) => a - b);
    const courseList = db.prepare(`SELECT c.id FROM courses c WHERE c.school_id = ? AND ${teacherCourseMatchSql()}`);
    assert.deepEqual(ids(courseList.all(user.schoolId, ...teacherCourseMatchParams(user))), [101, 102, 103]);
    assert.deepEqual(ids(db.prepare(teacherOwnedCourseIdsSql()).all(...teacherOwnedCourseIdsParams(user))), [101, 102, 103]);
    // Jefatura grants reading access, but only subject assignments grant editing access.
    assert.deepEqual(ids(db.prepare(teacherSubjectCourseIdsSql()).all(...teacherSubjectCourseIdsParams(user))), [101, 103]);
    const unassigned = { id: 2, schoolId: 10 };
    assert.deepEqual(courseList.all(unassigned.schoolId, ...teacherCourseMatchParams(unassigned)), []);
    assert.deepEqual(db.prepare(teacherOwnedCourseIdsSql()).all(...teacherOwnedCourseIdsParams(unassigned)), []);
  } finally { db.close(); }
});
