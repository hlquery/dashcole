import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NullSigeAuthProvider, UnconfiguredSigeProvider } from '../src/services/sige/providers.js';
import { normalizedSigePayload, sanitizeSigePayload, sigePayloadHash } from '../src/services/sige/sync-service.js';

test('SIGE payload hashing is deterministic and secret logging is redacted', () => {
  const first = { lastName: ' Pérez ', firstName: ' Ana ', nested: { token: 'secret', value: 2 } };
  const second = { nested: { value: 2, token: 'different' }, firstName: 'Ana', lastName: 'Pérez' };
  assert.deepEqual(normalizedSigePayload(first).firstName, 'Ana');
  assert.notEqual(sigePayloadHash(first), sigePayloadHash(second), 'secret values remain part of idempotency input before sanitization');
  assert.deepEqual(sanitizeSigePayload(first).nested, { token: '[REDACTED]', value: 2 });
  assert.equal(sigePayloadHash({ b: 2, a: 1 }), sigePayloadHash({ a: 1, b: 2 }));
});

test('unconfigured SIGE providers expose no capabilities and fail explicitly', async () => {
  const auth = new NullSigeAuthProvider();
  await assert.rejects(auth.authenticate({}), error => error.code === 'SIGE_NOT_CONFIGURED');
  const provider = new UnconfiguredSigeProvider(auth);
  assert.deepEqual(provider.capabilities.students, { read: false, write: false });
  await assert.rejects(provider.testConnection({}), error => error.code === 'SIGE_NOT_CONFIGURED');
});
