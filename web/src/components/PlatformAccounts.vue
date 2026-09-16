<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ArrowLeft, Building2, Check, ChevronRight, Copy, KeyRound, Pencil, Plus, Search, ShieldCheck, X } from '@lucide/vue';
import { request, session, storageSet, storageRemove, sessionFlagSet, sessionFlagRemove } from '../api/client.js';
import { useNotify } from '../composables/notify.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({ permissions: { type: Array, default: () => [] } });
const can = permission => props.permissions.includes(permission);
const notify = useNotify();

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const query = ref('');
const statusFilter = ref('');
const tenantFilter = ref('');
const roleFilter = ref('');
const createdFrom = ref('');
const createdTo = ref('');
const loginFrom = ref('');
const loginTo = ref('');
const showDateFilters = ref(false);
const page = ref(1);
const pageSize = ref(25);
const sortBy = ref('fullName');
const sortDir = ref('ASC');
const rows = ref([]);
const total = ref(0);
const tenants = ref([]);
const selected = ref(null);
const detailTab = ref('resumen');
const editingMembershipId = ref(null);
const membershipDraft = ref({ role: '', status: '' });
const assignOpen = ref(false);
const assignSaving = ref(false);
const assignError = ref('');
const assignForm = reactive({ schoolId: '', role: 'teacher' });
const assignSchoolQuery = ref('');
const assignSchoolOpen = ref(false);
const assignSchoolHighlight = ref(0);
const editOpen = ref(false);
const editSaving = ref(false);
const editError = ref('');
const editForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  identifier: '',
  status: 'active',
});
const resetOpen = ref(false);
const resetBusy = ref(false);
const resetMode = ref('');
const resetCredentials = ref(null);
const resetCopyHint = ref('');
const error = ref('');
const busy = ref(false);
const loading = ref(false);
const detailLoading = ref(false);
let timer;
let skipPageReset = false;

const schoolRoles = [
  { value: 'director', label: 'Director' },
  { value: 'school_admin', label: 'Admin colegio' },
  { value: 'manager', label: 'Equipo directivo' },
  { value: 'utp', label: 'Jefe de UTP' },
  { value: 'teacher', label: 'Profesor' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'agente_finanzas', label: 'Agente finanzas' },
  { value: 'warehouse', label: 'Bodega' },
  { value: 'guardian', label: 'Apoderado' },
  { value: 'student', label: 'Estudiante' },
  { value: 'super_admin', label: 'Administrador' },
];

const assignableRoles = schoolRoles.filter(item => item.value !== 'super_admin');

const accountStatuses = [
  { value: 'active', label: 'Activa' },
  { value: 'blocked', label: 'Bloqueada' },
  { value: 'suspended', label: 'Suspendida' },
];

const membershipStatuses = [
  { value: 'active', label: 'Activa' },
  { value: 'suspended', label: 'Suspendida' },
  { value: 'left', label: 'Baja' },
];

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
const rangeLabel = computed(() => {
  if (!total.value) return '0 resultados';
  const from = (page.value - 1) * pageSize.value + 1;
  const to = Math.min(total.value, page.value * pageSize.value);
  return `${from}–${to} de ${total.value}`;
});

const sortOptions = [
  { value: 'fullName', label: 'Nombre' },
  { value: 'email', label: 'Correo' },
  { value: 'status', label: 'Estado' },
  { value: 'lastLoginAt', label: 'Último acceso' },
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'id', label: 'ID global' },
];

const selectedMemberships = computed(() => {
  if (!selected.value) return [];
  const schoolById = new Map((selected.value.schools || []).map(school => [Number(school.id || school.schoolId), school]));
  return (selected.value.memberships || []).map(item => ({
    ...item,
    school: item.school || schoolById.get(Number(item.schoolId)) || null,
  }));
});

const assignableTenants = computed(() => {
  const taken = new Set(selectedMemberships.value.map(item => Number(item.schoolId)));
  return (tenants.value || []).filter(tenant => !taken.has(Number(tenant.id || tenant.schoolId)));
});

const assignSelectedTenant = computed(() => {
  const id = String(assignForm.schoolId || '');
  if (!id) return null;
  return assignableTenants.value.find(tenant => String(tenant.id || tenant.schoolId) === id) || null;
});

const assignSchoolOptions = computed(() => {
  const q = normalizeText(assignSchoolQuery.value);
  const rows = assignableTenants.value.filter((tenant) => {
    if (!q) return true;
    const id = tenant.id || tenant.schoolId;
    return normalizeText([tenant.name, id, tenant.slug].join(' ')).includes(q);
  });
  return rows.slice(0, 12);
});

const activeSessions = computed(() => (selected.value?.sessions || []).filter(item => item.active || !item.revokedAt));
const accessSummary = computed(() => selected.value?.accessSummary || null);
const accessHistory = computed(() => {
  const rows = [...(selected.value?.sessions || [])];
  return rows.sort((a, b) => {
    const aTime = new Date(a.createdAt || a.lastSeenAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.lastSeenAt || 0).getTime();
    return bTime - aTime;
  });
});
const recentAccessHistory = computed(() => accessHistory.value.slice(0, 8));
const auditLogs = computed(() => selected.value?.auditLogs || []);

const {
  page: accessHistoryPage,
  pageCount: accessHistoryPageCount,
  paged: pagedAccessHistory,
  rangeLabel: accessHistoryRangeLabel,
  show: showAccessHistoryPagination,
  goPrev: accessHistoryPrev,
  goNext: accessHistoryNext,
} = useClientPagination(accessHistory, { pageSize: 15, resetOn: [selected] });

const {
  page: auditLogsPage,
  pageCount: auditLogsPageCount,
  paged: pagedAuditLogs,
  rangeLabel: auditLogsRangeLabel,
  show: showAuditLogsPagination,
  goPrev: auditLogsPrev,
  goNext: auditLogsNext,
} = useClientPagination(auditLogs, { pageSize: 15, resetOn: [selected] });

function openAccessHistory() {
  setDetailTab('accesos');
}

function setDetailTab(tab) {
  const allowed = ['resumen', 'accesos', 'colegios', 'auditoria'];
  detailTab.value = allowed.includes(tab) ? tab : 'resumen';
  const id = selected.value?.account?.id;
  if (!id) return;
  const path = `/plataforma/cuentas/${id}`;
  const next = detailTab.value === 'resumen' ? path : `${path}?tab=${detailTab.value}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== next) {
    window.history.replaceState({ view: 'Cuentas', accountId: Number(id) }, '', next);
  }
}

function roleLabel(role) {
  return schoolRoles.find(item => item.value === role)?.label || role || 'Sin rol';
}

function accountStatusLabel(status) {
  return accountStatuses.find(item => item.value === status)?.label || status || '—';
}

function membershipStatusLabel(status) {
  return membershipStatuses.find(item => item.value === status)?.label || status || '—';
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CL');
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-CL');
}

function membershipRolesLabel(memberships = []) {
  const labels = [...new Set(memberships.map(item => roleLabel(item.role)).filter(Boolean))];
  return labels.join(', ') || 'Sin rol';
}

function membershipRoleChips(memberships = []) {
  return [...new Set(memberships.map(item => roleLabel(item.role)).filter(Boolean))];
}

function membershipSchoolsLabel(memberships = []) {
  const names = memberships.map(item => item.school?.name || `#${item.schoolId}`).filter(Boolean);
  if (!names.length) return 'Sin colegio';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

function shortAccess(value) {
  if (!value) return 'Sin acceso';
  return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function describeAgent(value = '') {
  const ua = String(value || '');
  if (!ua) return 'Cliente desconocido';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'SO desconocido';
  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Móvil' : 'Escritorio';
  return `${browser} · ${os} · ${device}`;
}

function permissionLabels(user) {
  if (!user) return [];
  return [
    user.canManageUsers && 'Usuarios',
    user.canManageGrades && 'Notas',
    user.canViewReports && 'Reportes',
    user.canManageSchool && 'Colegio',
    user.canManageFinance && 'Finanzas',
    user.canManageHr && 'RRHH',
  ].filter(Boolean);
}

function applyUrlState() {
  const pathMatch = window.location.pathname.match(/^\/plataforma\/cuentas\/(\d+)\/?$/);
  if (pathMatch) return pathMatch[1];
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) query.value = params.get('q');
  const tenant = params.get('tenantId') || params.get('schoolId');
  if (tenant) tenantFilter.value = String(tenant);
  if (params.get('status')) statusFilter.value = params.get('status');
  if (params.get('role')) roleFilter.value = params.get('role');
  if (params.get('createdFrom') || params.get('createdTo') || params.get('loginFrom') || params.get('loginTo')) {
    showDateFilters.value = true;
    createdFrom.value = params.get('createdFrom') || '';
    createdTo.value = params.get('createdTo') || '';
    loginFrom.value = params.get('loginFrom') || '';
    loginTo.value = params.get('loginTo') || '';
  }
  return params.get('id');
}

async function load() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      q: query.value,
      page: String(page.value),
      pageSize: String(pageSize.value),
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    });
    for (const [key, value] of [
      ['status', statusFilter.value],
      ['tenantId', tenantFilter.value],
      ['role', roleFilter.value],
      ['createdFrom', createdFrom.value],
      ['createdTo', createdTo.value],
      ['loginFrom', loginFrom.value],
      ['loginTo', loginTo.value],
    ]) if (value) params.set(key, value);
    const [data, tenantRows] = await Promise.all([
      request(`/platform/accounts?${params}`),
      request('/platform/tenants'),
    ]);
    rows.value = data.rows;
    total.value = data.total || data.rows.length;
    tenants.value = tenantRows;
    if (page.value > pageCount.value) {
      skipPageReset = true;
      page.value = pageCount.value;
    }
    error.value = '';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}

