import { Op } from 'sequelize';
import { defaultSigeSubjectCode } from './sige-defaults.js';

const PREESCOLAR_SUBJECTS = [
  'Lenguaje Verbal',
  'Pensamiento Matemático',
  'Exploración del Medio Natural',
  'Educación Física',
  'Artes Visuales',
  'Música',
  'Formación Personal y Social',
];

const BASICA_SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Historia, Geografía y Ciencias Sociales',
  'Ciencias Naturales',
  'Inglés',
  'Educación Física y Salud',
  'Artes Visuales',
  'Música',
  'Tecnología',
  'Orientación',
];

/** 1° y 2° medio: formación general (sin diferenciación). */
const MEDIA_COMUN_SUBJECTS = [
  'Lengua y Literatura',
  'Matemáticas',
  'Historia, Geografía y Ciencias Sociales',
  'Ciencias Naturales',
  'Inglés',
  'Educación Física y Salud',
  'Artes Visuales',
  'Música',
  'Tecnología',
  'Orientación',
];

/** Base común de 3°–4° medio humanista-científico. */
const MEDIA_HC_CORE = [
  'Lengua y Literatura',
  'Matemáticas',
  'Educación Ciudadana',
  'Filosofía',
  'Inglés',
  'Educación Física y Salud',
  'Orientación',
];

const MEDIA_HUMANISTA_SUBJECTS = [
  ...MEDIA_HC_CORE,
  'Historia, Geografía y Ciencias Sociales',
  'Artes Visuales',
  'Música',
  'Biología',
];

const MEDIA_CIENTIFICO_SUBJECTS = [
  ...MEDIA_HC_CORE,
  'Biología',
  'Física',
  'Química',
  'Tecnología',
];

/** Plan HC mixto (ramos de ambas menciones). */
const MEDIA_HC_SUBJECTS = [
  ...MEDIA_HC_CORE,
  'Historia, Geografía y Ciencias Sociales',
  'Biología',
  'Física',
  'Química',
  'Artes Visuales',
  'Tecnología',
];

/** TP: formación general; la especialidad se agrega como ramos propios. */
const MEDIA_TP_SUBJECTS = [
  'Lengua y Literatura',
  'Matemáticas',
  'Historia, Geografía y Ciencias Sociales',
  'Inglés',
  'Educación Física y Salud',
  'Orientación',
];

/** Compat: media genérica (asegurar módulos por nivel). */
const MEDIA_SUBJECTS = MEDIA_COMUN_SUBJECTS;

export const SCHOOL_LEVELS = [
  { id: 'prekinder', name: 'Prekínder', band: 'preescolar', needsTrack: false },
  { id: 'kinder', name: 'Kínder', band: 'preescolar', needsTrack: false },
  { id: '1b', name: '1° Básico', band: 'basica', needsTrack: false },
  { id: '2b', name: '2° Básico', band: 'basica', needsTrack: false },
  { id: '3b', name: '3° Básico', band: 'basica', needsTrack: false },
  { id: '4b', name: '4° Básico', band: 'basica', needsTrack: false },
  { id: '5b', name: '5° Básico', band: 'basica', needsTrack: false },
  { id: '6b', name: '6° Básico', band: 'basica', needsTrack: false },
  { id: '7b', name: '7° Básico', band: 'basica', needsTrack: false },
  { id: '8b', name: '8° Básico', band: 'basica', needsTrack: false },
  { id: '1m', name: '1° Medio', band: 'media', needsTrack: false },
  { id: '2m', name: '2° Medio', band: 'media', needsTrack: false },
  { id: '3m', name: '3° Medio', band: 'media', needsTrack: true },
  { id: '4m', name: '4° Medio', band: 'media', needsTrack: true },
];

export const EDUCATION_STAGES = [
  { id: 'prekinder', name: 'Prekínder', description: 'Nivel parvulario Prekínder.' },
  { id: 'kinder', name: 'Kínder', description: 'Nivel parvulario Kínder.' },
  { id: 'basica', name: 'Educación básica', description: '1° a 8° básico.' },
  { id: 'media', name: 'Educación media', description: '1° a 4° medio.' },
];

export const DEFAULT_EDUCATION_STAGES = EDUCATION_STAGES.map((stage) => stage.id);

