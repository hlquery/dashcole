/** Cargos base del colegio chileno. hierarchy: 1 = más alto en la organización. */
export const DEFAULT_JOB_TITLES = [
  { name: 'Director/a', hierarchy: 1 },
  { name: 'Inspector/a general', hierarchy: 2 },
  { name: 'Jefe/a de UTP', hierarchy: 3 },
  { name: 'Encargado/a de convivencia', hierarchy: 4 },
  { name: 'Profesor/a jefe', hierarchy: 5 },
  { name: 'Profesor/a', hierarchy: 6 },
  { name: 'Asistente de la educación', hierarchy: 7 },
  { name: 'Administrativo/a', hierarchy: 8 },
  { name: 'Contador/a', hierarchy: 9 },
  { name: 'Auxiliar', hierarchy: 10 },
];

const DEFAULT_HIERARCHY_BY_NAME = new Map(
  DEFAULT_JOB_TITLES.map((row) => [row.name.toLocaleLowerCase('es'), row.hierarchy]),
);

export function defaultHierarchyForJobTitle(name) {
  return DEFAULT_HIERARCHY_BY_NAME.get(String(name || '').trim().toLocaleLowerCase('es')) ?? null;
}

export async function ensureDefaultJobTitles(JobTitle, schoolId, createdBy = null) {
  for (const entry of DEFAULT_JOB_TITLES) {
    const [row] = await JobTitle.findOrCreate({
      where: { schoolId, name: entry.name },
      defaults: {
        active: true,
        hierarchy: entry.hierarchy,
        ...(createdBy ? { createdBy } : {}),
      },
    });
    const updates = {};
    if (!row.active) updates.active = true;
    if ((row.hierarchy == null || row.hierarchy === '') && entry.hierarchy != null) {
      updates.hierarchy = entry.hierarchy;
    }
    if (Object.keys(updates).length) await row.update(updates);
  }
}

/** Completa jerarquía solo en cargos conocidos sin valor (no pisa lo que el colegio ya definió). */
export async function backfillDefaultJobTitleHierarchies(JobTitle, schoolId) {
  const rows = await JobTitle.findAll({
    where: { schoolId, active: true, hierarchy: null },
  });
  for (const row of rows) {
    const hierarchy = defaultHierarchyForJobTitle(row.name);
    if (hierarchy != null) await row.update({ hierarchy });
  }
}
