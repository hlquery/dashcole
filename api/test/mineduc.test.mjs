import assert from 'node:assert/strict';
import { test } from 'node:test';
import { annualResultsCsv, isValidRut, promotionRecommendation, weightedFinal } from '../src/services/mineduc.js';
import {
  buildSigeEx4,
  buildSigeEx5,
  countTabColumns,
  roundAttendanceInteger,
  sigeFinalStatusCode,
  splitRbd,
  splitRun,
  validateSigeActa,
} from '../src/services/mineduc-sige-acta.js';

test('validates Chilean RUT and calculates weighted annual grades', () => {
  assert.equal(isValidRut('12.345.678-5'), true);
  assert.equal(isValidRut('12.345.678-9'), false);
  assert.equal(weightedFinal([{ score: 5.5, weight: 40 }, { score: 6.5, weight: 60 }]), 6.1);
});

test('applies Decreto 67 promotion thresholds without replacing deliberation', () => {
  const subjects = grades => grades.map((finalGrade, index) => ({ name: `Asignatura ${index}`, finalGrade, affectsPromotion: true, exempt: false }));
  assert.equal(promotionRecommendation(subjects([4, 5]), 85).recommendedStatus, 'promoted');
  assert.equal(promotionRecommendation(subjects([3.9, 5.1]), 85).recommendedStatus, 'promoted');
  assert.equal(promotionRecommendation(subjects([3.5, 4.5]), 85).recommendedStatus, 'review_required');
  assert.equal(promotionRecommendation(subjects([5, 6]), 84.99).recommendedStatus, 'review_required');
});

test('exports the required pre-acta fields as safe UTF-8 CSV', () => {
  const content = annualResultsCsv({
    school: { rbd: '12345-6' }, academicYear: { name: '2026' }, courseName: '7° Básico', section: 'A',
    rows: [{ identifierType: 'rut', nationalId: '12345678-5', firstName: '=Nombre', lastName: 'Apellido', annualAverage: 5.5, attendancePercentage: 92, finalStatus: 'promoted', decisionBasis: '', subjectResults: [{ code: 'MAT', name: 'Matemática', finalGrade: 5.5, exempt: false, affectsPromotion: true }] }],
  });
  assert.ok(content.startsWith('\uFEFF'));
  assert.match(content, /Situación final/);
  assert.match(content, /PROMOVIDO/);
  assert.match(content, /'=Nombre/);
});

const samplePayload = {
  school: { rbd: '99999-9' },
  academicYear: { name: '2026' },
  courseName: '7° Básico',
  section: 'A',
  courses: [{
    id: 1,
    subject: 'Matemática',
    sigeTeachingTypeCode: '110',
    sigeGradeCode: '7',
    sigeEvaluationDecreeCode: '67',
    sigeStudyPlanCode: '1234',
    sigeSubjectCode: '21001',
  }, {
    id: 2,
    subject: 'Lenguaje',
    sigeTeachingTypeCode: '110',
    sigeGradeCode: '7',
    sigeEvaluationDecreeCode: '67',
    sigeStudyPlanCode: '1234',
    sigeSubjectCode: '21002',
  }],
  rows: [{
    studentId: 10,
    firstName: 'Camila',
    lastName: 'Soto',
    identifierType: 'rut',
    nationalId: '21010000-8',
    annualAverage: 5.1,
    attendancePercentage: 92.86,
    finalStatus: 'promoted',
    subjectResults: [
      { courseId: 1, name: 'Matemática', sigeSubjectCode: '21001', finalGrade: 5.0, exempt: false, affectsPromotion: true },
      { courseId: 2, name: 'Lenguaje', sigeSubjectCode: '21002', finalGrade: 5.2, exempt: false, affectsPromotion: true },
    ],
  }],
};

test('splits RBD and RUN without punctuation', () => {
  assert.deepEqual(splitRbd('99999-9'), { number: '99999', dv: '9', valid: true });
  assert.equal(splitRun('21.010.000-8').number, '21010000');
  assert.equal(splitRun('21.010.000-8').dv, '8');
});

test('maps SIGE situación final codes', () => {
  assert.equal(sigeFinalStatusCode('promoted'), 'P');
  assert.equal(sigeFinalStatusCode('not_promoted'), 'R');
  assert.equal(sigeFinalStatusCode('withdrawn'), 'Y');
});

test('rounds attendance to integer for EX5', () => {
  assert.equal(roundAttendanceInteger(92.86), 93);
});

function txtLines(content) {
  // Do not use String#trim(): it strips trailing TAB fields required by SIGE.
  return content.replace(/\r?\n$/, '').split('\r\n').filter((line) => line.length > 0);
}

test('builds EX4 with 15 TAB columns and one row per student/subject', () => {
  const content = buildSigeEx4(samplePayload);
  const lines = txtLines(content);
  assert.equal(lines.length, 2);
  assert.equal(countTabColumns(lines[0]), 15);
  assert.equal(countTabColumns(lines[1]), 15);
  assert.ok(!content.includes(';'));
  assert.ok(!content.includes('"'));
  assert.ok(lines[0].startsWith('4\t99999\t9\t110\t7\tA\t2026\t21010000\t8\t'));
  assert.match(lines[0], /\t5\.0\t\t$/);
});

test('builds EX5 with 14 TAB columns and one row per student', () => {
  const content = buildSigeEx5(samplePayload);
  const lines = txtLines(content);
  assert.equal(lines.length, 1);
  assert.equal(countTabColumns(lines[0]), 14);
  assert.ok(!content.includes(';'));
  assert.ok(!content.includes('"'));
  assert.equal(lines[0], '5\t99999\t9\t110\t7\tA\t2026\t21010000\t8\t5.1\t93\t\tP\t1');
});

test('validateSigeActa fails when a SIGE subject code is missing', () => {
  const broken = structuredClone(samplePayload);
  broken.courses[0].sigeSubjectCode = '';
  broken.rows[0].subjectResults[0].sigeSubjectCode = '';
  const result = validateSigeActa(broken);
  assert.equal(result.ready, false);
  assert.match(result.message, /Acta no lista para SIGE/);
  assert.ok(result.errors.some((item) => /Falta código SIGE de Matemática/.test(item)));
});

test('validateSigeActa fails when teaching type code is missing', () => {
  const broken = structuredClone(samplePayload);
  broken.courses.forEach((course) => { course.sigeTeachingTypeCode = ''; });
  const result = validateSigeActa(broken);
  assert.equal(result.ready, false);
  assert.ok(result.errors.some((item) => /tipo de enseñanza/i.test(item)));
});

test('validateSigeActa passes a complete payload', () => {
  const result = validateSigeActa(samplePayload);
  assert.equal(result.ready, true);
  assert.equal(result.message, 'Acta lista para exportar a SIGE');
});