export function normalizeEducationStages(value) {
  let list = value;
  if (typeof value === 'string') {
    try { list = JSON.parse(value); } catch { list = null; }
  }
  const allowed = new Set(DEFAULT_EDUCATION_STAGES);
  if (!Array.isArray(list) || !list.length) return [...DEFAULT_EDUCATION_STAGES];
  const next = [...new Set(list.map((item) => String(item || '').trim()).filter((id) => allowed.has(id)))];
  return next.length ? next : [...DEFAULT_EDUCATION_STAGES];
}

export function stageIdForLevel(level) {
  if (!level) return '';
  if (level.id === 'prekinder' || level.id === 'kinder') return level.id;
  if (level.band === 'basica') return 'basica';
  if (level.band === 'media') return 'media';
  return '';
}

export function stageIdForLevelName(levelName) {
  const raw = String(levelName || '').trim();
  if (!raw) return '';
  const needle = raw.toLocaleLowerCase('es');
  const exact = LEVEL_BY_NAME.get(needle);
  if (exact) return stageIdForLevel(exact);
  const folded = needle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const level of SCHOOL_LEVELS) {
    const candidate = level.name.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (candidate === folded) return stageIdForLevel(level);
  }
  return '';
}

export function educationStageLabel(stageId) {
  return EDUCATION_STAGES.find((stage) => stage.id === stageId)?.name || String(stageId || '');
}

export function levelsForEducationStages(stages) {
  const enabled = new Set(normalizeEducationStages(stages));
  return SCHOOL_LEVELS.filter((level) => enabled.has(stageIdForLevel(level)));
}

export function templatesForEducationStages(stages) {
  const enabled = new Set(normalizeEducationStages(stages));
  return buildChileCourseTemplates().filter((template) => {
    if (template.id === 'prekinder') return enabled.has('prekinder');
    if (template.id === 'kinder') return enabled.has('kinder');
    if (template.id === 'basica') return enabled.has('basica');
    if (['media-comun', 'hc', 'humanista', 'cientifico', 'tp'].includes(template.id)) return enabled.has('media');
    return true;
  });
}

export const COURSE_TRACKS = [
  { id: 'hc', name: 'Humanista-Científico', description: 'Plan HC con ramos de ambas menciones.', forDifferentiatedMedia: true },
  { id: 'humanista', name: 'Humanista', description: 'Mención humanista (historia, artes, filosofía).', forDifferentiatedMedia: true },
  { id: 'cientifico', name: 'Científico', description: 'Mención científica (biología, física, química).', forDifferentiatedMedia: true },
  { id: 'tp', name: 'Técnico-Profesional', description: 'Formación general TP; agrega ramos de la especialidad.', forDifferentiatedMedia: true },
  { id: 'otro', name: 'Otro', description: 'Plan libre: defines tus propios ramos.', forDifferentiatedMedia: true },
];

const LEVEL_BY_ID = new Map(SCHOOL_LEVELS.map((level) => [level.id, level]));
const LEVEL_BY_NAME = new Map(SCHOOL_LEVELS.map((level) => [level.name.toLocaleLowerCase('es'), level]));

function subjectsForBand(band) {
  if (band === 'preescolar') return PREESCOLAR_SUBJECTS;
  if (band === 'media') return MEDIA_SUBJECTS;
  return BASICA_SUBJECTS;
}

export function subjectsForLevelName(levelName) {
  const level = LEVEL_BY_NAME.get(String(levelName || '').trim().toLocaleLowerCase('es'));
  return subjectsForBand(level?.band || 'basica');
}

