<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, CreditCard, Eye, EyeOff, Plus, Search, X } from '@lucide/vue';
import { request } from '../api/client.js';
import { useNotify } from '../composables/notify.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({
  permissions: { type: Array, default: () => [] },
  mode: { type: String, default: 'list' },
});
const emit = defineEmits(['enter-school', 'go-list', 'go-create', 'open-account']);
const notify = useNotify();
const can = permission => props.permissions.includes(permission);
const tenants = ref([]);
const demoRequests = ref([]);
const selectedTenant = ref(null);
const tenantDetailLoadingId = ref(null);
const editingPlan = ref(null);
const busy = ref(false);
const error = ref('');
const message = ref('');
const schoolQuery = ref('');
const page = ref(1);
const pageSize = ref(25);
const sortBy = ref('name');
const sortDir = ref('ASC');
const sortOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'status', label: 'Estado' },
  { value: 'plan', label: 'Plan' },
  { value: 'students', label: 'Estudiantes' },
  { value: 'accounts', label: 'Cuentas' },
  { value: 'id', label: 'ID' },
];
const schoolSearchInput = ref(null);
const showOwnerPassword = ref(false);
const emptyTenantForm = () => ({
  name: '', slug: '', ownerName: '', ownerEmail: '', ownerPhone: '', demoRequestId: null,
  ownerPassword: '', ownerPasswordConfirm: '', generateOwnerPassword: false,
  createCourses: true,
  levels: ['prekinder', 'kinder', '1b', '2b', '3b', '4b', '5b', '6b', '7b', '8b', '1m', '2m', '3m', '4m'],
  courseSections: ['A'],
  customSection: '',
  plan: { code: 'free', status: 'active', freeStudentLimit: 10, baseMonthlyPrice: 0, perStudentPrice: 0, currency: 'CLP', customPricing: false },
});
const tenantForm = ref(emptyTenantForm());
const suggestedSections = ['A', 'B', 'C', 'D', 'E', 'F'];
const planCodes = [
  { value: 'demo', label: 'Demo' },
  { value: 'free', label: 'Gratis' },
  { value: 'per_student', label: 'Por estudiante' },
  { value: 'custom', label: 'Personalizado' },
];
const schoolLevelGroups = [
  {
    id: 'preescolar',
    label: 'Preescolar',
    levels: [
      { id: 'prekinder', name: 'Prekínder' },
      { id: 'kinder', name: 'Kínder' },
    ],
  },
  {
    id: 'basica',
    label: 'Educación básica',
    levels: [
      { id: '1b', name: '1° Básico' },
      { id: '2b', name: '2° Básico' },
      { id: '3b', name: '3° Básico' },
      { id: '4b', name: '4° Básico' },
      { id: '5b', name: '5° Básico' },
      { id: '6b', name: '6° Básico' },
      { id: '7b', name: '7° Básico' },
      { id: '8b', name: '8° Básico' },
    ],
  },
  {
    id: 'media',
    label: 'Educación media',
    levels: [
      { id: '1m', name: '1° Medio' },
      { id: '2m', name: '2° Medio' },
      { id: '3m', name: '3° Medio' },
      { id: '4m', name: '4° Medio' },
    ],
  },
];
const allSchoolLevelIds = schoolLevelGroups.flatMap((group) => group.levels.map((level) => level.id));
const selectedLevelCount = computed(() => tenantForm.value.levels.length);

const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = (value, currency = 'CLP') => new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const createMode = computed(() => props.mode === 'create');

function tenantMatches(tenant, q) {
  if (!q) return true;
  const haystack = normalize([tenant.name, tenant.slug, tenant.id, tenant.plan?.code].filter(Boolean).join(' '));
  return q.split(/\s+/).every(token => haystack.includes(token));
}

const filteredTenants = computed(() => {
  const q = normalize(schoolQuery.value);
  const rows = tenants.value.filter(tenant => tenantMatches(tenant, q));
  const dir = sortDir.value === 'DESC' ? -1 : 1;
  const key = sortBy.value;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    if (key === 'id' || key === 'students' || key === 'accounts') {
      cmp = Number(a[key] || 0) - Number(b[key] || 0);
    } else if (key === 'plan') {
      cmp = String(a.plan?.code || '').localeCompare(String(b.plan?.code || ''), 'es', { sensitivity: 'base' });
    } else if (key === 'status') {
      cmp = String(a.status || '').localeCompare(String(b.status || ''), 'es', { sensitivity: 'base' });
    } else {
      cmp = String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' });
    }
    if (cmp !== 0) return cmp * dir;
    return Number(a.id || 0) - Number(b.id || 0);
  });
});

function toggleSortDir() {
  sortDir.value = sortDir.value === 'ASC' ? 'DESC' : 'ASC';
}

function setSort(key) {
  if (!key) return;
  if (sortBy.value === key) {
    toggleSortDir();
    return;
  }
  sortBy.value = key;
  sortDir.value = key === 'name' || key === 'plan' || key === 'status' ? 'ASC' : 'DESC';
}

function sortHeaderClass(key) {
  if (sortBy.value !== key) return '';
  return sortDir.value === 'ASC' ? 'is-sorted asc' : 'is-sorted desc';
}
const pageCount = computed(() => Math.max(1, Math.ceil(filteredTenants.value.length / pageSize.value)));
const pagedTenants = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredTenants.value.slice(start, start + pageSize.value);
});
const rangeLabel = computed(() => {
  if (!filteredTenants.value.length) return '0 colegios';
  const from = (page.value - 1) * pageSize.value + 1;
  const to = Math.min(filteredTenants.value.length, page.value * pageSize.value);
  return `${from}–${to} de ${filteredTenants.value.length}`;
});

const detailPage = computed(() => Boolean(selectedTenant.value) && !editingPlan.value);
const planPage = computed(() => Boolean(editingPlan.value));
const pendingDemoRequests = computed(() => demoRequests.value.filter(item => item.status !== 'converted' && item.status !== 'closed'));

const tenantMemberships = computed(() => selectedTenant.value?.memberships || []);
const tenantStudentProfiles = computed(() => selectedTenant.value?.studentProfiles || []);
const tenantActivity = computed(() => selectedTenant.value?.activity || []);

const {
  page: membershipsPage,
  pageCount: membershipsPageCount,
  paged: pagedMemberships,
  rangeLabel: membershipsRangeLabel,
  show: showMembershipsPagination,
  goPrev: membershipsPrev,
  goNext: membershipsNext,
} = useClientPagination(tenantMemberships, { pageSize: 15, resetOn: [selectedTenant] });

const {
  page: studentsPage,
  pageCount: studentsPageCount,
  paged: pagedStudents,
  rangeLabel: studentsRangeLabel,
  show: showStudentsPagination,
  goPrev: studentsPrev,
  goNext: studentsNext,
} = useClientPagination(tenantStudentProfiles, { pageSize: 15, resetOn: [selectedTenant] });

const {
  page: activityPage,
  pageCount: activityPageCount,
  paged: pagedActivity,
  rangeLabel: activityRangeLabel,
  show: showActivityPagination,
  goPrev: activityPrev,
  goNext: activityNext,
} = useClientPagination(tenantActivity, { pageSize: 15, resetOn: [selectedTenant] });