function goToPage(next) {
  const target = Math.min(pageCount.value, Math.max(1, Number(next) || 1));
  if (target === page.value) return;
  skipPageReset = true;
  page.value = target;
}

function toggleSortDir() {
  sortDir.value = sortDir.value === 'ASC' ? 'DESC' : 'ASC';
}

async function detail(id, tab = 'resumen', { syncUrl = true } = {}) {
  detailLoading.value = true;
  try {
    selected.value = await request(`/platform/accounts/${id}`);
    editingMembershipId.value = null;
    error.value = '';
    if (syncUrl) {
      const path = `/plataforma/cuentas/${id}`;
      const next = tab && tab !== 'resumen' ? `${path}?tab=${tab}` : path;
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== next) {
        window.history.pushState({ view: 'Cuentas', accountId: Number(id) }, '', next);
      }
    }
    setDetailTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (cause) {
    error.value = cause.message;
    selected.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail(reload = true) {
  selected.value = null;
  detailTab.value = 'resumen';
  editingMembershipId.value = null;
  closeEditAccount({ force: true });
  closeResetAccess({ force: true });
  error.value = '';
  const target = '/plataforma/cuentas';
  if ((window.location.pathname.replace(/\/$/, '') || '/') !== target) {
    window.history.pushState({ view: 'Cuentas' }, '', target);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (reload) load();
}

async function revoke() {
  if (!confirm('¿Cerrar todas las sesiones de esta identidad?')) return;
  try {
    await request(`/platform/accounts/${selected.value.account.id}/sessions`, { method: 'DELETE' });
    await detail(selected.value.account.id, detailTab.value);
    notify('Sesiones cerradas.');
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudieron cerrar las sesiones.', 'error');
  }
}

function openEditAccount() {
  if (!selected.value?.account) return;
  closeResetAccess({ force: true });
  const account = selected.value.account;
  editForm.fullName = account.fullName || '';
  editForm.email = account.email || '';
  editForm.phone = account.phone || '';
  editForm.identifier = account.identifier || '';
  editForm.status = account.status || 'active';
  editError.value = '';
  editOpen.value = true;
}

function closeEditAccount({ force = false } = {}) {
  if (editSaving.value && !force) return;
  editOpen.value = false;
  editError.value = '';
}

async function saveEditAccount() {
  if (!selected.value?.account) return;
  const fullName = editForm.fullName.trim();
  const email = editForm.email.trim();
  if (fullName.length < 2) {
    editError.value = 'El nombre completo debe tener al menos 2 caracteres.';
    return;
  }
  if (!email || !email.includes('@')) {
    editError.value = 'Ingresá un correo global válido.';
    return;
  }
  editSaving.value = true;
  editError.value = '';
  try {
    await request(`/platform/accounts/${selected.value.account.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        fullName,
        email,
        phone: editForm.phone.trim(),
        identifier: editForm.identifier.trim(),
      }),
    });
    if (can('platform.accounts.disable') && editForm.status && editForm.status !== selected.value.account.status) {
      await request(`/platform/accounts/${selected.value.account.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: editForm.status }),
      });
    }
    editOpen.value = false;
    await detail(selected.value.account.id, detailTab.value, { syncUrl: false });
    notify('Cuenta actualizada.');
  } catch (cause) {
    editError.value = cause.message;
    notify(cause.message || 'No se pudo actualizar la cuenta.', 'error');
  } finally {
    editSaving.value = false;
  }
}

function resetAccess() {
  if (!selected.value?.account || resetBusy.value) return;
  closeEditAccount({ force: true });
  resetOpen.value = true;
  resetCredentials.value = null;
  resetCopyHint.value = '';
  resetMode.value = '';
  error.value = '';
}

function closeResetAccess({ force = false } = {}) {
  if (resetBusy.value && !force) return;
  resetOpen.value = false;
  resetCredentials.value = null;
  resetCopyHint.value = '';
  resetMode.value = '';
}

async function confirmResetAccess({ sendEmail = true } = {}) {
  if (!selected.value?.account || resetBusy.value) return;
  if (!selectedMemberships.value.length) {
    error.value = 'Esta identidad no tiene colegio asignado. Asignala en Colegios antes de restablecer el acceso.';
    detailTab.value = 'colegios';
    return;
  }
  resetBusy.value = true;
  resetMode.value = sendEmail ? 'email' : 'only';
  error.value = '';
  resetCopyHint.value = '';
  try {
    const data = await request(`/platform/accounts/${selected.value.account.id}/reset-access`, {
      method: 'POST',
      body: JSON.stringify({ sendEmail: Boolean(sendEmail) }),
    });
    const password = data?.temporaryPassword;
    if (!password) throw new Error('El servidor no devolvió la contraseña temporal.');
    resetCredentials.value = {
      email: selected.value.account.email,
      password,
      emailSent: Boolean(data?.emailSent),
      emailSkipped: data?.emailSkipped === true,
      emailReason: data?.emailReason || null,
    };
    await detail(selected.value.account.id, detailTab.value, { syncUrl: false });
    notify(sendEmail ? 'Acceso restablecido. Revisa si el correo salió.' : 'Acceso restablecido. Contraseña temporal lista.');
  } catch (cause) {
    error.value = cause.message;
    resetOpen.value = false;
    notify(cause.message || 'No se pudo restablecer el acceso.', 'error');
  } finally {
    resetBusy.value = false;
    resetMode.value = '';
  }
}

async function copyResetPassword() {
  if (!resetCredentials.value?.password) return;
  try {
    await navigator.clipboard.writeText(resetCredentials.value.password);
    resetCopyHint.value = 'Contraseña copiada';
    notify('Contraseña temporal copiada.');
  } catch {
    resetCopyHint.value = 'No se pudo copiar; seleccionála manualmente.';
    notify('No se pudo copiar la contraseña.', 'error');
  }
}

