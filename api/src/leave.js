import { models, redis } from './database.js';
import { ApiError } from './http.js';
import { isValidDate } from './validation.js';
import { Op } from 'sequelize';

const LEAVE_TYPES = new Set(['vacation', 'permission', 'medical', 'personal', 'bereavement', 'training', 'other']);
const LEAVE_STATUSES = new Set(['pending', 'approved', 'rejected', 'cancelled', 'retracted']);
const LEAVE_CLOSED_BY_WORKER = new Set(['cancelled', 'retracted']);
const LEAVE_RETRACTABLE = new Set(['pending', 'approved']);
const LEAVE_BACKLOG_THRESHOLD = 5;
const APPROVER_ROLES = ['director', 'school_admin', 'super_admin', 'manager', 'utp'];
const LEAVE_TYPE_LABELS = {
  vacation: 'Vacaciones',
  permission: 'Permiso administrativo',
  medical: 'Licencia médica',
  personal: 'Asunto personal',
  bereavement: 'Duelo familiar',
  training: 'Capacitación',
  other: 'Otro',
};

function canApproveLeave(user) {
  return Boolean(
    user.permissions?.approveLeave
    || user.permissions?.manageHr
    || user.permissions?.manageUsers
    || APPROVER_ROLES.includes(user.role)
  );
}

function canRequestLeave(user) {
  return !['guardian', 'student'].includes(user.role);
}

async function canCreateLeaveRequest(user) {
  if (!canRequestLeave(user)) return false;
  // Dirección / RRHH solo reciben y aprueban; no envían solicitudes propias.
  if (canApproveLeave(user)) return false;
  return Boolean(await employeeForUser(user));
}

function inclusiveDays(startsOn, endsOn) {
  const start = new Date(`${startsOn}T12:00:00`);
  const end = new Date(`${endsOn}T12:00:00`);
  return Math.floor((end - start) / 86400000) + 1;
}

async function employeeForUser(user) {
  return models.Employee.findOne({
    where: { schoolId: user.schoolId, userId: user.id },
    order: [['active', 'DESC'], ['id', 'DESC']],
  });
}

function leaveBacklogKey(schoolId) {
  return `dashcole:leave-backlog-alert:${schoolId}`;
}

async function countPendingLeave(schoolId) {
  return models.LeaveRequest.count({ where: { schoolId, status: 'pending' } });
}

async function findLeaveApprovers(schoolId, excludeUserId) {
  return models.User.findAll({
    where: {
      schoolId,
      active: true,
      id: { [Op.ne]: excludeUserId || 0 },
      [Op.or]: [
        { role: { [Op.in]: APPROVER_ROLES } },
        { canApproveLeave: true },
        { canManageHr: true },
        { canManageUsers: true },
      ],
    },
    attributes: ['id'],
    raw: true,
  });
}

async function clearLeaveBacklogAlert(schoolId) {
  if (!redis.isReady) return;
  const pending = await countPendingLeave(schoolId);
  if (pending < LEAVE_BACKLOG_THRESHOLD) {
    await redis.del(leaveBacklogKey(schoolId)).catch(() => null);
  }
}

async function notifyNewLeaveRequest({ schoolId, actorUserId, leave, requesterName }) {
  const approvers = await findLeaveApprovers(schoolId, actorUserId);
  if (!approvers.length) return;
  const typeLabel = LEAVE_TYPE_LABELS[leave.type] || leave.type;
  const who = String(requesterName || 'Un trabajador').trim() || 'Un trabajador';
  const range = leave.startsOn === leave.endsOn
    ? leave.startsOn
    : `${leave.startsOn} → ${leave.endsOn}`;
  await models.UserNotification.bulkCreate(
    approvers.map((row) => ({
      schoolId,
      createdBy: actorUserId || null,
      userId: row.id,
      studentId: null,
      gradeId: null,
      subject: `Nueva solicitud #${leave.id}`,
      body: `${who} pidió ${String(typeLabel).toLowerCase()} (${leave.days} ${leave.days === 1 ? 'día' : 'días'}: ${range}).`,
    })),
  ).catch(() => null);
}

