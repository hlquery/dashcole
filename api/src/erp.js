import { queueWhatsApp, whatsappConfig, resolveGuardianAudienceUser, resolveStudentAudienceUsers } from './services/whatsapp.js';
import { moduleSummary } from './services/summaries.js';
import { isValidDate, isValidMoney, isValidRut } from './validation.js';
import { createUpload, safeUploadPath, tenantUploadKey } from './uploads.js';
import { documentScope } from './document-access.js';
import { createCommunication, enqueueMail } from './services/mail.js';
import { isSmtpConfigured } from './services/smtp-config.js';
import { canAccessCourse } from './academics.js';
import { ApiError } from './http.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { models, sequelize } from './database.js';
import { setTenantMembershipAccess } from './tenant-identity.js';
import { Op } from 'sequelize';
import { encryptSecret } from './services/secret-config.js';
import { teacherOwnedCourseIdsSql, teacherOwnedCourseIdsParams } from './services/teacher-scope.js';
import {
  createInstitutionalPdf,
  writeInstitutionalHeader,
  drawSummaryCards,
  drawSectionTitle,
  drawTable,
  drawSignatures,
  drawFooterDisclaimer,
  pdfCurrency,
  pdfPeriod,
} from './services/finance-pdf.js';
import { signatureSlotsForExport } from './services/pdf-signature.js';
import { buildFinanceExcel } from './services/finance-excel.js';
import { validatePayrollProfile, estimateGrossFromNet, defaultHirePayrollProfile } from './services/payroll-calculator.js';
import { defaultPayrollConfig } from './services/payroll-defaults.js';
import { CHILE_AFPS, CHILE_ISAPRES } from './services/previred.js';

const invoiceUpload = createUpload({ kind: 'invoice' });
const observationUpload = createUpload({ kind: 'document' });

function requireFinance(req, res, next) {
  if (!canManageFinance(req.user)) return res.status(403).json({ message: 'No tienes permiso para gestionar documentos de cobro.' });
  next();
}

function moduleCatalog() {
  return {
    classbook: {
      title: 'Libro de clases',
      description: 'Anotaciones positivas, negativas y generales del estudiante.',
      sections: [
        ['Observaciones', models.Observation, [['studentName', 'Estudiante'], ['courseName', 'Curso'], ['kind', 'Tipo'], ['detail', 'Detalle'], ['createdByName', 'Registrado por'], ['attachmentName', 'Adjunto'], ['createdAt', 'Registro']]],
      ],
    },
    finance: {
      title: 'Finanzas',
      description: 'Aranceles, pagos, gastos, proveedores y centros de costo.',
      sections: [
        ['Documentos de cobro', models.Invoice, [['number', 'Número'], ['studentId', 'Estudiante ID'], ['supplierId', 'Proveedor ID'], ['amount', 'Monto'], ['dueOn', 'Vencimiento'], ['status', 'Estado']]],
        ['Pagos', models.Payment, [['invoiceId', 'Documento ID'], ['amount', 'Monto'], ['paidAt', 'Fecha'], ['method', 'Medio']]],
        ['Gastos', models.Expense, [['concept', 'Concepto'], ['amount', 'Monto'], ['spentOn', 'Fecha'], ['costCenter', 'Centro de costo']]],
        ['Proveedores', models.Supplier, [['name', 'Nombre'], ['taxId', 'RUT'], ['email', 'Correo']]],
      ],
    },
    inventory: {
      title: 'Inventario',
      description: 'Stock, activos, bodegas y responsables.',
      sections: [
        ['Productos y activos', models.InventoryItem, [['sku', 'SKU'], ['name', 'Nombre'], ['stock', 'Stock'], ['minimumStock', 'Mínimo'], ['responsible', 'Responsable']]],
      ],
    },
    hr: {
      title: 'Recursos humanos',
      description: 'Personal, contratos, cargos y vigencia laboral.',
      sections: [
        ['Empleados', models.Employee, [['fullName', 'Empleado'], ['position', 'Cargo'], ['contractType', 'Contrato'], ['workModality', 'Modalidad'], ['hiredOn', 'Ingreso'], ['endedOn', 'Hasta'], ['monthlySalary', 'Sueldo mensual']]],
      ],
    },
    coexistence: {
      title: 'Convivencia escolar',
      description: 'Incidentes, protocolos y seguimiento estudiantil.',
      sections: [
        ['Casos', models.Incident, [['occurredOn', 'Fecha'], ['studentId', 'Estudiante ID'], ['severity', 'Severidad'], ['detail', 'Detalle'], ['status', 'Estado']]],
      ],
    },
    citations: {
      title: 'Citaciones a apoderados',
      description: 'Reuniones citadas con apoderados y aviso por correo.',
      sections: [
        ['Citaciones', models.Citation, [
          ['scheduledOn', 'Fecha'],
          ['scheduledTime', 'Hora'],
          ['studentName', 'Estudiante'],
          ['guardianName', 'Apoderado'],
          ['location', 'Lugar'],
          ['reason', 'Motivo'],
          ['emailStatus', 'Correo'],
          ['status', 'Estado'],
        ]],
      ],
    },
    communications: {
      title: 'Comunicaciones',
      description: 'Correos y notificaciones del colegio.',
      sections: [
        ['Comunicados', models.Communication, [['channel', 'Canal'], ['audience', 'Destinatarios'], ['recipientCount', 'Personas'], ['senderName', 'Enviado por'], ['subject', 'Asunto'], ['body', 'Mensaje'], ['sentAt', 'Envío']]],
      ],
    },
    documents: {
      title: 'Documentos',
      description: 'Certificados, informes, matrículas y contratos.',
      sections: [
        ['Archivos', models.Document, [['kind', 'Tipo'], ['name', 'Nombre'], ['studentName', 'Estudiante'], ['employeeName', 'Empleado'], ['createdAt', 'Registro']]],
      ],
    },
    history: {
      title: 'Historial',
      description: 'Registro de auditoría: altas, bajas y cambios sensibles del colegio.',
      sections: [
        ['Registro de auditoría', models.AuditLog, [['action', 'Acción'], ['entity', 'Ámbito'], ['actorName', 'Responsable'], ['payloadSummary', 'Detalle'], ['createdAt', 'Fecha']]],
      ],
    },
  };
}

const financialModuleKeys = new Set(['finance', 'inventory', 'hr', 'coexistence']);
function isFinancialAgent(user) { return ['finance', 'agente_finanzas'].includes(user.role); }
const accountabilityRoles = new Set(['director', 'manager', 'monitor', 'school_admin', 'super_admin', 'utp']);
function canManageAccountability(user) { return accountabilityRoles.has(user.role); }
function canAccessModule(user, key) {
  if (isFinancialAgent(user)) return financialModuleKeys.has(key) || key === 'documents';
  if (['guardian', 'student'].includes(user.role)) return false;
  if (key === 'history') return Boolean(user.permissions?.manageUsers);
  if (user.role === 'teacher') return !['finance', 'hr', 'inventory'].includes(key);
  if (user.role === 'monitor') return true;
  if (key === 'citations') return true;
  if (key === 'finance') return Boolean(user.permissions?.manageFinance) || user.permissions?.manageUsers || user.permissions?.manageSchool;
  if (key === 'hr') return Boolean(user.permissions?.manageHr) || user.permissions?.manageUsers || user.permissions?.manageSchool;
  return true;
}

function canWriteClassbook(user) {
  if (!user || ['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(user.role)) return false;
  return canAccessModule(user, 'classbook');
}

/** Profesor jefe, profesor de asignatura, UTP y administración pueden gestionar anotaciones del curso. */
async function canManageObservationRecord(user, observation) {
  if (!canWriteClassbook(user) || !observation) return false;
  if (user.permissions?.manageSchool || ['super_admin', 'school_admin', 'director', 'manager', 'utp'].includes(user.role)) {
    return true;
  }
  if (user.role !== 'teacher') return true;
  if (Number(observation.createdBy) === Number(user.id)) return true;
  const courseId = Number(observation.courseId || observation.course_id || 0);
  if (!Number.isInteger(courseId) || courseId < 1) return false;
  return canAccessCourse(user, courseId);
}

function canManageFinance(user) {
  return ['director', 'school_admin', 'super_admin', 'finance', 'agente_finanzas'].includes(user.role) || Boolean(user.permissions?.manageFinance);
}

async function assertObservationCourse(user, studentId, courseId) {
  const id = Number(courseId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona el curso o asignatura donde ocurrió la anotación.');
  }
  const course = await models.Course.findOne({ where: { id, schoolId: user.schoolId }, raw: true });
  if (!course) throw new ApiError(400, 'VALIDATION_ERROR', 'Curso no encontrado.');
  if (!(await canAccessCourse(user, id))) {
    throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso a ese curso.');
  }
  const modules = await models.Course.findAll({
    where: {
      schoolId: user.schoolId,
      name: course.name,
      section: course.section,
      academicYearId: course.academicYearId,
    },
    attributes: ['id'],
    raw: true,
  });
  const enrolled = await models.Enrollment.count({
    where: {
      schoolId: user.schoolId,
      studentId,
      courseId: modules.map((row) => row.id),
      status: { [Op.ne]: 'withdrawn' },
    },
  });
  if (!enrolled) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'El estudiante no está matriculado en ese curso.');
  }
  return course;
}

/** Cobro: pagado/vencido/pendiente se calcula solo con pagos y fecha. Solo "cancelled" es manual. */
function deriveInvoiceStatus({ status, amount, dueOn, paidTotal = 0, today }) {
  if (status === 'cancelled') return 'cancelled';
  const remaining = Math.max(0, Number(amount) - Number(paidTotal || 0));
  if (remaining <= 0.009) return 'paid';
  if (dueOn && String(dueOn) < String(today)) return 'overdue';
  return 'pending';
}

function recordValue(record, key) {
  if (record[key] !== undefined && record[key] !== null) return record[key];
  const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  if (snake !== key && record[snake] !== undefined && record[snake] !== null) return record[snake];
  return record[key] ?? record[snake] ?? null;
}

function serialize(value, key) {
  if (value instanceof Date) return value.toISOString();
  if (key === 'payloadSummary' && typeof value === 'object') return JSON.stringify(value);
  if (key === 'active') return value ? 'Sí' : 'No';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return value ?? '—';
}

const auditActionLabels = {
  'seed.completed': 'Carga inicial',
  seed_completed: 'Carga inicial',
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  deactivate: 'Desactivación',
  update_profile: 'Actualización de perfil',
  attendance_updated: 'Asistencia actualizada',
  sige_config_updated: 'Configuración SIGE',
  admission_status: 'Postulación actualizada',
  annual_results_finalized: 'Cierre anual',
  annual_results_rectified: 'Rectificación de cierre anual',
  annual_acta_closed: 'Cierre anual bloqueado',
  annual_acta_reopened: 'Cierre anual reabierto',
  closure_teacher_submit: 'Cierre · enviado a UTP',
  closure_utp_approve: 'Cierre · aprobado por UTP',
  closure_utp_request_fix: 'Cierre · correcciones solicitadas',
  closure_director_approve: 'Cierre · autorizado por dirección',
  closure_locked: 'Cierre · bloqueado',
  closure_reopened: 'Cierre · reabierto',
  closure_student_resolution: 'Cierre · resolución de estudiante',
  closure_sige_codes_updated: 'Cierre · códigos SIGE',
  annual_results_rectified: 'Rectificación anual',
  sent: 'Envío',
  failed: 'Fallo de entrega',
  database_server_create: 'Servidor SQL creado',
  database_server_update: 'Servidor SQL actualizado',
  database_server_delete: 'Servidor SQL eliminado',
  tenant_create: 'Colegio creado',
  tenant_enter: 'Ingreso a colegio',
  tenant_suspend: 'Colegio suspendido',
  tenant_activate: 'Colegio reactivado',
  tenant_database_move: 'Base movida',
  tenant_plan_update: 'Plan actualizado',
  tenant_domain_create: 'Dominio agregado',
};

const auditEntityLabels = {
  School: 'Colegio',
  school: 'Colegio',
  user: 'Cuenta',
  student: 'Estudiante',
  employee: 'Empleado',
  course: 'Curso',
  grade: 'Calificación',
  communication: 'Comunicación',
  citation: 'Citación',
  document: 'Documento',
  mail_delivery: 'Entrega de correo',
  sige_integration: 'Integración SIGE',
  admission: 'Postulación',
  database_server: 'Servidor SQL',
};

function summarizeAuditPayload(action, payload) {
  if (!payload || typeof payload !== 'object') return 'Sin detalle adicional';
  if (payload.detail) return String(payload.detail);
  if (action === 'seed.completed' || action === 'seed_completed') {
    return 'Se cargaron los datos iniciales de demostración del colegio.';
  }
  if (action === 'update_profile') {
    return `Perfil actualizado${payload.fullName ? `: ${payload.fullName}` : ''}`;
  }
  if (action === 'deactivate') {
    return payload.reason || 'El registro quedó inactivo y se conservó el historial.';
  }
  if (action === 'create' && payload.channel) {
    return `Comunicado por ${payload.channel}${payload.recipients != null ? ` · ${payload.recipients} destinatarios` : ''}`;
  }
  if (action === 'attendance_updated') {
    return `Asistencia del ${payload.date || 'día'} · ${payload.records || 0} registros`;
  }
  if (action === 'admission_status') {
    return `Estado de postulación: ${payload.status || 'actualizado'}`;
  }
  if (action === 'annual_results_finalized' || action === 'annual_results_rectified') {
    return `${payload.courseName || 'Curso'} ${payload.section || ''} · ${payload.students || 0} estudiantes`.trim();
  }
  if (String(action || '').startsWith('closure_') || action === 'annual_acta_closed' || action === 'annual_acta_reopened') {
    return `${payload.courseName || 'Curso'} ${payload.section || ''}${payload.comment ? ` · ${payload.comment}` : ''}`.trim();
  }
  if (payload.platform) return 'Acción de consola de plataforma';
  const keys = Object.keys(payload).filter((key) => !['platform'].includes(key));
  if (!keys.length) return 'Sin detalle adicional';
  return 'Cambio registrado en el sistema';
}

