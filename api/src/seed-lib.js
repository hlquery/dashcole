import './config.js';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { fakerES as faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { controlModels, controlSequelize, initializeDatabase, models, primarySequelize, redis, sequelize, PLATFORM_BOOTSTRAP_USERS, SCHOOL_DEMO_USERS } from './database.js';
import { ensureDefaultDatabaseRouting } from './database-routing.js';
import { safeUploadPath, tenantUploadKey } from './uploads.js';
import { DEFAULT_JOB_TITLES } from './services/job-titles.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const credentialsDir = path.join(projectRoot, 'target');
const DEFAULT_PASSWORD = 'admin';
const ROLE_PASSWORD = {
  super_admin: DEFAULT_PASSWORD,
  director: DEFAULT_PASSWORD,
  school_admin: DEFAULT_PASSWORD,
  manager: DEFAULT_PASSWORD,
  utp: DEFAULT_PASSWORD,
  agente_finanzas: DEFAULT_PASSWORD,
  finance: DEFAULT_PASSWORD,
  teacher: DEFAULT_PASSWORD,
  inspector: DEFAULT_PASSWORD,
  student: DEFAULT_PASSWORD,
  guardian: DEFAULT_PASSWORD,
};
const RESERVED_SEED_EMAILS = new Set([
  ...PLATFORM_BOOTSTRAP_USERS.map(account => account.username.toLowerCase()),
  ...SCHOOL_DEMO_USERS.map(account => account.username.toLowerCase()),
]);

function credentialRow({ scope, school, slug, role, fullName, username, password }) {
  return {
    scope,
    school: school || '',
    slug: slug || '',
    role,
    fullName: fullName || '',
    username,
    password,
  };
}

function formatCredentialsDump(rows) {
  const generatedAt = new Date().toISOString();
  const lines = [
    'DashCole — credenciales Faker',
    `Generado: ${generatedAt}`,
    '',
    'Orden: plataforma, cuenta demo fija, luego usuarios demo por colegio.',
    'La cuenta demo@hlquery.com es del instalador (x3/x4) y no la crea el Faker.',
    'Nombres y correos son fijos (no cambian entre reseeds). Clave: admin',
    '',
  ];
  let section = '';
  for (const row of rows) {
    const nextSection = row.scope === 'platform'
      ? 'SUPER ADMIN / PLATAFORMA'
      : row.scope === 'demo'
        ? 'CUENTA DEMO FIJA (instalador)'
        : `COLEGIO · ${row.school} (${row.slug})`;
    if (nextSection !== section) {
      section = nextSection;
      lines.push('='.repeat(72));
      lines.push(section);
      lines.push('='.repeat(72));
    }
    lines.push(`${row.role.padEnd(16)}  ${row.username.padEnd(42)}  ${row.password}  · ${row.fullName}`);
  }
  lines.push('');
  lines.push('Notas:');
  lines.push('- Todas las claves sembradas usan: admin');
  lines.push('- Los super admin se gestionan en /plataforma (cuentas globales).');
  lines.push('- demo@hlquery.com es independiente del Faker; úsala para mostrar el producto.');
  lines.push('- Los usuarios de colegio se administran en /administracion del tenant.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function writeCredentialsDump(rows) {
  await fs.mkdir(credentialsDir, { recursive: true });
  const latestPath = path.join(credentialsDir, 'faker-credentials.txt');
  const body = formatCredentialsDump(rows);
  await fs.writeFile(latestPath, body, 'utf8');
  // Solo un archivo estable: borra copias con fecha que confunden al login.
  const existing = await fs.readdir(credentialsDir).catch(() => []);
  await Promise.all(existing
    .filter((name) => name.startsWith('faker-credentials-') && name.endsWith('.txt'))
    .map((name) => fs.unlink(path.join(credentialsDir, name)).catch(() => null)));
  return { latestPath };
}

const {
  School, Campus, AcademicYear, User, Employee, JobTitle, Student, Guardian, StudentGuardian,
  Subject, Course, CourseSchedule, TeachingMaterial, Enrollment, Grade, Attendance, ClassSession, Observation,
  Assignment, Submission, Forum, ForumPost,
  Invoice, Payment, Supplier, Expense, AccountabilityEntry, InventoryItem, Incident, Communication,
  AuditLog, AdmissionApplication, PlanningUnit, PlanningComment, ContactMessage,
  PayrollPeriod, PayrollParameter, PayrollAfpRate, PayrollTaxBracket, PayrollConcept,
} = models;

const avatarColors = ['#DDEEFF', '#DFF6F0', '#FFE8D9', '#EDE4FF', '#FFF3CC', '#DDEFD8'];
const SUBJECT_DEFINITIONS = [
  ['Matemática', 'MAT', '#0067b2'],
  ['Lenguaje', 'LEN', '#F59E6D'],
  ['Ciencias', 'CIE', '#27A37D'],
  ['Historia', 'HIS', '#8B6CCF'],
  ['Inglés', 'ING', '#0EA5A4'],
  ['Educación Física', 'EDF', '#E11D48'],
  ['Artes', 'ART', '#D97706'],
  ['Tecnología', 'TEC', '#4F46E5'],
];
const COURSE_LEVELS = [
  '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio',
];
/** Levels that also get sección B for denser demo coverage. */
const COURSE_LEVELS_WITH_B = new Set(['7° Básico', '8° Básico', '1° Medio']);

const DEMO_TEACHER_SEED = [
  { key: 'profesor1', fullName: 'Daniela Morales', aliases: ['profesor'] },
  { key: 'profesor2', fullName: 'Javiera Soto', aliases: ['profesora2'] },
  { key: 'profesor3', fullName: 'Matías Contreras', aliases: [] },
  { key: 'profesor4', fullName: 'Francisca Núñez', aliases: [] },
  { key: 'profesor5', fullName: 'Andrés Vargas', aliases: [] },
];

const DEMO_TEACHER_FIRST_NAMES = [
  'Camila', 'Felipe', 'Isidora', 'Joaquín', 'Catalina', 'Lucas', 'Martina', 'Nicolás',
  'Antonia', 'Sebastián', 'Valentina', 'Tomás', 'Florencia', 'Mateo', 'Josefa', 'Agustín',
  'Sofía', 'Vicente', 'Amanda', 'Maximiliano', 'Paula', 'Ignacio', 'Constanza', 'Cristóbal',
  'Fernanda', 'Gabriel', 'Trinidad', 'Renato', 'Josefina', 'Álvaro', 'Pilar', 'Esteban',
  'Macarena', 'Rodrigo', 'Beatriz', 'Héctor', 'Lorena', 'Patricio', 'Natalia', 'Mauricio',
  'Carolina', 'Enrique', 'Daniela', 'Javiera', 'Matías', 'Francisca', 'Andrés',
];
const DEMO_TEACHER_LAST_NAMES = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Silva', 'Martínez', 'Sepúlveda',
  'Rodríguez', 'López', 'Hernández', 'Castro', 'Fernández', 'Navarro', 'Reyes', 'Gutiérrez',
  'Espinoza', 'Vega', 'Fuentes', 'Carrasco', 'Sandoval', 'Pizarro', 'Araya', 'Tapia',
  'Bravo', 'Figueroa', 'Sáez', 'Miranda', 'Torres', 'Campos', 'Valenzuela', 'Henríquez',
];

function buildDemoTeachers(count = 50) {
  const list = [];
  const usedNames = new Set();
  for (const item of DEMO_TEACHER_SEED) {
    list.push({ ...item, aliases: [...(item.aliases || [])] });
    usedNames.add(String(item.fullName).toLocaleLowerCase('es'));
  }
  let cursor = 0;
  while (list.length < count) {
    const first = DEMO_TEACHER_FIRST_NAMES[cursor % DEMO_TEACHER_FIRST_NAMES.length];
    const last = DEMO_TEACHER_LAST_NAMES[Math.floor(cursor / DEMO_TEACHER_FIRST_NAMES.length) % DEMO_TEACHER_LAST_NAMES.length];
    const secondLast = DEMO_TEACHER_LAST_NAMES[(Math.floor(cursor / DEMO_TEACHER_FIRST_NAMES.length) + 7) % DEMO_TEACHER_LAST_NAMES.length];
    const fullName = `${first} ${last} ${secondLast}`;
    cursor += 1;
    const keyName = fullName.toLocaleLowerCase('es');
    if (usedNames.has(keyName)) continue;
    usedNames.add(keyName);
    const n = list.length + 1;
    list.push({
      key: `profesor${n}`,
      fullName,
      aliases: [],
    });
  }
  return list;
}

const DEMO_TEACHERS = buildDemoTeachers(50);
function demoTeacherUsername(definition, domain, key) {
  return definition.fixedDemo ? `${key}@hlquery.com` : `${key}@${domain}`;
}
function courseSectionList(level) {
  return COURSE_LEVELS_WITH_B.has(level) ? ['A', 'B'] : ['A'];
}
const ADMISSION_LEVELS = [
  'Prekínder', 'Kínder',
  '1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio', '3° Medio', '4° Medio',
];
const ADMISSION_DEMO = [
  { status: 'received', note: null },
  { status: 'received', note: null },
  { status: 'received', note: null },
  { status: 'interview', note: 'Entrevista agendada con UTP.' },
  { status: 'interview', note: null },
  { status: 'evaluated', note: 'Evaluación diagnóstica completada.' },
  { status: 'waiting', note: 'En lista de espera por cupo.' },
  { status: 'accepted', note: 'Aceptada. Pendiente de matrícula.' },
  { status: 'accepted', note: null },
  { status: 'rejected', note: 'Sin vacantes disponibles para el nivel solicitado.' },
];

const GRADE_ASSESSMENTS = [
  { assessment: 'Diagnóstico', day: '04', weight: 10 },
  { assessment: 'Control de unidad', day: '10', weight: 25 },
  { assessment: 'Trabajo práctico', day: '16', weight: 25 },
  { assessment: 'Evaluación parcial', day: '22', weight: 40 },
];

const ATTENDANCE_DAYS = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-09-01', '2026-09-02'];

/** Deterministic Chilean 1–7 scale: mostly 4.5–6.5, some fails and some 7.0. */
function demoGradeScore(studentIndex, gradeIndex, courseId, schoolId) {
  const bucket = (studentIndex * 17 + gradeIndex * 29 + Number(courseId) * 13 + Number(schoolId) * 7) % 100;
  const tenths = (studentIndex * 3 + gradeIndex * 11 + Number(courseId) * 5) % 10;
  if (bucket < 10) return Number((2.0 + ((bucket * 3 + tenths) % 20) / 10).toFixed(1)); // 2.0–3.9
  if (bucket < 22) return Number((4.0 + tenths / 10).toFixed(1)); // 4.0–4.9
  if (bucket < 55) return Number((5.0 + tenths / 10).toFixed(1)); // 5.0–5.9
  if (bucket < 88) return Number((6.0 + tenths / 10).toFixed(1)); // 6.0–6.9
  return 7.0;
}

const PLANNING_TEMPLATES = {
  Matemática: [
    {
      title: 'Unidad cero: diagnóstico de aprendizajes',
      unitType: 'diagnostic',
      objectives: ['Identificar conocimientos previos del nivel anterior', 'Detectar brechas en números y operaciones'],
      activities: ['Evaluación diagnóstica breve', 'Retroalimentación por grupos'],
      adaptations: 'Apoyo visual y tiempo adicional para estudiantes que lo requieran.',
      status: 'approved',
      startsOn: '2026-03-02',
      endsOn: '2026-03-13',
    },
    {
      title: 'Razones, proporciones y porcentajes',
      unitType: 'regular',
      objectives: ['Resolver problemas de proporcionalidad directa', 'Aplicar porcentajes en situaciones cotidianas'],
      activities: ['Trabajo colaborativo', 'Resolución de casos', 'Ticket de salida'],
      adaptations: 'Guía diferenciada y pares tutorados.',
      status: 'review',
      startsOn: '2026-08-03',
      endsOn: '2026-09-04',
    },
    {
      title: 'Álgebra y ecuaciones lineales',
      unitType: 'regular',
      objectives: ['Modelar situaciones con ecuaciones de primer grado', 'Verificar soluciones en contexto'],
      activities: ['Clase dialogada', 'Laboratorio de problemas', 'Autoevaluación'],
      status: 'draft',
      startsOn: '2026-09-07',
      endsOn: '2026-10-09',
    },
  ],
  Lenguaje: [
    {
      title: 'Diagnóstico lector y escritura',
      unitType: 'diagnostic',
      objectives: ['Evaluar comprensión lectora literal e inferencial', 'Diagnosticar coherencia en textos breves'],
      activities: ['Prueba corta', 'Producción de párrafo'],
      status: 'approved',
      startsOn: '2026-03-02',
      endsOn: '2026-03-13',
    },
    {
      title: 'Narrativa y estructura del cuento',
      unitType: 'regular',
      objectives: ['Identificar elementos narrativos', 'Escribir un cuento breve con estructura clara'],
      activities: ['Lectura guiada', 'Taller de escritura', 'Rúbrica entre pares'],
      adaptations: 'Plantillas de planificación narrativa para PIE.',
      status: 'approved',
      startsOn: '2026-07-20',
      endsOn: '2026-08-28',
    },
    {
      title: 'Argumentación y debate oral',
      unitType: 'regular',
      objectives: ['Construir argumentos con evidencia', 'Participar en debate respetando turnos'],
      activities: ['Análisis de textos', 'Debate en círculos', 'Reflexión escrita'],
      status: 'review',
      startsOn: '2026-09-01',
      endsOn: '2026-10-02',
    },
  ],
  Ciencias: [
    {
      title: 'Diagnóstico de habilidades científicas',
      unitType: 'diagnostic',
      objectives: ['Reconocer variables en un experimento simple', 'Interpretar gráficos básicos'],
      activities: ['Cuestionario', 'Mini laboratorio'],
      status: 'approved',
      startsOn: '2026-03-02',
      endsOn: '2026-03-13',
    },
    {
      title: 'Sistemas del cuerpo humano',
      unitType: 'regular',
      objectives: ['Explicar la relación entre sistemas', 'Cuidar hábitos de salud con evidencia'],
      activities: ['Modelo 3D', 'Investigación en grupos', 'Póster científico'],
      status: 'approved',
      startsOn: '2026-08-03',
      endsOn: '2026-09-11',
    },
    {
      title: 'Energía y cambio climático',
      unitType: 'regular',
      objectives: ['Distinguir fuentes de energía', 'Proponer acciones locales de mitigación'],
      activities: ['Salida pedagógica virtual', 'Informe breve'],
      status: 'draft',
      startsOn: '2026-09-14',
      endsOn: '2026-10-16',
    },
  ],
  Historia: [
    {
      title: 'Diagnóstico de pensamiento histórico',
      unitType: 'diagnostic',
      objectives: ['Ubicar eventos en línea de tiempo', 'Distinguir fuente primaria y secundaria'],
      activities: ['Línea de tiempo', 'Análisis de imagen'],
      status: 'approved',
      startsOn: '2026-03-02',
      endsOn: '2026-03-13',
    },
    {
      title: 'Chile republicano y ciudadanía',
      unitType: 'regular',
      objectives: ['Explicar hitos republicanos', 'Relacionar derechos y deberes ciudadanos'],
      activities: ['Fuente histórica', 'Debate guiado', 'Ensayo corto'],
      adaptations: 'Vocabulario apoyado y mapas conceptuales.',
      status: 'review',
      startsOn: '2026-08-10',
      endsOn: '2026-09-18',
    },
    {
      title: 'Geografía humana de Chile',
      unitType: 'regular',
      objectives: ['Analizar distribución poblacional', 'Interpretar indicadores demográficos'],
      activities: ['Cartografía', 'Caso regional'],
      status: 'draft',
      startsOn: '2026-09-21',
      endsOn: '2026-10-23',
    },
  ],
};

const CLASS_SESSION_TOPICS = {
  Matemática: [
    'Fracciones equivalentes y comparación',
    'Proporcionalidad directa con tablas',
    'Porcentajes en descuentos y propinas',
    'Resolución de problemas mixtos',
  ],
  Lenguaje: [
    'Elementos del relato: narrador y conflicto',
    'Taller de escritura creativa',
    'Comprensión inferencial de cuento',
    'Preparación de argumentos para el debate',
  ],
  Ciencias: [
    'Sistema digestivo y hábitos alimentarios',
    'Circulación y actividad física',
    'Diseño de experimento controlado',
    'Análisis de datos del laboratorio',
  ],
  Historia: [
    'Independencia y primeros gobiernos',
    'Constitución y derechos ciudadanos',
    'Lectura de fuente primaria',
    'Mapa demográfico de Chile',
  ],
};

const EXTRA_SCHEDULE = [
  { day: 2, startsAt: '14:00:00', endsAt: '15:20:00' },
  { day: 3, startsAt: '14:00:00', endsAt: '15:20:00' },
  { day: 4, startsAt: '14:00:00', endsAt: '15:20:00' },
  { day: 5, startsAt: '14:00:00', endsAt: '15:20:00' },
  { day: 1, startsAt: '14:00:00', endsAt: '15:20:00' },
  { day: 2, startsAt: '11:45:00', endsAt: '13:05:00' },
  { day: 3, startsAt: '11:45:00', endsAt: '13:05:00' },
  { day: 4, startsAt: '11:45:00', endsAt: '13:05:00' },
  { day: 5, startsAt: '11:45:00', endsAt: '13:05:00' },
  { day: 1, startsAt: '11:45:00', endsAt: '13:05:00' },
];

async function writeDemoMaterialFile(schoolId, filename, contents) {
  const storageKey = tenantUploadKey(schoolId, filename);
  const fullPath = safeUploadPath(storageKey);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, contents, 'utf8');
  return { storageKey, size: Buffer.byteLength(contents, 'utf8') };
}

