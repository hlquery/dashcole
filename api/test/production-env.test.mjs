import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('production configuration validates active credentials without exposing secrets', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashcole-env-'));
  try {
    const file = path.join(directory, '.env.production');
    const base = 'MYSQL_HOST=localhost\nMYSQL_DATABASE=school\nMYSQL_USER=school\nMYSQL_PASSWORD=private-test-secret\nREDIS_URL=redis://localhost:6379\nWEB_ORIGIN=https://school.example\n';
    const check = async content => {
      await writeFile(file, content);
      const result = spawnSync(process.execPath, [new URL('../../etc/scripts/check-production-env.mjs', import.meta.url).pathname, file], { encoding: 'utf8' });
      assert.doesNotMatch(result.stdout + result.stderr, /private-test-secret/);
      return result;
    };
    assert.equal((await check(base + '# CHANGE_ME in a comment is harmless\nSMTP_HOST=\nSMTP_PASSWORD=CHANGE_ME\n')).status, 0);
    // SMTP fields may be null/empty even with a host — warn only, do not fail deploy.
    const partialMail = await check(base + 'SMTP_HOST=smtp.mailgun.org\nSMTP_USER=\nSMTP_PASSWORD=\nSMTP_FROM=\n');
    assert.equal(partialMail.status, 0);
    assert.match(partialMail.stderr + partialMail.stdout, /SMTP incompleto|Correo SMTP configurado/);
    const placeholderMail = await check(base + 'SMTP_HOST=smtp.mailgun.org\nSMTP_USER=CHANGE_ME\nSMTP_PASSWORD=CHANGE_ME\nSMTP_FROM=CHANGE_ME\n');
    assert.equal(placeholderMail.status, 0);
    assert.equal((await check(base.replace('private-test-secret', 'CHANGE_ME'))).status, 1);
    assert.equal((await check(base + 'SMTP_HOST=smtp.mailgun.org\nSMTP_USER=sender\nSMTP_PASSWORD=private-test-secret\nSMTP_FROM=school@example.com\n')).status, 0);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