async function notifyLeaveBacklogIfNeeded(schoolId, actorUserId) {
  const pending = await countPendingLeave(schoolId);
  if (pending < LEAVE_BACKLOG_THRESHOLD) {
    await clearLeaveBacklogAlert(schoolId);
    return pending;
  }
  if (!redis.isReady) return pending;
  const marked = await redis.set(leaveBacklogKey(schoolId), String(pending), { NX: true, EX: 60 * 60 * 24 * 14 });
  if (marked !== 'OK') return pending;

  const approvers = await findLeaveApprovers(schoolId, actorUserId);
  if (!approvers.length) return pending;

  await models.UserNotification.bulkCreate(
    approvers.map((row) => ({
      schoolId,
      createdBy: actorUserId || null,
      userId: row.id,
      studentId: null,
      gradeId: null,
      subject: 'Solicitudes pendientes',
      body: `Hay ${pending} solicitudes por revisar en el colegio.`,
    })),
  ).catch(() => null);
  return pending;
}

async function serializeLeaveList(rows, schoolId) {
  const list = rows.map((row) => (row.toJSON ? row.toJSON() : { ...row }));
  const resolvedSchoolId = Number(schoolId) || Number(list[0]?.schoolId || list[0]?.school_id) || null;
  const userIds = [...new Set(list.flatMap((row) => [row.requestedByUserId, row.reviewedByUserId].filter(Boolean)))];
  const employeeIds = [...new Set(list.map((row) => row.employeeId).filter(Boolean))];
  const [users, employees] = await Promise.all([
    userIds.length
      ? models.User.findAll({
        where: resolvedSchoolId ? { schoolId: resolvedSchoolId, id: userIds } : { id: userIds },
        attributes: ['id', 'fullName', 'role'],
      })
      : [],
    employeeIds.length && resolvedSchoolId
      ? models.Employee.findAll({ where: { schoolId: resolvedSchoolId, id: employeeIds }, attributes: ['id', 'fullName', 'position'] })
      : [],
  ]);
  const userMap = new Map(users.map((user) => [user.id, user.toJSON()]));
  const employeeMap = new Map(employees.map((employee) => [employee.id, employee.toJSON()]));
  return list.map((json) => {
    const requester = userMap.get(json.requestedByUserId);
    const reviewer = userMap.get(json.reviewedByUserId);
    const employee = employeeMap.get(json.employeeId);
    const reviewed = Boolean(json.reviewedAt || (json.status && json.status !== 'pending'));
    return {
      id: json.id,
      type: json.type,
      startsOn: json.startsOn,
      endsOn: json.endsOn,
      days: json.days,
      reason: json.reason || '',
      status: json.status,
      reviewerNotes: json.reviewerNotes || '',
      reviewedAt: json.reviewedAt || null,
      createdAt: json.createdAt || json.created_at || null,
      employeeId: json.employeeId || null,
      employeeName: employee?.fullName || requester?.fullName || '—',
      employeePosition: employee?.position || '',
      requestedByUserId: json.requestedByUserId,
      requesterName: requester?.fullName || employee?.fullName || '—',
      reviewerName: reviewer?.fullName || (reviewed ? 'Revisor no disponible' : null),
    };
  });
}

async function serializeLeave(row) {
  const json = row?.toJSON ? row.toJSON() : { ...row };
  const schoolId = json.schoolId ?? json.school_id ?? row?.schoolId ?? null;
  const [item] = await serializeLeaveList([row], schoolId);
  return item;
}

