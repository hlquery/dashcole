import { pagination } from '../validation.js';

// Only SQL assembled by the server reaches this helper; sort names are allowlisted.
export async function listQuery(pool, sql, params, query, sorts) {
  if (query.page === undefined && query.pageSize === undefined && query.sort === undefined && query.order === undefined) {
    const [rows] = await pool.query(sql, params); return rows;
  }
  const page = pagination(query, Object.keys(sorts));
  const base = sql.replace(/\s+ORDER BY[\s\S]*$/i, '');
  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM (${base}) listed`, params);
  const [data] = await pool.query(`${base} ORDER BY ${sorts[page.sort]} ${page.order.toUpperCase()}, id ASC LIMIT ? OFFSET ?`, [...params, page.pageSize, page.offset]);
  return { data, meta: { page: page.page, pageSize: page.pageSize, total: Number(count.total), totalPages: Math.ceil(Number(count.total) / page.pageSize), sort: page.sort, order: page.order } };
}
