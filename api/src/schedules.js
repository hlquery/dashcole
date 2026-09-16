import { models, sequelize } from './database.js';
import { canAccessCourse } from './academics.js';
import { ApiError } from './http.js';
const canEdit = user => user.role === 'teacher' || user.role === 'utp' || user.permissions?.manageSchool || user.permissions?.manageUsers || user.role === 'manager';
export function registerScheduleRoutes(app) {
  app.get('/api/schedules', async (req,res) => {
    if (['finance','agente_finanzas','warehouse'].includes(req.user.role)) return res.status(403).json({message:'No tienes acceso a horarios académicos.'});
    const courses = await models.Course.findAll({ where:{schoolId:req.user.schoolId}, order:[['name','ASC'],['subject','ASC']] });
    const visible = [];
    for (const course of courses) if (await canAccessCourse(req.user,course.id)) visible.push(course);
    const slots = await models.CourseSchedule.findAll({ where:{schoolId:req.user.schoolId,courseId:visible.map(c => c.id)},order:[['day','ASC'],['startsAt','ASC']] });
    res.json({courses:visible,slots,canEdit:Boolean(canEdit(req.user))});
  });
  app.put('/api/courses/:id/schedule', async (req,res) => {
    if (!canEdit(req.user) || !await canAccessCourse(req.user,Number(req.params.id))) return res.status(403).json({message:'Solo el profesor asignado o administración pueden modificar el horario.'});
    if (!Array.isArray(req.body.slots) || req.body.slots.length > 50) throw new ApiError(400,'VALIDATION_ERROR','Horario inválido.');
    const slots = req.body.slots.map(slot => {
      const day = Number(slot.day), startsAt = String(slot.startsAt || '').slice(0,5), endsAt = String(slot.endsAt || '').slice(0,5), room = String(slot.room || '').trim();
      if (!Number.isInteger(day) || day < 1 || day > 7 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startsAt) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endsAt) || startsAt >= endsAt || room.length > 80) throw new ApiError(400,'VALIDATION_ERROR','Revisa día, hora de inicio, término y sala.');
      return {day,startsAt,endsAt,room};
    });
    await sequelize.transaction(async transaction => {
      await models.School.findByPk(req.user.schoolId,{transaction,lock:transaction.LOCK.UPDATE});
      const course = await models.Course.findOne({where:{id:req.params.id,schoolId:req.user.schoolId},transaction});
      const allCourses = await models.Course.findAll({where:{schoolId:req.user.schoolId},transaction});
      const conflicting = allCourses.filter(c => c.id !== course.id && ((c.name === course.name && c.section === course.section && c.academicYearId === course.academicYearId) || course.teacher && c.teacher === course.teacher && c.academicYearId === course.academicYearId));
      const existing = await models.CourseSchedule.findAll({where:{schoolId:req.user.schoolId,courseId:conflicting.map(c => c.id)},transaction});
      for (let i = 0; i < slots.length; i++) {
        const a = slots[i];
        if ([...slots.slice(i+1),...existing].some(b => b.day === a.day && a.startsAt < b.endsAt && a.endsAt > b.startsAt)) throw new ApiError(409,'SCHEDULE_CONFLICT','El curso o profesor ya tiene una clase en ese horario.');
      }
      await models.CourseSchedule.destroy({where:{schoolId:req.user.schoolId,courseId:course.id},transaction});
      await models.CourseSchedule.bulkCreate(slots.map(s => ({...s,schoolId:req.user.schoolId,courseId:course.id,createdBy:req.user.id})),{transaction});
    });
    res.json({saved:true});
  });
}