export function resolveChileCurriculum({ levelId = '', trackId = '' } = {}) {
  const level = LEVEL_BY_ID.get(String(levelId || '').trim()) || null;
  const track = String(trackId || '').trim();
  if (!level) {
    return {
      templateId: 'otro',
      name: 'Otro',
      description: 'Plan libre: defines tus propios ramos.',
      subjects: [],
      level: null,
      track: track || 'otro',
      needsTrack: false,
    };
  }
  if (level.id === 'prekinder') {
    return {
      templateId: 'prekinder',
      name: 'Prekínder',
      description: 'Ámbitos de aprendizaje para Prekínder.',
      subjects: [...PREESCOLAR_SUBJECTS],
      level,
      track: '',
      needsTrack: false,
    };
  }
  if (level.id === 'kinder') {
    return {
      templateId: 'kinder',
      name: 'Kínder',
      description: 'Ámbitos de aprendizaje para Kínder.',
      subjects: [...PREESCOLAR_SUBJECTS],
      level,
      track: '',
      needsTrack: false,
    };
  }
  if (level.band === 'preescolar') {
    return {
      templateId: 'prekinder',
      name: 'Educación parvularia',
      description: 'Bases curriculares de educación parvularia.',
      subjects: [...PREESCOLAR_SUBJECTS],
      level,
      track: '',
      needsTrack: false,
    };
  }
  if (level.band === 'basica') {
    return {
      templateId: 'basica',
      name: 'Educación básica',
      description: 'Plan de estudios de educación básica.',
      subjects: [...BASICA_SUBJECTS],
      level,
      track: '',
      needsTrack: false,
    };
  }
  // Media
  if (!level.needsTrack || level.id === '1m' || level.id === '2m') {
    return {
      templateId: 'media-comun',
      name: 'Enseñanza media · formación general',
      description: '1° y 2° medio no se diferencian: plan común.',
      subjects: [...MEDIA_COMUN_SUBJECTS],
      level,
      track: '',
      needsTrack: false,
    };
  }
  if (track === 'humanista') {
    return {
      templateId: 'humanista',
      name: 'Media · mención humanista',
      description: '3°–4° medio con énfasis humanista.',
      subjects: [...MEDIA_HUMANISTA_SUBJECTS],
      level,
      track,
      needsTrack: true,
    };
  }
  if (track === 'cientifico') {
    return {
      templateId: 'cientifico',
      name: 'Media · mención científica',
      description: '3°–4° medio con énfasis científico.',
      subjects: [...MEDIA_CIENTIFICO_SUBJECTS],
      level,
      track,
      needsTrack: true,
    };
  }
  if (track === 'tp') {
    return {
      templateId: 'tp',
      name: 'Media · técnico-profesional',
      description: 'Formación general TP. Agrega los ramos de la especialidad.',
      subjects: [...MEDIA_TP_SUBJECTS],
      level,
      track,
      needsTrack: true,
    };
  }
  if (track === 'otro') {
    return {
      templateId: 'otro',
      name: 'Otro',
      description: 'Plan libre: defines tus propios ramos.',
      subjects: [],
      level,
      track: 'otro',
      needsTrack: true,
    };
  }
  return {
    templateId: 'hc',
    name: 'Media · humanista-científico',
    description: '3°–4° medio plan HC (ambas menciones).',
    subjects: [...MEDIA_HC_SUBJECTS],
    level,
    track: 'hc',
    needsTrack: true,
  };
}

export function buildChileCourseTemplates() {
  return [
    { id: 'prekinder', name: 'Prekínder', description: 'Ámbitos típicos de Prekínder.', subjects: [...PREESCOLAR_SUBJECTS] },
    { id: 'kinder', name: 'Kínder', description: 'Ámbitos típicos de Kínder.', subjects: [...PREESCOLAR_SUBJECTS] },
    { id: 'basica', name: 'Básica', description: '1° a 8° básico.', subjects: [...BASICA_SUBJECTS] },
    { id: 'media-comun', name: 'Media · formación general', description: '1° y 2° medio.', subjects: [...MEDIA_COMUN_SUBJECTS] },
    { id: 'hc', name: 'Media · HC', description: '3°–4° medio humanista-científico.', subjects: [...MEDIA_HC_SUBJECTS] },
    { id: 'humanista', name: 'Media · humanista', description: 'Mención humanista.', subjects: [...MEDIA_HUMANISTA_SUBJECTS] },
    { id: 'cientifico', name: 'Media · científico', description: 'Mención científica.', subjects: [...MEDIA_CIENTIFICO_SUBJECTS] },
    { id: 'tp', name: 'Media · TP', description: 'Técnico-profesional (formación general).', subjects: [...MEDIA_TP_SUBJECTS] },
    { id: 'otro', name: 'Otro', description: 'Agrega tus propios ramos.', subjects: [] },
  ];
}

const SUBJECT_ALIASES = {
  'Matemáticas': ['Matemática', 'Matematicas'],
  'Lenguaje y Comunicación': ['Lenguaje', 'Lenguaje y comunicacion'],
  'Ciencias Naturales': ['Ciencias'],
  'Historia, Geografía y Ciencias Sociales': ['Historia'],
  'Lengua y Literatura': ['Lenguaje', 'Lengua'],
};

function subjectMatchNames(subjectName) {
  const aliases = SUBJECT_ALIASES[subjectName] || [];
  return [subjectName, ...aliases];
}

