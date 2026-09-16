import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import net from 'node:net';
import https from 'node:https';
import { startListeners } from '../src/listeners.js';

async function freePort() {
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
test('mobile requires TLS and serves the same application on a separate HTTPS port', async () => {
  const original = { ...process.env };
  const directory = await mkdtemp(path.join(tmpdir(), 'dashcole-tls-'));
  let servers = [];
  try {
    process.env.PORT = String(await freePort());
    process.env.MOBILE_PORT = String(await freePort());
    process.env.API_HOST = process.env.MOBILE_HOST = '127.0.0.1';
    delete process.env.MOBILE_TLS_CERT;
    delete process.env.MOBILE_TLS_KEY;
    const app = (_req, res) => { res.statusCode = 401; res.end('Authentication required'); };
    await assert.rejects(startListeners(app), /requiere MOBILE_TLS_CERT/);
    const cert = path.join(directory, 'cert.pem'), key = path.join(directory, 'key.pem');
    const generated = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=IP:127.0.0.1'], { encoding: 'utf8' });
    assert.equal(generated.status, 0, generated.stderr);
    process.env.MOBILE_TLS_CERT = cert;
    process.env.MOBILE_TLS_KEY = key;
    servers = await startListeners(app);
    const httpResponse = await fetch('http://127.0.0.1:' + process.env.PORT + '/api/courses');
    assert.equal(httpResponse.status, 401);
    const secureResponse = await new Promise(async (resolve, reject) => {
      const request = https.get({ hostname: '127.0.0.1', port: process.env.MOBILE_PORT, path: '/api/courses', ca: await readFile(cert) }, res => { res.resume(); resolve(res.statusCode); });
      request.on('error', reject);
    });
    assert.equal(secureResponse, 401);
  } finally {
    for (const server of servers) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    for (const name of Object.keys(process.env)) if (!(name in original)) delete process.env[name];
    Object.assign(process.env, original);
    await rm(directory, { recursive: true, force: true });
  }
});

test('sync downloads and verifies backups, never deploys or deletes local history', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashcole-sync-'));
  try {
    const scripts = path.join(directory, 'etc/scripts'), bin = path.join(directory, 'bin'), log = path.join(directory, 'calls');
    await mkdir(scripts, { recursive: true }); await mkdir(bin);
    const script = path.join(scripts, 'sync');
    await writeFile(script, await readFile(new URL('../../etc/scripts/sync', import.meta.url)), { mode: 0o700 });
    await writeFile(path.join(bin, 'ssh'), '#!/bin/bash\nif [[ "$*" == *node* ]]; then echo /remote/backups; fi\n', { mode: 0o700 });
    await writeFile(path.join(bin, 'rsync'), '#!/bin/bash\nprintf "%s\\n" "$*" >> "$SYNC_TEST_LOG"\nif [[ "$*" == *-acni* && "${SYNC_TEST_FAIL:-}" == yes ]]; then echo changed; fi\n', { mode: 0o700 });
    const env = { ...process.env, PATH: bin + ':' + process.env.PATH, SYNC_TEST_LOG: log };
    const result = spawnSync('bash', [script], { env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const calls = await readFile(log, 'utf8');
    assert.match(calls, /-az --exclude .*web:\/remote\/backups\//);
    assert.match(calls, /-acni/);
    assert.doesNotMatch(calls, /--delete|api\/|dashboard\/|www\//);
    const failed = spawnSync('bash', [script], { env: { ...env, SYNC_TEST_FAIL: 'yes' }, encoding: 'utf8' });
    assert.notEqual(failed.status, 0);
    assert.match(failed.stdout, /verificación/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