function accountabilityYear(value) {
  const year = Number(value || new Date().getFullYear());
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null;
}


function validateAccountabilityEntry(body) {
  const entry = {
    period: String(body.period || '').trim(),
    movementType: String(body.movementType || '').trim(),
    fundingSource: String(body.fundingSource || '').trim(),
    category: String(body.category || '').trim(),
    documentType: String(body.documentType || '').trim(),
    documentNumber: String(body.documentNumber || '').trim(),
    counterparty: String(body.counterparty || '').trim(),
    counterpartyTaxId: String(body.counterpartyTaxId || '').trim() || null,
    description: String(body.description || '').trim(),
    amount: Number(body.amount),
    status: String(body.status || 'draft').trim(),
  };
  if (!isValidDate(`${entry.period}-01`)) return { error: 'Selecciona un período válido.' };
  if (!['income', 'expense'].includes(entry.movementType)) return { error: 'Selecciona ingreso o egreso.' };
  if (!entry.fundingSource || entry.fundingSource.length > 100) return { error: 'Selecciona el origen del recurso.' };
  if (!entry.category || entry.category.length > 100) return { error: 'Selecciona una categoría.' };
  if (!entry.documentType || !entry.documentNumber || entry.documentNumber.length > 80) return { error: 'Completa el documento de respaldo.' };
  if (!entry.counterparty || entry.counterparty.length > 160) return { error: 'Completa la contraparte.' };
  if (!entry.description || entry.description.length > 500) return { error: 'Agrega una descripción.' };
  if (!isValidMoney(body.amount, 999999999999.99) || entry.amount <= 0) return { error: 'Ingresa un monto válido.' };
  if (entry.counterpartyTaxId && !isValidRut(entry.counterpartyTaxId)) return { error: 'Ingresa un RUT válido.' };
  if (!['draft', 'verified'].includes(entry.status)) return { error: 'Selecciona un estado válido.' };
  return { entry: { ...entry, period: `${entry.period}-01` } };
}