export const SUBJECT_COLORS = [
  '#0067b2', '#F59E6D', '#27A37D', '#8B6CCF', '#0EA5E9',
  '#EF4444', '#14B8A6', '#F59E0B', '#6366F1', '#EC4899',
  '#84CC16', '#64748B', '#0D9488', '#D97706', '#7C3AED',
  '#DB2777',
];

export function normalizeSubjectColor(value) {
  const color = String(value || '').trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(color) ? color : '';
}

export function nextAvailableSubjectColor(usedColors = []) {
  const taken = new Set(
    (Array.isArray(usedColors) ? usedColors : [])
      .map((value) => normalizeSubjectColor(value))
      .filter(Boolean),
  );
  return SUBJECT_COLORS.find((color) => !taken.has(color.toUpperCase())) || SUBJECT_COLORS[taken.size % SUBJECT_COLORS.length];
}

/**
 * Ensures every curriculum subject for this class level exists as a course module.
 * Used before enrollment / grading so students see the full subject set.
 */
export async function ensureCourseLevelModules({
  models,
  sequelize,
  schoolId,
  course,
  createdBy = null,
  transaction = null,
}) {
  if (!course?.name || !course?.section) return { created: 0, modules: [] };
  const subjectNames = subjectsForLevelName(course.name);
  const run = async (tx) => {
    let campusId = course.campusId || null;
    let academicYearId = course.academicYearId || null;
    if (!campusId) {
      const [campus] = await models.Campus.findOrCreate({
        where: { schoolId, name: 'Sede principal' },
        defaults: { schoolId, name: 'Sede principal' },
        transaction: tx,
      });
      campusId = campus.id;
    }
    if (!academicYearId) {
      const yearBounds = currentAcademicYearBounds();
      const [academicYear] = await models.AcademicYear.findOrCreate({
        where: { schoolId, name: yearBounds.name },
        defaults: {
          schoolId,
          name: yearBounds.name,
          startsOn: yearBounds.startsOn,
          endsOn: yearBounds.endsOn,
          active: true,
        },
        transaction: tx,
      });
      academicYearId = academicYear.id;
    }

    let created = 0;
    const modules = [];
    for (const [index, subjectName] of subjectNames.entries()) {
      const matchNames = subjectMatchNames(subjectName);
      const existing = await models.Course.findOne({
        where: {
          schoolId,
          name: course.name,
          section: course.section,
          subject: matchNames,
        },
        transaction: tx,
      });
      if (existing) {
        modules.push(existing);
        continue;
      }
      const [subject] = await models.Subject.findOrCreate({
        where: { schoolId, name: subjectName },
        defaults: {
          schoolId,
          name: subjectName,
          createdBy,
          sigeSubjectCode: defaultSigeSubjectCode(subjectName) || null,
        },
        transaction: tx,
      });
      if (!subject.sigeSubjectCode) {
        const suggested = defaultSigeSubjectCode(subjectName);
        if (suggested) await subject.update({ sigeSubjectCode: suggested }, { transaction: tx });
      }
      const [module, wasCreated] = await models.Course.findOrCreate({
        where: {
          schoolId,
          name: course.name,
          section: course.section,
          subject: subjectName,
        },
        defaults: {
          schoolId,
          campusId,
          academicYearId,
          subjectId: subject.id,
          name: course.name,
          section: course.section,
          subject: subjectName,
          teacher: null,
          headTeacher: course.headTeacher || course.head_teacher || null,
          color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
          monthlyFee: course.monthlyFee || 0,
          createdBy,
        },
        transaction: tx,
      });
      if (wasCreated) created += 1;
      else if (!module.subjectId) {
        await module.update({ subjectId: subject.id }, { transaction: tx });
      }
      modules.push(module);
    }

    // Keep every subject of the class rostered with the same students.
    const moduleIds = modules.map((row) => row.id);
    if (moduleIds.length) {
      const members = await models.Enrollment.findAll({
        where: { schoolId, courseId: moduleIds, status: { [Op.ne]: 'withdrawn' } },
        attributes: ['studentId', 'courseId'],
        raw: true,
        transaction: tx,
      });
      const studentIds = [...new Set(members.map((row) => row.studentId))];
      if (studentIds.length) {
        const missing = [];
        for (const module of modules) {
          const enrolled = new Set(members.filter((row) => Number(row.courseId) === Number(module.id)).map((row) => row.studentId));
          for (const studentId of studentIds) {
            if (!enrolled.has(studentId)) {
              missing.push({
                schoolId,
                studentId,
                courseId: module.id,
                status: 'active',
              });
            }
          }
        }
        if (missing.length) {
          await models.Enrollment.bulkCreate(missing, { ignoreDuplicates: true, transaction: tx });
        }
      }
    }

    return { created, modules };
  };

  if (transaction) return run(transaction);
  if (!sequelize) return run(null);
  return sequelize.transaction(run);
}