async function addPlatformRole() {
  const role = prompt('Rol interno (platform_admin, support_agent, sales_admin…):'); if (!role) return;
  const raw = prompt('Permisos separados por coma:', 'platform.accounts.read'); if (raw === null) return;
  try {
    await request(`/platform/accounts/${selected.value.account.id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions: raw.split(',').map(value => value.trim()).filter(Boolean) }),
    });
    await detail(selected.value.account.id, detailTab.value);
  } catch (cause) {
    error.value = cause.message;
  }
}

async function removePlatformRole(role) {
  if (!confirm(`¿Retirar el rol interno ${role}?`)) return;
  try {
    await request(`/platform/accounts/${selected.value.account.id}/roles/${encodeURIComponent(role)}`, { method: 'DELETE' });
    await detail(selected.value.account.id, detailTab.value);
  } catch (cause) {
    error.value = cause.message;
  }
}

function startEditMembership(membership) {
  editingMembershipId.value = membership.id;
  membershipDraft.value = { role: membership.role, status: membership.status };
}

function cancelEditMembership() {
  editingMembershipId.value = null;
  membershipDraft.value = { role: '', status: '' };
}

function openAssignMembership() {
  assignOpen.value = true;
  assignError.value = '';
  assignForm.schoolId = '';
  assignForm.role = 'teacher';
  assignSchoolQuery.value = '';
  assignSchoolOpen.value = false;
  assignSchoolHighlight.value = 0;
  detailTab.value = 'colegios';
}

function closeAssignMembership() {
  if (assignSaving.value) return;
  assignOpen.value = false;
  assignError.value = '';
  assignSchoolQuery.value = '';
  assignSchoolOpen.value = false;
  assignSchoolHighlight.value = 0;
}

function openAssignSchoolPicker() {
  if (!assignableTenants.value.length) return;
  assignSchoolOpen.value = true;
  assignSchoolHighlight.value = 0;
  if (assignSelectedTenant.value) assignSchoolQuery.value = '';
}

function closeAssignSchoolPicker() {
  assignSchoolOpen.value = false;
  assignSchoolQuery.value = '';
  assignSchoolHighlight.value = 0;
}

function pickAssignSchool(tenant) {
  if (!tenant) {
    assignForm.schoolId = '';
  } else {
    assignForm.schoolId = String(tenant.id || tenant.schoolId);
  }
  closeAssignSchoolPicker();
}

function clearAssignSchool() {
  assignForm.schoolId = '';
  assignSchoolQuery.value = '';
  assignSchoolOpen.value = false;
  assignSchoolHighlight.value = 0;
}

function onAssignSchoolKeydown(event) {
  if (!assignSchoolOpen.value && ['ArrowDown', 'Enter'].includes(event.key)) {
    openAssignSchoolPicker();
    return;
  }
  if (!assignSchoolOpen.value) return;
  const total = Math.max(1, assignSchoolOptions.value.length);
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    assignSchoolHighlight.value = (assignSchoolHighlight.value + 1) % total;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    assignSchoolHighlight.value = (assignSchoolHighlight.value - 1 + total) % total;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    pickAssignSchool(assignSchoolOptions.value[assignSchoolHighlight.value] || null);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeAssignSchoolPicker();
  }
}

async function saveAssignMembership() {
  if (!selected.value?.account || assignSaving.value) return;
  const schoolId = Number(assignForm.schoolId);
  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    assignError.value = 'Elige un colegio.';
    return;
  }
  assignSaving.value = true;
  assignError.value = '';
  error.value = '';
  try {
    await request(`/platform/accounts/${selected.value.account.id}/memberships`, {
      method: 'POST',
      body: JSON.stringify({ schoolId, role: assignForm.role }),
    });
    assignOpen.value = false;
    await detail(selected.value.account.id, 'colegios', { syncUrl: false });
    await load();
    notify('Colegio asignado a la cuenta.');
  } catch (cause) {
    assignError.value = cause.message;
    notify(cause.message || 'No se pudo asignar el colegio.', 'error');
  } finally {
    assignSaving.value = false;
  }
}

async function saveMembership(membership) {
  busy.value = true;
  error.value = '';
  try {
    await request(`/platform/memberships/${membership.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        role: membershipDraft.value.role,
        status: membershipDraft.value.status,
        schoolId: membership.schoolId,
      }),
    });
    editingMembershipId.value = null;
    await detail(selected.value.account.id, detailTab.value);
    await load();
    notify('Membresía actualizada.');
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo actualizar la membresía.', 'error');
  } finally {
    busy.value = false;
  }
}

async function impersonate(membership) {
  // Esta pantalla solo se ve fuera de impersonación; cualquier marker viejo es basura.
  storageRemove('admin_token');
  sessionFlagRemove('impersonation_handoff');
  error.value = '';
  busy.value = true;
  try {
    const adminToken = session.getToken();
    const data = await request('/platform/impersonations', {
      method: 'POST',
      body: JSON.stringify({
        userId: membership.userId,
        schoolId: membership.schoolId,
      }),
    });
    sessionFlagSet('impersonation_handoff', '1');
    storageSet('admin_token', adminToken);
    session.setToken(data.token);
    window.location.replace('/');
  } catch (cause) {
    sessionFlagRemove('impersonation_handoff');
    storageRemove('admin_token');
    error.value = cause.message;
    busy.value = false;
  }
}

function schoolName(membership) {
  return membership.school?.name || `Colegio #${membership.schoolId}`;
}

function syncFromLocation() {
  const pathMatch = window.location.pathname.match(/^\/plataforma\/cuentas\/(\d+)\/?$/);
  const id = pathMatch?.[1] || new URLSearchParams(window.location.search).get('id');
  const tab = new URLSearchParams(window.location.search).get('tab') || 'resumen';
  if (id) {
    if (String(selected.value?.account?.id) !== String(id) || detailTab.value !== tab) {
      detail(id, tab, { syncUrl: false });
    }
    return;
  }
  if (selected.value) {
    selected.value = null;
    detailTab.value = 'resumen';
    editingMembershipId.value = null;
    error.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    load();
  }
}

watch([query, statusFilter, tenantFilter, roleFilter, createdFrom, createdTo, loginFrom, loginTo, sortBy, sortDir, pageSize], () => {
  if (selected.value) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!skipPageReset && page.value !== 1) {
      skipPageReset = true;
      page.value = 1;
      return;
    }
    skipPageReset = false;
    load();
  }, 250);
});

watch(page, () => {
  if (selected.value) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    skipPageReset = false;
    load();
  }, 80);
});

onMounted(async () => {
  window.addEventListener('popstate', syncFromLocation);
  const focusId = applyUrlState();
  if (focusId) await detail(focusId, 'resumen', { syncUrl: false });
  else await load();
});

onUnmounted(() => {
  window.removeEventListener('popstate', syncFromLocation);
});
</script>

