import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient, latestRequest } from '../src/api/client.js';

test('central client unwraps v1, handles FormData, binary and 204', async () => {
  const bodies = [new Response(JSON.stringify({ data: [1], meta: {} })), new Response('pdf'), new Response(null, { status: 204 })];
  const client = createApiClient({ baseUrl: '/api/', getToken: () => 'token', fetchImpl: async (url, init) => {
    assert.equal(url, '/api/resource'); assert.equal(init.headers.get('Authorization'), 'Bearer token');
    assert.equal(init.headers.get('Content-Type'), null); return bodies.shift();
  } });
  assert.deepEqual(await client('/resource', { body: new FormData(), method: 'POST' }), [1]);
  assert.equal(await (await client('/resource', { raw: true })).text(), 'pdf');
  assert.equal(await client('/resource'), null);
});
test('401 clears session, 403/409 carry actionable errors and request IDs', async () => {
  let cleared = 0;
  for (const status of [401, 403, 409]) {
    const client = createApiClient({ getToken: () => null, unauthorized: () => cleared++, fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'Mensaje', code: 'CODE', requestId: 'trace' } }), { status }) });
    await assert.rejects(client('/private', { raw: true }), error => error.status === status && error.requestId === 'trace' && error.message === 'Mensaje');
  }
  assert.equal(cleared, 1);
});
test('timeouts and canceled searches have distinct outcomes; latest search cancels previous request', async () => {
  const client = createApiClient({ getToken: () => null, timeout: 10, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) });
  await assert.rejects(client('/slow'), error => error.code === 'TIMEOUT');
  const latest = latestRequest((signal, query) => client(`/students?q=${query}`, { signal, timeoutMs: 1000 }));
  const first = latest.run('a'); const firstRejected = assert.rejects(first, error => error.name === 'AbortError');
  const second = latest.run('b'); const secondRejected = assert.rejects(second, error => error.name === 'AbortError'); latest.cancel();
  await Promise.all([firstRejected, secondRejected]);
});
