import './config.js';
import { models, sequelize } from './database.js';

const required = {
  colegios: [models.School, 1],
  usuarios: [models.User, 2],
  estudiantes: [models.Student, 3],
  'años académicos': [models.AcademicYear, 3],
  cursos: [models.Course, 2],
  calificaciones: [models.Grade, 1],
  postulaciones: [models.AdmissionApplication, 6],
};

try {
  await sequelize.authenticate();
  const counts = Object.fromEntries(
    await Promise.all(Object.entries(required).map(async ([name, [model]]) => [name, await model.count()])),
  );
  const missing = Object.entries(required)
    .filter(([name, [, minimum]]) => counts[name] < minimum)
    .map(([name]) => name);

  console.log('MySQL verificado en ' + sequelize.config.host + ':' + sequelize.config.port + '/' + sequelize.config.database + ' (usuario ' + sequelize.config.username + ')');
  console.table(counts);
  if (missing.length) throw new Error('Faltan datos iniciales en: ' + missing.join(', '));
  console.log('La base contiene todos los datos iniciales requeridos.');
} catch (error) {
  console.error('Verificación SQL fallida:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