<template>
  <section class="platform-accounts">
    <p v-if="error" class="login-error" role="alert">{{ error }}</p>

    <template v-if="selected">
      <div class="detail-toolbar">
        <button type="button" class="secondary-button back-button" @click="closeDetail()">
          <ArrowLeft :size="16" />Volver a cuentas
        </button>
      </div>

      <article id="account-detail" class="panel account">
        <div class="account-header">
          <div>
            <p class="eyebrow">Ficha de identidad</p>
            <h2>{{ selected.account.fullName }}</h2>
            <p class="account-sub">
              {{ selected.account.email }} · Global #{{ selected.account.id }}
              <template v-if="selected.account.identifier"> · {{ selected.account.identifier }}</template>
            </p>
          </div>
          <div v-if="can('platform.accounts.update')" class="account-header-actions">
            <button type="button" class="secondary-button" :class="{ active: resetOpen }" @click="resetOpen ? closeResetAccess() : resetAccess()">
              <KeyRound :size="16" />Restablecer acceso
            </button>
            <button type="button" class="primary-button" :class="{ active: editOpen }" @click="editOpen ? closeEditAccount() : openEditAccount()">
              <Pencil :size="16" />Editar identidad
            </button>
          </div>
        </div>

        <form v-if="editOpen" class="panel account-action-box" @submit.prevent="saveEditAccount">
          <div class="section-heading">
            <div>
              <h4>Editar identidad</h4>
              <p>Actualizá los datos globales de esta cuenta de acceso.</p>
            </div>
            <button type="button" class="icon-button" aria-label="Cerrar" :disabled="editSaving" @click="closeEditAccount">
              <X :size="16" />
            </button>
          </div>
          <p v-if="editError" class="login-error" role="alert">{{ editError }}</p>
          <div class="account-action-grid">
            <label class="field wide">
              <span>Nombre completo</span>
              <input v-model.trim="editForm.fullName" required minlength="2" maxlength="160" autocomplete="name" />
            </label>
            <label class="field wide">
              <span>Correo global</span>
              <input v-model.trim="editForm.email" type="email" required maxlength="190" autocomplete="email" />
            </label>
            <label class="field">
              <span>Teléfono <small>(opcional)</small></span>
              <input v-model.trim="editForm.phone" type="tel" maxlength="32" placeholder="+569…" autocomplete="tel" />
            </label>
            <label class="field">
              <span>RUT / identificador <small>(opcional)</small></span>
              <input v-model.trim="editForm.identifier" maxlength="40" placeholder="12.345.678-9" />
            </label>
            <label v-if="can('platform.accounts.disable')" class="field wide">
              <span>Estado global</span>
              <select v-model="editForm.status">
                <option v-for="item in accountStatuses" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
            </label>
          </div>
          <div class="membership-edit-actions">
            <button type="button" class="secondary-button" :disabled="editSaving" @click="closeEditAccount">Cancelar</button>
            <button type="submit" class="primary-button" :disabled="editSaving">
              <span v-if="editSaving" class="spinner"></span>
              <Check v-else :size="18" />
              {{ editSaving ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </form>

        <section v-if="resetOpen" class="panel account-action-box">
          <div class="section-heading">
            <div>
              <h4>{{ resetCredentials ? 'Acceso restablecido' : 'Restablecer acceso' }}</h4>
              <p v-if="!resetCredentials">Elegí si querés restablecer y enviar el correo, o solo restablecer la clave.</p>
              <p v-else>La clave temporal queda abajo{{ resetCredentials.emailSent ? ' y también se envió al correo' : '' }}.</p>
            </div>
            <button type="button" class="icon-button" aria-label="Cerrar" :disabled="resetBusy" @click="closeResetAccess">
              <X :size="16" />
            </button>
          </div>

          <template v-if="!selectedMemberships.length">
            <div class="account-action-notice" data-tone="warn">
              <strong>Sin colegio asignado</strong>
              <span>Esta identidad no puede iniciar sesión hasta que la asignes a un colegio. El restablecimiento de clave queda bloqueado.</span>
            </div>
            <div class="membership-edit-actions">
              <button type="button" class="secondary-button" @click="closeResetAccess">Cerrar</button>
              <button type="button" class="primary-button" @click="detailTab = 'colegios'; closeResetAccess(); openAssignMembership()">
                <Plus :size="16" />Asignar a un colegio
              </button>
            </div>
          </template>

          <template v-else-if="!resetCredentials">
            <div class="account-action-notice">
              <strong>Esta acción no se puede deshacer</strong>
              <span>Se generará una contraseña temporal y se cerrarán todas las sesiones activas. Elegí si también querés enviarla por correo.</span>
            </div>
            <div class="membership-edit-actions reset-access-actions">
              <button type="button" class="secondary-button" :disabled="resetBusy" @click="closeResetAccess">Cancelar</button>
              <button type="button" class="secondary-button" :disabled="resetBusy" @click="confirmResetAccess({ sendEmail: false })">
                <span v-if="resetMode === 'only'" class="spinner"></span>
                <KeyRound v-else :size="17" />
                {{ resetMode === 'only' ? 'Restableciendo…' : 'Solo restablecer' }}
              </button>
              <button type="button" class="primary-button" :disabled="resetBusy" @click="confirmResetAccess({ sendEmail: true })">
                <span v-if="resetMode === 'email'" class="spinner"></span>
                <ShieldCheck v-else :size="17" />
                {{ resetMode === 'email' ? 'Restableciendo…' : 'Restablecer y enviar correo' }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="account-action-notice" :data-tone="resetCredentials.emailSent ? 'ok' : (resetCredentials.emailSkipped ? 'neutral' : 'warn')">
              <strong v-if="resetCredentials.emailSent">Correo enviado</strong>
              <strong v-else-if="resetCredentials.emailSkipped">Acceso restablecido</strong>
              <strong v-else>Correo no enviado</strong>
              <span v-if="resetCredentials.emailSent">Se envió la contraseña temporal a {{ resetCredentials.email }}.</span>
              <span v-else-if="resetCredentials.emailSkipped">La clave no se envió por correo. Copiala y entregala de forma segura.</span>
              <span v-else>{{ resetCredentials.emailReason || 'No se pudo enviar el correo.' }} Podés copiar la clave y entregarla de forma segura.</span>
            </div>
            <dl class="generated-credentials">
              <div>
                <dt>Usuario / correo</dt>
                <dd>{{ resetCredentials.email }}</dd>
              </div>
              <div>
                <dt>Contraseña temporal</dt>
                <dd>
                  <code>{{ resetCredentials.password }}</code>
                  <button type="button" class="edit-button" @click="copyResetPassword">
                    <Copy :size="15" />Copiar
                  </button>
                </dd>
              </div>
            </dl>
            <p v-if="resetCopyHint" class="generated-email-status">{{ resetCopyHint }}</p>
            <div class="membership-edit-actions">
              <button type="button" class="primary-button" @click="closeResetAccess">
                <Check :size="17" />Entendido
              </button>
            </div>
          </template>
        </section>

        <p v-if="detailLoading" class="muted">Actualizando ficha…</p>

        <div class="account-facts">
          <div><span>Estado</span><strong><span class="status-pill" :data-status="selected.account.status">{{ accountStatusLabel(selected.account.status) }}</span></strong></div>
          <div><span>Creada</span><strong>{{ formatDateTime(selected.account.createdAt || selected.account.created_at) }}</strong></div>
          <button type="button" class="account-fact-link" @click="openAccessHistory">
            <span>Último acceso</span>
            <strong>{{ selected.account.lastLoginAt ? formatDateTime(selected.account.lastLoginAt) : 'Sin acceso' }}</strong>
          </button>
          <button type="button" class="account-fact-link" @click="openAccessHistory">
            <span>Última actividad</span>
            <strong>{{ accessSummary?.lastSeenAt ? formatDateTime(accessSummary.lastSeenAt) : '—' }}</strong>
          </button>
          <div><span>Última IP</span><strong>{{ accessSummary?.lastIp || '—' }}</strong></div>
          <div><span>Último colegio</span><strong>{{ accessSummary?.lastSchool?.name || '—' }}</strong></div>
          <button type="button" class="account-fact-link" @click="openAccessHistory">
            <span>Sesiones</span>
            <strong>{{ accessSummary?.activeSessions ?? activeSessions.length }} activas · {{ accessHistory.length }} en historial</strong>
          </button>
          <div><span>RUT / ID</span><strong>{{ selected.account.identifier || '—' }}</strong></div>
          <div><span>Teléfono</span><strong>{{ selected.account.phone || '—' }}</strong></div>
          <div><span>Auth</span><strong>{{ selected.account.authMethod || 'password' }}</strong></div>
        </div>

        <div class="detail-tabs" role="tablist" aria-label="Secciones de la ficha">
          <button type="button" role="tab" :class="{ active: detailTab === 'resumen' }" :aria-selected="detailTab === 'resumen'" @click="setDetailTab('resumen')">Resumen</button>
          <button type="button" role="tab" :class="{ active: detailTab === 'accesos' }" :aria-selected="detailTab === 'accesos'" @click="setDetailTab('accesos')">Historial de accesos</button>
          <button type="button" role="tab" :class="{ active: detailTab === 'colegios' }" :aria-selected="detailTab === 'colegios'" @click="setDetailTab('colegios')">Colegios</button>
          <button type="button" role="tab" :class="{ active: detailTab === 'auditoria' }" :aria-selected="detailTab === 'auditoria'" @click="setDetailTab('auditoria')">Auditoría</button>
        </div>

        <template v-if="detailTab === 'resumen'">
          <div class="tab-panel">
            <div class="access-spotlight">
              <div>
                <h4>Último acceso</h4>
                <p v-if="accessSummary?.lastLoginAt || accessSummary?.lastSeenAt">
                  {{ formatDateTime(accessSummary.lastLoginAt || accessSummary.lastSeenAt) }}
                  <template v-if="accessSummary.lastSchool"> · {{ accessSummary.lastSchool.name }}</template>
                </p>
                <p v-else class="muted">Aún no hay registros de acceso.</p>
                <small v-if="accessSummary?.lastUserAgent">{{ describeAgent(accessSummary.lastUserAgent) }}</small>
                <small v-if="accessSummary?.lastIp">IP {{ accessSummary.lastIp }}</small>
              </div>
              <div>
                <h4>Actividad reciente</h4>
                <p>{{ accessSummary?.activeSessions || 0 }} sesiones activas · {{ accessHistory.length }} en historial</p>
                <p>{{ selectedMemberships.length }} colegios · {{ selected.roles?.length || 0 }} roles de plataforma</p>
                <button type="button" class="secondary-button access-history-jump" @click="openAccessHistory">Ver historial de accesos</button>
              </div>
            </div>

            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Historial de accesos reciente</h4>
                  <p>Últimos ingresos registrados para esta cuenta.</p>
                </div>
                <button v-if="accessHistory.length" type="button" class="secondary-button" @click="openAccessHistory">Ver todo</button>
              </div>
              <div v-if="recentAccessHistory.length" class="table-scroll">
                <table class="detail-table">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Colegio</th>
                      <th>Dispositivo</th>
                      <th>IP</th>
                      <th>Inicio</th>
                      <th>Última actividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in recentAccessHistory" :key="`recent-${item.id}`">
                      <td><span class="status-pill" :data-status="item.active || !item.revokedAt ? 'active' : 'left'">{{ item.active || !item.revokedAt ? 'Activa' : 'Cerrada' }}</span></td>
                      <td>{{ item.school?.name || (item.schoolId ? `#${item.schoolId}` : '—') }}</td>
                      <td>
                        <strong>{{ describeAgent(item.userAgent) }}</strong>
                        <small>{{ item.userAgent || 'Sin user-agent' }}</small>
                      </td>
                      <td>{{ item.ip || '—' }}</td>
                      <td>{{ formatDateTime(item.createdAt) }}</td>
                      <td>{{ formatDateTime(item.lastSeenAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="muted">Sin sesiones registradas todavía.</p>
            </section>

            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Roles de plataforma</h4>
                  <p>Permisos globales fuera de un colegio.</p>
                </div>
                <button v-if="can('platform.accounts.roles')" type="button" class="secondary-button" @click="addPlatformRole">Asignar rol</button>
              </div>
              <div class="role-list">
                <p v-if="!selected.roles?.length" class="muted">Sin roles internos.</p>
                <button
                  v-for="role in selected.roles"
                  :key="role.id"
                  type="button"
                  class="role-chip"
                  :disabled="!can('platform.accounts.roles')"
                  :title="can('platform.accounts.roles') ? `Quitar ${role.role}` : role.role"
                  @click="removePlatformRole(role.role)"
                >
                  {{ role.role }}
                  <span v-if="can('platform.accounts.roles')" aria-hidden="true">×</span>
                </button>
              </div>
            </section>

            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Colegios vinculados</h4>
                  <p>{{ selectedMemberships.length || 0 }} membresías</p>
                </div>
                <div class="section-heading-actions">
                  <button v-if="can('platform.accounts.roles')" type="button" class="secondary-button" @click="openAssignMembership">
                    <Plus :size="15" />Asignar colegio
                  </button>
                  <button v-if="selectedMemberships.length" type="button" class="secondary-button" @click="setDetailTab('colegios')">Administrar</button>
                </div>
              </div>
              <div v-if="selectedMemberships.length" class="summary-memberships">
                <article v-for="membership in selectedMemberships" :key="`sum-${membership.id}`">
                  <strong>{{ schoolName(membership) }}</strong>
                  <span>{{ roleLabel(membership.role) }} · {{ membershipStatusLabel(membership.status) }}</span>
                </article>
              </div>
              <p v-else class="muted">Sin membresías escolares. Asigna esta persona a un colegio para que pueda entrar.</p>
            </section>
          </div>
        </template>

        <template v-else-if="detailTab === 'accesos'">
          <div class="tab-panel">
            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Historial de accesos</h4>
                  <p>{{ activeSessions.length }} activas · {{ accessHistory.length }} registradas</p>
                </div>
                <button v-if="can('platform.accounts.sessions')" type="button" class="secondary-button" @click="revoke">Cerrar todas</button>
              </div>
              <div v-if="accessHistory.length" class="table-scroll">
                <table class="detail-table">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Colegio</th>
                      <th>Dispositivo</th>
                      <th>IP</th>
                      <th>Inicio de sesión</th>
                      <th>Última actividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in pagedAccessHistory" :key="item.id">
                      <td><span class="status-pill" :data-status="item.active || !item.revokedAt ? 'active' : 'left'">{{ item.active || !item.revokedAt ? 'Activa' : 'Cerrada' }}</span></td>
                      <td>{{ item.school?.name || (item.schoolId ? `#${item.schoolId}` : '—') }}</td>
                      <td>
                        <strong>{{ describeAgent(item.userAgent) }}</strong>
                        <small>{{ item.userAgent || 'Sin user-agent' }}</small>
                      </td>
                      <td>{{ item.ip || '—' }}</td>
                      <td>{{ formatDateTime(item.createdAt) }}</td>
                      <td>{{ formatDateTime(item.lastSeenAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <TablePagination
                v-if="accessHistory.length"
                v-model:page="accessHistoryPage"
                :page-count="accessHistoryPageCount"
                :range-label="accessHistoryRangeLabel"
                :show="showAccessHistoryPagination"
              />
              <p v-if="!accessHistory.length" class="muted">Sin sesiones registradas.</p>
            </section>

            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Impersonaciones</h4>
                  <p>Entradas de soporte auditadas</p>
                </div>
              </div>
              <div v-if="selected.impersonations?.length" class="table-scroll">
                <table class="detail-table">
                  <thead>
                    <tr><th>Colegio</th><th>Motivo</th><th>Inicio</th><th>Fin</th><th>IP</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selected.impersonations" :key="item.id">
                      <td>{{ item.school?.name || `#${item.schoolId}` }}</td>
                      <td>{{ item.reason }}</td>
                      <td>{{ formatDateTime(item.startedAt) }}</td>
                      <td>{{ item.endedAt ? formatDateTime(item.endedAt) : 'En curso' }}</td>
                      <td>{{ item.ip || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="muted">Sin impersonaciones registradas.</p>
            </section>
          </div>
        </template>

        <template v-else-if="detailTab === 'colegios'">
          <div class="tab-panel">
            <div class="section-heading">
              <div>
                <h4>Colegios</h4>
                <p>Accesos de esta persona a cada establecimiento.</p>
              </div>
              <button v-if="can('platform.accounts.roles')" type="button" class="primary-button" @click="openAssignMembership">
                <Plus :size="16" />Asignar a un colegio
              </button>
            </div>

            <form v-if="assignOpen" class="panel membership-assign" @submit.prevent="saveAssignMembership">
              <div class="section-heading">
                <div>
                  <h4>Nueva membresía</h4>
                  <p>Crea el acceso local en el colegio con el mismo correo y clave de esta identidad.</p>
                </div>
                <button type="button" class="icon-button" aria-label="Cerrar" @click="closeAssignMembership"><X :size="16" /></button>
              </div>
              <p v-if="assignError" class="login-error" role="alert">{{ assignError }}</p>
              <div class="membership-assign-grid">
                <div class="field school-picker">
                  <span>Colegio</span>
                  <div class="school-picker-control" :class="{ open: assignSchoolOpen }">
                    <div v-if="assignSelectedTenant && !assignSchoolOpen" class="school-picker-chip">
                      <button type="button" class="school-picker-chip-main" @click="openAssignSchoolPicker">
                        <Building2 :size="16" aria-hidden="true" />
                        <span>
                          <strong>{{ assignSelectedTenant.name }}</strong>
                          <small>Colegio #{{ assignSelectedTenant.id || assignSelectedTenant.schoolId }}</small>
                        </span>
                      </button>
                      <button type="button" class="school-picker-clear" aria-label="Quitar colegio" @click="clearAssignSchool">
                        <X :size="14" />
                      </button>
                    </div>
                    <label v-else class="school-picker-input">
                      <Search :size="16" aria-hidden="true" />
                      <input
                        v-model.trim="assignSchoolQuery"
                        type="search"
                        placeholder="Buscar colegio por nombre o ID"
                        :disabled="!assignableTenants.length"
                        autocomplete="off"
                        aria-autocomplete="list"
                        :aria-expanded="assignSchoolOpen"
                        @focus="openAssignSchoolPicker"
                        @input="assignSchoolOpen = true; assignSchoolHighlight = 0"
                        @keydown="onAssignSchoolKeydown"
                        @blur="closeAssignSchoolPicker"
                      />
                      <button
                        v-if="assignSchoolQuery"
                        type="button"
                        class="school-picker-clear-inline"
                        aria-label="Limpiar"
                        @mousedown.prevent="assignSchoolQuery = ''"
                      >
                        <X :size="14" />
                      </button>
                    </label>
                    <div v-if="assignSchoolOpen && assignableTenants.length" class="school-picker-menu" role="listbox">
                      <button
                        v-for="(tenant, index) in assignSchoolOptions"
                        :key="tenant.id || tenant.schoolId"
                        type="button"
                        class="school-picker-option"
                        role="option"
                        :class="{ active: assignSchoolHighlight === index, selected: String(assignForm.schoolId) === String(tenant.id || tenant.schoolId) }"
                        @mousedown.prevent="pickAssignSchool(tenant)"
                      >
                        <span class="school-avatar">{{ String(tenant.name || '?').slice(0, 1).toUpperCase() }}</span>
                        <span>
                          <strong>{{ tenant.name }}</strong>
                          <small>Colegio #{{ tenant.id || tenant.schoolId }}{{ tenant.slug ? ` · ${tenant.slug}` : '' }}</small>
                        </span>
                      </button>
                      <p v-if="!assignSchoolOptions.length" class="school-picker-empty">Sin colegios para “{{ assignSchoolQuery }}”.</p>
                    </div>
                  </div>
                </div>
                <label class="field">
                  <span>Rol en el colegio</span>
                  <select v-model="assignForm.role" required>
                    <option v-for="item in assignableRoles" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>
              </div>
              <p v-if="!assignableTenants.length" class="muted">Ya está vinculada a todos los colegios disponibles.</p>
              <div class="membership-edit-actions">
                <button type="button" class="secondary-button" :disabled="assignSaving" @click="closeAssignMembership">Cancelar</button>
                <button type="submit" class="primary-button" :disabled="assignSaving || !assignableTenants.length || !assignForm.schoolId">
                  {{ assignSaving ? 'Asignando…' : 'Asignar' }}
                </button>
              </div>
            </form>

            <p v-if="!selectedMemberships.length && !assignOpen" class="muted">Esta identidad no tiene membresías escolares.</p>
            <article v-for="membership in selectedMemberships" :key="membership.id" class="membership-card">
              <div class="membership-main">
                <div>
                  <strong>{{ schoolName(membership) }}</strong>
                  <small>{{ membership.school?.slug || `tenant #${membership.schoolId}` }} · usuario local #{{ membership.userId }}</small>
                </div>
                <div class="membership-tags">
                  <span class="role-pill">{{ roleLabel(membership.role) }}</span>
                  <span class="status-pill" :data-status="membership.status">{{ membershipStatusLabel(membership.status) }}</span>
                </div>
              </div>
              <dl class="membership-meta">
                <div><dt>Ingreso</dt><dd>{{ formatDate(membership.joinedAt || membership.joined_at) }}</dd></div>
                <div><dt>Baja</dt><dd>{{ membership.leftAt || membership.left_at ? formatDate(membership.leftAt || membership.left_at) : '—' }}</dd></div>
                <div v-if="membership.localUser"><dt>Usuario local</dt><dd>{{ membership.localUser.username }} · {{ membership.localUser.active ? 'activo' : 'inactivo' }}</dd></div>
                <div v-if="membership.localUser"><dt>Permisos</dt><dd>{{ permissionLabels(membership.localUser).join(', ') || 'Sin permisos especiales' }}</dd></div>
                <div v-if="membership.employee"><dt>Ficha RRHH</dt><dd>{{ membership.employee.position || 'Colaborador' }} #{{ membership.employee.id }}</dd></div>
                <div v-if="membership.guardian"><dt>Apoderado</dt><dd>#{{ membership.guardian.id }} · {{ membership.guardian.email || membership.guardian.phone || 'sin contacto' }}</dd></div>
              </dl>

              <form v-if="editingMembershipId === membership.id" class="membership-edit" @submit.prevent="saveMembership(membership)">
                <label class="field">
                  <span>Rol en el colegio</span>
                  <select v-model="membershipDraft.role" required>
                    <option v-for="item in schoolRoles" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>
                <label class="field">
                  <span>Estado en el colegio</span>
                  <select v-model="membershipDraft.status" required>
                    <option v-for="item in membershipStatuses" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>
                <div class="membership-edit-actions">
                  <button type="button" class="secondary-button" @click="cancelEditMembership">Cancelar</button>
                  <button type="submit" class="primary-button" :disabled="busy">Guardar</button>
                </div>
              </form>

              <div v-else class="membership-actions">
                <button v-if="can('platform.accounts.roles')" type="button" class="secondary-button" @click="startEditMembership(membership)">Editar rol / estado</button>
                <button v-if="can('platform.accounts.impersonate')" type="button" class="primary-button" :disabled="busy" @click="impersonate(membership)">Entrar como esta persona</button>
              </div>
            </article>

            <section v-if="selected.studentProfiles?.length" class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Matrículas asociadas</h4>
                  <p>{{ selected.studentProfiles.length }} perfiles de estudiante</p>
                </div>
              </div>
              <div class="table-scroll">
                <table class="detail-table">
                  <thead><tr><th>Estudiante</th><th>Colegio</th><th>Matrículas</th></tr></thead>
                  <tbody>
                    <tr v-for="student in selected.studentProfiles" :key="student.id">
                      <td>#{{ student.id }} · {{ student.firstName || student.first_name || '' }} {{ student.lastName || student.last_name || '' }}</td>
                      <td>{{ student.school?.name || `#${student.schoolId}` }}</td>
                      <td>{{ student.enrollments?.length || 0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </template>

        <template v-else>
          <div class="tab-panel">
            <section class="detail-block">
              <div class="section-heading">
                <div>
                  <h4>Auditoría</h4>
                  <p>Acciones registradas sobre esta identidad</p>
                </div>
              </div>
              <p v-if="!auditLogs.length" class="muted">Sin acciones registradas.</p>
              <div v-else class="table-scroll">
                <table class="detail-table">
                  <thead><tr><th>Acción</th><th>Colegio</th><th>Entidad</th><th>Fecha</th></tr></thead>
                  <tbody>
                    <tr v-for="item in pagedAuditLogs" :key="item.id">
                      <td>{{ item.action }}</td>
                      <td>{{ item.school?.name || (item.schoolId ? `#${item.schoolId}` : '—') }}</td>
                      <td>{{ item.entity }}{{ item.entityId != null ? ` #${item.entityId}` : '' }}</td>
                      <td>{{ formatDateTime(item.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <TablePagination
                v-if="auditLogs.length"
                v-model:page="auditLogsPage"
                :page-count="auditLogsPageCount"
                :range-label="auditLogsRangeLabel"
                :show="showAuditLogsPagination"
              />
            </section>
          </div>
        </template>
      </article>
    </template>

    <template v-else>
      <header class="accounts-list-header">
        <p class="eyebrow">Plataforma</p>
        <h2>Cuentas de acceso</h2>
        <p>Identidades globales, membresías por colegio, sesiones y soporte auditado.</p>
      </header>

      <div class="panel-with-pager">
      <div class="panel accounts-list-panel">
        <div class="account-filters">
          <label class="field search-field">
            <span>Buscar persona</span>
            <input v-model.trim="query" type="search" placeholder="Nombre, correo, ID global o RUT" />
          </label>
          <label class="field">
            <span>Colegio</span>
            <select v-model="tenantFilter">
              <option value="">Todos los colegios</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="String(tenant.id)">{{ tenant.name }}</option>
            </select>
          </label>
          <label class="field">
            <span>Estado</span>
            <select v-model="statusFilter">
              <option value="">Todos</option>
              <option v-for="item in accountStatuses" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="field">
            <span>Rol en colegio</span>
            <select v-model="roleFilter">
              <option value="">Todos los roles</option>
              <option v-for="item in schoolRoles" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <div class="date-filter-toggle">
            <button type="button" class="secondary-button" @click="showDateFilters = !showDateFilters">
              {{ showDateFilters ? 'Ocultar fechas' : 'Filtrar por fechas' }}
            </button>
          </div>
          <template v-if="showDateFilters">
            <label class="field"><span>Creado desde</span><input v-model="createdFrom" type="date" /></label>
            <label class="field"><span>Creado hasta</span><input v-model="createdTo" type="date" /></label>
            <label class="field"><span>Acceso desde</span><input v-model="loginFrom" type="date" /></label>
            <label class="field"><span>Acceso hasta</span><input v-model="loginTo" type="date" /></label>
          </template>
        </div>

        <div class="accounts-toolbar">
          <div class="accounts-toolbar-sort">
            <label>
              <span>Ordenar</span>
              <select v-model="sortBy">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <button type="button" class="secondary-button" :title="sortDir === 'ASC' ? 'Ascendente' : 'Descendente'" @click="toggleSortDir">
              {{ sortDir === 'ASC' ? 'A → Z' : 'Z → A' }}
            </button>
            <label>
              <span>Por página</span>
              <select v-model.number="pageSize">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </label>
          </div>
          <div class="accounts-toolbar-pager">
            <span>{{ rangeLabel }}{{ tenantFilter ? ' · colegio filtrado' : '' }}</span>
          </div>
        </div>

        <p v-if="loading" class="muted list-hint">Cargando cuentas…</p>

        <div class="table-scroll accounts-table">
          <table>
            <thead>
              <tr>
                <th class="col-person">Persona</th>
                <th class="col-status">Estado</th>
                <th class="col-roles">Roles</th>
                <th class="col-schools">Colegios</th>
                <th class="col-access">Último acceso</th>
                <th class="col-action" aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="clickable-row" tabindex="0" @click="detail(row.id)" @keydown.enter="detail(row.id)">
                <td class="col-person">
                  <div class="account-person">
                    <span class="account-avatar" aria-hidden="true">
                      {{ (row.fullName || '?').split(' ').filter(Boolean).map(v => v[0]).slice(0, 2).join('').toUpperCase() }}
                    </span>
                    <span class="account-person-copy">
                      <strong>{{ row.fullName }}</strong>
                      <small>{{ row.email }}</small>
                    </span>
                  </div>
                </td>
                <td class="col-status">
                  <span class="status-pill" :data-status="row.status">{{ accountStatusLabel(row.status) }}</span>
                </td>
                <td class="col-roles">
                  <div v-if="membershipRoleChips(row.memberships).length" class="role-chip-row">
                    <span v-for="label in membershipRoleChips(row.memberships).slice(0, 2)" :key="`${row.id}-${label}`" class="role-mini-chip">{{ label }}</span>
                    <span v-if="membershipRoleChips(row.memberships).length > 2" class="role-mini-more">+{{ membershipRoleChips(row.memberships).length - 2 }}</span>
                  </div>
                  <span v-else class="muted">Sin rol</span>
                </td>
                <td class="col-schools">
                  <span class="cell-wrap" :title="row.memberships.map(item => item.school?.name || `#${item.schoolId}`).join(', ')">{{ membershipSchoolsLabel(row.memberships) }}</span>
                </td>
                <td class="col-access">
                  <span class="access-plain">{{ shortAccess(row.lastLoginAt) }}</span>
                </td>
                <td class="col-action">
                  <span class="open-hint">Abrir</span>
                  <ChevronRight :size="16" aria-hidden="true" />
                </td>
              </tr>
              <tr v-if="!loading && !rows.length">
                <td colspan="6" class="accounts-empty-cell">No hay personas con ese filtro.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
        <TablePagination
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
.platform-accounts {
  --pa-radius: 12px;
  --pa-radius-sm: 9px;
  --pa-surface: var(--color-canvas, #f8fbfd);
  --pa-border: var(--color-border, #e8edf2);
  --pa-text: var(--color-text, #1d3348);
  --pa-muted: var(--color-subtle, #718195);
  --pa-label: var(--color-muted, #607184);
  --pa-gap: 16px;
  display: grid;
  gap: var(--pa-gap);
}

.muted { color: var(--pa-muted); font-size: 13px; }
.list-hint { margin: 0; }

.accounts-list-header .eyebrow,
.account-header .eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary, #0067b2);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.accounts-list-header h2,
.account-header h2 {
  margin: 0 0 4px;
  color: var(--pa-text);
  font-size: 22px;
  letter-spacing: -.02em;
}
.accounts-list-header p,
.account-sub {
  margin: 0;
  color: var(--pa-label);
  max-width: 640px;
  line-height: 1.45;
}

.accounts-list-panel {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.account-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}
.field { margin: 0; max-width: none; }
.search-field { grid-column: 1 / -1; }
.date-filter-toggle { display: flex; align-items: end; }

.accounts-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: var(--pa-surface);
}
.accounts-toolbar-bottom {
  margin: 0;
  border: 0;
  border-top: 1px solid var(--pa-border);
  border-radius: 0;
  background: transparent;
  padding: 12px 0 0;
}
.accounts-toolbar-sort,
.accounts-toolbar-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.accounts-toolbar-sort label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--pa-label);
  font-size: 13px;
}
.accounts-toolbar-sort select {
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius-sm);
  background: #fff;
}
.accounts-toolbar-pager span { color: var(--pa-label); font-size: 13px; }

.accounts-table {
  margin-top: 0;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  overflow: auto;
  background: #fff;
}
.accounts-table table {
  width: 100%;
  min-width: 760px;
  border-collapse: separate;
  border-spacing: 0;
  white-space: normal;
  table-layout: fixed;
}
.accounts-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px 14px;
  border-bottom: 1px solid var(--pa-border);
  color: var(--pa-label);
  background: var(--pa-surface);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}
.accounts-table th:first-child { border-radius: 0; }
.accounts-table th:last-child { border-radius: 0; }
.accounts-table td {
  padding: 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--pa-border) 70%, transparent);
  vertical-align: middle;
  color: var(--pa-text);
  font-size: 13px;
  font-weight: 550;
  white-space: normal;
  word-break: break-word;
}
.accounts-table tr:last-child td { border-bottom: 0; }
.accounts-table .col-person { width: 28%; }
.accounts-table .col-status { width: 12%; }
.accounts-table .col-roles { width: 18%; }
.accounts-table .col-schools { width: 22%; }
.accounts-table .col-access { width: 16%; }
.accounts-table .col-action {
  width: 88px;
  padding-left: 0;
  padding-right: 14px;
  color: var(--pa-muted);
  text-align: right;
  white-space: nowrap;
}
.open-hint {
  margin-right: 4px;
  color: var(--color-primary, #0067b2);
  font-size: 12px;
  font-weight: 750;
  opacity: 0;
  transition: opacity .15s ease;
}
.clickable-row:hover .open-hint,
.clickable-row:focus-visible .open-hint { opacity: 1; }
.role-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.role-mini-chip {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--color-primary, #0067b2);
  background: var(--color-primary-soft, #e8f3fb);
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}
.role-mini-more {
  color: var(--pa-muted);
  font-size: 11px;
  font-weight: 700;
}
.access-plain {
  color: var(--pa-label);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.account-person {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.account-avatar {
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
  letter-spacing: .02em;
}
.account-person-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.account-person-copy strong {
  overflow: hidden;
  color: var(--pa-text);
  font-size: 14px;
  font-weight: 750;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.account-person-copy small {
  display: block;
  overflow: hidden;
  margin: 0;
  color: var(--pa-muted);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cell-wrap {
  display: -webkit-box;
  overflow: hidden;
  color: var(--pa-label);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.accounts-empty-cell {
  padding: 28px 14px !important;
  color: var(--pa-muted);
  text-align: center;
}
.clickable-row { cursor: pointer; transition: background .15s ease; }
.clickable-row:hover td { background: color-mix(in srgb, var(--color-primary, #0067b2) 5%, white); }
.clickable-row:hover .col-action { color: var(--color-primary, #0067b2); }
.clickable-row:focus-visible { outline: 2px solid var(--color-primary, #0067b2); outline-offset: -2px; }

.access-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-primary, #0067b2);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
}
.access-link:hover { text-decoration: underline; text-underline-offset: 2px; }

.detail-toolbar { display: flex; }
.back-button { display: inline-flex; align-items: center; gap: 8px; }

.account {
  padding: 22px;
  display: grid;
  gap: 18px;
}
.account-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
  padding-bottom: 4px;
}
.account-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.account-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}
.account-facts > div {
  padding: 12px 14px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: var(--pa-surface);
  display: grid;
  gap: 6px;
}
.account-facts span {
  color: var(--pa-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
}
.account-facts strong {
  color: var(--pa-text);
  font-size: 13px;
  font-weight: 700;
}
.account-fact-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.account-fact-link:hover strong {
  color: var(--color-primary, #0067b2);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.access-history-jump {
  margin-top: 10px;
  align-self: start;
}

.detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: var(--pa-surface);
}
.detail-tabs button {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--pa-radius-sm);
  background: transparent;
  color: var(--pa-label);
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}
.detail-tabs button.active {
  color: #fff;
  background: var(--color-primary, #0067b2);
}
.detail-tabs button:not(.active):hover {
  background: color-mix(in srgb, var(--color-primary, #0067b2) 8%, transparent);
  color: var(--pa-text);
}

.tab-panel {
  display: grid;
  gap: 20px;
}
.detail-block {
  display: grid;
  gap: 12px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.section-heading h4 {
  margin: 0 0 2px;
  color: var(--pa-text);
  font-size: 15px;
  font-weight: 750;
}
.section-heading p {
  margin: 0;
  color: var(--pa-label);
  font-size: 13px;
}
.section-heading-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.membership-assign {
  display: grid;
  gap: 14px;
  padding: 16px 18px;
  margin-bottom: 8px;
  overflow: visible;
}
.membership-assign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  align-items: start;
}
.membership-assign .field { margin: 0; max-width: none; }
.membership-assign .school-picker {
  position: relative;
  z-index: 5;
  display: grid;
  gap: 6px;
}
.membership-assign .school-picker > span {
  color: var(--pa-label, #607184);
  font-size: 12px;
  font-weight: 700;
}
.school-picker-control { position: relative; }
.school-picker-input,
.school-picker-chip {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--pa-border, #dfe7ee);
  border-radius: 10px;
  background: #fff;
  text-align: left;
  color: inherit;
}
.school-picker-chip { padding-right: 6px; cursor: default; }
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
.school-picker-chip strong,
.school-picker-option strong {
  display: block;
  color: var(--pa-text, #0a2540);
  font-size: 13px;
}
.school-picker-chip small,
.school-picker-option small {
  display: block;
  color: var(--pa-muted, #607184);
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
  border: 1px solid var(--pa-border, #dfe7ee);
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

.access-spotlight {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}
.access-spotlight > div {
  padding: 14px 16px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: var(--pa-surface);
  display: grid;
  gap: 6px;
}
.access-spotlight h4 { margin: 0; font-size: 13px; color: var(--pa-text); }
.access-spotlight p { margin: 0; color: var(--pa-text); font-size: 13px; font-weight: 650; }
.access-spotlight small { color: var(--pa-muted); font-size: 12px; }

.role-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.role-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  background: #fff;
  color: var(--pa-text);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.role-chip:disabled { cursor: default; }
.role-chip:not(:disabled):hover {
  border-color: color-mix(in srgb, var(--color-primary, #0067b2) 35%, var(--pa-border));
  background: var(--color-primary-soft, #e8f3fb);
}
.role-chip span { color: var(--pa-muted); font-size: 14px; line-height: 1; }

.summary-memberships {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}
.summary-memberships article {
  padding: 12px 14px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  display: grid;
  gap: 4px;
  background: #fff;
}
.summary-memberships strong { color: var(--pa-text); font-size: 14px; }
.summary-memberships span { color: var(--pa-label); font-size: 12px; }

.membership-card {
  padding: 16px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: #fff;
  display: grid;
  gap: 14px;
}
.membership-main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.membership-main strong { display: block; color: var(--pa-text); font-size: 15px; }
.membership-main small { color: var(--pa-muted); font-size: 12px; }
.membership-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.membership-meta {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.membership-meta > div {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--pa-surface);
}
.membership-meta dt {
  margin: 0 0 4px;
  color: var(--pa-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.membership-meta dd {
  margin: 0;
  color: var(--pa-text);
  font-size: 13px;
  font-weight: 650;
}
.membership-edit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding-top: 4px;
}
.membership-edit .field { margin: 0; max-width: none; }
.membership-edit-actions,
.membership-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.role-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-primary-soft, #e8f3fb);
  color: var(--color-primary, #0b5f98);
  font-size: 11px;
  font-weight: 750;
}
.status-pill {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef2f6;
  color: var(--pa-label);
  font-size: 11px;
  font-weight: 700;
}
.status-pill[data-status='active'] { background: #e8f6ee; color: #166534; }
.status-pill[data-status='blocked'],
.status-pill[data-status='suspended'],
.status-pill[data-status='left'] { background: #fef2f2; color: #991b1b; }

.detail-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.detail-table th {
  padding: 10px 12px;
  border-bottom: 1px solid var(--pa-border);
  color: var(--pa-label);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-align: left;
  text-transform: uppercase;
}
.detail-table td {
  padding: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--pa-border) 70%, transparent);
  vertical-align: top;
}
.detail-table td small {
  margin-top: 4px;
  max-width: 320px;
  word-break: break-word;
}

.account-action-box {
  display: grid;
  gap: 14px;
  padding: 16px 18px;
  margin: 0 0 4px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius);
  background: var(--pa-surface);
}
.account-action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.account-action-grid .field { margin: 0; max-width: none; }
.account-action-grid .field.wide { grid-column: 1 / -1; }
.account-action-notice {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--pa-radius-sm);
  background: #fff7ed;
  color: var(--pa-text);
}
.account-action-notice[data-tone='ok'] { background: #e8f6ee; }
.account-action-notice[data-tone='warn'] { background: #fff7ed; }
.account-action-notice[data-tone='neutral'] { background: #f3f6f9; }
.account-action-notice strong { font-size: 13px; }
.account-action-notice span { color: var(--pa-label); font-size: 13px; line-height: 1.4; }
.reset-access-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}
.generated-credentials {
  display: grid;
  gap: 10px;
  margin: 0;
}
.generated-credentials > div {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--pa-border);
  border-radius: var(--pa-radius-sm);
  background: #fff;
}
.generated-credentials dt {
  color: var(--pa-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.generated-credentials dd {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--pa-text);
  font-size: 14px;
  font-weight: 650;
}
.generated-credentials code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  word-break: break-all;
}
.generated-email-status {
  margin: 0;
  color: var(--color-primary, #0067b2);
  font-size: 13px;
  font-weight: 650;
}
.account-header-actions .secondary-button.active,
.account-header-actions .primary-button.active {
  outline: 2px solid color-mix(in srgb, var(--color-primary, #0067b2) 35%, transparent);
  outline-offset: 1px;
}

@media (max-width: 720px) {
  .accounts-list-panel,
  .account { padding: 16px; }
  .account-header-actions,
  .membership-actions,
  .membership-edit-actions { width: 100%; }
  .account-header-actions > *,
  .membership-actions > *,
  .membership-edit-actions > * { flex: 1 1 auto; }
  .accounts-toolbar { align-items: stretch; }
  .accounts-toolbar-sort,
  .accounts-toolbar-pager { width: 100%; }
}
</style>
