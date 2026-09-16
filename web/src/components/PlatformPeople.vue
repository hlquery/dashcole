<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Building2, Search, Users, X } from '@lucide/vue';
import { request } from '../api/client.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const emit = defineEmits(['navigate']);
const query = ref('');
const schoolId = ref('');
const schoolQuery = ref('');
const schoolOpen = ref(false);
const schoolHighlight = ref(0);
const tenants = ref([]);
const people = ref([]);
const searching = ref(false);
const browsing = ref(false);
const loadingTenants = ref(true);
const error = ref('');
const searchError = ref('');
let timer;

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const selectedSchool = computed(() => tenants.value.find((row) => String(row.id) === String(schoolId.value)) || null);

const {
  page: peoplePage,
  pageCount: peoplePageCount,
  paged: pagedPeople,
  rangeLabel: peopleRangeLabel,
  show: showPeoplePagination,
  goPrev: peoplePrev,
  goNext: peopleNext,
} = useClientPagination(people, { pageSize: 15, resetOn: [query, schoolId, browsing] });

const schoolOptions = computed(() => {
  const q = normalize(schoolQuery.value);
  const rows = tenants.value.filter((tenant) => {
    if (!q) return true;
    return normalize([tenant.name, tenant.id, tenant.slug].join(' ')).includes(q);
  });
  return rows.slice(0, 12);
});

async function loadTenants() {
  loadingTenants.value = true;
  error.value = '';
  try {
    tenants.value = await request('/platform/tenants');
  } catch (cause) {
    error.value = cause.message;
    tenants.value = [];
  } finally {
    loadingTenants.value = false;
  }
}

async function searchPeople() {
  const q = query.value.trim();
  if (q.length < 2) {
    if (!browsing.value) {
      people.value = [];
      searching.value = false;
      searchError.value = '';
    }
    return;
  }
  browsing.value = false;
  searching.value = true;
  searchError.value = '';
  try {
    const params = new URLSearchParams({ limit: '20', q });
    if (schoolId.value) params.set('schoolId', schoolId.value);
    const data = await request(`/platform/people?${params}`);
    people.value = data.rows || [];
  } catch (cause) {
    searchError.value = cause.message;
    people.value = [];
  } finally {
    searching.value = false;
  }
}

async function browseAll() {
  clearTimeout(timer);
  browsing.value = true;
  if (query.value) query.value = '';
  searching.value = true;
  searchError.value = '';
  try {
    const params = new URLSearchParams({ limit: '50', browse: '1' });
    if (schoolId.value) params.set('schoolId', schoolId.value);
    const data = await request(`/platform/people?${params}`);
    if (!browsing.value) return;
    people.value = data.rows || [];
  } catch (cause) {
    if (!browsing.value) return;
    searchError.value = cause.message;
    people.value = [];
  } finally {
    searching.value = false;
  }
}

function openPerson(person) {
  const id = Number(person?.globalUserId);
  if (!Number.isSafeInteger(id) || id < 1) return;
  window.history.pushState({ view: 'Cuentas', accountId: id }, '', `/plataforma/cuentas/${id}`);
  emit('navigate', 'Cuentas');
}

function openSchoolPicker() {
  if (loadingTenants.value) return;
  schoolOpen.value = true;
  schoolHighlight.value = 0;
  if (selectedSchool.value) schoolQuery.value = '';
}

function closeSchoolPicker() {
  schoolOpen.value = false;
  schoolQuery.value = '';
  schoolHighlight.value = 0;
}

function pickSchool(tenant = null) {
  schoolId.value = tenant?.id ? String(tenant.id) : '';
  closeSchoolPicker();
}

function clearSchool() {
  schoolId.value = '';
  schoolQuery.value = '';
  schoolOpen.value = false;
}

function onSchoolKeydown(event) {
  if (!schoolOpen.value && ['ArrowDown', 'Enter'].includes(event.key)) {
    openSchoolPicker();
    return;
  }
  if (!schoolOpen.value) return;
  const total = schoolOptions.value.length + 1;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    schoolHighlight.value = (schoolHighlight.value + 1) % total;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    schoolHighlight.value = (schoolHighlight.value - 1 + total) % total;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (schoolHighlight.value === 0) pickSchool(null);
    else pickSchool(schoolOptions.value[schoolHighlight.value - 1] || null);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeSchoolPicker();
  }
}

watch([query, schoolId], () => {
  clearTimeout(timer);
  if (query.value.trim().length >= 2) {
    browsing.value = false;
    timer = setTimeout(searchPeople, 220);
    return;
  }
  if (browsing.value) {
    timer = setTimeout(() => { browseAll(); }, 220);
    return;
  }
  people.value = [];
  searching.value = false;
  searchError.value = '';
});

onMounted(loadTenants);
</script>

