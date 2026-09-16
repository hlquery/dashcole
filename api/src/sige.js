import { Op } from 'sequelize';
import { models } from './database.js';
import { ApiError } from './http.js';
import { requirePermission } from './school-context.js';
import { sigeSyncService } from './services/sige/sync-service.js';

const canView = requirePermission('sige.view');
const canConfigure = requirePermission('sige.configure');
const canSync = requirePermission('sige.sync');
const canViewLogs = requirePermission('sige.view_logs');
const rbdPattern = /^\d{1,8}(?:-[0-9K])?$/i;

function integrationView(integration) {
  if (!integration) return {
    enabled: false,
    rbd: '',
    connectionStatus: 'not_configured',
    authType: null,
    credentialsConfigured: false,
    lastSyncAt: null,
    lastSuccessfulSyncAt: null,
    lastError: null,
  };
  return {
    id: integration.id,
    enabled: Boolean(integration.enabled),
    rbd: integration.rbd,
    connectionStatus: integration.connectionStatus,
    authType: integration.authType,
    credentialsConfigured: Boolean(integration.credentialsEncrypted),
    lastSyncAt: integration.lastSyncAt,
    lastSuccessfulSyncAt: integration.lastSuccessfulSyncAt,
    lastError: integration.lastError,
  };
}

async function summary(schoolId) {
  const [students, studentMappings, courses, courseMappings, enrollments, enrollmentMappings] = await Promise.all([
    models.Student.count({ where: { schoolId, active: true } }),
    models.SigeStudentMapping.findAll({ where: { schoolId }, attributes: ['syncStatus'], raw: true }),
    models.Course.count({ where: { schoolId } }),
    models.SigeCourseMapping.findAll({ where: { schoolId }, attributes: ['syncStatus'], raw: true }),
    models.Enrollment.count({ where: { schoolId, status: { [Op.ne]: 'withdrawn' } } }),
    models.SigeEnrollmentMapping.findAll({ where: { schoolId }, attributes: ['syncStatus'], raw: true }),
  ]);
  const counts = (total, rows) => {
    const values = { local_only: Math.max(0, total - rows.length), pending: 0, syncing: 0, synced: 0, error: 0 };
    for (const row of rows) values[row.syncStatus] = (values[row.syncStatus] || 0) + 1;
    return { total, ...values };
  };
  return {
    students: counts(students, studentMappings),
    courses: counts(courses, courseMappings),
    enrollments: counts(enrollments, enrollmentMappings),
  };
}

export function registerSigeRoutes(app) {
  app.get('/api/integrations/sige', canView, async (req, res) => {
    const integration = await models.SigeIntegration.findOne({ where: { schoolId: req.user.schoolId } });
    res.json({
      integration: integrationView(integration),
      capabilities: sigeSyncService.provider.capabilities,
      summary: await summary(req.user.schoolId),
    });
  });

  app.put('/api/integrations/sige', canConfigure, async (req, res) => {
    if (req.body.credentials || req.body.password || req.body.token || req.body.apiKey || req.body.authType) {
      throw new ApiError(400, 'SIGE_AUTH_UNAVAILABLE', 'La autenticación SIGE aún no está configurada; no se almacenaron credenciales.');
    }
    const rbd = String(req.body.rbd || '').trim().toUpperCase();
    const enabled = req.body.enabled === true;
    if (!rbdPattern.test(rbd)) throw new ApiError(400, 'VALIDATION_ERROR', 'Ingresa un RBD válido.');
    const [integration] = await models.SigeIntegration.findOrCreate({
      where: { schoolId: req.user.schoolId },
      defaults: { rbd, enabled, connectionStatus: enabled ? 'not_configured' : 'disabled' },
    });
    await integration.update({ rbd, enabled, connectionStatus: enabled ? 'not_configured' : 'disabled', authType: null, credentialsEncrypted: null, lastError: null });
    await models.School.update({ rbd }, { where: { id: req.user.schoolId } });
    await models.AuditLog.create({ schoolId: req.user.schoolId, createdBy: req.user.id, entity: 'sige_integration', entityId: integration.id, action: 'sige_config_updated', payload: { rbd, enabled } });
    res.json({ integration: integrationView(integration), capabilities: sigeSyncService.provider.capabilities });
  });

  app.post('/api/integrations/sige/test', canConfigure, async (req, res) => {
    const result = await sigeSyncService.testConnection(req.user.schoolId, req.user.id);
    res.json(result);
  });

  app.post('/api/integrations/sige/sync', canSync, async (req, res) => {
    const entity = String(req.body.entity || 'students');
    let results;
    if (entity === 'students') results = await sigeSyncService.syncStudents(req.user.schoolId, req.user.id);
    else if (entity === 'courses') results = await sigeSyncService.syncCourses(req.user.schoolId, req.user.id);
    else if (entity === 'enrollments') results = await sigeSyncService.syncEnrollments(req.user.schoolId, req.user.id);
    else if (entity === 'attendance') results = await sigeSyncService.syncAttendance(req.user.schoolId, String(req.body.date || ''), req.user.id);
    else if (entity === 'grades') results = await sigeSyncService.syncGrades(req.user.schoolId, Number(req.body.entityId) || null, req.user.id);
    else throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona una entidad SIGE válida.');
    res.status(202).json({ queued: results.length, results: results.map(result => ({ status: result.status, jobId: result.jobId })) });
  });

  app.post('/api/students/:id/sige/sync', canSync, async (req, res) => {
    const result = await sigeSyncService.syncStudent(req.user.schoolId, Number(req.params.id), req.user.id);
    res.status(result.status === 'skipped' ? 200 : 202).json({ studentId: Number(req.params.id), status: result.status, jobId: result.jobId || null });
  });

  app.get('/api/students/:id/sige/status', canView, async (req, res) => {
    const studentId = Number(req.params.id);
    if (!Number.isSafeInteger(studentId) || !await models.Student.count({ where: { id: studentId, schoolId: req.user.schoolId } })) throw new ApiError(404, 'NOT_FOUND', 'Estudiante no encontrado.');
    const [integration, mapping] = await Promise.all([
      models.SigeIntegration.findOne({ where: { schoolId: req.user.schoolId } }),
      models.SigeStudentMapping.findOne({ where: { schoolId: req.user.schoolId, studentId } }),
    ]);
    res.json({
      configured: Boolean(integration?.enabled),
      status: mapping?.syncStatus || 'local_only',
      externalId: mapping?.externalId || null,
      lastSyncedAt: mapping?.lastSyncedAt || null,
      lastAttemptAt: mapping?.lastAttemptAt || null,
      lastError: mapping?.lastError || null,
    });
  });

  app.get('/api/integrations/sige/logs', canViewLogs, async (req, res) => {
    res.json(await models.SigeSyncLog.findAll({ where: { schoolId: req.user.schoolId }, order: [['id', 'DESC']], limit: 200 }));
  });

  app.get('/api/integrations/sige/errors', canViewLogs, async (req, res) => {
    const [logs, conflicts] = await Promise.all([
      models.SigeSyncLog.findAll({ where: { schoolId: req.user.schoolId, status: 'error' }, order: [['id', 'DESC']], limit: 100 }),
      models.SigeConflict.findAll({ where: { schoolId: req.user.schoolId, status: 'open' }, order: [['id', 'DESC']], limit: 100 }),
    ]);
    res.json({ logs, conflicts });
  });
}
