import { models } from './database.js';
import { canAccessCourse } from './academics.js';
import { ApiError } from './http.js';
import { isValidDate } from './validation.js';

const editable = user => ['teacher', 'manager', 'director', 'school_admin', 'super_admin', 'utp'].includes(user.role) || user.permissions?.manageSchool;
const reviewable = user => ['director', 'school_admin', 'super_admin', 'utp', 'manager'].includes(user.role) || user.permissions?.manageSchool;

function normalize(body) {
  const value = {
    title: String(body.title || '').trim(),
    unitType: String(body.unitType || 'regular'),
    objectives: Array.isArray(body.objectives) ? body.objectives.map(value => String(value).trim()).filter(Boolean) : [],
    activities: Array.isArray(body.activities) ? body.activities.map(value => String(value).trim()).filter(Boolean) : [],
    adaptations: String(body.adaptations || '').trim() || null,
    status: String(body.status || 'draft'),
    startsOn: body.startsOn || null,
    endsOn: body.endsOn || null,
  };
  if (value.title.length < 3 || value.title.length > 180 || !['regular', 'diagnostic'].includes(value.unitType) || !value.objectives.length || value.objectives.length > 100 || value.activities.length > 100 || value.objectives.some(item => item.length > 500) || value.activities.some(item => item.length > 1000) || (value.adaptations?.length || 0) > 10000) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa título, objetivos, actividades y adecuaciones.');
  if ((value.startsOn && !isValidDate(value.startsOn)) || (value.endsOn && (!isValidDate(value.endsOn) || value.endsOn < value.startsOn))) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa las fechas de la unidad.');
  if (!['draft', 'review', 'approved'].includes(value.status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado de planificación inválido.');
  return value;
}

async function academicYearForCourse(schoolId, course) {
  let academicYear = null;
  if (course?.academicYearId) {
    academicYear = await models.AcademicYear.findOne({
      where: { id: course.academicYearId, schoolId },
      attributes: ['id', 'name', 'startsOn', 'endsOn', 'active'],
      raw: true,
    });
  }
  if (!academicYear) {
    academicYear = await models.AcademicYear.findOne({
      where: { schoolId, active: true },
      order: [['startsOn', 'DESC']],
      attributes: ['id', 'name', 'startsOn', 'endsOn', 'active'],
      raw: true,
    });
  }
  return academicYear;
}

async function serializeUnits(schoolId, units) {
  const unitIds = units.map((unit) => unit.id);
  const comments = unitIds.length
    ? await models.PlanningComment.findAll({ where: { schoolId, unitId: unitIds }, order: [['created_at', 'ASC']] })
    : [];
  const authorIds = [...new Set(units.map((unit) => unit.createdBy).filter(Boolean))];
  const authors = authorIds.length
    ? await models.User.findAll({ where: { schoolId, id: authorIds }, attributes: ['id', 'fullName'], raw: true })
    : [];
  const authorNames = new Map(authors.map((row) => [row.id, row.fullName]));
  return units.map((unit) => ({
    ...unit.toJSON(),
    authorName: authorNames.get(unit.createdBy) || 'Docente',
    comments: comments.filter((comment) => comment.unitId === unit.id),
  }));
}

export function registerPlanningRoutes(app) {
  app.get('/api/planning/pending', async (req, res) => {
    if (!reviewable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o administración pueden ver planificaciones pendientes.');
    const units = await models.PlanningUnit.findAll({
      where: { schoolId: req.user.schoolId, status: 'review' },
      order: [['updated_at', 'DESC'], ['id', 'DESC']],
    });
    const courseIds = [...new Set(units.map((unit) => unit.courseId))];
    const courses = courseIds.length
      ? await models.Course.findAll({
        where: { schoolId: req.user.schoolId, id: courseIds },
        attributes: ['id', 'name', 'section', 'subject', 'teacher'],
        raw: true,
      })
      : [];
    const courseMap = new Map(courses.map((row) => [row.id, row]));
    const rows = await serializeUnits(req.user.schoolId, units);
    res.json({
      units: rows.map((unit) => {
        const course = courseMap.get(unit.courseId);
        return {
          ...unit,
          courseName: course?.name || '',
          courseSection: course?.section || '',
          courseSubject: course?.subject || '',
          courseTeacher: course?.teacher || '',
        };
      }),
      canReview: true,
    });
  });

  app.get('/api/planning/units', async (req, res) => {
    const courseId = Number(req.query.courseId);
    if (!Number.isSafeInteger(courseId) || !await canAccessCourse(req.user, courseId)) throw new ApiError(403, 'FORBIDDEN', 'No tienes acceso a esa asignatura.');
    const course = await models.Course.findOne({
      where: { id: courseId, schoolId: req.user.schoolId },
      attributes: ['id', 'academicYearId'],
      raw: true,
    });
    const academicYear = await academicYearForCourse(req.user.schoolId, course);
    const units = await models.PlanningUnit.findAll({ where: { schoolId: req.user.schoolId, courseId }, order: [['startsOn', 'ASC'], ['id', 'ASC']] });
    res.json({
      units: await serializeUnits(req.user.schoolId, units),
      academicYear: academicYear || null,
      canEdit: editable(req.user),
      canReview: reviewable(req.user),
    });
  });

  app.post('/api/planning/units', async (req, res) => {
    const courseId = Number(req.body.courseId);
    if (!editable(req.user) || !Number.isSafeInteger(courseId) || !await canAccessCourse(req.user, courseId)) throw new ApiError(403, 'FORBIDDEN', 'No puedes planificar esa asignatura.');
    const value = normalize(req.body);
    if (value.status === 'approved' && !reviewable(req.user)) value.status = 'review';
    const unit = await models.PlanningUnit.create({ ...value, schoolId: req.user.schoolId, courseId, createdBy: req.user.id });
    res.status(201).json({ unit });
  });

  app.put('/api/planning/units/:id', async (req, res) => {
    if (!editable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes modificar planificaciones.');
    const unit = await models.PlanningUnit.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!unit || !await canAccessCourse(req.user, unit.courseId)) throw new ApiError(404, 'NOT_FOUND', 'Planificación no encontrada.');
    const value = normalize(req.body);
    if (value.status === 'approved' && !reviewable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o dirección puede aprobar.');
    await unit.update(value);
    res.json({ unit });
  });

  app.post('/api/planning/units/:id/status', async (req, res) => {
    const unit = await models.PlanningUnit.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!unit || !await canAccessCourse(req.user, unit.courseId)) throw new ApiError(404, 'NOT_FOUND', 'Planificación no encontrada.');
    const status = String(req.body.status || '').trim();
    if (!['draft', 'review', 'approved'].includes(status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado de planificación inválido.');

    if (status === 'approved') {
      if (!reviewable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o administración pueden aprobar.');
    } else if (status === 'draft') {
      // Teacher can withdraw from review; reviewer can return to draft.
      if (!editable(req.user) && !reviewable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes cambiar el estado.');
      if (!reviewable(req.user) && unit.createdBy !== req.user.id && unit.status === 'approved') {
        throw new ApiError(403, 'FORBIDDEN', 'Solo UTP o administración pueden deshacer una aprobación.');
      }
    } else if (status === 'review') {
      if (!editable(req.user)) throw new ApiError(403, 'FORBIDDEN', 'No puedes enviar a revisión.');
    }

    await unit.update({ status });
    res.json({ unit });
  });

  app.post('/api/planning/units/:id/comments', async (req, res) => {
    const unit = await models.PlanningUnit.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    const body = String(req.body.body || '').trim();
    if (!unit || !await canAccessCourse(req.user, unit.courseId)) throw new ApiError(404, 'NOT_FOUND', 'Planificación no encontrada.');
    if (body.length < 2 || body.length > 2000) throw new ApiError(400, 'VALIDATION_ERROR', 'El comentario debe tener entre 2 y 2000 caracteres.');
    const comment = await models.PlanningComment.create({ schoolId: req.user.schoolId, unitId: unit.id, body, createdBy: req.user.id });
    res.status(201).json({ comment });
  });
}