const FORUM_TOPIC_TEMPLATES = [
  {
    title: (subject, courseName) => `Dudas de la unidad — ${subject}`,
    description: (subject, courseName) => `Publiquen aquí sus dudas de ${subject} en ${courseName}. Revisamos respuestas entre clases.`,
    pinned: true,
    closed: false,
    teacherPost: (subject) => `Bienvenidos. Antes de preguntar, revisen la guía de ${subject} y indiquen el ejercicio exacto.`,
    studentPosts: [
      'Profesor/a, ¿el ejercicio 3 se entrega en hoja o por el aula?',
      '¿Podemos trabajar en duplas para la actividad de esta semana?',
      'No me quedó clara la diferencia entre los ejemplos 1 y 2.',
    ],
  },
  {
    title: (subject) => `Recursos y tips — ${subject}`,
    description: (subject) => `Compartan videos, artículos o trucos útiles de ${subject}. Mantengan el tono respetuoso.`,
    pinned: false,
    closed: false,
    teacherPost: (subject) => `Dejen un recurso breve y digan por qué les sirvió para ${subject}.`,
    studentPosts: [
      'Encontré un resumen en YouTube que explica el tema en 8 minutos.',
      'Les dejo mi mapa mental de la clase anterior.',
      '¿Alguien tiene ejemplos resueltos del ensayo corto?',
    ],
  },
  {
    title: (subject, courseName) => `Preparación de evaluación — ${subject}`,
    description: (subject, courseName) => `Espacio para repasar contenidos de ${subject} (${courseName}) antes de la prueba.`,
    pinned: false,
    closed: false,
    teacherPost: (subject) => `La evaluación de ${subject} considera comprensión y justificación. Practiquen con la guía.`,
    studentPosts: [
      '¿Entran las páginas 24 a 31?',
      'Repasé con flashcards y me ayudó harto.',
      '¿Habrá puntaje por procedimiento o solo resultado final?',
    ],
  },
  {
    title: (subject) => `Avisos de la asignatura`,
    description: (subject) => `Comunicados rápidos del docente de ${subject}. Preferir este hilo para avisos cortos.`,
    pinned: true,
    closed: false,
    teacherPost: (subject) => `Recuerden traer el cuaderno de ${subject} y la guía impresa el lunes.`,
    studentPosts: [
      'Confirmado, gracias por el aviso.',
      '¿El material también estará subido en Archivos?',
    ],
  },
  {
    title: (subject) => `Foro cerrado — unidad anterior de ${subject}`,
    description: (subject) => `Conversación archivada de la unidad anterior de ${subject}. Solo lectura.`,
    pinned: false,
    closed: true,
    teacherPost: (subject) => `Cerramos este hilo de ${subject}. Las nuevas dudas van en el foro de la unidad actual.`,
    studentPosts: [
      'Gracias por las respuestas de la unidad pasada.',
      'Quedó claro el cierre de la unidad.',
    ],
  },
  {
    title: (subject) => `Proyecto colaborativo — ${subject}`,
    description: (subject) => `Organicen roles, avances y dudas del proyecto de ${subject}.`,
    pinned: false,
    closed: false,
    teacherPost: (subject) => `Publiquen avances semanales del proyecto de ${subject}. Incluyan qué falta y quién lidera cada parte.`,
    studentPosts: [
      'Nuestro grupo ya armó el esquema inicial.',
      'Necesitamos feedback del título del proyecto.',
      '¿Podemos cambiar de tema si encontramos mejor evidencia?',
      'Subimos el borrador al drive del curso.',
    ],
  },
];

