/** Suggested SIGE codes for Chilean curriculum subjects and course levels.
 *  Schools can override; official plan codes live in Rectifica Actas / SIGE. */

function stripDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSigeKey(value) {
  return stripDiacritics(value)
    .toLocaleLowerCase('es')
    .replace(/[°º]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Stable suggested subject codes for DashCole template subjects. */
const SUBJECT_CODE_ENTRIES = [
  ['Lenguaje Verbal', '21101'],
  ['Pensamiento Matemático', '21102'],
  ['Exploración del Medio Natural', '21103'],
  ['Formación Personal y Social', '21104'],
  ['Lenguaje y Comunicación', '21201'],
  ['Lengua y Literatura', '21202'],
  ['Matemáticas', '21210'],
  ['Matemática', '21210'],
  ['Historia, Geografía y Ciencias Sociales', '21220'],
  ['Ciencias Naturales', '21230'],
  ['Inglés', '21240'],
  ['Educación Física y Salud', '21250'],
  ['Educación Física', '21250'],
  ['Artes Visuales', '21260'],
  ['Música', '21270'],
  ['Tecnología', '21280'],
  ['Orientación', '21290'],
  ['Religión', '21295'],
  ['Educación Ciudadana', '21310'],
  ['Filosofía', '21320'],
  ['Biología', '21330'],
  ['Física', '21340'],
  ['Química', '21350'],
];

const SUBJECT_ALIASES = {
  lenguaje: 'Lenguaje y Comunicación',
  'lenguaje y comunicacion': 'Lenguaje y Comunicación',
  lengua: 'Lengua y Literatura',
  matematicas: 'Matemáticas',
  matematica: 'Matemáticas',
  historia: 'Historia, Geografía y Ciencias Sociales',
  'historia geografia y ciencias sociales': 'Historia, Geografía y Ciencias Sociales',
  ciencias: 'Ciencias Naturales',
  'educacion fisica': 'Educación Física y Salud',
};

const SUBJECT_CODE_BY_KEY = new Map();
for (const [name, code] of SUBJECT_CODE_ENTRIES) {
  SUBJECT_CODE_BY_KEY.set(normalizeSigeKey(name), code);
}
for (const [alias, canonical] of Object.entries(SUBJECT_ALIASES)) {
  const code = SUBJECT_CODE_BY_KEY.get(normalizeSigeKey(canonical));
  if (code) SUBJECT_CODE_BY_KEY.set(normalizeSigeKey(alias), code);
}

export const DEFAULT_SIGE_SUBJECT_CODES = Object.fromEntries(
  SUBJECT_CODE_ENTRIES.map(([name, code]) => [name, code]),
);

export function defaultSigeSubjectCode(subjectName) {
  const key = normalizeSigeKey(subjectName);
  if (!key) return '';
  if (SUBJECT_CODE_BY_KEY.has(key)) return SUBJECT_CODE_BY_KEY.get(key);
  const alias = SUBJECT_ALIASES[key];
  if (alias) return SUBJECT_CODE_BY_KEY.get(normalizeSigeKey(alias)) || '';
  return '';
}

export function resolveSigeSubjectCode(subjectName, existing = '') {
  const current = String(existing || '').trim();
  if (current) return current;
  return defaultSigeSubjectCode(subjectName);
}

/** Teaching type / grade / decree suggestions from course display name. */
export function suggestCourseSigeCodes(courseName) {
  const raw = String(courseName || '').trim();
  const key = normalizeSigeKey(raw);
  const empty = {
    sigeTeachingTypeCode: '',
    sigeGradeCode: '',
    sigeEvaluationDecreeCode: '67',
  };
  if (!key) return empty;

  if (/\bpre\s*kinder\b/.test(key) || key.includes('parvular')) {
    return { sigeTeachingTypeCode: '10', sigeGradeCode: '1', sigeEvaluationDecreeCode: '67' };
  }
  if (/\bkinder\b/.test(key)) {
    return { sigeTeachingTypeCode: '10', sigeGradeCode: '2', sigeEvaluationDecreeCode: '67' };
  }

  const medio = /\bmedio\b/.test(key) || /\bmedia\b/.test(key);
  const basico = /\bbasico\b/.test(key) || /\bbasica\b/.test(key);

  let grade = '';
  const gradeMatch = key.match(/\b([1-8])\b/) || raw.match(/([1-8])\s*[°º]/);
  if (gradeMatch) grade = gradeMatch[1];

  if (medio) {
    return {
      sigeTeachingTypeCode: '310',
      sigeGradeCode: grade && Number(grade) <= 4 ? grade : '',
      sigeEvaluationDecreeCode: '67',
    };
  }
  if (basico || grade) {
    return {
      sigeTeachingTypeCode: '110',
      sigeGradeCode: grade || '',
      sigeEvaluationDecreeCode: '67',
    };
  }

  return empty;
}

export function applyCourseSigeDefaults(courseName, current = {}) {
  const suggested = suggestCourseSigeCodes(courseName);
  return {
    sigeTeachingTypeCode: String(current.sigeTeachingTypeCode || '').trim() || suggested.sigeTeachingTypeCode,
    sigeGradeCode: String(current.sigeGradeCode || '').trim() || suggested.sigeGradeCode,
    sigeEvaluationDecreeCode: String(current.sigeEvaluationDecreeCode || '').trim() || suggested.sigeEvaluationDecreeCode,
    sigeStudyPlanCode: String(current.sigeStudyPlanCode || '').trim(),
  };
}