<template>
  <section class="platform-people">
    <header class="people-page-header">
      <div>
        <p class="eyebrow">PLATAFORMA</p>
        <h2>Buscar persona</h2>
        <p>Encuentra a alguien por nombre, correo o RUT. Puedes filtrar por colegio con el buscador.</p>
      </div>
      <button type="button" class="secondary-button" @click="emit('navigate', 'Cuentas')">
        <Users :size="16" />Ir a cuentas de acceso
      </button>
    </header>

    <p v-if="error" class="login-error" role="alert">{{ error }}</p>

    <div class="panel-with-pager">
    <article class="panel people-search">
      <div class="people-search-row">
        <div class="field school-picker">
          <span>Colegio</span>
          <div class="school-picker-control" :class="{ open: schoolOpen }">
            <div v-if="selectedSchool && !schoolOpen" class="school-picker-chip">
              <button
                type="button"
                class="school-picker-chip-main"
                :disabled="loadingTenants"
                @click="openSchoolPicker"
              >
                <Building2 :size="15" />
                <span>
                  <strong>{{ selectedSchool.name }}</strong>
                  <small>Colegio #{{ selectedSchool.id }}</small>
                </span>
              </button>
              <button
                type="button"
                class="school-picker-clear"
                aria-label="Quitar filtro de colegio"
                :disabled="loadingTenants"
                @click="clearSchool"
              >
                <X :size="14" />
              </button>
            </div>
            <label v-else class="school-picker-input">
              <Search :size="16" aria-hidden="true" />
              <input
                v-model.trim="schoolQuery"
                type="search"
                :placeholder="loadingTenants ? 'Cargando colegios…' : 'Buscar colegio por nombre o ID'"
                :disabled="loadingTenants"
                autocomplete="off"
                aria-autocomplete="list"
                :aria-expanded="schoolOpen"
                @focus="openSchoolPicker"
                @input="schoolOpen = true; schoolHighlight = 0"
                @keydown="onSchoolKeydown"
                @blur="closeSchoolPicker"
              />
              <button
                v-if="schoolQuery"
                type="button"
                class="school-picker-clear-inline"
                aria-label="Limpiar"
                @mousedown.prevent="schoolQuery = ''"
              >
                <X :size="14" />
              </button>
            </label>

            <div v-if="schoolOpen && !loadingTenants" class="school-picker-menu" role="listbox">
              <button
                type="button"
                class="school-picker-option"
                role="option"
                :class="{ active: schoolHighlight === 0, selected: !schoolId }"
                @mousedown.prevent="pickSchool(null)"
              >
                <Building2 :size="15" />
                <span>
                  <strong>Todos los colegios</strong>
                  <small>Sin filtrar por establecimiento</small>
                </span>
              </button>
              <button
                v-for="(tenant, index) in schoolOptions"
                :key="tenant.id"
                type="button"
                class="school-picker-option"
                role="option"
                :class="{ active: schoolHighlight === index + 1, selected: String(schoolId) === String(tenant.id) }"
                @mousedown.prevent="pickSchool(tenant)"
              >
                <span class="school-avatar">{{ String(tenant.name || '?').slice(0, 1).toUpperCase() }}</span>
                <span>
                  <strong>{{ tenant.name }}</strong>
                  <small>Colegio #{{ tenant.id }}</small>
                </span>
              </button>
              <p v-if="!schoolOptions.length" class="school-picker-empty">Sin colegios para “{{ schoolQuery }}”.</p>
            </div>
          </div>
        </div>

        <label class="field wide">
          <span>Persona</span>
          <div class="people-search-input-row">
            <div class="people-input-wrap">
              <Search :size="16" />
              <input v-model.trim="query" type="search" placeholder="Nombre, correo o RUT" />
            </div>
            <button type="button" class="primary-button" :disabled="searching" @click="browseAll">
              {{ searching && browsing ? 'Cargando…' : 'Ver todas' }}
            </button>
          </div>
        </label>
      </div>

      <p v-if="searchError" class="login-error" role="alert">{{ searchError }}</p>
      <p v-else-if="searching" class="people-hint">{{ browsing ? 'Cargando personas…' : 'Buscando…' }}</p>
      <p v-else-if="!browsing && query.trim().length < 2" class="people-hint">Escribe al menos 2 caracteres o pulsa Ver todas.</p>
      <div v-else-if="people.length" class="people-results">
        <p v-if="browsing" class="people-browse-note">
          Mostrando {{ people.length }} personas{{ selectedSchool ? ` de ${selectedSchool.name}` : '' }}.
        </p>
        <div class="table-scroll people-table">
          <table>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Rol</th>
                <th>Colegio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in pagedPeople"
                :key="person.key"
                class="people-table-row"
                tabindex="0"
                role="link"
                :aria-label="`Abrir ficha de ${person.fullName}`"
                @click="openPerson(person)"
                @keydown.enter.prevent="openPerson(person)"
                @keydown.space.prevent="openPerson(person)"
              >
                <td>
                  <div class="people-person">
                    <span class="people-avatar" aria-hidden="true">{{ String(person.fullName || '?').split(' ').filter(Boolean).map(v => v[0]).slice(0, 2).join('').toUpperCase() }}</span>
                    <span>
                      <strong>{{ person.fullName }}</strong>
                      <small>{{ person.email || 'Sin correo' }}</small>
                    </span>
                  </div>
                </td>
                <td><span class="people-chip">{{ person.rolesLabel || 'Sin rol' }}</span></td>
                <td>{{ person.schoolsLabel || 'Sin colegio' }}</td>
                <td class="people-open-cell">Abrir →</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-else class="people-hint">Sin resultados para ese criterio.</p>
    </article>
      <TablePagination
        v-model:page="peoplePage"
        :page-count="peoplePageCount"
        :range-label="peopleRangeLabel"
        :show="showPeoplePagination"
      />
    </div>
  </section>
