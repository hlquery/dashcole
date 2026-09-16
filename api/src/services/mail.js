import crypto from 'node:crypto';
import { Queue, Worker } from 'bullmq';
import { Op } from 'sequelize';
import { controlModels, models, runWithTenantDatabase, sequelize } from '../database.js';
import { sendCitation, sendCommunication, sendGuardianWelcome, sendUserWelcome } from '../mailer.js';
import { ApiError } from '../http.js';
import { databaseForTenant } from '../database-routing.js';
import { isSmtpConfigured } from './smtp-config.js';

const queueName = 'dashcole-mail';
export async function enqueueMail({ user, template, recipient, payload, key }, transaction) {
  const [delivery] = await models.MailDelivery.findOrCreate({
    where: { dedupeKey: crypto.createHash('sha256').update(`${user.schoolId}:${template}:${key}:${recipient}`).digest('hex') },
    defaults: { schoolId: user.schoolId, createdBy: user.id, template, recipient, payload, status: 'pending' }, transaction,
  });
  return { id: delivery.id, status: delivery.status, queued: true, sent: false };
}
export async function queueWelcome(user, template, payload, key) {
  if (!(await isSmtpConfigured())) return { sent: false, queued: false, reason: 'SMTP no configurado' };
  return enqueueMail({ user, template, recipient: payload.email, payload, key });
}
export async function createCommunication(user, values, emails, school) {
  if (values.channel === 'email' && !(await isSmtpConfigured())) throw new ApiError(502, 'MAIL_UNAVAILABLE', 'SMTP no configurado. Configura el correo antes de enviar.');
  if (values.channel === 'email' && !emails.length) throw new ApiError(400, 'NO_RECIPIENTS', 'No hay destinatarios con correo válido.');
  return sequelize.transaction(async transaction => {
    const communication = await models.Communication.create({ ...values, schoolId: user.schoolId, createdBy: user.id, sentAt: new Date() }, { transaction });
    for (const recipient of emails) await enqueueMail({ user, template: 'communication', recipient, payload: { emails: [recipient], subject: values.subject, body: values.body, school }, key: communication.id }, transaction);
    await models.AuditLog.create({ schoolId: user.schoolId, createdBy: user.id, entity: 'communication', entityId: communication.id, action: 'create', payload: { recipients: emails.length, channel: values.channel } }, { transaction });
    return { communication, delivery: values.channel === 'email' ? { queued: emails.length, sent: 0, total: emails.length, status: 'pending' } : null };
  });
}
export async function deliverMail(id, providers = {
  communication: sendCommunication,
  guardianWelcome: sendGuardianWelcome,
  userWelcome: sendUserWelcome,
  citation: sendCitation,
}, schoolId = null) {
  if (schoolId) {
    const database = await databaseForTenant(schoolId);
    return runWithTenantDatabase(database, () => deliverMail(id, providers));
  }
  let failure;
  await sequelize.transaction(async transaction => {
    const delivery = await models.MailDelivery.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!delivery || delivery.status === 'sent' || delivery.attempts >= 3) return;
    try {
      const provider = providers[delivery.template];
      if (!provider) throw new Error('Unknown mail template');
      const result = await provider({ ...delivery.payload, messageId: `<dashcole-${delivery.dedupeKey}@mail.dashcole>` });
      if (result.sent === false) throw new Error('SMTP unavailable');
      await delivery.update({ status: 'sent', attempts: delivery.attempts + 1, sentAt: new Date(), error: null, payload: null }, { transaction });
    } catch (error) {
      failure = error;
      const attempts = delivery.attempts + 1;
      await delivery.update({ status: 'failed', attempts, error: 'No fue posible entregar el correo.', ...(attempts >= 3 ? { payload: null } : {}) }, { transaction });
    }
    await models.AuditLog.create({ schoolId: delivery.schoolId, createdBy: delivery.createdBy, entity: 'mail_delivery', entityId: delivery.id, action: failure ? 'failed' : 'sent', payload: { template: delivery.template, attempts: delivery.attempts } }, { transaction });
  });
  if (failure) throw failure;
}
export async function startMailWorker() {
  const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  const connection = { host: url.hostname, port: Number(url.port || 6379), username: url.username || undefined, password: url.password || undefined, db: Number(url.pathname.slice(1) || 0), maxRetriesPerRequest: null, ...(url.protocol === 'rediss:' ? { tls: {} } : {}) };
  const queue = new Queue(queueName, { connection });
  const pump = async () => {
    const tenants = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['schoolId'], raw: true });
    for (const tenant of tenants) {
      const database = await databaseForTenant(tenant.schoolId);
      const deliveries = await database.models.MailDelivery.findAll({ where: { status: { [Op.in]: ['pending', 'failed'] }, attempts: { [Op.lt]: 3 } }, attributes: ['id'], limit: 100, order: [['id', 'ASC']] });
      for (const delivery of deliveries) await queue.add('deliver', { id: delivery.id, schoolId: tenant.schoolId }, { jobId: `mail-${tenant.schoolId}-${delivery.id}`, attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: true });
    }
  };
  const worker = new Worker(queueName, job => job.name === 'dispatch' ? pump() : deliverMail(job.data.id, undefined, job.data.schoolId), { connection, concurrency: 2 });
  worker.on('failed', job => console.warn(`Mail job ${job?.id} failed; status recorded in mail_deliveries.`));
  worker.on('error', error => console.warn('Mail worker:', error.message));
  await queue.upsertJobScheduler('mail-outbox', { every: 10000 }, { name: 'dispatch', opts: { removeOnComplete: true, removeOnFail: true } });
  return { queue, worker };
}
export async function stopMailWorker(worker) { if (worker) { await worker.worker.close(); await worker.queue.close(); } }