async function seedCourseForums({
  Forum,
  ForumPost,
  schoolId,
  course,
  ownerId,
  ownerName,
  students,
  transaction,
}) {
  const templates = FORUM_TOPIC_TEMPLATES.map((template, index) => ({
    ...template,
    // Variar un poco por asignatura para que no se vean idénticos todos los cursos.
    skip: index === 5 && !['Matemática', 'Lenguaje', 'Ciencias'].includes(course.subject),
  })).filter((template) => !template.skip);

  for (const [index, template] of templates.entries()) {
    const title = template.title(course.subject, course.name);
    const description = template.description(course.subject, course.name);
    const [forum] = await Forum.findOrCreate({
      where: { schoolId, courseId: course.id, title },
      defaults: {
        description,
        closed: template.closed,
        pinned: template.pinned,
        createdBy: ownerId,
      },
      transaction,
    });
    await forum.update({
      description,
      closed: template.closed,
      pinned: template.pinned || (index === 0 && course.subject === 'Matemática'),
    }, { transaction });

    await ForumPost.findOrCreate({
      where: {
        schoolId,
        forumId: forum.id,
        createdBy: ownerId,
        text: template.teacherPost(course.subject, course.name),
      },
      defaults: { authorName: ownerName },
      transaction,
    });

    const replyPool = template.studentPosts || [];
    const replyStudents = students.filter((student) => student.userId).slice(0, Math.min(replyPool.length, 4));
    for (const [replyIndex, student] of replyStudents.entries()) {
      const text = replyPool[replyIndex % replyPool.length]
        .replaceAll('{subject}', course.subject)
        .replaceAll('{name}', student.firstName);
      await ForumPost.findOrCreate({
        where: {
          schoolId,
          forumId: forum.id,
          createdBy: student.userId,
          text,
        },
        defaults: { authorName: `${student.firstName} ${student.lastName}` },
        transaction,
      });
    }

    // Un par de respuestas extra “random” para que el hilo se vea vivo.
    if (!template.closed && replyStudents.length) {
      const extraStudent = replyStudents[replyIndexSafe(replyStudents.length, course.id + index)];
      const extras = [
        `Yo también tengo la misma duda de ${course.subject}.`,
        'Gracias, con eso me quedó más claro.',
        `¿Alguien puede compartir su resumen de la clase de ${course.subject}?`,
        'Puedo ayudar mañana en el recreo si quieren repasar.',
      ];
      const extraText = extras[(course.id + index) % extras.length];
      await ForumPost.findOrCreate({
        where: {
          schoolId,
          forumId: forum.id,
          createdBy: extraStudent.userId,
          text: extraText,
        },
        defaults: { authorName: `${extraStudent.firstName} ${extraStudent.lastName}` },
        transaction,
      });
    }
  }
}

function replyIndexSafe(length, seed) {
  return Math.abs(Number(seed) || 0) % Math.max(length, 1);
}

const SCHOOL_DEFINITIONS = [
  {
    slug: 'colegio-del-sur',
    name: process.env.SCHOOL_NAME || 'IDCE Unknown High School',
    seed: 20260830,
    studentCount: 36,
    staffCount: 8,
    fixedDemo: true,
  },
  {
    slug: 'colegio-andino',
    name: 'Colegio Andino del Valle',
    seed: 20260831,
    studentCount: 28,
    staffCount: 8,
  },
  {
    slug: 'liceo-pacifico',
    name: 'Liceo Pacífico Sur',
    seed: 20260832,
    studentCount: 30,
    staffCount: 8,
  },
  {
    slug: 'escuela-mapocho',
    name: 'Escuela Mapocho',
    seed: 20260833,
    studentCount: 24,
    staffCount: 7,
  },
  {
    slug: 'instituto-araucaria',
    name: 'Instituto Araucaria',
    seed: 20260834,
    studentCount: 28,
    staffCount: 8,
  },
];

function emailPart(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}

const FIXED_FIRST_NAMES = [
  'Ana', 'Benjamín', 'Camila', 'Diego', 'Emilia', 'Felipe', 'Isidora', 'Joaquín',
  'Catalina', 'Lucas', 'Martina', 'Nicolás', 'Antonia', 'Sebastián', 'Valentina',
  'Tomás', 'Florencia', 'Mateo', 'Josefa', 'Agustín', 'Sofía', 'Vicente', 'Amanda', 'Maximiliano',
];
const FIXED_LAST_NAMES = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
  'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Hernández', 'Vargas',
  'Castro', 'Fernández', 'Navarro', 'Reyes', 'Gutiérrez',
];

function fixedPerson(seed, index = 0) {
  const first = FIXED_FIRST_NAMES[Math.abs(seed + index * 3) % FIXED_FIRST_NAMES.length];
  const last = FIXED_LAST_NAMES[Math.abs(seed + index * 7 + 11) % FIXED_LAST_NAMES.length];
  return { firstName: first, lastName: last, fullName: `${first} ${last}` };
}