</template>

<style scoped>
.platform-people { display: grid; gap: 16px; }
.people-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.people-page-header .eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary, #0067b2);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
}
.people-page-header h2 { margin: 0 0 6px; font-size: 22px; letter-spacing: -.02em; }
.people-page-header p { margin: 0; color: #607184; max-width: 54ch; }
.people-page-header .secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.people-search { padding: 20px; display: grid; gap: 14px; }
.people-search-row {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  align-items: start;
}
.people-search-row .field { margin: 0; max-width: none; width: 100%; display: grid; gap: 6px; }
.people-search-row .field > span { color: #607184; font-size: 12px; font-weight: 700; }
.people-search-row .field.wide { min-width: 0; }
.school-picker { position: relative; z-index: 3; }
.school-picker-control { position: relative; }
.school-picker-input,
.school-picker-chip {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 10px;
  background: #fff;
  text-align: left;
  color: inherit;
}
.school-picker-chip {
  padding-right: 6px;
}
.school-picker-chip-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  padding: 0;
  background: transparent;
  text-align: left;
  color: inherit;
  cursor: pointer;
}
.school-picker-control.open .school-picker-input {
  border-color: color-mix(in srgb, var(--color-primary, #0067b2) 45%, #dfe7ee);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #0067b2) 12%, transparent);
}
.school-picker-input > svg { color: #607184; flex: 0 0 auto; }
.school-picker-input input {
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
}
.school-picker-chip {
  cursor: default;
}
.school-picker-chip strong,
.school-picker-option strong {
  display: block;
  color: #0a2540;
  font-size: 13px;
}
.school-picker-chip small,
.school-picker-option small {
  display: block;
  color: #607184;
  font-size: 11px;
}
.school-picker-clear,
.school-picker-clear-inline {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #607184;
  background: #eef3f7;
  cursor: pointer;
  flex: 0 0 auto;
}
.school-picker-clear:hover,
.school-picker-clear-inline:hover { color: #0a2540; }
.school-picker-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 320px;
  overflow: auto;
  padding: 6px;
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 40px color-mix(in srgb, #0f172a 16%, transparent);
  display: grid;
  gap: 4px;
}
.school-picker-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
}
.school-picker-option:hover,
.school-picker-option.active { background: #f5f9fc; }
.school-picker-option.selected { background: #eef7fd; }
.school-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #e8f2fa;
  color: #0067b2;
  font-size: 12px;
  font-weight: 800;
  flex: 0 0 auto;
}
.school-picker-empty {
  margin: 0;
  padding: 12px;
  color: #607184;
  font-size: 13px;
  text-align: center;
}
.people-search-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
.people-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.people-input-wrap > svg {
  position: absolute;
  left: 12px;
  color: #607184;
  pointer-events: none;
}
.people-input-wrap input {
  width: 100%;
  min-height: 42px;
  padding-left: 38px;
}
.people-search-input-row .primary-button {
  height: 42px;
  white-space: nowrap;
  padding: 0 16px;
}
.people-hint { margin: 0; color: #607184; font-size: 13px; }
.people-browse-note {
  margin: 0 0 10px;
  color: #607184;
  font-size: 12px;
  font-weight: 650;
}
.people-results { display: grid; gap: 10px; }
.people-table {
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 12px;
  overflow: auto;
  background: #fff;
}
.people-table table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}
.people-table th,
.people-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #e8edf2;
  text-align: left;
  vertical-align: middle;
}
.people-table th {
  color: #607184;
  background: #f7fafc;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.people-table tr:last-child td { border-bottom: 0; }
.people-table-row {
  cursor: pointer;
  transition: background .15s ease;
}
.people-table-row:hover,
.people-table-row:focus-visible {
  background: #f5f9fc;
  outline: none;
}
.people-person {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.people-avatar {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--color-primary, #0067b2);
  background: var(--color-primary-soft, #e8f3fb);
  font-size: 11px;
  font-weight: 800;
}
.people-person strong {
  display: block;
  color: #0a2540;
  font-size: 14px;
}
.people-person small {
  display: block;
  color: #607184;
  font-size: 12px;
}
.people-chip {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--color-primary, #0067b2);
  background: var(--color-primary-soft, #e8f3fb);
  font-size: 11px;
  font-weight: 750;
}
.people-open-cell {
  color: var(--color-primary, #0067b2);
  font-size: 12px;
  font-weight: 750;
  text-align: right;
  white-space: nowrap;
}
@media (max-width: 760px) {
  .people-search-row,
  .people-search-input-row { grid-template-columns: 1fr; }
}
</style>
