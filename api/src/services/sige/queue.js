import crypto from 'node:crypto';
import { Queue, Worker } from 'bullmq';
import { controlModels, redis, runWithTenantDatabase } from '../../database.js';
import { databaseForTenant } from '../../database-routing.js';
import { sigeSyncService } from './sync-service.js';

const queueName = 'dashcole-sige';
const LOCK_SECONDS = 90;
const JOB_TIMEOUT_MS = 30000;

function redisConnection() {
  const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.slice(1) || 0),
    maxRetriesPerRequest: null,
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

export async function acquireSigeLock(schoolId, entityType, entityId) {
  if (!redis.isReady) return null;
  const key = `sige:sync:${entityType}:${Number(schoolId)}:${Number(entityId) || 'batch'}`;
  const token = crypto.randomUUID();
  const result = await redis.set(key, token, { NX: true, EX: LOCK_SECONDS });
  return result === 'OK' ? { key, token } : null;
}

export async function releaseSigeLock(lock) {
  if (!lock || !redis.isReady) return;
  await redis.eval(
    'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
    { keys: [lock.key], arguments: [lock.token] },
  );
}

async function withTimeout(promise, timeoutMs = JOB_TIMEOUT_MS) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('SIGE sync timeout'), { code: 'SIGE_TIMEOUT', status: 504 })), timeoutMs); }),
    ]);
  } finally { clearTimeout(timer); }
}

async function processSigeJob(data) {
  const database = await databaseForTenant(data.schoolId);
  return runWithTenantDatabase(database, async () => {
    const lock = await acquireSigeLock(data.schoolId, data.entityType, data.entityId);
    if (!lock) return { skipped: true, reason: 'locked' };
    const started = Date.now();
    try {
      const result = await withTimeout(sigeSyncService.processJob(data.id));
      console.log(JSON.stringify({ event: 'sige_sync', school_id: data.schoolId, entity_type: data.entityType, entity_id: data.entityId, sync_job_id: data.id, duration_ms: Date.now() - started, result: 'success' }));
      return result;
    } catch (error) {
      console.warn(JSON.stringify({ event: 'sige_sync', school_id: data.schoolId, entity_type: data.entityType, entity_id: data.entityId, sync_job_id: data.id, duration_ms: Date.now() - started, result: 'error', error_code: error.code || 'SIGE_ERROR' }));
      throw error;
    } finally { await releaseSigeLock(lock); }
  });
}

export async function startSigeWorker() {
  if (process.env.SIGE_JOBS_ENABLED === 'false') return null;
  const connection = redisConnection();
  const queue = new Queue(queueName, { connection });
  const pump = async () => {
    const tenants = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['schoolId'], raw: true });
    for (const tenant of tenants) {
      const database = await databaseForTenant(tenant.schoolId);
      await runWithTenantDatabase(database, async () => {
        const jobs = await database.models.SigeSyncJob.findAll({ where: { status: 'pending' }, order: [['scheduledAt', 'ASC']], limit: 100, raw: true });
        for (const job of jobs) {
          await queue.add(job.jobType, { id: job.id, schoolId: tenant.schoolId, entityType: job.entityType, entityId: job.entityId }, {
            jobId: `sige-${tenant.schoolId}-${job.id}`,
            attempts: Math.max(1, Number(job.maxAttempts || 3)),
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: true,
          });
        }
      });
    }
  };
  const worker = new Worker(queueName, job => job.name === 'dispatch' ? pump() : processSigeJob(job.data), { connection, concurrency: 2 });
  worker.on('failed', (job, error) => console.warn(JSON.stringify({ event: 'sige_job_failed', sync_job_id: job?.data?.id, school_id: job?.data?.schoolId, error_code: error.code || 'SIGE_ERROR' })));
  worker.on('error', error => console.warn(JSON.stringify({ event: 'sige_worker_error', error_code: error.code || 'SIGE_WORKER_ERROR' })));
  await queue.upsertJobScheduler('sige-outbox', { every: 10000 }, { name: 'dispatch', opts: { removeOnComplete: true, removeOnFail: true } });
  return { queue, worker };
}

export async function stopSigeWorker(worker) {
  if (!worker) return;
  await worker.worker.close();
  await worker.queue.close();
}
