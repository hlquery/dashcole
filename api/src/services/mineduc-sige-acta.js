import { isValidRut, normalizeRut } from './mineduc.js';

export function splitRbd(value) {
  const raw = String(value || '').trim().toUpperCase().replace(/\./g, '');
  const match = raw.match(/^(\d{1,6})-([\dK])$/);
  if (match) return { number: match[1], dv: match[2], valid: true };
  const digits = raw.match(/^(\d{1,6})$/);
  if (digits) return { number: digits[1], dv: '', valid: false };
  return { number: '', dv: '', valid: false };
}

export function splitRun(value) {
  const normalized = normalizeRut(value);
  const match = normalized.match(/^(\d{6,9})-([\dK])$/);
  if (!match) return { number: '', dv: '', valid: false };
  return { number: match[1], dv: match[2], valid: isValidRut(normalized) };
}

export function sigeFinalStatusCode(status) {
  if (status === 'promoted') return 'P';
  if (status === 'not_promoted') return 'R';
  if (status === 'withdrawn') return 'Y';
  return '';
}

export function roundAttendanceInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number);
}

function tabLine(fields) {
  return fields.map((field) => String(field ?? '')).join('\t');
}

function gradeFields(subject) {
  if (subject.exempt) return ['', '', 'EX'];
  const conceptual = String(subject.conceptual || subject.conceptualGrade || '').trim().toUpperCase();
  if (conceptual && ['MB', 'B', 'S', 'I'].includes(conceptual)) return ['', conceptual, ''];
  if (subject.finalGrade == null || subject.finalGrade === '') return ['', '', ''];
  return [Number(subject.finalGrade).toFixed(1), '', ''];
}

export function buildSigeEx4({ school, academicYear, courseName, section, courses, rows }) {
  const rbd = splitRbd(school.rbd);
  const year = String(academicYear.name || academicYear || '').replace(/\D/g, '').slice(0, 4);
  const letter = String(section || '').trim().toUpperCase();
  const teachingType = String(courses[0]?.sigeTeachingTypeCode || '').trim();
  const grade = String(courses[0]?.sigeGradeCode || '').trim();
  const decree = String(courses[0]?.sigeEvaluationDecreeCode || '').trim();
  const plan = String(courses[0]?.sigeStudyPlanCode || '').trim();
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const lines = [];
  for (const row of rows) {
    const run = splitRun(row.nationalId);
    for (const subject of row.subjectResults || []) {
      const course = courseById.get(subject.courseId) || courses.find((item) => item.subject === subject.name);
      const subjectCode = String(subject.sigeSubjectCode || course?.sigeSubjectCode || '').trim();
      const [numeric, conceptual, exempt] = gradeFields(subject);
      lines.push(tabLine([
        '4',
        rbd.number,
        rbd.dv,
        teachingType,
        grade,
        letter,
        year,
        run.number,
        run.dv,
        decree,
        plan,
        subjectCode,
        numeric,
        conceptual,
        exempt,
      ]));
    }
  }
  return `${lines.join('\r\n')}${lines.length ? '\r\n' : ''}`;
}

export function buildSigeEx5({ school, academicYear, courseName, section, courses, rows }) {
  const rbd = splitRbd(school.rbd);
  const year = String(academicYear.name || academicYear || '').replace(/\D/g, '').slice(0, 4);
  const letter = String(section || '').trim().toUpperCase();
  const teachingType = String(courses[0]?.sigeTeachingTypeCode || '').trim();
  const grade = String(courses[0]?.sigeGradeCode || '').trim();
  const lines = [];
  for (const row of rows) {
    const run = splitRun(row.nationalId);
    const attendance = roundAttendanceInteger(row.attendancePercentage);
    lines.push(tabLine([
      '5',
      rbd.number,
      rbd.dv,
      teachingType,
      grade,
      letter,
      year,
      run.number,
      run.dv,
      row.annualAverage == null ? '' : Number(row.annualAverage).toFixed(1),
      attendance == null ? '' : String(attendance),
      '',
      sigeFinalStatusCode(row.finalStatus),
      '1',
    ]));
  }
  return `${lines.join('\r\n')}${lines.length ? '\r\n' : ''}`;
}

export function validateSigeActa({ school, academicYear, courseName, section, courses, rows }) {
  const errors = [];
  const rbd = splitRbd(school?.rbd);
  if (!rbd.valid) errors.push('Falta RBD válido del establecimiento (número-DV).');

  const primary = courses[0];
  if (!primary?.sigeTeachingTypeCode) errors.push('Falta código de tipo de enseñanza');
  if (!primary?.sigeGradeCode) errors.push('Falta código de grado SIGE');
  if (!primary?.sigeEvaluationDecreeCode) errors.push('Falta código de decreto/resolución');
  if (!primary?.sigeStudyPlanCode) errors.push('Falta código de plan de estudio');

  if (!String(section || '').trim()) errors.push('Falta letra de curso');
  if (!String(academicYear?.name || '').replace(/\D/g, '')) errors.push('Falta año escolar');

  for (const course of courses) {
    const subjectName = course.subject || course.subjectName || 'asignatura';
    const code = String(course.sigeSubjectCode || '').trim();
    if (!code) errors.push(`Falta código SIGE de ${subjectName}`);
    else if (!/^\d+$/.test(code)) errors.push(`El código SIGE de ${subjectName} debe ser numérico`);
  }

  if (!rows?.length) errors.push('No hay estudiantes finalizados para exportar.');

  for (const row of rows || []) {
    const label = `${row.lastName || ''}, ${row.firstName || ''}`.trim() || `Estudiante #${row.studentId}`;
    if (String(row.identifierType || 'rut') !== 'rut') {
      errors.push(`${label}: SIGE exige RUN chileno (RUT), no IPE.`);
    }
    const run = splitRun(row.nationalId);
    if (!run.valid) errors.push(`${label}: alumno sin RUN/DV válido`);
    if (row.annualAverage == null || row.annualAverage === '') errors.push(`${label}: promedio faltante`);
    if (row.attendancePercentage == null || row.attendancePercentage === '') errors.push(`${label}: asistencia faltante`);
    if (!['promoted', 'not_promoted', 'withdrawn'].includes(row.finalStatus)) errors.push(`${label}: situación final faltante`);
    for (const subject of row.subjectResults || []) {
      const needsGrade = subject.affectsPromotion !== false && !subject.exempt;
      const hasNumeric = subject.finalGrade != null && subject.finalGrade !== '';
      const hasConceptual = ['MB', 'B', 'S', 'I'].includes(String(subject.conceptual || subject.conceptualGrade || '').trim().toUpperCase());
      if (needsGrade && !hasNumeric && !hasConceptual) {
        errors.push(`${label}: falta nota final en ${subject.name || 'asignatura'}`);
      }
    }
  }

  const ready = errors.length === 0;
  return {
    ready,
    message: ready ? 'Acta lista para exportar a SIGE' : 'Acta no lista para SIGE',
    errors,
  };
}

export function countTabColumns(line) {
  if (!line) return 0;
  return line.split('\t').length;
}
