import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import express from 'express';

const classroom = fs.readFileSync(new URL('../src/classroom.js', import.meta.url), 'utf8');
const academics = fs.readFileSync(new URL('../src/academics.js', import.meta.url), 'utf8');

test('publication editing enforces role, school and course scope and preserves attachments on text edits', async () => {
  const app = express(); app.use(express.json());
  app.use((req, _res, next) => { req.user = { id: 7, schoolId: 1, role: req.headers['x-role'] || 'teacher', permissions: { manageGrades: true } }; next(); });
  const assignment = {
    id: 10,
    title: 'Original',
    storageKey: null,
    async update(values) { Object.assign(this, values); },
    async destroy() { this.deleted = true; },
    toJSON() { return { ...this }; },
  };
  const material = { id: 20, courseId: 297, storageKey: 'old.pdf', async update(values) { Object.assign(this, values); }, async destroy() { this.deleted = true; } };
  let submissionsDeleted = false;
  const models = {
    Course: { async findOne({ where }) { return where.id === 297 && where.schoolId === 1 ? { id: 297 } : null; } },
    Assignment: { async findOne({ where }) { return where.schoolId === 1 && where.courseId === 297 && Number(where.id) === 10 ? assignment : null; } },
    TeachingMaterial: { async findOne({ where }) { return where.schoolId === 1 && where.id === 20 ? material : null; } },
    Submission: { async findAll() { return []; }, async destroy() { submissionsDeleted = true; } },
  };
  const context = { app, models, sequelize: { transaction: fn => fn({}) }, createUpload: () => ({ single: () => (_req, _res, next) => next() }), canAccessCourse: async (_user, id) => id === 297, safeUploadPath: key => key, fs: { unlink: async () => {} } };
  vm.createContext(context);
  vm.runInContext(classroom.slice(classroom.indexOf('const upload =')).replace('export function registerClassroomRoutes', 'function registerClassroomRoutes') + '\nregisterClassroomRoutes(app);', context);
  vm.runInContext(academics.slice(academics.indexOf('function canManageMaterials('), academics.indexOf('function canManagePeople(')) + academics.slice(academics.indexOf('  const editableMaterial ='), academics.indexOf("  app.get('/api/materials/:id/download'")), context);
  app.use((error, _req, res, _next) => res.status(500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const send = async (path, method, body, role = 'teacher') => fetch(`http://127.0.0.1:${server.address().port}${path}`, { method, headers: { 'content-type': 'application/json', 'x-role': role }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const taskUrl = '/api/courses/297/classroom/assignments/10';
  const valid = { title: 'Nuevo título', instructions: 'Nuevas instrucciones', dueAt: '2026-12-01T12:30:00Z' };
  try {
    for (const role of ['student', 'guardian']) {
      for (const [url, body] of [[taskUrl, valid], ['/api/materials/20', { title: 'Cambio', description: 'Texto' }]]) {
        assert.equal((await send(url, 'PUT', body, role)).status, 403);
        assert.equal((await send(url, 'DELETE', null, role)).status, 403);
      }
    }
    assert.equal((await send('/api/courses/298/classroom/assignments/10', 'PUT', valid)).status, 403);
    assert.equal((await send('/api/courses/297/classroom/assignments/99', 'PUT', valid)).status, 404);
    assert.equal((await send(taskUrl, 'PUT', { ...valid, title: '' })).status, 400);
    assert.equal(assignment.title, 'Original');
    assert.equal((await send(taskUrl, 'PUT', valid)).status, 200);
    assert.equal(assignment.instructions, valid.instructions);
    assert.equal(submissionsDeleted, false);
    assert.equal((await send('/api/materials/20', 'PUT', { title: 'Guía', description: 'Lee el capítulo 2.' })).status, 200);
    assert.equal(material.description, 'Lee el capítulo 2.');
    assert.equal(material.storageKey, 'old.pdf');
    assert.equal((await send('/api/materials/99', 'DELETE')).status, 404);
    assert.equal((await send('/api/materials/20', 'DELETE')).status, 200);
    assert.equal(material.deleted, true);
    assert.equal((await send(taskUrl, 'DELETE')).status, 200);
    assert.equal(submissionsDeleted, true);
    assert.equal(assignment.deleted, true);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
