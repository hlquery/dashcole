import { getSchoolContext } from './school-context.js';
import { Op } from 'sequelize';
import { models } from './database.js';

export function canManageDocuments(user) {
  return !['teacher', 'student', 'guardian'].includes(user.role)
    && (user.permissions?.manageUsers || user.permissions?.manageSchool || user.permissions?.manageHr || user.permissions?.manageFinance || ['director', 'finance', 'agente_finanzas'].includes(user.role));
}

export async function documentScope(user) {
  const where = getSchoolContext(user);
  if (['finance', 'agente_finanzas'].includes(user.role)) return { ...where, employeeId: { [Op.ne]: null } };
  if (user.role === 'monitor') return where;
  if (canManageDocuments(user)) return where;
  if (user.role === 'teacher') {
    const courses = await models.Course.findAll({ where: { schoolId: user.schoolId, teacher: user.fullName }, attributes: ['id'], raw: true });
    const enrollments = await models.Enrollment.findAll({ where: { schoolId: user.schoolId, courseId: courses.map(c => c.id) }, attributes: ['studentId'], raw: true });
    return { ...where, employeeId: null, userId: null, studentId: { [Op.in]: enrollments.map(e => e.studentId) } };
  }
  return { ...where, id: -1 };
}
