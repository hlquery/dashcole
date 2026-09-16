import { ApiError } from './http.js';

export function getSchoolContext(userOrRequest) {
  const user = userOrRequest?.user || userOrRequest;
  if (!user?.id) throw new ApiError(401, 'UNAUTHENTICATED', 'Debes iniciar sesión.');
  const schoolId = Number(user.schoolId);
  if (!Number.isSafeInteger(schoolId) || schoolId < 1) throw new ApiError(403, 'SCHOOL_REQUIRED', 'La sesión no tiene un colegio válido.');
  return { schoolId };
}
export function requirePermission(permission) {
  return (req, _res, next) => {
    getSchoolContext(req);
    if (!req.user.permissions?.[permission]) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.');
    next();
  };
}
export async function assertOwnedBySchool(model, id, userOrRequest, options = {}) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Identificador inválido.');
  const record = await model.findOne({ ...options, where: { ...options.where, id: numericId, ...getSchoolContext(userOrRequest) } });
  if (!record) throw new ApiError(404, 'NOT_FOUND', 'Registro no encontrado.');
  return record;
}