function goToPage(next) {
  page.value = Math.min(pageCount.value, Math.max(1, Number(next) || 1));
}

function clearSchoolSearch() {
  schoolQuery.value = '';
  syncSearchQuery();
  nextTick(() => schoolSearchInput.value?.focus());
}

function syncSearchQuery() {
  if (typeof window === 'undefined') return;
  if (detailPage.value || planPage.value || createMode.value) return;
  const url = new URL(window.location.href);
  const q = schoolQuery.value.trim();
  if (q) url.searchParams.set('q', q);
  else url.searchParams.delete('q');
  const next = `${url.pathname}${url.search}`;
  if (`${window.location.pathname}${window.location.search}` !== next) {
    window.history.replaceState({ view: 'Colegios' }, '', next);
  }
}

watch(schoolQuery, () => {
  page.value = 1;
  syncSearchQuery();
});
watch([pageSize, sortBy, sortDir], () => {
  page.value = 1;
});
watch(filteredTenants, () => {
  if (page.value > pageCount.value) page.value = pageCount.value;
});

function detailPath(tenantId) {
  return `/plataforma/colegios/${tenantId}`;
}

function planPath(tenantId) {
  return `/plataforma/colegios/${tenantId}/plan`;
}

function planCodeLabel(code) {
  return planCodes.find(item => item.value === code)?.label || code || 'Sin plan';
}

function statusLabel(status) {
  return ({ active: 'Activo', suspended: 'Suspendido', trial: 'Prueba', past_due: 'Pago pendiente', moving: 'En movimiento' })[status] || status || 'Activo';
}

function planSummary(plan, estimated = null) {
  if (!plan) return 'Definir tarifa';
  if (plan.code === 'custom') return `Fijo ${money(plan.baseMonthlyPrice || 0, plan.currency)}/mes`;
  if (plan.code === 'free' || plan.code === 'demo') return 'Sin cobro';
  return `${plan.freeStudentLimit || 0} gratis · ${money(estimated ?? 0, plan.currency)}/mes`;
}

async function load() {
  try {
    const [tenantRows, leads] = await Promise.all([request('/platform/tenants'), request('/platform/demo-requests')]);
    tenants.value = tenantRows;
    demoRequests.value = leads;
    error.value = '';
  } catch (cause) {
    error.value = cause.message;
  }
}

function applyLead(lead = null) {
  tenantForm.value = {
    ...emptyTenantForm(),
    name: lead?.organization || '',
    slug: slugify(lead?.organization),
    ownerName: lead?.name || '',
    ownerEmail: lead?.email || '',
    ownerPhone: lead?.phone || '',
    demoRequestId: lead?.id || null,
  };
  showOwnerPassword.value = false;
  error.value = '';
  message.value = '';
}

function openCreate(lead = null) {
  if (lead) {
    try { sessionStorage.setItem('platform-tenant-lead', JSON.stringify(lead)); } catch { /* ignore */ }
  } else {
    try { sessionStorage.removeItem('platform-tenant-lead'); } catch { /* ignore */ }
  }
  emit('go-create');
}

