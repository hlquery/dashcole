import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';

function portNumber(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(name + ' debe ser un puerto entre 1 y 65535.');
  return port;
}
async function listen(server, port, host) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return server;
}
export async function startListeners(app) {
  const port = portNumber(process.env.PORT || 7000, 'PORT');
  const mobilePort = process.env.MOBILE_PORT ? portNumber(process.env.MOBILE_PORT, 'MOBILE_PORT') : null;
  if (mobilePort === port) throw new Error('MOBILE_PORT debe ser diferente de PORT.');
  // Load and validate TLS before opening either socket. Never fall back to plaintext.
  let mobileServer;
  if (mobilePort) {
    if (!process.env.MOBILE_TLS_CERT || !process.env.MOBILE_TLS_KEY) throw new Error('MOBILE_PORT requiere MOBILE_TLS_CERT y MOBILE_TLS_KEY.');
    const [cert, key] = await Promise.all([fs.readFile(process.env.MOBILE_TLS_CERT), fs.readFile(process.env.MOBILE_TLS_KEY)]);
    mobileServer = https.createServer({ cert, key, minVersion: 'TLSv1.2' }, app);
  }
  const servers = [];
  try {
    servers.push(await listen(http.createServer(app), port, process.env.API_HOST || '127.0.0.1'));
    if (mobileServer) servers.push(await listen(mobileServer, mobilePort, process.env.MOBILE_HOST || '0.0.0.0'));
    console.log('DashCole API en http://' + (process.env.API_HOST || '127.0.0.1') + ':' + port);
    if (mobileServer) console.log('DashCole API móvil HTTPS en puerto ' + mobilePort);
    return servers;
  } catch (error) {
    for (const server of servers) server.close();
    throw error;
  }
}
