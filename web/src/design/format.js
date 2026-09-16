export const enumLabels = {
  positive: 'Positiva', negative: 'Negativa', general: 'General', certificate: 'Certificado', report: 'Informe', enrollment: 'Matrícula', contract: 'Contrato',
  paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido', cancelled: 'Anulado', transfer: 'Transferencia', cash: 'Efectivo', card: 'Tarjeta', debit: 'Débito', credit: 'Crédito',
  present: 'Presente', absent: 'Ausente', late: 'Atraso', active: 'Activo', inactive: 'Inactivo', withdrawn: 'Retirado', exempt: 'Eximido',
  open: 'Abierto', closed: 'Cerrado', resolved: 'Resuelto', in_progress: 'En seguimiento', scheduled: 'Agendada', completed: 'Realizada', low: 'Leve', medium: 'Moderada', high: 'Grave', critical: 'Crítica',
  queued: 'Correo en cola', skipped: 'Sin correo',
  permanent: 'Indefinido', indefinite: 'Indefinido', fixed: 'Plazo fijo', fixed_term: 'Plazo fijo', temporary: 'Temporal', freelance: 'Honorarios', part_time: 'Jornada parcial', full_time: 'Jornada completa',
  notification: 'Notificación', email: 'Correo', message: 'Mensaje', whatsapp: 'WhatsApp', all: 'Toda la comunidad', students: 'Estudiantes', guardians: 'Apoderados', teachers: 'Profesores', managers: 'Equipo directivo', student: 'Estudiante', guardian: 'Apoderado', course: 'Curso',
  create: 'Creación', update: 'Actualización', delete: 'Eliminación', sent: 'Enviado', failed: 'Fallido', draft: 'Borrador', verified: 'Revisado', income: 'Ingreso', expense: 'Egreso',
  employee: 'Empleado', user: 'Cuenta', grade: 'Calificación', communication: 'Comunicación', citation: 'Citación', document: 'Documento', mail_delivery: 'Entrega de correo',
  'seed.completed': 'Carga inicial', seed_completed: 'Carga inicial', update_profile: 'Actualización de perfil', deactivate: 'Desactivación',
  attendance_updated: 'Asistencia actualizada', sige_config_updated: 'Configuración SIGE', admission_status: 'Postulación actualizada',
  annual_results_finalized: 'Cierre anual', annual_results_rectified: 'Rectificación anual', School: 'Colegio', school: 'Colegio',
  tenant_enter: 'Ingreso a colegio', impersonation_start: 'Impersonación', impersonation_stop: 'Fin de impersonación',
};
export const citationStatusLabels = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};
export function formatDate(value) {
  if (!value || value === '—') return '—';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', ...(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Santiago' } : {}) }).format(date);
}
export const formatCurrency = value => value == null || value === '—' || !Number.isFinite(Number(value)) ? '—' : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value));
export function formatRut(value) { const clean = String(value || '').replace(/[.\s-]/g, '').toUpperCase(); return /^\d{1,8}[\dK]$/.test(clean) ? `${clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${clean.at(-1)}` : (value || '—'); }
export function formatCell(key, value, context = '') {
  if (value == null || value === '' || value === '—') return '—';
  if (key === 'payloadSummary') {
    const text = String(value).trim();
    if (!text || text === '{}' || text === 'null') return 'Sin detalle adicional';
    if (text.startsWith('{') || text.startsWith('[')) return 'Cambio registrado en el sistema';
    return text;
  }
  if (typeof value === 'object') return 'Cambio registrado';
  if (['amount', 'monthlySalary', 'balance'].includes(key)) return formatCurrency(value);
  if (/^(date|.*At|.*On)$/.test(key) || /^\d{4}-\d{2}-\d{2}(T|$)/.test(String(value))) return formatDate(value);
  if (['taxId', 'counterpartyTaxId', 'rut', 'nationalId', 'national_id'].includes(key)) return formatRut(value);
  if (context === 'citation' && key === 'status' && citationStatusLabels[value]) return citationStatusLabels[value];
  if (['status', 'method', 'contractType', 'severity', 'action', 'entity', 'channel', 'audience', 'kind', 'emailStatus'].includes(key)) {
    return enumLabels[value] || enumLabels[String(value).replace(/\./g, '_')] || (/^[a-z]+(?:[._][a-z]+)*$/.test(String(value))
      ? String(value).replace(/[._]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
      : value);
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return value;
}
