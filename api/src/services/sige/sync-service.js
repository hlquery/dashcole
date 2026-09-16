import crypto from 'node:crypto';
import { models, sequelize } from '../../database.js';
import { SigeNotConfiguredError, SigeValidationError } from './errors.js';
import { UnconfiguredSigeProvider } from './providers.js';

const SECRET_KEY = /authorization|cookie|credential|password|secret|token|api[-_]?key/i;
const mappingByEntity = {
  student: ['SigeStudentMapping', 'studentId'],
  course: ['SigeCourseMapping', 'courseId'],
  enrollment: ['SigeEnrollmentMapping', 'enrollmentId'],
};

export function sanitizeSigePayload(value, seen = new WeakSet()) {
  if (Array.isArray(value)) return value.map(item => sanitizeSigePayload(item, seen));
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    SECRET_KEY.test(key) ? '[REDACTED]' : sanitizeSigePayload(item, seen),
  ]));
}

export function normalizedSigePayload(value) {
  if (Array.isArray(value)) return value.map(normalizedSigePayload);
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value.trim() : value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalizedSigePayload(value[key])]));
}

export function sigePayloadHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(normalizedSigePayload(payload))).digest('hex');
}

function typedError(error) {
  return {
    code: error.code || 'SIGE_INTERNAL_ERROR',
    message: String(error.message || 'Error de sincronización SIGE.').slice(0, 1000),
    status: Number(error.status) || 502,
  };
}

export class SigeSyncService {
  constructor(provider = new UnconfiguredSigeProvider()) { this.provider = provider; }

  async integration(schoolId, requireEnabled = true) {
    const integration = await models.SigeIntegration.findOne({ where: { schoolId: Number(schoolId) } });
    if (!integration || requireEnabled && !integration.enabled) {
      throw new SigeNotConfiguredError('No se puede sincronizar: configura primero la integración SIGE del establecimiento.');
    }
    return integration;
  }

  async testConnection(schoolId, actorId) {
    const integration = await this.integration(schoolId, false);
    const startedAt = new Date();
    await integration.update({ connectionStatus: 'testing', lastError: null });
    try {
      const result = await this.provider.testConnection(integration.toJSON());
      await integration.update({ connectionStatus: 'connected', lastSuccessfulSyncAt: new Date(), lastError: null });
      await this.log({ schoolId, entityType: 'integration', operation: 'test_connection', direction: 'outbound', status: 'success', responsePayload: result, attempt: 1, startedAt, finishedAt: new Date() });
      return result;
    } catch (error) {
      const failure = typedError(error);
      await integration.update({ connectionStatus: error instanceof SigeNotConfiguredError ? 'not_configured' : 'error', lastError: failure.message });
      await this.log({ schoolId, entityType: 'integration', operation: 'test_connection', direction: 'outbound', status: 'error', errorCode: failure.code, errorMessage: failure.message, attempt: 1, startedAt, finishedAt: new Date() });
      throw error;
    }
  }

  async entityPayload(schoolId, entityType, entityId) {
    const where = { id: Number(entityId), schoolId: Number(schoolId) };
    if (entityType === 'student') {
      const row = await models.Student.findOne({ where, raw: true });
      if (!row) throw new SigeValidationError('Estudiante no encontrado en este colegio.');
      return { id: row.id, identifierType: row.identifierType, nationalId: row.nationalId, firstName: row.firstName, lastName: row.lastName, email: row.email, active: Boolean(row.active) };
    }
    if (entityType === 'course') {
      const row = await models.Course.findOne({ where, raw: true });
      if (!row) throw new SigeValidationError('Curso no encontrado en este colegio.');
      return { id: row.id, academicYearId: row.academicYearId, name: row.name, section: row.section, subject: row.subject };
    }
    if (entityType === 'enrollment') {
      const row = await models.Enrollment.findOne({ where, raw: true });
      if (!row) throw new SigeValidationError('Matrícula no encontrada en este colegio.');
      return { id: row.id, studentId: row.studentId, courseId: row.courseId, status: row.status };
    }
    throw new SigeValidationError('Entidad SIGE no soportada.');
  }

  async enqueueEntity(schoolId, entityType, entityId, actorId) {
    await this.integration(schoolId);
    const [modelName, localField] = mappingByEntity[entityType] || [];
    if (!modelName) throw new SigeValidationError('Entidad SIGE no soportada.');
    const payload = await this.entityPayload(schoolId, entityType, entityId);
    const payloadHash = sigePayloadHash(payload);
    const mappingModel = models[modelName];
    const [mapping] = await mappingModel.findOrCreate({
      where: { schoolId, [localField]: entityId },
      defaults: { syncStatus: 'local_only' },
    });
    if (mapping.syncStatus === 'synced' && mapping.payloadHash === payloadHash) {
      await this.log({ schoolId, entityType, entityId, operation: 'sync', direction: 'outbound', status: 'skipped', requestPayload: payload, attempt: 0, startedAt: new Date(), finishedAt: new Date() });
      return { status: 'skipped', reason: 'unchanged', mapping };
    }
    const jobType = `SIGE_SYNC_${entityType.toUpperCase()}`;
    const dedupeKey = sigePayloadHash({ schoolId, entityType, entityId, payloadHash });
    const [job] = await models.SigeSyncJob.findOrCreate({
      where: { dedupeKey },
      defaults: { schoolId, createdBy: actorId, jobType, entityType, entityId, payload, status: 'pending', scheduledAt: new Date() },
    });
    if (['failed', 'cancelled'].includes(job.status)) {
      await job.update({ status: 'pending', attempts: 0, error: null, result: null, startedAt: null, finishedAt: null, scheduledAt: new Date() });
    }
    await mapping.update({ syncStatus: 'pending', lastError: null });
    return { status: 'pending', jobId: job.id, mapping };
  }

