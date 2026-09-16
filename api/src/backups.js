import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Queue, Worker } from 'bullmq';

const queueName = 'dashcole-database-backups';

function redisConnection() {
  const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.slice(1) || 0),
    maxRetriesPerRequest: null,
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function copySplitUploads(source, destination) {
  await fs.mkdir(path.join(destination, 'avatars'), { recursive: true });
  await fs.mkdir(path.join(destination, 'files'), { recursive: true });
  for (const category of ['avatars', 'files']) {
    const organized = path.join(source, category);
    try {
      await fs.cp(organized, path.join(destination, category), { recursive: true, dereference: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  // Legacy installs kept tenant folders / loose files at the uploads root.
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.name === 'avatars' || entry.name === 'files') continue;
    const targetRoot = entry.isFile() && /^(avatar-|logo-)/.test(entry.name) ? 'avatars' : 'files';
    await fs.cp(path.join(source, entry.name), path.join(destination, targetRoot, entry.name), { recursive: true, dereference: true, errorOnExist: true });
  }
}

export async function dumpDatabase() {
  const requestedBase = process.env.BACKUP_ROOT ? path.resolve(process.env.BACKUP_ROOT) : '/home/web/backups';
  let base = requestedBase;
  try {
    await fs.mkdir(base, { recursive: true });
  } catch (error) {
    if (process.env.BACKUP_ROOT || !['EACCES', 'EPERM'].includes(error.code)) throw error;
    base = path.resolve(new URL('../../backups/', import.meta.url).pathname);
    console.warn(`Sin permiso para ${requestedBase}; los respaldos se guardarán en ${base}.`);
  }
  const name = timestamp();
  const directory = path.join(base, `.incomplete-${name}`);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  try {
    const dump = async ({database,host,port,user,password,filename}) => {
      const destination = path.join(directory, filename || `${database}.sql`);
      const args = [`--host=${host}`,`--port=${port}`,`--user=${user}`,'--single-transaction','--routines','--events','--result-file',destination,database];
      const configuredTimeout = Number(process.env.MYSQLDUMP_TIMEOUT_MS || 600000);
      const timeoutMs = Number.isSafeInteger(configuredTimeout) && configuredTimeout >= 1000 ? configuredTimeout : 600000;
      await new Promise((resolve, reject) => {
        const child = spawn(process.env.MYSQLDUMP_BIN || 'mysqldump', args, {
          env: { ...process.env, MYSQL_PWD: password },
          stdio: ['ignore', 'ignore', 'pipe'],
          signal: AbortSignal.timeout(timeoutMs),
        });
        let stderr = '';
        child.stderr.on('data', (chunk) => { stderr += chunk; });
        child.on('error', error => reject(error.name === 'AbortError' ? new Error(`mysqldump excedió ${timeoutMs} ms`) : error));
        child.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr.trim() || `mysqldump terminó con código ${code}`)));
      });
      return destination;
    };
    const destination = await dump({
      database:process.env.MYSQL_DATABASE||'dashcole',host:process.env.MYSQL_HOST||'localhost',port:process.env.MYSQL_PORT||'3306',user:process.env.MYSQL_USER||'dashcole',password:process.env.MYSQL_PASSWORD||'dashcole',
    });
    let controlDestination = null;
    if (process.env.CONTROL_MYSQL_DATABASE && process.env.CONTROL_MYSQL_DATABASE !== process.env.MYSQL_DATABASE) {
      controlDestination = await dump({
        database:process.env.CONTROL_MYSQL_DATABASE,host:process.env.CONTROL_MYSQL_HOST||process.env.MYSQL_HOST||'localhost',port:process.env.CONTROL_MYSQL_PORT||process.env.MYSQL_PORT||'3306',user:process.env.CONTROL_MYSQL_USER||process.env.MYSQL_USER||'dashcole',password:process.env.CONTROL_MYSQL_PASSWORD||process.env.MYSQL_PASSWORD||'dashcole',
      });
    }
    const tenantDestinations = [];
    if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
      const { controlModels } = await import('./database.js');
      const { databaseServerPassword } = await import('./database-routing.js');
      if (controlModels.DatabaseServer && controlModels.Tenant) {
        const [servers, tenants] = await Promise.all([controlModels.DatabaseServer.findAll({ raw: true }), controlModels.Tenant.findAll({ where: { status: 'active' }, raw: true })]);
        const serverById = new Map(servers.map(server => [server.id, server]));
        const routes = new Map(tenants.map(tenant => [`${tenant.databaseServerId}:${tenant.databaseName}`, tenant]));
        for (const tenant of routes.values()) {
          const server = serverById.get(tenant.databaseServerId);
          if (!server || server.isDefault && tenant.databaseName === (process.env.MYSQL_DATABASE || 'dashcole')) continue;
          const target = await dump({ database: tenant.databaseName, host: server.host, port: server.port, user: server.username, password: databaseServerPassword(server), filename: `tenant-server-${server.id}-${tenant.databaseName}.sql` });
          tenantDestinations.push(path.basename(target));
        }
      }
    }
    const uploads = path.resolve(process.env.UPLOAD_DIR || new URL('../uploads', import.meta.url).pathname);
    try {
      await fs.cp(uploads, path.join(directory, 'uploads'), { recursive: true, dereference: true, errorOnExist: true });
      await copySplitUploads(uploads, directory);
    } catch (error) {
      if (error.code !== 'ENOENT' || await fs.stat(uploads).then(() => true, () => false)) throw error;
      await fs.mkdir(path.join(directory, 'uploads'));
      await fs.mkdir(path.join(directory, 'avatars'));
      await fs.mkdir(path.join(directory, 'files'));
    }
    await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify({ createdAt: new Date().toISOString(), database: path.basename(destination), controlDatabase: controlDestination ? path.basename(controlDestination) : null, tenantDatabases: tenantDestinations, uploads: 'uploads', avatars: 'avatars', files: 'files', complete: true }, null, 2));
    const completed = path.join(base, name);
    await fs.rename(directory, completed);
    await pruneBackups(base);
    return completed;
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

export async function startBackupScheduler() {
  if (process.env.BACKUPS_ENABLED === 'false') return null;
  const connection = redisConnection();
  const queue = new Queue(queueName, { connection });
  await queue.upsertJobScheduler('every-12-hours', { every: 12 * 60 * 60 * 1000 }, { name: 'database-dump' });
  const worker = new Worker(queueName, async () => ({ destination: await dumpDatabase() }), { connection, concurrency: 1 });
  worker.on('completed', (job, result) => console.log(`Respaldo ${job.id} creado en ${result.destination}`));
  worker.on('failed', (job, error) => console.error(`Falló el respaldo ${job?.id}:`, error.message));
  return { queue, worker };
}

export async function stopBackupScheduler(scheduler) {
  if (!scheduler) return;
  await scheduler.worker.close();
  await scheduler.queue.close();
}

export async function pruneBackups(base, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 6);
  for (const entry of await fs.readdir(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/.test(entry.name)) continue;
    const date = new Date(entry.name.replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, 'T$1:$2:$3.$4Z'));
    if (date < cutoff) await fs.rm(path.join(base, entry.name), { recursive: true });
  }
}
