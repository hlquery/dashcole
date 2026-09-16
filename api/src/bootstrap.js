import './config.js';
import { initializeDatabase, pool, redis } from './database.js';

try {
  console.log('Preparando la instalación mínima de DashCole...');
  await initializeDatabase();
  console.log('Base de datos preparada con acceso inicial admin@hlquery.com / admin.');
} catch (error) {
  console.error('No fue posible preparar la base de datos:', error);
  process.exitCode = 1;
} finally {
  if (redis.isOpen) await redis.quit();
  await pool.end();
}