function readPrefillLead() {
  try {
    const raw = sessionStorage.getItem('platform-tenant-lead');
    if (!raw) return null;
    sessionStorage.removeItem('platform-tenant-lead');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function selectAllSchoolLevels() {
  tenantForm.value.levels = [...allSchoolLevelIds];
  tenantForm.value.createCourses = true;
}

function clearSchoolLevels() {
  tenantForm.value.levels = [];
}

function toggleSchoolLevelGroup(group) {
  const ids = group.levels.map((level) => level.id);
  const allSelected = ids.every((id) => tenantForm.value.levels.includes(id));
  if (allSelected) {
    tenantForm.value.levels = tenantForm.value.levels.filter((id) => !ids.includes(id));
    return;
  }
  tenantForm.value.levels = [...new Set([...tenantForm.value.levels, ...ids])];
  tenantForm.value.createCourses = true;
}

function groupLevelSelectedCount(group) {
  return group.levels.filter((level) => tenantForm.value.levels.includes(level.id)).length;
}

function normalizeSectionToken(value) {
  return String(value || '').trim().slice(0, 10).toLocaleUpperCase('es');
}

function toggleCourseSection(section) {
  const token = normalizeSectionToken(section);
  if (!token) return;
  const current = tenantForm.value.courseSections || [];
  if (current.includes(token)) {
    if (current.length === 1) return;
    tenantForm.value.courseSections = current.filter((item) => item !== token);
    return;
  }
  tenantForm.value.courseSections = [...current, token];
}

function addCustomCourseSection() {
  const token = normalizeSectionToken(tenantForm.value.customSection);
  if (!token) return;
  if (!tenantForm.value.courseSections.includes(token)) {
    tenantForm.value.courseSections = [...tenantForm.value.courseSections, token];
  }
  tenantForm.value.customSection = '';
}

async function createTenant() {
  error.value = '';
  if (!tenantForm.value.generateOwnerPassword) {
    if (tenantForm.value.ownerPassword.length < 8) {
      error.value = 'La contraseña del administrador debe tener al menos 8 caracteres.';
      return;
    }
    if (tenantForm.value.ownerPassword !== tenantForm.value.ownerPasswordConfirm) {
      error.value = 'Las contraseñas del administrador no coinciden.';
      return;
    }
  }
  if (tenantForm.value.createCourses && !tenantForm.value.levels.length) {
    error.value = 'Selecciona al menos un nivel (Prekínder a 4° Medio) o desactiva la creación de cursos.';
    return;
  }
  if (tenantForm.value.createCourses && !tenantForm.value.courseSections.length) {
    error.value = 'Selecciona al menos una sección (A, B, C…) o agrega una personalizada.';
    return;
  }
  busy.value = true;
  try {
    const payload = {
      ...tenantForm.value,
      slug: slugify(tenantForm.value.name),
      ownerPassword: tenantForm.value.generateOwnerPassword ? '' : tenantForm.value.ownerPassword,
      levels: tenantForm.value.createCourses ? tenantForm.value.levels : [],
      courseSections: tenantForm.value.createCourses ? tenantForm.value.courseSections : [],
      courseSection: tenantForm.value.courseSections[0] || 'A',
      createCourses: Boolean(tenantForm.value.createCourses && tenantForm.value.levels.length),
    };
    delete payload.ownerPasswordConfirm;
    delete payload.customSection;
    const data = await request('/platform/tenants', { method: 'POST', body: JSON.stringify(payload) });
    await load();
    applyLead(null);
    const sectionsLabel = (data.courseBootstrap?.sections || tenantForm.value.courseSections || []).join(', ');
    const courseNote = data.courseBootstrap?.error
      ? ' El colegio se creó, pero no se pudieron armar los cursos automáticamente.'
      : (data.courseBootstrap?.courses
        ? ` Se crearon ${data.courseBootstrap.courses} asignaturas en ${data.courseBootstrap.levels} niveles · secciones ${sectionsLabel}.`
        : '');
    if (data.temporaryPassword) {
      notify(`Colegio creado. Clave temporal de ${data.owner.email}: ${data.temporaryPassword}.${courseNote}`);
    } else {
      notify(`Colegio creado. ${data.owner.email} ya puede ingresar.${courseNote}`);
    }
    emit('go-list');
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo crear el colegio.', 'error');
  } finally {
    busy.value = false;
  }
}

async function enterTenant(tenant) {
  if (tenant.status && tenant.status !== 'active') {
    error.value = 'Reactiva el colegio antes de entrar.';
    notify('Reactiva el colegio antes de entrar.', 'error');
    return;
  }
  emit('enter-school', tenant.id);
}

function openAccount(globalUserId) {
  const id = Number(globalUserId);
  if (!Number.isSafeInteger(id) || id < 1) return;
  emit('open-account', id);
}

function roleLabel(role) {
  return ({
    director: 'Director',
    school_admin: 'Admin colegio',
    manager: 'Equipo directivo',
    utp: 'Jefe de UTP',
    teacher: 'Profesor',
    inspector: 'Inspector',
    finance: 'Finanzas',
    agente_finanzas: 'Agente finanzas',
    warehouse: 'Bodega',
    guardian: 'Apoderado',
    student: 'Estudiante',
    super_admin: 'Super admin',
    monitor: 'Monitor',
  })[role] || role || '—';
}

function formatAgo(seconds) {
  const value = Number(seconds) || 0;
  if (value < 60) return `hace ${value}s`;
  if (value < 3600) return `hace ${Math.floor(value / 60)} min`;
  return `hace ${Math.floor(value / 3600)} h`;
}

async function openTenant(tenant) {
  if (!tenant?.id) return;
  tenantDetailLoadingId.value = tenant.id;
  busy.value = true;
  error.value = '';
  editingPlan.value = null;
  try {
    selectedTenant.value = await request(`/platform/tenants/${tenant.id}`);
    const path = detailPath(tenant.id);
    if (`${window.location.pathname}` !== path) {
      window.history.pushState({ view: 'Colegios', tenantId: tenant.id }, '', path);
    }
    await nextTick();
    document.getElementById('tenant-activity-page')?.focus?.();
  } catch (cause) {
    selectedTenant.value = null;
    error.value = cause.message || 'No se pudo cargar la actividad del colegio.';
  } finally {
    busy.value = false;
    tenantDetailLoadingId.value = null;
  }
}

function closeTenantDetail() {
  selectedTenant.value = null;
  tenantDetailLoadingId.value = null;
  if (/^\/plataforma\/colegios\/\d+\/?$/.test(window.location.pathname)) {
    const q = schoolQuery.value.trim();
    const path = q ? `/plataforma/colegios?q=${encodeURIComponent(q)}` : '/plataforma/colegios';
    window.history.pushState({ view: 'Colegios' }, '', path);
  }
}

function buildPlanForm(tenant) {
  const code = tenant.plan?.code || 'free';
  const normalized = planCodes.some(item => item.value === code) ? code : 'custom';
  return {
    tenant,
    code: normalized,
    status: ['active', 'trial', 'past_due'].includes(tenant.plan?.status) ? tenant.plan.status : 'active',
    freeStudentLimit: normalized === 'custom' ? 0 : Number(tenant.plan?.freeStudentLimit ?? 10),
    baseMonthlyPrice: Number(tenant.plan?.baseMonthlyPrice || 0),
    perStudentPrice: normalized === 'custom' ? 0 : Number(tenant.plan?.perStudentPrice || 0),
    currency: tenant.plan?.currency || 'CLP',
    customPricing: Boolean(tenant.plan?.customPricing) || normalized === 'custom',
    limits: tenant.plan?.limits || {},
  };
}

function openPlanPage(tenant) {
  selectedTenant.value = null;
  tenantDetailLoadingId.value = null;
  editingPlan.value = buildPlanForm(tenant);
  const path = planPath(tenant.id);
  if (`${window.location.pathname}` !== path) window.history.pushState({ view: 'Colegios', planTenantId: tenant.id }, '', path);
}

function closePlanPage() {
  editingPlan.value = null;
  message.value = '';
  if (!/^\/plataforma\/colegios\/?$/.test(window.location.pathname) || window.location.search) {
    window.history.pushState({ view: 'Colegios' }, '', '/plataforma/colegios');
  }
}

function selectPlanCode(target, code) {
  if (!target) return;
  target.code = code;
  onPlanCodeChange(target);
}

function onPlanCodeChange(target = editingPlan.value) {
  if (!target) return;
  if (target.code === 'custom') {
    target.perStudentPrice = 0;
    target.freeStudentLimit = 0;
    target.customPricing = true;
  } else if (target.code === 'free' || target.code === 'demo') {
    target.baseMonthlyPrice = 0;
    target.perStudentPrice = 0;
    target.customPricing = false;
  } else if (target.code === 'per_student') {
    target.customPricing = false;
    if (!target.freeStudentLimit) target.freeStudentLimit = 10;
  }
}

async function savePlan() {
  busy.value = true;
  error.value = '';
  try {
    await request(`/platform/tenants/${editingPlan.value.tenant.id}/plan`, {
      method: 'PUT',
      body: JSON.stringify(editingPlan.value),
    });
    notify('Plan actualizado.');
    await load();
    const refreshed = tenants.value.find(item => item.id === editingPlan.value.tenant.id);
    if (refreshed) editingPlan.value = buildPlanForm(refreshed);
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo actualizar el plan.', 'error');
  } finally {
    busy.value = false;
  }
}

async function setTenantStatus(tenant, status) {
  const label = status === 'suspended' ? 'suspender' : 'reactivar';
  if (!confirm(`¿Seguro que quieres ${label} ${tenant.name}? Los usuarios de ese colegio no podrán entrar hasta reactivarlo.`)) return;
  busy.value = true;
  error.value = '';
  try {
    await request(`/platform/tenants/${tenant.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    await load();
    if (selectedTenant.value?.tenant?.id === tenant.id) await openTenant({ id: tenant.id });
    notify(status === 'suspended' ? `${tenant.name} quedó suspendido.` : `${tenant.name} quedó activo.`);
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo cambiar el estado del colegio.', 'error');
  } finally {
    busy.value = false;
  }
}

async function syncFromLocation() {
  const planMatch = window.location.pathname.match(/^\/plataforma\/colegios\/(\d+)\/plan\/?$/);
  const detailMatch = !planMatch && window.location.pathname.match(/^\/plataforma\/colegios\/(\d+)\/?$/);
  if (!planMatch && !detailMatch) {
    if (editingPlan.value) editingPlan.value = null;
    if (selectedTenant.value) selectedTenant.value = null;
    return;
  }
  const tenantId = Number((planMatch || detailMatch)[1]);
  if (!tenants.value.length) await load();
  const tenant = tenants.value.find(item => Number(item.id) === tenantId);
  if (!tenant) {
    error.value = 'Colegio no encontrado.';
    if (planMatch) closePlanPage();
    else closeTenantDetail();
    return;
  }
  if (planMatch) {
    selectedTenant.value = null;
    editingPlan.value = buildPlanForm(tenant);
    return;
  }
  editingPlan.value = null;
  if (selectedTenant.value?.tenant?.id !== tenantId) await openTenant(tenant);
}

function onPopState() {
  syncFromLocation();
}

function onGlobalKeydown(event) {
  if (event.key === 'Escape' && selectedTenant.value && !editingPlan.value) {
    event.preventDefault();
    closeTenantDetail();
  }
}

function prepareCreateMode() {
  const lead = readPrefillLead();
  applyLead(lead);
  editingPlan.value = null;
  closeTenantDetail();
}

watch(() => props.mode, (mode) => {
  if (mode === 'create') prepareCreateMode();
}, { immediate: true });

onMounted(async () => {
  window.addEventListener('keydown', onGlobalKeydown);
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) schoolQuery.value = q;
  await load();
  if (createMode.value) {
    prepareCreateMode();
  } else {
    await syncFromLocation();
  }
  window.addEventListener('popstate', onPopState);
});

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState);
  window.removeEventListener('keydown', onGlobalKeydown);
});
</script>

<template>
  <section class="colegios-page">
    <template v-if="planPage">
      <div class="plan-page-toolbar">
        <button type="button" class="secondary-button" @click="closePlanPage"><ArrowLeft :size="16" />Volver a colegios</button>
      </div>
      <div class="module-intro">
        <span class="admin-icon"><CreditCard :size="21" /></span>
        <div>
          <h2>Plan de {{ editingPlan.tenant.name }}</h2>
          <p>Define cómo se cobra la suscripción de este colegio.</p>
        </div>
      </div>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <p v-else-if="message" class="success-message" role="status">{{ message }}</p>
      <form class="panel plan-page-form" @submit.prevent="savePlan">
        <div class="form-grid">
          <div class="field wide plan-picker-field">
            <span>Plan</span>
            <div class="plan-picker" role="radiogroup" aria-label="Tipo de plan">
              <button
                v-for="item in planCodes"
                :key="item.value"
                type="button"
                role="radio"
                class="plan-picker-option"
                :class="{ active: editingPlan.code === item.value }"
                :aria-checked="editingPlan.code === item.value"
                @click="selectPlanCode(editingPlan, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <label class="field"><span>Estado de facturación</span>
            <select v-model="editingPlan.status">
              <option value="active">Activo</option>
              <option value="trial">Prueba</option>
              <option value="past_due">Pago pendiente</option>
            </select>
          </label>
          <label v-if="editingPlan.code === 'per_student'" class="field">
            <span>Estudiantes incluidos gratis</span>
            <input v-model.number="editingPlan.freeStudentLimit" type="number" min="0" required />
          </label>
          <label v-if="editingPlan.code === 'custom' || editingPlan.code === 'per_student'" class="field">
            <span>{{ editingPlan.code === 'custom' ? 'Precio fijo mensual' : 'Tarifa base mensual' }}</span>
            <input v-model.number="editingPlan.baseMonthlyPrice" type="number" min="0" required />
          </label>
          <label v-if="editingPlan.code === 'per_student'" class="field">
            <span>Tarifa por estudiante adicional</span>
            <input v-model.number="editingPlan.perStudentPrice" type="number" min="0" required />
          </label>
          <label v-if="editingPlan.code !== 'free' && editingPlan.code !== 'demo'" class="field">
            <span>Moneda</span>
            <select v-model="editingPlan.currency"><option>CLP</option><option>USD</option></select>
          </label>
          <p v-if="editingPlan.code === 'custom'" class="plan-hint">Personalizado: un monto fijo por todo el colegio, sin cobro por estudiante.</p>
          <p v-else-if="editingPlan.code === 'per_student'" class="plan-hint">Por estudiante: base + cada alumno sobre el cupo gratuito.</p>
          <p v-else class="plan-hint">Demo y Gratis no generan cobro mensual.</p>
        </div>
        <div class="plan-page-actions">
          <button type="button" class="secondary-button" @click="closePlanPage">Cancelar</button>
          <button class="primary-button" :disabled="busy">{{ busy ? 'Guardando…' : 'Guardar plan' }}</button>
        </div>
      </form>
    </template>

    <template v-else-if="createMode">
      <div class="plan-page-toolbar">
        <button type="button" class="secondary-button" @click="emit('go-list')"><ArrowLeft :size="16" />Volver al listado</button>
      </div>
      <div class="module-intro">
        <span class="admin-icon"><Plus :size="21" /></span>
        <div>
          <h2>Crear colegio</h2>
          <p>Crea el colegio, su plan y la cuenta del administrador. El identificador interno se genera solo.</p>
        </div>
      </div>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <form class="panel provision-form" @submit.prevent="createTenant">
        <div class="form-grid">
          <label class="field wide"><span>Nombre del colegio</span><input v-model.trim="tenantForm.name" required minlength="3" maxlength="150" placeholder="Ej. Escuela Mapocho" /></label>
          <label class="field"><span>Nombre administrador</span><input v-model.trim="tenantForm.ownerName" required /></label>
          <label class="field"><span>Correo administrador</span><input v-model.trim="tenantForm.ownerEmail" type="email" required /></label>
          <label class="field"><span>Teléfono</span><input v-model.trim="tenantForm.ownerPhone" placeholder="+56912345678" /></label>
          <div class="field wide plan-picker-field">
            <span>Plan inicial</span>
            <div class="plan-picker" role="radiogroup" aria-label="Plan inicial">
              <button
                v-for="item in planCodes"
                :key="item.value"
                type="button"
                role="radio"
                class="plan-picker-option"
                :class="{ active: tenantForm.plan.code === item.value }"
                :aria-checked="tenantForm.plan.code === item.value"
                @click="selectPlanCode(tenantForm.plan, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <label class="switch-field wide">
            <input v-model="tenantForm.generateOwnerPassword" type="checkbox" />
            <span><i></i><strong>Generar contraseña automática</strong><small>Si lo desmarcas, define la clave del administrador ahora.</small></span>
          </label>
          <label v-if="!tenantForm.generateOwnerPassword" class="field">
            <span>Contraseña del administrador</span>
            <div class="password-field">
              <input v-model="tenantForm.ownerPassword" :type="showOwnerPassword ? 'text' : 'password'" required minlength="8" maxlength="128" autocomplete="new-password" />
              <button type="button" aria-label="Mostrar contraseña" @click="showOwnerPassword = !showOwnerPassword">
                <EyeOff v-if="showOwnerPassword" :size="16" /><Eye v-else :size="16" />
              </button>
            </div>
          </label>
          <label v-if="!tenantForm.generateOwnerPassword" class="field">
            <span>Confirmar contraseña</span>
            <input v-model="tenantForm.ownerPasswordConfirm" :type="showOwnerPassword ? 'text' : 'password'" required minlength="8" maxlength="128" autocomplete="new-password" />
          </label>

          <div class="field wide school-levels-field">
            <label class="switch-field">
              <input v-model="tenantForm.createCourses" type="checkbox" />
              <span><i></i><strong>Crear cursos del colegio</strong><small>Arma Prekínder a 4° Medio con sus asignaturas y las secciones que elijas.</small></span>
            </label>
            <div v-if="tenantForm.createCourses" class="school-levels-panel">
              <div class="school-levels-toolbar">
                <p>{{ selectedLevelCount }} nivel{{ selectedLevelCount === 1 ? '' : 'es' }} seleccionado{{ selectedLevelCount === 1 ? '' : 's' }}</p>
                <div>
                  <button type="button" class="edit-button" @click="selectAllSchoolLevels">Todos</button>
                  <button type="button" class="edit-button" @click="clearSchoolLevels">Ninguno</button>
                </div>
              </div>
              <div class="school-levels-groups">
                <section v-for="group in schoolLevelGroups" :key="group.id" class="school-levels-group">
                  <header>
                    <strong>{{ group.label }}</strong>
                    <button type="button" class="edit-button" @click="toggleSchoolLevelGroup(group)">
                      {{ groupLevelSelectedCount(group) === group.levels.length ? 'Quitar' : 'Todo el tramo' }}
                    </button>
                  </header>
                  <div class="school-levels-grid">
                    <label
                      v-for="level in group.levels"
                      :key="level.id"
                      class="school-level-chip"
                      :class="{ selected: tenantForm.levels.includes(level.id) }"
                    >
                      <input v-model="tenantForm.levels" type="checkbox" :value="level.id" />
                      <span>{{ level.name }}</span>
                    </label>
                  </div>
                </section>
              </div>
              <div class="school-sections-field">
                <div class="school-sections-head">
                  <div>
                    <strong>Secciones</strong>
                    <p>Se creará cada nivel en estas secciones (ej. 1° Básico A y B).</p>
                  </div>
                  <span>{{ tenantForm.courseSections.length }} seleccionada{{ tenantForm.courseSections.length === 1 ? '' : 's' }}</span>
                </div>
                <div class="school-sections-grid">
                  <button
                    v-for="section in suggestedSections"
                    :key="section"
                    type="button"
                    class="school-section-chip"
                    :class="{ selected: tenantForm.courseSections.includes(section) }"
                    @click="toggleCourseSection(section)"
                  >
                    {{ section }}
                  </button>
                  <button
                    v-for="section in tenantForm.courseSections.filter((item) => !suggestedSections.includes(item))"
                    :key="`custom-${section}`"
                    type="button"
                    class="school-section-chip selected"
                    @click="toggleCourseSection(section)"
                  >
                    {{ section }}
                  </button>
                </div>
                <div class="school-section-add">
                  <input
                    v-model.trim="tenantForm.customSection"
                    maxlength="10"
                    placeholder="Otra sección (ej. G, HB)"
                    @keydown.enter.prevent="addCustomCourseSection"
                  />
                  <button type="button" class="edit-button" :disabled="!tenantForm.customSection.trim()" @click="addCustomCourseSection">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <label v-if="tenantForm.plan.code === 'per_student'" class="field"><span>Estudiantes incluidos gratis</span><input v-model.number="tenantForm.plan.freeStudentLimit" type="number" min="0" required /></label>
          <label v-if="tenantForm.plan.code === 'custom' || tenantForm.plan.code === 'per_student'" class="field">
            <span>{{ tenantForm.plan.code === 'custom' ? 'Precio fijo mensual' : 'Tarifa base mensual' }}</span>
            <input v-model.number="tenantForm.plan.baseMonthlyPrice" type="number" min="0" required />
          </label>
          <label v-if="tenantForm.plan.code === 'per_student'" class="field"><span>Tarifa mensual por estudiante</span><input v-model.number="tenantForm.plan.perStudentPrice" type="number" min="0" required /></label>
          <label v-if="tenantForm.plan.code !== 'free' && tenantForm.plan.code !== 'demo'" class="field"><span>Moneda</span><select v-model="tenantForm.plan.currency"><option>CLP</option><option>USD</option></select></label>
        </div>
        <div class="plan-page-actions">
          <button type="button" class="secondary-button" @click="emit('go-list')">Cancelar</button>
          <button class="primary-button" :disabled="busy">{{ busy ? 'Creando…' : 'Crear colegio y acceso' }}</button>
        </div>
      </form>
    </template>

    <template v-else-if="detailPage">
      <div class="plan-page-toolbar">
        <button type="button" class="secondary-button" @click="closeTenantDetail"><ArrowLeft :size="16" />Volver a colegios</button>
      </div>
      <article
        id="tenant-activity-page"
        class="panel tenant-detail-page"
        tabindex="-1"
      >
        <div class="section-title">
          <div>
            <h2>{{ selectedTenant.tenant.name }}</h2>
            <p>
              {{ selectedTenant.tenant.students ?? '—' }} estudiantes ·
              {{ selectedTenant.tenant.employees ?? '—' }} empleados ·
              {{ selectedTenant.tenant.users ?? '—' }} usuarios ·
              {{ statusLabel(selectedTenant.tenant.status) }}
            </p>
          </div>
          <div class="tenant-actions">
            <button type="button" class="tenant-action primary" :disabled="selectedTenant.tenant.status === 'suspended'" @click="enterTenant(selectedTenant.tenant)">Entrar</button>
            <button
              v-if="can('platform.accounts.update') || can('platform.infrastructure.write')"
              type="button"
              class="tenant-action"
              @click="openPlanPage(selectedTenant.tenant)"
            >
              Plan
            </button>
          </div>
        </div>
        <div class="overview-grid compact">
          <article class="panel"><strong>{{ selectedTenant.memberships.length }}</strong><span>Personas con acceso</span></article>
          <article class="panel"><strong>{{ selectedTenant.sessions?.length || 0 }}</strong><span>En línea ahora</span></article>
          <article class="panel"><strong>{{ selectedTenant.studentProfiles?.length || selectedTenant.tenant.students || 0 }}</strong><span>Estudiantes</span></article>
          <article class="panel"><strong>{{ planCodeLabel(selectedTenant.tenant.plan?.code) }}</strong><span>Plan</span></article>
        </div>

        <h3>En línea ahora</h3>
        <p v-if="!(selectedTenant.sessions || []).length" class="empty-note">Nadie de este colegio con actividad en los últimos {{ Math.round((selectedTenant.onlineWithinSec || 900) / 60) }} min.</p>
        <div v-else class="table-scroll">
          <table>
            <thead><tr><th>Persona</th><th>Rol</th><th>Actividad</th></tr></thead>
            <tbody>
              <tr
                v-for="row in selectedTenant.sessions"
                :key="`${row.userId}-${row.lastSeenAt}`"
                class="clickable-row"
                tabindex="0"
                role="link"
                @click="openAccount(row.globalUserId)"
                @keydown.enter.prevent="openAccount(row.globalUserId)"
              >
                <td>
                  <strong>{{ row.fullName }}</strong>
                  <small>{{ row.email || `Usuario #${row.userId}` }}</small>
                </td>
                <td>{{ roleLabel(row.role) }}</td>
                <td>{{ formatAgo(row.secondsAgo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Cuentas del colegio</h3>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Persona</th><th>Rol</th><th>Estado</th><th>Último acceso</th></tr></thead>
            <tbody>
              <tr v-if="!tenantMemberships.length"><td colspan="4">Sin cuentas vinculadas todavía.</td></tr>
              <tr
                v-for="row in pagedMemberships"
                :key="row.id"
                class="clickable-row"
                tabindex="0"
                role="link"
                @click="openAccount(row.globalUserId || row.account?.id)"
                @keydown.enter.prevent="openAccount(row.globalUserId || row.account?.id)"
              >
                <td>
                  <strong>{{ row.account?.fullName || '—' }}</strong>
                  <small>{{ row.account?.email || `Global #${row.globalUserId}` }}</small>
                </td>
                <td>{{ roleLabel(row.role) }}</td>
                <td>{{ row.status }}</td>
                <td>{{ row.account?.lastLoginAt ? new Date(row.account.lastLoginAt).toLocaleString('es-CL') : 'Sin acceso' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          v-model:page="membershipsPage"
          :page-count="membershipsPageCount"
          :range-label="membershipsRangeLabel"
          :show="showMembershipsPagination"
        />

        <h3>Estudiantes</h3>
        <p v-if="!tenantStudentProfiles.length" class="empty-note">Sin estudiantes activos listados.</p>
        <div v-else class="table-scroll tenant-activity-scroll">
          <table>
            <thead><tr><th>Estudiante</th><th>RUT / ID</th><th>Correo</th><th></th></tr></thead>
            <tbody>
              <tr
                v-for="student in pagedStudents"
                :key="student.id"
                class="clickable-row"
                :class="{ disabled: !student.globalUserId }"
                tabindex="0"
                role="link"
                @click="student.globalUserId && openAccount(student.globalUserId)"
                @keydown.enter.prevent="student.globalUserId && openAccount(student.globalUserId)"
              >
                <td>
                  <strong>{{ student.fullName || '—' }}</strong>
                  <small>Estudiante #{{ student.id }}</small>
                </td>
                <td>{{ student.nationalId || '—' }}</td>
                <td>{{ student.email || '—' }}</td>
                <td>{{ student.globalUserId ? 'Abrir cuenta' : 'Sin cuenta global' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          v-if="tenantStudentProfiles.length"
          v-model:page="studentsPage"
          :page-count="studentsPageCount"
          :range-label="studentsRangeLabel"
          :show="showStudentsPagination"
        />

        <h3>Actividad del colegio</h3>
        <p v-if="!tenantActivity.length" class="empty-note">Sin eventos de auditoría registrados todavía.</p>
        <div v-else class="table-scroll tenant-activity-scroll">
          <table>
            <thead><tr><th>Acción</th><th>Entidad</th><th>Fecha</th></tr></thead>
            <tbody>
              <tr
                v-for="item in pagedActivity"
                :key="item.id"
                class="clickable-row"
                :class="{ disabled: !(item.entity === 'global_user' || item.entity === 'user') || !item.entityId }"
                tabindex="0"
                role="link"
                @click="(item.entity === 'global_user' || item.entity === 'user') && item.entityId && openAccount(item.entity === 'global_user' ? item.entityId : null)"
                @keydown.enter.prevent="(item.entity === 'global_user') && item.entityId && openAccount(item.entityId)"
              >
                <td>{{ item.action }}</td>
                <td>{{ item.entity }}{{ item.entityId != null ? ` #${item.entityId}` : '' }}</td>
                <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleString('es-CL') : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          v-if="tenantActivity.length"
          v-model:page="activityPage"
          :page-count="activityPageCount"
          :range-label="activityRangeLabel"
          :show="showActivityPagination"
        />
      </article>
    </template>

    <template v-else>
      <article class="panel school-search">
        <div class="school-search-top">
          <div>
            <h3>Colegios</h3>
            <p>Busca por nombre o ID. La lista de abajo se filtra al instante.</p>
          </div>
          <button
            v-if="can('platform.infrastructure.write')"
            type="button"
            class="primary-button colegios-create"
            @click="openCreate()"
          >
            <Plus :size="16" />Crear colegio
          </button>
        </div>

        <div class="school-search-bar">
          <label class="field school-search-field">
            <span>Buscar colegio</span>
            <div class="school-search-input">
              <Search :size="16" aria-hidden="true" />
              <input
                ref="schoolSearchInput"
                v-model.trim="schoolQuery"
                type="search"
                placeholder="Nombre del colegio o ID…"
                autocomplete="off"
              />
              <button
                v-if="schoolQuery"
                type="button"
                class="school-search-clear"
                aria-label="Limpiar búsqueda"
                @mousedown.prevent="clearSchoolSearch"
              >
                <X :size="15" />
              </button>
            </div>
          </label>
          <div class="school-search-meta">
            <strong>{{ filteredTenants.length }}</strong>
            <span>{{ filteredTenants.length === 1 ? 'resultado' : 'resultados' }}{{ schoolQuery.trim() ? '' : ' · todos' }}</span>
          </div>
        </div>
      </article>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <div v-if="pendingDemoRequests.length" class="lead-section panel">
        <h4>Solicitudes de demo pendientes</h4>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Organización</th><th>Contacto</th><th>Estudiantes</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr v-for="lead in pendingDemoRequests" :key="lead.id">
                <td><strong>{{ lead.organization }}</strong><small v-if="lead.message">{{ lead.message }}</small></td>
                <td>{{ lead.name }}<small>{{ lead.email }}</small></td>
                <td>{{ lead.studentCount || '—' }}</td>
                <td>{{ lead.status }}</td>
                <td><button v-if="can('platform.infrastructure.write')" class="primary-button" @click="openCreate(lead)">Crear colegio</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel-with-pager">
      <article class="panel tenants-table-card">
        <div class="tenants-table-heading">
          <div>
            <h3>{{ schoolQuery.trim() ? 'Resultados' : 'Todos los colegios' }}</h3>
            <span>{{ rangeLabel }}</span>
          </div>
          <div class="tenants-pager-controls">
            <label class="tenants-sort-field">
              <span>Ordenar</span>
              <select v-model="sortBy" aria-label="Ordenar colegios">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <button
              type="button"
              class="secondary-button tenants-sort-dir"
              :title="sortDir === 'ASC' ? 'Ascendente' : 'Descendente'"
              @click="toggleSortDir"
            >
              {{ sortDir === 'ASC' ? 'A → Z' : 'Z → A' }}
            </button>
            <label class="tenants-page-size">
              <span>Por página</span>
              <select v-model.number="pageSize" aria-label="Colegios por página">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </label>
          </div>
        </div>

        <div class="table-scroll">
          <table class="tenants-table">
            <thead>
              <tr>
                <th>
                  <button type="button" class="tenants-sort-th" :class="sortHeaderClass('name')" @click="setSort('name')">
                    Colegio
                  </button>
                </th>
                <th>
                  <button type="button" class="tenants-sort-th" :class="sortHeaderClass('status')" @click="setSort('status')">
                    Estado
                  </button>
                </th>
                <th>
                  <button type="button" class="tenants-sort-th" :class="sortHeaderClass('plan')" @click="setSort('plan')">
                    Plan
                  </button>
                </th>
                <th>
                  <button type="button" class="tenants-sort-th" :class="sortHeaderClass('students')" @click="setSort('students')">
                    Estudiantes
                  </button>
                </th>
                <th>
                  <button type="button" class="tenants-sort-th" :class="sortHeaderClass('accounts')" @click="setSort('accounts')">
                    Cuentas
                  </button>
                </th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tenant in pagedTenants"
                :key="tenant.id"
                class="clickable-row"
                :class="{ suspended: tenant.status === 'suspended' }"
                tabindex="0"
                @click="openTenant(tenant)"
                @keydown.enter.prevent="openTenant(tenant)"
              >
                <td>
                  <div class="school-cell">
                    <span class="school-avatar">{{ String(tenant.name || '?').slice(0, 1).toUpperCase() }}</span>
                    <span>
                      <strong>{{ tenant.name }}</strong>
                      <small>#{{ tenant.id }}{{ tenant.slug ? ` · ${tenant.slug}` : '' }}</small>
                    </span>
                  </div>
                </td>
                <td><span class="status-pill" :data-status="tenant.status">{{ statusLabel(tenant.status) }}</span></td>
                <td>
                  <strong class="metric">{{ planCodeLabel(tenant.plan?.code) }}</strong>
                  <small>{{ planSummary(tenant.plan, tenant.estimatedMonthlyPrice) }}</small>
                </td>
                <td class="metric">{{ tenant.students == null ? '—' : tenant.students }}</td>
                <td class="metric">{{ tenant.accounts || 0 }}</td>
                <td>
                  <div class="tenant-actions" @click.stop>
                    <button type="button" class="tenant-action primary" :disabled="busy" @click="enterTenant(tenant)">Entrar</button>
                    <button type="button" class="tenant-action" :disabled="busy || tenantDetailLoadingId === tenant.id" @click="openTenant(tenant)">
                      {{ tenantDetailLoadingId === tenant.id ? '…' : 'Ver' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!pagedTenants.length">
                <td colspan="6" class="tenants-empty-cell">
                  {{ tenants.length
                    ? (schoolQuery.trim() ? `Ningún colegio coincide con “${schoolQuery.trim()}”.` : 'No hay colegios para mostrar.')
                    : 'Aún no hay colegios. Usa Crear colegio para dar de alta el primero.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </article>
        <TablePagination
          v-if="filteredTenants.length"
          class="tenants-pager"
          :page="page"
          :page-count="pageCount"
          :range-label="rangeLabel"
          @goto="goToPage"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.colegios-page { display: grid; gap: 16px; }
header p, .empty-note { color: #607184; }
.colegios-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px;
  white-space: nowrap;
}
.success-message {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  color: #166534;
  background: #f0fdf4;
  font-size: 13px;
  font-weight: 600;
}
.field { max-width: 600px; margin: 10px 0; }
td small { display: block; color: #718195; }
.overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 30px; }
.overview-grid article { display: grid; gap: 4px; padding: 18px; }
.overview-grid strong { font-size: 20px; }
.section-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.section-title h2, .section-title h3, .section-title p { margin: 0; }
.provision-form, .plan-page-form, .lead-section, .tenants-table-card, .tenant-detail-page { padding: 18px 20px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px 16px; margin: 12px 0 18px; }
.plan-hint { grid-column: 1 / -1; margin: 0; color: #607184; font-size: 13px; }
.plan-page-toolbar { display: flex; }
.plan-page-actions { display: flex; justify-content: flex-end; gap: 8px; }
.plan-button, .plan-readonly {
  display: grid;
  gap: 2px;
  min-width: 150px;
  max-width: 220px;
  padding: 8px 10px;
  border: 1px solid #d7e2ea;
  border-radius: 10px;
  background: #f7fbfe;
  text-align: left;
  font: inherit;
}
.plan-button { cursor: pointer; transition: .15s ease; }
.plan-button:hover { border-color: #9eb7cc; background: #fff; }
.plan-button strong, .plan-readonly strong { color: #0b5f98; font-size: 13px; }
.plan-button small, .plan-readonly small { color: #607184; font-size: 11px; }
.lead-section { margin-bottom: 4px; }
.lead-section h4 { margin: 0 0 12px; }
.school-search {
  position: relative;
  padding: 20px 22px;
  display: grid;
  gap: 16px;
  overflow: visible;
}
.school-search-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.school-search-top h3 {
  margin: 0 0 4px;
  color: #1d3348;
  font-size: 16px;
  font-weight: 800;
}
.school-search-top p {
  margin: 0;
  max-width: 48ch;
  color: #607184;
  font-size: 13px;
  line-height: 1.45;
}
.school-search-bar {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: end;
}
.school-search-field { margin: 0; max-width: none; }
.school-search-input {
  position: relative;
  display: flex;
  align-items: center;
}
.school-search-input > svg {
  position: absolute;
  left: 13px;
  color: #718195;
  pointer-events: none;
}
.school-search-input input {
  width: 100%;
  min-height: 44px;
  padding: 0 42px 0 40px;
  border: 0;
  border-radius: 12px;
  background: #eef1f4;
  font-size: 14px;
  box-shadow: none;
}
.school-search-input input:focus,
.school-search-input input:focus-visible {
  outline: none;
  border: 0;
  background: #e7ebef;
  box-shadow: none;
}
.school-search-clear {
  position: absolute;
  right: 8px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #718195;
  background: transparent;
  cursor: pointer;
}
.school-search-clear:hover { color: #1d3348; background: #eef3f7; }
.school-search-meta {
  min-width: 88px;
  padding: 10px 14px;
  border: 1px solid #e4ebf1;
  border-radius: 12px;
  display: grid;
  gap: 2px;
  justify-items: center;
  background: #f7fbfe;
}
.school-search-meta strong { color: #1d3348; font-size: 18px; line-height: 1; }
.school-search-meta span { color: #718195; font-size: 11px; font-weight: 700; }
.school-suggest-list {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid #d7e0e8;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(29, 51, 72, 0.12);
  max-height: 360px;
  overflow: auto;
}
.school-suggest-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}
.school-suggest-list li:hover,
.school-suggest-list li.active {
  background: #f3f8fb;
}
.school-suggest-copy {
  min-width: 0;
  flex: 1;
}
.school-suggest-copy strong {
  display: block;
  color: #1d3348;
}
.school-suggest-copy small {
  display: block;
  margin-top: 2px;
  color: #718195;
  font-size: 12px;
}
.school-suggest-action {
  color: #0067b2;
  font-size: 12px;
  font-weight: 750;
  flex: 0 0 auto;
}
.tenants-table-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.tenants-table-heading h3 {
  margin: 0 0 4px;
  color: #1d3348;
  font-size: 18px;
  letter-spacing: -.02em;
}
.tenants-table-heading span { color: #607184; font-size: 13px; }
.tenants-pager-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.tenants-sort-field,
.tenants-page-size {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #607184;
  font-size: 12px;
  font-weight: 650;
}
.tenants-sort-field select,
.tenants-page-size select {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid #d7e2ea;
  border-radius: 9px;
  background: #fff;
  color: #1d3348;
  font: inherit;
}
.tenants-sort-dir {
  min-height: 34px;
  padding: 0 12px;
  white-space: nowrap;
}
.tenants-sort-th {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.tenants-sort-th::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  opacity: 0.35;
  border-top: 5px solid currentColor;
}
.tenants-sort-th.is-sorted {
  color: #0b5f98;
}
.tenants-sort-th.is-sorted::after {
  opacity: 1;
}
.tenants-sort-th.is-sorted.asc::after {
  border-top: 0;
  border-bottom: 5px solid currentColor;
}
.tenants-sort-th.is-sorted.desc::after {
  border-bottom: 0;
  border-top: 5px solid currentColor;
}
.tenants-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #e8edf2;
  border-radius: 12px;
  background: #f8fbfd;
}
.tenants-toolbar-bottom {
  margin: 12px 0 0;
  border: 0;
  border-top: 1px solid #e8edf2;
  border-radius: 0;
  background: transparent;
  padding: 12px 0 0;
}
.tenants-range {
  color: #607184;
  font-size: 13px;
  font-weight: 650;
}
.tenants-pager {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #607184;
  font-size: 13px;
  font-weight: 650;
}
.tenants-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.tenants-table th {
  padding: 10px 12px;
  border-bottom: 1px solid #e8edf2;
  color: #607184;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-align: left;
  text-transform: uppercase;
}
.tenants-table td {
  padding: 12px;
  border-bottom: 1px solid #eef3f7;
  vertical-align: middle;
}
.tenants-table td small {
  display: block;
  margin-top: 3px;
  color: #718195;
  font-size: 12px;
  font-weight: 550;
}
.tenants-table tr.suspended { opacity: .72; }
.tenants-table tr.selected { background: #f5f9fc; }
.tenants-table tr.clickable-row { cursor: pointer; }
.tenants-table tr.clickable-row:hover td { background: #f8fbfd; }
.tenants-table tr:last-child td { border-bottom: 0; }
.tenants-empty-cell {
  padding: 28px 12px !important;
  color: #607184;
  text-align: center;
  font-size: 14px;
}
.school-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.school-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #0b5f98;
  background: #e8f3fb;
  font-size: 13px;
  font-weight: 800;
}
.school-cell span:last-child { min-width: 0; display: grid; gap: 2px; }
.school-cell strong {
  overflow: hidden;
  color: #1d3348;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.school-cell small { color: #718195; font-size: 12px; }
.metric { color: #243447; font-size: 14px; font-weight: 700; }
.tenant-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.tenant-action {
  box-sizing: border-box;
  height: 34px;
  min-width: 88px;
  padding: 0 12px;
  border: 1px solid #d7e2ea;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1d3348;
  background: #fff;
  font: 650 12px/1 var(--font-primary, inherit);
  cursor: pointer;
  transition: .15s ease;
}
.tenant-action:hover:not(:disabled) {
  border-color: #9eb7cc;
  color: #0b5f98;
  background: #f5f9fc;
}
.tenant-action:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.tenant-action.primary {
  border-color: transparent;
  color: #fff;
  background: var(--color-primary, #0067b2);
}
.tenant-action.primary:hover:not(:disabled) {
  border-color: transparent;
  color: #fff;
  background: var(--color-primary-hover, #0b5f98);
}
.tenant-action.danger {
  color: #b42318;
  border-color: #f3d1cd;
}
.tenant-action.danger:hover:not(:disabled) {
  color: #912018;
  border-color: #f3d1cd;
  background: #fef3f2;
}
.status-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2f6;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}
.status-pill[data-status='active'] { background: #dcfce7; color: #166534; }
.status-pill[data-status='suspended'] { background: #fee2e2; color: #991b1b; }
.status-pill[data-status='trial'] { background: #dbeafe; color: #1d4ed8; }
.status-pill[data-status='past_due'] { background: #fef3c7; color: #9a6700; }
.status-pill[data-status='moving'] { background: #fff7ed; color: #9a3412; }
.danger-button { color: #b42318; border-color: #f3d1cd; }
.tenant-detail-page {
  display: grid;
  gap: 14px;
  margin: 0;
}
.tenant-detail-page h3 { margin: 8px 0 0; }
.tenant-activity-scroll { max-height: 420px; }
.tenant-detail-page .clickable-row { cursor: pointer; }
.tenant-detail-page .clickable-row:hover { background: #f8fbfd; }
.tenant-detail-page .clickable-row.disabled {
  cursor: default;
  opacity: .72;
}
.tenant-detail-page .clickable-row.disabled:hover { background: transparent; }
.tenant-detail-page td strong { display: block; }
.tenant-detail-page td small { display: block; margin-top: 3px; color: #718195; font-size: 12px; }
.overview-grid.compact { margin-bottom: 8px; }
.plan-page-form .field { max-width: none; margin: 0; }
.plan-picker-field > span {
  display: block;
  margin-bottom: 6px;
  color: #607184;
  font-size: 12px;
  font-weight: 650;
}
.plan-picker {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.plan-picker-option {
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid #d7e2ea;
  border-radius: 10px;
  color: #334155;
  background: #fff;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color .12s ease, background .12s ease, color .12s ease, box-shadow .12s ease;
}
.plan-picker-option:hover {
  border-color: #9eb7cc;
  background: #f5f9fc;
}
.plan-picker-option.active {
  border-color: #0067b2;
  color: #0b5f98;
  background: #e8f3fb;
  box-shadow: 0 0 0 2px color-mix(in srgb, #0067b2 18%, transparent);
}
@media (max-width: 720px) {
  .plan-picker { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.school-levels-field {
  display: grid;
  gap: 10px;
}
.school-levels-panel {
  padding: 14px;
  border: 1px solid #d7e2ea;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  gap: 14px;
}
.school-levels-toolbar,
.school-levels-group header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.school-levels-toolbar p {
  margin: 0;
  color: #607184;
  font-size: 13px;
  font-weight: 650;
}
.school-levels-toolbar > div,
.school-levels-group header {
  gap: 8px;
}
.school-levels-groups {
  display: grid;
  gap: 12px;
}
.school-levels-group {
  display: grid;
  gap: 8px;
}
.school-levels-group strong {
  color: #0a2540;
  font-size: 13px;
}
.school-levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.school-level-chip {
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #d7e2ea;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
}
.school-level-chip input {
  width: 16px;
  height: 16px;
  accent-color: #0067b2;
}
.school-level-chip.selected {
  border-color: #0067b2;
  color: #0b5f98;
  background: #e8f3fb;
}
.school-sections-field {
  display: grid;
  gap: 10px;
  padding-top: 4px;
  border-top: 1px solid #e2e8f0;
}
.school-sections-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}
.school-sections-head strong {
  display: block;
  color: #0a2540;
  font-size: 13px;
}
.school-sections-head p,
.school-sections-head span {
  margin: 2px 0 0;
  color: #607184;
  font-size: 12px;
}
.school-sections-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.school-section-chip {
  min-width: 42px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #d7e2ea;
  border-radius: 999px;
  color: #334155;
  background: #fff;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}
.school-section-chip.selected {
  border-color: #0067b2;
  color: #0b5f98;
  background: #e8f3fb;
}
.school-section-add {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.school-section-add input {
  width: min(220px, 100%);
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #d7e2ea;
  border-radius: 10px;
  background: #fff;
}
.provision-form .password-field {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 10px;
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 10px;
  background: #fff;
}
.provision-form .password-field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0 !important;
  outline: 0;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent;
}
.provision-form .password-field button {
  border: 0;
  display: grid;
  place-items: center;
  padding: 4px;
  color: #738594;
  background: transparent;
  border-radius: 8px;
}
.provision-form .password-field button:hover {
  color: #0067b2;
  background: #e9f4fb;
}
.provision-form .wide { grid-column: 1 / -1; }
@media (max-width: 720px) {
  .colegios-create { width: 100%; justify-content: center; }
  .school-search-top { flex-direction: column; }
  .school-search-bar { grid-template-columns: 1fr; }
  .school-search-meta { width: 100%; grid-template-columns: auto auto; justify-content: start; align-items: baseline; gap: 8px; }
  .tenants-toolbar { align-items: stretch; }
  .tenants-pager { width: 100%; justify-content: space-between; }
  .tenant-actions { flex-direction: column; align-items: stretch; }
  .tenant-action { width: 100%; }
}
</style>
