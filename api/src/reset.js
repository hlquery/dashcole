import './config.js';
import { initializeDatabase, redis, sequelize } from './database.js';

try {
  console.log('Recreando el esquema de DashCole en la base configurada...');
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await initializeDatabase();
  console.log('Esquema recreado con la cuenta inicial admin@hlquery.com / admin.');
} catch (error) {
  console.error('No fue posible recrear el esquema:', error);
  process.exitCode = 1;
} finally {
  if (redis.isOpen) await redis.quit();
  await sequelize.close();
}