export function normalizeSchoolLevels(rawLevels) {
  if (!Array.isArray(rawLevels)) return [];
  const selected = [];
  const seen = new Set();
  for (const value of rawLevels) {
    const token = String(value || '').trim();
    if (!token) continue;
    const level = LEVEL_BY_ID.get(token) || LEVEL_BY_NAME.get(token.toLocaleLowerCase('es'));
    if (!level || seen.has(level.id)) continue;
    seen.add(level.id);
    selected.push(level);
  }
  return selected;
}

export function normalizeCourseSections(rawSections, fallbackSection = 'A') {
  const source = Array.isArray(rawSections)
    ? rawSections
    : (rawSections != null && rawSections !== '' ? [rawSections] : [fallbackSection]);
  const selected = [];
  const seen = new Set();
  for (const value of source) {
    const section = String(value || '').trim().slice(0, 10).toLocaleUpperCase('es');
    if (!section || seen.has(section)) continue;
    seen.add(section);
    selected.push(section);
  }
  return selected.length ? selected : ['A'];
}

function currentAcademicYearBounds(now = new Date()) {
  const year = now.getFullYear();
  // Chilean school year roughly March–December.
  if (now.getMonth() + 1 < 3) {
    return { name: String(year - 1), startsOn: `${year - 1}-03-01`, endsOn: `${year - 1}-12-31` };
  }
  return { name: String(year), startsOn: `${year}-03-01`, endsOn: `${year}-12-31` };
}

export async function bootstrapSchoolCourses({
  models,
  sequelize,
  schoolId,
  createdBy,
  levels,
  section = 'A',
  sections,
}) {
  const selectedLevels = normalizeSchoolLevels(levels);
  const selectedSections = normalizeCourseSections(
    sections != null ? sections : section,
    section,
  );
  if (!selectedLevels.length) {
    return { levels: 0, courses: 0, subjects: 0, sections: [] };
  }

  const yearBounds = currentAcademicYearBounds();

  return sequelize.transaction(async (transaction) => {
    const [campus] = await models.Campus.findOrCreate({
      where: { schoolId, name: 'Sede principal' },
      defaults: { schoolId, name: 'Sede principal' },
      transaction,
    });

    const [academicYear] = await models.AcademicYear.findOrCreate({
      where: { schoolId, name: yearBounds.name },
      defaults: {
        schoolId,
        name: yearBounds.name,
        startsOn: yearBounds.startsOn,
        endsOn: yearBounds.endsOn,
        active: true,
      },
      transaction,
    });
    if (!academicYear.active) {
      await academicYear.update({ active: true }, { transaction });
    }

    let courseCount = 0;
    const subjectIds = new Set();

    for (const level of selectedLevels) {
      const subjectNames = subjectsForBand(level.band);
      for (const subjectName of subjectNames) {
        const [subject] = await models.Subject.findOrCreate({
          where: { schoolId, name: subjectName },
          defaults: {
            schoolId,
            name: subjectName,
            createdBy,
            sigeSubjectCode: defaultSigeSubjectCode(subjectName) || null,
          },
          transaction,
        });
        if (!subject.sigeSubjectCode) {
          const suggested = defaultSigeSubjectCode(subjectName);
          if (suggested) await subject.update({ sigeSubjectCode: suggested }, { transaction });
        }
        subjectIds.add(subject.id);

        for (const courseSection of selectedSections) {
          const [, created] = await models.Course.findOrCreate({
            where: {
              schoolId,
              name: level.name,
              section: courseSection,
              subject: subject.name,
            },
            defaults: {
              schoolId,
              campusId: campus.id,
              academicYearId: academicYear.id,
              subjectId: subject.id,
              name: level.name,
              section: courseSection,
              subject: subject.name,
              teacher: null,
              color: '#0067b2',
              monthlyFee: 0,
              createdBy,
            },
            transaction,
          });
          if (created) courseCount += 1;
        }
      }
    }

    return {
      levels: selectedLevels.length,
      courses: courseCount,
      subjects: subjectIds.size,
      academicYear: academicYear.name,
      sections: selectedSections,
      section: selectedSections[0],
    };
  });
}
