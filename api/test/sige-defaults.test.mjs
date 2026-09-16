import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyCourseSigeDefaults,
  defaultSigeSubjectCode,
  resolveSigeSubjectCode,
  suggestCourseSigeCodes,
} from '../src/services/sige-defaults.js';

test('suggests teaching type and grade from Chilean course names', () => {
  assert.deepEqual(suggestCourseSigeCodes('7° Básico'), {
    sigeTeachingTypeCode: '110',
    sigeGradeCode: '7',
    sigeEvaluationDecreeCode: '67',
  });
  assert.deepEqual(suggestCourseSigeCodes('2° Medio'), {
    sigeTeachingTypeCode: '310',
    sigeGradeCode: '2',
    sigeEvaluationDecreeCode: '67',
  });
  assert.equal(suggestCourseSigeCodes('Prekínder').sigeTeachingTypeCode, '10');
});

test('keeps saved course SIGE codes over defaults', () => {
  const applied = applyCourseSigeDefaults('7° Básico', {
    sigeTeachingTypeCode: '999',
    sigeGradeCode: '',
    sigeEvaluationDecreeCode: '',
    sigeStudyPlanCode: 'ABC',
  });
  assert.equal(applied.sigeTeachingTypeCode, '999');
  assert.equal(applied.sigeGradeCode, '7');
  assert.equal(applied.sigeEvaluationDecreeCode, '67');
  assert.equal(applied.sigeStudyPlanCode, 'ABC');
});

test('resolves default subject SIGE codes by name aliases', () => {
  assert.equal(defaultSigeSubjectCode('Matemáticas'), '21210');
  assert.equal(defaultSigeSubjectCode('Matemática'), '21210');
  assert.equal(defaultSigeSubjectCode('Lenguaje'), '21201');
  assert.equal(resolveSigeSubjectCode('Inglés', '99999'), '99999');
  assert.equal(resolveSigeSubjectCode('Inglés', ''), '21240');
  assert.equal(defaultSigeSubjectCode('Taller inventado'), '');
});