export function registerLeaveRoutes(app) {
  app.get('/api/leave-requests/meta', async (req, res) => {
    if (!canRequestLeave(req.user) && !canApproveLeave(req.user)) {
      throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso a solicitudes.');
    }
    const employee = await employeeForUser(req.user);
    const pendingCount = canApproveLeave(req.user)
      ? await models.LeaveRequest.count({ where: { schoolId: req.user.schoolId, status: 'pending' } })
      : await models.LeaveRequest.count({
        where: { schoolId: req.user.schoolId, requestedByUserId: req.user.id, status: 'pending' },
      });
    res.json({
      canRequest: await canCreateLeaveRequest(req.user),
      canApprove: canApproveLeave(req.user),
      employeeId: employee?.id || null,
      employeeName: employee?.fullName || req.user.fullName || '',
      employeePosition: employee?.position || req.user.position || '',
      pendingCount,
    });
  });

  app.get('/api/leave-requests', async (req, res) => {
    if (!canRequestLeave(req.user) && !canApproveLeave(req.user)) {
      throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso a solicitudes.');
    }
    const status = String(req.query.status || '').trim();
    const scope = String(req.query.scope || (canApproveLeave(req.user) ? 'all' : 'mine')).trim();
    const where = { schoolId: req.user.schoolId };
    if (status && LEAVE_STATUSES.has(status)) where.status = status;
    if (scope === 'mine' || !canApproveLeave(req.user)) {
      where.requestedByUserId = req.user.id;
    }
    const rows = await models.LeaveRequest.findAll({
      where,
      order: [['created_at', 'DESC'], ['id', 'DESC']],
      limit: 200,
    });
    res.json({
      requests: await serializeLeaveList(rows, req.user.schoolId),
      canRequest: await canCreateLeaveRequest(req.user),
      canApprove: canApproveLeave(req.user),
    });
  });

  app.get('/api/leave-requests/:id', async (req, res) => {
    if (!canRequestLeave(req.user) && !canApproveLeave(req.user)) {
      throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso a solicitudes.');
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    const row = await models.LeaveRequest.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    if (!canApproveLeave(req.user) && row.requestedByUserId !== req.user.id) {
      throw new ApiError(403, 'FORBIDDEN', 'No puedes ver esta solicitud.');
    }
    res.json({
      request: await serializeLeave(row),
      canRequest: await canCreateLeaveRequest(req.user),
      canApprove: canApproveLeave(req.user),
      canCancel: row.requestedByUserId === req.user.id && LEAVE_RETRACTABLE.has(row.status),
      canReview: canApproveLeave(req.user) && row.status === 'pending',
    });
  });

  app.post('/api/leave-requests', async (req, res) => {
    if (!(await canCreateLeaveRequest(req.user))) {
      throw new ApiError(403, 'FORBIDDEN', 'Necesitas una ficha de empleado activa para solicitar vacaciones o permisos.');
    }
    const type = String(req.body.type || 'vacation').trim();
    const startsOn = String(req.body.startsOn || '').trim();
    const endsOn = String(req.body.endsOn || '').trim();
    const reason = String(req.body.reason || '').trim();
    if (!LEAVE_TYPES.has(type)) throw new ApiError(400, 'VALIDATION_ERROR', 'Tipo de solicitud inválido.');
    if (!isValidDate(startsOn) || !isValidDate(endsOn) || endsOn < startsOn) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa las fechas de inicio y término.');
    }
    if (reason.length > 500) throw new ApiError(400, 'VALIDATION_ERROR', 'El motivo no puede superar 500 caracteres.');
    const days = inclusiveDays(startsOn, endsOn);
    if (days < 1 || days > 365) throw new ApiError(400, 'VALIDATION_ERROR', 'El rango de días no es válido.');
    const employee = await employeeForUser(req.user);
    const created = await models.LeaveRequest.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      employeeId: employee.id,
      requestedByUserId: req.user.id,
      type,
      startsOn,
      endsOn,
      days,
      reason: reason || null,
      status: 'pending',
    });
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'leave_request',
      entityId: created.id,
      action: 'create',
      payload: { type, startsOn, endsOn, days },
    }).catch(() => null);
    await notifyNewLeaveRequest({
      schoolId: req.user.schoolId,
      actorUserId: req.user.id,
      leave: created,
      requesterName: employee.fullName || req.user.fullName,
    });
    await notifyLeaveBacklogIfNeeded(req.user.schoolId, req.user.id);
    res.status(201).json({ request: await serializeLeave(created) });
  });

  app.post('/api/leave-requests/:id/cancel', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    const row = await models.LeaveRequest.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    if (row.requestedByUserId !== req.user.id) {
      throw new ApiError(403, 'FORBIDDEN', 'Solo puedes retractarte de tus propias solicitudes.');
    }
    if (!LEAVE_RETRACTABLE.has(row.status)) {
      throw new ApiError(409, 'INVALID_STATUS', 'Solo puedes retractarte de solicitudes pendientes o aprobadas.');
    }
    const previous = row.status;
    row.status = 'retracted';
    await row.save();
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'leave_request',
      entityId: row.id,
      action: 'retract',
      payload: { from: previous },
    }).catch(() => null);
    await clearLeaveBacklogAlert(req.user.schoolId);
    res.json({
      request: await serializeLeave(row),
      canCancel: false,
      canReview: false,
    });
  });

  app.post('/api/leave-requests/:id/approve', async (req, res) => {
    if (!canApproveLeave(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes aprobar solicitudes.');
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    const row = await models.LeaveRequest.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    if (row.status !== 'pending') throw new ApiError(409, 'INVALID_STATUS', 'La solicitud ya fue revisada.');
    const notes = String(req.body.notes || '').trim();
    if (notes.length > 500) throw new ApiError(400, 'VALIDATION_ERROR', 'La nota no puede superar 500 caracteres.');
    row.status = 'approved';
    row.reviewedByUserId = req.user.id;
    row.reviewedAt = new Date();
    row.reviewerNotes = notes || null;
    await row.save();
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'leave_request',
      entityId: row.id,
      action: 'approve',
      payload: { notes: notes || null },
    }).catch(() => null);
    await clearLeaveBacklogAlert(req.user.schoolId);
    res.json({
      request: await serializeLeave(row),
      canCancel: false,
      canReview: false,
      canApprove: true,
    });
  });

  app.post('/api/leave-requests/:id/reject', async (req, res) => {
    if (!canApproveLeave(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes rechazar solicitudes.');
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    const row = await models.LeaveRequest.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    if (row.status !== 'pending') throw new ApiError(409, 'INVALID_STATUS', 'La solicitud ya fue revisada.');
    const notes = String(req.body.notes || '').trim();
    if (notes.length > 500) throw new ApiError(400, 'VALIDATION_ERROR', 'La nota no puede superar 500 caracteres.');
    row.status = 'rejected';
    row.reviewedByUserId = req.user.id;
    row.reviewedAt = new Date();
    row.reviewerNotes = notes || null;
    await row.save();
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'leave_request',
      entityId: row.id,
      action: 'reject',
      payload: { notes: notes || null },
    }).catch(() => null);
    await clearLeaveBacklogAlert(req.user.schoolId);
    res.json({
      request: await serializeLeave(row),
      canCancel: false,
      canReview: false,
      canApprove: true,
    });
  });

  app.put('/api/leave-requests/:id/status', async (req, res) => {
    if (!canApproveLeave(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes cambiar el estado de solicitudes.');
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
    const status = String(req.body.status || '').trim();
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Estado inválido. Usa pendiente, aprobada o rechazada.');
    }
    const notes = String(req.body.notes || '').trim();
    if (notes.length > 500) throw new ApiError(400, 'VALIDATION_ERROR', 'La nota no puede superar 500 caracteres.');
    const row = await models.LeaveRequest.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    if (LEAVE_CLOSED_BY_WORKER.has(row.status)) {
      throw new ApiError(409, 'INVALID_STATUS', 'No se puede cambiar una solicitud retractada o cancelada por el trabajador.');
    }
    const previous = row.status;
    row.status = status;
    if (status === 'pending') {
      row.reviewedByUserId = null;
      row.reviewedAt = null;
      if (notes) row.reviewerNotes = notes;
    } else {
      row.reviewedByUserId = req.user.id;
      row.reviewedAt = new Date();
      if (notes || previous === 'pending') row.reviewerNotes = notes || row.reviewerNotes || null;
    }
    await row.save();
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      entity: 'leave_request',
      entityId: row.id,
      action: 'status',
      payload: { from: previous, to: status, notes: notes || null },
    }).catch(() => null);
    await clearLeaveBacklogAlert(req.user.schoolId);
    res.json({
      request: await serializeLeave(row),
      canCancel: false,
      canReview: status === 'pending',
      canApprove: true,
    });
  });
}
