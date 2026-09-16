import { ApiError } from './http.js';
import { isPositiveId } from '../../shared/validation.js';
export * from '../../shared/validation.js';
export function pagination(query, sorts, defaultSort = sorts[0]) {
  const page = query.page ?? '1', pageSize = query.pageSize ?? '25';
  const sort = query.sort ?? defaultSort, order = String(query.order ?? 'asc').toLowerCase();
  if (!isPositiveId(page) || !isPositiveId(pageSize) || Number(pageSize) > 100 || !sorts.includes(sort) || !['asc', 'desc'].includes(order) || !Number.isSafeInteger((Number(page) - 1) * Number(pageSize))) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Paginación u orden inválido.');
  }
  return { page: Number(page), pageSize: Number(pageSize), offset: (Number(page) - 1) * Number(pageSize), sort, order };
}