  syncStudent(schoolId, studentId, actorId) { return this.enqueueEntity(schoolId, 'student', Number(studentId), actorId); }
  syncCourse(schoolId, courseId, actorId) { return this.enqueueEntity(schoolId, 'course', Number(courseId), actorId); }
  syncEnrollment(schoolId, enrollmentId, actorId) { return this.enqueueEntity(schoolId, 'enrollment', Number(enrollmentId), actorId); }

  async enqueueBatch(schoolId, entityType, rows, actorId) {
    const results = [];
    for (const row of rows) results.push(await this.enqueueEntity(schoolId, entityType, row.id, actorId));
    return results;
  }
  async syncStudents(schoolId, actorId) { return this.enqueueBatch(schoolId, 'student', await models.Student.findAll({ where: { schoolId, active: true }, attributes: ['id'], raw: true }), actorId); }
  async syncCourses(schoolId, actorId) { return this.enqueueBatch(schoolId, 'course', await models.Course.findAll({ where: { schoolId }, attributes: ['id'], raw: true }), actorId); }
  async syncEnrollments(schoolId, actorId) { return this.enqueueBatch(schoolId, 'enrollment', await models.Enrollment.findAll({ where: { schoolId }, attributes: ['id'], raw: true }), actorId); }
  async syncAttendance(_schoolId, _date, _actorId) { throw new SigeNotConfiguredError('SIGE no declara todavía capacidad para escribir asistencia o atrasos.'); }
  async syncGrades(_schoolId, _entityId, _actorId) { throw new SigeNotConfiguredError('SIGE no declara todavía capacidad para escribir calificaciones.'); }

  async processJob(jobId) {
    const startedAt = new Date();
    const job = await models.SigeSyncJob.findByPk(jobId);
    if (!job || ['succeeded', 'cancelled'].includes(job.status)) return { skipped: true };
    const integration = await this.integration(job.schoolId);
    const [mappingName, localField] = mappingByEntity[job.entityType] || [];
    const mapping = mappingName ? await models[mappingName].findOne({ where: { schoolId: job.schoolId, [localField]: job.entityId } }) : null;
    const attempt = job.attempts + 1;
    await job.update({ status: 'running', attempts: attempt, startedAt, error: null });
    if (mapping) await mapping.update({ syncStatus: 'syncing', lastAttemptAt: startedAt });
    const log = await this.log({ schoolId: job.schoolId, entityType: job.entityType, entityId: job.entityId, operation: job.jobType, direction: 'outbound', status: 'pending', requestPayload: job.payload, attempt, startedAt });
    try {
      const capabilityName = job.entityType === 'enrollment' ? 'enrollments' : `${job.entityType}s`;
      if (!this.provider.capabilities[capabilityName]?.write) throw new SigeNotConfiguredError();
      const handler = this.provider[`sync${job.entityType[0].toUpperCase()}${job.entityType.slice(1)}`];
      if (typeof handler !== 'function') throw new SigeNotConfiguredError();
      const result = await handler.call(this.provider, integration.toJSON(), job.payload);
      const finishedAt = new Date();
      await job.update({ status: 'succeeded', result: sanitizeSigePayload(result), finishedAt });
      if (mapping) await mapping.update({ syncStatus: 'synced', payloadHash: sigePayloadHash(job.payload), lastSyncedAt: finishedAt, lastError: null });
      await integration.update({ lastSyncAt: finishedAt, lastSuccessfulSyncAt: finishedAt, lastError: null });
      await log.update({ status: 'success', responsePayload: sanitizeSigePayload(result), finishedAt });
      return result;
    } catch (error) {
      const failure = typedError(error), finishedAt = new Date();
      await job.update({ status: 'failed', error: failure.message, finishedAt });
      if (mapping) await mapping.update({ syncStatus: 'error', lastError: failure.message });
      await integration.update({ lastSyncAt: finishedAt, lastError: failure.message });
      await log.update({ status: 'error', errorCode: failure.code, errorMessage: failure.message, finishedAt });
      throw error;
    }
  }

  log(values) {
    return models.SigeSyncLog.create({
      ...values,
      requestPayload: values.requestPayload ? sanitizeSigePayload(values.requestPayload) : null,
      responsePayload: values.responsePayload ? sanitizeSigePayload(values.responsePayload) : null,
    });
  }
}

export const sigeSyncService = new SigeSyncService();