function fixedFullName(seed, index = 0) {
  return fixedPerson(seed, index).fullName;
}
function demoRut(number) {
  const digits = String(number);
  const reversed = [...digits].reverse();
  let sum = 0;
  let multiplier = 2;
  for (const digit of reversed) {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - sum % 11;
  return `${digits}-${result === 11 ? '0' : result === 10 ? 'K' : result}`;
}
function domainFor(slug) {
  return `${slug}.demo.hlquery.com`;
}

async function ensureJobTitles(schoolId, transaction) {
  for (const entry of DEFAULT_JOB_TITLES) {
    const [row] = await JobTitle.findOrCreate({
      where: { schoolId, name: entry.name },
      defaults: { active: true, hierarchy: entry.hierarchy },
      transaction,
    });
    if (row.hierarchy == null && entry.hierarchy != null) {
      await row.update({ hierarchy: entry.hierarchy }, { transaction });
    }
  }
}

async function seedSchool(definition, staleAvatarKeys) {
  faker.seed(definition.seed);
  const domain = domainFor(definition.slug);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const passwordHashes = {
    admin: passwordHash,
    profesor: passwordHash,
    manager: passwordHash,
    finanzas: passwordHash,
    estudiante: passwordHash,
    apoderado: passwordHash,
  };

  return sequelize.transaction(async (transaction) => {
    const [school] = await School.findOrCreate({
      where: { slug: definition.slug },
      defaults: {
        name: definition.name,
        address: faker.location.streetAddress(),
        phone: `+5622${String(2000000 + (definition.seed % 700000)).slice(0, 7)}`,
        email: `contacto@${domain}`,
        website: `https://${domain}`,
        schoolType: ['subvencionado', 'particular', 'publico'][definition.seed % 3],
        companyName: definition.name,
        companyRut: demoRut(76000000 + (definition.seed % 900000)),
        originBank: 'Banco Estado',
        originAccountType: 'corriente',
      },
      transaction,
    });
    const schoolId = school.id;
    await school.update({
      name: definition.name,
      rbd: school.rbd || `${90000 + (schoolId * 17) % 9000}-${schoolId % 9}`,
      address: school.address || faker.location.streetAddress(),
      phone: school.phone || `+5622${String(2000000 + schoolId).slice(0, 7)}`,
      email: school.email || `contacto@${domain}`,
      website: school.website || `https://${domain}`,
      companyName: school.companyName || definition.name,
      companyRut: school.companyRut || demoRut(76000000 + schoolId * 137),
      originBank: school.originBank || 'Banco Estado',
      originAccountType: school.originAccountType || 'corriente',
    }, { transaction });
    await ensureJobTitles(schoolId, transaction);

    const [campus] = await Campus.findOrCreate({
      where: { schoolId, name: 'Sede Central' },
      defaults: { address: school.address || 'Santiago, Chile' },
      transaction,
    });
    const academicYears = new Map();
    for (const yearDef of [
      { name: '2024', startsOn: '2024-03-04', endsOn: '2024-12-20', active: false },
      { name: '2025', startsOn: '2025-03-03', endsOn: '2025-12-19', active: false },
      { name: '2026', startsOn: '2026-03-02', endsOn: '2026-12-18', active: true },
    ]) {
      const [academicYear] = await AcademicYear.findOrCreate({
        where: { schoolId, name: yearDef.name },
        defaults: yearDef,
        transaction,
      });
      await academicYear.update(yearDef, { transaction });
      academicYears.set(yearDef.name, academicYear);
    }
    const year = academicYears.get('2026');

    const directorUsername = definition.fixedDemo ? 'admin@hlquery.com' : `director@${domain}`;
    if (RESERVED_SEED_EMAILS.has(directorUsername.toLowerCase())) {
      throw new Error(`El director Faker no puede usar el correo reservado ${directorUsername}`);
    }
    const [director] = await User.findOrCreate({
      where: { schoolId, username: directorUsername },
      defaults: {
        schoolId,
        passwordHash: passwordHashes.admin,
        fullName: definition.fixedDemo ? 'Administrador DashCole' : `Dirección ${definition.name}`,
        role: 'director',
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        active: true,
      },
      transaction,
    });
    await director.update({
      fullName: definition.fixedDemo ? 'Administrador DashCole' : `Dirección ${definition.name}`,
      role: 'director',
      passwordHash: passwordHashes.admin,
      canManageUsers: true,
      canManageGrades: true,
      canViewReports: true,
      canManageSchool: true,
      canManageHr: true,
      canManageFinance: true,
      active: true,
    }, { transaction });

    const teacherAccounts = [];
    for (const [index, item] of DEMO_TEACHERS.entries()) {
      const usernames = [
        demoTeacherUsername(definition, domain, item.key),
        ...item.aliases.map((alias) => demoTeacherUsername(definition, domain, alias)),
      ].filter((username, pos, list) => list.indexOf(username) === pos);
      let primary = null;
      for (const username of usernames) {
        if (RESERVED_SEED_EMAILS.has(username.toLowerCase())) continue;
        const [user] = await User.findOrCreate({
          where: { schoolId, username },
          defaults: {
            schoolId,
            passwordHash: passwordHashes.profesor,
            fullName: item.fullName,
            role: 'teacher',
            canManageGrades: true,
            active: true,
          },
          transaction,
        });
        await user.update({
          fullName: item.fullName,
          role: 'teacher',
          passwordHash: passwordHashes.profesor,
          canManageGrades: true,
          active: true,
        }, { transaction });
        await Employee.findOrCreate({
          where: { schoolId, userId: user.id },
          defaults: {
            campusId: campus.id,
            fullName: item.fullName,
            position: index === 0 ? 'Profesor/a jefe' : 'Profesor/a',
            contractType: 'Indefinido',
            hiredOn: '2024-03-01',
            monthlySalary: 1180000 + index * 25000,
            createdBy: director.id,
            bank: ['Banco Estado', 'Banco de Chile', 'BCI', 'Banco Santander', 'Scotiabank'][index % 5],
            accountType: ['corriente', 'vista', 'ahorro'][index % 3],
            holderRut: demoRut(12000000 + schoolId * 100 + index * 17),
            email: username,
            paymentMethod: 'transferencia',
          },
          transaction,
        });
        if (!primary) primary = user;
        teacherAccounts.push({ user, username, fullName: item.fullName, key: item.key });
      }
      if (!primary) {
        throw new Error(`No se pudo crear el profesor demo ${item.key}`);
      }
    }
    const teachers = DEMO_TEACHERS.map((item) => {
      const match = teacherAccounts.find((row) => row.key === item.key);
      return match?.user;
    }).filter(Boolean);
    const teacher = teachers[0];
    const secondTeacher = teachers[1] || teacher;
    const teacherUsername = demoTeacherUsername(definition, domain, 'profesor1');

    const staffDefinitions = [
      {
        username: definition.fixedDemo ? 'manager@hlquery.com' : `manager@${domain}`,
        password: DEFAULT_PASSWORD,
        fullName: 'Sebastián Rojas',
        role: 'manager',
        position: 'Coordinador académico',
        salary: 1450000,
        permissions: { canManageUsers: true, canManageSchool: true, canViewReports: true },
      },
      {
        username: definition.fixedDemo ? 'jefeutp@hlquery.com' : `jefeutp@${domain}`,
        password: DEFAULT_PASSWORD,
        fullName: 'Patricia Espinoza',
        role: 'utp',
        position: 'Jefe/a de UTP',
        salary: 1520000,
        permissions: {
          canManageUsers: true,
          canManageGrades: true,
          canViewReports: true,
          canManageSchool: false,
          canManageHr: true,
          canManageFinance: true,
          canApproveLeave: true,
          canViewSige: true,
          canConfigureSige: true,
          canSyncSige: true,
          canViewSigeLogs: true,
        },
      },
      {
        username: definition.fixedDemo ? 'finanzas@hlquery.com' : `finanzas@${domain}`,
        password: DEFAULT_PASSWORD,
        fullName: 'Carolina Pérez',
        role: 'agente_finanzas',
        position: 'Contador/a',
        salary: 1380000,
        permissions: { canManageHr: true, canManageFinance: true },
      },
    ].filter((item) => !RESERVED_SEED_EMAILS.has(String(item.username).toLowerCase()));

    const staffUsers = [];
    for (const item of staffDefinitions) {
      if (RESERVED_SEED_EMAILS.has(String(item.username).toLowerCase())) continue;
      const [user] = await User.findOrCreate({
        where: { schoolId, username: item.username },
        defaults: {
          schoolId,
          username: item.username,
          passwordHash: await bcrypt.hash(item.password, 12),
          fullName: item.fullName,
          role: item.role,
          active: true,
          ...item.permissions,
        },
        transaction,
      });
      await user.update({
        fullName: item.fullName,
        role: item.role,
        active: true,
        passwordHash: await bcrypt.hash(item.password || DEFAULT_PASSWORD, 12),
        ...item.permissions,
      }, { transaction });
      await Employee.findOrCreate({
        where: { schoolId, userId: user.id },
        defaults: {
          campusId: campus.id,
          fullName: item.fullName,
          position: item.position,
          contractType: 'Indefinido',
          hiredOn: '2024-03-01',
          monthlySalary: item.salary,
          createdBy: director.id,
          bank: ['Banco de Chile', 'BCI', 'Banco Santander', 'Scotiabank'][user.id % 4],
          accountType: ['corriente', 'vista', 'ahorro'][user.id % 3],
          holderRut: demoRut(13000000 + schoolId * 1000 + user.id),
          email: item.username,
          paymentMethod: 'transferencia',
        },
        transaction,
      });
      staffUsers.push(user);
    }

    const courses = [];
    let courseOrdinal = 0;
    for (const courseName of COURSE_LEVELS) {
      for (const section of courseSectionList(courseName)) {
        const headTeacher = teachers[courseOrdinal % teachers.length] || teacher;
        for (const [subjectIndex, [name, code, color]] of SUBJECT_DEFINITIONS.entries()) {
          const [subject] = await Subject.findOrCreate({
            where: { schoolId, code },
            defaults: { name, createdBy: director.id },
            transaction,
          });
          const primaryTeacher = teachers[subjectIndex % teachers.length] || teacher;
          const partnerTeacher = teachers[(subjectIndex + 2) % teachers.length] || secondTeacher;
          const teacherValue = subjectIndex % 5 === 0 && partnerTeacher.id !== primaryTeacher.id
            ? `${primaryTeacher.fullName}, ${partnerTeacher.fullName}`
            : primaryTeacher.fullName;
          const [course] = await Course.findOrCreate({
            where: { schoolId, name: courseName, section, subject: name, academicYearId: year.id },
            defaults: {
              campusId: campus.id,
              academicYearId: year.id,
              subjectId: subject.id,
              teacher: teacherValue,
              headTeacher: headTeacher.fullName,
              color,
              monthlyFee: 85000 + schoolId * 1000,
              createdBy: director.id,
            },
            transaction,
          });
          await course.update({
            subjectId: subject.id,
            teacher: teacherValue,
            headTeacher: headTeacher.fullName,
            color,
            monthlyFee: course.monthlyFee || 85000 + schoolId * 1000,
          }, { transaction });
          courses.push(course);
        }
        courseOrdinal += 1;
      }
    }
    for (const [index, course] of courses.entries()) {
      const day = index % 5 + 1;
      const block = Math.floor(index / 5) % 4;
      const startsAt = `${String(8 + block).padStart(2, '0')}:00:00`;
      const endsAt = `${String(9 + block).padStart(2, '0')}:30:00`;
      await CourseSchedule.findOrCreate({
        where: { schoolId, courseId: course.id, day, startsAt },
        defaults: { endsAt, room: `Sala ${day + 10}`, createdBy: director.id },
        transaction,
      });
      if (EXTRA_SCHEDULE[index % EXTRA_SCHEDULE.length]) {
        const extra = EXTRA_SCHEDULE[index % EXTRA_SCHEDULE.length];
        await CourseSchedule.findOrCreate({
          where: { schoolId, courseId: course.id, day: extra.day, startsAt: extra.startsAt },
          defaults: { endsAt: extra.endsAt, room: `Sala ${extra.day + 20}`, createdBy: director.id },
          transaction,
        });
      }
    }

    const studentRows = Array.from({ length: definition.studentCount }, (_, index) => {
      const person = fixedPerson(definition.seed, index);
      return [person.firstName, person.lastName, avatarColors[index % avatarColors.length]];
    });
    const seededStudents = [];
    const studentMailDomain = definition.fixedDemo ? 'hlquery.com' : domain;
    for (const [index, [firstName, lastName, avatarColor]] of studentRows.entries()) {
      let email = definition.fixedDemo && index === 0
        ? 'estudiante@hlquery.com'
        : `estudiante.${String(index + 1).padStart(2, '0')}@${studentMailDomain}`;
      if (RESERVED_SEED_EMAILS.has(email.toLowerCase())) {
        email = `estudiante.${String(index + 1).padStart(2, '0')}.${definition.slug}@${studentMailDomain}`;
      }
      if (RESERVED_SEED_EMAILS.has(email.toLowerCase())) continue;
      const [studentUser] = await User.findOrCreate({
        where: { schoolId, username: email },
        defaults: {
          schoolId,
          username: email,
          passwordHash: passwordHashes.estudiante,
          fullName: `${firstName} ${lastName}`,
          role: 'student',
          active: true,
          createdBy: director.id,
        },
        transaction,
      });
      await studentUser.update({
        fullName: `${firstName} ${lastName}`,
        role: 'student',
        passwordHash: passwordHashes.estudiante,
        active: true,
      }, { transaction });
      const [student] = await Student.findOrCreate({
        where: { schoolId, email },
        defaults: {
          userId: studentUser.id,
          firstName,
          lastName,
          nationalId: demoRut(21000000 + schoolId * 10000 + index * 137),
          identifierType: 'rut',
          avatarColor,
          avatarKey: null,
          createdBy: director.id,
        },
        transaction,
      });
      if (student.avatarKey) staleAvatarKeys.push(student.avatarKey);
      await student.update({
        userId: studentUser.id,
        firstName,
        lastName,
        nationalId: student.nationalId || demoRut(21000000 + schoolId * 10000 + index * 137),
        identifierType: 'rut',
        avatarColor,
        avatarKey: null,
        active: true,
      }, { transaction });
      seededStudents.push(student);
      const level = COURSE_LEVELS[index % COURSE_LEVELS.length];
      const sectionOptions = courseSectionList(level);
      const section = sectionOptions[index % sectionOptions.length];
      for (const course of courses.filter((item) => item.name === level && item.section === section)) {
        await Enrollment.findOrCreate({
          where: { studentId: student.id, courseId: course.id },
          defaults: { schoolId },
          transaction,
        });
        const subjectIdx = SUBJECT_DEFINITIONS.findIndex(([subjectName]) => subjectName === course.subject);
        const graderId = teachers[Math.max(0, subjectIdx) % teachers.length]?.id || teacher.id;
        for (const [gradeIndex, gradeDef] of GRADE_ASSESSMENTS.entries()) {
          const gradedAt = `2026-08-${gradeDef.day}`;
          const score = demoGradeScore(index, gradeIndex, course.id, schoolId);
          const feedback = gradeIndex === 3
            ? 'Buen avance durante la unidad.'
            : (gradeIndex === 0 ? 'Punto de partida para reforzar.' : null);
          const [grade] = await Grade.findOrCreate({
            where: { studentId: student.id, courseId: course.id, assessment: gradeDef.assessment, gradedAt },
            defaults: {
              schoolId,
              score,
              maxScore: 7,
              weight: gradeDef.weight,
              feedback,
              createdBy: graderId,
            },
            transaction,
          });
          await grade.update({
            score,
            maxScore: 7,
            weight: gradeDef.weight,
            feedback,
            createdBy: graderId,
          }, { transaction });
        }
        for (const [dayIndex, attendedOn] of ATTENDANCE_DAYS.entries()) {
          const roll = (index + dayIndex + course.id) % 11;
          const status = roll === 0 ? 'absent' : roll === 1 ? 'late' : 'present';
          await Attendance.findOrCreate({
            where: { studentId: student.id, courseId: course.id, attendedOn },
            defaults: { schoolId, status, createdBy: graderId },
            transaction,
          });
        }
      }
    }

    const guardianUsername = definition.fixedDemo ? 'apoderado@hlquery.com' : `apoderado@${domain}`;
    const guardianName = 'María Muñoz';
    const [guardianUser] = await User.findOrCreate({
      where: { schoolId, username: guardianUsername },
      defaults: {
        schoolId,
        username: guardianUsername,
        passwordHash: passwordHashes.apoderado,
        fullName: guardianName,
        role: 'guardian',
        phone: `+5695555${String(100 + schoolId).padStart(4, '0')}`,
        active: true,
        createdBy: director.id,
      },
      transaction,
    });
    await guardianUser.update({
      fullName: guardianName,
      role: 'guardian',
      passwordHash: passwordHashes.apoderado,
      phone: `+5695555${String(100 + schoolId).padStart(4, '0')}`,
      active: true,
    }, { transaction });
    const [guardian] = await Guardian.findOrCreate({
      where: { schoolId, email: guardianUsername },
      defaults: {
        userId: guardianUser.id,
        fullName: guardianName,
        phone: guardianUser.phone,
        createdBy: director.id,
      },
      transaction,
    });
    await guardian.update({ userId: guardianUser.id, fullName: guardianName, phone: guardianUser.phone }, { transaction });
    for (const student of seededStudents.slice(0, Math.min(8, seededStudents.length))) {
      await StudentGuardian.findOrCreate({
        where: { studentId: student.id, guardianId: guardian.id },
        defaults: { relationship: 'Madre' },
        transaction,
      });
    }

    const secondGuardianUsername = definition.fixedDemo ? 'padre.demo@hlquery.com' : `padre@${domain}`;
    if (!RESERVED_SEED_EMAILS.has(secondGuardianUsername.toLowerCase())) {
      const secondGuardianName = 'Carlos Muñoz';
      const [secondGuardianUser] = await User.findOrCreate({
        where: { schoolId, username: secondGuardianUsername },
        defaults: {
          schoolId,
          username: secondGuardianUsername,
          passwordHash: passwordHashes.apoderado,
          fullName: secondGuardianName,
          role: 'guardian',
          phone: `+5695556${String(100 + schoolId).padStart(4, '0')}`,
          active: true,
          createdBy: director.id,
        },
        transaction,
      });
      await secondGuardianUser.update({
        fullName: secondGuardianName,
        role: 'guardian',
        passwordHash: passwordHashes.apoderado,
        active: true,
      }, { transaction });
      const [secondGuardian] = await Guardian.findOrCreate({
        where: { schoolId, email: secondGuardianUsername },
        defaults: {
          userId: secondGuardianUser.id,
          fullName: secondGuardianName,
          phone: secondGuardianUser.phone,
          createdBy: director.id,
        },
        transaction,
      });
      await secondGuardian.update({ userId: secondGuardianUser.id, fullName: secondGuardianName, phone: secondGuardianUser.phone }, { transaction });
      for (const student of seededStudents.slice(0, Math.min(4, seededStudents.length))) {
        await StudentGuardian.findOrCreate({
          where: { studentId: student.id, guardianId: secondGuardian.id },
          defaults: { relationship: 'Padre' },
          transaction,
        });
      }
    }

    const showcaseCourses = courses.filter((course) => (
      ['7° Básico', '8° Básico', '1° Medio'].includes(course.name) && course.section === 'A'
    ));
    const sessionDates = ['2026-08-17', '2026-08-19', '2026-08-21', '2026-08-24', '2026-08-26', '2026-08-28', '2026-09-01', '2026-09-03'];
    for (const course of showcaseCourses) {
      await course.update({
        allowStudentsCreateForum: false,
        allowStudentsReplyForum: true,
      }, { transaction });
      const topics = CLASS_SESSION_TOPICS[course.subject] || CLASS_SESSION_TOPICS.Matemática;
      const subjectIdx = SUBJECT_DEFINITIONS.findIndex(([subjectName]) => subjectName === course.subject);
      const ownerId = teachers[Math.max(0, subjectIdx) % teachers.length]?.id || teacher.id;
      for (const [topicIndex, heldOn] of sessionDates.entries()) {
        if (topicIndex >= topics.length + 2) break;
        const content = topics[topicIndex % topics.length];
        await ClassSession.findOrCreate({
          where: { schoolId, courseId: course.id, heldOn },
          defaults: {
            content,
            observations: topicIndex % 3 === 0 ? 'Clase realizada con buena participación.' : 'Clase realizada con normalidad.',
            closedAt: topicIndex === sessionDates.length - 1 ? null : new Date(`${heldOn}T16:30:00-03:00`),
            createdBy: ownerId,
          },
          transaction,
        });
      }

      const templates = PLANNING_TEMPLATES[course.subject] || PLANNING_TEMPLATES.Matemática;
      for (const unit of templates) {
        const [planningUnit] = await PlanningUnit.findOrCreate({
          where: { schoolId, courseId: course.id, title: unit.title },
          defaults: {
            unitType: unit.unitType,
            objectives: unit.objectives,
            activities: unit.activities,
            adaptations: unit.adaptations || null,
            status: unit.status,
            startsOn: unit.startsOn,
            endsOn: unit.endsOn,
            createdBy: ownerId,
          },
          transaction,
        });
        if (unit.status === 'review' && staffUsers[0]) {
          await PlanningComment.findOrCreate({
            where: { schoolId, unitId: planningUnit.id, body: `Revisión UTP: completar evidencias de evaluación en ${course.subject} ${course.name}.` },
            defaults: { createdBy: staffUsers[0].id },
            transaction,
          });
        }
        if (unit.status === 'approved' && director.id) {
          await PlanningComment.findOrCreate({
            where: { schoolId, unitId: planningUnit.id, body: 'Planificación aprobada para implementación.' },
            defaults: { createdBy: director.id },
            transaction,
          });
        }
      }

      const assignmentTitle = `Tarea de ${course.subject.toLowerCase()} — ${course.name}`;
      const [assignment] = await Assignment.findOrCreate({
        where: { schoolId, courseId: course.id, title: assignmentTitle },
        defaults: {
          instructions: `Desarrolla la actividad de ${course.subject} con evidencia clara y sube tu respuesta antes de la fecha límite.`,
          dueAt: new Date('2026-09-25T23:59:00-03:00'),
          createdBy: ownerId,
        },
        transaction,
      });
      const courseStudents = seededStudents.filter((_, index) => {
        const level = COURSE_LEVELS[index % COURSE_LEVELS.length];
        const sectionOptions = courseSectionList(level);
        const section = sectionOptions[index % sectionOptions.length];
        return level === course.name && section === course.section;
      });
      for (const [studentIndex, student] of courseStudents.slice(0, 4).entries()) {
        await Submission.findOrCreate({
          where: { assignmentId: assignment.id, studentId: student.id },
          defaults: {
            schoolId,
            text: `Entrega demo de ${student.firstName}: resolví la guía de ${course.subject} y adjunto mis conclusiones.`,
            feedback: studentIndex === 0 ? 'Muy buen trabajo. Refuerza la justificación final.' : null,
            createdBy: student.userId || ownerId,
          },
          transaction,
        });
      }

      const secondAssignmentTitle = `Mini proyecto ${course.subject} — ${course.name}`;
      const [secondAssignment] = await Assignment.findOrCreate({
        where: { schoolId, courseId: course.id, title: secondAssignmentTitle },
        defaults: {
          instructions: `Prepara un mini proyecto colaborativo de ${course.subject}. Incluye objetivo, evidencia y conclusión.`,
          dueAt: new Date('2026-10-10T23:59:00-03:00'),
          createdBy: ownerId,
        },
        transaction,
      });
      for (const student of courseStudents.slice(0, 2)) {
        await Submission.findOrCreate({
          where: { assignmentId: secondAssignment.id, studentId: student.id },
          defaults: {
            schoolId,
            text: `${student.firstName}: avance del mini proyecto de ${course.subject}.`,
            createdBy: student.userId || ownerId,
          },
          transaction,
        });
      }

      await seedCourseForums({
        Forum,
        ForumPost,
        schoolId,
        course,
        ownerId,
        ownerName: teachers.find((row) => row.id === ownerId)?.fullName || teacher.fullName,
        students: courseStudents,
        transaction,
      });

      const materialName = `guia-${String(course.subjectId || course.id)}-${String(course.id)}.txt`;
      const materialBody = [
        `DashCole — material demo`,
        `${course.subject} · ${course.name}`,
        '',
        `Guía de trabajo para la unidad en curso.`,
        `Incluye ejercicios, criterios de evaluación y recordatorio de la tarea.`,
      ].join('\n');
      const file = await writeDemoMaterialFile(schoolId, `demo-${schoolId}-${materialName}`, materialBody);
      await TeachingMaterial.findOrCreate({
        where: { schoolId, courseId: course.id, title: `Guía ${course.subject}` },
        defaults: {
          originalName: `Guia ${course.subject} ${course.name}.txt`,
          mimeType: 'text/plain',
          storageKey: file.storageKey,
          size: file.size,
          createdBy: ownerId,
        },
        transaction,
      });
      const slideName = `presentacion-${String(course.subjectId || course.id)}-${String(course.id)}.txt`;
      const slideBody = [
        `Presentación demo — ${course.subject}`,
        `Curso ${course.name} ${course.section}`,
        '',
        'Diapositivas resumen de la unidad.',
        'Usar en clase y dejar disponible en el aula virtual.',
      ].join('\n');
      const slideFile = await writeDemoMaterialFile(schoolId, `demo-${schoolId}-${slideName}`, slideBody);
      await TeachingMaterial.findOrCreate({
        where: { schoolId, courseId: course.id, title: `Presentación ${course.subject}` },
        defaults: {
          originalName: `Presentacion ${course.subject}.txt`,
          mimeType: 'text/plain',
          storageKey: slideFile.storageKey,
          size: slideFile.size,
          createdBy: ownerId,
        },
        transaction,
      });
    }

    for (const [index, student] of seededStudents.slice(0, 6).entries()) {
      await Observation.findOrCreate({
        where: { schoolId, studentId: student.id, detail: index % 2 === 0 ? 'Participación destacada en clases.' : 'Debe reforzar hábitos de estudio y organización semanal.' },
        defaults: {
          kind: index % 2 === 0 ? 'positive' : 'negative',
          createdBy: teacher.id,
        },
        transaction,
      });
      if (index < 3) {
        await Observation.findOrCreate({
          where: { schoolId, studentId: student.id, detail: 'Observación general de seguimiento tutorial.' },
          defaults: { kind: 'general', createdBy: secondTeacher.id },
          transaction,
        });
      }
    }

    if (seededStudents[0]) {
      const [invoice] = await Invoice.findOrCreate({
        where: { schoolId, number: `MAT-2026-${String(schoolId).padStart(3, '0')}` },
        defaults: { studentId: seededStudents[0].id, amount: 120000, dueOn: '2026-08-05', status: 'paid', createdBy: director.id },
        transaction,
      });
      await Payment.findOrCreate({
        where: { schoolId, invoiceId: invoice.id },
        defaults: { amount: 120000, paidAt: new Date('2026-08-03T12:00:00Z'), method: 'transfer', createdBy: director.id },
        transaction,
      });
    }
    if (seededStudents[1]) {
      await Invoice.findOrCreate({
        where: { schoolId, number: `MEN-2026-${String(schoolId).padStart(3, '0')}` },
        defaults: { studentId: seededStudents[1].id, amount: 85000, dueOn: '2026-09-05', status: 'pending', createdBy: director.id },
        transaction,
      });
    }
    if (seededStudents[2]) {
      await Invoice.findOrCreate({
        where: { schoolId, number: `ATR-2026-${String(schoolId).padStart(3, '0')}` },
        defaults: { studentId: seededStudents[2].id, amount: 95000, dueOn: '2026-07-05', status: 'overdue', createdBy: director.id },
        transaction,
      });
    }
    const [supplier] = await Supplier.findOrCreate({
      where: { schoolId, name: `Proveedor ${definition.name}` },
      defaults: { taxId: demoRut(76010000 + schoolId), email: `ventas@${domain}`, createdBy: director.id },
      transaction,
    });
    await Expense.findOrCreate({
      where: { schoolId, supplierId: supplier.id, concept: 'Material pedagógico' },
      defaults: { amount: 85000, spentOn: '2026-08-12', costCenter: 'Académico', createdBy: director.id },
      transaction,
    });
    await AccountabilityEntry.findOrCreate({
      where: { schoolId, period: '2026-08-01', documentNumber: `SUBV-2026-08-${schoolId}` },
      defaults: {
        movementType: 'income',
        fundingSource: 'Subvención general',
        category: 'Subvención recibida',
        documentType: 'Liquidación',
        counterparty: 'Ministerio de Educación',
        description: 'Transferencia mensual de subvención escolar',
        amount: 4850000,
        status: 'verified',
        createdBy: director.id,
      },
      transaction,
    });
    await InventoryItem.findOrCreate({
      where: { schoolId, sku: `NOTE-${String(schoolId).padStart(3, '0')}` },
      defaults: { campusId: campus.id, name: 'Notebook docente', stock: 12, minimumStock: 3, responsible: 'Bodega central', createdBy: director.id },
      transaction,
    });
    if (seededStudents[1]) {
      await Incident.findOrCreate({
        where: { schoolId, studentId: seededStudents[1].id, occurredOn: '2026-08-20' },
        defaults: { severity: 'low', detail: 'Atraso reiterado durante la semana.', status: 'follow_up', createdBy: director.id },
        transaction,
      });
    }
    await Communication.findOrCreate({
      where: { schoolId, subject: `Reunión de apoderados ${definition.name}` },
      defaults: { channel: 'email', body: 'Reunión general el jueves a las 18:00.', sentAt: new Date(), createdBy: director.id },
      transaction,
    });

    for (const [index, entry] of ADMISSION_DEMO.entries()) {
      const student = fixedPerson(definition.seed + 100, index);
      const guardian = fixedPerson(definition.seed + 200, index + 3);
      const admissionDefaults = {
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        studentRut: demoRut(16000000 + schoolId * 1000 + index * 137),
        guardianName: guardian.fullName,
        guardianEmail: `familia.${String(index + 1).padStart(2, '0')}@${domain}`,
        guardianPhone: `+5697${String(schoolId).padStart(2, '0')}${String(10000 + index).slice(-5)}`,
        guardianRut: demoRut(14000000 + schoolId * 1000 + index * 211),
        requestedLevel: ADMISSION_LEVELS[index % ADMISSION_LEVELS.length],
        answers: {
          motivation: `Queremos postular a ${student.firstName} porque buscamos una comunidad cercana y un proyecto académico integral.`,
          support: index % 3 === 0 ? 'Requiere seguimiento inicial en comprensión lectora.' : 'Sin apoyos adicionales informados.',
          expectations: 'Comunicación oportuna, acompañamiento del aprendizaje y convivencia respetuosa.',
        },
        status: entry.status,
        reviewerNotes: entry.note,
        createdBy: director.id,
      };
      const [application, created] = await AdmissionApplication.findOrCreate({
        where: { schoolId, guardianEmail: admissionDefaults.guardianEmail },
        defaults: admissionDefaults,
        transaction,
      });
      if (!created) {
        await application.update({
          guardianRut: application.guardianRut || admissionDefaults.guardianRut,
          studentRut: application.studentRut || admissionDefaults.studentRut,
          requestedLevel: ADMISSION_LEVELS.includes(application.requestedLevel) ? application.requestedLevel : admissionDefaults.requestedLevel,
          status: entry.status,
          reviewerNotes: entry.note,
        }, { transaction });
      }
    }
    for (const [index, status] of ['new', 'read', 'closed'].entries()) {
      await ContactMessage.findOrCreate({
        where: {
          schoolId,
          email: `contacto.${index + 1}@${domain}`,
          subject: ['Consulta por matrícula', 'Solicitud de demostración', 'Información sobre integración'][index],
        },
        defaults: {
          name: fixedFullName(definition.seed + 300, index),
          organization: `Organización ${definition.name} ${index + 1}`,
          body: 'Mensaje de demostración con antecedentes suficientes para probar el inbox y sus estados.',
          status,
          sourceIpHash: crypto.createHash('sha256').update(`${definition.slug}-${index}`).digest('hex'),
        },
        transaction,
      });
    }

    const employees = await Employee.findAll({ where: { schoolId, active: true }, order: [['id', 'ASC']], transaction });
    const afps = ['Habitat', 'Modelo', 'Provida', 'Capital'];
    for (const [index, employee] of employees.entries()) {
      await employee.update({
        fullName: employee.fullName || `Colaborador ${index + 1}`,
        payrollProfile: {
          afp: afps[index % afps.length],
          healthSystem: index === 2 ? 'Isapre' : 'Fonasa',
          isapreUnit: 'UF',
          isaprePlan: index === 2 ? 3.5 : 0,
          apvRegime: 'A',
          apv: index === 0 ? 50000 : 0,
          taxableBonus: 80000 + index * 10000,
          nonTaxableBonus: 45000,
          viaticos: index % 3 === 0 ? 25000 : 0,
          overtimeAmount: index % 2 ? 35000 : 0,
          commissions: 0,
          otherTaxable: 0,
          deductions: 0,
          advances: 0,
          conceptAmounts: [],
          previred: {
            rut: demoRut(12000000 + schoolId * 1000 + index * 137),
            paternalSurname: employee.fullName?.split(' ').at(-1) || 'Demo',
            maternalSurname: 'González',
            givenNames: employee.fullName?.split(' ')[0] || 'Colaborador',
            sex: index % 2 ? 'M' : 'F',
            nationality: '0',
            paymentType: '01',
            pensionRegime: 'AFP',
            workerType: '0',
            workdayType: '1',
            personnelMovementCode: '0',
            familyAllowanceBracket: 'D',
            familyDependants: '0',
            healthInstitutionCode: index === 2 ? '02' : '07',
            funNumber: index === 2 ? `FUN-${schoolId}-2026` : '',
            ccafCode: '00',
            mutualCode: '00',
            mutualBranch: '000',
            costCenter: 'CASA-CENTRAL',
          },
        },
      }, { transaction });
    }

    const [payrollPeriod] = await PayrollPeriod.findOrCreate({ where: { schoolId, period: '2026-08' }, transaction });
    const payrollParameters = {
      uf: 39700, utm: 69100, pensionCapUf: 87.8, healthCapUf: 87.8, afcCapUf: 131.9, pensionRate: 0.101, healthRate: 0.07,
      healthTaxCapUf: 4.2, apvMonthlyCapUf: 50, salaryDays: 30, employerPensionRate: 0.001, sisRate: 0.016, lifeExpectancyRate: 0.009,
      protectedReturnRate: 0.009, accidentRate: 0.0093, sannaRate: 0.0003,
      afc: { Indefinido: { employee: 0.006, employer: 0.024 }, 'Plazo fijo': { employee: 0, employer: 0.03 }, Reemplazo: { employee: 0, employer: 0.03 } },
      source: 'Datos demostrativos para agosto 2026. Verificar valores oficiales antes de emitir liquidaciones reales.',
    };
    const [parameterRow] = await PayrollParameter.findOrCreate({
      where: { schoolId, periodId: payrollPeriod.id },
      defaults: { values: payrollParameters },
      transaction,
    });
    await parameterRow.update({ values: payrollParameters }, { transaction });
    for (const [name, commission] of [['Capital', 0.0144], ['Cuprum', 0.0144], ['Habitat', 0.0127], ['Modelo', 0.0058], ['PlanVital', 0.0116], ['Provida', 0.0145], ['Uno', 0.0046]]) {
      const [rate] = await PayrollAfpRate.findOrCreate({
        where: { schoolId, periodId: payrollPeriod.id, name },
        defaults: { commission },
        transaction,
      });
      await rate.update({ commission }, { transaction });
    }
    for (const bracket of [
      { lowerUtm: 0, upperUtm: 13.5, factor: 0, deductionUtm: 0 }, { lowerUtm: 13.5, upperUtm: 30, factor: 0.04, deductionUtm: 0.54 },
      { lowerUtm: 30, upperUtm: 50, factor: 0.08, deductionUtm: 1.74 }, { lowerUtm: 50, upperUtm: 70, factor: 0.135, deductionUtm: 4.49 },
      { lowerUtm: 70, upperUtm: 90, factor: 0.23, deductionUtm: 11.14 }, { lowerUtm: 90, upperUtm: 120, factor: 0.304, deductionUtm: 17.8 },
      { lowerUtm: 120, upperUtm: 310, factor: 0.35, deductionUtm: 23.32 }, { lowerUtm: 310, upperUtm: null, factor: 0.4, deductionUtm: 38.82 },
    ]) {
      const [row] = await PayrollTaxBracket.findOrCreate({
        where: { schoolId, periodId: payrollPeriod.id, lowerUtm: bracket.lowerUtm },
        defaults: bracket,
        transaction,
      });
      await row.update(bracket, { transaction });
    }
    for (const concept of [
      { code: 'asignacion_responsabilidad', label: 'Asignación de responsabilidad', taxable: true, pensionable: true },
      { code: 'movilizacion_extra', label: 'Movilización extraordinaria', taxable: false, pensionable: false },
    ]) {
      await PayrollConcept.findOrCreate({
        where: { schoolId, periodId: payrollPeriod.id, code: concept.code },
        defaults: concept,
        transaction,
      });
    }

    await AuditLog.findOrCreate({
      where: { schoolId, action: 'seed_completed', entity: 'school', entityId: schoolId },
      defaults: {
        payload: {
          detail: 'Carga inicial de datos de demostración del colegio',
          source: 'faker',
          slug: definition.slug,
        },
        createdBy: director.id,
      },
      transaction,
    });

    const credentials = [
      credentialRow({
        scope: 'school',
        school: school.name,
        slug: definition.slug,
        role: 'director',
        fullName: director.fullName,
        username: directorUsername,
        password: DEFAULT_PASSWORD,
      }),
    ];
    credentials.push(credentialRow({
      scope: 'school',
      school: school.name,
      slug: definition.slug,
      role: 'teacher',
      fullName: teacher.fullName,
      username: teacherUsername,
      password: DEFAULT_PASSWORD,
    }));
    for (const account of teacherAccounts) {
      if (account.username === teacherUsername) continue;
      if (RESERVED_SEED_EMAILS.has(String(account.username).toLowerCase())) continue;
      credentials.push(credentialRow({
        scope: 'school',
        school: school.name,
        slug: definition.slug,
        role: 'teacher',
        fullName: account.fullName,
        username: account.username,
        password: DEFAULT_PASSWORD,
      }));
    }
    for (const item of staffDefinitions) {
      if (RESERVED_SEED_EMAILS.has(String(item.username).toLowerCase())) continue;
      credentials.push(credentialRow({
        scope: 'school',
        school: school.name,
        slug: definition.slug,
        role: item.role,
        fullName: item.fullName,
        username: item.username,
        password: item.password || ROLE_PASSWORD[item.role] || DEFAULT_PASSWORD,
      }));
    }
    for (const student of seededStudents) {
      credentials.push(credentialRow({
        scope: 'school',
        school: school.name,
        slug: definition.slug,
        role: 'student',
        fullName: `${student.firstName} ${student.lastName}`,
        username: student.email,
        password: DEFAULT_PASSWORD,
      }));
    }
    credentials.push(credentialRow({
      scope: 'school',
      school: school.name,
      slug: definition.slug,
      role: 'guardian',
      fullName: guardianName,
      username: guardianUsername,
      password: DEFAULT_PASSWORD,
    }));

    return { school, credentials };
  });
}

async function syncTenantAccess(school) {
  const tenantUsers = await User.findAll({ where: { schoolId: school.id }, raw: true });
  for (const user of tenantUsers) {
    const email = String(user.username || '').trim().toLowerCase();
    if (!email.includes('@')) continue;
    // La cuenta demo fija la mantiene el instalador; el Faker no la pisa.
    if (SCHOOL_DEMO_USERS.some(account => account.username.toLowerCase() === email)) continue;
    const [globalUser] = await controlModels.GlobalUser.findOrCreate({
      where: { email },
      defaults: {
        email,
        fullName: user.fullName,
        phone: user.phone || null,
        passwordHash: user.passwordHash,
        status: user.active ? 'active' : 'suspended',
      },
    });
    await globalUser.update({
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      status: user.active ? 'active' : 'suspended',
    });
    await controlModels.TenantMembership.findOrCreate({
      where: { globalUserId: globalUser.id, schoolId: school.id, userId: user.id },
      defaults: { role: user.role, status: user.active ? 'active' : 'suspended' },
    });
    const membership = await controlModels.TenantMembership.findOne({ where: { globalUserId: globalUser.id, schoolId: school.id, userId: user.id } });
    if (membership && (membership.role !== user.role || membership.status !== (user.active ? 'active' : 'suspended'))) {
      await membership.update({ role: user.role, status: user.active ? 'active' : 'suspended' });
    }
  }
  const [plan] = await controlModels.TenantPlan.findOrCreate({
    where: { schoolId: school.id },
    defaults: {
      code: 'demo',
      status: 'active',
      limits: { students: 500, staff: 100, storageGb: 10 },
      freeStudentLimit: 10,
      baseMonthlyPrice: 0,
      perStudentPrice: 2500,
      currency: 'CLP',
      customPricing: false,
    },
  });
  await plan.update({ freeStudentLimit: 10, baseMonthlyPrice: 0, perStudentPrice: 2500, currency: 'CLP', status: 'active' });
  await seedDemoAccessHistory(school);
}

const DEMO_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
];

