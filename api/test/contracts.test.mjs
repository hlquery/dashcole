import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { apiContract, apiErrorHandler } from '../src/http.js';
import { getSchoolContext, assertOwnedBySchool, requirePermission } from '../src/school-context.js';
import { pagination, isValidDate, isValidMoney, isValidRut } from '../src/validation.js';
import { safeUploadPath, validateFile, persistUpload, migrateUploadLayout, uploadCategory, tenantUploadKey } from '../src/uploads.js';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

test('upload persistence removes failed files and preserves existing keys', async () => {
  const key = `test-${crypto.randomUUID()}.png`;
  const filename = safeUploadPath(key);
  assert.match(filename, /[/\\]files[/\\]test-/);
  try {
    await assert.rejects(persistUpload(key, Buffer.from('image'), async () => { throw new Error('DB failure'); }), /DB failure/);
    await assert.rejects(fs.stat(filename), { code: 'ENOENT' });
    assert.equal(await persistUpload(key, Buffer.from('original'), async () => 42), 42);
    await assert.rejects(persistUpload(key, Buffer.from('replacement'), async () => {}), { code: 'EEXIST' });
    assert.equal(await fs.readFile(filename, 'utf8'), 'original');
  } finally { await fs.unlink(filename).catch(() => {}); }
});

test('upload keys map avatars and files under tenant folders', () => {
  assert.equal(uploadCategory('avatar-user-1.png'), 'avatars');
  assert.equal(uploadCategory('logo-1.png'), 'avatars');
  assert.equal(uploadCategory('material-1.pdf'), 'files');
  const avatarKey = tenantUploadKey(3, 'avatar-abc.png');
  assert.equal(avatarKey, 'tenant-3/avatar-abc.png');
  assert.match(safeUploadPath(avatarKey), /[/\\]avatars[/\\]tenant-3[/\\]avatar-abc\.png$/);
  assert.match(safeUploadPath(tenantUploadKey(3, 'document-abc.pdf')), /[/\\]files[/\\]tenant-3[/\\]document-abc\.pdf$/);
});

test('migrateUploadLayout moves legacy tenant and loose files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dashcole-uploads-'));
  try {
    await fs.mkdir(path.join(root, 'tenant-2'), { recursive: true });
    await fs.writeFile(path.join(root, 'tenant-2', 'avatar-old.png'), 'a');
    await fs.writeFile(path.join(root, 'tenant-2', 'doc-old.pdf'), 'd');
    await fs.writeFile(path.join(root, 'avatar-loose.png'), 'L');
    const first = await migrateUploadLayout(root);
    assert.equal(first.moved, 3);
    assert.equal(await fs.readFile(path.join(root, 'avatars', 'tenant-2', 'avatar-old.png'), 'utf8'), 'a');
    assert.equal(await fs.readFile(path.join(root, 'files', 'tenant-2', 'doc-old.pdf'), 'utf8'), 'd');
    assert.equal(await fs.readFile(path.join(root, 'avatars', 'avatar-loose.png'), 'utf8'), 'L');
    await assert.rejects(fs.stat(path.join(root, 'tenant-2')), { code: 'ENOENT' });
    assert.equal((await migrateUploadLayout(root)).moved, 0);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('tenant context rejects missing school, ignores client school and enforces ownership', async () => {
  assert.throws(() => getSchoolContext({ id: 1 }), error => error.status === 403);
  const req = { user: { id: 1, schoolId: 2 }, body: { school_id: 8 }, query: { school_id: 8 } };
  assert.deepEqual(getSchoolContext(req), { schoolId: 2 });
  const model = { findOne: async options => { assert.deepEqual(options.where, { id: 3, schoolId: 2 }); return null; } };
  await assert.rejects(assertOwnedBySchool(model, 3, req, { where: { schoolId: 8 } }), error => error.status === 404);
  assert.throws(() => requirePermission('manageUsers')(req, {}, () => {}), error => error.status === 403);
});
test('validation prevents invalid dates, money overflow, RUT errors, traversal and sort injection', () => {
  assert.equal(isValidDate('2026-02-29'), false); assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidMoney('9999999999.99'), true); assert.equal(isValidMoney('10000000000'), false); assert.equal(isValidMoney('0.001'), false);
  assert.equal(isValidRut('12.345.678-5'), true); assert.equal(isValidRut('12.345.678-9'), false);
  assert.throws(() => pagination({ sort: 'id;DROP TABLE users' }, ['id']));
  assert.throws(() => pagination({ page: '1.2' }, ['id'])); assert.throws(() => pagination({ pageSize: 101 }, ['id']));
  assert.equal(pagination({ page: 2, pageSize: 10 }, ['id']).offset, 10);
  for (const key of ['../secret', '..\\secret', '/tmp/a', '.', '..']) assert.throws(() => safeUploadPath(key));
  assert.throws(() => validateFile({ originalname: 'a.pdf', mimetype: 'text/html' }));
});
test('HTTP envelopes cover errors, malformed JSON, duplicate conflict and legacy compatibility', async () => {
  const app = express(); app.use(apiContract); app.use(express.json());
  app.get('/ok', (_req, res) => res.json([1]));
  app.post('/body', (req, res) => res.json(req.body));
  app.get('/duplicate', () => { throw Object.assign(new Error('SQL secret'), { name: 'SequelizeUniqueConstraintError' }); });
  app.use((_req, res) => res.status(404).json({ message: 'No encontrado.' })); app.use(apiErrorHandler);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.deepEqual(await (await fetch(base + '/ok')).json(), [1]);
    assert.deepEqual(await (await fetch(base + '/ok', { headers: { Accept: 'application/vnd.dashcole.v1+json' } })).json(), { data: [1], meta: {} });
    for (const [path, options, status] of [['/missing', {}, 404], ['/duplicate', {}, 409], ['/body', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }, 400]]) {
      const response = await fetch(base + path, options); const data = await response.json(); assert.equal(response.status, status); assert.equal(data.error.requestId, response.headers.get('x-request-id')); assert.ok(data.error.code); assert.doesNotMatch(JSON.stringify(data), /SQL secret|stack/);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
