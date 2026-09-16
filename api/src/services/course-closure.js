const STAGE_ORDER = ['preparation', 'teacher_ready', 'utp_approved', 'director_approved', 'closed'];

const STAGE_LABELS = {
  preparation: 'EN PREPARACIÓN',
  teacher_ready: 'EN REVISIÓN UTP',
  utp_approved: 'PENDIENTE DIRECCIÓN',
  director_approved: 'LISTO PARA SIGE',
  closed: 'CERRADO',
};

export function closurePermissions(user) {
  const role = user?.role || '';
  const manageSchool = Boolean(user?.permissions?.manageSchool);
  const isAdmin = manageSchool || ['school_admin', 'super_admin'].includes(role);
  const isDirector = isAdmin || role === 'director';
  const isUtp = isDirector || role === 'utp';
  const isTeacher = isUtp || role === 'teacher' || Boolean(user?.permissions?.manageGrades);
  return {
    canRead: isTeacher || isUtp || isDirector,
    canEditGrades: isTeacher && !['guardian', 'student'].includes(role),
    canSubmitTeacher: isTeacher,
    canReviewUtp: isUtp,
    canResolveStudent: isUtp,
    canConfigureSige: isUtp,
    canApproveDirector: isDirector,
    canLock: isDirector,
    canUnlock: isDirector,
    canExport: isUtp,
    role,
  };
}

export function stageLabel(stage) {
  return STAGE_LABELS[stage] || STAGE_LABELS.preparation;
}

export function stageRank(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx < 0 ? 0 : idx;
}

export function deriveStage({ closure, rows, actaClosedAt }) {
  if (actaClosedAt || closure?.stage === 'closed' || closure?.closedAt) return 'closed';
  if (closure?.stage && STAGE_ORDER.includes(closure.stage)) return closure.stage;
  if (rows?.length && rows.every((row) => row.finalizedAt)) return 'teacher_ready';
  return 'preparation';
}

