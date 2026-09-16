export const MINEDUC_REGULATION_VERSION = 'decreto-67-2018';

export function normalizeRut(value) {
  return String(value || '').replace(/\./g, '').replace(/\s/g, '').toUpperCase();
}

export function isValidRut(value) {
  const match = normalizeRut(value).match(/^(\d{6,9})-?([\dK])$/);
  if (!match) return false;
  let sum = 0, multiplier = 2;
  for (const digit of [...match[1]].reverse()) {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - sum % 11;
  const check = result === 11 ? '0' : result === 10 ? 'K' : String(result);
  return check === match[2];
}

export function isValidStudentIdentifier(type, value) {
  return type === 'rut' ? isValidRut(value) : type === 'ipe' && /^[A-Z0-9-]{6,20}$/i.test(String(value || '').trim());
}

export function weightedFinal(grades) {
  const valid = grades.filter(grade => Number(grade.weight) > 0 && Number(grade.score) >= 1 && Number(grade.score) <= 7);
  const weight = valid.reduce((total, grade) => total + Number(grade.weight), 0);
  if (!weight) return null;
  return Math.round(valid.reduce((total, grade) => total + Number(grade.score) * Number(grade.weight), 0) / weight * 10) / 10;
}

export function promotionRecommendation(subjectResults, attendancePercentage) {
  const affecting = subjectResults.filter(subject => subject.affectsPromotion && subject.finalGrade !== null && !subject.exempt);
  const annualAverage = affecting.length ? Math.round(affecting.reduce((sum, subject) => sum + subject.finalGrade, 0) / affecting.length * 10) / 10 : null;
  const failedSubjects = affecting.filter(subject => subject.finalGrade < 4).length;
  const academicEligible = failedSubjects === 0 || failedSubjects === 1 && annualAverage >= 4.5 || failedSubjects === 2 && annualAverage >= 5;
  const attendanceEligible = Number(attendancePercentage) >= 85;
  return {
    annualAverage,
    failedSubjects,
    academicEligible,
    attendanceEligible,
    recommendedStatus: academicEligible && attendanceEligible ? 'promoted' : 'review_required',
  };
}

const csvCell = value => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export function annualResultsCsv({ school, academicYear, courseName, section, rows }) {
  const headers = ['RBD','Año escolar','Curso','Sección','Tipo identificador','RUT/IPE','Apellidos','Nombres','Código asignatura','Asignatura','Nota final','Incide promoción','Promedio anual','Asistencia %','Situación final','Fundamento excepción'];
  const lines = [headers.map(csvCell).join(';')];
  for (const row of rows) for (const subject of row.subjectResults) lines.push([
    school.rbd, academicYear.name, courseName, section, row.identifierType.toUpperCase(), row.nationalId,
    row.lastName, row.firstName, subject.code || '', subject.name, subject.exempt ? 'EX' : subject.finalGrade?.toFixed(1) || '',
    subject.affectsPromotion ? 'SI' : 'NO', Number(row.annualAverage).toFixed(1), Number(row.attendancePercentage).toFixed(2),
    row.finalStatus === 'promoted' ? 'PROMOVIDO' : 'NO PROMOVIDO', row.decisionBasis || '',
  ].map(csvCell).join(';'));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
