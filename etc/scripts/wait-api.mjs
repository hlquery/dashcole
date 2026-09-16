import { setTimeout } from 'node:timers/promises';
import http from 'node:http';
import { readFileSync } from 'node:fs';

function envValue(key) {
  const line = readFileSync('.env', 'utf8').split(/\r?\n/).find(item => item.trim().startsWith(`${key}=`));
  if (!line) return '';
  return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

const port = Number(process.env.PORT || envValue('PORT') || 7000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT debe ser un puerto válido.');
  process.exit(1);
}

function requestJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      timeout: 2000,
      signal: AbortSignal.timeout(3000),
      headers: options.headers || {},
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try { resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, body: JSON.parse(body) }); }
        catch (error) { reject(error); }
      });
    });
    if (options.body) request.write(options.body);
    request.on('timeout', () => request.destroy(new Error('API health timeout')));
    request.on('error', reject);
    request.end();
  });
}

async function healthCheck() {
  const health = await requestJson('/api/health');
  if (!health.ok) return { ok: false, detail: 'La API respondió health con HTTP ' + health.status };
  if (health.body.status !== 'ok' || health.body.mysql !== 'connected' || health.body.redis !== 'connected') {
    return { ok: false, detail: 'La API responde, pero sus servicios aún no están listos.' };
  }
  return { ok: true };
}

console.log(`Esperando la API en el puerto ${port}…`);
let detail = 'La API todavía no responde.';
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const result = await healthCheck();
    if (result.ok) {
      console.log(`API lista en :${port}; MySQL y Redis conectados.`);
      process.exit(0);
    }
    detail = result.detail;
  } catch (error) { detail = error.message || 'No se pudo conectar con la API.'; }
  console.log(`Intento ${attempt + 1}/30: ${detail}`);
  if (attempt < 29) await setTimeout(2000);
}
console.error(`${detail} Revisa: pm2 logs dashcole-api --lines 50`);
process.exitCode = 1;
