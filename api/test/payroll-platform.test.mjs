import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createPreviredLine, PREVIRED_FORMAT_VERSION } from '../src/services/previred.js';
import { encryptSecret, decryptSecret } from '../src/services/secret-config.js';

test('Previred v98 export has exactly 105 fields and maps payroll totals', () => {
  const record = {
    id: 9, employeeId: 4,
    snapshot: { period: '2026-08', employee: { payrollProfile: {
      afp: 'Habitat', healthSystem: 'Fonasa',
      previred: { rut: '12.345.678-5', paternalSurname: 'Pérez', maternalSurname: 'Soto', givenNames: 'Ana', sex: 'F', nationality: '0', workdayType: '1' },
    } } },
    totals: { total_imponible: 1200000, base_previsional: 1200000, daysWorked: 30 },
  };
  const result = createPreviredLine(record, [{ code: 'afp', amount: 135000 }, { code: 'health', amount: 84000 }, { code: 'sis', amount: 24000 }]);
  assert.equal(PREVIRED_FORMAT_VERSION, '98-2026-08');
  assert.deepEqual(result.errors, []);
  assert.equal(result.line.split(';').length, 105);
  assert.equal(result.fields[8], '082026');
  assert.equal(result.fields[25], '05');
  assert.equal(result.fields[26], '1200000');
  assert.equal(result.fields[69], '84000');
});

test('Previred preflight rejects missing legal identity fields', () => {
  const result = createPreviredLine({ snapshot: { period: '2026-08', employee: { payrollProfile: { previred: {} } } }, totals: {} }, []);
  assert.ok(result.errors.includes('RUT con dígito verificador'));
  assert.ok(result.errors.includes('tipo de jornada'));
});

test('tenant integration secrets use authenticated AES-256-GCM encryption', () => {
  const previous = process.env.CONFIG_ENCRYPTION_KEY;
  process.env.CONFIG_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  try {
    const ciphertext = encryptSecret('meta-token-sensitive');
    assert.notEqual(ciphertext, 'meta-token-sensitive');
    assert.equal(decryptSecret(ciphertext), 'meta-token-sensitive');
  } finally {
    if (previous === undefined) delete process.env.CONFIG_ENCRYPTION_KEY;
    else process.env.CONFIG_ENCRYPTION_KEY = previous;
  }
});
