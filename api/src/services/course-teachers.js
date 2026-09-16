/** Parse/format helpers for multi teacher + head-teacher name lists stored in courses.teacher / head_teacher. */

export function parseTeacherNames(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => parseTeacherNames(item)))];
  }
  if (value && typeof value === 'object') {
    return parseTeacherNames(value.fullName || value.name || value.label || '');
  }
  return [...new Set(
    String(value || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  )];
}

export function formatTeacherNames(names) {
  const list = parseTeacherNames(names);
  return list.length ? list.join(', ') : null;
}

export function teacherListIncludes(haystack, name) {
  const needle = String(name || '').trim().toLocaleLowerCase('es');
  if (!needle) return false;
  return parseTeacherNames(haystack).some((part) => part.toLocaleLowerCase('es') === needle);
}

/** Accept teachers[] / headTeachers[] or legacy single teacher / headTeacher string. */
export function readTeacherNames(body = {}, { multiKeys = ['teachers'], singleKeys = ['teacher'] } = {}) {
  const raw = [];
  for (const key of multiKeys) {
    const value = body?.[key];
    if (Array.isArray(value)) raw.push(...value);
    else if (value != null && String(value).trim()) raw.push(value);
  }
  for (const key of singleKeys) {
    const value = body?.[key];
    if (value == null || value === '') continue;
    if (Array.isArray(value)) raw.push(...value);
    else raw.push(value);
  }
  return parseTeacherNames(raw);
}

/** SQL: name subquery matches exact column OR as a member of a comma-separated list. */
export function teacherNameInColumnSql(columnExpr, nameSql) {
  return `(
    LOWER(TRIM(${columnExpr})) = ${nameSql}
    OR FIND_IN_SET(
      ${nameSql},
      REPLACE(REPLACE(LOWER(TRIM(${columnExpr})), ', ', ','), ' ,', ',')
    ) > 0
  )`;
}

export function normalizeTeacherListForSql(columnAlias) {
  return `REPLACE(REPLACE(LOWER(TRIM(${columnAlias})), ', ', ','), ' ,', ',')`;
}