function demoAccessIp(seed) {
  const blocks = [190, 181, 200, 186, 201];
  const a = blocks[Math.abs(seed) % blocks.length];
  const b = 20 + (Math.abs(seed * 3) % 80);
  const c = 10 + (Math.abs(seed * 7) % 200);
  const d = 20 + (Math.abs(seed * 13) % 200);
  return `${a}.${b}.${c}.${d}`;
}

/** Inventa sesiones e impersonaciones de soporte para que la ficha de cuentas tenga historial realista. */
async function seedDemoAccessHistory(school) {
  const memberships = await controlModels.TenantMembership.findAll({
    where: { schoolId: school.id, status: 'active' },
    raw: true,
  });
  if (!memberships.length) return { sessions: 0, impersonations: 0 };

  const roleRank = {
    director: 0,
    school_admin: 1,
    manager: 2,
    utp: 3,
    teacher: 4,
    inspector: 5,
    finance: 6,
    agente_finanzas: 7,
    guardian: 8,
    student: 9,
  };
  const selected = [...memberships]
    .sort((a, b) => (roleRank[a.role] ?? 50) - (roleRank[b.role] ?? 50) || a.userId - b.userId)
    .slice(0, 48);

  const existingCount = await controlModels.SessionRecord.count({ where: { schoolId: school.id } });
  const targetMin = selected.length * 2;
  let sessionsCreated = 0;
  const now = Date.now();

  if (existingCount < targetMin) {
    for (const membership of selected) {
      const staff = ['director', 'school_admin', 'manager', 'utp', 'teacher', 'inspector', 'finance', 'agente_finanzas'].includes(membership.role);
      const sessionCount = staff ? 4 : 2;
      let latestLogin = null;
      for (let i = 0; i < sessionCount; i += 1) {
        const tokenHash = crypto.createHash('sha256')
          .update(`demo-access:${school.id}:${membership.userId}:${i}`)
          .digest('hex');
        const daysAgo = i === 0 ? faker.number.int({ min: 0, max: 3 }) : faker.number.int({ min: 4, max: 45 });
        const hour = faker.number.int({ min: 7, max: 22 });
        const seenAt = new Date(now - (((daysAgo * 24) + hour) * 3600000) - (i * 900000));
        const [sessionRow, created] = await controlModels.SessionRecord.findOrCreate({
          where: { tokenHash },
          defaults: {
            globalUserId: membership.globalUserId,
            userId: membership.userId,
            schoolId: school.id,
            ip: demoAccessIp((school.id * 10000) + (membership.userId * 17) + i),
            userAgent: DEMO_USER_AGENTS[(membership.userId + i) % DEMO_USER_AGENTS.length],
            lastSeenAt: seenAt,
            // Solo historial de demo: nunca dejan “sesiones activas” fantasmas en plataforma.
            revokedAt: new Date(seenAt.getTime() + (faker.number.int({ min: 1, max: 36 }) * 3600000)),
          },
        });
        if (created) {
          sessionsCreated += 1;
          // findOrCreate no acepta createdAt en defaults; dejamos fecha histórica con SQL.
          await sessionRow.sequelize.query(
            'UPDATE session_records SET created_at = :seenAt WHERE id = :id',
            { replacements: { seenAt, id: sessionRow.id } },
          );
        }
        if (!latestLogin || seenAt > latestLogin) latestLogin = seenAt;
      }
      if (latestLogin && membership.globalUserId) {
        const account = await controlModels.GlobalUser.findByPk(membership.globalUserId);
        if (account && (!account.lastLoginAt || new Date(account.lastLoginAt) < latestLogin)) {
          await account.update({ lastLoginAt: latestLogin });
        }
      }
    }
  }

  let impersonationsCreated = 0;
  const actorEmail = PLATFORM_BOOTSTRAP_USERS[0]?.username?.toLowerCase();
  const actor = actorEmail
    ? await controlModels.GlobalUser.findOne({ where: { email: actorEmail }, attributes: ['id'], raw: true })
    : null;
  const supportTargets = selected.filter(row => ['teacher', 'director', 'manager', 'guardian'].includes(row.role)).slice(0, 3);
  if (actor && supportTargets.length) {
    for (const [index, target] of supportTargets.entries()) {
      const reason = [
        'Soporte demo: revisar acceso a notas del curso',
        'Soporte demo: validar matrícula y cobros del estudiante',
        'Soporte demo: acompañar configuración de perfil docente',
      ][index] || 'Soporte demo: asistencia técnica';
      const startedAt = new Date(now - ((8 + index * 5) * 86400000));
      const endedAt = new Date(startedAt.getTime() + ((2 + index) * 3600000));
      const [, created] = await controlModels.Impersonation.findOrCreate({
        where: {
          actorGlobalUserId: actor.id,
          targetUserId: target.userId,
          schoolId: school.id,
          reason,
        },
        defaults: {
          startedAt,
          endedAt,
          ip: demoAccessIp((school.id * 500) + target.userId),
        },
      });
      if (created) impersonationsCreated += 1;
    }
  }

  return { sessions: sessionsCreated, impersonations: impersonationsCreated };
}

