#!/usr/bin/env node
/**
 * Compara migraciones locales (api/src/migrations.js) con IDs aplicados remotos.
 * Entrada: lista remota por stdin (un id por línea) o --remote=id1,id2
 * Salida: exit 0 si cuadra; exit 2 si no cuadra (pendientes o desconocidas).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'api/src/migrations.js'), 'utf8');
const local = [...source.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
if (!local.length) {
  console.error('No se encontraron migraciones locales en api/src/migrations.js');
  process.exit(1);
}

const remoteArg = process.argv.find((arg) => arg.startsWith('--remote='));
let remoteText = '';
if (remoteArg) remoteText = remoteArg.slice('--remote='.length).replaceAll(',', '\n');
else if (!process.stdin.isTTY) remoteText = readFileSync(0, 'utf8');
else {
  console.error('Pasa los IDs remotos por stdin o --remote=id1,id2');
  process.exit(1);
}

const remote = [...new Set(
  remoteText
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean),
)];

const localSet = new Set(local);
const remoteSet = new Set(remote);
const pending = local.filter((id) => !remoteSet.has(id));
const unknown = remote.filter((id) => !localSet.has(id));

const report = {
  local: local.length,
  remote: remote.length,
  pending,
  unknown,
  ok: pending.length === 0 && unknown.length === 0,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  if (pending.length) {
    console.error(`ERR: la base remota no cuadra — faltan ${pending.length} migración(es): ${pending.join(', ')}`);
  }
  if (unknown.length) {
    console.error(`ERR: la base remota no cuadra — tiene ${unknown.length} migración(es) desconocida(s): ${unknown.join(', ')}`);
  }
  process.exit(2);
}
console.error('Schema OK: migraciones locales y remotas coinciden.');
