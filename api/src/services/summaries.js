export function gradeGroups(grades) {
  const groups = new Map();
  for (const grade of grades) {
    const key = `${grade.subject}::${grade.course}`;
    const group = groups.get(key) || { subject: grade.subject, course: grade.course, color: grade.color, grades: [] };
    group.grades.push(grade); groups.set(key, group);
  }
  return [...groups.values()].map(group => {
    const scores = group.grades.map(grade => Number(grade.score)).filter(Number.isFinite);
    return { ...group, average: scores.length ? Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1)) : null, approvalRate: scores.length ? Math.round(scores.filter(score => score >= 4).length / scores.length * 100) : 0 };
  });
}
function splitTeacherNames(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => splitTeacherNames(item)))];
  }
  if (value && typeof value === 'object') {
    return splitTeacherNames(value.fullName || value.name || value.label || '');
  }
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function courseGroups(courses) {
  const groups = new Map();
  for (const course of courses) {
    const key = `${course.name}|${course.section}|${course.academic_year_id || ''}`;
    const group = groups.get(key) || { id: course.id, name: course.name, section: course.section, academic_year_id: course.academic_year_id, color: course.color, modules: [], student_count: 0 };
    group.modules.push(course); group.student_count = Math.max(group.student_count, Number(course.student_count) || 0); groups.set(key, group);
  }
  return [...groups.values()].map(group => {
    const scores = group.modules.filter(course => course.average != null).map(course => Number(course.average)).filter(Number.isFinite);
    const subjectTeachers = [...new Set(group.modules.flatMap((course) => splitTeacherNames(course.teacher)))];
    const headTeachers = [...new Set(group.modules.flatMap((course) => splitTeacherNames(course.head_teacher || course.headTeacher)))];
    const headTeacher = headTeachers.length ? headTeachers.join(', ') : null;
    return {
      ...group,
      modules: group.modules.sort((a, b) => a.subject.localeCompare(b.subject, 'es')),
      teacher: subjectTeachers.length ? subjectTeachers.join(', ') : 'Sin profesor',
      head_teacher: headTeacher,
      headTeacher,
      monthly_fee: Number(group.modules.find(course => course.monthly_fee != null)?.monthly_fee ?? group.modules[0]?.monthly_fee ?? 0),
      average: scores.length ? Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1)) : null,
    };
  });
}
export function moduleSummary(key, sections) {
  const rows = title => sections.find(section => section.title === title)?.rows || [];
  const sum = (records, field) => records.reduce((total, row) => total + Math.round(Number(row[field] || 0) * 100), 0) / 100;
  if (key === 'finance') {
    const invoices = rows('Documentos de cobro'), payments = rows('Pagos'), expenses = rows('Gastos');
    const pending = invoices.filter(row => ['pending', 'overdue'].includes(row.status));
    return [
      { label: 'Por cobrar', value: sum(pending, 'amount'), format: 'money', detail: `${pending.length} documentos pendientes` },
      { label: 'Pagos recibidos', value: sum(payments, 'amount'), format: 'money', detail: `${payments.length} movimientos` },
      { label: 'Gastos', value: sum(expenses, 'amount'), format: 'money', detail: `${expenses.length} registros` },
      { label: 'Proveedores', value: rows('Proveedores').length, detail: 'Contactos registrados' },
    ];
  }
  if (key === 'hr') {
    const employees = rows('Empleados');
    return [
      { label: 'Empleados', value: employees.length, detail: 'Dotación registrada' },
      { label: 'Activos', value: employees.filter(row => row.active === 'Sí').length, detail: 'Con contrato vigente' },
      { label: 'Sueldos mensuales', value: sum(employees, 'monthlySalary'), format: 'money', detail: 'Total registrado' },
      { label: 'Tipos de contrato', value: new Set(employees.map(row => row.contractType).filter(value => value && value !== '—')).size, detail: 'Modalidades vigentes' },
    ];
  }
  if (key === 'documents') {
    const files = rows('Archivos');
    const kinds = files.reduce((counts, row) => {
      const kind = String(row.kind || 'General');
      counts[kind] = (counts[kind] || 0) + 1;
      return counts;
    }, {});
    return [
      { label: 'Documentos', value: files.length, detail: 'Archivos registrados' },
      { label: 'Certificados', value: kinds.Certificado || 0, detail: 'Emitidos o adjuntos' },
      { label: 'Con estudiante', value: files.filter(row => row.studentName && row.studentName !== '—').length, detail: 'Asociados a alumnos' },
      { label: 'Tipos', value: Object.keys(kinds).length, detail: 'Categorías en uso' },
    ];
  }
  if (key === 'classbook') {
    const observations = rows('Observaciones');
    return [
      { label: 'Anotaciones', value: observations.length, detail: 'Registros del libro' },
      { label: 'Positivas', value: observations.filter((row) => row.kind === 'positive').length, detail: 'Reconocimientos' },
      { label: 'Negativas', value: observations.filter((row) => row.kind === 'negative').length, detail: 'Observaciones' },
      { label: 'Con archivo', value: observations.filter((row) => row.hasAttachment || row.attachmentName).length, detail: 'Adjuntos disponibles' },
    ];
  }
  return [];
}