export {
  SCHOOL_DEFINITIONS,
  DEFAULT_PASSWORD,
  RESERVED_SEED_EMAILS,
  seedSchool,
  syncTenantAccess,
  seedDemoAccessHistory,
  credentialRow,
};

export async function runFakerSeed({ wipeFirst = false } = {}) {
  await initializeDatabase();
  if (wipeFirst) {
    const { resetDemoData } = await import('./services/demo-reset.js');
    await resetDemoData({ source: 'cli', by: 'db:seed --wipe' });
    return;
  }
  const staleAvatarKeys = [];
  const schools = [];
  const allCredentials = [];
  for (const account of PLATFORM_BOOTSTRAP_USERS) {
    allCredentials.push(credentialRow({
      scope: 'platform',
      role: 'super_admin',
      fullName: account.fullName,
      username: account.username,
      password: DEFAULT_PASSWORD,
    }));
  }
  const primarySchool = await models.School.findOne({ order: [['id', 'ASC']], raw: true });
  for (const account of SCHOOL_DEMO_USERS) {
    allCredentials.push(credentialRow({
      scope: 'demo',
      school: primarySchool?.name || 'Colegio demo',
      slug: primarySchool?.slug || 'colegio-del-sur',
      role: account.role,
      fullName: account.fullName,
      username: account.username,
      password: DEFAULT_PASSWORD,
    }));
  }
  for (const definition of SCHOOL_DEFINITIONS) {
    const seeded = await seedSchool(definition, staleAvatarKeys);
    schools.push(seeded.school);
    allCredentials.push(...seeded.credentials.filter(row => !RESERVED_SEED_EMAILS.has(String(row.username).toLowerCase())));
  }
  for (const key of staleAvatarKeys) {
    try { await fs.unlink(safeUploadPath(key)); } catch { /* Archivo ya ausente o clave inválida. */ }
  }
  await ensureDefaultDatabaseRouting();
  for (const school of schools) await syncTenantAccess(school);

  console.log(`Faker completado en ${sequelize.config.host}:${sequelize.config.port}/${sequelize.config.database}.`);
  console.log(`Colegios sembrados: ${schools.length}.`);
  const summaries = [];
  for (const school of schools) {
    const countModels = [User, Subject, Course, Student, Enrollment, Grade, Employee, JobTitle, AdmissionApplication, ContactMessage];
    const counts = await Promise.all(countModels.map(model => model.count({ where: { schoolId: school.id } })));
    summaries.push({
      colegio: school.name,
      slug: school.slug,
      usuarios: counts[0],
      asignaturas: counts[1],
      cursos: counts[2],
      estudiantes: counts[3],
      matriculas: counts[4],
      notas: counts[5],
      personal: counts[6],
      cargos: counts[7],
      postulaciones: counts[8],
      mensajes: counts[9],
    });
  }
  console.table(summaries);
  console.table(allCredentials.filter(row => row.scope === 'platform' || ['director', 'manager', 'utp', 'agente_finanzas', 'teacher', 'student'].includes(row.role)).map(row => ({
    ambito: row.scope === 'platform' ? 'plataforma' : row.slug,
    rol: row.role,
    usuario: row.username,
    clave: row.password,
  })));
  const dump = await writeCredentialsDump(allCredentials);
  console.log(`Credenciales dump: ${dump.latestPath}`);
  console.log('Plantillas de curso (Básica/Media) siguen disponibles al crear cursos nuevos en cada colegio.');
  console.log('Credenciales fijas: siempre los mismos usuarios/claves (admin). Solo se escribe target/faker-credentials.txt.');
  console.log('El sembrado es repetible: conserva registros existentes y completa lo que falte.');
  return { schools, credentials: allCredentials };
}
