/** Cuentas fijas del colegio demo principal (@hlquery.com). Clave sembrada: admin. */
const DEMO_PASSWORD = 'admin';

const DEMO_ACCOUNTS = [
  {
    group: 'Inicio rápido',
    role: 'director',
    roleLabel: 'Director',
    username: 'demo@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Cuenta Demo DashCole',
    title: 'Recorrido general',
    description: 'La cuenta más simple para mostrar el producto. Entra como director al colegio principal y recorre cursos, finanzas y administración en solo lectura.',
  },
  {
    group: 'Dirección y gestión',
    role: 'director',
    roleLabel: 'Director',
    username: 'admin@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Administrador DashCole',
    title: 'Director del colegio',
    description: 'Misma visión completa del colegio: estructura académica, personal, reportes y configuración institucional.',
  },
  {
    group: 'Dirección y gestión',
    role: 'manager',
    roleLabel: 'Equipo directivo',
    username: 'manager@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Sebastián Rojas',
    title: 'Equipo directivo',
    description: 'Coordinación académica y operación del colegio sin ser el director titular.',
  },
  {
    group: 'Dirección y gestión',
    role: 'utp',
    roleLabel: 'Jefe de UTP',
    username: 'jefeutp@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Patricia Espinoza',
    title: 'Jefe de UTP',
    description: 'Planificación, seguimiento pedagógico, SIGE y gestión académica del colegio.',
  },
  {
    group: 'Docentes',
    role: 'teacher',
    roleLabel: 'Profesor',
    username: 'profesor1@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Daniela Morales',
    title: 'Profesor jefe',
    description: 'Profesora jefe con ramos a cargo. Úsala para ver el aula, notas y cursos desde la mirada docente.',
    aliases: ['profesor@hlquery.com'],
  },
  {
    group: 'Docentes',
    role: 'teacher',
    roleLabel: 'Profesor',
    username: 'profesor2@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Javiera Soto',
    title: 'Profesora de asignatura',
    description: 'Docente con asignaturas asignadas. Ideal para mostrar el alcance de un profesor que no es jefe de curso.',
    aliases: ['profesora2@hlquery.com'],
  },
  {
    group: 'Finanzas',
    role: 'agente_finanzas',
    roleLabel: 'Agente de finanzas',
    username: 'finanzas@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Carolina Pérez',
    title: 'Finanzas y RRHH',
    description: 'Acceso a cobros, pagos, remuneraciones e inventario. No entra a módulos académicos.',
  },
  {
    group: 'Familia y estudiantes',
    role: 'student',
    roleLabel: 'Estudiante',
    username: 'estudiante@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Estudiante demo',
    title: 'Estudiante',
    description: 'Portal del alumno: notas, asistencia, materiales y resumen personal.',
  },
  {
    group: 'Familia y estudiantes',
    role: 'guardian',
    roleLabel: 'Apoderado',
    username: 'apoderado@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Apoderado demo',
    title: 'Apoderado',
    description: 'Vista de familia: seguimiento de estudiantes asociados, comunicaciones y pagos.',
  },
  {
    group: 'Familia y estudiantes',
    role: 'guardian',
    roleLabel: 'Apoderado',
    username: 'padre.demo@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Padre demo',
    title: 'Segundo apoderado',
    description: 'Otra cuenta de apoderado del mismo colegio, útil para comparar perfiles familiares.',
  },
  {
    group: 'Plataforma',
    role: 'super_admin',
    roleLabel: 'Super admin',
    username: 'super@hlquery.com',
    password: DEMO_PASSWORD,
    fullName: 'Super Admin',
    title: 'Consola de plataforma',
    description: 'Gestión multi-colegio: tenants, cuentas globales, SMTP y herramientas de plataforma.',
  },
];

const DEMO_GUIDE_INTRO = 'Este dashboard está en modo demostración (solo lectura). Usa cualquiera de estas cuentas con la clave admin para explorar un rol distinto.';

const DEMO_GUIDE_NOTES = [
  'Todas las claves de ejemplo son: admin',
  'Los cambios no se guardan: el entorno se reinicia periódicamente.',
  'También existen otros colegios demo (Andino, Pacífico, Mapocho, Araucaria) con correos como director@colegio-andino.demo.hlquery.com y la misma clave admin.',
];

export function demoGuidePayload() {
  return {
    intro: DEMO_GUIDE_INTRO,
    passwordHint: DEMO_PASSWORD,
    notes: DEMO_GUIDE_NOTES,
    accounts: DEMO_ACCOUNTS,
  };
}