export function registerErpRoutes(app) {
  app.post('/api/coexistence/incidents', async (req, res) => {
    if (['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(req.user.role) || !canAccessModule(req.user, 'coexistence')) {
      return res.status(403).json({ message: 'No tienes permiso para agregar registros.' });
    }
    const studentId = Number(req.body.studentId);
    const detail = String(req.body.detail || '').trim();
    if (!Number.isSafeInteger(studentId) || studentId < 1 || !await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })) {
      return res.status(400).json({ message: 'Selecciona un estudiante del colegio.' });
    }
    if (detail.length < 5 || detail.length > 5000) return res.status(400).json({ message: 'El detalle debe tener entre 5 y 5000 caracteres.' });
    if (!isValidDate(req.body.occurredOn) || !['low', 'medium', 'high'].includes(req.body.severity)) {
      return res.status(400).json({ message: 'Revisa la fecha y gravedad del caso.' });
    }
    res.status(201).json(await models.Incident.create({
      schoolId: req.user.schoolId,
      studentId,
      detail,
      createdBy: req.user.id,
      occurredOn: req.body.occurredOn,
      severity: req.body.severity,
      status: 'open',
    }));
  });

  app.post('/api/citations', async (req, res) => {
    if (['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(req.user.role) || !canAccessModule(req.user, 'citations')) {
      return res.status(403).json({ message: 'No tienes permiso para citar apoderados.' });
    }
    const studentId = Number(req.body.studentId);
    const guardianId = Number(req.body.guardianId);
    const scheduledOn = String(req.body.scheduledOn || '').trim();
    const scheduledTime = String(req.body.scheduledTime || '').trim();
    const location = String(req.body.location || 'Dirección del colegio').trim().slice(0, 180);
    const reason = String(req.body.reason || '').trim();
    if (!Number.isSafeInteger(studentId) || studentId < 1) {
      return res.status(400).json({ message: 'Selecciona un estudiante.' });
    }
    if (!Number.isSafeInteger(guardianId) || guardianId < 1) {
      return res.status(400).json({ message: 'Selecciona un apoderado.' });
    }
    if (!isValidDate(scheduledOn) || !/^\d{2}:\d{2}$/.test(scheduledTime)) {
      return res.status(400).json({ message: 'Indica fecha y hora válidas para la citación.' });
    }
    if (reason.length < 5 || reason.length > 5000) {
      return res.status(400).json({ message: 'El motivo debe tener entre 5 y 5000 caracteres.' });
    }
    if (!location) return res.status(400).json({ message: 'Indica el lugar de la citación.' });

    const student = await models.Student.findOne({
      where: { id: studentId, schoolId: req.user.schoolId },
      attributes: ['id', 'firstName', 'lastName'],
      raw: true,
    });
    if (!student) return res.status(400).json({ message: 'Estudiante no encontrado.' });
    const guardian = await models.Guardian.findOne({
      where: { id: guardianId, schoolId: req.user.schoolId },
      attributes: ['id', 'fullName', 'email', 'userId'],
      raw: true,
    });
    if (!guardian) return res.status(400).json({ message: 'Apoderado no encontrado.' });
    const linked = await models.StudentGuardian.count({ where: { studentId, guardianId } });
    if (!linked) return res.status(400).json({ message: 'Ese apoderado no está vinculado al estudiante.' });

    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Estudiante #${student.id}`;
    const guardianEmail = String(guardian.email || '').trim().toLowerCase();
    let emailStatus = 'skipped';
    let mailQueued = false;

    const citation = await models.Citation.create({
      schoolId: req.user.schoolId,
      studentId,
      guardianId,
      scheduledOn,
      scheduledTime,
      location,
      reason,
      status: 'scheduled',
      emailStatus,
      createdBy: req.user.id,
    });

    const school = await models.School.findByPk(req.user.schoolId, { raw: true });
    if (guardianEmail && await isSmtpConfigured()) {
      await enqueueMail({
        user: req.user,
        template: 'citation',
        recipient: guardianEmail,
        key: citation.id,
        payload: {
          email: guardianEmail,
          guardianName: guardian.fullName,
          studentName,
          schoolName: school?.name || 'Colegio',
          scheduledOn,
          scheduledTime,
          location,
          reason,
          school: school ? {
            name: school.name,
            phone: school.phone,
            email: school.email,
            website: school.website,
            address: school.address,
          } : null,
        },
      });
      emailStatus = 'queued';
      mailQueued = true;
      await citation.update({ emailStatus });
    } else if (!guardianEmail) {
      emailStatus = 'skipped';
      await citation.update({ emailStatus });
    } else {
      emailStatus = 'skipped';
      await citation.update({ emailStatus });
    }

    if (guardian.userId) {
      await models.UserNotification.create({
        schoolId: req.user.schoolId,
        userId: guardian.userId,
        studentId,
        subject: `Citación: ${studentName}`,
        body: `Te citaron el ${scheduledOn} a las ${scheduledTime} en ${location}.`,
        createdBy: req.user.id,
      });
    }

    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'citation',
      entityId: citation.id,
      action: 'create',
      payload: { studentId, guardianId, scheduledOn, scheduledTime, emailStatus },
    });

    res.status(201).json({
      citation: {
        ...citation.get({ plain: true }),
        studentName,
        guardianName: guardian.fullName,
        emailStatus,
      },
      mail: {
        queued: mailQueued,
        status: emailStatus,
        recipient: guardianEmail || null,
        message: mailQueued
          ? `Correo de citación encolado para ${guardianEmail}.`
          : (guardianEmail ? 'SMTP no configurado: la citación se guardó sin enviar correo.' : 'El apoderado no tiene correo: la citación se guardó sin notificar.'),
      },
    });
  });

  app.put('/api/citations/:id/status', async (req, res) => {
    if (['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(req.user.role) || !canAccessModule(req.user, 'citations')) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar citaciones.' });
    }
    const status = String(req.body.status || '').trim();
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Estado de citación inválido.' });
    }
    const citation = await models.Citation.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!citation) return res.status(404).json({ message: 'Citación no encontrada.' });
    await citation.update({ status });
    res.json({ citation });
  });

  app.get('/api/classbook/observations/:id', async (req, res) => {
    if (!canAccessModule(req.user, 'classbook')) {
      return res.status(403).json({ message: 'No tienes permiso para ver anotaciones.' });
    }
    const observationId = Number(req.params.id);
    if (!Number.isInteger(observationId) || observationId < 1) {
      return res.status(400).json({ message: 'Anotación inválida.' });
    }
    const observation = await models.Observation.findOne({
      where: { id: observationId, schoolId: req.user.schoolId },
      raw: true,
    });
    if (!observation) return res.status(404).json({ message: 'Anotación no encontrada.' });
    if (req.user.role === 'teacher') {
      const [taughtCourses] = await sequelize.query(teacherOwnedCourseIdsSql(), {
        replacements: teacherOwnedCourseIdsParams(req.user),
      });
      const taughtIds = taughtCourses.map((course) => Number(course.id));
      const courseId = Number(observation.courseId || observation.course_id || 0);
      const own = Number(observation.createdBy) === Number(req.user.id);
      if (!own && (!taughtIds.includes(courseId))) {
        return res.status(403).json({ message: 'No tienes acceso a esta anotación.' });
      }
    }
    const student = await models.Student.findOne({
      where: { id: observation.studentId, schoolId: req.user.schoolId },
      attributes: ['id', 'firstName', 'lastName'],
      raw: true,
    });
    const course = observation.courseId
      ? await models.Course.findOne({
        where: { id: observation.courseId, schoolId: req.user.schoolId },
        attributes: ['id', 'name', 'section', 'subject'],
        raw: true,
      })
      : null;
    const author = observation.createdBy
      ? await models.User.findOne({
        where: { id: observation.createdBy, schoolId: req.user.schoolId },
        attributes: ['id', 'fullName', 'role', 'username'],
        raw: true,
      })
      : null;
    const roleLabels = {
      teacher: 'Profesor',
      utp: 'Jefe de UTP',
      director: 'Director',
      manager: 'Equipo directivo',
      school_admin: 'Administración',
      super_admin: 'Administración',
    };
    res.json({
      id: observation.id,
      kind: observation.kind,
      detail: observation.detail,
      studentId: observation.studentId,
      studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : null,
      courseId: observation.courseId || null,
      courseName: course ? `${course.name} ${course.section} · ${course.subject}`.trim() : null,
      attachmentName: observation.attachmentName || null,
      hasAttachment: Boolean(observation.attachmentKey),
      createdAt: observation.createdAt || observation.created_at,
      createdBy: observation.createdBy || null,
      createdByName: author?.fullName || author?.username || 'Usuario del colegio',
      createdByRole: author?.role || null,
      createdByRoleLabel: roleLabels[author?.role] || author?.role || null,
      canManage: await canManageObservationRecord(req.user, observation),
    });
  });

  app.post('/api/classbook/observations', (req, res, next) => {
    const contentType = String(req.headers['content-type'] || '');
    if (contentType.includes('multipart/form-data')) return observationUpload.single('file')(req, res, next);
    return next();
  }, async (req, res) => {
    if (!canWriteClassbook(req.user)) {
      return res.status(403).json({ message: 'No tienes permiso para agregar registros.' });
    }
    const studentId = Number(req.body.studentId);
    const courseId = Number(req.body.courseId);
    const detail = String(req.body.detail || '').trim();
    const kind = String(req.body.kind || '').trim();
    if (!Number.isSafeInteger(studentId) || studentId < 1 || !await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })) {
      return res.status(400).json({ message: 'Selecciona un estudiante del colegio.' });
    }
    if (detail.length < 5 || detail.length > 5000) return res.status(400).json({ message: 'El detalle debe tener entre 5 y 5000 caracteres.' });
    if (!['positive', 'negative', 'general'].includes(kind)) return res.status(400).json({ message: 'Tipo de anotación inválido.' });
    await assertObservationCourse(req.user, studentId, courseId);
    if (req.user.role === 'teacher') {
      const [taughtCourses] = await sequelize.query(teacherOwnedCourseIdsSql(), {
        replacements: teacherOwnedCourseIdsParams(req.user),
      });
      const taughtIds = taughtCourses.map((course) => course.id);
      const assigned = taughtIds.length
        ? await models.Enrollment.count({ where: { schoolId: req.user.schoolId, studentId, courseId: taughtIds, status: { [Op.ne]: 'withdrawn' } } })
        : 0;
      if (!assigned) return res.status(403).json({ message: 'Solo puedes anotar estudiantes de tus cursos asignados.' });
    }
    const attachmentName = req.file ? path.basename(req.file.originalname).slice(0, 255) : null;
    const attachmentKey = req.file
      ? tenantUploadKey(req.user.schoolId, `observation-${crypto.randomUUID()}${path.extname(attachmentName).toLowerCase()}`)
      : null;
    if (req.file) {
      const filename = safeUploadPath(attachmentKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    }
    try {
      const observation = await models.Observation.create({
        schoolId: req.user.schoolId,
        studentId,
        courseId,
        detail,
        kind,
        createdBy: req.user.id,
        attachmentName,
        attachmentKey,
      });
      res.status(201).json(observation);
    } catch (error) {
      if (attachmentKey) await fs.unlink(safeUploadPath(attachmentKey)).catch(() => {});
      throw error;
    }
  });

  app.put('/api/classbook/observations/:id', (req, res, next) => {
    const contentType = String(req.headers['content-type'] || '');
    if (contentType.includes('multipart/form-data')) return observationUpload.single('file')(req, res, next);
    return next();
  }, async (req, res) => {
    if (!canWriteClassbook(req.user)) {
      return res.status(403).json({ message: 'No tienes permiso para modificar anotaciones.' });
    }
    const observation = await models.Observation.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!observation) return res.status(404).json({ message: 'Anotación no encontrada.' });
    if (!(await canManageObservationRecord(req.user, observation))) {
      return res.status(403).json({ message: 'Solo el profesor jefe, el profesor de la asignatura, UTP o administración pueden modificar esta anotación.' });
    }
    const studentId = Number(req.body.studentId);
    const courseId = Number(req.body.courseId);
    const detail = String(req.body.detail || '').trim();
    const kind = String(req.body.kind || '').trim();
    if (!Number.isSafeInteger(studentId) || studentId < 1 || !await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })) {
      return res.status(400).json({ message: 'Selecciona un estudiante del colegio.' });
    }
    if (detail.length < 5 || detail.length > 5000) return res.status(400).json({ message: 'El detalle debe tener entre 5 y 5000 caracteres.' });
    if (!['positive', 'negative', 'general'].includes(kind)) return res.status(400).json({ message: 'Tipo de anotación inválido.' });
    await assertObservationCourse(req.user, studentId, courseId);
    if (req.user.role === 'teacher') {
      const [taughtCourses] = await sequelize.query(teacherOwnedCourseIdsSql(), {
        replacements: teacherOwnedCourseIdsParams(req.user),
      });
      const taughtIds = taughtCourses.map((course) => course.id);
      const assigned = taughtIds.length
        ? await models.Enrollment.count({ where: { schoolId: req.user.schoolId, studentId, courseId: taughtIds, status: { [Op.ne]: 'withdrawn' } } })
        : 0;
      if (!assigned) return res.status(403).json({ message: 'Solo puedes anotar estudiantes de tus cursos asignados.' });
    }
    const removeAttachment = ['1', 'true', 'yes'].includes(String(req.body.removeAttachment || '').toLowerCase());
    const previousKey = observation.attachmentKey || null;
    let attachmentName = observation.attachmentName || null;
    let attachmentKey = previousKey;
    if (req.file) {
      attachmentName = path.basename(req.file.originalname).slice(0, 255);
      attachmentKey = tenantUploadKey(req.user.schoolId, `observation-${crypto.randomUUID()}${path.extname(attachmentName).toLowerCase()}`);
      const filename = safeUploadPath(attachmentKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    } else if (removeAttachment) {
      attachmentName = null;
      attachmentKey = null;
    }
    try {
      await observation.update({ studentId, courseId, detail, kind, attachmentName, attachmentKey });
      if ((req.file || removeAttachment) && previousKey && previousKey !== attachmentKey) {
        await fs.unlink(safeUploadPath(previousKey)).catch(() => {});
      }
      res.json({ observation });
    } catch (error) {
      if (req.file && attachmentKey) await fs.unlink(safeUploadPath(attachmentKey)).catch(() => {});
      throw error;
    }
  });

  app.delete('/api/classbook/observations/:id', async (req, res) => {
    if (!canWriteClassbook(req.user)) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar anotaciones.' });
    }
    const observation = await models.Observation.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!observation) return res.status(404).json({ message: 'Anotación no encontrada.' });
    if (!(await canManageObservationRecord(req.user, observation))) {
      return res.status(403).json({ message: 'Solo el profesor jefe, el profesor de la asignatura, UTP o administración pueden eliminar esta anotación.' });
    }
    const attachmentKey = observation.attachmentKey;
    await observation.destroy();
    if (attachmentKey) await fs.unlink(safeUploadPath(attachmentKey)).catch(() => {});
    res.status(204).end();
  });

  app.put('/api/coexistence/incidents/:id', async (req, res) => {
    if (['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(req.user.role) || !canAccessModule(req.user, 'coexistence')) {
      return res.status(403).json({ message: 'No tienes permiso para modificar casos.' });
    }
    const incident = await models.Incident.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!incident) return res.status(404).json({ message: 'Caso no encontrado.' });
    const studentId = Number(req.body.studentId);
    const detail = String(req.body.detail || '').trim();
    const status = String(req.body.status || incident.status);
    if (!Number.isSafeInteger(studentId) || studentId < 1 || !await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })) {
      return res.status(400).json({ message: 'Selecciona un estudiante del colegio.' });
    }
    if (detail.length < 5 || detail.length > 5000) return res.status(400).json({ message: 'El detalle debe tener entre 5 y 5000 caracteres.' });
    if (!isValidDate(req.body.occurredOn) || !['low', 'medium', 'high'].includes(req.body.severity)) {
      return res.status(400).json({ message: 'Revisa la fecha y gravedad del caso.' });
    }
    if (!['open', 'in_progress', 'closed'].includes(status)) return res.status(400).json({ message: 'Estado inválido.' });
    await incident.update({
      studentId,
      detail,
      occurredOn: req.body.occurredOn,
      severity: req.body.severity,
      status,
    });
    res.json({ incident });
  });

  app.get('/api/enrollments/summary', async (req, res) => {
    if (!req.user.permissions?.manageUsers) return res.status(403).json({ message: 'No tienes permiso para consultar matrículas.' });
    const schoolId = req.user.schoolId;
    const today = new Date().toISOString().slice(0, 10);
    const [enrollments, students, courses, invoices, payments] = await Promise.all([
      models.Enrollment.findAll({ where: { schoolId, status: 'active' }, raw: true }),
      models.Student.findAll({ where: { schoolId }, raw: true }),
      models.Course.findAll({ where: { schoolId }, raw: true }),
      models.Invoice.findAll({ where: { schoolId }, raw: true }),
      models.Payment.findAll({ where: { schoolId }, raw: true }),
    ]);
    const paymentsByInvoice = payments.reduce((map, row) => {
      const list = map.get(row.invoiceId) || [];
      list.push(row);
      map.set(row.invoiceId, list);
      return map;
    }, new Map());
    res.json(students.filter(student => enrollments.some(row => row.studentId === student.id)).map(student => {
      const studentInvoices = invoices.filter(row => row.studentId === student.id);
      const activeInvoices = studentInvoices.filter(row => row.status !== 'cancelled');
      const invoiceById = new Map(studentInvoices.map(row => [row.id, row]));
      const paymentHistory = payments.filter(row => invoiceById.has(row.invoiceId)).map(row => {
        const invoice = invoiceById.get(row.invoiceId);
        return {
          id: row.id,
          amount: Number(row.amount),
          paidAt: row.paidAt,
          method: row.method,
          invoiceId: row.invoiceId,
          invoiceNumber: invoice.number,
          invoiceStatus: invoice.status,
          invoiceDueOn: invoice.dueOn || null,
          invoiceAmount: Number(invoice.amount),
        };
      }).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt) || b.id - a.id);
      const billed = activeInvoices.reduce((sum, row) => sum + Number(row.amount), 0);
      const paid = payments.filter(row => activeInvoices.some(invoice => invoice.id === row.invoiceId)).reduce((sum, row) => sum + Number(row.amount), 0);
      const balance = billed - paid;
      let overdueAmount = 0;
      let overdueCount = 0;
      let pendingCount = 0;
      let nextDueOn = null;
      const openInvoices = [];
      for (const invoice of activeInvoices) {
        const invoicePaid = (paymentsByInvoice.get(invoice.id) || []).reduce((sum, row) => sum + Number(row.amount), 0);
        const remaining = Math.max(0, Number(invoice.amount) - invoicePaid);
        const derivedStatus = deriveInvoiceStatus({
          status: invoice.status,
          amount: invoice.amount,
          dueOn: invoice.dueOn,
          paidTotal: invoicePaid,
          today,
        });
        if (remaining > 0) {
          openInvoices.push({
            id: invoice.id,
            number: invoice.number,
            amount: Number(invoice.amount),
            dueOn: invoice.dueOn || null,
            status: derivedStatus,
            paid: invoicePaid,
            remaining,
          });
          pendingCount += 1;
          const dueOn = invoice.dueOn || null;
          if (derivedStatus === 'overdue') {
            overdueCount += 1;
            overdueAmount += remaining;
          } else if (dueOn && (!nextDueOn || dueOn < nextDueOn)) {
            nextDueOn = dueOn;
          }
        }
      }
      openInvoices.sort((a, b) => String(a.dueOn || '').localeCompare(String(b.dueOn || '')) || a.id - b.id);
      // Estado del estudiante: automático según saldo y vencimientos.
      let paymentStatus = 'sin_cobros';
      if (activeInvoices.length) {
        if (balance <= 0) paymentStatus = 'al_dia';
        else if (overdueCount > 0) paymentStatus = 'vencido';
        else paymentStatus = 'deuda';
      }
      const courseIds = new Set(enrollments.filter(row => row.studentId === student.id).map(row => row.courseId));
      const courseList = [...new Set(courses.filter(row => courseIds.has(row.id)).map(row => `${row.name} · ${row.section}`))];
      return {
        id: student.id,
        name: `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim(),
        avatarColor: student.avatarColor || student.avatar_color || '#DDEEFF',
        avatarKey: student.avatarKey || student.avatar_key || null,
        avatar_key: student.avatarKey || student.avatar_key || null,
        courses: courseList.join(', '),
        courseList,
        billed,
        paid,
        balance,
        lastPaymentAt: paymentHistory[0]?.paidAt || null,
        nextDueOn,
        overdueCount,
        overdueAmount,
        pendingCount,
        paymentStatus,
        paymentHistory,
        openInvoices,
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })));
  });

  app.post('/api/finance/payments', requireFinance, async (req, res) => {
    let invoiceId = Number(req.body.invoiceId || 0);
    const studentId = Number(req.body.studentId || 0);
    const amount = Number(req.body.amount);
    const paidAtRaw = String(req.body.paidAt || '').trim();
    const method = String(req.body.method || 'transfer').trim().toLowerCase();
    const allowedMethods = new Set(['transfer', 'cash', 'card', 'debit', 'credit']);
    if (!isValidMoney(req.body.amount) || amount <= 0) {
      return res.status(400).json({ message: 'Revisa el monto del pago.' });
    }
    if (!isValidDate(paidAtRaw) || !allowedMethods.has(method)) {
      return res.status(400).json({ message: 'Revisa la fecha y el medio de pago.' });
    }

    let invoice = null;
    if (Number.isInteger(invoiceId) && invoiceId > 0) {
      invoice = await models.Invoice.findOne({ where: { id: invoiceId, schoolId: req.user.schoolId } });
      if (!invoice) return res.status(404).json({ message: 'Documento de cobro no encontrado.' });
      if (invoice.status === 'cancelled') return res.status(400).json({ message: 'No puedes pagar un documento anulado.' });
      if (!invoice.studentId) return res.status(400).json({ message: 'El documento no está asociado a un estudiante.' });
    } else if (Number.isInteger(studentId) && studentId > 0) {
      const student = await models.Student.findOne({
        where: { id: studentId, schoolId: req.user.schoolId, active: true },
        attributes: ['id'],
      });
      if (!student) return res.status(404).json({ message: 'Estudiante no encontrado.' });
      const stamp = paidAtRaw.replace(/-/g, '');
      const number = `ABONO-${stamp}-${studentId}-${Date.now().toString(36).toUpperCase()}`;
      invoice = await models.Invoice.create({
        schoolId: req.user.schoolId,
        studentId,
        number,
        amount,
        dueOn: paidAtRaw,
        status: 'pending',
      });
      invoiceId = invoice.id;
    } else {
      return res.status(400).json({ message: 'Selecciona un documento de cobro o un estudiante para el abono.' });
    }

    const existingPaid = Number(await models.Payment.sum('amount', {
      where: { schoolId: req.user.schoolId, invoiceId: invoice.id },
    }) || 0);
    const remaining = Math.max(0, Number(invoice.amount) - existingPaid);
    if (remaining <= 0) return res.status(400).json({ message: 'Este documento ya está pagado.' });
    if (amount > remaining + 0.009) {
      return res.status(400).json({ message: `El monto supera el saldo pendiente (${remaining}).` });
    }

    const paidAt = new Date(`${paidAtRaw}T12:00:00`);
    const payment = await models.Payment.create({
      schoolId: req.user.schoolId,
      invoiceId: invoice.id,
      amount,
      paidAt,
      method,
    });
    const totalPaid = existingPaid + amount;
    const nextStatus = deriveInvoiceStatus({
      status: invoice.status,
      amount: invoice.amount,
      dueOn: invoice.dueOn,
      paidTotal: totalPaid,
      today: new Date().toISOString().slice(0, 10),
    });
    if (invoice.status !== nextStatus) await invoice.update({ status: nextStatus });
    res.status(201).json({
      payment: {
        id: payment.id,
        invoiceId: payment.invoiceId,
        amount: Number(payment.amount),
        paidAt: payment.paidAt,
        method: payment.method,
      },
      invoice: {
        id: invoice.id,
        number: invoice.number,
        status: nextStatus,
        remaining: Math.max(0, Number(invoice.amount) - totalPaid),
      },
    });
  });

  app.post('/api/finance/invoices', requireFinance, invoiceUpload.single('file'), async (req, res) => {
    const number = String(req.body.number || '').trim();
    const studentId = req.body.studentId ? Number(req.body.studentId) : null;
    const supplierId = req.body.supplierId ? Number(req.body.supplierId) : null;
    const amount = Number(req.body.amount);
    const dueOn = String(req.body.dueOn || '').trim();
    // Solo se permite crear como pendiente o anulado; pagado/vencido son automáticos.
    const requested = String(req.body.status || 'pending').trim();
    const status = requested === 'cancelled' ? 'cancelled' : 'pending';
    if (!number || number.length > 50 || !isValidMoney(req.body.amount) || amount <= 0
      || !isValidDate(dueOn) || !['pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Revisa los datos del documento de cobro.' });
    }
    if (studentId !== null && (!Number.isInteger(studentId) || studentId < 1
      || !(await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })))) {
      return res.status(400).json({ message: 'Selecciona un estudiante válido.' });
    }
    if (supplierId !== null && (studentId !== null || !Number.isInteger(supplierId) || supplierId < 1
      || !(await models.Supplier.count({ where: { id: supplierId, schoolId: req.user.schoolId } })))) {
      return res.status(400).json({ message: 'Selecciona un proveedor del colegio o un estudiante, solo uno.' });
    }
    const today = new Date().toISOString().slice(0, 10);
    const derivedStatus = status === 'cancelled'
      ? 'cancelled'
      : deriveInvoiceStatus({ status: 'pending', amount, dueOn, paidTotal: 0, today });
    const attachmentName = req.file ? path.basename(req.file.originalname).slice(0, 255) : null;
    const attachmentKey = req.file ? tenantUploadKey(req.user.schoolId, `invoice-${crypto.randomUUID()}${path.extname(attachmentName).toLowerCase()}`) : null;
    if (req.file) {
      const filename = safeUploadPath(attachmentKey);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, req.file.buffer, { flag: 'wx' });
    }
    let invoice;
    try {
      invoice = await models.Invoice.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        number,
        studentId,
        supplierId,
        amount,
        dueOn,
        status: derivedStatus,
        attachmentName,
        attachmentKey,
      });
    } catch (error) {
      if (attachmentKey) await fs.unlink(safeUploadPath(attachmentKey)).catch(() => {});
      throw error;
    }
    res.status(201).json({ invoice });
  });

  app.get('/api/finance/invoices/:id/download', requireFinance, async (req, res) => {
    const invoice = await models.Invoice.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!invoice?.attachmentKey) return res.status(404).json({ message: 'Documento sin archivo adjunto.' });
    res.download(safeUploadPath(invoice.attachmentKey), invoice.attachmentName);
  });

  app.get('/api/finance/export', async (req, res) => {
    if (!canManageFinance(req.user)) return res.status(403).json({ message: 'No tienes permiso para exportar finanzas.' });
    const year = accountabilityYear(req.query.year);
    const section = String(req.query.section || 'all').trim();
    if (!year) return res.status(400).json({ message: 'Año inválido.' });
    const allowedSections = new Set(['all', 'invoices', 'payments', 'expenses', 'suppliers']);
    if (!allowedSections.has(section)) return res.status(400).json({ message: 'Sección inválida.' });
    const period = { [Op.gte]: `${year}-01-01`, [Op.lt]: `${year + 1}-01-01` };
    const [school, invoices, payments, expenses] = await Promise.all([
      models.School.findByPk(req.user.schoolId, {
        attributes: ['name', 'rbd', 'address', 'schoolType', 'companyRut', 'companyName'],
        raw: true,
      }),
      models.Invoice.findAll({ where: { schoolId: req.user.schoolId, dueOn: period }, order: [['dueOn', 'ASC'], ['id', 'ASC']], raw: true }),
      models.Payment.findAll({ where: { schoolId: req.user.schoolId, paidAt: period }, order: [['paidAt', 'ASC'], ['id', 'ASC']], raw: true }),
      models.Expense.findAll({ where: { schoolId: req.user.schoolId, spentOn: period }, order: [['spentOn', 'ASC'], ['id', 'ASC']], raw: true }),
    ]);
    const supplierIds = [...new Set([
      ...expenses.map((row) => row.supplierId).filter(Boolean),
      ...invoices.map((row) => row.supplierId).filter(Boolean),
    ])];
    const studentIds = [...new Set(invoices.map((row) => row.studentId).filter(Boolean))];
    const invoiceIds = [...new Set(payments.map((row) => row.invoiceId).filter(Boolean))];
    const [suppliers, students, invoiceRefs] = await Promise.all([
      supplierIds.length
        ? models.Supplier.findAll({
          where: { schoolId: req.user.schoolId, id: { [Op.in]: supplierIds } },
          order: [['name', 'ASC'], ['id', 'ASC']],
          raw: true,
        })
        : [],
      studentIds.length
        ? models.Student.findAll({
          where: { schoolId: req.user.schoolId, id: { [Op.in]: studentIds } },
          attributes: ['id', 'firstName', 'lastName'],
          raw: true,
        })
        : [],
      invoiceIds.length
        ? models.Invoice.findAll({
          where: { schoolId: req.user.schoolId, id: { [Op.in]: invoiceIds } },
          attributes: ['id', 'number'],
          raw: true,
        })
        : [],
    ]);
    const supplierMap = new Map(suppliers.map((row) => [row.id, row]));
    const studentMap = new Map(students.map((row) => [row.id, `${row.firstName || ''} ${row.lastName || ''}`.trim()]));
    const invoiceNumberMap = new Map(invoiceRefs.map((row) => [row.id, row.number]));
    const invoiceTotal = invoices.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const paymentTotal = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const include = {
      invoices: section === 'all' || section === 'invoices',
      payments: section === 'all' || section === 'payments',
      expenses: section === 'all' || section === 'expenses',
      suppliers: section === 'all' || section === 'suppliers',
    };
    const sectionLabels = {
      all: 'Todo el año',
      invoices: 'Documentos de cobro',
      payments: 'Pagos',
      expenses: 'Gastos',
      suppliers: 'Proveedores',
    };
    const excelInvoices = invoices.map((row) => ({
      ...row,
      studentName: row.studentId ? (studentMap.get(row.studentId) || `#${row.studentId}`) : '',
      supplierName: row.supplierId ? (supplierMap.get(row.supplierId)?.name || `#${row.supplierId}`) : '',
    }));
    const excelPayments = payments.map((row) => ({
      ...row,
      invoiceNumber: row.invoiceId ? (invoiceNumberMap.get(row.invoiceId) || '') : '',
    }));
    const excelExpenses = expenses.map((row) => {
      const supplier = supplierMap.get(row.supplierId);
      return {
        ...row,
        supplierName: supplier?.name || (row.supplierId ? `#${row.supplierId}` : ''),
        supplierTaxId: supplier?.taxId || '',
      };
    });
    const excelSuppliers = suppliers.map((row) => {
      const linked = expenses.filter((expense) => Number(expense.supplierId) === Number(row.id));
      return {
        ...row,
        expenseCount: linked.length,
        expenseTotal: linked.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      };
    });
    const xml = buildFinanceExcel({
      school,
      year,
      generatedBy: req.user.fullName,
      sectionLabel: sectionLabels[section] || section,
      include,
      invoices: excelInvoices,
      payments: excelPayments,
      expenses: excelExpenses,
      suppliers: excelSuppliers,
      totals: {
        invoicesCount: invoices.length,
        paymentsCount: payments.length,
        expensesCount: expenses.length,
        invoiceTotal,
        paymentTotal,
        expenseTotal,
      },
    });
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="finanzas-${year}.xls"`);
    res.send(Buffer.from(xml, 'utf8'));
  });

  app.get('/api/finance/accountability', async (req, res) => {
    if (!canManageAccountability(req.user)) return res.status(403).json({ message: 'La rendición está disponible para dirección y managers.' });
    const year = accountabilityYear(req.query.year);
    if (!year) return res.status(400).json({ message: 'Año inválido.' });
    const records = await models.AccountabilityEntry.findAll({
      where: { schoolId: req.user.schoolId, period: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
      order: [['period', 'DESC'], ['id', 'DESC']],
      raw: true,
    });
    const income = records.filter((record) => record.movementType === 'income').reduce((total, record) => total + Number(record.amount), 0);
    const expenses = records.filter((record) => record.movementType === 'expense').reduce((total, record) => total + Number(record.amount), 0);
    res.json({ year, records, summary: { income, expenses, balance: income - expenses, verified: records.filter((record) => record.status === 'verified').length } });
  });

  app.post('/api/finance/accountability', async (req, res) => {
    if (!canManageAccountability(req.user)) return res.status(403).json({ message: 'La rendición está disponible para dirección y managers.' });
    const { entry, error } = validateAccountabilityEntry(req.body);
    if (error) return res.status(400).json({ message: error });
    const record = await models.AccountabilityEntry.create({ ...entry, schoolId: req.user.schoolId, createdBy: req.user.id });
    res.status(201).json({ record });
  });

  app.put('/api/finance/accountability/:id/status', async (req, res) => {
    if (!canManageAccountability(req.user)) return res.status(403).json({ message: 'La rendición está disponible para dirección y managers.' });
    const id = Number(req.params.id);
    const status = String(req.body.status || '').trim();
    if (!Number.isInteger(id) || id < 1 || !['draft', 'verified'].includes(status)) return res.status(400).json({ message: 'Selecciona un estado válido.' });
    const record = await models.AccountabilityEntry.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!record) return res.status(404).json({ message: 'Movimiento no encontrado.' });
    await record.update({ status });
    res.json({ record });
  });

  app.get('/api/finance/accountability/export', async (req, res) => {
    if (!canManageAccountability(req.user)) return res.status(403).json({ message: 'La rendición está disponible para dirección y managers.' });
    const year = accountabilityYear(req.query.year);
    if (!year) return res.status(400).json({ message: 'Año inválido.' });
    const [school, records] = await Promise.all([
      models.School.findByPk(req.user.schoolId, {
        attributes: ['name', 'rbd', 'address', 'schoolType', 'companyRut', 'companyName'],
        raw: true,
      }),
      models.AccountabilityEntry.findAll({
        where: { schoolId: req.user.schoolId, period: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
        order: [['period', 'ASC'], ['movementType', 'ASC'], ['id', 'ASC']],
        raw: true,
      }),
    ]);
    const incomeRecords = records.filter((record) => record.movementType === 'income');
    const expenseRecords = records.filter((record) => record.movementType === 'expense');
    const income = incomeRecords.reduce((total, record) => total + Number(record.amount), 0);
    const expenses = expenseRecords.reduce((total, record) => total + Number(record.amount), 0);
    const verified = records.filter((record) => record.status === 'verified').length;

    const byFunding = new Map();
    for (const record of records) {
      const key = record.fundingSource || 'Sin origen';
      const entry = byFunding.get(key) || { fundingSource: key, income: 0, expense: 0 };
      if (record.movementType === 'income') entry.income += Number(record.amount || 0);
      else entry.expense += Number(record.amount || 0);
      byFunding.set(key, entry);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rendicion-cuentas-${year}.pdf"`);
    const doc = createInstitutionalPdf({
      title: `Rendición de cuentas ${year}`,
      author: school?.name || 'DashCole',
      layout: 'landscape',
    });
    doc.pipe(res);
    writeInstitutionalHeader(doc, {
      title: 'RENDICIÓN DE CUENTAS · LIBRO AUXILIAR',
      subtitle: 'Registro de ingresos y egresos por origen de recurso, categoría y documento de respaldo. Preparación para Portal de Transparencia Financiera (Supereduc).',
      school,
      year,
      generatedBy: req.user.fullName,
      orientation: 'landscape',
    });
    drawSummaryCards(doc, [
      { label: 'Ingresos', value: pdfCurrency(income) },
      { label: 'Egresos', value: pdfCurrency(expenses) },
      { label: 'Saldo del período', value: pdfCurrency(income - expenses) },
      { label: 'Movimientos revisados', value: `${verified} / ${records.length}` },
    ], { columns: 4 });

    drawSectionTitle(doc, 'Resumen por origen del recurso');
    drawTable(doc, [
      { label: 'Origen del recurso', width: 280 },
      { label: 'Ingresos', width: 140, align: 'right' },
      { label: 'Egresos', width: 140, align: 'right' },
      { label: 'Saldo', width: 170, align: 'right' },
    ], [...byFunding.values()].map((row) => [
      row.fundingSource,
      pdfCurrency(row.income),
      pdfCurrency(row.expense),
      pdfCurrency(row.income - row.expense),
    ]), { emptyText: 'Sin movimientos por origen de recurso.' });

    drawSectionTitle(doc, `Detalle de movimientos (${records.length})`);
    drawTable(doc, [
      { label: 'Período', width: 52 },
      { label: 'Tipo', width: 48 },
      { label: 'Origen', width: 90 },
      { label: 'Categoría', width: 90 },
      { label: 'Documento', width: 95 },
      { label: 'Contraparte / RUT', width: 125 },
      { label: 'Descripción', width: 140 },
      { label: 'Estado', width: 52 },
      { label: 'Monto', width: 68, align: 'right' },
    ], records.map((record) => [
      pdfPeriod(record.period),
      record.movementType === 'income' ? 'Ingreso' : 'Egreso',
      record.fundingSource,
      record.category,
      `${record.documentType} ${record.documentNumber}`,
      `${record.counterparty}${record.counterpartyTaxId ? ` · ${record.counterpartyTaxId}` : ''}`,
      record.description,
      record.status === 'verified' ? 'Revisado' : 'Borrador',
      pdfCurrency(record.amount),
    ]));

    drawSignatures(doc, {
      slots: signatureSlotsForExport(req.user, [
        'Director/a del establecimiento',
        'Encargado/a de finanzas',
        'Sostenedor/a o representante legal',
      ]),
    });
    drawFooterDisclaimer(doc);
    doc.end();
  });

  app.get('/api/notifications', async (req, res) => {
    const schoolId = req.user.schoolId;
    let communicationWhere = { schoolId, audience: 'all' };
    if (req.user.role === 'student') {
      const me = await models.Student.findOne({
        where: { schoolId, userId: req.user.id, active: true },
        attributes: ['id'],
        raw: true,
      });
      const myStudentId = Number(me?.id || 0);
      const enrollments = myStudentId > 0
        ? await models.Enrollment.findAll({
          where: { schoolId, studentId: myStudentId, status: { [Op.in]: ['active', 'exempt'] } },
          attributes: ['courseId'],
          raw: true,
        })
        : [];
      const courseIds = [...new Set(enrollments.map((row) => Number(row.courseId)).filter((id) => id > 0))];
      communicationWhere = {
        schoolId,
        [Op.or]: [
          { audience: { [Op.in]: ['all', 'students'] } },
          ...(myStudentId > 0 ? [{ audience: 'student', targetStudentId: myStudentId }] : []),
          ...(courseIds.length ? [{ audience: 'course', courseId: { [Op.in]: courseIds } }] : []),
        ],
      };
    } else if (req.user.role === 'guardian') {
      const me = await models.Guardian.findOne({
        where: { schoolId, userId: req.user.id },
        attributes: ['id'],
        raw: true,
      });
      const myGuardianId = Number(me?.id || 0);
      communicationWhere = {
        schoolId,
        [Op.or]: [
          { audience: { [Op.in]: ['all', 'guardians'] } },
          ...(myGuardianId > 0 ? [{ audience: 'guardian', targetGuardianId: myGuardianId }] : []),
        ],
      };
    } else if (req.user.role === 'teacher') {
      communicationWhere = { schoolId, audience: { [Op.in]: ['all', 'teachers'] } };
    } else if (req.user.role === 'manager') {
      communicationWhere = { schoolId, audience: { [Op.in]: ['all', 'managers'] } };
    }
    const [records, personal] = await Promise.all([
      models.Communication.findAll({ where: communicationWhere, order: [['sentAt', 'DESC'], ['id', 'DESC']], limit: 12, raw: true }),
      models.UserNotification.findAll({ where: { schoolId, userId: req.user.id }, order: [['created_at', 'DESC']], limit: 12, raw: true }),
    ]);
    const communications = records.map((record) => ({
      id: record.id,
      channel: record.channel,
      target: `/comunicaciones/${record.id}`,
      subject: record.subject,
      body: record.body,
      sentAt: record.sentAt,
    }));
    const gradeNotifications = personal.map((record) => {
      const studentId = record.studentId || record.student_id;
      const subject = String(record.subject || '');
      const leaveIdMatch = subject.match(/solicitud\s*#(\d+)/i);
      const isLeave = !studentId && (/solicitud/i.test(subject) || Boolean(leaveIdMatch));
      const taskMatch = subject.match(/^Nueva tarea #(\d+)/i);
      const forumMatch = subject.match(/^(?:Nuevo foro|Mensaje en foro) #(\d+):(\d+)/i);
      const communicationMatch = subject.match(/^Comunicado #(\d+)(?::\s*(.*))?$/i);
      let target = '/comunicaciones';
      if (taskMatch) target = `/cursos/${taskMatch[1]}/tareas`;
      else if (forumMatch) target = `/cursos/${forumMatch[1]}/foros/${forumMatch[2]}`;
      else if (communicationMatch) target = `/comunicaciones/${communicationMatch[1]}`;
      else if (studentId) target = `/estudiantes/${studentId}/notas`;
      else if (isLeave) target = leaveIdMatch ? `/solicitudes/${leaveIdMatch[1]}` : '/solicitudes';
      return {
        id: 1000000000 + record.id,
        channel: 'notification',
        target,
        subject: communicationMatch?.[2] || record.subject,
        body: record.body,
        sentAt: record.created_at || record.createdAt,
      };
    });
    const seen = new Set();
    const merged = [...gradeNotifications, ...communications]
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .filter((item) => {
        const key = item.target?.startsWith('/comunicaciones/')
          ? item.target
          : `${item.channel}:${item.subject}:${item.sentAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
    res.json(merged);
  });

  app.delete('/api/notifications/student/:studentId', async (req, res) => {
    const studentId = Number(req.params.studentId);
    if (!Number.isInteger(studentId)) return res.status(400).json({ message: 'Estudiante inválido.' });
    await models.UserNotification.destroy({ where: { schoolId: req.user.schoolId, userId: req.user.id, studentId } });
    res.status(204).end();
  });

  const COMMUNICATION_AUDIENCES = ['all', 'students', 'guardians', 'teachers', 'managers', 'student', 'guardian', 'course'];
  const COMMUNICATION_GROUP_AUDIENCES = ['students', 'guardians', 'teachers', 'managers'];
  const COMMUNICATION_EXCLUSIVE_AUDIENCES = ['all', 'student', 'guardian', 'course'];
  const COMMUNICATION_ROLE_BY_AUDIENCE = { students: 'student', guardians: 'guardian', teachers: 'teacher', managers: 'manager' };
  const COMMUNICATION_ROLE_LABEL = { student: 'Estudiante', guardian: 'Apoderado', teacher: 'Profesor', manager: 'Manager', school_admin: 'Admin', director: 'Director', utp: 'Jefe de UTP' };

  function normalizeCommunicationAudiences(body = {}) {
    const raw = Array.isArray(body.audiences) && body.audiences.length
      ? body.audiences
      : [body.audience || 'all'];
    const audiences = [...new Set(raw.map((value) => String(value || '').trim()).filter(Boolean))];
    if (!audiences.length || audiences.some((value) => !COMMUNICATION_AUDIENCES.includes(value))) {
      return { error: 'Selecciona destinatarios válidos.' };
    }
    if (audiences.includes('all') && audiences.length > 1) {
      return { error: 'Toda la comunidad no se puede combinar con otros destinatarios.' };
    }
    if (audiences.some((value) => COMMUNICATION_EXCLUSIVE_AUDIENCES.includes(value)) && audiences.length > 1) {
      return { error: 'Ese tipo de destinatario no se puede combinar con otros.' };
    }
    if (audiences.some((value) => !COMMUNICATION_GROUP_AUDIENCES.includes(value) && !COMMUNICATION_EXCLUSIVE_AUDIENCES.includes(value))) {
      return { error: 'Selecciona destinatarios válidos.' };
    }
    return { audiences };
  }

  function pushRecipient(map, { name, email, role, source }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim() || cleanEmail || 'Sin nombre';
    if (!cleanEmail && !cleanName) return;
    const key = cleanEmail || `${source}:${cleanName}:${role || ''}`;
    if (map.has(key)) return;
    map.set(key, {
      name: cleanName,
      email: cleanEmail || null,
      role: role || null,
      roleLabel: COMMUNICATION_ROLE_LABEL[role] || role || source || '—',
      source: source || null,
    });
  }

  async function collectCommunicationNotifyTargets(schoolId, audiences, { targetStudentId = 0, targetGuardianId = 0, courseId = 0 } = {}) {
    const byUser = new Map();
    const add = (userId, studentId = null) => {
      const id = Number(userId);
      if (!Number.isInteger(id) || id < 1) return;
      const prev = byUser.get(id) || { userId: id, studentId: null };
      const sid = Number(studentId);
      if (Number.isInteger(sid) && sid > 0 && !prev.studentId) prev.studentId = sid;
      byUser.set(id, prev);
    };

    for (const selected of audiences) {
      if (selected === 'student') {
        const { student, users } = await resolveStudentAudienceUsers(schoolId, targetStudentId);
        if (student?.userId || student?.user_id) add(student.userId || student.user_id, targetStudentId);
        for (const user of users) add(user.id, user.role === 'student' ? targetStudentId : null);
        continue;
      }
      if (selected === 'guardian') {
        const { guardian, users } = await resolveGuardianAudienceUser(schoolId, targetGuardianId);
        if (guardian?.userId || guardian?.user_id) add(guardian.userId || guardian.user_id);
        for (const user of users) add(user.id);
        continue;
      }
      if (selected === 'course') {
        const enrollments = await models.Enrollment.findAll({
          where: { schoolId, courseId, status: { [Op.in]: ['active', 'exempt'] } },
          attributes: ['studentId'],
          raw: true,
        });
        const studentIds = enrollments.map((row) => row.studentId).filter(Boolean);
        const students = studentIds.length
          ? await models.Student.findAll({
            where: { schoolId, id: { [Op.in]: studentIds }, active: true },
            attributes: ['id', 'userId'],
            raw: true,
          })
          : [];
        for (const student of students) add(student.userId, student.id);
        const links = studentIds.length
          ? await models.StudentGuardian.findAll({
            where: { studentId: { [Op.in]: studentIds } },
            attributes: ['guardianId'],
            raw: true,
          })
          : [];
        const guardianIds = [...new Set(links.map((row) => row.guardianId).filter(Boolean))];
        if (guardianIds.length) {
          const guardians = await models.Guardian.findAll({
            where: { schoolId, id: { [Op.in]: guardianIds } },
            attributes: ['userId'],
            raw: true,
          });
          for (const guardian of guardians) add(guardian.userId);
        }
        continue;
      }
      if (selected === 'students' || selected === 'all') {
        const students = await models.Student.findAll({
          where: { schoolId, active: true },
          attributes: ['id', 'userId'],
          raw: true,
        });
        for (const student of students) add(student.userId, student.id);
        const studentUsers = await models.User.findAll({
          where: { schoolId, active: true, role: 'student' },
          attributes: ['id'],
          raw: true,
        });
        for (const user of studentUsers) add(user.id);
      }
      if (selected === 'guardians' || selected === 'all') {
        const guardians = await models.Guardian.findAll({
          where: { schoolId },
          attributes: ['userId'],
          raw: true,
        });
        for (const guardian of guardians) add(guardian.userId);
        const guardianUsers = await models.User.findAll({
          where: { schoolId, active: true, role: 'guardian' },
          attributes: ['id'],
          raw: true,
        });
        for (const user of guardianUsers) add(user.id);
      }
      if (selected === 'teachers' || selected === 'all') {
        const users = await models.User.findAll({
          where: { schoolId, active: true, role: 'teacher' },
          attributes: ['id'],
          raw: true,
        });
        for (const user of users) add(user.id);
      }
      if (selected === 'managers' || selected === 'all') {
        const users = await models.User.findAll({
          where: {
            schoolId,
            active: true,
            role: selected === 'all'
              ? { [Op.in]: ['manager', 'director', 'school_admin', 'utp', 'monitor'] }
              : 'manager',
          },
          attributes: ['id'],
          raw: true,
        });
        for (const user of users) add(user.id);
      }
    }
    return [...byUser.values()];
  }

  async function createCommunicationNotifications({
    schoolId,
    createdBy,
    communicationId,
    subject,
    body,
    audiences,
    targetStudentId = 0,
    targetGuardianId = 0,
    courseId = 0,
  }) {
    const targets = await collectCommunicationNotifyTargets(schoolId, audiences, {
      targetStudentId,
      targetGuardianId,
      courseId,
    });
    if (!targets.length) return 0;
    const notifySubject = communicationId > 0 ? `Comunicado #${communicationId}: ${subject}` : subject;
    await models.UserNotification.bulkCreate(targets.map(({ userId, studentId }) => ({
      schoolId,
      createdBy,
      userId,
      ...(studentId ? { studentId } : {}),
      subject: notifySubject,
      body,
    })));
    return targets.length;
  }

  async function resolveCommunicationRecipients(schoolId, audiences, { targetStudentId = 0, targetGuardianId = 0, courseId = 0 } = {}) {
    const map = new Map();
    const audience = audiences[0];

    if (audience === 'student') {
      const { student, guardians, users } = await resolveStudentAudienceUsers(schoolId, targetStudentId);
      pushRecipient(map, { name: `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim(), email: student.email, role: 'student', source: 'student' });
      for (const user of users) pushRecipient(map, { name: user.fullName || user.full_name || user.username, email: user.username, role: user.role, source: 'user' });
      for (const guardian of guardians) pushRecipient(map, { name: guardian.fullName || guardian.full_name, email: guardian.email, role: 'guardian', source: 'guardian' });
      return [...map.values()];
    }

    if (audience === 'guardian') {
      const { guardian, users } = await resolveGuardianAudienceUser(schoolId, targetGuardianId);
      pushRecipient(map, { name: guardian.fullName || guardian.full_name, email: guardian.email, role: 'guardian', source: 'guardian' });
      for (const user of users) pushRecipient(map, { name: user.fullName || user.full_name || user.username, email: user.username, role: user.role, source: 'user' });
      return [...map.values()];
    }

    if (audience === 'course') {
      const enrollments = await models.Enrollment.findAll({ where: { schoolId, courseId, status: 'active' }, attributes: ['studentId'], raw: true });
      const studentIds = enrollments.map((row) => row.studentId);
      const students = studentIds.length
        ? await models.Student.findAll({ where: { schoolId, id: studentIds, active: true }, attributes: ['id', 'firstName', 'lastName', 'email', 'userId'], raw: true })
        : [];
      for (const student of students) {
        pushRecipient(map, { name: `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim(), email: student.email, role: 'student', source: 'student' });
      }
      const userIds = students.map((row) => row.userId).filter(Boolean);
      if (userIds.length) {
        const users = await models.User.findAll({ where: { schoolId, id: userIds }, attributes: ['username', 'fullName', 'role'], raw: true });
        for (const user of users) pushRecipient(map, { name: user.fullName || user.full_name || user.username, email: user.username, role: user.role, source: 'user' });
      }
      const links = studentIds.length
        ? await models.StudentGuardian.findAll({ where: { schoolId, studentId: studentIds }, attributes: ['guardianId'], raw: true })
        : [];
      if (links.length) {
        const guardians = await models.Guardian.findAll({
          where: { schoolId, id: [...new Set(links.map((row) => row.guardianId))] },
          attributes: ['fullName', 'email'],
          raw: true,
        });
        for (const guardian of guardians) pushRecipient(map, { name: guardian.fullName || guardian.full_name, email: guardian.email, role: 'guardian', source: 'guardian' });
      }
      return [...map.values()];
    }

    const roles = audiences.includes('all')
      ? null
      : audiences.map((value) => COMMUNICATION_ROLE_BY_AUDIENCE[value]).filter(Boolean);
    const where = { schoolId, active: true };
    if (roles?.length) where.role = roles.length === 1 ? roles[0] : { [Op.in]: roles };
    const users = await models.User.findAll({ where, attributes: ['username', 'fullName', 'role'], raw: true });
    for (const user of users) pushRecipient(map, { name: user.fullName || user.full_name || user.username, email: user.username, role: user.role, source: 'user' });

    if (audiences.includes('all') || audiences.includes('students')) {
      const students = await models.Student.findAll({ where: { schoolId, active: true }, attributes: ['firstName', 'lastName', 'email'], raw: true });
      for (const student of students) {
        pushRecipient(map, { name: `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim(), email: student.email, role: 'student', source: 'student' });
      }
    }
    if (audiences.includes('all') || audiences.includes('guardians')) {
      const guardians = await models.Guardian.findAll({ where: { schoolId }, attributes: ['fullName', 'email'], raw: true });
      for (const guardian of guardians) {
        pushRecipient(map, { name: guardian.fullName || guardian.full_name, email: guardian.email, role: 'guardian', source: 'guardian' });
      }
    }
    return [...map.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
  }

  app.get('/api/communications/whatsapp-status', async (req,res) => {
    if (['guardian','student','finance','agente_finanzas','monitor'].includes(req.user.role)) return res.status(403).json({message:'No tienes acceso a envíos.'});
    const deliveries = await models.WhatsappDelivery.findAll({where:{schoolId:req.user.schoolId},attributes:['id','communicationId','status','error','created_at'],order:[['id','DESC']],limit:50});
    res.json({configured:(await whatsappConfig(req.user.schoolId)).configured,deliveries});
  });
  app.get('/api/communications/recipients', async (req, res) => {
    if (['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para ver destinatarios.' });
    }
    const normalized = normalizeCommunicationAudiences({
      audiences: String(req.query.audiences || '').split(',').map((value) => value.trim()).filter(Boolean),
      audience: req.query.audience,
    });
    if (normalized.error) return res.status(400).json({ message: normalized.error });
    const audiences = normalized.audiences;
    const targetStudentId = Number(req.query.studentId || 0);
    const targetGuardianId = Number(req.query.guardianId || 0);
    const courseId = Number(req.query.courseId || 0);
    if (audiences.includes('student') && (!Number.isInteger(targetStudentId) || targetStudentId < 1)) {
      return res.status(400).json({ message: 'Selecciona un estudiante para listar destinatarios.' });
    }
    if (audiences.includes('guardian') && (!Number.isInteger(targetGuardianId) || targetGuardianId < 1)) {
      return res.status(400).json({ message: 'Selecciona un apoderado para listar destinatarios.' });
    }
    if (audiences.includes('course')) {
      if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Selecciona un curso para listar destinatarios.' });
      const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
      if (!course || !(await canAccessCourse(req.user, courseId))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    }
    const recipients = await resolveCommunicationRecipients(req.user.schoolId, audiences, { targetStudentId, targetGuardianId, courseId });
    res.json({ audiences, total: recipients.length, recipients });
  });
  app.get('/api/communications/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Comunicado inválido.' });
    const communication = await models.Communication.findOne({
      where: { id, schoolId: req.user.schoolId },
      raw: true,
    });
    if (!communication) return res.status(404).json({ message: 'Comunicado no encontrado.' });
    const audiences = [communication.audience].filter(Boolean);
    const targetStudentId = Number(communication.targetStudentId || communication.target_student_id || 0);
    const targetGuardianId = Number(communication.targetGuardianId || communication.target_guardian_id || 0);
    const courseId = Number(communication.courseId || communication.course_id || 0);
    const createdBy = Number(communication.createdBy || communication.created_by || 0);
    let sender = null;
    if (createdBy > 0) {
      const senderUser = await models.User.findOne({
        where: { id: createdBy, schoolId: req.user.schoolId },
        attributes: ['id', 'fullName', 'username', 'role'],
        raw: true,
      });
      if (senderUser) {
        sender = {
          id: senderUser.id,
          name: senderUser.fullName || senderUser.full_name || senderUser.username || 'Usuario',
          role: senderUser.role || null,
          roleLabel: COMMUNICATION_ROLE_LABEL[senderUser.role] || senderUser.role || null,
        };
      }
    }
    const communicationPayload = ({ courseName = null, recipientCount = null } = {}) => ({
      id: communication.id,
      channel: communication.channel,
      audience: communication.audience,
      subject: communication.subject,
      body: communication.body,
      sentAt: communication.sentAt || communication.sent_at || null,
      recipientCount,
      targetStudentId: targetStudentId || null,
      targetGuardianId: targetGuardianId || null,
      courseId: courseId || null,
      courseName,
      senderName: sender?.name || null,
      senderRole: sender?.role || null,
      senderRoleLabel: sender?.roleLabel || null,
      createdBy: createdBy || null,
    });
    const restricted = ['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role);
    if (restricted) {
      if (['finance', 'agente_finanzas', 'monitor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'No tienes permiso para ver este comunicado.' });
      }
      const audience = communication.audience;
      let allowed = audience === 'all'
        || (req.user.role === 'student' && ['students', 'student'].includes(audience))
        || (req.user.role === 'guardian' && ['guardians', 'guardian'].includes(audience));
      if (!allowed && audience === 'student' && targetStudentId > 0 && req.user.role === 'student') {
        const me = await models.Student.findOne({ where: { schoolId: req.user.schoolId, userId: req.user.id }, attributes: ['id'], raw: true });
        allowed = Number(me?.id) === targetStudentId;
      }
      if (!allowed && audience === 'guardian' && targetGuardianId > 0 && req.user.role === 'guardian') {
        const me = await models.Guardian.findOne({ where: { schoolId: req.user.schoolId, userId: req.user.id }, attributes: ['id'], raw: true });
        allowed = Number(me?.id) === targetGuardianId;
      }
      if (!allowed && audience === 'course' && courseId > 0) {
        allowed = await canAccessCourse(req.user, courseId);
      }
      if (!allowed) return res.status(403).json({ message: 'No tienes acceso a este comunicado.' });
      let courseName = null;
      if (courseId > 0) {
        const course = await models.Course.findOne({
          where: { id: courseId, schoolId: req.user.schoolId },
          attributes: ['name', 'section', 'subject'],
          raw: true,
        });
        if (course) courseName = `${course.name} ${course.section} · ${course.subject}`.trim();
      }
      return res.json({
        communication: communicationPayload({
          courseName,
          recipientCount: communication.recipientCount ?? communication.recipient_count ?? null,
        }),
        total: 0,
        recipients: [],
      });
    }
    if (audiences.includes('course') && courseId > 0 && !(await canAccessCourse(req.user, courseId))) {
      return res.status(403).json({ message: 'No tienes acceso a este comunicado.' });
    }
    let recipients = [];
    try {
      recipients = await resolveCommunicationRecipients(req.user.schoolId, audiences, {
        targetStudentId,
        targetGuardianId,
        courseId,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'No se pudieron resolver los destinatarios.' });
    }
    let courseName = null;
    if (courseId > 0) {
      const course = await models.Course.findOne({
        where: { id: courseId, schoolId: req.user.schoolId },
        attributes: ['name', 'section', 'subject'],
        raw: true,
      });
      if (course) courseName = `${course.name} ${course.section} · ${course.subject}`.trim();
    }
    const storedCount = communication.recipientCount ?? communication.recipient_count;
    const total = Number.isInteger(Number(storedCount)) ? Number(storedCount) : recipients.length;
    res.json({
      communication: communicationPayload({ courseName, recipientCount: total }),
      total,
      recipients,
    });
  });
  app.get('/api/school/integrations/whatsapp', async (req,res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({message:'No tienes permiso para configurar integraciones.'});
    const row = await models.SchoolIntegration.findOne({where:{schoolId:req.user.schoolId,provider:'whatsapp'},raw:true});
    res.json({configured:Boolean(row?.encryptedSecret),active:row?.active!==false,...(row?.config||{})});
  });
  app.put('/api/school/integrations/whatsapp', async (req,res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({message:'No tienes permiso para configurar integraciones.'});
    const config={phoneId:String(req.body.phoneId||'').trim(),version:String(req.body.version||'').trim(),template:String(req.body.template||'').trim(),language:String(req.body.language||'es_CL').trim()};
    const token=String(req.body.token||'').trim();
    if (!/^\d+$/.test(config.phoneId)||!/^v\d+\.\d+$/.test(config.version)||!/^[a-z0-9_]+$/.test(config.template)||!/^[a-z]{2}(?:_[A-Z]{2})?$/.test(config.language)||token&&token.length<20) return res.status(400).json({message:'Revisa teléfono, versión, plantilla, idioma y token de Meta.'});
    const existing=await models.SchoolIntegration.findOne({where:{schoolId:req.user.schoolId,provider:'whatsapp'}});
    if (!token&&!existing?.encryptedSecret) return res.status(400).json({message:'Ingresa el token de Meta.'});
    await models.SchoolIntegration.upsert({schoolId:req.user.schoolId,provider:'whatsapp',config,active:req.body.active!==false,...(token?{encryptedSecret:encryptSecret(token)}:{encryptedSecret:existing.encryptedSecret})});
    res.json({saved:true});
  });

  app.get('/api/school/integrations/webpay', async (req, res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({ message: 'No tienes permiso para configurar integraciones.' });
    const row = await models.SchoolIntegration.findOne({ where: { schoolId: req.user.schoolId, provider: 'webpay' }, raw: true });
    const commerceCode = String(row?.config?.commerceCode || '').trim();
    res.json({
      configured: Boolean(row?.encryptedSecret && commerceCode),
      active: row?.active !== false,
      environment: row?.config?.environment === 'production' ? 'production' : 'integration',
      commerceCode,
      commerceCodeMasked: commerceCode ? `****${commerceCode.slice(-4)}` : '',
    });
  });
  app.put('/api/school/integrations/webpay', async (req, res) => {
    if (!req.user.permissions?.manageSchool) return res.status(403).json({ message: 'No tienes permiso para configurar integraciones.' });
    const commerceCode = String(req.body.commerceCode || '').trim();
    const apiKey = String(req.body.apiKey || '').trim();
    const environment = String(req.body.environment || '').trim().toLowerCase() === 'production' ? 'production' : 'integration';
    if (!/^\d{8,12}$/.test(commerceCode)) {
      return res.status(400).json({ message: 'Ingresa un código de comercio Transbank válido.' });
    }
    if (apiKey && apiKey.length < 20) {
      return res.status(400).json({ message: 'La clave API de Transbank parece incompleta.' });
    }
    const existing = await models.SchoolIntegration.findOne({ where: { schoolId: req.user.schoolId, provider: 'webpay' } });
    if (!apiKey && !existing?.encryptedSecret) {
      return res.status(400).json({ message: 'Ingresa la clave API de Transbank.' });
    }
    const config = { commerceCode, environment };
    await models.SchoolIntegration.upsert({
      schoolId: req.user.schoolId,
      provider: 'webpay',
      config,
      active: req.body.active !== false,
      ...(apiKey
        ? { encryptedSecret: encryptSecret(apiKey) }
        : { encryptedSecret: existing.encryptedSecret }),
    });
    res.json({
      saved: true,
      configured: true,
      commerceCode,
      commerceCodeMasked: `****${commerceCode.slice(-4)}`,
      environment,
      active: req.body.active !== false,
    });
  });

  app.post('/api/communications', async (req, res) => {
    if (['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para crear comunicados.' });
    }
    const subject = String(req.body.subject || '').trim();
    const body = String(req.body.body || '').trim();
    const channel = String(req.body.channel || 'email');
    const normalized = normalizeCommunicationAudiences(req.body);
    if (normalized.error) return res.status(400).json({ message: normalized.error });
    const audiences = normalized.audiences;
    const audience = audiences[0];
    const targetStudentId = Number(req.body.studentId || req.body.targetStudentId || 0);
    const targetGuardianId = Number(req.body.guardianId || req.body.targetGuardianId || 0);
    const courseId = Number(req.body.courseId || 0);
    if (subject.length < 3 || subject.length > 180) return res.status(400).json({ message: 'Ingresa un asunto válido.' });
    if (body.length < 5 || body.length > 5000) return res.status(400).json({ message: 'Ingresa un mensaje válido.' });
    if (!['notification', 'email', 'whatsapp'].includes(channel)) return res.status(400).json({ message: 'Selecciona un canal válido.' });
    if (audience === 'student' && (!Number.isInteger(targetStudentId) || targetStudentId < 1)) {
      return res.status(400).json({ message: 'Selecciona un estudiante para el comunicado.' });
    }
    if (audience === 'guardian' && (!Number.isInteger(targetGuardianId) || targetGuardianId < 1)) {
      return res.status(400).json({ message: 'Selecciona un apoderado para el comunicado.' });
    }
    if (audience === 'course') {
      if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: 'Selecciona un curso para el comunicado.' });
      const course = await models.Course.findOne({ where: { id: courseId, schoolId: req.user.schoolId } });
      if (!course || !(await canAccessCourse(req.user, courseId))) return res.status(403).json({ message: 'No tienes acceso a este curso.' });
    }
    const buildValues = (selectedAudience, recipientCount = null) => ({
      channel, audience: selectedAudience, subject, body,
      ...(Number.isInteger(recipientCount) && recipientCount >= 0 ? { recipientCount } : {}),
      ...(selectedAudience === 'student' ? { targetStudentId } : {}),
      ...(selectedAudience === 'guardian' ? { targetGuardianId } : {}),
      ...(selectedAudience === 'course' ? { courseId } : {}),
    });
    if (channel === 'whatsapp') {
      if (audiences.length > 1) return res.status(400).json({ message: 'WhatsApp solo admite un tipo de destinatario por envío.' });
      const values = buildValues(audience);
      const result = await queueWhatsApp(req.user, values);
      const communicationId = Number(result?.communication?.id || result?.id || 0);
      const queued = Number(result?.delivery?.queued || 0);
      if (communicationId > 0 && queued >= 0) {
        await models.Communication.update(
          { recipientCount: queued },
          { where: { id: communicationId, schoolId: req.user.schoolId } },
        );
        if (result.communication) result.communication.recipientCount = queued;
      }
      await createCommunicationNotifications({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        communicationId,
        subject,
        body,
        audiences,
        targetStudentId,
        targetGuardianId,
        courseId,
      });
      return res.status(201).json(result);
    }

    const resolved = await resolveCommunicationRecipients(req.user.schoolId, audiences, { targetStudentId, targetGuardianId, courseId });
    const recipientCount = resolved.length;
    const emails = channel === 'email'
      ? [...new Set(resolved.map((row) => String(row.email || '').trim().toLowerCase()).filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))]
      : [];
    const school = channel === 'email'
      ? await models.School.findByPk(req.user.schoolId, { attributes: ['name', 'phone', 'email', 'website', 'address'], raw: true })
      : null;

    const result = await createCommunication(req.user, buildValues(audience, channel === 'email' ? emails.length : recipientCount), emails, school);
    for (const extraAudience of audiences.slice(1)) {
      const extraResolved = await resolveCommunicationRecipients(req.user.schoolId, [extraAudience], { targetStudentId, targetGuardianId, courseId });
      await models.Communication.create({
        ...buildValues(extraAudience, extraResolved.length),
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        sentAt: result.communication.sentAt || new Date(),
      });
    }
    await createCommunicationNotifications({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      communicationId: Number(result.communication?.id || 0),
      subject,
      body,
      audiences,
      targetStudentId,
      targetGuardianId,
      courseId,
    });
    res.status(201).json(result);
  });

  app.put('/api/incidents/:id/status', async (req,res) => {
    if (['guardian','student','monitor','finance','agente_finanzas'].includes(req.user.role)) return res.status(403).json({ message: 'No tienes permiso para modificar casos.' });
    if (!['open','in_progress','closed'].includes(req.body.status)) return res.status(400).json({ message: 'Estado inválido.' });
    const incident = await models.Incident.findOne({ where: { id:req.params.id,schoolId:req.user.schoolId } });
    if (!incident) return res.status(404).json({message:'Caso no encontrado.'});
    await incident.update({status:req.body.status});
    res.json({saved:true});
  });

  app.post('/api/hr/employees', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para agregar trabajadores.' });
    const fullName = String(req.body.fullName || '').trim();
    const position = String(req.body.position || '').trim();
    const contractType = String(req.body.contractType || '').trim();
    const workModality = String(req.body.workModality || '').trim();
    const hiredOn = String(req.body.hiredOn || '').trim();
    const monthlySalary = Number(req.body.monthlySalary || 0);
    if (fullName.length < 3 || fullName.length > 120) return res.status(400).json({ message: 'Ingresa el nombre completo del trabajador.' });
    if (position.length < 2 || position.length > 100) return res.status(400).json({ message: 'Ingresa un cargo válido.' });
    if (!['Indefinido', 'Plazo fijo', 'Honorarios', 'Reemplazo'].includes(contractType)) return res.status(400).json({ message: 'Selecciona un tipo de contrato válido.' });
    if (!['Remoto', 'Full time', 'Part time', 'Temporal'].includes(workModality)) return res.status(400).json({ message: 'Selecciona una modalidad válida.' });
    if (!isValidDate(hiredOn)) return res.status(400).json({ message: 'Selecciona una fecha de ingreso válida.' });
    if (!isValidMoney(req.body.monthlySalary || 0)) return res.status(400).json({ message: 'Ingresa un sueldo líquido válido para estimar el base.' });
    let payrollProfile = null;
    if (contractType !== 'Honorarios') {
      try {
        payrollProfile = validatePayrollProfile(req.body.payrollProfile || { afp: 'Uno', healthSystem: 'Fonasa' });
      } catch (err) {
        return res.status(400).json({ message: err.message || 'Revisa AFP y previsión del trabajador.' });
      }
    }
    const employee = await models.Employee.create({
      schoolId: req.user.schoolId,
      fullName,
      position,
      contractType,
      workModality,
      hiredOn,
      monthlySalary,
      payrollProfile,
      active: true,
      createdBy: req.user.id,
    });
    res.status(201).json({ employee });
  });

  /** Valores legales sugeridos al contratar: AFP por comisión, Fonasa, UF/UTM. */
  app.get('/api/hr/hire-defaults', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para agregar trabajadores.' });
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let config = defaultPayrollConfig(period);
    let configSource = 'base';
    const existing = await models.PayrollPeriod.findOne({ where: { schoolId: req.user.schoolId, period } });
    if (existing) {
      try {
        const where = { schoolId: req.user.schoolId, periodId: existing.id };
        const [parameters, afpRates] = await Promise.all([
          models.PayrollParameter.findOne({ where, raw: true }),
          models.PayrollAfpRate.findAll({ where, raw: true }),
        ]);
        if (parameters?.values) {
          config = {
            ...config,
            parameters: parameters.values,
            afpRates: afpRates.map(({ name, commission }) => ({ name, commission: Number(commission) })),
          };
          configSource = 'period';
        }
      } catch { /* base */ }
    }
    const afps = [...(config.afpRates || [])]
      .map((row) => ({
        name: row.name,
        commission: Number(row.commission),
        code: CHILE_AFPS.find((afp) => afp.name === row.name)?.code || '',
      }))
      .sort((a, b) => a.commission - b.commission || a.name.localeCompare(b.name, 'es'));
    const recommendedAfp = afps[0]?.name || 'Uno';
    res.json({
      period,
      configSource,
      parameters: {
        uf: Number(config.parameters.uf),
        utm: Number(config.parameters.utm),
        pensionRate: Number(config.parameters.pensionRate),
        healthRate: Number(config.parameters.healthRate),
        afc: config.parameters.afc,
        source: config.parameters.source,
      },
      afps,
      isapres: CHILE_ISAPRES,
      recommendedAfp,
      recommendedHealthSystem: 'Fonasa',
      payrollProfile: defaultHirePayrollProfile({ afp: recommendedAfp, healthSystem: 'Fonasa' }),
    });
  });

  /** Estima sueldo base desde un líquido objetivo (AFP/salud editables). */
  app.post('/api/hr/estimate-from-net', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para agregar trabajadores.' });
    const now = new Date();
    const periodRaw = String(req.body.period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(periodRaw)) return res.status(400).json({ message: 'Período inválido.' });
    const period = periodRaw;
    const contractType = String(req.body.contractType || 'Indefinido').trim();
    const hiredOn = String(req.body.hiredOn || `${period}-01`).trim();
    let config = defaultPayrollConfig(period);
    const existing = await models.PayrollPeriod.findOne({ where: { schoolId: req.user.schoolId, period } });
    if (existing) {
      try {
        const where = { schoolId: req.user.schoolId, periodId: existing.id };
        const [parameters, afpRates, taxBrackets, concepts] = await Promise.all([
          models.PayrollParameter.findOne({ where, raw: true }),
          models.PayrollAfpRate.findAll({ where, raw: true }),
          models.PayrollTaxBracket.findAll({ where, raw: true }),
          models.PayrollConcept.findAll({ where, raw: true }),
        ]);
        if (parameters?.values) {
          config = {
            parameters: parameters.values,
            afpRates: afpRates.map(({ name, commission }) => ({ name, commission: Number(commission) })),
            taxBrackets: taxBrackets.map(({ lowerUtm, upperUtm, factor, deductionUtm }) => ({
              lowerUtm: Number(lowerUtm),
              upperUtm: upperUtm === null || upperUtm === undefined ? null : Number(upperUtm),
              factor: Number(factor),
              deductionUtm: Number(deductionUtm),
            })),
            concepts: concepts.map(({ code, label, taxable, pensionable }) => ({
              code,
              label,
              taxable: taxable === true || taxable === 1 || taxable === '1',
              pensionable: pensionable === true || pensionable === 1 || pensionable === '1',
            })),
          };
        }
      } catch { /* base */ }
    }
    try {
      const estimate = estimateGrossFromNet({
        targetNet: req.body.targetNet,
        contractType,
        hiredOn,
        period,
        config,
        payrollProfile: req.body.payrollProfile || defaultHirePayrollProfile(),
        daysWorked: req.body.daysWorked,
      });
      res.json({ period, ...estimate });
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message || 'No se pudo estimar el sueldo base.' });
    }
  });

  app.get('/api/hr/employees/:id', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas', 'monitor'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para ver trabajadores.' });
    const employeeId = Number(req.params.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ message: 'Trabajador inválido.' });
    const employee = await models.Employee.findOne({
      where: { id: employeeId, schoolId: req.user.schoolId },
      attributes: ['id', 'fullName', 'position', 'contractType', 'workModality', 'hiredOn', 'endedOn', 'monthlySalary', 'active', 'userId'],
      raw: true,
    });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    let platformAccess = null;
    if (employee.userId) {
      const user = await models.User.findOne({
        where: { id: employee.userId, schoolId: req.user.schoolId },
        attributes: ['active'],
        raw: true,
      });
      platformAccess = user ? Boolean(user.active) : false;
    }
    res.json({
      employee: {
        ...employee,
        platformAccess,
      },
    });
  });

  app.delete('/api/hr/employees/:id', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para eliminar trabajadores.' });
    const employeeId = Number(req.params.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ message: 'Trabajador inválido.' });
    const employee = await models.Employee.findOne({ where: { id: employeeId, schoolId: req.user.schoolId } });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    const revokeAccess = Boolean(req.body?.revokeAccess);
    const endedOn = isValidDate(String(req.body?.endedOn || '').trim())
      ? String(req.body.endedOn).trim()
      : new Date().toISOString().slice(0, 10);
    await employee.update({ active: false, endedOn });
    // Por defecto no se revoca el acceso a la plataforma; solo si se marca explícitamente.
    if (employee.userId) {
      await models.User.update(
        { active: !revokeAccess },
        { where: { id: employee.userId, schoolId: req.user.schoolId } }
      );
      await setTenantMembershipAccess({
        userId: employee.userId,
        schoolId: req.user.schoolId,
        active: !revokeAccess,
      });
    }
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      action: 'deactivate',
      entity: 'employee',
      entityId: employee.id,
      payload: { fullName: employee.fullName, position: employee.position, userId: employee.userId, revokeAccess, endedOn },
    });
    res.json({ saved: true, revokeAccess, endedOn });
  });

  /** Actualiza ficha HR (también en historial, para corregir antes de reintegrar). */
  app.put('/api/hr/employees/:id', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para modificar trabajadores.' });
    const employeeId = Number(req.params.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ message: 'Trabajador inválido.' });
    const employee = await models.Employee.findOne({ where: { id: employeeId, schoolId: req.user.schoolId } });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    const fullName = String(req.body.fullName ?? employee.fullName).trim();
    const position = String(req.body.position ?? employee.position).trim();
    const contractType = String(req.body.contractType ?? employee.contractType).trim();
    const workModality = String(req.body.workModality ?? employee.workModality ?? 'Full time').trim();
    const hiredOn = String(req.body.hiredOn ?? employee.hiredOn).trim();
    const monthlySalary = Number(req.body.monthlySalary ?? employee.monthlySalary ?? 0);
    let endedOn = req.body.endedOn === null || req.body.endedOn === ''
      ? null
      : String(req.body.endedOn ?? employee.endedOn ?? '').trim() || null;
    if (fullName.length < 3 || fullName.length > 120) return res.status(400).json({ message: 'Ingresa el nombre completo del trabajador.' });
    if (position.length < 2 || position.length > 100) return res.status(400).json({ message: 'Ingresa un cargo válido.' });
    if (!['Indefinido', 'Plazo fijo', 'Honorarios', 'Reemplazo'].includes(contractType)) return res.status(400).json({ message: 'Selecciona un tipo de contrato válido.' });
    if (!['Remoto', 'Full time', 'Part time', 'Temporal'].includes(workModality)) return res.status(400).json({ message: 'Selecciona una modalidad válida.' });
    if (!isValidDate(hiredOn)) return res.status(400).json({ message: 'Selecciona una fecha de ingreso válida.' });
    if (endedOn && (!isValidDate(endedOn) || endedOn < hiredOn)) return res.status(400).json({ message: 'Revisa la fecha de término.' });
    if (!isValidMoney(monthlySalary)) return res.status(400).json({ message: 'Ingresa un sueldo válido.' });
    const patch = { fullName, position, contractType, workModality, hiredOn, monthlySalary, endedOn };
    if (req.body.payrollProfile && contractType !== 'Honorarios') {
      try {
        patch.payrollProfile = validatePayrollProfile(req.body.payrollProfile);
      } catch (err) {
        return res.status(400).json({ message: err.message || 'Revisa AFP y previsión.' });
      }
    }
    await employee.update(patch);
    res.json({ employee: employee.get({ plain: true }) });
  });

  app.post('/api/hr/employees/:id/restore', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para reactivar trabajadores.' });
    const employeeId = Number(req.params.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ message: 'Trabajador inválido.' });
    const employee = await models.Employee.findOne({ where: { id: employeeId, schoolId: req.user.schoolId } });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    const restoreAccess = req.body?.restoreAccess !== false;
    const patch = { active: true, endedOn: null };
    if (req.body.fullName != null) {
      const fullName = String(req.body.fullName).trim();
      if (fullName.length < 3 || fullName.length > 120) return res.status(400).json({ message: 'Ingresa el nombre completo del trabajador.' });
      patch.fullName = fullName;
    }
    if (req.body.position != null) {
      const position = String(req.body.position).trim();
      if (position.length < 2 || position.length > 100) return res.status(400).json({ message: 'Ingresa un cargo válido.' });
      patch.position = position;
    }
    if (req.body.contractType != null) {
      const contractType = String(req.body.contractType).trim();
      if (!['Indefinido', 'Plazo fijo', 'Honorarios', 'Reemplazo'].includes(contractType)) return res.status(400).json({ message: 'Selecciona un tipo de contrato válido.' });
      patch.contractType = contractType;
    }
    if (req.body.workModality != null) {
      const workModality = String(req.body.workModality).trim();
      if (!['Remoto', 'Full time', 'Part time', 'Temporal'].includes(workModality)) return res.status(400).json({ message: 'Selecciona una modalidad válida.' });
      patch.workModality = workModality;
    }
    if (req.body.hiredOn != null) {
      const hiredOn = String(req.body.hiredOn).trim();
      if (!isValidDate(hiredOn)) return res.status(400).json({ message: 'Selecciona una fecha de ingreso válida.' });
      patch.hiredOn = hiredOn;
    }
    if (req.body.monthlySalary != null && req.body.monthlySalary !== '') {
      const monthlySalary = Number(req.body.monthlySalary);
      if (!isValidMoney(monthlySalary)) return res.status(400).json({ message: 'Ingresa un sueldo válido.' });
      patch.monthlySalary = monthlySalary;
    }
    if (req.body.payrollProfile && (patch.contractType || employee.contractType) !== 'Honorarios') {
      try {
        patch.payrollProfile = validatePayrollProfile(req.body.payrollProfile);
      } catch (err) {
        return res.status(400).json({ message: err.message || 'Revisa AFP y previsión.' });
      }
    }
    await employee.update(patch);
    if (restoreAccess && employee.userId) {
      await models.User.update({ active: true }, { where: { id: employee.userId, schoolId: req.user.schoolId } });
      await setTenantMembershipAccess({
        userId: employee.userId,
        schoolId: req.user.schoolId,
        active: true,
      });
    }
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      action: 'restore',
      entity: 'employee',
      entityId: employee.id,
      payload: {
        fullName: employee.fullName,
        position: employee.position,
        userId: employee.userId,
        restoreAccess,
        updates: Object.keys(patch).filter((key) => key !== 'active'),
      },
    });
    res.json({ saved: true, restoreAccess, employee: employee.get({ plain: true }) });
  });

  app.put('/api/hr/employees/:id/platform-access', async (req, res) => {
    const canManageHr = req.user.permissions?.manageUsers || req.user.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(req.user.role);
    if (!canManageHr) return res.status(403).json({ message: 'No tienes permiso para gestionar el acceso.' });
    const employeeId = Number(req.params.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ message: 'Trabajador inválido.' });
    const employee = await models.Employee.findOne({ where: { id: employeeId, schoolId: req.user.schoolId } });
    if (!employee) return res.status(404).json({ message: 'Trabajador no encontrado.' });
    if (!employee.userId) return res.status(400).json({ message: 'Este empleado no tiene cuenta de plataforma.' });
    const active = Boolean(req.body?.active);
    await models.User.update({ active }, { where: { id: employee.userId, schoolId: req.user.schoolId } });
    await setTenantMembershipAccess({
      userId: employee.userId,
      schoolId: req.user.schoolId,
      active,
    });
    if (!active) {
      try {
        const { revokeUserSessions } = await import('./auth.js');
        await revokeUserSessions(employee.userId, req.authToken);
      } catch { /* no bloquear la revocación si falla el cierre de sesión */ }
    }
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      action: active ? 'restore_access' : 'revoke_access',
      entity: 'employee',
      entityId: employee.id,
      payload: { userId: employee.userId, active },
    });
    res.json({ saved: true, platformAccess: active });
  });

  app.get('/api/modules', (req, res) => {
    const catalog = moduleCatalog();
    const modules = Object.entries(catalog).filter(([key]) => canAccessModule(req.user, key));
    res.json(modules.map(([key, module]) => ({
      key, title: module.title, description: module.description,
    })));
  });

  app.get('/api/modules/:key', async (req, res) => {
    const catalog = moduleCatalog();
    const module = catalog[req.params.key];
    if (!module) return res.status(404).json({ message: 'Módulo no encontrado.' });
    if (!canAccessModule(req.user, req.params.key)) {
      return res.status(403).json({ message: 'Este módulo no está habilitado para tu rol.' });
    }
    const schoolId = req.user.schoolId;
    const financeYear = req.params.key === 'finance' ? accountabilityYear(req.query.year) : null;
    if (req.params.key === 'finance' && !financeYear) return res.status(400).json({ message: 'Año inválido.' });
    const sections = await Promise.all(module.sections.map(async ([title, model, columns]) => {
      let where = model === models.Document ? await documentScope(req.user) : { schoolId };
      if (model === models.Employee) where.active = req.query.status !== 'inactive';
      let sectionColumns = columns;
      if (model === models.Employee && req.query.status !== 'inactive') {
        // Activos no muestran "Hasta": los dados de baja viven en Historial.
        sectionColumns = columns.filter(([key]) => key !== 'endedOn');
      }
      if (model === models.AuditLog) {
        where = {
          ...where,
          action: { [Op.notIn]: ['tenant_enter', 'impersonation_start', 'impersonation_stop'] },
        };
      }
      if (financeYear && model === models.Invoice) where = { ...where, dueOn: { [Op.gte]: `${financeYear}-01-01`, [Op.lt]: `${financeYear + 1}-01-01` } };
      if (financeYear && model === models.Payment) where = { ...where, paidAt: { [Op.gte]: `${financeYear}-01-01`, [Op.lt]: `${financeYear + 1}-01-01` } };
      if (financeYear && model === models.Expense) where = { ...where, spentOn: { [Op.gte]: `${financeYear}-01-01`, [Op.lt]: `${financeYear + 1}-01-01` } };
      if (model === models.Observation && req.user.role === 'teacher') {
        const [taughtCourses] = await sequelize.query(teacherOwnedCourseIdsSql(), {
          replacements: teacherOwnedCourseIdsParams(req.user),
        });
        const taughtIds = taughtCourses.map((course) => Number(course.id)).filter((id) => Number.isInteger(id) && id > 0);
        where = taughtIds.length
          ? {
            ...where,
            [Op.or]: [
              { courseId: { [Op.in]: taughtIds } },
              { createdBy: req.user.id },
            ],
          }
          : { ...where, createdBy: req.user.id };
      }
      const records = await model.findAll({
        where,
        order: model === models.Observation
          ? [['created_at', 'DESC'], ['id', 'DESC']]
          : [['id', 'DESC']],
        raw: true,
      });
      if (sectionColumns.some(([key]) => key === 'studentId' || key === 'studentName')) {
        const studentIds = [...new Set(records.map(record => recordValue(record, 'studentId')).filter(Boolean))];
        const students = studentIds.length ? await models.Student.findAll({
          where: { schoolId, id: { [Op.in]: studentIds } },
          attributes: ['id', 'firstName', 'lastName', 'avatarColor', 'avatarKey'],
          raw: true,
        }) : [];
        const studentMeta = new Map(students.map((student) => [student.id, {
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          avatarColor: student.avatarColor || student.avatar_color || '#DDEEFF',
          avatarKey: student.avatarKey || student.avatar_key || null,
        }]));
        for (const record of records) {
          const studentId = recordValue(record, 'studentId');
          const meta = studentMeta.get(studentId);
          record.studentId = studentId;
          record.studentName = meta?.name ?? null;
          record.avatarColor = meta?.avatarColor || null;
          record.avatarKey = meta?.avatarKey || null;
        }
      }
      if (sectionColumns.some(([key]) => key === 'guardianName' || key === 'guardianId')) {
        const guardianIds = [...new Set(records.map((record) => recordValue(record, 'guardianId')).filter(Boolean))];
        const guardians = guardianIds.length
          ? await models.Guardian.findAll({
            where: { schoolId, id: { [Op.in]: guardianIds } },
            attributes: ['id', 'fullName'],
            raw: true,
          })
          : [];
        const guardianNames = new Map(guardians.map((guardian) => [guardian.id, guardian.fullName]));
        for (const record of records) {
          const guardianId = recordValue(record, 'guardianId');
          record.guardianId = guardianId || null;
          record.guardianName = guardianId ? (guardianNames.get(guardianId) || `Apoderado #${guardianId}`) : null;
        }
      }
      if (columns.some(([key]) => key === 'senderName') || model === models.Communication) {
        const senderIds = [...new Set(records.map((record) => recordValue(record, 'createdBy')).filter(Boolean))];
        const senders = senderIds.length
          ? await models.User.findAll({
            where: { schoolId, id: { [Op.in]: senderIds } },
            attributes: ['id', 'fullName', 'username'],
            raw: true,
          })
          : [];
        const senderNames = new Map(senders.map((user) => [user.id, user.fullName || user.username || `Usuario #${user.id}`]));
        for (const record of records) {
          const createdBy = recordValue(record, 'createdBy');
          record.senderName = createdBy ? (senderNames.get(createdBy) || 'Usuario del colegio') : 'Usuario del colegio';
        }
      }
      if (model === models.Observation || columns.some(([key]) => key === 'createdByName')) {
        const authorIds = [...new Set(records.map((record) => recordValue(record, 'createdBy')).filter(Boolean))];
        const authors = authorIds.length
          ? await models.User.findAll({
            where: { schoolId, id: { [Op.in]: authorIds } },
            attributes: ['id', 'fullName', 'username', 'role'],
            raw: true,
          })
          : [];
        const authorNames = new Map(authors.map((user) => [user.id, user.fullName || user.username || `Usuario #${user.id}`]));
        const authorRoles = new Map(authors.map((user) => [user.id, user.role]));
        for (const record of records) {
          const createdBy = recordValue(record, 'createdBy');
          record.createdByName = createdBy ? (authorNames.get(createdBy) || 'Usuario del colegio') : 'Usuario del colegio';
          record.createdByRole = createdBy ? (authorRoles.get(createdBy) || null) : null;
          record.canManage = await canManageObservationRecord(req.user, record);
        }
      }
      if (columns.some(([key]) => key === 'courseName' || key === 'courseId')) {
        const courseIds = [...new Set(records.map((record) => recordValue(record, 'courseId')).filter(Boolean))];
        const courseRows = courseIds.length
          ? await models.Course.findAll({
            where: { schoolId, id: { [Op.in]: courseIds } },
            attributes: ['id', 'name', 'section', 'subject'],
            raw: true,
          })
          : [];
        const courseNames = new Map(courseRows.map((course) => [
          course.id,
          `${course.name} ${course.section} · ${course.subject}`.trim(),
        ]));
        for (const record of records) {
          const courseId = recordValue(record, 'courseId');
          record.courseId = courseId || null;
          record.courseName = courseId ? (courseNames.get(courseId) || `Curso #${courseId}`) : 'Sin curso';
        }
      }
      if (columns.some(([key]) => key === 'employeeName')) {
        const employeeIds = [...new Set(records.map(record => recordValue(record, 'employeeId')).filter(Boolean))];
        const employees = employeeIds.length ? await models.Employee.findAll({
          where: { schoolId, id: { [Op.in]: employeeIds } },
          attributes: ['id', 'fullName'],
          raw: true,
        }) : [];
        const employeeNames = new Map(employees.map(employee => [employee.id, employee.fullName]));
        for (const record of records) {
          const employeeId = recordValue(record, 'employeeId');
          record.employeeName = employeeNames.get(employeeId) || '—';
        }
      }
      if (model === models.Employee) {
        const userIds = [...new Set(records.map((record) => recordValue(record, 'userId')).filter(Boolean))];
        const users = userIds.length
          ? await models.User.findAll({
            where: { schoolId, id: { [Op.in]: userIds } },
            attributes: ['id', 'active'],
            raw: true,
          })
          : [];
        const userActiveById = new Map(users.map((user) => [user.id, Boolean(user.active)]));
        for (const record of records) {
          const userId = recordValue(record, 'userId') || null;
          record.userId = userId;
          record.platformAccess = userId ? (userActiveById.get(userId) ?? false) : null;
        }
      }
      if (model === models.AuditLog) {
        const userIds = [...new Set(records.map(record => recordValue(record, 'createdBy')).filter(Boolean))];
        const users = userIds.length ? await models.User.findAll({
          where: { schoolId, id: { [Op.in]: userIds } },
          attributes: ['id', 'fullName'],
          raw: true,
        }) : [];
        const userNames = new Map(users.map(user => [user.id, user.fullName]));
        for (const record of records) {
          const action = String(recordValue(record, 'action') || '');
          const entity = String(recordValue(record, 'entity') || '');
          const payload = recordValue(record, 'payload');
          record.actorName = userNames.get(recordValue(record, 'createdBy')) ?? 'Sistema';
          record.action = auditActionLabels[action] || action.replace(/[._]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
          record.entity = auditEntityLabels[entity] || entity;
          record.payloadSummary = summarizeAuditPayload(action, payload);
        }
      }
      return {
        title,
        columns: sectionColumns.map(([key, label]) => ({ key, label })),
        rows: records.map((record) => {
          const attachmentNameRaw = recordValue(record, 'attachmentName');
          const attachmentName = attachmentNameRaw && String(attachmentNameRaw).trim() && String(attachmentNameRaw).trim() !== '—'
            ? String(attachmentNameRaw).trim()
            : null;
          const hasAttachment = Boolean(recordValue(record, 'attachmentKey') || attachmentName);
          const row = {
            id: recordValue(record, 'id') ?? record.id,
            ...(recordValue(record, 'studentId') ? {
              studentId: recordValue(record, 'studentId'),
              studentName: record.studentName,
              avatarColor: record.avatarColor || null,
              avatar_color: record.avatarColor || null,
              avatarKey: record.avatarKey || null,
              avatar_key: record.avatarKey || null,
            } : {}),
            ...(record.courseId ? { courseId: record.courseId, courseName: record.courseName } : {}),
            ...(record.guardianId ? { guardianId: record.guardianId, guardianName: record.guardianName } : {}),
            ...(model === models.Invoice ? { attachmentName: attachmentName || recordValue(record, 'attachmentName') || null } : {}),
            ...(model === models.Observation ? {
              attachmentName,
              hasAttachment,
              createdBy: recordValue(record, 'createdBy') || null,
              createdByName: record.createdByName || null,
              createdByRole: record.createdByRole || null,
              canManage: Boolean(record.canManage),
            } : {}),
            ...(model === models.Employee ? { userId: record.userId || null, platformAccess: record.platformAccess } : {}),
            ...Object.fromEntries(sectionColumns.map(([key]) => {
              if (model === models.Observation && key === 'attachmentName') {
                return [key, attachmentName];
              }
              if (model === models.Observation && key === 'createdByName') {
                return [key, record.createdByName || '—'];
              }
              return [key, serialize(key === 'studentName' ? record.studentName : key === 'courseName' ? record.courseName : key === 'employeeName' ? record.employeeName : key === 'guardianName' ? record.guardianName : key === 'senderName' ? record.senderName : key === 'actorName' ? record.actorName : key === 'payloadSummary' ? record.payloadSummary : recordValue(record, key), key)];
            })),
          };
          if (model === models.Observation) {
            row.attachmentName = attachmentName;
            row.hasAttachment = hasAttachment;
            row.createdByName = record.createdByName || row.createdByName || null;
            row.canManage = Boolean(record.canManage);
          }
          return row;
        }),
      };
    }));
    res.json({ title: module.title, description: module.description, sections, summary: moduleSummary(req.params.key, sections) });
  });
}
