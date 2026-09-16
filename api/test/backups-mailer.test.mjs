import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { dumpDatabase, pruneBackups } from '../src/backups.js';
import { sendCommunication } from '../src/mailer.js';

test('backup includes nested uploads and SQL; retention preserves recent and unrelated folders; failures stay incomplete', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'dashcole-backup-'));
  const previous = { ...process.env };
  try {
    const uploads = path.join(base, 'source');
    await fs.mkdir(path.join(uploads, 'files', 'hr'), { recursive: true });
    await fs.mkdir(path.join(uploads, 'avatars'), { recursive: true });
    await fs.writeFile(path.join(uploads, 'files', 'hr', 'contract.pdf'), 'contract');
    await fs.writeFile(path.join(uploads, 'avatars', 'avatar-demo.png'), 'avatar');
    const dump = path.join(base, 'mysqldump');
    await fs.writeFile(dump, '#!/usr/bin/env node\nconst fs=require("fs");fs.writeFileSync(process.argv[process.argv.indexOf("--result-file")+1],"SQL backup");\n', { mode: 0o700 });
    Object.assign(process.env, { BACKUP_ROOT: path.join(base, 'backups'), UPLOAD_DIR: uploads, MYSQLDUMP_BIN: dump, MYSQL_DATABASE: 'test' });
    const destination = await dumpDatabase();
    assert.equal(await fs.readFile(path.join(destination, 'test.sql'), 'utf8'), 'SQL backup');
    assert.equal(await fs.readFile(path.join(destination, 'uploads/files/hr/contract.pdf'), 'utf8'), 'contract');
    assert.equal(await fs.readFile(path.join(destination, 'uploads/avatars/avatar-demo.png'), 'utf8'), 'avatar');
    assert.equal(await fs.readFile(path.join(destination, 'avatars/avatar-demo.png'), 'utf8'), 'avatar');
    assert.equal(await fs.readFile(path.join(destination, 'files/hr/contract.pdf'), 'utf8'), 'contract');
    const manifest = JSON.parse(await fs.readFile(path.join(destination, 'manifest.json')));
    assert.equal(manifest.complete, true);
    assert.equal(manifest.avatars, 'avatars');
    assert.equal(manifest.files, 'files');
    for (const name of ['2025-01-01T00-00-00-000Z', '2026-08-01T00-00-00-000Z', 'manual-archive']) await fs.mkdir(path.join(process.env.BACKUP_ROOT, name));
    await pruneBackups(process.env.BACKUP_ROOT, new Date('2026-09-06T00:00:00Z'));
    const retained = await fs.readdir(process.env.BACKUP_ROOT);
    assert.ok(!retained.includes('2025-01-01T00-00-00-000Z'));
    assert.ok(retained.includes('2026-08-01T00-00-00-000Z'));
    assert.ok(retained.includes('manual-archive'));
    process.env.MYSQLDUMP_BIN = '/bin/false';
    await assert.rejects(dumpDatabase(), /código 1/);
    assert.equal((await fs.readdir(process.env.BACKUP_ROOT)).filter(name => !name.startsWith('.')).length, retained.filter(name => !name.startsWith('.')).length);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
    await fs.rm(base, { recursive: true, force: true });
  }
});

test('SMTP sends each recipient separately and reports rejected delivery', async () => {
  const previous = { ...process.env };
  const messages = [];
  let reject = false;
  const server = net.createServer(socket => {
    socket.write('220 localhost SMTP\r\n');
    let buffer = '', data = false, message = '';
    socket.on('data', chunk => {
      buffer += chunk;
      while (buffer.includes('\r\n')) {
        const boundary = buffer.indexOf('\r\n');
        const line = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
        if (data) {
          if (line === '.') { messages.push(message); message = ''; data = false; socket.write('250 accepted\r\n'); }
          else message += line + '\r\n';
        } else if (/^EHLO/.test(line)) socket.write('250 localhost\r\n');
        else if (/^MAIL FROM/.test(line)) socket.write('250 ok\r\n');
        else if (/^RCPT TO/.test(line)) socket.write(reject ? '550 refused\r\n' : '250 ok\r\n');
        else if (line === 'DATA') { data = true; socket.write('354 send data\r\n'); }
        else if (line === 'QUIT') socket.end('221 bye\r\n');
        else socket.write('250 ok\r\n');
      }
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    Object.assign(process.env, { SMTP_HOST: '127.0.0.1', SMTP_PORT: String(server.address().port), SMTP_SECURE: 'false', SMTP_USER: '', SMTP_FROM: 'test@example.com' });
    assert.deepEqual(await sendCommunication({ emails: ['one@example.com', 'two@example.com'], subject: 'School news', body: 'Hello school', school: { name: 'Colegio Demo', phone: '+56 2 1234 5678', email: 'contacto@colegio.cl' } }), { sent: 2, total: 2 });
    assert.equal(messages.length, 2);
    assert.match(messages[0], /To: one@example.com/);
    assert.doesNotMatch(messages[0], /two@example.com/);
    assert.match(messages[0], /Colegio Demo/);
    assert.match(messages[0], /Tel=C3=A9fono: \+56 2 1234 5678/);
    reject = true;
    await assert.rejects(sendCommunication({ emails: ['refused@example.com'], subject: 'News', body: 'Hello' }), /0 de 1/);
  } finally {
    await new Promise(resolve => server.close(resolve));
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