export function buildValidationSummary({ school, preview, stage }) {
  const rows = preview.rows || [];
  const subjects = preview.sigeCodes?.subjects || [];
  const codes = preview.sigeCodes || {};
  const missingId = rows.filter((row) => !row.nationalId);
  const missingGrades = rows.filter((row) => row.issues?.some((item) => /calificaciones/i.test(item)));
  const missingAttendance = rows.filter((row) => row.attendancePercentage === null || row.attendancePercentage === '');
  const reviewRequired = rows.filter((row) => row.recommendedStatus === 'review_required');
  const unresolved = reviewRequired.filter((row) => !row.finalStatus || (row.finalStatus !== 'withdrawn' && String(row.decisionBasis || '').trim().length < 20));
  const missingSubjectCodes = subjects.filter((item) => !String(item.sigeSubjectCode || '').trim());
  const courseFields = [
    { key: 'rbd', ok: Boolean(school?.rbd), label: 'RBD' },
    { key: 'teaching', ok: Boolean(codes.sigeTeachingTypeCode), label: 'Tipo de enseñanza' },
    { key: 'grade', ok: Boolean(codes.sigeGradeCode), label: 'Grado' },
    { key: 'decree', ok: Boolean(codes.sigeEvaluationDecreeCode), label: 'Decreto / resolución' },
    { key: 'plan', ok: Boolean(codes.sigeStudyPlanCode), label: 'Plan de estudio' },
  ];
  const checks = [
    { id: 'rbd', ok: Boolean(school?.rbd), blocking: true, label: school?.rbd ? 'RBD configurado' : 'Falta RBD del establecimiento' },
    { id: 'course_codes', ok: courseFields.every((item) => item.ok), blocking: true, label: courseFields.every((item) => item.ok) ? 'Configuración SIGE del curso completa' : `Faltan campos SIGE del curso (${courseFields.filter((item) => !item.ok).map((item) => item.label).join(', ')})` },
    { id: 'subject_codes', ok: missingSubjectCodes.length === 0, blocking: true, label: missingSubjectCodes.length ? `${missingSubjectCodes.length} asignatura(s) sin código SIGE` : 'Códigos SIGE de asignaturas completos' },
    { id: 'ids', ok: missingId.length === 0, blocking: true, label: missingId.length ? `${missingId.length} estudiante(s) sin RUN/IPE` : 'Identificación de estudiantes completa' },
    { id: 'grades', ok: missingGrades.length === 0, blocking: true, label: missingGrades.length ? `${missingGrades.length} estudiante(s) con notas faltantes` : 'Calificaciones finales completas' },
    { id: 'attendance', ok: missingAttendance.length === 0, blocking: true, label: missingAttendance.length ? `${missingAttendance.length} estudiante(s) sin asistencia` : 'Asistencia anual completa' },
    { id: 'analysis', ok: unresolved.length === 0, blocking: true, label: unresolved.length ? `${unresolved.length} caso(s) requieren resolución fundada` : 'Casos excepcionales resueltos' },
    { id: 'teacher', ok: stageRank(stage) >= stageRank('teacher_ready'), blocking: false, label: stageRank(stage) >= stageRank('teacher_ready') ? 'Profesor marcó calificaciones listas' : 'Pendiente cierre de calificaciones del profesor' },
    { id: 'utp', ok: stageRank(stage) >= stageRank('utp_approved'), blocking: false, label: stageRank(stage) >= stageRank('utp_approved') ? 'UTP aprobó revisión académica' : 'Pendiente revisión UTP' },
    { id: 'director', ok: stageRank(stage) >= stageRank('director_approved'), blocking: false, label: stageRank(stage) >= stageRank('director_approved') ? 'Dirección autorizó el cierre' : 'Pendiente autorización de dirección' },
  ];
  const completed = checks.filter((item) => item.ok).length;
  const blockingErrors = checks.filter((item) => item.blocking && !item.ok);
  const warnings = checks.filter((item) => !item.blocking && !item.ok);
  return {
    total: checks.length,
    completed,
    percent: Math.round((completed / checks.length) * 100),
    canClose: blockingErrors.length === 0 && stageRank(stage) >= stageRank('director_approved'),
    checks,
    blockingErrors,
    warnings,
    courseFields,
    missingSubjectCodes: missingSubjectCodes.map((item) => item.name),
    counts: {
      students: rows.length,
      promoted: rows.filter((row) => (row.finalStatus || row.recommendedStatus) === 'promoted').length,
      notPromoted: rows.filter((row) => row.finalStatus === 'not_promoted' || (row.recommendedStatus === 'review_required' && row.finalStatus === 'not_promoted')).length,
      reviewRequired: reviewRequired.length,
      unresolved: unresolved.length,
      pendingTeacher: missingGrades.length + missingAttendance.length,
      pendingUtp: unresolved.length + (stageRank(stage) < stageRank('utp_approved') ? 1 : 0),
      pendingDirector: stageRank(stage) < stageRank('director_approved') ? 1 : 0,
    },
  };
}

export function buildWorkflowSteps(closure, actors = {}) {
  const stage = closure?.stage || 'preparation';
  return [
    {
      key: 'teacher',
      title: 'Profesor',
      detail: 'Calificaciones cerradas',
      done: stageRank(stage) >= stageRank('teacher_ready'),
      at: closure?.teacherReadyAt || null,
      by: actors.teacher || null,
      comment: closure?.teacherComment || '',
    },
    {
      key: 'utp',
      title: 'UTP',
      detail: 'Revisión académica',
      done: stageRank(stage) >= stageRank('utp_approved'),
      at: closure?.utpApprovedAt || null,
      by: actors.utp || null,
      comment: closure?.utpComment || '',
    },
    {
      key: 'director',
      title: 'Dirección',
      detail: 'Autorización final',
      done: stageRank(stage) >= stageRank('director_approved'),
      at: closure?.directorApprovedAt || null,
      by: actors.director || null,
      comment: closure?.directorComment || '',
    },
    {
      key: 'sige',
      title: 'SIGE',
      detail: 'Carga / cierre oficial',
      done: stage === 'closed',
      at: closure?.closedAt || null,
      by: actors.closer || null,
      comment: '',
    },
  ];
}

export { STAGE_ORDER, STAGE_LABELS };
