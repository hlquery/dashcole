import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('leave module exports route registrar', async () => {
  const leave = await import('../src/leave.js');
  assert.equal(typeof leave.registerLeaveRoutes, 'function');
});

test('LeaveRequest model is defined', async () => {
  // Lightweight structural check without spinning a real DB.
  const modelsSource = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../src/models.js', import.meta.url), 'utf8'));
  assert.match(modelsSource, /LeaveRequest/);
  assert.match(modelsSource, /leave_requests/);
});
