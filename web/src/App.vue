<script setup>
import { AppShell, Sidebar, Topbar, PageHeader, PageActions, FilterBar, SearchInput, StatCard, DataTable, TablePagination, StatusBadge, EmptyState, ErrorState, Skeleton, FormSection, Tabs, Modal, ConfirmDialog, Toast, Breadcrumbs, Timeline, ActionMenu } from './components/ui/index.js';
import { formatDate, formatCurrency, formatCell as formatModuleCell, formatRut, enumLabels } from './design/format.js';
import { auth } from './api/auth.js';
import { students as studentsApi } from './api/students.js';
import { courses as coursesApi } from './api/courses.js';
import { reports } from './api/reports.js';
import Payroll from './components/Payroll.vue';
import PayrollPayments from './components/PayrollPayments.vue';
import Schedule from './components/Schedule.vue';
import Classroom from './components/Classroom.vue';
import CourseForum from './components/CourseForum.vue';
import Planning from './components/Planning.vue';
import Admissions from './components/Admissions.vue';
import Guardians from './components/Guardians.vue';
import PublicAdmission from './components/PublicAdmission.vue';
import ContactInbox from './components/ContactInbox.vue';
import PlatformOverview from './components/PlatformOverview.vue';
import PlatformDemo from './components/PlatformDemo.vue';
import PlatformPeople from './components/PlatformPeople.vue';
import PlatformTenants from './components/PlatformTenants.vue';
import PlatformAccounts from './components/PlatformAccounts.vue';
import PlatformSmtp from './components/PlatformSmtp.vue';
import PlatformBilling from './components/PlatformBilling.vue';
import PlatformSessions from './components/PlatformSessions.vue';
import IntegrationsSettings from './components/IntegrationsSettings.vue';
import { NOTIFY_KEY } from './composables/notify.js';
import { pageWindow, useClientPagination } from './composables/pagination.js';
import AnnualResults from './components/AnnualResults.vue';
import SigeIntegration from './components/SigeIntegration.vue';
import Attendance from './components/Attendance.vue';
import LeaveRequests from './components/LeaveRequests.vue';
import TeacherTasks from './components/TeacherTasks.vue';
import StudentSigeStatus from './components/StudentSigeStatus.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import { request, download, session, configureSession, latestRequest, storageGet, storageSet, storageRemove, sessionFlagGet, sessionFlagSet, sessionFlagRemove } from './api/client.js';
import { CHILE_CITIES } from './data/chile-cities.js';
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import {
  AlertTriangle, ArrowLeft, Bell, BookOpen, Building2, CalendarDays, Camera, Check, ChevronDown, ChevronRight,
  ClipboardCheck, ClipboardList, Copy, CreditCard, Download, Eye, EyeOff, FileText, GraduationCap, History, Inbox, LayoutDashboard, Lock, LogIn, LogOut, Mail, Menu,
  MessageSquare, MessageCircle, MoreHorizontal, PanelLeft, PanelLeftClose, PanelLeftOpen, Pencil, PenLine, Plus, Radio, RefreshCw, Search, Send, Settings, ShieldCheck, Sparkles, Trash2, TrendingUp,
  Upload, User, UserPlus, Users, UserRoundX, X, ChevronUp
} from '@lucide/vue';

configureSession(() => clearAuth());
const authUser = ref(null);
const authLoading = ref(true);
const publicAdmissionSchoolId = ref(null);
const loginLoading = ref(false);
const loginError = ref('');
const showPassword = ref(false);
const loginForm = reactive({ username: '', password: '', tenantId: null });
const loginSchoolChoices = ref([]);
const loginSchoolMessage = ref('');
const loginPanel = ref('login'); // login | forgot | forgot-sent | school-choice | demo-guide
const demoGuide = ref(null);
const demoGuideOpenFromSession = ref(false);
const forgotEmail = ref('');
const forgotLoading = ref(false);
const forgotError = ref('');
const forgotMessage = ref('');
const currentView = ref('Resumen');
const sidebarOpen = ref(false);
const sidebarCompact = ref(sessionFlagGet('sidebar_compact') === '1');
const loading = ref(true);
const error = ref('');
const gradeStudentLocked = ref(false);
const gradeStep = ref('pick'); // pick | form
const gradeReturnStudentId = ref(null);
const gradeStudents = ref([]);
const gradeStudentsLoading = ref(false);
const gradeError = ref('');
const saving = ref(false);
const selectedCourse = ref('');
const courseDetailId = ref(null);
const classroomSection = ref('tareas');
const classroomForumId = ref(null);
const classroomOpenSettings = ref(false);
const classroomConfigTab = ref('head');
const DEFAULT_COURSE_FORUM_GUIDELINES = [
  'Normas generales de los foros de este curso:',
  '• Participa con respeto mutuo hacia compañeros y docentes.',
  '• Usa un lenguaje claro y cordial; no se permiten insultos, burlas ni mensajes ofensivos.',
  '• Comparte dudas o aportes de forma concreta para ayudar a la conversación.',
  '• Este es un espacio de aprendizaje: colabora y cuida el clima del curso.',
].join('\n');
const classroomForumSettings = reactive({
  allowStudentsCreateForum: false,
  allowStudentsReplyForum: true,
  forumGuidelines: DEFAULT_COURSE_FORUM_GUIDELINES,
});
const classroomForumSettingsLoading = ref(false);
const classroomForumSettingsSaving = ref(false);
const classroomForumSettingsError = ref('');
const classroomHeadTeacherSaving = ref(false);
const classroomHeadTeacherError = ref('');
const classroomHeadTeachers = ref([]);
const classroomSubjectTeachers = reactive({});
const classroomSubjectSavingId = ref(null);
const classroomSubjectError = ref('');
const classroomSubjectFocusId = ref(null);
const canConfigureCourseForum = computed(() => Boolean(authUser.value?.permissions?.manageGrades || authUser.value?.permissions?.manageSchool));
const canManageAcademicStructure = computed(() => Boolean(authUser.value?.permissions?.manageSchool || authUser.value?.role === 'utp'));
const canOpenClassroomConfig = computed(() => Boolean(canManageAcademicStructure.value || canConfigureCourseForum.value));
const selectedEmployee = ref(null);
const employeeStatus = ref('active');
const employeeDetailLoading = ref(false);
const hrSubmenuOpen = computed(() => ['RRHH', 'Remuneraciones', 'Solicitudes', 'Nueva solicitud'].includes(currentView.value));
const hrChildView = computed(() => ['Remuneraciones', 'Solicitudes', 'Nueva solicitud'].includes(currentView.value));
function isNavItemActive(item) {
  if (item.label === 'RRHH') return currentView.value === 'RRHH';
  if (item.label === 'Solicitudes') return currentView.value === 'Solicitudes' || currentView.value === 'Nueva solicitud';
  if (item.label === 'Tareas activas') return currentView.value === 'Tareas activas' || currentView.value === 'Historial de tareas';
  return currentView.value === item.label;
}
function navItemHasActiveChild(item) {
  return item.label === 'RRHH' && hrChildView.value;
}
function openEmployeeList(status) {
  employeeStatus.value = status;
  selectedEmployee.value = null;
  employeePositionFilter.value = '';
  currentView.value = 'RRHH';
  expandedNav.value = 'Recursos humanos';
  sidebarOpen.value = false;
  window.history.pushState({}, '', status === 'inactive' ? '/empleados/historial' : '/empleados/activos');
  loadModule('hr');
}
function openHrPayments() {
  selectedEmployee.value = null;
  navigate('Remuneraciones');
  expandedNav.value = 'Recursos humanos';
}
function openHrCargos() {
  if (!authUser.value?.permissions?.manageSchool) {
    showToast('No tienes permiso para administrar cargos.', 'error');
    return;
  }
  openSchoolSettingsPage({ tab: 'jobs' });
}
function openHrPrevired() {
  selectedEmployee.value = null;
  navigate('Remuneraciones');
  expandedNav.value = 'Recursos humanos';
  window.history.replaceState({ view: 'Remuneraciones' }, '', '/remuneraciones/pagos?panel=previred');
}
function openHrDocuments() {
  navigate('Documentos');
}
const expandedNav = ref('');
const search = ref('');
const searchOpen = ref(false);
const courses = ref([]);
const courseGroups = ref([]);
const students = ref([]);
const studentStatusFilter = ref('active');
const studentEnrollmentFilter = ref('all'); // all | enrolled | unenrolled
const studentGradeFilter = ref('all'); // all | lt | gt | none
const studentGradeThreshold = ref(4);
const studentDirectorySearch = ref('');
const courseDirectorySearch = ref('');
const studentAvatars = ref({});
const staffAvatars = ref({});
const fullImagePreview = ref(null);
const grades = ref([]);
const studentProfile = ref(null);
const studentProfileLoading = ref(false);
const studentProfileSection = ref('notas');
const selectedStudentYear = ref('all');
const expandedGradeGroup = ref('');
const staffUsers = ref([]);
const staffRoleFilter = ref('all');
const staffFlagFilter = ref('all');
const staffStatusFilter = ref('active');
const staffListSort = ref({ key: 'fullName', dir: 'asc' });
function toggleStaffListSort(key) {
  if (staffListSort.value.key === key) {
    staffListSort.value = { key, dir: staffListSort.value.dir === 'asc' ? 'desc' : 'asc' };
    return;
  }
  staffListSort.value = { key, dir: key === 'permissions' || key === 'status' ? 'desc' : 'asc' };
}
function staffSortAria(key) {
  if (staffListSort.value.key !== key) return 'none';
  return staffListSort.value.dir === 'asc' ? 'ascending' : 'descending';
}
const staffLoading = ref(false);
const staffFormOpen = ref(false);
const staffSaving = ref(false);
const staffError = ref('');
const generatedCredentials = ref(null);
const passwordSaving = ref(false);
const passwordError = ref('');
const accountSaving = ref(false);
const accountError = ref('');
const accountTab = ref('profile');
const signaturePreview = ref('');
const signatureBusy = ref(false);
const ACCOUNT_TAB_SLUGS = {
  profile: 'perfil',
  security: 'seguridad',
  access: 'acceso',
  notifications: 'notificaciones',
};
const ACCOUNT_TAB_FROM_SLUG = {
  perfil: 'profile',
  seguridad: 'security',
  acceso: 'access',
  notificaciones: 'notifications',
};
const accessSessions = computed(() => accessInfo.value?.sessions || []);
const {
  page: accessSessionsPage,
  pageCount: accessSessionsPageCount,
  paged: pagedAccessSessions,
  rangeLabel: accessSessionsRangeLabel,
  show: showAccessSessionsPagination,
  goPrev: accessSessionsPrevPage,
  goNext: accessSessionsNextPage,
  reset: resetAccessSessionsPage,
} = useClientPagination(accessSessions, { pageSize: 10 });
const schoolTab = ref('institutional');
const SCHOOL_TAB_SLUGS = {
  info: 'informacion',
  institutional: 'datos',
  levels: 'niveles',
  sidepanel: 'sidepanel',
  banking: 'cuenta-bancaria',
  jobs: 'cargos',
};
const SCHOOL_TAB_FROM_SLUG = {
  informacion: 'info',
  datos: 'institutional',
  niveles: 'levels',
  sidepanel: 'sidepanel',
  logo: 'sidepanel',
  'cuenta-bancaria': 'banking',
  bancaria: 'banking',
  cargos: 'jobs',
};
const integrationsTab = ref('whatsapp');
const INTEGRATIONS_TAB_SLUGS = {
  whatsapp: 'whatsapp',
  webpay: 'webpay',
};
const accessLoading = ref(false);
const accessError = ref('');
const accessBusy = ref(false);
const accessInfo = ref(null);
const moduleLoading = ref(false);
const moduleData = ref(null);
const moduleSearch = ref('');
const classbookKindFilter = ref('');
const employeePositionFilter = ref('');
const modulePages = reactive({});
const moduleSort = reactive({});
const pageSize = 10;
const normalizeSearch = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const linkedDocuments = ref(null);
const linkedDocumentOwner = ref(null);
const profileAvatar = ref('');
const deletingEmployeeId = ref(null);
function filteredModuleRows(section) {
  const query = normalizeSearch(moduleSearch.value);
  return section.rows.filter((row) => {
    if (currentView.value === 'Documentos' && documentKind.value && formatModuleCell('kind', row.kind) !== documentKind.value) return false;
    if (currentView.value === 'RRHH' && employeePositionFilter.value && String(row.position || '') !== employeePositionFilter.value) return false;
    if (currentView.value === 'Libro de clases' && classbookKindFilter.value && String(row.kind || '') !== classbookKindFilter.value) return false;
    if (!query) return true;
    if (currentView.value === 'Libro de clases') {
      const haystack = normalizeSearch([
        row.studentName,
        row.studentId,
        row.courseName,
        row.detail,
        row.kind,
        formatModuleCell('kind', row.kind),
        row.attachmentName,
      ].join(' '));
      return haystack.includes(query);
    }
    if (currentView.value === 'Historial' || currentView.value === 'Citaciones') {
      const columns = section.columns || [];
      const haystack = normalizeSearch(columns.map((column) => {
        const context = currentView.value === 'Citaciones' ? 'citation' : '';
        return formatModuleCell(column.key, row[column.key], context);
      }).concat([
        row.studentName,
        row.guardianName,
        row.actorName,
        row.payloadSummary,
        row.reason,
        row.detail,
      ]).join(' '));
      return haystack.includes(query);
    }
    return normalizeSearch(Object.values(row).join(' ')).includes(query);
  });
}
function moduleSortState(section) {
  const title = section?.title || '';
  const fallbackKey = section?.columns?.[0]?.key || '';
  if (moduleSort[title]) return moduleSort[title];
  if (currentView.value === 'Libro de clases' && (title === 'Observaciones' || fallbackKey === 'createdAt')) {
    return { key: 'createdAt', dir: 'DESC' };
  }
  return { key: fallbackKey, dir: 'ASC' };
}
function onModuleSort(section, key) {
  if (!key) return;
  const current = moduleSortState(section);
  const dir = current.key === key && String(current.dir).toUpperCase() === 'ASC' ? 'DESC' : 'ASC';
  moduleSort[section.title] = { key, dir };
  modulePages[section.title] = 1;
}
function sortedModuleRows(section) {
  const rows = [...filteredModuleRows(section)];
  const { key, dir } = moduleSortState(section);
  if (!key) return rows;
  const factor = String(dir).toUpperCase() === 'DESC' ? -1 : 1;
  const context = currentView.value === 'Citaciones' ? 'citation' : '';
  rows.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (key === 'createdAt' || key === 'sentAt' || /(?:At|On)$/.test(key)) {
      const cmp = String(av || '').localeCompare(String(bv || ''));
      if (cmp) return cmp * factor;
    } else if (typeof av === 'number' || typeof bv === 'number' || key === 'amount' || key === 'monthlySalary' || key === 'stock') {
      const cmp = (Number(av) || 0) - (Number(bv) || 0);
      if (cmp) return cmp * factor;
    } else {
      const as = String(formatModuleCell(key, av, context) || av || '');
      const bs = String(formatModuleCell(key, bv, context) || bv || '');
      const cmp = as.localeCompare(bs, 'es', { sensitivity: 'base', numeric: true });
      if (cmp) return cmp * factor;
    }
    return String(a?.id || '').localeCompare(String(b?.id || ''), 'es') * factor;
  });
  return rows;
}
function modulePageCount(section) { return Math.max(1, Math.ceil(filteredModuleRows(section).length / pageSize)); }
function modulePage(section) { return Math.min(modulePages[section.title] || 1, modulePageCount(section)); }
function pagedModuleRows(section) { return sortedModuleRows(section).slice((modulePage(section) - 1) * pageSize, modulePage(section) * pageSize); }
function setModulePage(section, page) {
  const total = modulePageCount(section);
  const next = Math.min(Math.max(1, Number(page) || 1), total);
  modulePages[section.title] = next;
}
function modulePageWindow(section) {
  return pageWindow(modulePage(section), modulePageCount(section), 10);
}
function moduleRangeLabel(section) {
  const total = filteredModuleRows(section).length;
  if (!total) return '0 resultados';
  const from = (modulePage(section) - 1) * pageSize + 1;
  const to = Math.min(total, modulePage(section) * pageSize);
  return `${from}–${to} de ${total}`;
}
function showModulePagination(section) {
  return filteredModuleRows(section).length > 0;
}
watch([moduleSearch, currentView, employeePositionFilter, classbookKindFilter], () => {
  for (const key of Object.keys(modulePages)) delete modulePages[key];
});
watch(currentView, () => {
  moduleSearch.value = '';
  employeePositionFilter.value = '';
  classbookKindFilter.value = '';
  for (const key of Object.keys(moduleSort)) delete moduleSort[key];
});
async function showLinkedDocuments(type, id, name) {
  linkedDocumentOwner.value = { type, id, name };
  currentView.value = 'Documentos asociados';
  const url = '/documentos/asociados?' + new URLSearchParams({ type, id, name });
  if (window.location.pathname + window.location.search !== url) window.history.pushState({}, '', url);
  linkedDocuments.value = [];
  try { linkedDocuments.value = await request(`/documents?${type}=${id}`); }
  catch (err) { error.value = err.message; linkedDocuments.value = null; }
}
function backFromDocuments() { window.history.back(); }
function openDocumentUploadPage({ owner = null, push = true } = {}) {
  Object.assign(documentForm, {
    name: '',
    kind: documentKind.value || 'General',
    studentId: '',
    employeeId: '',
    userId: '',
    file: null,
  });
  documentStudentSearch.value = '';
  managementError.value = '';
  if (owner && ['studentId', 'employeeId', 'userId'].includes(owner.type) && owner.id) {
    documentForm[owner.type] = owner.id;
    linkedDocumentOwner.value = { type: owner.type, id: owner.id, name: owner.name || '' };
  } else {
    linkedDocumentOwner.value = null;
  }
  currentView.value = 'Subir documento';
  const params = new URLSearchParams();
  if (owner?.type && owner?.id) {
    params.set('type', owner.type);
    params.set('id', String(owner.id));
    if (owner.name) params.set('name', owner.name);
  }
  const url = params.toString() ? `/documentos/nuevo?${params}` : '/documentos/nuevo';
  if (push) window.history.pushState({ view: 'Subir documento' }, '', url);
  sidebarOpen.value = false;
}
function uploadLinkedDocument() {
  const owner = linkedDocumentOwner.value;
  if (!owner) return openDocumentUploadPage();
  openDocumentUploadPage({ owner });
}
let profileAvatarLoadId = 0;
function setStudentAvatarUrl(studentId, url) {
  const previous = studentAvatars.value[studentId];
  if (previous && previous !== url) URL.revokeObjectURL(previous);
  studentAvatars.value = { ...studentAvatars.value, [studentId]: url };
}
function clearStudentAvatarUrl(studentId) {
  const previous = studentAvatars.value[studentId];
  if (previous) URL.revokeObjectURL(previous);
  const next = { ...studentAvatars.value };
  delete next[studentId];
  studentAvatars.value = next;
}
async function loadProfileAvatar() {
  const loadId = ++profileAvatarLoadId;
  if (profileAvatar.value) URL.revokeObjectURL(profileAvatar.value);
  profileAvatar.value = '';
  const student = studentProfile.value?.student;
  const id = student?.id;
  if (!id || !(student.avatar_key || student.avatarKey)) return;
  try {
    const response = await download(`/students/${id}/avatar?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok || loadId !== profileAvatarLoadId || studentProfile.value?.student?.id !== id) return;
    const blob = await response.blob();
    if (loadId !== profileAvatarLoadId || studentProfile.value?.student?.id !== id) return;
    profileAvatar.value = URL.createObjectURL(blob);
    setStudentAvatarUrl(id, URL.createObjectURL(blob));
  } catch { /* Initials remain available when there is no image. */ }
}
watch(() => studentProfile.value?.student?.id, loadProfileAvatar);
async function uploadAvatar(event) {
  const file = event.target.files?.[0];
  if (!file || !studentProfile.value?.student?.id) return;
  const studentId = studentProfile.value.student.id;
  const localUrl = URL.createObjectURL(file);
  const listUrl = URL.createObjectURL(file);
  try {
    const body = new FormData();
    body.append('file', file);
    const result = await request(`/students/${studentId}/avatar`, { method: 'POST', body });
    const key = result?.avatarKey || result?.avatar_key || `uploaded-${Date.now()}`;
    profileAvatarLoadId += 1;
    if (profileAvatar.value && profileAvatar.value !== localUrl) URL.revokeObjectURL(profileAvatar.value);
    profileAvatar.value = localUrl;
    if (studentProfile.value?.student?.id === studentId) {
      studentProfile.value.student.avatar_key = key;
      studentProfile.value.student.avatarKey = key;
    }
    setStudentAvatarUrl(studentId, listUrl);
    showToast('Foto actualizada');
  } catch (err) {
    URL.revokeObjectURL(localUrl);
    URL.revokeObjectURL(listUrl);
    showToast(err.message || 'No se pudo subir la foto.', 'error');
  }
  event.target.value = '';
}
async function removeAvatar() {
  if (!studentProfile.value?.student?.id || !profileAvatar.value) return;
  if (!(await askConfirmation('¿Quitar la foto de este estudiante?'))) return;
  const studentId = studentProfile.value.student.id;
  try {
    await request(`/students/${studentId}/avatar`, { method: 'DELETE' });
    profileAvatarLoadId += 1;
    if (profileAvatar.value) URL.revokeObjectURL(profileAvatar.value);
    profileAvatar.value = '';
    if (studentProfile.value?.student) {
      studentProfile.value.student.avatar_key = null;
      studentProfile.value.student.avatarKey = null;
    }
    clearStudentAvatarUrl(studentId);
    showToast('Foto eliminada');
  } catch (err) {
    showToast(err.message || 'No se pudo quitar la foto.', 'error');
  }
}
function openNotification(item) {
  notificationsOpen.value = false;
  if (item.target?.startsWith('/comunicaciones/')) {
    const communicationId = Number(String(item.target).split('/')[2]);
    if (Number.isInteger(communicationId) && communicationId > 0) {
      openCommunicationDetail(communicationId);
      return;
    }
  }
  if (item.target?.startsWith('/cursos/')) {
    const parts = String(item.target).split('/').filter(Boolean);
    const courseId = Number(parts[1]);
    const section = parts[2] === 'foros' ? 'foros' : 'tareas';
    const forumId = parts[2] === 'foros' ? Number(parts[3]) : null;
    if (Number.isInteger(courseId) && courseId > 0) {
      openCourseClassroom(courseId, section, forumId ? { forumId } : {});
      return;
    }
  }
  if (item.target === '/solicitudes' || item.target?.startsWith('/solicitudes')) {
    const leaveId = Number(String(item.target).split('/')[2]);
    if (Number.isInteger(leaveId) && leaveId > 0) {
      window.history.pushState({ view: 'Solicitudes', leaveId }, '', `/solicitudes/${leaveId}`);
      leaveRequestsKey.value += 1;
      currentView.value = 'Solicitudes';
      closeHeaderMenus();
      return;
    }
    navigate('Solicitudes');
  } else if (item.target?.startsWith('/estudiantes/')) {
    const studentId = Number(item.target.split('/')[2]);
    if (String(item.target).includes('/notas')) openStudentNotas(studentId);
    else if (String(item.target).includes('/anotaciones')) openStudentAnotaciones(studentId);
    else openStudentFicha(studentId);
  } else if (item.target?.startsWith('/plataforma')) {
    if (item.target.startsWith('/plataforma/demo')) navigate('Colegios demo');
    else if (item.target.startsWith('/plataforma/colegios')) navigate('Colegios');
    else if (item.target.startsWith('/plataforma/gente')) navigate('Buscar gente');
    else if (item.target.startsWith('/plataforma/cuentas')) navigate('Cuentas');
    else if (item.target.startsWith('/plataforma/sesiones')) navigate('Sesiones');
    else if (item.target.startsWith('/plataforma/contacto')) navigate('Inbox de contacto');
    else if (item.target.startsWith('/plataforma/pagos')) navigate('Plataforma pagos');
    else navigate('Plataforma');
  } else if (item.target === '/comunicaciones' || canOpenCommunications.value) {
    navigate('Comunicaciones');
  }
}

const activeModuleSection = ref('');
const notifications = ref([]);
const leavePendingCount = ref(0);
const leaveRequestsKey = ref(0);
const lastReadNotificationId = ref(0);
const notificationsOpen = ref(false);
const profileMenuOpen = ref(false);
const communicationSaving = ref(false);
const communicationError = ref('');
const school = ref({ name: 'IDCE Unknown High School', slug: '', address: '', phone: '', email: '', website: '' });
const isPublicSchool = computed(() => String(school.value?.schoolType || '').toLowerCase() === 'publico');
const subjects = ref([]);
const materials = ref([]);
const materialCourseId = ref('');
const salaries = ref([]);
const managementModal = ref('');
const managementSaving = ref(false);
const managementError = ref('');
const enrollmentCandidates = ref([]);
const enrolledEnrollmentIds = ref([]);
const selectedEnrollmentIds = ref([]);
const enrollmentSearch = ref('');
const enrollmentLookup = latestRequest((signal,q) => studentsApi.list({q,page:1,pageSize:10},{signal}));
watch(enrollmentSearch,(q,_old,cleanup) => {
  enrollmentLookup.cancel(); enrollmentCandidates.value = [];
  if (q.trim().length < 2) return;
  const timer = setTimeout(async () => {
    enrollmentLoading.value = true;
    try { enrollmentCandidates.value = await enrollmentLookup.run(q); } catch(err) { if(err.name !== 'AbortError') enrollmentError.value = err.message; } finally { enrollmentLoading.value = false; }
  },250);
  cleanup(() => { clearTimeout(timer); enrollmentLookup.cancel(); });
});
const enrollmentLoading = ref(false);
const enrollmentSaving = ref(false);
const enrollmentError = ref('');
const courseTeacherSavingId = ref(null);
const courseSettingsError = ref('');
const dashboard = ref({ stats: {}, distribution: [], recent: [], charts: null });
const toast = ref('');
const toastType = ref('success');
let toastTimer;
function showToast(message, type = 'success') {
  const text = String(message || '').trim();
  if (!text) return;
  window.clearTimeout(toastTimer);
  toast.value = text;
  toastType.value = type === 'error' || type === 'info' ? type : 'success';
  toastTimer = window.setTimeout(() => { toast.value = ''; }, type === 'error' ? 7200 : 3400);
}
provide(NOTIFY_KEY, showToast);
async function stopImpersonation() {
  const adminToken = storageGet('admin_token') || '';
  let restoredToken = adminToken;
  try {
    const data = await request('/platform/impersonations/stop', {
      method: 'POST',
      body: JSON.stringify({ adminToken }),
    });
    if (data?.token) restoredToken = data.token;
  } catch { /* Restore the administrator session even if the temporary token expired. */ }
  storageRemove('admin_token');
  if (restoredToken) session.setToken(restoredToken);
  else session.clear();
  window.location.href = '/plataforma';
}

function restoreAdminSessionIfNeeded() {
  const adminToken = storageGet('admin_token');
  if (!adminToken) return false;
  // Mid-navigation into “entrar como”: ignore 401s from in-flight platform requests.
  if (sessionFlagGet('impersonation_handoff') === '1') return false;
  // Leftover marker while already on a normal session (e.g. after a new login).
  if (authUser.value && !authUser.value.impersonation) {
    storageRemove('admin_token');
    return false;
  }
  storageRemove('admin_token');
  session.setToken(adminToken);
  window.location.href = '/plataforma';
  return true;
}
const form = reactive({ studentId: '', courseId: '', assessment: '', score: '', weight: 25, gradedAt: new Date().toISOString().slice(0, 10), feedback: '' });
const staffForm = reactive({
  id: null, username: '', fullName: '', role: 'teacher', position: '', password: '', generatePassword: true, active: true, teamActive: true, platformAccess: true,
  permissions: { manageUsers: false, manageGrades: true, viewReports: false, manageSchool: false, manageHr: false, manageFinance: false, approveLeave: false, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false }
});
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const accountForm = reactive({
  fullName: '',
  username: '',
  position: '',
  phone: '',
  whatsappOptIn: false,
  askSchoolOnLogin: true,
  preferredSchoolId: null,
});
const studentForm = reactive({
  firstName: '', lastName: '', username: '', email: '', studentPassword: '', generateStudentPassword: true, courseIds: [],
  guardianName: '', guardianEmail: '', guardianPassword: '', relationshipKind: 'Mamá', relationshipOther: ''
});
const studentCourseId = ref('');
const studentCourseSaving = ref(false);
const subjectForm = reactive({ name: '', code: '', sigeSubjectCode: '' });
const courseTemplates = ref([]);
const sigeSubjectDefaults = ref({});
const courseLevels = ref([]);
const courseTracks = ref([]);
const courseTemplatesLoading = ref(false);
const courseForm = reactive({
  levelId: '1b',
  trackId: '',
  name: '1° Básico',
  section: 'A',
  templateId: 'basica',
  subjects: [],
  customSubjects: [],
  color: '',
  monthlyFee: 0,
});
const newCourseCustomSubject = ref('');
const newCourseCustomColor = ref('');
const newCourseCustomNames = computed(() => courseForm.customSubjects.map((item) => (typeof item === 'string' ? item : item.name)));
function customSubjectName(item) {
  return typeof item === 'string' ? item : String(item?.name || '');
}
function customSubjectColor(item) {
  return normalizeSubjectColor(typeof item === 'string' ? '' : item?.color);
}
function isNewCourseCustomColorTaken(color, exceptName = '') {
  const next = normalizeSubjectColor(color);
  if (!next) return false;
  return courseForm.customSubjects.some((item) => {
    const name = customSubjectName(item);
    if (exceptName && name.toLocaleLowerCase('es') === exceptName.toLocaleLowerCase('es')) return false;
    return customSubjectColor(item) === next;
  });
}
const selectedCourseLevel = computed(() => courseLevels.value.find((item) => item.id === courseForm.levelId) || null);
const needsCourseTrack = computed(() => Boolean(selectedCourseLevel.value?.needsTrack));
const availableCourseTracks = computed(() => courseTracks.value.filter((item) => item.forDifferentiatedMedia));
const selectedCourseTemplate = computed(() => courseTemplates.value.find((item) => item.id === courseForm.templateId));
const isCustomCourseTemplate = computed(() => courseForm.templateId === 'otro' || !(selectedCourseTemplate.value?.subjects || []).length);
const newCourseSubjectOptions = computed(() => {
  if (isCustomCourseTemplate.value) return [];
  return [...(selectedCourseTemplate.value?.subjects || [])];
});
const newCoursePlanHint = computed(() => {
  const level = selectedCourseLevel.value;
  if (!level) return 'Elige el nivel del curso según el sistema escolar chileno.';
  if (level.id === 'prekinder') return 'Prekínder: se sugieren los ámbitos típicos de parvularia.';
  if (level.id === 'kinder') return 'Kínder: se sugieren los ámbitos típicos de parvularia.';
  if (level.band === 'preescolar') return 'Parvularia: se sugieren los ámbitos de aprendizaje típicos.';
  if (level.band === 'basica') return 'Educación básica: plan común de 1° a 8°.';
  if (!level.needsTrack) return '1° y 2° medio usan formación general; la diferenciación empieza en 3°.';
  if (courseForm.trackId === 'tp') return 'TP: dejamos la formación general; agrega los ramos de la especialidad.';
  if (courseForm.trackId === 'otro') return 'Plan libre: agrega exactamente los ramos que uses en el colegio.';
  return '3° y 4° medio: elige mención humanista, científica, HC o TP.';
});

function applyChileCourseCurriculum({ selectAll = true } = {}) {
  const level = selectedCourseLevel.value;
  if (level) courseForm.name = level.name;
  if (!needsCourseTrack.value) courseForm.trackId = '';
  else if (!courseForm.trackId) courseForm.trackId = 'hc';

  let templateId = 'otro';
  if (!level) templateId = 'otro';
  else if (level.id === 'prekinder') templateId = 'prekinder';
  else if (level.id === 'kinder') templateId = 'kinder';
  else if (level.band === 'preescolar') templateId = 'prekinder';
  else if (level.band === 'basica') templateId = 'basica';
  else if (!level.needsTrack) templateId = 'media-comun';
  else if (courseForm.trackId === 'humanista') templateId = 'humanista';
  else if (courseForm.trackId === 'cientifico') templateId = 'cientifico';
  else if (courseForm.trackId === 'tp') templateId = 'tp';
  else if (courseForm.trackId === 'otro') templateId = 'otro';
  else templateId = 'hc';

  courseForm.templateId = courseTemplates.value.some((item) => item.id === templateId) ? templateId : (courseTemplates.value[0]?.id || 'otro');
  const available = newCourseSubjectOptions.value;
  courseForm.subjects = selectAll ? [...available] : courseForm.subjects.filter((name) => available.includes(name));
  if (isCustomCourseTemplate.value) courseForm.subjects = [];
}

function onCourseLevelChange() {
  courseForm.customSubjects = [];
  applyChileCourseCurriculum({ selectAll: true });
}

function onCourseTrackChange() {
  applyChileCourseCurriculum({ selectAll: true });
}

function selectCourseTemplate() {
  applyChileCourseCurriculum({ selectAll: false });
}
function selectAllCourseTemplateSubjects() {
  courseForm.subjects = [...newCourseSubjectOptions.value];
}
function clearCourseTemplateSubjects() {
  courseForm.subjects = [];
}
function addCourseCustomSubject() {
  const name = newCourseCustomSubject.value.trim();
  if (!name) return;
  const exists = [...courseForm.subjects, ...newCourseCustomNames.value].some((subject) => subject.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'));
  if (exists) {
    showToast('Esa asignatura ya está seleccionada.', 'error');
    return;
  }
  const color = normalizeSubjectColor(newCourseCustomColor.value);
  if (color && isNewCourseCustomColorTaken(color)) {
    showToast('Ese color ya lo usa otro ramo personalizado.', 'error');
    return;
  }
  courseForm.customSubjects.push({ name, color });
  newCourseCustomSubject.value = '';
  newCourseCustomColor.value = '';
}
function removeCourseCustomSubject(name) {
  courseForm.customSubjects = courseForm.customSubjects.filter((item) => customSubjectName(item) !== name);
}
function setCourseCustomSubjectColor(name, color) {
  const next = normalizeSubjectColor(color);
  if (next && isNewCourseCustomColorTaken(next, name)) {
    showToast('Ese color ya lo usa otro ramo personalizado.', 'error');
    return;
  }
  courseForm.customSubjects = courseForm.customSubjects.map((item) => (
    customSubjectName(item) === name ? { name, color: next } : item
  ));
}
async function loadCourseTemplates() {
  courseTemplatesLoading.value = true;
  managementError.value = '';
  try {
    const payload = await request('/course-templates');
    if (Array.isArray(payload)) {
      courseTemplates.value = payload;
      courseLevels.value = [];
      courseTracks.value = [];
      sigeSubjectDefaults.value = {};
    } else {
      courseTemplates.value = payload.templates || [];
      courseLevels.value = payload.levels || [];
      courseTracks.value = payload.tracks || [];
      sigeSubjectDefaults.value = payload.sigeSubjectDefaults || {};
      if (Array.isArray(payload.educationStageOptions) && payload.educationStageOptions.length) {
        educationStageOptions.value = payload.educationStageOptions;
      }
      if (Array.isArray(payload.educationStages) && payload.educationStages.length && school.value) {
        school.value = { ...school.value, educationStages: payload.educationStages };
      }
    }
    if (!courseLevels.value.some((item) => item.id === courseForm.levelId)) {
      courseForm.levelId = courseLevels.value[0]?.id || '';
    }
    applyChileCourseCurriculum({ selectAll: true });
  } catch (err) { managementError.value = err.message; }
  finally { courseTemplatesLoading.value = false; }
}
function normalizeSigeSubjectKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
function lookupSigeSubjectDefault(name) {
  const key = normalizeSigeSubjectKey(name);
  if (!key) return '';
  const catalog = sigeSubjectDefaults.value || {};
  for (const [label, code] of Object.entries(catalog)) {
    if (normalizeSigeSubjectKey(label) === key) return String(code || '');
  }
  return '';
}
function suggestedSigeSubjectCode(name, current = '') {
  const typed = String(current || '').trim();
  if (typed) return typed;
  return lookupSigeSubjectDefault(name);
}
const materialForm = reactive({ courseId: '', title: '', file: null });
const documentForm = reactive({ name: '', kind: 'General', studentId: '', employeeId: '', userId: '', file: null });
const invoiceForm = reactive({ number: '', studentId: '', supplierId: '', amount: '', dueOn: new Date().toISOString().slice(0, 10), status: 'pending', file: null });
const paymentForm = reactive({ studentId: '', invoiceId: '', amount: '', paidAt: new Date().toISOString().slice(0, 10), method: 'transfer' });
const employeeForm = reactive({
  fullName: '',
  position: '',
  contractType: 'Indefinido',
  workModality: 'Full time',
  hiredOn: new Date().toISOString().slice(0, 10),
  netSalary: '',
  monthlySalary: '',
  lockBaseSalary: false,
  afp: 'Uno',
  healthSystem: 'Fonasa',
  isaprePlan: 0,
  isapreCode: '',
});
const employeeRehireForm = reactive({
  fullName: '',
  position: '',
  contractType: 'Indefinido',
  workModality: 'Full time',
  hiredOn: '',
  monthlySalary: '',
  restoreAccess: true,
});
const employeeRehireSaving = ref(false);

function syncEmployeeRehireForm(employee) {
  if (!employee) return;
  Object.assign(employeeRehireForm, {
    fullName: employee.fullName || '',
    position: employee.position || '',
    contractType: employee.contractType || 'Indefinido',
    workModality: employee.workModality || 'Full time',
    hiredOn: String(employee.hiredOn || '').slice(0, 10),
    monthlySalary: Number(employee.monthlySalary) || 0,
    restoreAccess: true,
  });
}
const EMPLOYEE_WORK_MODALITIES = ['Remoto', 'Full time', 'Part time', 'Temporal'];
const employeeHireDefaults = ref(null);
const employeeSalaryEstimate = ref(null);
const employeeSalaryEstimating = ref(false);
const employeeSalaryEstimateError = ref('');
let employeeSalaryEstimateTimer = null;
const employeeHireAfps = computed(() => employeeHireDefaults.value?.afps || [
  { name: 'Uno', commission: 0.0046 },
  { name: 'Modelo', commission: 0.0058 },
  { name: 'PlanVital', commission: 0.0116 },
  { name: 'Habitat', commission: 0.0127 },
  { name: 'Cuprum', commission: 0.0144 },
  { name: 'Capital', commission: 0.0144 },
  { name: 'Provida', commission: 0.0145 },
]);
const employeeHireIsapres = computed(() => employeeHireDefaults.value?.isapres || []);
const employeeRecommendedAfp = computed(() => employeeHireDefaults.value?.recommendedAfp || employeeHireAfps.value[0]?.name || 'Uno');
function employeePayrollProfilePayload() {
  return {
    afp: employeeForm.afp || employeeRecommendedAfp.value,
    healthSystem: employeeForm.healthSystem || 'Fonasa',
    isaprePlan: employeeForm.healthSystem === 'Isapre' ? Number(employeeForm.isaprePlan) || 0 : 0,
    apvRegime: 'A',
    previred: {
      healthInstitutionCode: employeeForm.healthSystem === 'Isapre' ? (employeeForm.isapreCode || '') : '07',
      nationality: '0',
      workdayType: employeeForm.workModality === 'Part time' ? '2' : '1',
    },
  };
}
function formatAfpCommission(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return '';
  return `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}
async function loadEmployeeHireDefaults() {
  try {
    const data = await request('/hr/hire-defaults');
    employeeHireDefaults.value = data;
    if (!employeeForm.afp || employeeForm.afp === 'Uno') {
      employeeForm.afp = data.recommendedAfp || 'Uno';
    }
    if (!employeeForm.healthSystem) employeeForm.healthSystem = data.recommendedHealthSystem || 'Fonasa';
  } catch {
    employeeHireDefaults.value = null;
  }
}
async function refreshEmployeeSalaryEstimate() {
  if (currentView.value !== 'Nuevo empleado') return;
  const net = Number(employeeForm.netSalary);
  if (!Number.isFinite(net) || net < 1) {
    employeeSalaryEstimate.value = null;
    employeeSalaryEstimateError.value = '';
    if (!employeeForm.lockBaseSalary) employeeForm.monthlySalary = '';
    return;
  }
  if (employeeForm.contractType === 'Honorarios') {
    employeeSalaryEstimate.value = {
      monthlySalary: Math.round(net),
      achievedNet: Math.round(net),
      honorarios: true,
      totals: { sueldo_bruto: Math.round(net), sueldo_liquido: Math.round(net), total_descuentos: 0 },
      items: [],
    };
    employeeSalaryEstimateError.value = '';
    if (!employeeForm.lockBaseSalary) employeeForm.monthlySalary = Math.round(net);
    return;
  }
  employeeSalaryEstimating.value = true;
  employeeSalaryEstimateError.value = '';
  try {
    const data = await request('/hr/estimate-from-net', {
      method: 'POST',
      body: JSON.stringify({
        targetNet: net,
        contractType: employeeForm.contractType,
        hiredOn: employeeForm.hiredOn,
        payrollProfile: employeePayrollProfilePayload(),
      }),
    });
    employeeSalaryEstimate.value = data;
    if (!employeeForm.lockBaseSalary) employeeForm.monthlySalary = data.monthlySalary;
  } catch (err) {
    employeeSalaryEstimate.value = null;
    employeeSalaryEstimateError.value = err.message || 'No se pudo estimar el sueldo base.';
  } finally {
    employeeSalaryEstimating.value = false;
  }
}
function scheduleEmployeeSalaryEstimate() {
  clearTimeout(employeeSalaryEstimateTimer);
  employeeSalaryEstimateTimer = setTimeout(() => { refreshEmployeeSalaryEstimate(); }, 280);
}
function onEmployeeHealthSystemChange() {
  if (employeeForm.healthSystem === 'Fonasa') {
    employeeForm.isaprePlan = 0;
    employeeForm.isapreCode = '';
  } else if (!employeeForm.isapreCode && employeeHireIsapres.value[0]) {
    employeeForm.isapreCode = employeeHireIsapres.value[0].code;
  }
  scheduleEmployeeSalaryEstimate();
}
const studentRecordForm = reactive({ id: null, studentId: '', courseId: '', detail: '', kind: 'negative', severity: 'medium', status: 'open', occurredOn: new Date().toISOString().slice(0, 10), file: null, attachmentName: '', removeAttachment: false });
const citationForm = reactive({
  studentId: '',
  guardianId: '',
  scheduledOn: new Date().toISOString().slice(0, 10),
  scheduledTime: '10:00',
  location: 'Dirección del colegio',
  reason: '',
});
const citationGuardianOptions = ref([]);
const citationGuardiansLoading = ref(false);
const citationStudentSearch = ref('');
const citationStudentOptions = computed(() => (
  citationStudentSearch.value.trim().length < 2
    ? []
    : students.value
      .filter((student) => normalizeSearch(`${student.first_name} ${student.last_name} ${student.email || ''}`).includes(normalizeSearch(citationStudentSearch.value)))
      .slice(0, 10)
));
const studentRecordSearch = ref('');
const observationCourseOptions = ref([]);
const observationCoursesLoading = ref(false);
const studentRecordOptions = computed(() => studentRecordSearch.value.trim().length < 2 ? [] : students.value.filter(student => normalizeSearch(`${student.first_name} ${student.last_name} ${student.email || ''}`).includes(normalizeSearch(studentRecordSearch.value))).slice(0, 10));

async function refreshCitationGuardians(studentId, preferredGuardianId = '') {
  citationGuardianOptions.value = [];
  citationForm.guardianId = '';
  if (!studentId) return;
  citationGuardiansLoading.value = true;
  try {
    const profile = await request(`/students/${studentId}`);
    const rows = (profile.guardians || []).map((guardian) => ({
      id: guardian.id,
      label: `${guardian.full_name || guardian.fullName || 'Apoderado'}${guardian.email ? ` · ${guardian.email}` : ''}`,
      email: guardian.email || '',
    }));
    citationGuardianOptions.value = rows;
    const preferred = preferredGuardianId || citationForm.guardianId;
    if (preferred && rows.some((row) => Number(row.id) === Number(preferred))) {
      citationForm.guardianId = String(preferred);
    } else if (rows.length === 1) {
      citationForm.guardianId = String(rows[0].id);
    }
  } catch {
    citationGuardianOptions.value = [];
  } finally {
    citationGuardiansLoading.value = false;
  }
}

function selectCitationStudent(student) {
  citationForm.studentId = String(student.id);
  citationStudentSearch.value = `${student.first_name} ${student.last_name}`.trim();
  refreshCitationGuardians(student.id);
}

function openCitation(opts = {}) {
  if (!canAddStudentRecord.value) return;
  Object.assign(citationForm, {
    studentId: opts.studentId ? String(opts.studentId) : '',
    guardianId: opts.guardianId ? String(opts.guardianId) : '',
    scheduledOn: new Date().toISOString().slice(0, 10),
    scheduledTime: '10:00',
    location: 'Dirección del colegio',
    reason: '',
  });
  citationGuardianOptions.value = [];
  if (opts.studentId && studentProfile.value?.student?.id === Number(opts.studentId)) {
    citationStudentSearch.value = `${studentProfile.value.student.first_name} ${studentProfile.value.student.last_name}`.trim();
    citationGuardianOptions.value = (studentProfile.value.guardians || []).map((guardian) => ({
      id: guardian.id,
      label: `${guardian.full_name || guardian.fullName || 'Apoderado'}${guardian.email ? ` · ${guardian.email}` : ''}`,
      email: guardian.email || '',
    }));
    if (opts.guardianId) citationForm.guardianId = String(opts.guardianId);
    else if (citationGuardianOptions.value.length === 1) citationForm.guardianId = String(citationGuardianOptions.value[0].id);
  } else if (opts.studentId) {
    citationStudentSearch.value = opts.studentName || '';
    refreshCitationGuardians(opts.studentId, opts.guardianId);
  } else {
    citationStudentSearch.value = '';
  }
  managementModal.value = 'citation';
  managementError.value = '';
}

async function refreshObservationCourses(studentId, preferredCourseId = '') {
  observationCourseOptions.value = [];
  const keepCourseId = preferredCourseId || studentRecordForm.courseId;
  studentRecordForm.courseId = '';
  if (!studentId) return;
  observationCoursesLoading.value = true;
  try {
    const profile = await request(`/students/${studentId}`);
    const owned = authUser.value?.role === 'teacher' ? teacherOwnedCourseIds.value : null;
    const rows = (profile.enrollments || [])
      .filter((entry) => entry.status !== 'withdrawn')
      .filter((entry) => !owned || owned.has(Number(entry.id)))
      .map((entry) => ({
        id: entry.id,
        label: `${entry.name} ${entry.section} · ${entry.subject}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
    observationCourseOptions.value = rows;
    if (keepCourseId && rows.some((row) => Number(row.id) === Number(keepCourseId))) {
      studentRecordForm.courseId = String(keepCourseId);
    } else if (rows.length === 1) {
      studentRecordForm.courseId = String(rows[0].id);
    }
  } catch {
    observationCourseOptions.value = [];
  } finally {
    observationCoursesLoading.value = false;
  }
}

async function selectObservationStudent(student) {
  studentRecordForm.studentId = student.id;
  studentRecordSearch.value = `${student.first_name} ${student.last_name}`;
  await refreshObservationCourses(student.id);
}
const canAddStudentRecord = computed(() => !!authUser.value && !authUser.value.readOnly && !authUser.value.demoMode && !['guardian', 'student', 'monitor', 'finance', 'agente_finanzas'].includes(authUser.value.role));
const isDemoMode = computed(() => Boolean(authUser.value?.demoMode || authUser.value?.accessMode === 'demo' || platformDemoMode.value));
const platformDemoMode = ref(false);
const platformDemoMessage = ref('Entorno de demostración: puedes explorar el dashboard con datos de ejemplo. No es posible modificar, crear ni eliminar información; todo es solo lectura.');
function canManageObservation(row) {
  if (!canAddStudentRecord.value || !row?.id) return false;
  if (row.canManage === true) return true;
  if (row.canManage === false) return false;
  if (['utp', 'director', 'manager', 'school_admin', 'super_admin'].includes(authUser.value?.role) || authUser.value?.permissions?.manageSchool) {
    return true;
  }
  if (authUser.value?.role !== 'teacher') return true;
  return Number(row.createdBy) === Number(authUser.value.id);
}
const observationDetail = ref(null);
const observationDetailLoading = ref(false);
const observationDetailError = ref('');
const ROLE_OBS_LABELS = {
  teacher: 'Profesor',
  utp: 'Jefe de UTP',
  director: 'Director',
  manager: 'Equipo directivo',
  school_admin: 'Administración',
  super_admin: 'Administración',
};
function observationHasAttachment(row) {
  if (row?.hasAttachment === true) return true;
  const name = String(row?.attachmentName || '').trim();
  return Boolean(name && name !== '—');
}
const documentKind = ref('');
const documentStudentSearch = ref('');
const documentStudentOptions = computed(() => documentStudentSearch.value.trim().length < 2 ? [] : students.value.filter(s => normalizeSearch(`${s.first_name} ${s.last_name}`).includes(normalizeSearch(documentStudentSearch.value))).slice(0,8));
const enrollmentRows = ref([]);
const enrollmentPaymentsLoading = ref(false);
const enrollmentPaymentsError = ref('');
const matriculaSearch = ref('');
const enrollmentStatusFilter = ref('');
const paymentStudentId = ref('');
const paymentYear = ref('');
const paymentPage = ref(1);
const allEnrollmentPayments = computed(() => enrollmentRows.value.flatMap(row => (row.paymentHistory || []).map(payment => ({ ...payment, studentId: row.id, studentName: row.name }))).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt) || b.id - a.id));
const enrollmentPaymentYears = computed(() => [...new Set(allEnrollmentPayments.value.map(payment => String(payment.paidAt).slice(0, 4)))].sort().reverse());
const filteredEnrollmentPayments = computed(() => {
  const studentId = paymentStudentId.value === '' || paymentStudentId.value == null ? null : Number(paymentStudentId.value);
  return allEnrollmentPayments.value.filter(payment => (
    (studentId == null || Number.isNaN(studentId) || Number(payment.studentId) === studentId)
    && (!paymentYear.value || String(payment.paidAt).startsWith(String(paymentYear.value)))
  ));
});
const paymentPageCount = computed(() => Math.max(1, Math.ceil(filteredEnrollmentPayments.value.length / pageSize)));
const pagedEnrollmentPayments = computed(() => filteredEnrollmentPayments.value.slice((paymentPage.value - 1) * pageSize, paymentPage.value * pageSize));
const filteredEnrollmentRows = computed(() => {
  const query = normalizeSearch(matriculaSearch.value);
  return enrollmentRows.value.filter((row) => {
    if (enrollmentStatusFilter.value && row.paymentStatus !== enrollmentStatusFilter.value) return false;
    if (!query) return true;
    return normalizeSearch(`${row.name} ${row.courses || ''}`).includes(query);
  });
});
const enrollmentSortBy = ref('name');
const enrollmentSortDir = ref('ASC');
const enrollmentColumns = computed(() => {
  if (isPublicSchool.value) {
    return [
      { key: 'name', label: 'Estudiante' },
      { key: 'courses', label: 'Cursos' },
    ];
  }
  return [
    { key: 'name', label: 'Estudiante' },
    { key: 'courses', label: 'Cursos' },
    { key: 'lastPaymentAt', label: 'Último pago' },
    { key: 'nextDueOn', label: 'Próximo vencimiento' },
    { key: 'paymentStatus', label: 'Estado' },
    { key: 'billed', label: 'Cobrado' },
    { key: 'paid', label: 'Pagado' },
    { key: 'balance', label: 'Saldo' },
    { key: 'actions', label: '', sortable: false },
  ];
});
const paymentStatusSortRank = { vencido: 0, deuda: 1, al_dia: 2, sin_cobros: 3 };
const sortedEnrollmentRows = computed(() => {
  const rows = [...filteredEnrollmentRows.value];
  const key = enrollmentSortBy.value;
  if (!key) return rows;
  const dir = enrollmentSortDir.value === 'DESC' ? -1 : 1;
  return rows.sort((a, b) => {
    if (key === 'paymentStatus') {
      return ((paymentStatusSortRank[a.paymentStatus] ?? 9) - (paymentStatusSortRank[b.paymentStatus] ?? 9)) * dir
        || String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' });
    }
    if (key === 'nextDueOn') {
      const aOverdue = Number(a.overdueCount || 0);
      const bOverdue = Number(b.overdueCount || 0);
      if (a.paymentStatus === 'vencido' || b.paymentStatus === 'vencido') {
        if (a.paymentStatus === 'vencido' && b.paymentStatus !== 'vencido') return -1 * dir;
        if (b.paymentStatus === 'vencido' && a.paymentStatus !== 'vencido') return 1 * dir;
        if (aOverdue !== bOverdue) return (aOverdue - bOverdue) * dir;
      }
    }
    return compareTableValues(a, b, key) * dir;
  });
});
const {
  page: enrollmentPage,
  pageCount: enrollmentPageCount,
  paged: pagedEnrollmentRows,
  rangeLabel: enrollmentRangeLabel,
  show: showEnrollmentPagination,
  goPrev: enrollmentPrevPage,
  goNext: enrollmentNextPage,
} = useClientPagination(sortedEnrollmentRows, {
  pageSize: 15,
  resetOn: [matriculaSearch, enrollmentStatusFilter, enrollmentSortBy, enrollmentSortDir],
});
function onEnrollmentSort({ key, dir }) {
  enrollmentSortBy.value = key;
  enrollmentSortDir.value = dir;
}
const enrollmentSummary = computed(() => {
  const rows = enrollmentRows.value;
  return {
    students: rows.length,
    billed: rows.reduce((sum, row) => sum + Number(row.billed || 0), 0),
    paid: rows.reduce((sum, row) => sum + Number(row.paid || 0), 0),
    balance: rows.reduce((sum, row) => sum + Number(row.balance || 0), 0),
    overdue: rows.filter((row) => row.paymentStatus === 'vencido').length,
    debt: rows.filter((row) => row.paymentStatus === 'deuda' || row.paymentStatus === 'vencido').length,
  };
});
const paymentHistoryTotal = computed(() => filteredEnrollmentPayments.value.reduce((total, payment) => total + Number(payment.amount || 0), 0));
const selectedPaymentStudent = computed(() => {
  const id = Number(paymentStudentId.value);
  if (!id) return null;
  return enrollmentRows.value.find(row => Number(row.id) === id) || null;
});
const paymentFormInvoices = computed(() => {
  const studentId = Number(paymentForm.studentId);
  if (!studentId) return [];
  const row = enrollmentRows.value.find(item => Number(item.id) === studentId);
  return row?.openInvoices || [];
});
const paymentStatusLabels = {
  al_dia: 'Al día',
  deuda: 'Con deuda',
  vencido: 'Vencido',
  sin_cobros: 'Sin cobros',
};
function paymentStatusLabel(status) {
  return paymentStatusLabels[status] || status || '—';
}
watch([paymentStudentId, paymentYear], () => { paymentPage.value = 1; });
watch(paymentStudentId, (id) => {
  if (currentView.value !== 'Historial de pagos') return;
  const target = id ? `/historial-pagos?studentId=${encodeURIComponent(id)}` : '/historial-pagos';
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== target) window.history.replaceState({ view: 'Historial de pagos', studentId: id || null }, '', target);
});
watch(() => paymentForm.invoiceId, (invoiceId) => {
  const invoice = paymentFormInvoices.value.find(item => String(item.id) === String(invoiceId));
  if (invoice && (!paymentForm.amount || Number(paymentForm.amount) === Number(invoice.remaining))) {
    paymentForm.amount = invoice.remaining;
  }
});
async function loadEnrollmentPayments() {
  enrollmentPaymentsLoading.value = true;
  enrollmentPaymentsError.value = '';
  paymentPage.value = 1;
  try {
    enrollmentRows.value = await request('/enrollments/summary');
    await loadStudentAvatars(enrollmentRows.value);
  }
  catch (err) { enrollmentPaymentsError.value = err.message; }
  finally { enrollmentPaymentsLoading.value = false; }
}

function openEnrollmentPaymentHistory(studentId = '') {
  if (isPublicSchool.value) {
    navigate('Matrículas');
    return;
  }
  const id = studentId === '' || studentId == null ? '' : String(studentId);
  paymentStudentId.value = id;
  paymentYear.value = '';
  paymentPage.value = 1;
  closeHeaderMenus();
  error.value = '';
  const path = id ? `/historial-pagos?studentId=${encodeURIComponent(id)}` : '/historial-pagos';
  window.history.pushState({ view: 'Historial de pagos', studentId: id || null }, '', path);
  currentView.value = 'Historial de pagos';
  sidebarOpen.value = false;
}

function openPaymentCredit(prefill = {}) {
  if (!canManageFinance.value) {
    showToast('No tienes permiso para registrar pagos.', 'error');
    return;
  }
  const studentId = String(prefill.studentId || paymentStudentId.value || '');
  const row = enrollmentRows.value.find(item => String(item.id) === studentId);
  const invoices = row?.openInvoices || [];
  const preferredInvoice = prefill.invoiceId
    ? invoices.find(item => String(item.id) === String(prefill.invoiceId))
    : invoices[0];
  Object.assign(paymentForm, {
    studentId,
    invoiceId: preferredInvoice ? String(preferredInvoice.id) : '',
    amount: preferredInvoice ? preferredInvoice.remaining : '',
    paidAt: new Date().toISOString().slice(0, 10),
    method: 'transfer',
  });
  managementError.value = '';
  managementModal.value = 'payment';
}

function onPaymentStudentChange() {
  const invoices = paymentFormInvoices.value;
  paymentForm.invoiceId = invoices[0] ? String(invoices[0].id) : '';
  paymentForm.amount = invoices[0]?.remaining || '';
}

watch(currentView, view => {
  if (view === 'Matrículas' || view === 'Historial de pagos') loadEnrollmentPayments();
  if (view !== 'Matrículas') {
    matriculaSearch.value = '';
    enrollmentStatusFilter.value = '';
  }
});
const COMMUNICATION_GROUP_AUDIENCES = ['students', 'guardians', 'teachers', 'managers'];
const COMMUNICATION_EXCLUSIVE_AUDIENCES = ['all', 'course', 'student', 'guardian'];
const communicationForm = reactive({ subject: '', body: '', channel: 'email', audiences: ['all'], studentId: null, guardianId: null, courseId: null });
const whatsappConfigured = ref(false);
const communicationStudentSearch = ref('');
const communicationStudentCandidates = ref([]);
const communicationStudentSelected = ref(null);
const communicationStudentContext = ref(null);
const communicationGuardianSelected = ref(null);
const communicationGuardianSearch = ref('');
const communicationGuardianCandidates = ref([]);
const communicationRecipients = ref([]);
const communicationRecipientsLoading = ref(false);
const communicationRecipientsError = ref('');
const communicationRecipientsTotal = ref(0);
const {
  page: communicationRecipientsPage,
  pageCount: communicationRecipientsPageCount,
  paged: pagedCommunicationRecipients,
  rangeLabel: communicationRecipientsRangeLabel,
  show: showCommunicationRecipientsPagination,
  goPrev: communicationRecipientsPrevPage,
  goNext: communicationRecipientsNextPage,
  reset: resetCommunicationRecipientsPage,
} = useClientPagination(communicationRecipients, { pageSize: 15 });
const communicationDetail = ref(null);
const communicationDetailId = ref(null);
const communicationDetailLoading = ref(false);
const communicationDetailError = ref('');
const communicationDetailRecipients = ref([]);
const communicationDetailTotal = ref(0);
const {
  page: communicationDetailRecipientsPage,
  pageCount: communicationDetailRecipientsPageCount,
  paged: pagedCommunicationDetailRecipients,
  rangeLabel: communicationDetailRecipientsRangeLabel,
  show: showCommunicationDetailRecipientsPagination,
  goPrev: communicationDetailRecipientsPrevPage,
  goNext: communicationDetailRecipientsNextPage,
  reset: resetCommunicationDetailRecipientsPage,
} = useClientPagination(communicationDetailRecipients, { pageSize: 15 });
const communicationKeepDraft = ref(false);
const communicationAudienceSelected = (value) => communicationForm.audiences.includes(value);
const communicationPrimaryAudience = computed(() => communicationForm.audiences[0] || 'all');
const canListCommunicationRecipients = computed(() => {
  if (!communicationForm.audiences.length) return false;
  if (communicationAudienceSelected('student') && !communicationForm.studentId) return false;
  if (communicationAudienceSelected('guardian') && !communicationForm.guardianId) return false;
  if (communicationAudienceSelected('course') && !communicationForm.courseId) return false;
  return true;
});
function toggleCommunicationAudience(value) {
  if (communicationStudentContext.value) return;
  if (COMMUNICATION_EXCLUSIVE_AUDIENCES.includes(value)) {
    communicationForm.audiences = [value];
    return;
  }
  let next = communicationForm.audiences.filter((item) => COMMUNICATION_GROUP_AUDIENCES.includes(item));
  if (next.includes(value)) next = next.filter((item) => item !== value);
  else next = [...next, value];
  communicationForm.audiences = next.length ? next : ['all'];
}
const communicationStudentLookup = latestRequest((signal, q) => studentsApi.list({ q, page: 1, pageSize: 8 }, { signal }));
watch(communicationStudentSearch, (q, _old, cleanup) => {
  communicationStudentLookup.cancel();
  communicationStudentCandidates.value = [];
  if (!communicationAudienceSelected('student') || communicationStudentSelected.value) return;
  const query = String(q || '').trim();
  if (query.length < 2) return;
  const timer = setTimeout(async () => {
    try { communicationStudentCandidates.value = await communicationStudentLookup.run(query); }
    catch (err) { if (err.name !== 'AbortError') communicationError.value = err.message; }
  }, 220);
  cleanup(() => { clearTimeout(timer); communicationStudentLookup.cancel(); });
});
watch(() => [...communicationForm.audiences], (audiences) => {
  if (!audiences.includes('student')) {
    communicationForm.studentId = null;
    communicationStudentSelected.value = null;
    communicationStudentSearch.value = '';
    communicationStudentCandidates.value = [];
  }
  if (!audiences.includes('guardian')) {
    communicationForm.guardianId = null;
    communicationGuardianSelected.value = null;
    communicationGuardianSearch.value = '';
    communicationGuardianCandidates.value = [];
  }
  if (!audiences.includes('course')) communicationForm.courseId = null;
  if (audiences.some((item) => ['student', 'guardian'].includes(item)) && communicationForm.channel === 'whatsapp' && !whatsappConfigured.value) {
    communicationForm.channel = 'email';
  }
});
watch(() => communicationForm.channel, (channel) => {
  if (channel === 'whatsapp' && !whatsappConfigured.value) communicationForm.channel = 'email';
});
const schoolForm = reactive({
  name: '', slug: '', rbd: '', city: '', address: '', phone: '', email: '', website: '', schoolType: 'subvencionado',
  showLogoInSidebar: true,
  sidebarCollapsible: true,
  sidebarPanelCollapsible: true,
  sidebarBgColor: '#0e2535',
  sidebarTextColor: '#f3f7fb',
  sidebarFontSize: 14.7,
  educationStages: ['prekinder', 'kinder', 'basica', 'media'],
  banking: {
    originBank: '', originAccountType: '', originAccountNumber: '', originAccountNumberMasked: '',
    companyRut: '', companyName: '',
  },
});
const SIDEBAR_BG_DEFAULT = '#0e2535';
const SIDEBAR_TEXT_DEFAULT = '#f3f7fb';
const SIDEBAR_FONT_SIZE_DEFAULT = 14.7;
function normalizeSidebarHex(value, fallback = '') {
  const color = String(value || '').trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
}
function normalizeSidebarFontSize(value, fallback = SIDEBAR_FONT_SIZE_DEFAULT) {
  const size = Number(value);
  if (!Number.isFinite(size)) return fallback;
  const rounded = Math.round(size * 10) / 10;
  if (rounded < 11 || rounded > 22) return fallback;
  return rounded;
}
function sidebarLineHeightFor(size) {
  return Math.round(normalizeSidebarFontSize(size) * (20 / 14) * 10) / 10;
}
const educationStageOptions = ref([
  { id: 'prekinder', name: 'Prekínder', description: 'Nivel parvulario Prekínder.' },
  { id: 'kinder', name: 'Kínder', description: 'Nivel parvulario Kínder.' },
  { id: 'basica', name: 'Educación básica', description: '1° a 8° básico.' },
  { id: 'media', name: 'Educación media', description: '1° a 4° medio.' },
]);
const educationStageSummary = ref({});
const educationStageImpactModal = ref(null);
const educationStageBusy = ref(false);
const removeAssociatedCoursesOnSave = ref(false);

async function loadEducationStageSummary() {
  try {
    const data = await request('/school/education-stages/summary');
    educationStageSummary.value = Object.fromEntries((data.stages || []).map((row) => [row.id, row]));
  } catch {
    educationStageSummary.value = {};
  }
}

function stageGradeCount(stageId) {
  return Number(educationStageSummary.value?.[stageId]?.gradeCount || 0);
}

async function applyEducationStages(nextStages, { removeCourses = false } = {}) {
  schoolForm.educationStages = educationStageOptions.value
    .map((item) => item.id)
    .filter((item) => nextStages.includes(item));
  if (removeCourses) removeAssociatedCoursesOnSave.value = true;
}

async function toggleEducationStage(stageId) {
  const id = String(stageId || '');
  if (!id || educationStageBusy.value) return;
  const current = [...(schoolForm.educationStages || [])];
  const selected = current.includes(id);
  if (!selected) {
    const previous = [...current];
    error.value = '';
    await applyEducationStages([...current, id]);
    await saveSchoolSettings();
    if (error.value) schoolForm.educationStages = previous;
    return;
  }
  if (current.length <= 1) {
    showToast('Debes dejar al menos un nivel activo.', 'error');
    return;
  }
  const nextStages = current.filter((item) => item !== id);
  educationStageBusy.value = true;
  error.value = '';
  try {
    const impact = await request('/school/education-stages/impact', {
      method: 'POST',
      body: JSON.stringify({ educationStages: nextStages }),
    });
    if (!impact.gradeCount) {
      const previous = [...current];
      await applyEducationStages(nextStages);
      await saveSchoolSettings();
      if (error.value) schoolForm.educationStages = previous;
      return;
    }
    if (!impact.canRemove) {
      showToast(
        `No puedes quitar ${impact.removedStages?.map((row) => row.name).join(', ') || 'este nivel'}: ${impact.blockedGradeCount} grado${impact.blockedGradeCount === 1 ? '' : 's'} tienen calificaciones.`,
        'error',
      );
      return;
    }
    educationStageImpactModal.value = { nextStages, impact };
  } catch (err) {
    showToast(err.message || 'No se pudo revisar los grados asociados.', 'error');
  } finally {
    educationStageBusy.value = false;
  }
}

function closeEducationStageImpactModal() {
  educationStageImpactModal.value = null;
}

async function confirmEducationStageRemoval() {
  const modal = educationStageImpactModal.value;
  if (!modal) return;
  const previous = [...(schoolForm.educationStages || [])];
  await applyEducationStages(modal.nextStages, { removeCourses: true });
  educationStageImpactModal.value = null;
  await saveSchoolSettings();
  if (error.value) {
    schoolForm.educationStages = previous;
    removeAssociatedCoursesOnSave.value = false;
  }
}
const schoolLogoPreview = ref('');
const schoolLogoBusy = ref(false);
const jobTitles = ref([]);
const newJobTitle = ref('');
const newJobTitleHierarchy = ref('');
const jobTitleSortBy = ref('hierarchy');
const jobTitleSortDir = ref('ASC');
const jobTitleColumns = [
  { key: 'name', label: 'Cargo' },
  { key: 'employeeCount', label: 'Empleados' },
  { key: 'hierarchy', label: 'Jerarquía' },
  { key: 'actions', label: '', sortable: false },
];
const sortedJobTitles = computed(() => {
  const rows = [...jobTitles.value];
  const key = jobTitleSortBy.value || 'hierarchy';
  const dir = jobTitleSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    if (key === 'hierarchy') {
      const av = a.hierarchy == null || a.hierarchy === '' ? Number.POSITIVE_INFINITY : Number(a.hierarchy);
      const bv = b.hierarchy == null || b.hierarchy === '' ? Number.POSITIVE_INFINITY : Number(b.hierarchy);
      if (av !== bv) return (av - bv) * dir;
      return String(a.name || '').localeCompare(String(b.name || ''), 'es');
    }
    if (key === 'employeeCount') {
      const diff = (Number(a.employeeCount) || 0) - (Number(b.employeeCount) || 0);
      if (diff) return diff * dir;
      return String(a.name || '').localeCompare(String(b.name || ''), 'es');
    }
    return String(a.name || '').localeCompare(String(b.name || ''), 'es') * dir;
  });
  return rows;
});
function onJobTitleSort({ key, dir }) {
  jobTitleSortBy.value = key;
  jobTitleSortDir.value = dir;
}
const jobTitleSaving = ref(false);
const jobTitleHierarchyBusyId = ref(null);
const selectedJobTitle = ref(null);
const jobTitleEmployees = ref([]);
const jobTitleEmployeesLoading = ref(false);
const jobTitleEmployeesError = ref('');
const jobTitleEmployeesSortBy = ref('fullName');
const jobTitleEmployeesSortDir = ref('ASC');
const jobTitleEmployeeColumns = [
  { key: 'fullName', label: 'Empleado' },
  { key: 'contractType', label: 'Contrato' },
  { key: 'hiredOn', label: 'Ingreso' },
  { key: 'actions', label: '', sortable: false },
];
const sortedJobTitleEmployees = computed(() => {
  const rows = [...jobTitleEmployees.value];
  const key = jobTitleEmployeesSortBy.value || 'fullName';
  const dir = jobTitleEmployeesSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    if (key === 'hiredOn') {
      const av = a.hiredOn || '';
      const bv = b.hiredOn || '';
      if (av !== bv) return av.localeCompare(bv) * dir;
      return String(a.fullName || '').localeCompare(String(b.fullName || ''), 'es');
    }
    if (key === 'contractType') {
      const cmp = String(a.contractType || '').localeCompare(String(b.contractType || ''), 'es');
      if (cmp) return cmp * dir;
      return String(a.fullName || '').localeCompare(String(b.fullName || ''), 'es');
    }
    return String(a.fullName || '').localeCompare(String(b.fullName || ''), 'es') * dir;
  });
  return rows;
});
function onJobTitleEmployeesSort({ key, dir }) {
  jobTitleEmployeesSortBy.value = key;
  jobTitleEmployeesSortDir.value = dir;
}
const {
  page: jobTitleEmployeesPage,
  pageCount: jobTitleEmployeesPageCount,
  paged: pagedJobTitleEmployees,
  rangeLabel: jobTitleEmployeesRangeLabel,
  show: showJobTitleEmployeesPagination,
  goPrev: jobTitleEmployeesPrevPage,
  goNext: jobTitleEmployeesNextPage,
  reset: resetJobTitleEmployeesPage,
} = useClientPagination(sortedJobTitleEmployees, {
  pageSize: 15,
  resetOn: [jobTitleEmployeesSortBy, jobTitleEmployeesSortDir],
});
const guardianForm = reactive({ guardianId: '', fullName: '', email: '', password: '', nationalId: '', relationshipKind: 'Mamá', relationshipOther: '', search: '' });
const GUARDIAN_RELATIONSHIP_OPTIONS = ['Mamá', 'Papá', 'Hermano', 'Tío', 'Otro'];
function resolveGuardianRelationship(kind = guardianForm.relationshipKind, other = guardianForm.relationshipOther) {
  if (kind === 'Otro') return String(other || '').trim() || 'Otro';
  return kind || 'Mamá';
}
const guardianOptions = ref([]);
const guardianSaving = ref(false);
const guardianEditorOpen = ref(false);
const guardianEditorMode = ref('change'); // change | add
const guardianPickMode = ref('existing'); // existing | create
const guardianReplaceId = ref('');
const guardianSelectedExisting = ref(null);
const courseFeeSavingId = ref(null);
const courseAssignmentForm = reactive({ courseId: null, courseName: '', teachers: [], mode: 'subject' });
function parseTeacherList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => parseTeacherList(item)))];
  }
  if (value && typeof value === 'object') {
    return parseTeacherList(value.fullName || value.name || value.label || '');
  }
  return [...new Set(String(value || '').split(',').map((part) => part.trim()).filter(Boolean))];
}
function formatTeacherList(names) {
  const list = parseTeacherList(names);
  return list.length ? list.join(', ') : '';
}
function subjectTeacherSummary(teacher) {
  const list = parseTeacherList(teacher);
  if (!list.length) return 'Sin profesor';
  if (list.length === 1) return list[0];
  return `${list.length} profesores`;
}
function headTeacherNames(source) {
  if (!source) return [];
  if (typeof source === 'string' || Array.isArray(source)) {
    return parseTeacherList(source);
  }
  if (Array.isArray(source.headTeachers) && source.headTeachers.length) {
    return parseTeacherList(source.headTeachers);
  }
  return parseTeacherList(source.head_teacher || source.headTeacher || '');
}
function headTeacherSummary(source) {
  const list = headTeacherNames(source);
  if (!list.length) return 'Sin profesor jefe';
  if (list.length === 1) return list[0];
  return `${list.length} profesores jefes`;
}
function teacherListIncludes(haystack, name) {
  const needle = String(name || '').trim().toLocaleLowerCase('es');
  if (!needle) return false;
  return parseTeacherList(haystack).some((part) => part.toLocaleLowerCase('es') === needle);
}
const financeYear = ref(new Date().getFullYear());
const accountabilityYear = ref(new Date().getFullYear());
const accountabilityData = ref({ records: [], summary: { income: 0, expenses: 0, balance: 0, verified: 0 } });
const accountabilityRecords = computed(() => accountabilityData.value?.records || []);
const {
  page: accountabilityPage,
  pageCount: accountabilityPageCount,
  paged: pagedAccountabilityRecords,
  rangeLabel: accountabilityRangeLabel,
  show: showAccountabilityPagination,
  goPrev: accountabilityPrevPage,
  goNext: accountabilityNextPage,
  reset: resetAccountabilityPage,
} = useClientPagination(accountabilityRecords, { pageSize: 15, resetOn: [accountabilityYear] });
const accountabilityLoading = ref(false);
const accountabilityModalOpen = ref(false);
const accountabilitySaving = ref(false);
const accountabilityError = ref('');
const accountabilityForm = reactive({
  period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  movementType: 'income', fundingSource: 'Subvención general', category: 'Subvención recibida',
  documentType: 'Liquidación', documentNumber: '', counterparty: 'Ministerio de Educación',
  counterpartyTaxId: '', description: '', amount: '', status: 'draft'
});

const navigation = [
  { label: 'Resumen', title: 'Inicio', group: '', icon: LayoutDashboard },
  { label: 'Cursos', title: 'Cursos y asignaturas', group: 'Académico', icon: BookOpen },
  { label: 'Asistencia', title: 'Asistencias', group: 'Académico', icon: CalendarDays },
  { label: 'Calificaciones', group: 'Académico', icon: ClipboardList },
  { label: 'Tareas activas', title: 'Tareas activas', group: 'Académico', icon: ClipboardList },
  { label: 'Libro de clases', group: 'Académico', icon: BookOpen },
  { label: 'Planificación', group: 'Académico', icon: ClipboardList },
  { label: 'Horario', group: 'Académico', icon: CalendarDays },
  { label: 'Cierre anual', title: 'Cierre anual MINEDUC', group: 'Académico', icon: FileText },
  { label: 'MINEDUC / SIGE', group: 'Administración', icon: Settings },
  { label: 'Estudiantes', title: 'Lista', group: 'Estudiantes', icon: Users },
  { label: 'Matrículas', title: 'Matrículas y saldos', group: 'Estudiantes', icon: UserPlus },
  { label: 'Historial de pagos', title: 'Pagos recibidos', group: 'Estudiantes', icon: CreditCard },
  { label: 'Apoderados', title: 'Apoderados', group: 'Estudiantes', icon: ShieldCheck },
  { label: 'Comunicaciones', group: 'Comunidad', icon: Bell },
  { label: 'Citaciones', title: 'Citar a apoderado', group: 'Comunidad', icon: CalendarDays },
  { label: 'Postulaciones', group: 'Comunidad', icon: UserPlus },
  { label: 'Convivencia', group: 'Comunidad', icon: ShieldCheck },
  { label: 'Finanzas', group: 'Recursos humanos', icon: TrendingUp },
  { label: 'Documentos', group: 'Recursos humanos', icon: FileText },
  { label: 'RRHH', title: 'Empleados', group: 'Recursos humanos', icon: Users },
  { label: 'Solicitudes', title: 'Solicitudes', group: 'Recursos humanos', icon: CalendarDays },
  { label: 'Remuneraciones', title: 'Archivos y pagos de nómina', group: 'Recursos humanos', icon: FileText },
  { label: 'Administración', title: 'Equipo y permisos', group: 'Administración', icon: ShieldCheck },
  { label: 'Configurar colegio', group: 'Administración', icon: Settings },
  { label: 'Mensualidades', title: 'Mensualidad por curso', group: 'Administración', icon: CreditCard },
  { label: 'Integraciones', group: 'Administración', icon: Settings },
  { label: 'Historial', title: 'Auditoría', group: 'Administración', icon: ClipboardList },
  { label: 'Plataforma', title: 'Inicio', group: 'Inicio', icon: LayoutDashboard },
  { label: 'Colegios demo', title: 'Colegios de prueba', group: 'Herramientas', icon: RefreshCw },
  { label: 'Colegios', title: 'Todos los colegios', group: 'Colegios', icon: Building2 },
  { label: 'Agregar colegio', title: 'Crear colegio', group: 'Colegios', icon: Plus },
  { label: 'Cuentas', title: 'Cuentas de acceso', group: 'Personas', icon: Users },
  { label: 'Buscar gente', title: 'Buscar persona', group: 'Personas', icon: Search },
  { label: 'Sesiones', title: 'Sesiones abiertas', group: 'Personas', icon: Radio },
  { label: 'Inbox de contacto', title: 'Contacto', group: 'Contacto', icon: Inbox },
  { label: 'Correo SMTP', title: 'Correo saliente', group: 'Técnico', icon: Mail },
  { label: 'Plataforma pagos', title: 'Suscripciones y cobros', group: 'Cobros', icon: CreditCard },
];

const moduleKeys = {
  'Libro de clases': 'classbook',
  Finanzas: 'finance',
  RRHH: 'hr',
  Convivencia: 'coexistence',
  Citaciones: 'citations',
  Comunicaciones: 'communications',
  Documentos: 'documents',
  Historial: 'history',
};

const viewRoutes = {
  Resumen: '/',
  Matrículas: '/matriculas',
  'Historial de pagos': '/historial-pagos',
  Asistencia: '/asistencia',
  Calificaciones: '/calificaciones',
  'Tareas activas': '/tareas',
  'Historial de tareas': '/tareas/historial',
  Estudiantes: '/estudiantes',
  Apoderados: '/apoderados',
  'Nuevo apoderado': '/apoderados/nuevo',
  Cursos: '/cursos',
  'Nuevo curso': '/cursos/nuevo',
  Mensualidades: '/administracion/mensualidades',
  'Libro de clases': '/libro-de-clases',
  Planificación: '/planificacion',
  'Cierre anual': '/calificaciones/cierre-anual',
  Finanzas: '/finanzas',
  'Más años': '/finanzas/anos',
  RRHH: '/rrhh',
  'Nuevo empleado': '/empleados/nuevo',
  Solicitudes: '/solicitudes',
  'Nueva solicitud': '/solicitudes/nueva',
  Horario: '/horario',
  Convivencia: '/convivencia',
  Citaciones: '/citaciones',
  Comunicaciones: '/comunicaciones',
  'Nueva comunicación': '/comunicaciones/nueva',
  'Destinatarios comunicación': '/comunicaciones/nueva/destinatarios',
  'Nueva calificación': '/calificaciones/nueva',
  Documentos: '/documentos',
  Remuneraciones: '/remuneraciones/pagos',
  Administración: '/administracion/equipo',
  'Configurar colegio': '/administracion/colegio/datos',
  Integraciones: '/administracion/integraciones/whatsapp',
  'MINEDUC / SIGE': '/administracion/integraciones/sige',
  Historial: '/administracion/historial',
  'Mi cuenta': '/mi-cuenta',
  Postulaciones: '/postulaciones',
  'Inbox de contacto': '/plataforma/contactos',
  Plataforma: '/plataforma',
  'Colegios demo': '/plataforma/demo',
  Colegios: '/plataforma/colegios',
  'Agregar colegio': '/plataforma/colegios/nuevo',
  'Buscar gente': '/plataforma/gente',
  Cuentas: '/plataforma/cuentas',
  Sesiones: '/plataforma/sesiones',
  'Correo SMTP': '/plataforma/infraestructura/smtp',
  'Plataforma pagos': '/plataforma/pagos',
};
const financeSectionRoutes = {
  'documentos-de-cobro': 'Documentos de cobro',
  pagos: 'Pagos',
  gastos: 'Gastos',
  proveedores: 'Proveedores',
  'rendicion-de-cuentas': 'Rendición de cuentas',
};
const financeExportSections = {
  'Documentos de cobro': 'invoices',
  Pagos: 'payments',
  Gastos: 'expenses',
  Proveedores: 'suppliers',
};
const financialRoles = ['finance', 'agente_finanzas'];
const accountabilityRoles = ['director', 'manager', 'monitor', 'school_admin', 'super_admin', 'utp'];
const fundingSources = ['Subvención general', 'SEP', 'PIE', 'Mantenimiento', 'Pro-retención', 'Otros aportes públicos', 'Recursos privados'];
const incomeCategories = ['Subvención recibida', 'Aporte o transferencia', 'Donación', 'Reintegro', 'Otro ingreso'];
const expenseCategories = ['Remuneraciones', 'Operación', 'Recursos pedagógicos', 'Infraestructura y mantenimiento', 'Administración', 'Bienestar y apoyo estudiantil', 'Otro egreso'];

const studentStatusRows = computed(() =>
  students.value.filter((student) => studentStatusFilter.value === 'all' || student.active !== false)
);
function studentMatchesHeadingCourse(student) {
  const selectedId = Number(selectedCourse.value);
  if (!Number.isSafeInteger(selectedId) || selectedId < 1) return true;
  const selected = courses.value.find((course) => Number(course.id) === selectedId);
  if (!selected) return true;
  const label = `${selected.name || ''} ${selected.section || ''}`.replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');
  if (!label) return true;
  const studentCourses = String(student.courses || '')
    .split('·')
    .map((part) => part.replace(/\s+/g, ' ').trim().toLocaleLowerCase('es'))
    .filter(Boolean);
  return studentCourses.includes(label);
}
const filteredStudents = computed(() => {
  const query = normalizeSearch(studentDirectorySearch.value);
  const threshold = Number(studentGradeThreshold.value);
  const gradeThreshold = Number.isFinite(threshold) ? threshold : 4;
  return studentStatusRows.value.filter((student) => {
    if (!studentMatchesHeadingCourse(student)) return false;
    if (studentEnrollmentFilter.value === 'unenrolled' && Number(student.course_count || 0) > 0) return false;
    if (studentEnrollmentFilter.value === 'enrolled' && Number(student.course_count || 0) < 1) return false;

    const average = student.average == null || student.average === '' ? null : Number(student.average);
    if (studentGradeFilter.value === 'none' && average != null) return false;
    if (studentGradeFilter.value === 'lt') {
      if (average == null || !(average < gradeThreshold)) return false;
    }
    if (studentGradeFilter.value === 'gt') {
      if (average == null || !(average > gradeThreshold)) return false;
    }

    if (!query) return true;
    return normalizeSearch(
      `${student.first_name} ${student.last_name} ${student.email || ''} ${student.username || ''} ${student.courses || ''}`
    ).includes(query);
  });
});
const studentDirectorySortBy = ref('name');
const studentDirectorySortDir = ref('ASC');
const studentDirectoryColumns = [
  { key: 'name', label: 'Estudiante' },
  { key: 'courses', label: 'Curso' },
  { key: 'email', label: 'Correo' },
  { key: 'average', label: 'Promedio' },
  { key: 'grade_count', label: 'Evaluaciones' },
  { key: 'actions', label: '', sortable: false },
];
const sortedFilteredStudents = computed(() => {
  const rows = [...filteredStudents.value];
  const key = studentDirectorySortBy.value || 'name';
  const dir = studentDirectorySortDir.value === 'DESC' ? -1 : 1;
  const label = (row) => `${row.last_name || ''} ${row.first_name || ''}`.trim();
  rows.sort((a, b) => {
    if (key === 'grade_count' || key === 'course_count') {
      const diff = (Number(a[key]) || 0) - (Number(b[key]) || 0);
      if (diff) return diff * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    if (key === 'average') {
      const av = a.average == null || a.average === '' ? Number.NEGATIVE_INFINITY : Number(a.average);
      const bv = b.average == null || b.average === '' ? Number.NEGATIVE_INFINITY : Number(b.average);
      if (av !== bv) return (av - bv) * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    if (key === 'email' || key === 'courses') {
      const cmp = String(a[key] || '').localeCompare(String(b[key] || ''), 'es');
      if (cmp) return cmp * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    const cmp = label(a).localeCompare(label(b), 'es');
    if (cmp) return cmp * dir;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
  return rows;
});
function onStudentDirectorySort({ key, dir }) {
  studentDirectorySortBy.value = key;
  studentDirectorySortDir.value = dir;
}
const {
  page: studentDirectoryPage,
  pageCount: studentDirectoryPageCount,
  paged: pagedFilteredStudents,
  rangeLabel: studentDirectoryRangeLabel,
  show: showStudentDirectoryPagination,
  goPrev: studentDirectoryPrevPage,
  goNext: studentDirectoryNextPage,
} = useClientPagination(sortedFilteredStudents, {
  pageSize: 15,
  resetOn: [
    studentDirectorySearch,
    studentStatusFilter,
    studentEnrollmentFilter,
    studentGradeFilter,
    studentGradeThreshold,
    selectedCourse,
    studentDirectorySortBy,
    studentDirectorySortDir,
  ],
});
const searchResults = ref([]);
const searchLoading = ref(false);
const searchError = ref('');
const platformAccountsKey = ref(0);
const platformTenantsKey = ref(0);
const guardiansKey = ref(0);
const guardiansFocusId = ref(null);
const studentSearch = latestRequest((signal, q) => studentsApi.list({ q, page: 1, pageSize: 6 }, { signal }));
watch([search, searchOpen, authUser], ([query, open, user], _previous, onCleanup) => {
  studentSearch.cancel();
  searchResults.value = [];
  searchError.value = '';
  if (!open || !user) { searchLoading.value = false; return; }
  if (user.platformPermissions?.includes('platform.accounts.read') && user.platformConsole) {
    searchLoading.value = false;
    return;
  }
  if (query.trim().length < 2) { searchLoading.value = false; return; }
  searchLoading.value = true;
  const timer = setTimeout(async () => {
    try {
      const rows = await studentSearch.run(query);
      searchResults.value = rows;
      ensureStudentAvatars(rows);
    } catch (error) { if (error.name !== 'AbortError') searchError.value = error.message; }
    finally { if (search.value === query) searchLoading.value = false; }
  }, 200);
  onCleanup(() => { clearTimeout(timer); studentSearch.cancel(); });
});
function openPlatformPerson(person) {
  searchOpen.value = false;
  search.value = '';
  const id = Number(person?.globalUserId);
  const target = Number.isSafeInteger(id) && id > 0
    ? `/plataforma/cuentas/${id}`
    : '/plataforma/cuentas';
  currentView.value = 'Cuentas';
  platformAccountsKey.value += 1;
  window.history.pushState({ view: 'Cuentas', accountId: id || null }, '', target);
  sidebarOpen.value = false;
}

const teacherOwnedCourseIds = computed(() => {
  if (authUser.value?.role !== 'teacher') return null;
  const name = String(authUser.value.fullName || '').trim();
  if (!name) return new Set();
  return new Set(
    courses.value
      .filter((course) => (
        teacherListIncludes(course.teacher, name)
        || teacherListIncludes(course.head_teacher || course.headTeacher, name)
      ))
      .map((course) => Number(course.id))
  );
});
const isClassHeadTeacher = computed(() => {
  if (authUser.value?.role !== 'teacher') return false;
  const name = String(authUser.value.fullName || '').trim();
  return courses.value.some((course) => teacherListIncludes(course.head_teacher || course.headTeacher, name));
});
const showDashboardCharts = computed(() => {
  if (!dashboard.value?.charts) return false;
  if (authUser.value?.permissions?.manageSchool) return true;
  if (['director', 'manager', 'monitor', 'school_admin', 'super_admin', 'utp'].includes(authUser.value?.role)) return true;
  if (authUser.value?.role === 'teacher') return true;
  if (authUser.value?.role === 'guardian') return true;
  return isClassHeadTeacher.value;
});
const teacherScopeNote = computed(() => {
  if (authUser.value?.role !== 'teacher') return '';
  if (isClassHeadTeacher.value) {
    return 'Ves todas las notas del curso. Solo puedes editar las de tus asignaturas.';
  }
  return 'Solo ves y editas las notas de las asignaturas donde estás asignado.';
});
function navItemTitle(item) {
  if (!item) return '';
  if (item.label === 'Cursos' && authUser.value?.role === 'teacher') return 'Mis asignaturas';
  if (item.label === 'Estudiantes' && authUser.value?.role === 'student') return 'Mi ficha';
  if (item.label === 'Estudiantes' && authUser.value?.role === 'guardian') return 'Mis estudiantes';
  return item.title || item.label;
}
const teacherSubjectCourseIds = computed(() => {
  if (authUser.value?.role !== 'teacher') return null;
  const name = String(authUser.value.fullName || '').trim();
  if (!name) return new Set();
  return new Set(
    courses.value
      .filter((course) => teacherListIncludes(course.teacher, name))
      .map((course) => Number(course.id))
  );
});
const teacherScopedCourses = computed(() => {
  if (authUser.value?.role !== 'teacher') return courses.value;
  const owned = teacherOwnedCourseIds.value;
  return courses.value.filter((course) => owned.has(Number(course.id)));
});
const headingCourseFilterOptions = computed(() => {
  const source = teacherScopedCourses.value;
  const groupByClass = ['Estudiantes', 'Cursos', 'Resumen'].includes(currentView.value);
  if (!groupByClass) {
    return source.map((course) => ({
      id: course.id,
      label: `${course.name} ${course.section} · ${course.subject}`.replace(/\s+/g, ' ').trim(),
    }));
  }
  const seen = new Map();
  for (const course of source) {
    const key = `${course.name}|${course.section}|${course.academic_year_id || ''}`;
    if (!seen.has(key)) seen.set(key, course);
  }
  return [...seen.values()]
    .sort((a, b) => `${a.name || ''} ${a.section || ''}`.localeCompare(`${b.name || ''} ${b.section || ''}`, 'es'))
    .map((course) => ({
      id: course.id,
      label: `${course.name} ${course.section}`.replace(/\s+/g, ' ').trim(),
    }));
});
const teacherEditableCourses = computed(() => {
  if (authUser.value?.role !== 'teacher') return courses.value;
  const owned = teacherSubjectCourseIds.value;
  return courses.value.filter((course) => owned.has(Number(course.id)));
});
const gradeSearch = ref('');
const visibleGrades = computed(() => {
  const ownedCourseIds = teacherOwnedCourseIds.value;
  const query = normalizeSearch(gradeSearch.value);
  return grades.value.filter((grade) => {
    if (ownedCourseIds) {
      const courseId = Number(grade.course_id || grade.courseId);
      if (!ownedCourseIds.has(courseId)) return false;
    }
    if (!query) return true;
    return normalizeSearch(`${grade.student} ${grade.assessment} ${grade.course} ${grade.subject}`).includes(query);
  });
});
const gradeListSortBy = ref('student');
const gradeListSortDir = ref('ASC');
const gradeStudentColumns = [
  { key: 'student', label: 'Estudiante' },
  { key: 'subject_count', label: 'Asignaturas con notas' },
  { key: 'grade_count', label: 'Evaluaciones' },
  { key: 'average', label: 'Promedio' },
  { key: 'latest', label: 'Última nota' },
  { key: 'actions', label: '', sortable: false },
];
function onGradeListSort({ key, dir }) {
  gradeListSortBy.value = key;
  gradeListSortDir.value = String(dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
}
const gradeStudentRows = computed(() => {
  const groups = new Map();
  for (const grade of visibleGrades.value) {
    const group = groups.get(grade.student_id) || {
      student_id: grade.student_id,
      student: grade.student,
      avatar_color: grade.avatar_color,
      latest: grade.graded_at,
      grade_count: 0,
      score_total: 0,
      subjects: new Set(),
    };
    group.grade_count += 1;
    group.score_total += Number(grade.score) || 0;
    group.subjects.add(grade.subject);
    if (new Date(`${grade.graded_at}T12:00:00`) > new Date(`${group.latest}T12:00:00`)) group.latest = grade.graded_at;
    groups.set(grade.student_id, group);
  }
  const rows = [...groups.values()].map((group) => ({
    id: group.student_id,
    student_id: group.student_id,
    student: group.student,
    avatar_color: group.avatar_color,
    latest: group.latest,
    grade_count: group.grade_count,
    average: group.grade_count ? Number((group.score_total / group.grade_count).toFixed(1)) : null,
    subject_count: group.subjects.size,
  }));
  const key = gradeListSortBy.value || 'student';
  const dir = gradeListSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    let cmp = 0;
    if (key === 'average') {
      const av = a.average == null ? null : Number(a.average);
      const bv = b.average == null ? null : Number(b.average);
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = 1;
      else if (bv == null) cmp = -1;
      else cmp = av - bv;
    } else if (key === 'grade_count' || key === 'subject_count') {
      cmp = (Number(a[key]) || 0) - (Number(b[key]) || 0);
    } else if (key === 'latest') {
      const at = new Date(`${a.latest || '1970-01-01'}T12:00:00`).getTime();
      const bt = new Date(`${b.latest || '1970-01-01'}T12:00:00`).getTime();
      cmp = at - bt;
    } else {
      cmp = String(a.student || '').localeCompare(String(b.student || ''), 'es');
    }
    if (cmp) return cmp * dir;
    return String(a.student || '').localeCompare(String(b.student || ''), 'es') * dir;
  });
  return rows;
});
const gradePage = ref(1);
const gradePageSize = ref(25);
const gradePageCount = computed(() => Math.max(1, Math.ceil(gradeStudentRows.value.length / gradePageSize.value)));
const pagedGradeStudentRows = computed(() => {
  const start = (gradePage.value - 1) * gradePageSize.value;
  return gradeStudentRows.value.slice(start, start + gradePageSize.value);
});
const gradeRangeLabel = computed(() => {
  if (!gradeStudentRows.value.length) return '0 estudiantes';
  const from = (gradePage.value - 1) * gradePageSize.value + 1;
  const to = Math.min(gradeStudentRows.value.length, gradePage.value * gradePageSize.value);
  return `${from}–${to} de ${gradeStudentRows.value.length}`;
});
watch([gradeSearch, selectedCourse, gradePageSize, gradeListSortBy, gradeListSortDir], () => { gradePage.value = 1; });
watch(gradePageCount, (count) => {
  if (gradePage.value > count) gradePage.value = count;
});
const maxDistribution = computed(() => Math.max(...dashboard.value.distribution.map((item) => item.value), 1));
const isLeadershipDashboard = computed(() => ['director', 'manager', 'monitor'].includes(authUser.value?.role));
const activeCourse = computed(() => courses.value.find((course) => course.id === Number(selectedCourse.value)));
const courseDetail = computed(() => {
  // Only resolve from an explicit course route/id — never from the heading filter,
  // otherwise picking a course on Resumen/Cursos side-effects course detail state.
  if (courseDetailId.value == null || courseDetailId.value === '') return null;
  return courses.value.find((course) => Number(course.id) === Number(courseDetailId.value)) || null;
});
const courseAccessDenied = ref(false);
const courseAccessChecking = ref(false);
const courseAccessMessage = ref('');
const coursePageLoading = ref(false);

const courseAccessTitle = computed(() => {
  if (courseAccessChecking.value) return 'Comprobando acceso…';
  if (classroomForumId.value) return 'No tienes acceso a este foro';
  if (currentView.value === 'Agregar estudiantes') return 'No tienes acceso a este curso';
  if (currentView.value === 'Aula del curso') return 'No tienes acceso a este curso';
  return 'No tienes acceso a este curso';
});

const courseAccessHelp = computed(() => {
  if (courseAccessChecking.value) return 'Estamos verificando si puedes ver este contenido.';
  const role = authUser.value?.role;
  if (role === 'teacher') {
    return classroomForumId.value
      ? 'Solo puedes abrir foros de las asignaturas que tienes a cargo o donde eres profesor jefe. Si crees que es un error, pide a dirección que te asigne el ramo.'
      : 'Solo ves los cursos y asignaturas que tienes a cargo o donde eres profesor jefe. Si crees que es un error, pide a dirección que te asigne el ramo.';
  }
  if (role === 'guardian') {
    return 'Los foros del aula son solo para docentes y estudiantes. Como apoderado puedes ver notas, asistencia y comunicados.';
  }
  if (role === 'student') {
    return 'Solo puedes ver los cursos en los que estás matriculado.';
  }
  return classroomForumId.value
    ? 'No tienes permiso para ver este foro o el curso al que pertenece.'
    : 'No tienes permiso para ver este curso.';
});

async function ensureCourseInList(courseId, hint = null) {
  const id = Number(courseId);
  if (!Number.isSafeInteger(id) || id < 1) return false;
  if (courses.value.some((course) => Number(course.id) === id)) return true;
  try {
    const courseData = await coursesApi.list();
    if (Array.isArray(courseData)) {
      courses.value = courseData;
      try { courseGroups.value = await coursesApi.list({ grouped: 'true' }); } catch { /* ignore */ }
    }
  } catch { /* fall through to hint */ }
  if (courses.value.some((course) => Number(course.id) === id)) return true;
  if (hint && Number(hint.id) === id) {
    courses.value = [...courses.value, {
      id,
      name: hint.name || `Curso #${id}`,
      section: hint.section || '',
      subject: hint.subject || '',
      color: hint.color || '#0067b2',
      teacher: hint.teacher || null,
      academic_year_id: hint.academic_year_id || hint.academicYearId || null,
      head_teacher: hint.head_teacher || hint.headTeacher || null,
      student_count: Number(hint.student_count ?? hint.enrolled ?? 0) || 0,
      average: hint.average ?? null,
    }];
    return true;
  }
  return courses.value.some((course) => Number(course.id) === id);
}

async function verifyCourseAccess(courseId = courseDetailId.value) {
  const id = Number(courseId);
  courseAccessDenied.value = false;
  courseAccessMessage.value = '';
  if (!Number.isSafeInteger(id) || id < 1) return;
  if (courses.value.some((course) => Number(course.id) === id)) return;
  if (!['Detalle del curso', 'Aula del curso', 'Configurar aula', 'Agregar estudiantes', 'Asignatura del curso'].includes(currentView.value)) return;
  courseAccessChecking.value = true;
  try {
    const classroom = await request(`/courses/${id}/classroom`);
    // API confirmed access — never treat a missing local row as denial (super_admin / platform).
    courseAccessDenied.value = false;
    courseAccessMessage.value = '';
    await ensureCourseInList(id, { id, student_count: classroom?.enrolled || 0 });
  } catch (err) {
    courseAccessDenied.value = true;
    const apiMessage = String(err?.message || '').trim();
    if (err?.status === 403 || /acceso|permiso/i.test(apiMessage)) {
      courseAccessMessage.value = apiMessage && !/^no tienes acceso a este curso\.?$/i.test(apiMessage)
        ? apiMessage
        : '';
    } else {
      courseAccessMessage.value = apiMessage || 'No encontramos este curso.';
    }
  } finally {
    courseAccessChecking.value = false;
  }
}
const courseGroupRows = computed(() => {
  if (authUser.value?.role !== 'teacher') {
    return courseGroups.value.map((group) => {
      const modules = Array.isArray(group.modules) ? group.modules : [];
      group.moduleCount = modules.length;
      if (group.head_teacher == null && group.headTeacher != null) group.head_teacher = group.headTeacher;
      return group;
    });
  }
  const scoped = teacherScopedCourses.value;
  const groups = new Map();
  for (const course of scoped) {
    const key = `${course.name}|${course.section}|${course.academic_year_id || ''}`;
    const group = groups.get(key) || {
      id: course.id,
      name: course.name,
      section: course.section,
      academic_year_id: course.academic_year_id,
      color: course.color,
      modules: [],
      student_count: 0,
    };
    group.modules.push(course);
    group.student_count = Math.max(group.student_count, Number(course.student_count) || 0);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const scores = group.modules.filter((course) => course.average != null).map((course) => Number(course.average)).filter(Number.isFinite);
    const subjectTeachers = [...new Set(group.modules.flatMap((course) => parseTeacherList(course.teacher)))];
    const headTeachers = [...new Set(group.modules.flatMap((course) => parseTeacherList(course.head_teacher || course.headTeacher)))];
    const headTeacher = headTeachers.length ? headTeachers.join(', ') : null;
    return {
      ...group,
      modules: [...group.modules].sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || ''), 'es')),
      moduleCount: group.modules.length,
      teachers: subjectTeachers,
      headTeachers,
      teacher: subjectTeachers.length ? subjectTeachers.join(', ') : 'Sin profesor',
      head_teacher: headTeacher,
      headTeacher,
      monthly_fee: Number(group.modules.find((course) => course.monthly_fee != null)?.monthly_fee ?? group.modules[0]?.monthly_fee ?? 0),
      average: scores.length ? Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1)) : null,
    };
  });
});
const courseGroupsSortBy = ref('name');
const courseGroupsSortDir = ref('ASC');
const courseGroupColumns = [
  { key: 'name', label: 'Curso' },
  { key: 'moduleCount', label: 'Asignaturas' },
  { key: 'head_teacher', label: 'Profesores jefes' },
  { key: 'student_count', label: 'Estudiantes' },
  { key: 'average', label: 'Promedio' },
  { key: 'actions', label: '', sortable: false },
];
const sortedCourseGroupRows = computed(() => {
  const query = normalizeSearch(courseDirectorySearch.value);
  const selectedId = Number(selectedCourse.value);
  const selected = Number.isSafeInteger(selectedId) && selectedId > 0
    ? courses.value.find((course) => Number(course.id) === selectedId)
    : null;
  const rows = courseGroupRows.value.filter((row) => {
    if (selected) {
      const sameClass = row.name === selected.name
        && row.section === selected.section
        && String(row.academic_year_id || '') === String(selected.academic_year_id || '');
      if (!sameClass) return false;
    }
    if (!query) return true;
    const modules = Array.isArray(row.modules) ? row.modules : [];
    const haystack = [
      row.name,
      row.section,
      row.head_teacher || row.headTeacher,
      row.teacher,
      ...(row.teachers || []),
      ...modules.map((module) => module.subject || ''),
    ].join(' ');
    return normalizeSearch(haystack).includes(query);
  });
  const key = courseGroupsSortBy.value || 'name';
  const dir = courseGroupsSortDir.value === 'DESC' ? -1 : 1;
  const label = (row) => `${row.name || ''} ${row.section || ''}`.trim();
  rows.sort((a, b) => {
    if (key === 'moduleCount' || key === 'student_count') {
      const diff = (Number(a[key]) || 0) - (Number(b[key]) || 0);
      if (diff) return diff * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    if (key === 'average') {
      const av = a.average == null || a.average === '' ? Number.NEGATIVE_INFINITY : Number(a.average);
      const bv = b.average == null || b.average === '' ? Number.NEGATIVE_INFINITY : Number(b.average);
      if (av !== bv) return (av - bv) * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    if (key === 'head_teacher') {
      const cmp = String(a.head_teacher || a.headTeacher || '').localeCompare(String(b.head_teacher || b.headTeacher || ''), 'es');
      if (cmp) return cmp * dir;
      return label(a).localeCompare(label(b), 'es');
    }
    const cmp = label(a).localeCompare(label(b), 'es');
    if (cmp) return cmp * dir;
    return (Number(a.moduleCount) || 0) - (Number(b.moduleCount) || 0);
  });
  return rows;
});
function onCourseGroupsSort({ key, dir }) {
  courseGroupsSortBy.value = key;
  courseGroupsSortDir.value = dir;
}
const {
  page: courseGroupsPage,
  pageCount: courseGroupsPageCount,
  paged: pagedCourseGroupRows,
  rangeLabel: courseGroupsRangeLabel,
  show: showCourseGroupsPagination,
  goPrev: courseGroupsPrevPage,
  goNext: courseGroupsNextPage,
} = useClientPagination(sortedCourseGroupRows, {
  pageSize: 10,
  resetOn: [courseGroupsSortBy, courseGroupsSortDir, courseDirectorySearch, selectedCourse],
});
const courseSiblingCourses = computed(() => {
  if (!courseDetail.value) return [];
  return courses.value
    .filter(course => course.name === courseDetail.value.name && course.section === courseDetail.value.section && course.academic_year_id === courseDetail.value.academic_year_id)
    .sort((a, b) => a.subject.localeCompare(b.subject, 'es'));
});
const courseDetailHeadTeachers = computed(() => {
  if (!courseDetail.value) return [];
  const fromDetail = parseTeacherList(courseDetail.value.head_teacher || courseDetail.value.headTeacher);
  if (fromDetail.length) return fromDetail;
  return [...new Set(courseSiblingCourses.value.flatMap((row) => parseTeacherList(row.head_teacher || row.headTeacher)))];
});
const courseDetailHeadTeacher = computed(() => formatTeacherList(courseDetailHeadTeachers.value));
const addCourseSubjectOpen = ref(false);
const addCourseSubjectBusy = ref(false);
const addCourseSubjectError = ref('');
const addCourseSubjectCustom = ref('');
const addCourseSubjectSigeCode = ref('');
const addCourseSubjectCustoms = ref([]);
const addCourseSubjectCustomColor = ref('');
const addCourseSubjectSelected = ref([]);
const addCourseSubjectTemplateId = ref('basica');
const addCourseSubjectShowSuggestions = ref(false);
const renameSubjectId = ref(null);
const renameSubjectName = ref('');
const renameSubjectBusy = ref(false);
const subjectColorId = ref(null);
const subjectColorBusy = ref(false);
const SUBJECT_COLORS = [
  '#0067b2', '#F59E6D', '#27A37D', '#8B6CCF', '#0EA5E9',
  '#EF4444', '#14B8A6', '#F59E0B', '#6366F1', '#EC4899',
  '#84CC16', '#64748B', '#0D9488', '#D97706', '#7C3AED',
  '#DB2777',
];
function normalizeSubjectColor(value) {
  const color = String(value || '').trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(color) ? color : '';
}
function isPresetSubjectColor(color) {
  const next = normalizeSubjectColor(color);
  return SUBJECT_COLORS.some((item) => item.toUpperCase() === next);
}
function isCustomSubjectColor(color) {
  const next = normalizeSubjectColor(color);
  return Boolean(next) && !isPresetSubjectColor(next);
}
const addCourseSubjectCustomPickerOpen = ref(false);
const subjectColorCustomPickerOpen = ref(false);
function openAddCourseSubjectCustomColor() {
  if (!isCustomSubjectColor(addCourseSubjectCustomColor.value)) {
    addCourseSubjectCustomColor.value = '#336699';
  }
  addCourseSubjectCustomPickerOpen.value = true;
  nextTick(() => {
    const input = document.getElementById('add-course-subject-custom-color');
    input?.focus?.();
    input?.showPicker?.();
  });
}
function onAddCourseSubjectCustomColorInput(event) {
  const next = normalizeSubjectColor(event?.target?.value);
  if (!next) return;
  if (isSubjectColorTaken(next)) {
    addCourseSubjectError.value = 'Ese color ya lo usa otra asignatura del curso.';
    return;
  }
  addCourseSubjectError.value = '';
  addCourseSubjectCustomColor.value = next;
}
function selectAddCourseSubjectPaletteColor(color) {
  addCourseSubjectCustomPickerOpen.value = false;
  addCourseSubjectCustomColor.value = color;
}
function clearAddCourseSubjectColor() {
  addCourseSubjectCustomPickerOpen.value = false;
  addCourseSubjectCustomColor.value = '';
}
function openSubjectColorCustomPicker(course) {
  if (!course) return;
  const current = normalizeSubjectColor(course.color);
  const seed = isCustomSubjectColor(current) ? current : '#336699';
  subjectColorCustomPickerOpen.value = true;
  nextTick(() => {
    const input = document.getElementById(`subject-custom-color-${course.id}`);
    if (input) input.value = seed;
    input?.focus?.();
    input?.showPicker?.();
  });
}
function onSubjectCustomColorInput(course, event) {
  const next = normalizeSubjectColor(event?.target?.value);
  if (!next || !course) return;
  saveSubjectColor(course, next);
}
function takenSubjectColors(exceptId = null) {
  return new Set(
    courseSiblingCourses.value
      .filter((row) => Number(row.id) !== Number(exceptId))
      .map((row) => normalizeSubjectColor(row.color))
      .filter(Boolean),
  );
}
function isSubjectColorTaken(color, exceptId = null) {
  return takenSubjectColors(exceptId).has(normalizeSubjectColor(color));
}
function startChangeSubjectColor(course) {
  renameSubjectId.value = null;
  subjectColorId.value = course.id;
  subjectColorCustomPickerOpen.value = isCustomSubjectColor(course.color);
}
function cancelChangeSubjectColor() {
  if (subjectColorBusy.value) return;
  subjectColorId.value = null;
  subjectColorCustomPickerOpen.value = false;
}
async function saveSubjectColor(course, color) {
  const next = normalizeSubjectColor(color);
  if (!course || !next || subjectColorBusy.value) return;
  if (normalizeSubjectColor(course.color) === next) {
    subjectColorId.value = null;
    return;
  }
  if (isSubjectColorTaken(next, course.id)) {
    showToast('Ese color ya lo usa otra asignatura del curso.', 'error');
    return;
  }
  subjectColorBusy.value = true;
  try {
    const result = await request(`/courses/${course.id}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color: next }),
    });
    const updated = result.course || { ...course, color: next };
    courses.value = courses.value.map((row) => (Number(row.id) === Number(course.id) ? { ...row, ...updated } : row));
    subjectColorId.value = null;
    showToast(`Color de “${updated.subject || course.subject}” actualizado`);
  } catch (err) {
    showToast(err.message || 'No fue posible cambiar el color.', 'error');
  } finally {
    subjectColorBusy.value = false;
  }
}
const removingSubjectId = ref(null);
const addCourseSubjectTemplate = computed(() => courseTemplates.value.find((item) => item.id === addCourseSubjectTemplateId.value) || null);
const addCourseSubjectExisting = computed(() => new Set(courseSiblingCourses.value.map((row) => String(row.subject || '').toLocaleLowerCase('es'))));
const addCourseSubjectOptions = computed(() => {
  const existing = addCourseSubjectExisting.value;
  const fromTemplate = (addCourseSubjectTemplate.value?.subjects || []).filter((name) => !existing.has(name.toLocaleLowerCase('es')));
  const fromCatalog = (subjects.value || [])
    .map((row) => row.name)
    .filter((name) => name && !existing.has(name.toLocaleLowerCase('es')) && !fromTemplate.some((item) => item.toLocaleLowerCase('es') === name.toLocaleLowerCase('es')));
  return [...fromTemplate, ...fromCatalog];
});
async function openAddCourseSubject() {
  if (!courseDetail.value || !canManageAcademicStructure.value) return;
  addCourseSubjectError.value = '';
  addCourseSubjectCustom.value = '';
  addCourseSubjectSigeCode.value = '';
  addCourseSubjectCustomColor.value = '';
  addCourseSubjectCustomPickerOpen.value = false;
  addCourseSubjectCustoms.value = [];
  addCourseSubjectSelected.value = [];
  addCourseSubjectOpen.value = true;
  addCourseSubjectShowSuggestions.value = false;
  await Promise.all([
    courseTemplates.value.length ? Promise.resolve() : loadCourseTemplates(),
    request('/subjects').then((rows) => { subjects.value = rows; }).catch(() => {}),
  ]);
  addCourseSubjectTemplateId.value = courseTemplates.value.some((item) => item.id === 'basica')
    ? 'basica'
    : (courseTemplates.value.find((item) => (item.subjects || []).length)?.id || courseTemplates.value[0]?.id || '');
  await nextTick();
  document.getElementById('course-new-subject-input')?.focus?.();
  document.getElementById('course-add-subject-panel')?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
}
function onAddCourseSubjectNameInput() {
  if (addCourseSubjectSigeCode.value.trim()) return;
  addCourseSubjectSigeCode.value = lookupSigeSubjectDefault(addCourseSubjectCustom.value);
}
function onAddCourseSubjectTemplateChange() {
  const available = new Set(addCourseSubjectOptions.value);
  addCourseSubjectSelected.value = addCourseSubjectSelected.value.filter((name) => available.has(name));
}
function selectAllAddCourseSubjects() {
  addCourseSubjectSelected.value = [...addCourseSubjectOptions.value];
}
function clearAddCourseSubjects() {
  addCourseSubjectSelected.value = [];
}
function addAddCourseCustomSubject() {
  const name = addCourseSubjectCustom.value.trim();
  if (!name) return;
  const customNames = addCourseSubjectCustoms.value.map((item) => customSubjectName(item));
  const exists = [
    ...addCourseSubjectSelected.value,
    ...customNames,
    ...courseSiblingCourses.value.map((row) => row.subject),
  ].some((subject) => String(subject || '').toLocaleLowerCase('es') === name.toLocaleLowerCase('es'));
  if (exists) {
    addCourseSubjectError.value = 'Esa asignatura ya está en el curso o en la selección.';
    return;
  }
  const color = normalizeSubjectColor(addCourseSubjectCustomColor.value);
  if (color && (isSubjectColorTaken(color) || addCourseSubjectCustoms.value.some((item) => customSubjectColor(item) === color))) {
    addCourseSubjectError.value = 'Ese color ya lo usa otra asignatura del curso.';
    return;
  }
  const sigeSubjectCode = suggestedSigeSubjectCode(name, addCourseSubjectSigeCode.value);
  addCourseSubjectCustoms.value = [...addCourseSubjectCustoms.value, { name, color, sigeSubjectCode }];
  addCourseSubjectCustom.value = '';
  addCourseSubjectSigeCode.value = '';
  addCourseSubjectCustomColor.value = '';
  addCourseSubjectError.value = '';
}
function removeAddCourseCustomSubject(name) {
  addCourseSubjectCustoms.value = addCourseSubjectCustoms.value.filter((item) => customSubjectName(item) !== name);
}
function closeAddCourseSubject() {
  if (addCourseSubjectBusy.value) return;
  addCourseSubjectOpen.value = false;
  addCourseSubjectError.value = '';
  addCourseSubjectCustomColor.value = '';
  addCourseSubjectSigeCode.value = '';
  addCourseSubjectCustomPickerOpen.value = false;
}
async function postCourseSubjects({ subjectsSelected = [], customSubjects = [] }) {
  if (!courseDetail.value) return null;
  const normalizedCustoms = customSubjects.map((item) => (
    typeof item === 'string'
      ? { name: item, color: undefined, sigeSubjectCode: suggestedSigeSubjectCode(item) || undefined }
      : {
        name: customSubjectName(item),
        color: customSubjectColor(item) || undefined,
        sigeSubjectCode: suggestedSigeSubjectCode(customSubjectName(item), item?.sigeSubjectCode) || undefined,
      }
  ));
  const result = await request(`/courses/${courseDetail.value.id}/subjects`, {
    method: 'POST',
    body: JSON.stringify({
      templateId: addCourseSubjectTemplateId.value || undefined,
      subjects: subjectsSelected.filter((name) => (addCourseSubjectTemplate.value?.subjects || []).includes(name)),
      customSubjects: [
        ...normalizedCustoms,
        ...subjectsSelected
          .filter((name) => !(addCourseSubjectTemplate.value?.subjects || []).includes(name))
          .map((name) => ({ name, sigeSubjectCode: suggestedSigeSubjectCode(name) || undefined })),
      ],
    }),
  });
  try {
    subjects.value = await request('/subjects');
  } catch { /* keep local catalog if refresh fails */ }
  return result;
}
async function createCourseSubjectNow() {
  if (!courseDetail.value || addCourseSubjectBusy.value) return;
  const name = addCourseSubjectCustom.value.trim();
  if (!name) {
    addCourseSubjectError.value = 'Escribe el nombre de la asignatura.';
    return;
  }
  if (name.length > 100) {
    addCourseSubjectError.value = 'El nombre de la asignatura es demasiado largo.';
    return;
  }
  const exists = courseSiblingCourses.value.some(
    (row) => String(row.subject || '').toLocaleLowerCase('es') === name.toLocaleLowerCase('es'),
  );
  if (exists) {
    addCourseSubjectError.value = 'Esa asignatura ya está en el curso.';
    return;
  }
  const color = normalizeSubjectColor(addCourseSubjectCustomColor.value);
  if (color && isSubjectColorTaken(color)) {
    addCourseSubjectError.value = 'Ese color ya lo usa otra asignatura del curso.';
    return;
  }
  addCourseSubjectBusy.value = true;
  addCourseSubjectError.value = '';
  try {
    const sigeSubjectCode = suggestedSigeSubjectCode(name, addCourseSubjectSigeCode.value);
    const result = await postCourseSubjects({ customSubjects: [{ name, color, sigeSubjectCode }] });
    addCourseSubjectCustom.value = '';
    addCourseSubjectSigeCode.value = '';
    addCourseSubjectCustomColor.value = '';
    addCourseSubjectOpen.value = false;
    showToast(`Asignatura “${result.courses?.[0]?.subject || name}” creada`);
    const focusId = result.courses?.[0]?.id || courseDetail.value.id;
    await openCourseDetail(focusId);
  } catch (err) {
    addCourseSubjectError.value = err.message;
  } finally {
    addCourseSubjectBusy.value = false;
  }
}
async function saveAddCourseSubjects() {
  if (!courseDetail.value) return;
  if (addCourseSubjectCustom.value.trim()) addAddCourseCustomSubject();
  const subjectsSelected = [...addCourseSubjectSelected.value];
  const customSubjects = [...addCourseSubjectCustoms.value];
  if (!subjectsSelected.length && !customSubjects.length) {
    addCourseSubjectError.value = 'Escribe un nombre o elige sugerencias para agregar.';
    return;
  }
  addCourseSubjectBusy.value = true;
  addCourseSubjectError.value = '';
  try {
    const result = await postCourseSubjects({ subjectsSelected, customSubjects });
    addCourseSubjectOpen.value = false;
    showToast((result.courses || []).length === 1
      ? `Asignatura “${result.courses[0].subject}” agregada`
      : `${(result.courses || []).length} asignaturas agregadas`);
    const focusId = result.courses?.[0]?.id || courseDetail.value.id;
    await openCourseDetail(focusId);
  } catch (err) {
    addCourseSubjectError.value = err.message;
  } finally {
    addCourseSubjectBusy.value = false;
  }
}
function startRenameCourseSubject(course) {
  subjectColorId.value = null;
  renameSubjectId.value = course.id;
  renameSubjectName.value = course.subject || '';
}
function cancelRenameCourseSubject() {
  if (renameSubjectBusy.value) return;
  renameSubjectId.value = null;
  renameSubjectName.value = '';
}
async function saveRenameCourseSubject(course) {
  const name = renameSubjectName.value.trim();
  if (!name || renameSubjectBusy.value) return;
  renameSubjectBusy.value = true;
  try {
    const result = await request(`/courses/${course.id}/subject`, {
      method: 'PUT',
      body: JSON.stringify({ subject: name }),
    });
    const updated = result.course || { ...course, subject: name };
    courses.value = courses.value.map((row) => (Number(row.id) === Number(course.id) ? { ...row, ...updated } : row));
    renameSubjectId.value = null;
    renameSubjectName.value = '';
    showToast(`Asignatura renombrada a “${updated.subject || name}”`);
    await loadData();
  } catch (err) {
    showToast(err.message || 'No fue posible renombrar la asignatura.', 'error');
  } finally {
    renameSubjectBusy.value = false;
  }
}
async function removeCourseSubject(course) {
  if (!course || removingSubjectId.value) return;
  const siblings = courseSiblingCourses.value.filter((row) => Number(row.id) !== Number(course.id));
  if (!(await askConfirmation(`¿Quitar “${course.subject}” de ${course.name} · ${course.section}? Solo se permite si no tiene calificaciones.`))) return;
  removingSubjectId.value = course.id;
  try {
    await request(`/courses/${course.id}`, { method: 'DELETE' });
    showToast(`Asignatura “${course.subject}” eliminada`);
    if (Number(courseDetailId.value) === Number(course.id)) {
      if (siblings[0]) await openCourseDetail(siblings[0].id);
      else {
        courseDetailId.value = null;
        navigate('Cursos');
        await loadData();
      }
    } else {
      await loadData();
    }
  } catch (err) {
    showToast(err.message || 'No fue posible eliminar la asignatura.', 'error');
  } finally {
    removingSubjectId.value = null;
  }
}
function openAssignCourseTeacher(course) {
  if (!course?.id) return;
  classroomSubjectFocusId.value = Number(course.id);
  openCourseClassroomConfig(course.id, 'subjects');
}
function openAssignHeadTeacher(course = courseDetail.value) {
  if (!course?.id) return;
  openCourseClassroomConfig(course.id, 'head');
}
function openAttentionUnassigned(row) {
  if (!row?.id) return;
  const course = courses.value.find((item) => Number(item.id) === Number(row.id)) || row;
  openAssignCourseTeacher(course);
}

function initClassroomSubjectTeachers() {
  Object.keys(classroomSubjectTeachers).forEach((key) => {
    delete classroomSubjectTeachers[key];
  });
  for (const row of courseSiblingCourses.value) {
    classroomSubjectTeachers[Number(row.id)] = parseTeacherList(row.teacher);
  }
  const focusId = Number(classroomSubjectFocusId.value);
  const hasFocus = courseSiblingCourses.value.some((row) => Number(row.id) === focusId);
  if (!hasFocus) {
    classroomSubjectFocusId.value = courseSiblingCourses.value[0]
      ? Number(courseSiblingCourses.value[0].id)
      : null;
  }
}

function onClassroomSubjectSelect() {
  teacherPickerQuery.value = '';
  const id = Number(classroomSubjectFocusId.value);
  if (id && !Array.isArray(classroomSubjectTeachers[id])) {
    classroomSubjectTeachers[id] = [];
  }
}

async function openFocusedClassroomSubject() {
  await nextTick();
  initClassroomSubjectTeachers();
}
const courseAssessments = computed(() => [...new Set(grades.value.map((grade) => grade.assessment))]);
const courseGradeSortBy = ref('student');
const courseGradeSortDir = ref('ASC');
const courseGradeRows = computed(() => {
  const rows = students.value.map((student) => ({
    student,
    grades: Object.fromEntries(courseAssessments.value.map((assessment) => [assessment, grades.value.find((grade) => Number(grade.student_id) === Number(student.id) && grade.assessment === assessment)])),
  }));
  const key = courseGradeSortBy.value || 'student';
  const dir = courseGradeSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    let cmp = 0;
    if (key === 'average') {
      const av = a.student.average == null || a.student.average === '' ? null : Number(a.student.average);
      const bv = b.student.average == null || b.student.average === '' ? null : Number(b.student.average);
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = 1;
      else if (bv == null) cmp = -1;
      else cmp = av - bv;
    } else if (courseAssessments.value.includes(key)) {
      const av = a.grades[key]?.score == null ? null : Number(a.grades[key].score);
      const bv = b.grades[key]?.score == null ? null : Number(b.grades[key].score);
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = 1;
      else if (bv == null) cmp = -1;
      else cmp = av - bv;
    } else {
      const an = `${a.student.last_name || ''} ${a.student.first_name || ''}`.trim();
      const bn = `${b.student.last_name || ''} ${b.student.first_name || ''}`.trim();
      cmp = an.localeCompare(bn, 'es', { sensitivity: 'base' });
    }
    if (cmp) return cmp * dir;
    const an = `${a.student.last_name || ''} ${a.student.first_name || ''}`.trim();
    const bn = `${b.student.last_name || ''} ${b.student.first_name || ''}`.trim();
    return an.localeCompare(bn, 'es', { sensitivity: 'base' });
  });
  return rows;
});
function courseGradeSortGlyph(key) {
  return {
    active: courseGradeSortBy.value === key,
    asc: courseGradeSortBy.value === key && courseGradeSortDir.value === 'ASC',
    desc: courseGradeSortBy.value === key && courseGradeSortDir.value === 'DESC',
  };
}
function courseGradeSortAria(key) {
  if (courseGradeSortBy.value !== key) return 'none';
  return courseGradeSortDir.value === 'ASC' ? 'ascending' : 'descending';
}
const {
  page: courseGradePage,
  pageCount: courseGradePageCount,
  paged: pagedCourseGradeRows,
  rangeLabel: courseGradeRangeLabel,
  show: showCourseGradePagination,
  goPrev: courseGradePrevPage,
  goNext: courseGradeNextPage,
  reset: resetCourseGradePage,
} = useClientPagination(courseGradeRows, {
  pageSize: 15,
  resetOn: [courseGradeSortBy, courseGradeSortDir, selectedCourse, () => courseDetailId.value],
});
function toggleCourseGradeSort(key) {
  if (courseGradeSortBy.value === key) {
    courseGradeSortDir.value = courseGradeSortDir.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    courseGradeSortBy.value = key;
    courseGradeSortDir.value = 'ASC';
  }
}
watch(selectedCourse, () => { resetCourseGradePage(); });
const activeMaterialCourse = computed(() => courses.value.find((course) => course.id === Number(materialCourseId.value)));
const uploadMaterialCourse = computed(() => courses.value.find((course) => course.id === Number(materialForm.courseId)));
const userFirstName = computed(() => authUser.value?.fullName?.split(' ')[0] || '');
const roleLabels = {
  director: 'Director del colegio',
  manager: 'Equipo directivo',
  monitor: 'Monitor',
  school_admin: 'Administrador del colegio',
  super_admin: 'Administrador',
  utp: 'Jefe de UTP',
  inspector: 'Inspector',
  warehouse: 'Bodega',
  agente_finanzas: 'Agente de finanzas',
  finance: 'Agente de finanzas',
  teacher: 'Profesor',
  guardian: 'Apoderado',
  student: 'Estudiante',
};
const staffPermissionFlags = [
  ['manageUsers', 'Usuarios'],
  ['manageGrades', 'Notas'],
  ['viewReports', 'Reportes'],
  ['manageSchool', 'Colegio'],
  ['manageHr', 'RRHH'],
  ['manageFinance', 'Finanzas'],
  ['approveLeave', 'Aprobar solicitudes'],
];
function staffPermissionLabels(staff) {
  const perms = staff?.permissions || {};
  return staffPermissionFlags.filter(([key]) => Boolean(perms[key])).map(([, label]) => label);
}
function onStaffPermToggle(event) {
  const menu = event.target;
  if (!(menu instanceof HTMLDetailsElement) || !menu.open) return;
  document.querySelectorAll('.staff-perm-menu[open]').forEach((other) => {
    if (other !== menu) other.open = false;
  });
}
const platformRoleLabels = {
  platform_admin: 'Administrador de plataforma',
  support_agent: 'Agente de soporte',
  sales_admin: 'Administrador de ventas',
  billing_admin: 'Administrador de cobros',
  technical_admin: 'Administrador técnico',
};
const filteredStaffUsers = computed(() => {
  const rows = staffUsers.value.filter((staff) => {
    if (staff.role === 'super_admin') return false;
    const roleMatches = staffRoleFilter.value === 'all' || staff.role === staffRoleFilter.value;
    const flagMatches = staffFlagFilter.value === 'all' || Boolean(staff.permissions?.[staffFlagFilter.value]);
    const teamActive = staff.teamActive !== false && staff.teamActive !== 0 && staff.active !== false;
    const statusMatches = staffStatusFilter.value === 'all' || teamActive;
    return roleMatches && flagMatches && statusMatches;
  });
  const { key, dir } = staffListSort.value;
  const factor = dir === 'asc' ? 1 : -1;
  const valueOf = (staff) => {
    if (key === 'username') return String(staff.username || '').toLowerCase();
    if (key === 'role') return String(roleLabels[staff.role] || staff.role || '').toLowerCase();
    if (key === 'permissions') return staffPermissionLabels(staff).length;
    if (key === 'status') {
      const active = staff.teamActive !== false && staff.teamActive !== 0 && staff.active !== false;
      return active ? 1 : 0;
    }
    return String(staff.fullName || '').toLowerCase();
  };
  return [...rows].sort((a, b) => {
    const left = valueOf(a);
    const right = valueOf(b);
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
    return String(left).localeCompare(String(right), 'es', { sensitivity: 'base' }) * factor;
  });
});
const {
  page: staffPage,
  pageCount: staffPageCount,
  paged: pagedStaffUsers,
  rangeLabel: staffRangeLabel,
  show: showStaffPagination,
  goPrev: staffPrevPage,
  goNext: staffNextPage,
} = useClientPagination(filteredStaffUsers, {
  pageSize: 15,
  resetOn: [staffRoleFilter, staffFlagFilter, staffStatusFilter, staffListSort],
});
const {
  page: salariesPage,
  pageCount: salariesPageCount,
  paged: pagedSalaries,
  rangeLabel: salariesRangeLabel,
  show: showSalariesPagination,
  goPrev: salariesPrevPage,
  goNext: salariesNextPage,
} = useClientPagination(salaries, { pageSize: 15 });
const employeePositionOptions = computed(() => {
  const fromCatalog = jobTitles.value.map((title) => title.name).filter(Boolean);
  const fromRows = (moduleData.value?.sections?.find((section) => section.title === 'Empleados')?.rows || [])
    .map((row) => row.position)
    .filter(Boolean);
  return [...new Set([...fromCatalog, ...fromRows])].sort((a, b) => a.localeCompare(b, 'es'));
});
const employeeTypeFilterOptions = computed(() => {
  const rows = moduleData.value?.sections?.find((section) => section.title === 'Empleados')?.rows || [];
  return [...new Set(rows.map((row) => row.position).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
});
const teacherUsers = computed(() => {
  const rows = staffUsers.value.filter((staff) => (
    staff.role === 'teacher' && staff.teamActive !== false && staff.active !== false
  ));
  // Assignment stores teacher names (not ids); collapse duplicate full names so the picker
  // does not show the same person twice when there are duplicate accounts.
  const byName = new Map();
  for (const staff of rows) {
    const key = String(staff.fullName || '').trim().toLocaleLowerCase('es');
    if (!key) continue;
    const previous = byName.get(key);
    if (!previous || Number(staff.id) < Number(previous.id)) byName.set(key, staff);
  }
  return [...byName.values()].sort((a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''), 'es', { sensitivity: 'base' }));
});
const teacherPickerQuery = ref('');
const teacherAssignPickerQuery = ref('');
function filterTeacherUsers(query) {
  const q = String(query || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (!q) return teacherUsers.value;
  return teacherUsers.value.filter((teacher) => {
    const haystack = `${teacher.fullName || ''} ${teacher.username || ''}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return haystack.includes(q);
  });
}
const filteredClassroomTeachers = computed(() => filterTeacherUsers(teacherPickerQuery.value));
const filteredAssignTeachers = computed(() => filterTeacherUsers(teacherAssignPickerQuery.value));
const {
  page: classroomTeacherPage,
  pageCount: classroomTeacherPageCount,
  paged: pagedClassroomTeachers,
  rangeLabel: classroomTeacherRangeLabel,
  show: showClassroomTeacherPagination,
} = useClientPagination(filteredClassroomTeachers, { pageSize: 12, resetOn: [teacherPickerQuery] });
const {
  page: assignTeacherPage,
  pageCount: assignTeacherPageCount,
  paged: pagedAssignTeachers,
  rangeLabel: assignTeacherRangeLabel,
  show: showAssignTeacherPagination,
} = useClientPagination(filteredAssignTeachers, { pageSize: 12, resetOn: [teacherAssignPickerQuery] });
const staffUsesEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.username));
const canManageHr = computed(() => authUser.value?.permissions?.manageUsers || authUser.value?.permissions?.manageHr || ['director', 'finance', 'agente_finanzas'].includes(authUser.value?.role));
const canAccessLeave = computed(() => {
  const role = authUser.value?.role;
  if (!role || ['guardian', 'student'].includes(role)) return false;
  return true;
});
const canApproveLeave = computed(() => Boolean(authUser.value?.permissions?.approveLeave) || canManageHr.value || Boolean(authUser.value?.permissions?.manageUsers) || authUser.value?.role === 'manager');
const canManageDocuments = computed(() => authUser.value?.role === 'director' || !['teacher', 'student', 'guardian', 'monitor'].includes(authUser.value?.role) && (authUser.value?.permissions?.manageSchool || authUser.value?.permissions?.manageUsers || authUser.value?.permissions?.manageHr || authUser.value?.permissions?.manageFinance || financialRoles.includes(authUser.value?.role)));
const canDeactivateStudent = computed(() => (
  Boolean(authUser.value?.permissions?.manageUsers)
  && ['director', 'school_admin', 'super_admin', 'utp', 'manager'].includes(authUser.value?.role)
));
const canManageFinance = computed(() => authUser.value?.permissions?.manageFinance || ['director', 'school_admin', 'super_admin', 'finance', 'agente_finanzas'].includes(authUser.value?.role));
const canManageAccountability = computed(() => accountabilityRoles.includes(authUser.value?.role));
const isAccountabilityView = computed(() => currentView.value === 'Finanzas' && activeModuleSection.value === 'Rendición de cuentas');
const accountabilityYears = computed(() => Array.from({ length: 101 }, (_, index) => 2100 - index));
const recentFinanceYears = computed(() => {
  const years = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index);
  if (!years.includes(financeYear.value)) years[9] = financeYear.value;
  return years;
});
function selectFinanceYear(event) {
  const value = event.target.value;
  if (value === 'more') {
    event.target.value = String(financeYear.value);
    window.history.pushState({}, '', `/finanzas/anos?year=${financeYear.value}`);
    syncRouteFromLocation();
  } else financeYear.value = Number(value);
}
function openFinanceYear(year) {
  window.history.pushState({}, '', `/finanzas?year=${year}`);
  syncRouteFromLocation();
}

const isPlatformConsole = computed(() => Boolean(
  authUser.value?.platformConsole
  && !authUser.value?.impersonation
  && authUser.value?.platformPermissions?.includes('platform.accounts.read')
));
/** Prefs multi-colegio: solo personal con varios colegios, no operadores de plataforma / super_admin. */
const showLinkedSchoolsPrefs = computed(() => {
  if (authUser.value?.platformPermissions?.includes('platform.accounts.read')) return false;
  if (authUser.value?.role === 'super_admin') return false;
  return (authUser.value?.memberships?.length || 0) > 1;
});
const sidebarSchoolName = computed(() =>
  school.value?.name
  || authUser.value?.memberships?.find((item) => item.schoolId === authUser.value?.schoolId)?.school?.name
  || ''
);
const showSchoolLogoInSidebar = computed(() => Boolean(
  !isPlatformConsole.value
  && school.value?.hasLogo
  && school.value?.showLogoInSidebar !== false
  && schoolLogoPreview.value
));
const showSchoolBrandInSidebar = computed(() => Boolean(
  !isPlatformConsole.value
  && (sidebarSchoolName.value || school.value?.id)
));
const sidebarNavCollapsible = computed(() => (
  isPlatformConsole.value || school.value?.sidebarCollapsible !== false
));
const sidebarPanelCollapsible = computed(() => (
  !isPlatformConsole.value && school.value?.sidebarPanelCollapsible !== false
));
const sidebarIsCompact = computed(() => (
  sidebarPanelCollapsible.value && sidebarCompact.value
));
function toggleSidebarCompact() {
  if (!sidebarPanelCollapsible.value) return;
  sidebarCompact.value = !sidebarCompact.value;
  sessionFlagSet('sidebar_compact', sidebarCompact.value ? '1' : '0');
}
watch(sidebarPanelCollapsible, (allowed) => {
  if (!allowed && sidebarCompact.value) {
    sidebarCompact.value = false;
    sessionFlagSet('sidebar_compact', '0');
  }
});
const sidebarThemeStyle = computed(() => {
  if (isPlatformConsole.value) return null;
  const bg = normalizeSidebarHex(school.value?.sidebarBgColor, SIDEBAR_BG_DEFAULT);
  const fg = normalizeSidebarHex(school.value?.sidebarTextColor, SIDEBAR_TEXT_DEFAULT);
  const fontSize = normalizeSidebarFontSize(school.value?.sidebarFontSize, SIDEBAR_FONT_SIZE_DEFAULT);
  const lineHeight = sidebarLineHeightFor(fontSize);
  return {
    '--sidebar-bg': bg,
    '--sidebar-fg': fg,
    '--sidebar-font-size': `${fontSize}px`,
    '--sidebar-line-height': `${lineHeight}px`,
    '--sidebar-muted': fg,
    '--sidebar-soft': `color-mix(in srgb, ${fg} 14%, transparent)`,
    '--sidebar-hover': `color-mix(in srgb, ${fg} 18%, transparent)`,
    '--sidebar-border': `color-mix(in srgb, ${fg} 18%, transparent)`,
  };
});
function isNavGroupOpen(group) {
  if (group.direct) return false;
  if (!sidebarNavCollapsible.value) return true;
  return expandedNav.value === group.title;
}
function activeNavigationGroupTitle() {
  const activeGroup = navigationGroups.value.find((group) => {
    if (!group.title) return false;
    if (group.items.some((item) => item.label === currentView.value)) return true;
    if (['Solicitudes', 'Remuneraciones'].includes(currentView.value)) {
      return group.items.some((item) => item.label === 'RRHH');
    }
    if (currentView.value === 'Historial de tareas') {
      return group.items.some((item) => item.label === 'Tareas activas');
    }
    return false;
  });
  return activeGroup?.title || '';
}
function syncExpandedNavToActiveGroup() {
  // En modo rail el flyout solo se abre con click; no se queda pegado.
  if (sidebarIsCompact.value) return;
  const title = activeNavigationGroupTitle();
  if (title) expandedNav.value = title;
}
function closeCompactNavFlyout() {
  if (!sidebarIsCompact.value) return;
  if (!expandedNav.value) return;
  expandedNav.value = '';
  clearCompactNavFlyoutStyles();
}
const userRole = computed(() => {
  if (isPlatformConsole.value) {
    const labels = (authUser.value?.platformRoles || [])
      .map(role => platformRoleLabels[role] || null)
      .filter(Boolean);
    if (labels.length) return [...new Set(labels)].join(' · ');
    return 'Acceso a plataforma';
  }
  return roleLabels[authUser.value?.role] || authUser.value?.role || 'Usuario';
});
const visibleNavigation = computed(() => navigation.filter(item => {
  const role = authUser.value?.role, permissions = authUser.value?.permissions || {};
  if (isPlatformConsole.value) {
    const platformLabels = ['Plataforma', 'Colegios', 'Buscar gente', 'Cuentas', 'Sesiones', 'Inbox de contacto', 'Correo SMTP', 'Plataforma pagos'];
    if (authUser.value?.platformPermissions?.includes('platform.infrastructure.write')) {
      platformLabels.push('Agregar colegio', 'Colegios demo');
    }
    return platformLabels.includes(item.label);
  }
  if (financialRoles.includes(role)) return ['Finanzas', 'RRHH', 'Documentos'].includes(item.label);
  if (['student', 'guardian'].includes(role)) return ['Resumen', 'Calificaciones', 'Estudiantes', 'Cursos', 'Horario', 'Asistencia'].includes(item.label);
  if (item.label === 'Tareas activas') return role === 'teacher';
  if (item.label === 'Asistencia') return !financialRoles.includes(role);
  if (item.label === 'Administración' || item.label === 'Historial' || item.label === 'Matrículas' || item.label === 'Postulaciones' || item.label === 'Apoderados') return !!permissions.manageUsers;
  if (item.label === 'Historial de pagos') return !!permissions.manageUsers && !isPublicSchool.value;
  // Dentro del colegio: solo menú escolar. Plataforma se vuelve con el banner.
  if (['Plataforma', 'Colegios', 'Agregar colegio', 'Colegios demo', 'Buscar gente', 'Cuentas', 'Sesiones', 'Inbox de contacto', 'Correo SMTP', 'Plataforma pagos'].includes(item.label)) {
    return false;
  }
  if (item.label === 'MINEDUC / SIGE') return Boolean(permissions['sige.view']);
  if (item.label === 'Configurar colegio' || item.label === 'Integraciones') return !!permissions.manageSchool;
  if (item.label === 'Mensualidades') return !!permissions.manageSchool && !isPublicSchool.value;
  if (item.label === 'Reportes') return !!permissions.viewReports;
  if (item.label === 'Finanzas') return canManageFinance.value || role === 'monitor';
  if (item.label === 'RRHH') return canManageHr.value || role === 'monitor';
  // Remuneraciones / Solicitudes: nunca sueltos si ya hay menú RRHH (evita el duplicado).
  if (item.label === 'Remuneraciones') return false;
  if (item.label === 'Solicitudes') {
    const hasHrMenu = canManageHr.value || role === 'monitor' || financialRoles.includes(role);
    if (hasHrMenu) return false;
    return canAccessLeave.value;
  }
  return true;
}));
const navigationGroups = computed(() => {
  const role = authUser.value?.role;
  const items = visibleNavigation.value.map((item) => {
    if (['student', 'guardian'].includes(role) && item.label === 'Estudiantes') {
      return { ...item, group: 'Académico' };
    }
    return item;
  });
  const order = isPlatformConsole.value
    ? ['Inicio', 'Colegios', 'Personas', 'Contacto', 'Cobros', 'Herramientas', 'Técnico']
    : [...new Set(items.map(item => item.group))];
  const titles = order.filter(title => items.some(item => item.group === title));
  return titles.map(title => {
    const groupItems = items.filter(item => item.group === title).map((item) => ({
      ...item,
      title: navItemTitle(item),
    }));
    return {
      title,
      items: groupItems,
      icon: groupItems[0]?.icon,
      id: `nav-group-${String(title || 'main').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      // Single-item groups open directly.
      direct: isPlatformConsole.value && ['Inicio', 'Herramientas', 'Cobros', 'Contacto'].includes(title) && groupItems.length === 1,
    };
  });
});
function toggleNavigationGroup(title) {
  if (isPlatformConsole.value && title === 'Inicio') {
    navigate('Plataforma');
    return;
  }
  if (isPlatformConsole.value && title === 'Herramientas') {
    navigate('Colegios demo');
    return;
  }
  if (isPlatformConsole.value && title === 'Cobros') {
    navigate('Plataforma pagos');
    return;
  }
  if (isPlatformConsole.value && title === 'Contacto') {
    navigate('Inbox de contacto');
    return;
  }
  if (!sidebarNavCollapsible.value) return;
  expandedNav.value = expandedNav.value === title ? '' : title;
}
function clearCompactNavFlyoutStyles() {
  document.querySelectorAll('.sidebar .nav-submenu.is-viewport-anchored').forEach((el) => {
    el.classList.remove('is-viewport-anchored');
    el.style.top = '';
    el.style.left = '';
    el.style.maxHeight = '';
  });
}
function positionCompactNavFlyouts() {
  clearCompactNavFlyoutStyles();
  if (!sidebarIsCompact.value) return;
  const pad = 12;
  document.querySelectorAll('.sidebar.is-compact .nav-group-toggle[aria-expanded="true"]').forEach((toggle) => {
    const submenuId = toggle.getAttribute('aria-controls');
    const submenu = submenuId ? document.getElementById(submenuId) : null;
    if (!submenu || submenu.hidden || getComputedStyle(submenu).display === 'none') return;
    const rect = toggle.getBoundingClientRect();
    const maxHeight = Math.max(160, window.innerHeight - pad * 2);
    submenu.classList.add('is-viewport-anchored');
    submenu.style.maxHeight = `${maxHeight}px`;
    // Measure after max-height so scrollHeight accounts for clamp.
    const menuHeight = Math.min(submenu.scrollHeight, maxHeight);
    let top = rect.top;
    if (top + menuHeight > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - pad - menuHeight);
    }
    if (top < pad) top = pad;
    submenu.style.top = `${Math.round(top)}px`;
    submenu.style.left = `${Math.round(rect.right + 8)}px`;
  });
}
watch([currentView, navigationGroups, sidebarIsCompact], () => {
  syncExpandedNavToActiveGroup();
}, { immediate: true });
watch(sidebarIsCompact, (compact) => {
  if (compact) {
    expandedNav.value = '';
    clearCompactNavFlyoutStyles();
    return;
  }
  syncExpandedNavToActiveGroup();
});
watch([expandedNav, sidebarIsCompact, hrSubmenuOpen, currentView], async () => {
  await nextTick();
  positionCompactNavFlyouts();
});
async function openStudentDirectory() {
  if (authUser.value?.role === 'student') {
    try {
      if (!students.value.length) {
        students.value = await request('/students');
      }
      const me = students.value[0];
      if (me?.id) {
        await openStudentFicha(me.id);
        return;
      }
    } catch (err) {
      error.value = err.message || 'No se pudo abrir tu ficha.';
      return;
    }
  }
  navigate('Estudiantes');
}

function selectNavigation(label) {
  if (label === 'RRHH') {
    closeCompactNavFlyout();
    return openEmployeeList('active');
  }
  if (label === 'Configurar colegio') {
    closeCompactNavFlyout();
    return openSchoolSettingsPage();
  }
  if (label === 'Integraciones') {
    closeCompactNavFlyout();
    return openIntegrationsPage();
  }
  if (label === 'Estudiantes') {
    closeCompactNavFlyout();
    return openStudentDirectory();
  }
  closeCompactNavFlyout();
  navigate(label);
}
const attentionKey = ref('');
const attentionItems = computed(() => dashboard.value.attention?.items || []);
const attentionDetail = computed(() => attentionItems.value.find(item => item.key === attentionKey.value) || null);
const attentionSortBy = ref('');
const attentionSortDir = ref('ASC');
const attentionSearch = ref('');
const attentionVisuals = {
  'academic-risk': { icon: AlertTriangle, hint: 'Notas bajo 4,0' },
  'attendance-today': { icon: ClipboardCheck, hint: 'Registros de hoy' },
  'unassigned': { icon: UserRoundX, hint: 'Sin docente' },
  overdue: { icon: CreditCard, hint: 'Documentos vencidos' },
  'my-students': { icon: Users, hint: 'Vinculados a tu cuenta' },
  'recent-grades': { icon: ClipboardList, hint: 'Últimas evaluaciones' },
  'family-attendance': { icon: CalendarDays, hint: 'Últimos 30 días' },
  'low-grades': { icon: AlertTriangle, hint: 'Rendimiento a seguir' },
};
function attentionVisual(key) {
  return attentionVisuals[key] || { icon: Bell, hint: 'Revisar detalle' };
}
function familyAttentionEmpty(key) {
  const map = {
    'my-students': {
      title: 'Sin estudiantes vinculados',
      body: 'Cuando el colegio te asocie estudiantes, aparecerán aquí con su curso y promedio.',
    },
    'recent-grades': {
      title: 'Todavía no hay notas',
      body: 'Las calificaciones recientes de tus estudiantes se mostrarán en este resumen.',
    },
    'family-attendance': {
      title: 'Sin ausencias ni atrasos',
      body: 'En los últimos 30 días no hay inasistencias registradas para tus estudiantes.',
    },
    'low-grades': {
      title: 'Sin notas bajo 4,0',
      body: 'Ninguna de las notas visibles de tus estudiantes está bajo 4,0.',
    },
    'attendance-today': {
      title: 'Sin registros en esta selección',
      body: 'Todavía no hay asistencia registrada hoy.',
    },
  };
  return map[key] || {
    title: 'Sin registros en esta selección',
    body: 'No hay pendientes que coincidan con esta definición.',
  };
}
function selectAttention(key) {
  if (!key) return;
  attentionKey.value = key;
  attentionSortBy.value = '';
  attentionSortDir.value = 'ASC';
  attentionSearch.value = '';
  currentView.value = 'Atención';
  sidebarOpen.value = false;
  window.history.pushState({ view: 'Atención', attention: key }, '', `/atencion/${encodeURIComponent(key)}`);
}
function backToResumen() {
  attentionKey.value = '';
  navigate('Resumen');
}
function openAttentionStudent(row) {
  const studentId = Number(row?.studentId || row?.id);
  if (!Number.isSafeInteger(studentId) || studentId < 1) return;
  if (attentionDetail.value?.key === 'academic-risk' && authUser.value?.permissions?.manageGrades) {
    return openGradePage(studentId);
  }
  return openStudentProfile(studentId);
}
function compareTableValues(a, b, key) {
  const av = a?.[key];
  const bv = b?.[key];
  if (['amount', 'score', 'gradeCount', 'average', 'billed', 'paid', 'balance', 'count', 'students', 'accounts'].includes(key)
    || typeof av === 'number' || typeof bv === 'number') {
    return (Number(av) || 0) - (Number(bv) || 0);
  }
  if (key === 'date' || /(?:At|On)$/.test(String(key))) {
    return new Date(av || 0).getTime() - new Date(bv || 0).getTime();
  }
  return String(av ?? '').localeCompare(String(bv ?? ''), 'es', { sensitivity: 'base', numeric: true });
}
const sortedAttentionRows = computed(() => {
  const query = normalizeSearch(attentionSearch.value);
  let rows = [...(attentionDetail.value?.rows || [])];
  if (query) {
    rows = rows.filter((row) => {
      const haystack = Object.values(row || {})
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value ?? ''))
        .join(' ');
      return normalizeSearch(haystack).includes(query);
    });
  }
  const key = attentionSortBy.value;
  if (!key) return rows;
  const dir = attentionSortDir.value === 'DESC' ? -1 : 1;
  return rows.sort((a, b) => compareTableValues(a, b, key) * dir);
});
const {
  page: attentionPage,
  pageCount: attentionPageCount,
  paged: pagedAttentionRows,
  rangeLabel: attentionRangeLabel,
  show: showAttentionPagination,
  goPrev: attentionPrevPage,
  goNext: attentionNextPage,
  reset: resetAttentionPage,
} = useClientPagination(sortedAttentionRows, {
  pageSize: 15,
  resetOn: [attentionSortBy, attentionSortDir, attentionSearch],
});
watch(() => attentionDetail.value?.key, () => {
  attentionSearch.value = '';
  resetAttentionPage();
});
function onAttentionSort({ key, dir }) {
  attentionSortBy.value = key;
  attentionSortDir.value = dir;
}
const confirmMessage = ref('');
const confirmCheckboxLabel = ref('');
const confirmCheckboxChecked = ref(false);
let confirmResolve;
function askConfirmation(message, options = {}) {
  confirmMessage.value = message;
  confirmCheckboxLabel.value = options.checkboxLabel || '';
  confirmCheckboxChecked.value = options.checkboxDefault === true;
  return new Promise((resolve) => { confirmResolve = resolve; });
}
function answerConfirmation(value) {
  const result = confirmCheckboxLabel.value
    ? { confirmed: Boolean(value), checked: Boolean(confirmCheckboxChecked.value) }
    : Boolean(value);
  confirmMessage.value = '';
  confirmCheckboxLabel.value = '';
  confirmCheckboxChecked.value = false;
  confirmResolve?.(result);
  confirmResolve = null;
}
function confirmationOk(result) {
  return typeof result === 'object' && result !== null ? Boolean(result.confirmed) : Boolean(result);
}
function confirmationChecked(result) {
  return typeof result === 'object' && result !== null ? Boolean(result.checked) : false;
}
const canOpenCommunications = computed(() => visibleNavigation.value.some((item) => item.label === 'Comunicaciones'));
const activeModuleKey = computed(() => moduleKeys[currentView.value] || '');
const visibleModuleSections = computed(() => {
  const sections = moduleData.value?.sections || [];
  if (currentView.value === 'Asistencia') return sections.filter(section => section.title === 'Asistencia');
  if (currentView.value === 'Libro de clases') {
    return sections.filter(section => !['Asistencia', 'Clases realizadas'].includes(section.title)
      && (!activeModuleSection.value || section.title === activeModuleSection.value));
  }
  if (isAccountabilityView.value) return [];
  if (currentView.value === 'Comunicaciones') return [];
  return activeModuleSection.value ? sections.filter((section) => section.title === activeModuleSection.value) : sections;
});
const moduleSubnavSections = computed(() => {
  const sections = moduleData.value?.sections || [];
  if (currentView.value === 'Libro de clases') {
    return sections.filter((section) => !['Asistencia', 'Clases realizadas'].includes(section.title));
  }
  return sections;
});
const communicationRows = computed(() => (moduleData.value?.sections?.find((section) => section.title === 'Comunicados')?.rows || [])
  .filter(row => ['email', 'notification', 'whatsapp'].includes(row.channel))
  .filter((row) => !inboxChannelFilter.value || inboxChannelFilter.value === 'all' || row.channel === inboxChannelFilter.value)
  .filter((row) => {
    const query = normalizeSearch(moduleSearch.value);
    return !query || normalizeSearch(`${formatModuleCell('channel', row.channel)} ${formatModuleCell('audience', row.audience)} ${row.subject} ${row.body}`).includes(query);
  }));
const communicationPage = ref(1);
const communicationPageSize = 12;
const inboxChannelFilter = ref('all');
const communicationPageCount = computed(() => Math.max(1, Math.ceil(communicationRows.value.length / communicationPageSize)));
const pagedCommunicationRows = computed(() => communicationRows.value.slice((communicationPage.value - 1) * communicationPageSize, communicationPage.value * communicationPageSize));
const selectedInboxMessageId = ref(null);
const selectedInboxMessage = computed(() => communicationRows.value.find((row) => Number(row.id) === Number(selectedInboxMessageId.value)) || communicationRows.value[0] || null);
const inboxChannelCounts = computed(() => {
  const all = (moduleData.value?.sections?.find((section) => section.title === 'Comunicados')?.rows || [])
    .filter(row => ['email', 'notification', 'whatsapp'].includes(row.channel));
  return {
    all: all.length,
    email: all.filter((row) => row.channel === 'email').length,
    whatsapp: all.filter((row) => row.channel === 'whatsapp').length,
    notification: all.filter((row) => row.channel === 'notification').length,
  };
});
function communicationChannelLabel(channel) {
  if (channel === 'whatsapp') return 'WhatsApp';
  if (channel === 'email') return 'Correo';
  if (channel === 'notification') return 'Portal';
  return formatModuleCell('channel', channel);
}
function communicationRecipientLabel(row) {
  const raw = row?.recipientCount ?? row?.recipient_count;
  if (raw == null || raw === '' || raw === '—') return '';
  const count = Number(raw);
  if (!Number.isFinite(count) || count < 0) return '';
  return count === 1 ? '1 persona' : `${count} personas`;
}
function setInboxChannelFilter(value) {
  inboxChannelFilter.value = value;
  communicationPage.value = 1;
}
watch(inboxChannelFilter, () => { communicationPage.value = 1; });
watch(currentView, (view) => {
  if (view !== 'Comunicaciones') inboxChannelFilter.value = 'all';
});
const isStudentProfileView = computed(() => currentView.value === 'Perfil del estudiante');
const filteredStudentGrades = computed(() => {
  const profileGrades = studentProfile.value?.grades || [];
  return selectedStudentYear.value === 'all'
    ? profileGrades
    : profileGrades.filter((grade) => String(grade.academic_year) === selectedStudentYear.value);
});
const studentGradeGroups = computed(() => studentProfile.value?.gradeGroups?.[selectedStudentYear.value] || []);
const studentHistoryYears = computed(() => studentProfile.value?.years || []);
const studentHistoryAnnualResults = computed(() => {
  const year = String(selectedStudentYear.value);
  return (studentProfile.value?.annualResults || []).filter((row) => String(row.academicYear) === year);
});
const studentHistoryEnrollments = computed(() => {
  const year = String(selectedStudentYear.value);
  return (studentProfile.value?.enrollments || []).filter((row) => String(row.academicYear || '') === year);
});
const studentHistoryClasses = computed(() => {
  const groups = new Map();
  for (const row of studentHistoryEnrollments.value) {
    const key = `${row.name}|${row.section}`;
    const group = groups.get(key) || {
      key,
      name: row.name,
      section: row.section,
      teacher: row.headTeacher || row.teacher || null,
      subjects: [],
      statuses: new Set(),
    };
    group.subjects.push(row);
    group.statuses.add(row.status);
    if (!group.teacher && (row.headTeacher || row.teacher)) group.teacher = row.headTeacher || row.teacher;
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    subjects: group.subjects.sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || ''), 'es')),
    statusLabel: group.statuses.has('withdrawn') && group.statuses.size === 1
      ? 'Retirado'
      : group.statuses.has('exempt') && !group.statuses.has('active')
        ? 'Eximido'
        : 'Matriculado',
  }));
});
const studentHistoryAttendance = computed(() => {
  const year = String(selectedStudentYear.value);
  return (studentProfile.value?.attendanceByYear || []).find((row) => String(row.academicYear) === year) || null;
});
const studentHistoryObservations = computed(() => {
  const year = String(selectedStudentYear.value);
  return (studentProfile.value?.observations || []).filter((row) => String(row.academicYear || '') === year);
});
const studentHistoryGuardians = computed(() => studentProfile.value?.guardians || []);
const observationKindLabel = {
  positive: 'Positiva',
  negative: 'Negativa',
  general: 'General',
};
const historyEnrollmentStatusLabel = {
  active: 'Activa',
  exempt: 'Eximida',
  withdrawn: 'Retirada',
};
const historyFinalStatusLabel = {
  promoted: 'Promovido',
  not_promoted: 'No promovido',
  withdrawn: 'Retirado',
};

const studentProfileMetrics = computed(() => {
  if (!studentProfile.value) return { average: null, approval_rate: 0, grade_count: 0 };
  if (selectedStudentYear.value === 'all') return studentProfile.value.student;
  return (studentProfile.value.years || []).find((year) => String(year.year) === selectedStudentYear.value)
    || { average: null, approval_rate: 0, grade_count: 0 };
});
const studentRecommendation = computed(() => {
  const average = Number(studentProfileMetrics.value.average);
  if (!Number.isFinite(average)) return 'Aún no hay suficientes calificaciones para generar una recomendación.';
  if (average < 4) return 'Conviene acordar un plan de apoyo y revisar las evaluaciones con menor resultado.';
  if (average < 5.5) return 'Mantén el seguimiento y refuerza los contenidos que todavía presentan dificultad.';
  return 'El desempeño es sólido. Puedes proponer actividades de profundización para mantener el avance.';
});
const gradeCourses = computed(() => {
  const pool = authUser.value?.role === 'teacher' ? teacherEditableCourses.value : teacherScopedCourses.value;
  if (!gradeStudentLocked.value || !studentProfile.value) return pool;
  const enrolled = (studentProfile.value.enrollments || []).filter((row) => row.status !== 'withdrawn');
  const classKeys = new Set(enrolled.map((row) => `${row.name}|${row.section}`));
  if (classKeys.size) {
    const siblings = pool.filter((course) => classKeys.has(`${course.name}|${course.section}`));
    if (siblings.length) {
      return [...siblings].sort((a, b) => String(a.subject).localeCompare(String(b.subject), 'es') || String(a.name).localeCompare(String(b.name), 'es'));
    }
  }
  const ids = new Set((studentProfile.value.courseIds || []).map(Number));
  return pool.filter((course) => ids.has(Number(course.id)));
});
const selectedGradeCourse = computed(() => gradeCourses.value.find((course) => Number(course.id) === Number(form.courseId)) || null);
const gradeCoursesByClass = computed(() => {
  const groups = new Map();
  for (const course of gradeCourses.value) {
    const key = `${course.name}|${course.section}`;
    if (!groups.has(key)) groups.set(key, { key, name: course.name, section: course.section, courses: [] });
    groups.get(key).courses.push(course);
  }
  return [...groups.values()];
});
const moduleKpis = computed(() => isAccountabilityView.value ? [] : (moduleData.value?.summary || []).map(item => ({ ...item, value: item.format === 'money' ? formatCurrency(item.value) : item.value })));

const pageTitle = computed(() => {
  if (isStudentProfileView.value && studentProfile.value) {
    return `${studentProfile.value.student.first_name} ${studentProfile.value.student.last_name}`;
  }
  if (currentView.value === 'Administración' && staffFormOpen.value) return staffForm.id ? 'Editar cuenta' : 'Nueva cuenta';
  if (currentView.value === 'Nuevo empleado') return 'Nuevo empleado';
  if (currentView.value === 'Nuevo estudiante') return 'Nuevo estudiante';
  if (currentView.value === 'Nuevo apoderado') return 'Nuevo apoderado';
  if (currentView.value === 'Detalle apoderado') return 'Apoderado';
  if (currentView.value === 'Nueva solicitud') return 'Nueva solicitud';
  if (currentView.value === 'Historial de tareas') return 'Historial de tareas';
  if (currentView.value === 'Tareas activas') return 'Tareas activas';
  if (currentView.value === 'Subir documento') return 'Subir archivo';
  if (currentView.value === 'Detalle del curso' && courseDetail.value) return `${courseDetail.value.name} · ${courseDetail.value.section}`;
  if (currentView.value === 'Aula del curso' && courseDetail.value) {
    const sectionLabel = ({
      tareas: 'Tareas',
      foros: 'Foros',
      comunicados: 'Comunicados',
      archivos: 'Archivos',
      enlaces: 'Enlaces',
    })[classroomSection.value] || 'Aula';
    return `${sectionLabel} · ${courseDetail.value.name} · ${courseDetail.value.section}`;
  }
  if (currentView.value === 'Asignatura del curso' && courseDetail.value) return `${courseDetail.value.subject} · ${courseDetail.value.name} ${courseDetail.value.section}`;
  if (currentView.value === 'Configurar aula' && courseDetail.value) return `Configurar aula · ${courseDetail.value.name} · ${courseDetail.value.section}`;
  if (currentView.value === 'Agregar estudiantes' && courseDetail.value) return `Matricular · ${courseDetail.value.name} · ${courseDetail.value.section}`;
  if (currentView.value === 'Detalle comunicación' && communicationDetail.value) {
    return communicationDetail.value.subject || 'Detalle comunicación';
  }
  if (currentView.value === 'Detalle anotación') {
    if (observationDetail.value?.studentName) return `Anotación · ${observationDetail.value.studentName}`;
    return 'Detalle anotación';
  }
  if (currentView.value === 'Atención') return attentionDetail.value?.label || 'Atención';
  if (currentView.value === 'Planificación') {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/planificacion/nueva') return 'Nueva unidad';
    if (/^\/planificacion\/unidades\/\d+$/.test(path)) return 'Editar unidad';
  }
  if (currentView.value === 'Detalle del cargo') {
    return selectedJobTitle.value?.name
      ? `Cargo · ${selectedJobTitle.value.name}`
      : 'Detalle del cargo';
  }
  if (currentView.value === 'Mi cuenta') {
    return 'Mi cuenta';
  }
  if (currentView.value === 'RRHH') {
    if (selectedEmployee.value?.fullName) return selectedEmployee.value.fullName;
    return employeeStatus.value === 'inactive' ? 'Historial de empleados' : 'Empleados activos';
  }
  return currentView.value === 'Resumen'
    ? `Buenos días, ${userFirstName.value}`
    : navItemTitle(navigation.find(item => item.label === currentView.value) || { label: currentView.value });
});
const topSearchResults = computed(() => searchResults.value.slice(0, 6));
const availableEnrollmentStudents = computed(() => {
  const enrolledIds = new Set(enrolledEnrollmentIds.value.map(Number));
  const query = normalizeSearch(enrollmentSearch.value);
  if (!query) return [];
  return enrollmentCandidates.value
    .filter((student) => normalizeSearch(`${student.first_name} ${student.last_name} ${student.email || ''}`).includes(query))
    .map((student) => ({ ...student, isEnrolled: enrolledIds.has(Number(student.id)) }));
});
const hasUnreadNotifications = computed(() => notifications.value.some((item) => Number(item.id) > lastReadNotificationId.value));
function clampPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}
const quickActions = computed(() => [
  {
    label: 'Asistencias',
    detail: ['student', 'guardian'].includes(authUser.value?.role) ? 'Ver historial' : 'Pasar lista del día',
    icon: CalendarDays,
    action: () => navigate('Asistencia'),
    visible: !financialRoles.includes(authUser.value?.role),
  },
  {
    label: authUser.value?.role === 'teacher' ? 'Mis asignaturas' : 'Cursos',
    detail: authUser.value?.role === 'teacher'
      ? (isClassHeadTeacher.value ? 'Cursos a tu cargo y ramos' : 'Tus ramos asignados')
      : authUser.value?.role === 'guardian'
        ? 'Cursos de tus estudiantes'
        : `${courseGroupRows.value.length} cursos`,
    icon: BookOpen,
    action: () => navigate('Cursos'),
    visible: !financialRoles.includes(authUser.value?.role),
  },
  {
    label: authUser.value?.role === 'guardian' ? 'Mis estudiantes' : authUser.value?.role === 'student' ? 'Mi ficha' : 'Estudiantes',
    detail: authUser.value?.role === 'guardian' ? 'Fichas de tus hijos/as' : authUser.value?.role === 'student' ? 'Tu ficha académica' : 'Abrir lista',
    icon: Users,
    action: () => openStudentDirectory(),
    visible: !financialRoles.includes(authUser.value?.role),
  },
  {
    label: 'Calificaciones',
    detail: authUser.value?.role === 'teacher'
      ? 'Notas de tus cursos'
      : authUser.value?.role === 'guardian'
        ? 'Notas de tus estudiantes'
        : authUser.value?.role === 'student'
          ? 'Tus notas'
          : 'Registro de notas',
    icon: ClipboardList,
    action: () => navigate('Calificaciones'),
    visible: authUser.value?.role === 'teacher'
      || authUser.value?.role === 'guardian'
      || authUser.value?.role === 'student'
      || Boolean(authUser.value?.permissions?.manageGrades),
  },
  {
    label: 'Horario',
    detail: authUser.value?.role === 'guardian' ? 'Horario de tus estudiantes' : 'Ver horario',
    icon: CalendarDays,
    action: () => navigate('Horario'),
    visible: ['guardian', 'student'].includes(authUser.value?.role),
  },
  { label: 'Comunicaciones', detail: `${notifications.value.length} recientes`, icon: Inbox, action: () => navigate('Comunicaciones'), visible: canOpenCommunications.value },
  { label: 'Finanzas', detail: 'Rendición y cobros', icon: TrendingUp, action: () => navigate('Finanzas'), visible: canManageFinance.value },
  { label: 'Equipo', detail: 'Permisos y roles', icon: ShieldCheck, action: () => navigate('Administración'), visible: Boolean(authUser.value?.permissions?.manageUsers) },
].filter((item) => item.visible));
function selectInboxMessage(row) {
  selectedInboxMessageId.value = row.id;
}

async function openCommunicationDetail(id, push = true) {
  const communicationId = Number(id);
  if (!Number.isInteger(communicationId) || communicationId < 1) return;
  communicationDetailId.value = communicationId;
  communicationDetailLoading.value = true;
  communicationDetailError.value = '';
  communicationDetail.value = null;
  communicationDetailRecipients.value = [];
  communicationDetailTotal.value = 0;
  currentView.value = 'Detalle comunicación';
  if (push) {
    window.history.pushState(
      { view: 'Detalle comunicación', communicationId },
      '',
      `/comunicaciones/${communicationId}`
    );
  }
  sidebarOpen.value = false;
  try {
    const result = await request(`/communications/${communicationId}`);
    communicationDetail.value = result.communication || null;
    communicationDetailRecipients.value = result.recipients || [];
    resetCommunicationDetailRecipientsPage();
    communicationDetailTotal.value = Number(result.total || communicationDetailRecipients.value.length);
  } catch (err) {
    communicationDetailError.value = err.message || 'No se pudo cargar el comunicado.';
  } finally {
    communicationDetailLoading.value = false;
  }
}

function backFromCommunicationDetail() {
  if (canOpenCommunications.value) navigate('Comunicaciones');
  else navigate('Resumen');
}

function publicAdmissionPath(pathname = window.location.pathname) {
  const match = String(pathname || '').match(/^\/postular\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function clearAuth() {
  if (restoreAdminSessionIfNeeded()) return;
  session.clear();
  authUser.value = null;
  const admissionSchoolId = publicAdmissionPath();
  if (admissionSchoolId) {
    publicAdmissionSchoolId.value = admissionSchoolId;
    return;
  }
  publicAdmissionSchoolId.value = null;
  lastReadNotificationId.value = 0;
  if (window.location.pathname !== '/login') window.history.replaceState({}, '', '/login');
}

async function loadPlatformDemoSettings() {
  try {
    const response = await fetch(`${import.meta.env?.VITE_API_URL || '/api'}/settings`, { credentials: 'include' });
    if (!response.ok) return;
    const payload = await response.json();
    const data = payload?.data || payload || {};
    platformDemoMode.value = Boolean(data.demoMode || data.demo_mode);
    if (data.message) platformDemoMessage.value = data.message;
    demoGuide.value = data.demoGuide || null;
  } catch {
    /* settings opcionales en login */
  }
}

async function openDemoGuide() {
  if (!demoGuide.value?.accounts?.length) {
    await loadPlatformDemoSettings();
  }
  if (authUser.value) {
    demoGuideOpenFromSession.value = true;
    return;
  }
  loginError.value = '';
  loginPanel.value = 'demo-guide';
}

function closeDemoGuide() {
  demoGuideOpenFromSession.value = false;
  if (!authUser.value) loginPanel.value = 'login';
}

async function useDemoAccount(account) {
  const username = account.username || '';
  const password = account.password || 'admin';
  demoGuideOpenFromSession.value = false;
  if (authUser.value) {
    await signOut();
  }
  loginForm.username = username;
  loginForm.password = password;
  loginForm.tenantId = null;
  loginError.value = '';
  loginPanel.value = 'login';
}

const demoGuideGroups = computed(() => {
  const accounts = demoGuide.value?.accounts || [];
  const groups = [];
  const index = new Map();
  for (const account of accounts) {
    const name = account.group || 'Cuentas demo';
    if (!index.has(name)) {
      index.set(name, groups.length);
      groups.push({ name, accounts: [] });
    }
    groups[index.get(name)].accounts.push(account);
  }
  return groups;
});

async function initializeApp() {
  const admissionSchoolId = publicAdmissionPath();
  if (admissionSchoolId) {
    publicAdmissionSchoolId.value = admissionSchoolId;
    authLoading.value = false;
    return;
  }
  const token = session.getToken();
  if (!token) {
    clearAuth();
    await loadPlatformDemoSettings();
    authLoading.value = false;
    return;
  }
  try {
    const data = await auth.me();
    authUser.value = data.user;
    platformDemoMode.value = Boolean(data.user?.demoMode || data.user?.accessMode === 'demo');
    if (platformDemoMode.value) await loadPlatformDemoSettings();
    sessionFlagRemove('impersonation_handoff');
    if (!data.user?.impersonation) storageRemove('admin_token');
    if (isPlatformConsole.value) loading.value = false;
    else await loadData();
    await loadNotifications();
    await syncRouteFromLocation();
  } catch {
    clearAuth();
    await loadPlatformDemoSettings();
  }
  finally { authLoading.value = false; }
}

async function signIn() {
  loginLoading.value = true;
  loginError.value = '';
  try {
    const payload = {
      username: loginForm.username,
      password: loginForm.password,
      ...(loginForm.tenantId ? { tenantId: loginForm.tenantId } : {}),
    };
    const data = await auth.login(payload);
    if (data?.user?.demoMode || data?.user?.accessMode === 'demo') {
      platformDemoMode.value = true;
    }
    if (data?.needsSchoolChoice) {
      loginSchoolChoices.value = (data.memberships || []).filter((row) => row.available !== false);
      if (!loginSchoolChoices.value.length) {
        loginError.value = 'No hay colegios disponibles para esta cuenta en este momento.';
        return;
      }
      loginSchoolMessage.value = data.message || 'Tu cuenta está asociada a más de un colegio. Elige a cuál quieres entrar.';
      loginPanel.value = 'school-choice';
      return;
    }
    storageRemove('admin_token');
    sessionFlagRemove('impersonation_handoff');
    session.setToken(data.token);
    authUser.value = data.user;
    loginForm.tenantId = null;
    loginSchoolChoices.value = [];
    loginPanel.value = 'login';
    if (isPlatformConsole.value) {
      loading.value = false;
      window.history.replaceState({ view: 'Plataforma' }, '', '/plataforma');
    } else {
      await loadData();
    }
    await loadNotifications();
    await syncRouteFromLocation();
  } catch (err) { loginError.value = err.message; }
  finally { loginLoading.value = false; }
}

async function chooseLoginSchool(schoolId) {
  loginForm.tenantId = Number(schoolId);
  await signIn();
}

function backToLoginCredentials() {
  loginPanel.value = 'login';
  loginForm.tenantId = null;
  loginSchoolChoices.value = [];
  loginSchoolMessage.value = '';
  loginError.value = '';
}

function openForgotPassword() {
  loginPanel.value = 'forgot';
  forgotError.value = '';
  forgotMessage.value = '';
  forgotEmail.value = String(loginForm.username || '').includes('@') ? loginForm.username : '';
}

function backToLogin() {
  loginPanel.value = 'login';
  forgotLoading.value = false;
  forgotError.value = '';
  forgotMessage.value = '';
}

async function submitForgotPassword() {
  const email = String(forgotEmail.value || '').trim().toLowerCase();
  forgotError.value = '';
  forgotMessage.value = '';
  if (!email || !email.includes('@')) {
    forgotError.value = 'Ingresá el correo de acceso de tu cuenta.';
    return;
  }
  forgotLoading.value = true;
  try {
    const result = await auth.forgotPassword({ email });
    forgotMessage.value = result?.message || 'Si la cuenta existe, te enviamos un correo con una contraseña temporal.';
    loginPanel.value = 'forgot-sent';
    loginForm.username = email;
    loginForm.password = '';
  } catch (err) {
    forgotError.value = err.message;
  } finally {
    forgotLoading.value = false;
  }
}

async function signOut() {
  closeHeaderMenus();
  try { await auth.logout(); } catch { /* clear locally */ }
  clearAuth();
  currentView.value = 'Resumen';
}
async function switchSchool(event) {
  const schoolId = Number(event.target.value);
  if (!schoolId || schoolId === authUser.value.schoolId) return;
  try {
    const data = await request('/auth/switch-tenant', { method: 'POST', body: JSON.stringify({ schoolId }) });
    authUser.value = data.user;
    window.location.href = '/';
  } catch (err) { showToast(err.message, 'error'); }
}

async function enterPlatformSchool(schoolId) {
  try {
    const data = await request(`/platform/tenants/${schoolId}/enter`, { method: 'POST', body: '{}' });
    authUser.value = data.user;
    window.location.href = '/';
  } catch (err) { showToast(err.message, 'error'); }
}

async function returnToPlatformConsole() {
  try {
    const data = await request('/platform/console', { method: 'POST', body: '{}' });
    authUser.value = data.user;
    window.location.href = '/plataforma';
  } catch (err) { showToast(err.message, 'error'); }
}

let loadDataInflight = null;
let loadDataGeneration = 0;
async function loadData({ soft = false, keepCourses = false } = {}) {
  if (isPlatformConsole.value) {
    loading.value = false;
    return;
  }
  const generation = ++loadDataGeneration;
  if (!soft) {
    loading.value = true;
    error.value = '';
  }
  const run = (async () => {
    if (financialRoles.includes(authUser.value?.role)) {
      try {
        school.value = await request('/school');
        await loadSchoolLogoPreview();
      } catch (err) {
        if (!soft && generation === loadDataGeneration) error.value = err.message;
      } finally {
        if (!soft && generation === loadDataGeneration) loading.value = false;
      }
      return;
    }
    const params = new URLSearchParams();
    if (selectedCourse.value) params.set('courseId', String(selectedCourse.value));
    if (authUser.value?.permissions?.manageUsers && studentStatusFilter.value === 'all') params.set('status', 'all');
    const query = params.toString() ? `?${params}` : '';
    try {
      const [courseData, dashboardData, studentData, gradeData, schoolData, subjectData] = await Promise.all([
        coursesApi.list(), request(`/dashboard${query}`), request(`/students${query}`), request(`/grades${query}`), request('/school'), request('/subjects')
      ]);
      if (generation !== loadDataGeneration) return;
      if (!keepCourses || !courses.value.length) {
        courses.value = courseData;
        courseGroups.value = await coursesApi.list({ grouped: 'true' });
        if (generation !== loadDataGeneration) return;
      }
      dashboard.value = dashboardData;
      students.value = studentData;
      grades.value = gradeData;
      school.value = schoolData;
      subjects.value = subjectData;
      await Promise.all([loadStudentAvatars(studentData), loadSchoolLogoPreview()]);
    } catch (err) {
      if (generation !== loadDataGeneration) return;
      if (!soft) error.value = err.message;
      else throw err;
    } finally {
      if (!soft && generation === loadDataGeneration) loading.value = false;
    }
  })();
  loadDataInflight = run.finally(() => {
    if (generation === loadDataGeneration) loadDataInflight = null;
  });
  return loadDataInflight;
}

/** Light refresh for course pages: avoid reloading dashboard/school/subjects/avatars on every click. */
let courseContextInflight = null;
async function loadCourseContext(courseId, { ensureCourses = true } = {}) {
  const id = Number(courseId);
  const run = async () => {
    const tasks = [];
    const missingCourse = Number.isSafeInteger(id) && id > 0 && !courses.value.some((course) => Number(course.id) === id);
    if (ensureCourses && (!courses.value.length || missingCourse)) {
      tasks.push(
        coursesApi.list().then(async (courseData) => {
          courses.value = courseData;
          courseGroups.value = await coursesApi.list({ grouped: 'true' });
        })
      );
    }
    if (Number.isSafeInteger(id) && id > 0) {
      const query = `?courseId=${id}`;
      tasks.push(
        request(`/students${query}`).then((rows) => { students.value = rows; }),
        request(`/grades${query}`).then((rows) => { grades.value = rows; }),
      );
    }
    if (!school.value?.id) {
      tasks.push(request('/school').then((row) => { school.value = row; }));
    }
    if (!subjects.value.length) {
      tasks.push(request('/subjects').then((rows) => { subjects.value = rows; }));
    }
    if (tasks.length) await Promise.all(tasks);
  };
  if (courseContextInflight) {
    await courseContextInflight.catch(() => {});
  }
  courseContextInflight = run().finally(() => { courseContextInflight = null; });
  return courseContextInflight;
}

async function loadStudentAvatars(rows) {
  const token = session.getToken();
  if (!token || !Array.isArray(rows)) return;
  const nextAvatars = {};
  const withAvatar = rows.filter((student) => student.avatar_key || student.avatarKey).slice(0, 80);
  await Promise.all(withAvatar.map(async (student) => {
    try {
      const response = await download(`/students/${student.id}/avatar`);
      if (response.ok) nextAvatars[student.id] = URL.createObjectURL(await response.blob());
    } catch { /* Initials remain available when no avatar is available. */ }
  }));
  Object.values(studentAvatars.value).forEach((url) => URL.revokeObjectURL(url));
  studentAvatars.value = nextAvatars;
}

/** Fetch missing student photos without wiping ones already shown elsewhere. */
async function ensureStudentAvatars(rows) {
  const token = session.getToken();
  if (!token || !Array.isArray(rows) || !rows.length) return;
  const missing = rows
    .filter((student) => {
      const id = Number(student?.id);
      return id > 0 && (student.avatar_key || student.avatarKey) && !studentAvatars.value[id];
    })
    .slice(0, 80);
  if (!missing.length) return;
  const additions = {};
  await Promise.all(missing.map(async (student) => {
    try {
      const response = await download(`/students/${student.id}/avatar`);
      if (response.ok) additions[student.id] = URL.createObjectURL(await response.blob());
    } catch { /* Keep initials fallback. */ }
  }));
  if (!Object.keys(additions).length) return;
  studentAvatars.value = { ...studentAvatars.value, ...additions };
}

function navigate(label, disabled) {
  if (disabled) return;
  closeHeaderMenus();
  error.value = '';
  const path = viewRoutes[label] || '/';
  const current = `${window.location.pathname}${window.location.search}`;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const keepAccountDetail = label === 'Cuentas' && /^\/plataforma\/cuentas\/\d+$/.test(currentPath);
  const keepTenantDetail = label === 'Colegios' && /^\/plataforma\/colegios\/\d+(?:\/plan)?$/.test(currentPath);
  if (!keepAccountDetail && !keepTenantDetail && current !== path) {
    window.history.pushState({ view: label }, '', path);
  }
  currentView.value = label;
  if (label !== 'Atención') attentionKey.value = '';
  // Remount refreshes the list; skip when we are already on a cuenta detail URL.
  if (label === 'Cuentas' && !keepAccountDetail) platformAccountsKey.value += 1;
  if ((label === 'Colegios' || label === 'Agregar colegio') && !keepTenantDetail) platformTenantsKey.value += 1;
  if (label === 'Apoderados') {
    guardiansFocusId.value = null;
    guardiansKey.value += 1;
  }
  if (['Plataforma', 'Colegios demo', 'Colegios', 'Agregar colegio', 'Buscar gente', 'Cuentas', 'Sesiones', 'Inbox de contacto', 'Correo SMTP', 'Plataforma pagos'].includes(label)) {
    if (isPlatformConsole.value) loading.value = false;
  }
  courseDetailId.value = null;
  if (!['Detalle del curso', 'Aula del curso', 'Configurar aula', 'Asignatura del curso'].includes(label)) selectedCourse.value = '';
  staffFormOpen.value = false;
  studentProfile.value = null;
  activeModuleSection.value = '';
  search.value = '';
  sidebarOpen.value = false;
  if (label === 'Administración') loadStaffUsers();
  if (moduleKeys[label]) loadModule(moduleKeys[label]);
}

function toggleNav(label) {
  expandedNav.value = expandedNav.value === label ? '' : label;
  navigate(label);
}

function prepareNewCoursePage() {
  Object.assign(courseForm, {
    levelId: '1b',
    trackId: '',
    name: '1° Básico',
    section: 'A',
    templateId: 'basica',
    subjects: [],
    customSubjects: [],
    color: '',
    monthlyFee: 0,
  });
  newCourseCustomSubject.value = '';
  newCourseCustomColor.value = '';
  managementModal.value = '';
  expandedNav.value = 'Cursos';
  return Promise.all([
    loadCourseTemplates(),
    subjects.value.length ? Promise.resolve() : request('/subjects').then((rows) => { subjects.value = rows; }).catch(() => {}),
  ]);
}
function openNewEmployeePage() {
  Object.assign(employeeForm, {
    fullName: '',
    position: jobTitles.value[0]?.name || 'Profesor/a',
    contractType: 'Indefinido',
    workModality: 'Full time',
    hiredOn: new Date().toISOString().slice(0, 10),
    netSalary: '',
    monthlySalary: '',
    lockBaseSalary: false,
    afp: employeeRecommendedAfp.value,
    healthSystem: 'Fonasa',
    isaprePlan: 0,
    isapreCode: '',
  });
  employeeSalaryEstimate.value = null;
  employeeSalaryEstimateError.value = '';
  managementError.value = '';
  managementModal.value = '';
  loadJobTitles();
  loadEmployeeHireDefaults().then(() => {
    if (!employeeForm.afp) employeeForm.afp = employeeRecommendedAfp.value;
  });
  currentView.value = 'Nuevo empleado';
  selectedEmployee.value = null;
  window.history.pushState({ view: 'Nuevo empleado' }, '', '/empleados/nuevo');
  sidebarOpen.value = false;
}

function openNewCoursePage() {
  navigate('Nuevo curso');
  prepareNewCoursePage();
}

function openNewStudentPage() {
  Object.assign(studentForm, {
    firstName: '', lastName: '', username: '', email: '', studentPassword: '', generateStudentPassword: true, courseIds: [],
    guardianName: '', guardianEmail: '', guardianPassword: '', relationshipKind: 'Mamá', relationshipOther: ''
  });
  currentView.value = 'Nuevo estudiante';
  window.history.pushState({ view: 'Nuevo estudiante' }, '', '/estudiantes/nuevo');
  sidebarOpen.value = false;
}

const classOptions = computed(() => [...new Map(courses.value.map(c => [c.name + '|' + c.section + '|' + c.academic_year_id, c])).values()]);
const hasActiveEnrollment = computed(() =>
  (studentProfile.value?.enrollments || []).some(entry => entry.status !== 'withdrawn')
);
const isFamilyStudentView = computed(() => ['guardian', 'student'].includes(authUser.value?.role));
function studentIdentifierLabel(student) {
  if (!student?.national_id) return '—';
  const type = String(student.identifier_type || 'rut').toLowerCase();
  return type === 'ipe' ? String(student.national_id) : formatRut(student.national_id);
}
const enrolledClassKeys = computed(() => new Set(
  (studentProfile.value?.enrollments || [])
    .filter((entry) => entry.status !== 'withdrawn')
    .map((entry) => `${entry.name}|${entry.section}`)
));
const unenrolledClassOptions = computed(() =>
  classOptions.value.filter((course) => !enrolledClassKeys.value.has(`${course.name}|${course.section}`))
);
const studentEnrollmentGroups = computed(() => {
  const active = (studentProfile.value?.enrollments || []).filter((entry) => entry.status !== 'withdrawn');
  const groups = new Map();
  for (const entry of active) {
    const key = `${entry.name}|${entry.section}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: entry.name,
        section: entry.section,
        courseId: entry.id,
        modules: [],
      });
    }
    groups.get(key).modules.push(entry);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    activeCount: group.modules.filter((row) => row.status === 'active').length,
    exemptCount: group.modules.filter((row) => row.status === 'exempt').length,
  }));
});
const expandedEnrollmentGroup = ref('');
function toggleEnrollmentGroup(key) {
  expandedEnrollmentGroup.value = expandedEnrollmentGroup.value === key ? '' : key;
}
async function focusStudentEnrollment() {
  if (studentProfileSection.value !== 'ficha' && studentProfile.value?.student?.id) {
    await openStudentFicha(studentProfile.value.student.id);
  }
  await nextTick();
  document.querySelector('[data-student-enrollment]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.querySelector('[data-student-enrollment] select')?.focus();
}
function classLabel(course) {
  return `${course.name} ${course.section}`;
}
const removingStudent = ref(false);
function onRowActionToggle(event) {
  const menu = event.target;
  if (!(menu instanceof HTMLDetailsElement)) return;
  const panel = menu.querySelector('.row-action-panel');
  if (!menu.open) {
    if (panel instanceof HTMLElement) {
      panel.style.removeProperty('position');
      panel.style.removeProperty('top');
      panel.style.removeProperty('right');
      panel.style.removeProperty('left');
      panel.style.removeProperty('bottom');
    }
    return;
  }
  document.querySelectorAll('.row-action-menu[open], .course-subject-teachers-menu[open]').forEach((other) => {
    if (other !== menu) other.open = false;
  });
  if (!(panel instanceof HTMLElement)) return;
  const trigger = menu.querySelector('summary');
  const rect = trigger?.getBoundingClientRect();
  if (!rect) return;
  const spaceBelow = window.innerHeight - rect.bottom;
  panel.style.position = 'fixed';
  panel.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
  panel.style.left = 'auto';
  if (spaceBelow < 160 && rect.top > spaceBelow) {
    panel.style.top = 'auto';
    panel.style.bottom = `${Math.max(8, window.innerHeight - rect.top + 6)}px`;
  } else {
    panel.style.bottom = 'auto';
    panel.style.top = `${rect.bottom + 6}px`;
  }
}

async function removeFromCourse(studentId, courseId = courseDetailId.value) {
  if (removingStudent.value || !(await askConfirmation('¿Retirar al estudiante de este curso? Sus notas se conservarán.'))) return;
  removingStudent.value = true;
  try {
    await request('/courses/' + courseId + '/enrollments/' + studentId, { method: 'DELETE' });
    if (studentProfile.value?.student?.id === Number(studentId) || currentView.value === 'Perfil del estudiante') {
      await loadStudentProfile(studentId, studentProfileSection.value || 'ficha', { soft: true });
      await loadData({ soft: true }).catch(() => {});
    } else {
      await loadData({ soft: true });
    }
    showToast('Estudiante retirado del curso');
  } catch (err) { error.value = err.message; }
  finally { removingStudent.value = false; }
}

async function openCourseDetail(courseId) {
  const id = Number(courseId);
  coursePageLoading.value = true;
  courseDetailId.value = id;
  currentView.value = 'Detalle del curso';
  selectedCourse.value = id;
  classroomSection.value = 'tareas';
  addCourseSubjectOpen.value = false;
  addCourseSubjectError.value = '';
  courseAccessDenied.value = false;
  courseAccessMessage.value = '';
  window.history.pushState({ view: 'Detalle del curso', courseId: id }, '', `/cursos/${id}`);
  try {
    await loadCourseContext(id);
    if (!courses.value.some((course) => Number(course.id) === id)) {
      const enrollment = (studentProfile.value?.enrollments || []).find((entry) => Number(entry.id) === id);
      if (enrollment) {
        try {
          await request(`/courses/${id}/classroom`);
          courses.value = [
            ...courses.value,
            {
              id: enrollment.id,
              name: enrollment.name,
              section: enrollment.section,
              subject: enrollment.subject,
              color: enrollment.color || '#0067b2',
              teacher: enrollment.teacher || null,
              academic_year_id: enrollment.academic_year_id || null,
              head_teacher: enrollment.head_teacher || enrollment.headTeacher || null,
              student_count: 0,
              average: null,
            },
          ];
          return;
        } catch (err) {
          courseAccessDenied.value = true;
          courseAccessMessage.value = err?.message || 'No tienes acceso a este curso.';
          return;
        }
      }
    }
    await verifyCourseAccess(id);
  } finally {
    coursePageLoading.value = false;
  }
}

async function openCourseSubject(courseId) {
  const id = Number(courseId);
  coursePageLoading.value = true;
  courseDetailId.value = id;
  currentView.value = 'Asignatura del curso';
  selectedCourse.value = id;
  classroomSection.value = 'tareas';
  courseAccessDenied.value = false;
  courseAccessMessage.value = '';
  window.history.pushState({ view: 'Asignatura del curso', courseId: id }, '', `/cursos/${id}/calificaciones`);
  try {
    await loadCourseContext(id);
    await verifyCourseAccess(id);
  } finally {
    coursePageLoading.value = false;
  }
}

async function openCourseClassroom(courseId, section = 'tareas', options = {}) {
  let normalized = ['foros', 'archivos', 'comunicados', 'enlaces'].includes(section) ? section : 'tareas';
  if (normalized === 'foros' && authUser.value?.role === 'guardian') {
    showToast('Los foros del aula son solo para docentes y estudiantes.', 'error');
    normalized = 'tareas';
  }
  const sameClassroom = currentView.value === 'Aula del curso' && Number(courseDetailId.value) === Number(courseId);
  coursePageLoading.value = !sameClassroom;
  courseDetailId.value = Number(courseId);
  currentView.value = 'Aula del curso';
  selectedCourse.value = Number(courseId);
  classroomSection.value = normalized;
  classroomForumId.value = normalized === 'foros' ? Number(options.forumId) || null : null;
  classroomOpenSettings.value = Boolean(options.openSettings);
  window.history.pushState({ view: 'Aula del curso', courseId, section: normalized }, '', `/cursos/${courseId}/${normalized}${classroomForumId.value ? `/${classroomForumId.value}` : ''}`);
  try {
    if (!sameClassroom) await loadCourseContext(courseId);
    await verifyCourseAccess(courseId);
  } finally {
    coursePageLoading.value = false;
  }
}

function classroomConfigTabPath(tab) {
  if (tab === 'forums') return 'foros';
  if (tab === 'subjects') return 'profesores';
  if (tab === 'danger') return 'eliminar';
  return 'profesor-jefe';
}

function classroomConfigTabFromPath(section) {
  if (section === 'foros') return 'forums';
  if (section === 'profesores') return 'subjects';
  if (section === 'eliminar') return 'danger';
  return 'head';
}

async function loadClassroomForumSettings(courseId = courseDetailId.value) {
  classroomForumSettingsLoading.value = true;
  classroomForumSettingsError.value = '';
  try {
    const data = await request(`/courses/${courseId}/classroom`);
    classroomForumSettings.allowStudentsCreateForum = Boolean(data.settings?.allowStudentsCreateForum);
    classroomForumSettings.allowStudentsReplyForum = data.settings?.allowStudentsReplyForum !== false;
    classroomForumSettings.forumGuidelines = String(data.settings?.forumGuidelines || '').trim() || DEFAULT_COURSE_FORUM_GUIDELINES;
  } catch (err) {
    classroomForumSettingsError.value = err.message || 'No fue posible cargar la configuración de foros.';
  } finally {
    classroomForumSettingsLoading.value = false;
  }
}

async function openCourseClassroomConfig(courseId, tab) {
  if (!canOpenClassroomConfig.value) {
    showToast('No tienes permiso para configurar el aula.', 'error');
    return;
  }
  const id = Number(courseId);
  let nextTab = tab || (canManageAcademicStructure.value ? 'head' : 'forums');
  if ((nextTab === 'head' || nextTab === 'subjects' || nextTab === 'danger') && !canManageAcademicStructure.value) {
    nextTab = canConfigureCourseForum.value ? 'forums' : nextTab;
  }
  if (nextTab === 'forums' && !canConfigureCourseForum.value) {
    showToast('No tienes permiso para configurar foros.', 'error');
    return;
  }
  if ((nextTab === 'head' || nextTab === 'subjects' || nextTab === 'danger') && !canManageAcademicStructure.value) {
    showToast(nextTab === 'danger' ? 'No tienes permiso para eliminar el curso.' : 'No tienes permiso para asignar profesores.', 'error');
    return;
  }
  courseDetailId.value = id;
  selectedCourse.value = id;
  classroomConfigTab.value = nextTab;
  classroomHeadTeacherError.value = '';
  classroomSubjectError.value = '';
  classroomForumSettingsError.value = '';
  teacherPickerQuery.value = '';
  currentView.value = 'Configurar aula';
  coursePageLoading.value = true;
  window.history.pushState(
    { view: 'Configurar aula', courseId: id, section: classroomConfigTabPath(nextTab) },
    '',
    `/cursos/${id}/configurar/${classroomConfigTabPath(nextTab)}`
  );
  try {
    await loadCourseContext(id);
    await verifyCourseAccess(id);
    if (courseAccessDenied.value) return;
    if (nextTab === 'head' || nextTab === 'subjects') {
      if (!staffUsers.value.length) await loadStaffUsers();
      if (nextTab === 'head') {
        classroomHeadTeachers.value = parseTeacherList(courseDetailHeadTeacher.value);
      } else {
        initClassroomSubjectTeachers();
        await openFocusedClassroomSubject();
      }
    } else if (nextTab === 'forums') {
      await loadClassroomForumSettings(id);
    }
  } finally {
    coursePageLoading.value = false;
  }
}

async function setClassroomConfigTab(tab) {
  if (tab === classroomConfigTab.value) return;
  if ((tab === 'head' || tab === 'subjects' || tab === 'danger') && !canManageAcademicStructure.value) return;
  if (tab === 'forums' && !canConfigureCourseForum.value) return;
  classroomConfigTab.value = tab;
  classroomHeadTeacherError.value = '';
  classroomSubjectError.value = '';
  classroomForumSettingsError.value = '';
  teacherPickerQuery.value = '';
  const id = courseDetailId.value;
  window.history.replaceState(
    { view: 'Configurar aula', courseId: id, section: classroomConfigTabPath(tab) },
    '',
    `/cursos/${id}/configurar/${classroomConfigTabPath(tab)}`
  );
  if (tab === 'head') {
    if (!staffUsers.value.length) await loadStaffUsers();
    classroomHeadTeachers.value = parseTeacherList(courseDetailHeadTeacher.value);
  } else if (tab === 'subjects') {
    if (!staffUsers.value.length) await loadStaffUsers();
    initClassroomSubjectTeachers();
    await openFocusedClassroomSubject();
  } else if (tab === 'forums') {
    await loadClassroomForumSettings(id);
  }
}

async function saveClassroomHeadTeacher() {
  if (!courseDetail.value || !canManageAcademicStructure.value) return;
  classroomHeadTeacherSaving.value = true;
  classroomHeadTeacherError.value = '';
  try {
    const selected = parseTeacherList(classroomHeadTeachers.value);
    const result = await request(`/courses/${courseDetail.value.id}/head-teacher`, {
      method: 'PUT',
      body: JSON.stringify({ headTeachers: selected }),
    });
    const headTeacherName = result.headTeacher || formatTeacherList(selected) || null;
    const siblingIds = new Set((result.courses || []).map((row) => Number(row.id)));
    if (!siblingIds.size) siblingIds.add(Number(courseDetail.value.id));
    courses.value = courses.value.map((row) => (
      siblingIds.has(Number(row.id)) ? { ...row, head_teacher: headTeacherName, headTeacher: headTeacherName } : row
    ));
    courseGroups.value = await coursesApi.list({ grouped: 'true' });
    classroomHeadTeachers.value = parseTeacherList(headTeacherName);
    showToast(headTeacherName ? `Profesores jefes: ${headTeacherName}` : 'Curso sin profesor jefe');
  } catch (err) {
    classroomHeadTeacherError.value = err.message || 'No fue posible guardar el profesor jefe.';
  } finally {
    classroomHeadTeacherSaving.value = false;
  }
}

async function saveClassroomSubjectTeacher(moduleId) {
  if (!canManageAcademicStructure.value) return;
  const id = Number(moduleId);
  if (!id) return;
  classroomSubjectSavingId.value = id;
  classroomSubjectError.value = '';
  try {
    const selected = parseTeacherList(classroomSubjectTeachers[id] || []);
    const result = await request(`/courses/${id}/teacher`, {
      method: 'PUT',
      body: JSON.stringify({ teachers: selected }),
    });
    const teacherName = result.teacher || formatTeacherList(selected) || null;
    courses.value = courses.value.map((row) => (
      Number(row.id) === id ? { ...row, teacher: teacherName } : row
    ));
    if (courseDetail.value && Number(courseDetail.value.id) === id) {
      courseDetail.value = { ...courseDetail.value, teacher: teacherName };
    }
    classroomSubjectTeachers[id] = parseTeacherList(teacherName);
    const subjectLabel = courses.value.find((row) => Number(row.id) === id)?.subject || 'Asignatura';
    showToast(teacherName ? `${subjectLabel}: ${teacherName}` : `${subjectLabel} sin profesor asignado`);
  } catch (err) {
    classroomSubjectError.value = err.message || 'No fue posible guardar el profesor de asignatura.';
  } finally {
    classroomSubjectSavingId.value = null;
  }
}

async function saveClassroomForumSettings() {
  if (!courseDetailId.value || !canConfigureCourseForum.value) return;
  classroomForumSettingsSaving.value = true;
  classroomForumSettingsError.value = '';
  try {
    const settings = await request(`/courses/${courseDetailId.value}/classroom/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        allowStudentsCreateForum: Boolean(classroomForumSettings.allowStudentsCreateForum),
        allowStudentsReplyForum: Boolean(classroomForumSettings.allowStudentsReplyForum),
        forumGuidelines: String(classroomForumSettings.forumGuidelines || '').trim(),
      }),
    });
    classroomForumSettings.allowStudentsCreateForum = Boolean(settings.allowStudentsCreateForum);
    classroomForumSettings.allowStudentsReplyForum = settings.allowStudentsReplyForum !== false;
    classroomForumSettings.forumGuidelines = settings.forumGuidelines || '';
    showToast('Preferencias de foros guardadas');
  } catch (err) {
    classroomForumSettingsError.value = err.message || 'No fue posible guardar la configuración de foros.';
  } finally {
    classroomForumSettingsSaving.value = false;
  }
}

const classroomDeleteBusy = ref(false);

async function deleteClassroomCourse(course = courseDetail.value) {
  if (!course || classroomDeleteBusy.value || !canManageAcademicStructure.value) return;
  const subjectCount = courseSiblingCourses.value.length || 1;
  const ok = await askConfirmation(
    `¿Eliminar el curso ${course.name} · ${course.section}? Se borrarán ${subjectCount} asignatura${subjectCount === 1 ? '' : 's'} y sus matrículas, foros y materiales. Solo se permite si no hay calificaciones.`,
  );
  if (!ok) return;
  classroomDeleteBusy.value = true;
  try {
    await request(`/courses/${course.id}/class`, { method: 'DELETE' });
    courseDetailId.value = null;
    showToast(`Curso ${course.name} · ${course.section} eliminado`);
    navigate('Cursos');
    await loadData();
  } catch (err) {
    showToast(err.message || 'No fue posible eliminar el curso.', 'error');
  } finally {
    classroomDeleteBusy.value = false;
  }
}

async function deleteCourse(course) {
  if (!(await askConfirmation(`¿Eliminar ${course.name} · ${course.section} · ${course.subject}? Esta acción solo se permite si no tiene calificaciones.`))) return;
  try {
    await request(`/courses/${course.id}`, { method: 'DELETE' });
    if (courseDetailId.value === course.id) courseDetailId.value = null;
    await loadData();
    showToast('Curso eliminado correctamente');
  } catch (err) {
    showToast(err.message || 'No fue posible eliminar el curso.', 'error');
  }
}

let moduleRequestVersion = 0;
let loadedModuleKey = '';
async function loadModule(key) {
  const version = ++moduleRequestVersion;
  moduleLoading.value = true;
  // Always clear so the page spinner is visible on every navigation (e.g. activos ↔ historial).
  moduleData.value = null;
  error.value = '';
  const query = key === 'finance' ? `?year=${financeYear.value}` : key === 'hr' ? `?status=${employeeStatus.value}` : ''; 
  try {
    const result = enrichModuleStudentAvatars(await request(`/modules/${key}${query}`));
    if (version === moduleRequestVersion) {
      moduleData.value = result;
      loadedModuleKey = key;
      if (['classbook', 'coexistence', 'citations', 'documents'].includes(key)) {
        const seen = new Set();
        const avatarRows = (result.sections || []).flatMap((section) => section.rows || [])
          .filter((row) => {
            const id = Number(row.studentId);
            if (!(id > 0) || seen.has(id)) return false;
            seen.add(id);
            return Boolean(row.avatarKey || row.avatar_key);
          })
          .map((row) => ({
            id: Number(row.studentId),
            avatar_key: row.avatarKey || row.avatar_key,
          }));
        await ensureStudentAvatars(avatarRows);
      }
    }
  } catch (err) { if (version === moduleRequestVersion) { error.value = err.message; moduleData.value = null; } }
  finally { if (version === moduleRequestVersion) moduleLoading.value = false; }
}

async function loadNotifications() {
  const storedReadId = Number(storageGet(`notifications_read_${authUser.value?.id}`) || 0);
  lastReadNotificationId.value = Number.isFinite(storedReadId) ? storedReadId : 0;
  try {
    notifications.value = isPlatformConsole.value
      ? await request('/platform/notifications')
      : await request('/notifications');
  } catch { notifications.value = []; }
  await loadLeavePendingCount();
}

async function loadLeavePendingCount() {
  if (!authUser.value || isPlatformConsole.value || !canApproveLeave.value) {
    leavePendingCount.value = 0;
    return;
  }
  try {
    const info = await request('/leave-requests/meta');
    leavePendingCount.value = Number(info.pendingCount) || 0;
  } catch {
    leavePendingCount.value = 0;
  }
}

async function toggleNotifications() {
  const opening = !notificationsOpen.value;
  notificationsOpen.value = opening;
  profileMenuOpen.value = false;
  searchOpen.value = false;
  if (!opening) return;
  await loadNotifications();
  if (notifications.value.length) {
    lastReadNotificationId.value = Math.max(...notifications.value.map((item) => Number(item.id) || 0));
    storageSet(`notifications_read_${authUser.value.id}`, String(lastReadNotificationId.value));
  }
}

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value;
  notificationsOpen.value = false;
  searchOpen.value = false;
}

function closeHeaderMenus() {
  notificationsOpen.value = false;
  profileMenuOpen.value = false;
  searchOpen.value = false;
}

async function selectSearchStudent(studentId) {
  searchOpen.value = false;
  search.value = '';
  await openStudentProfile(studentId);
}

async function loadStaffUsers() {
  staffLoading.value = true;
  try {
    staffUsers.value = await request('/admin/users');
    await loadStaffAvatars(staffUsers.value);
  }
  catch (err) { error.value = err.message; }
  finally { staffLoading.value = false; }
}

async function loadStaffAvatars(rows) {
  const token = session.getToken();
  if (!token || !Array.isArray(rows)) return;
  const nextAvatars = {};
  await Promise.all(rows.filter((user) => user.avatarKey).slice(0, 100).map(async (user) => {
    try {
      const response = await download(`/admin/users/${user.id}/avatar`);
      if (response.ok) nextAvatars[user.id] = URL.createObjectURL(await response.blob());
    } catch { /* Initials remain available when no avatar is available. */ }
  }));
  Object.values(staffAvatars.value).forEach((url) => URL.revokeObjectURL(url));
  staffAvatars.value = nextAvatars;
}

function studentRouteFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const notas = path.match(/^\/estudiantes\/(\d+)\/notas$/);
  if (notas) return { id: Number(notas[1]), section: 'notas' };
  const anotaciones = path.match(/^\/estudiantes\/(\d+)\/anotaciones$/);
  if (anotaciones) return { id: Number(anotaciones[1]), section: 'anotaciones' };
  const historial = path.match(/^\/estudiantes\/(\d+)\/historial$/);
  if (historial) return { id: Number(historial[1]), section: 'historial' };
  const apoderados = path.match(/^\/estudiantes\/(\d+)\/apoderados$/);
  if (apoderados) return { id: Number(apoderados[1]), section: 'apoderados' };
  const ficha = path.match(/^\/estudiantes\/(\d+)$/);
  if (ficha) return { id: Number(ficha[1]), section: 'ficha' };
  return null;
}

function studentIdFromRoute() {
  return studentRouteFromLocation()?.id || null;
}

function routeInfoFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const jobTitleMatch = path.match(/^\/administracion\/colegio\/cargos\/(\d+)$/);
  if (jobTitleMatch) return { view: 'Detalle del cargo', section: '', jobTitleId: Number(jobTitleMatch[1]) };
  const schoolSettingsMatch = path.match(/^\/administracion\/colegio(?:\/(informacion|datos|niveles|sidepanel|logo|cuenta-bancaria|bancaria|cargos))?$/);
  if (schoolSettingsMatch) {
    return {
      view: 'Configurar colegio',
      section: '',
      schoolTab: SCHOOL_TAB_FROM_SLUG[schoolSettingsMatch[1] || 'datos'] || 'institutional',
    };
  }
  const integrationsMatch = path.match(/^\/administracion\/integraciones(?:\/(whatsapp|webpay))?$/);
  if (integrationsMatch) {
    return {
      view: 'Integraciones',
      section: '',
      integrationsTab: integrationsMatch[1] || 'whatsapp',
    };
  }
  if (path === '/administracion' || path === '/administracion/equipo') {
    return { view: 'Administración', section: '' };
  }
  if (path === '/administracion/equipo/nuevo') {
    return { view: 'Administración', section: '', staffFormMode: 'new' };
  }
  const staffUserMatch = path.match(/^\/administracion\/equipo\/(\d+)$/);
  if (staffUserMatch) {
    return { view: 'Administración', section: '', staffUserId: Number(staffUserMatch[1]) };
  }
  if (path === '/administracion/mensualidades' || path === '/cursos/configuracion') {
    return { view: 'Mensualidades', section: '' };
  }
  const observationDetailMatch = path.match(/^\/libro-de-clases\/anotaciones\/(\d+)$/);
  if (observationDetailMatch) {
    return { view: 'Detalle anotación', section: '', observationId: Number(observationDetailMatch[1]) };
  }
  const attentionMatch = path.match(/^\/atencion\/([^/]+)$/);
  if (attentionMatch) return { view: 'Atención', section: '', attention: decodeURIComponent(attentionMatch[1]) };
  if (path === '/' || path === '') {
    const legacyAttention = new URLSearchParams(window.location.search).get('attention');
    if (legacyAttention) return { view: 'Atención', section: '', attention: legacyAttention };
  }
  if (['/empleados/activos','/empleados/historial','/colaboradores/activos','/colaboradores/historial'].includes(path)) return { view:'RRHH', section:'', status:path.endsWith('/historial') ? 'inactive' : 'active' };
  if (path === '/empleados/nuevo') return { view: 'Nuevo empleado', section: '' };
  const employeeDetailMatch = path.match(/^\/(?:empleados|colaboradores|empleado)\/(\d+)$/);
  if (employeeDetailMatch) return { view: 'RRHH', section: '', employeeId: Number(employeeDetailMatch[1]) };
  const enrollmentRoute = path.match(/^\/cursos\/(\d+)\/estudiantes\/agregar$/);
  if (enrollmentRoute) return { view:'Agregar estudiantes', courseId:Number(enrollmentRoute[1]), section:'' };
  if (path === '/estudiantes/nuevo') return { view: 'Nuevo estudiante', section: '' };
  if (path === '/apoderados/nuevo') return { view: 'Nuevo apoderado', section: '' };
  const guardianDetailMatch = path.match(/^\/apoderados\/(\d+)$/);
  if (guardianDetailMatch) return { view: 'Detalle apoderado', section: '', guardianId: Number(guardianDetailMatch[1]) };
  if (path === '/documentos/nuevo') return { view: 'Subir documento', section: '' };
  if (path === '/comunicaciones/nueva') return { view: 'Nueva comunicación', section: '' };
  if (path === '/comunicaciones/nueva/destinatarios') return { view: 'Destinatarios comunicación', section: '' };
  if (path === '/planificacion/nueva' || /^\/planificacion\/unidades\/\d+$/.test(path)) {
    return { view: 'Planificación', section: '' };
  }
  const communicationDetailMatch = path.match(/^\/comunicaciones\/(\d+)$/);
  if (communicationDetailMatch) {
    return { view: 'Detalle comunicación', section: '', communicationId: Number(communicationDetailMatch[1]) };
  }
  if (path === '/solicitudes/nueva') return { view: 'Nueva solicitud', section: '' };
  if (path === '/tareas/historial') return { view: 'Historial de tareas', section: '' };
  if (path === '/tareas') return { view: 'Tareas activas', section: '' };
  const leaveDetailMatch = path.match(/^\/solicitudes\/(\d+)$/);
  if (leaveDetailMatch) {
    return { view: 'Solicitudes', section: '', leaveId: Number(leaveDetailMatch[1]) };
  }
  const forumMatch = path.match(/^\/cursos\/(\d+)\/foros\/(\d+)$/);
  if (forumMatch) return { view: 'Aula del curso', courseId: Number(forumMatch[1]), section: 'foros', forumId: Number(forumMatch[2]) };
  const classroomConfigMatch = path.match(/^\/cursos\/(\d+)\/configurar(?:\/(profesor-jefe|foros|profesores|eliminar))?$/);
  if (classroomConfigMatch) {
    return {
      view: 'Configurar aula',
      courseId: Number(classroomConfigMatch[1]),
      section: classroomConfigMatch[2] || 'profesor-jefe',
    };
  }
  const classroomMatch = path.match(/^\/cursos\/(\d+)\/(tareas|foros|archivos|comunicados|enlaces|calificaciones)$/);
  if (classroomMatch) {
    if (classroomMatch[2] === 'calificaciones') return { view: 'Asignatura del curso', courseId: Number(classroomMatch[1]), section: '' };
    return { view: 'Aula del curso', courseId: Number(classroomMatch[1]), section: classroomMatch[2] };
  }
  const courseMatch = path.match(/^\/cursos\/(\d+)$/);
  if (courseMatch) return { view: 'Detalle del curso', courseId: Number(courseMatch[1]), section: '' };
  const financeMatch = path.match(/^\/finanzas\/([^/]+)$/);
  if (financeMatch && financeSectionRoutes[financeMatch[1]]) {
    return { view: 'Finanzas', section: financeSectionRoutes[financeMatch[1]] };
  }
  if (/^\/plataforma\/colegios\/nuevo$/.test(path)) return { view: 'Agregar colegio', section: '' };
  if (/^\/plataforma\/colegios(?:\/\d+(?:\/plan)?)?$/.test(path)) return { view: 'Colegios', section: '' };
  if (/^\/plataforma\/cuentas(?:\/\d+)?$/.test(path)) return { view: 'Cuentas', section: '' };
  if (path === '/plataforma/sesiones') return { view: 'Sesiones', section: '' };
  if (path === '/plataforma/contactos' || path === '/plataforma/contacto' || path === '/contactos') {
    return { view: 'Inbox de contacto', section: '' };
  }
  if (path === '/plataforma/infraestructura/sql') {
    return { view: 'Plataforma', section: '' };
  }
  const accountMatch = path.match(/^\/mi-cuenta(?:\/(perfil|seguridad|acceso|notificaciones))?$/);
  if (accountMatch) {
    return {
      view: 'Mi cuenta',
      section: '',
      accountTab: ACCOUNT_TAB_FROM_SLUG[accountMatch[1] || 'perfil'] || 'profile',
    };
  }
  const entry = Object.entries(viewRoutes).find(([, route]) => route === path);
  return entry ? { view: entry[0], section: '' } : null;
}

async function loadStudentProfile(studentId, section = studentProfileSection.value, { soft = false } = {}) {
  currentView.value = 'Perfil del estudiante';
  studentProfileSection.value = ['ficha', 'historial', 'apoderados', 'notas', 'anotaciones'].includes(section) ? section : 'notas';
  search.value = '';
  expandedGradeGroup.value = '';
  error.value = '';
  if (!soft) {
    studentProfileLoading.value = true;
    studentProfile.value = null;
  }
  try {
    const profile = await request(`/students/${studentId}`);
    studentProfile.value = profile;
    const currentYear = String(
      profile.currentAcademicYear
      || new Date().getFullYear()
    );
    if (section === 'historial') {
      const prior = (profile.years || []).find((year) => String(year.year) !== currentYear);
      selectedStudentYear.value = String(prior?.year || profile.years?.[0]?.year || currentYear);
    } else {
      selectedStudentYear.value = String(
        profile.currentAcademicYear
        || profile.years?.[0]?.year
        || new Date().getFullYear()
      );
    }
    const first = (profile.enrollments || []).find((entry) => entry.status !== 'withdrawn');
    if (!soft || !expandedEnrollmentGroup.value) {
      expandedEnrollmentGroup.value = first ? `${first.name}|${first.section}` : '';
    }
    if (['student', 'guardian'].includes(authUser.value?.role)) {
      await request(`/notifications/student/${studentId}`, { method: 'DELETE' });
      await loadNotifications();
    }
  }
  catch (err) { error.value = err.message; }
  finally { studentProfileLoading.value = false; }
}

const deactivatingStudent = ref(false);

async function deactivateStudent() {
  const student = studentProfile.value?.student;
  if (!student || deactivatingStudent.value || !canDeactivateStudent.value) return;
  const result = await askConfirmation(
    `¿Dar de baja a ${student.first_name} ${student.last_name}? Quedará como estudiante anterior y se conservará el historial.`,
    { checkboxLabel: 'Revocar acceso a la plataforma', checkboxDefault: false }
  );
  if (!confirmationOk(result)) return;
  const revokeAccess = confirmationChecked(result);
  deactivatingStudent.value = true;
  try {
    await request(`/students/${student.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ revokeAccess }),
    });
    showToast(revokeAccess
      ? 'Estudiante dado de baja y acceso revocado'
      : 'Estudiante dado de baja. El acceso histórico se mantiene.');
    await loadStudentProfile(student.id, 'ficha', { soft: true });
  } catch (err) { showToast(err.message || 'No fue posible dar de baja al estudiante.', 'error'); }
  finally { deactivatingStudent.value = false; }
}

async function restoreStudent() {
  const student = studentProfile.value?.student;
  if (!student || deactivatingStudent.value || !canDeactivateStudent.value) return;
  if (!(await askConfirmation(`¿Reactivar a ${student.first_name} ${student.last_name}? Volverá a aparecer como estudiante activo.`))) return;
  deactivatingStudent.value = true;
  try {
    await request(`/students/${student.id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ restoreAccess: true }),
    });
    showToast('Estudiante reactivado');
    await loadStudentProfile(student.id, 'ficha', { soft: true });
  } catch (err) { showToast(err.message || 'No fue posible reactivar al estudiante.', 'error'); }
  finally { deactivatingStudent.value = false; }
}

async function setStudentPlatformAccess(active) {
  const student = studentProfile.value?.student;
  if (!student?.userId || deactivatingStudent.value || !authUser.value?.permissions?.manageUsers) return;
  deactivatingStudent.value = true;
  try {
    await request(`/students/${student.id}/platform-access`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    });
    studentProfile.value = {
      ...studentProfile.value,
      student: { ...studentProfile.value.student, platformAccess: active },
    };
    showToast(active ? 'Acceso a la plataforma restaurado' : 'Acceso a la plataforma revocado');
  } catch (err) { showToast(err.message || 'No fue posible actualizar el acceso.', 'error'); }
  finally { deactivatingStudent.value = false; }
}

function toggleGradeGroup(group) {
  const key = `${group.subject}::${group.course}`;
  expandedGradeGroup.value = expandedGradeGroup.value === key ? '' : key;
}

async function openStudentFicha(studentId) {
  closeHeaderMenus();
  window.history.pushState({ view: 'student-ficha', studentId }, '', `/estudiantes/${studentId}`);
  await loadStudentProfile(studentId, 'ficha');
}

async function openStudentHistorial(studentId) {
  closeHeaderMenus();
  window.history.pushState({ view: 'student-history', studentId }, '', `/estudiantes/${studentId}/historial`);
  await loadStudentProfile(studentId, 'historial');
}

async function openStudentNotas(studentId) {
  closeHeaderMenus();
  window.history.pushState({ view: 'student-grades', studentId }, '', `/estudiantes/${studentId}/notas`);
  await loadStudentProfile(studentId, 'notas');
}

async function openStudentAnotaciones(studentId) {
  closeHeaderMenus();
  window.history.pushState({ view: 'student-observations', studentId }, '', `/estudiantes/${studentId}/anotaciones`);
  await loadStudentProfile(studentId, 'anotaciones');
}

async function openStudentYearNotas(studentId, year) {
  await openStudentHistorial(studentId);
  selectedStudentYear.value = String(year);
}

async function openStudentApoderados(studentId) {
  closeHeaderMenus();
  window.history.pushState({ view: 'student-guardians', studentId }, '', `/estudiantes/${studentId}/apoderados`);
  await loadStudentProfile(studentId, 'apoderados');
}

function openGuardianProfile(guardian) {
  const id = Number(guardian?.id ?? guardian);
  if (!Number.isSafeInteger(id) || id < 1) return;
  closeHeaderMenus();
  error.value = '';
  guardiansFocusId.value = id;
  guardiansKey.value += 1;
  currentView.value = 'Detalle apoderado';
  studentProfile.value = null;
  courseDetailId.value = null;
  selectedCourse.value = '';
  staffFormOpen.value = false;
  activeModuleSection.value = '';
  search.value = '';
  sidebarOpen.value = false;
  window.history.pushState({ view: 'Detalle apoderado', guardianId: id }, '', `/apoderados/${id}`);
}

function openNewGuardianPage() {
  closeHeaderMenus();
  error.value = '';
  guardiansFocusId.value = null;
  currentView.value = 'Nuevo apoderado';
  studentProfile.value = null;
  courseDetailId.value = null;
  selectedCourse.value = '';
  staffFormOpen.value = false;
  activeModuleSection.value = '';
  search.value = '';
  sidebarOpen.value = false;
  window.history.pushState({ view: 'Nuevo apoderado' }, '', '/apoderados/nuevo');
}

function backToGuardians(guardianId = null) {
  const id = Number(guardianId);
  if (Number.isSafeInteger(id) && id > 0) {
    openGuardianProfile(id);
    return;
  }
  navigate('Apoderados');
}

function openNewLeavePage() {
  closeHeaderMenus();
  error.value = '';
  currentView.value = 'Nueva solicitud';
  studentProfile.value = null;
  courseDetailId.value = null;
  selectedCourse.value = '';
  staffFormOpen.value = false;
  activeModuleSection.value = '';
  search.value = '';
  sidebarOpen.value = false;
  window.history.pushState({ view: 'Nueva solicitud' }, '', '/solicitudes/nueva');
}

function backToLeaveList() {
  leaveRequestsKey.value += 1;
  navigate('Solicitudes');
}

async function openStudentProfile(studentId) {
  await openStudentFicha(studentId);
}

function selectCommunicationStudent(student) {
  communicationForm.studentId = student.id;
  communicationStudentSelected.value = student;
  communicationStudentSearch.value = `${student.first_name} ${student.last_name}`.trim();
  communicationStudentCandidates.value = [];
}

async function openCommunicationPage(prefill = null, push = true) {
  communicationStudentContext.value = prefill?.studentId || null;
  Object.assign(communicationForm, { subject: '', body: '', channel: 'email', audiences: ['all'], studentId: null, guardianId: null, courseId: null });
  communicationError.value = '';
  communicationStudentSearch.value = '';
  communicationStudentCandidates.value = [];
  communicationStudentSelected.value = null;
  communicationGuardianSelected.value = null;
  communicationGuardianSearch.value = '';
  communicationGuardianCandidates.value = [];
  whatsappConfigured.value = false;
  if (prefill?.courseId) {
    communicationForm.audiences = ['course'];
    communicationForm.courseId = Number(prefill.courseId);
  } else if (prefill?.guardianId) {
    communicationForm.audiences = ['guardian'];
    communicationForm.guardianId = prefill.guardianId;
    communicationGuardianSelected.value = {
      id: prefill.guardianId,
      full_name: prefill.guardianName || '',
      email: prefill.guardianEmail || '',
    };
    communicationGuardianSearch.value = prefill.guardianName || '';
  } else if (prefill?.studentId) {
    communicationForm.audiences = ['student'];
    communicationForm.studentId = prefill.studentId;
    communicationStudentSelected.value = {
      id: prefill.studentId,
      first_name: prefill.firstName || '',
      last_name: prefill.lastName || '',
    };
    communicationStudentSearch.value = `${prefill.firstName || ''} ${prefill.lastName || ''}`.trim();
  }
  currentView.value = 'Nueva comunicación';
  if (push) {
    const query = prefill?.studentId ? `?studentId=${encodeURIComponent(prefill.studentId)}` : '';
    window.history.pushState({ view: 'Nueva comunicación' }, '', `${viewRoutes['Nueva comunicación']}${query}`);
  }
  sidebarOpen.value = false;
  try {
    const status = await request('/communications/whatsapp-status');
    whatsappConfigured.value = Boolean(status?.configured);
  } catch {
    whatsappConfigured.value = false;
  }
  if (prefill?.channel && (prefill.channel !== 'whatsapp' || whatsappConfigured.value)) {
    communicationForm.channel = prefill.channel;
  }
  if (!courses.value.length) {
    try { courses.value = await coursesApi.list(); } catch { /* ignore */ }
  }
}

function backFromCommunication() {
  if (communicationStudentContext.value) return openStudentFicha(communicationStudentContext.value);
  navigate('Comunicaciones');
}

async function openCommunicationRecipientsPage(push = true) {
  if (!canListCommunicationRecipients.value) {
    communicationError.value = 'Completa los destinatarios antes de listarlos.';
    return;
  }
  communicationKeepDraft.value = true;
  communicationRecipientsError.value = '';
  communicationRecipientsLoading.value = true;
  communicationRecipients.value = [];
  communicationRecipientsTotal.value = 0;
  currentView.value = 'Destinatarios comunicación';
  if (push) window.history.pushState({ view: 'Destinatarios comunicación' }, '', viewRoutes['Destinatarios comunicación']);
  sidebarOpen.value = false;
  try {
    const params = new URLSearchParams();
    params.set('audiences', communicationForm.audiences.join(','));
    if (communicationAudienceSelected('student') && communicationForm.studentId) params.set('studentId', String(communicationForm.studentId));
    if (communicationAudienceSelected('guardian') && communicationForm.guardianId) params.set('guardianId', String(communicationForm.guardianId));
    if (communicationAudienceSelected('course') && communicationForm.courseId) params.set('courseId', String(communicationForm.courseId));
    const result = await request(`/communications/recipients?${params}`);
    communicationRecipients.value = result.recipients || [];
    resetCommunicationRecipientsPage();
    communicationRecipientsTotal.value = Number(result.total || communicationRecipients.value.length);
  } catch (err) {
    communicationRecipientsError.value = err.message;
  } finally {
    communicationRecipientsLoading.value = false;
  }
}

function backToCommunicationComposer() {
  communicationKeepDraft.value = true;
  currentView.value = 'Nueva comunicación';
  window.history.pushState({ view: 'Nueva comunicación' }, '', viewRoutes['Nueva comunicación']);
  sidebarOpen.value = false;
}

function openCourseCommunication(courseId = courseDetailId.value) {
  if (!courseId) return;
  openCommunicationPage({ courseId: Number(courseId) });
}

function openStudentCommunication(student) {
  openCommunicationPage({
    studentId: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    channel: 'email',
  });
}

async function focusStudentMineduc() {
  if (!studentProfile.value?.student?.id) return;
  if (studentProfileSection.value !== 'ficha') await openStudentFicha(studentProfile.value.student.id);
  await nextTick();
  document.querySelector('.sige-inline')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function selectCommunicationGuardian(guardian) {
  communicationForm.guardianId = guardian.id;
  communicationGuardianSelected.value = {
    id: guardian.id,
    full_name: guardian.fullName || guardian.full_name || '',
    email: guardian.email || '',
  };
  communicationGuardianSearch.value = communicationGuardianSelected.value.full_name;
  communicationGuardianCandidates.value = [];
}

async function searchCommunicationGuardians() {
  const q = communicationGuardianSearch.value.trim();
  if (q.length < 2) { communicationGuardianCandidates.value = []; return; }
  try {
    communicationGuardianCandidates.value = await request(`/guardians?q=${encodeURIComponent(q)}`);
  } catch {
    communicationGuardianCandidates.value = [];
  }
}

function openGuardianCommunication(guardian) {
  openCommunicationPage({
    guardianId: guardian.id,
    guardianName: guardian.full_name || guardian.fullName || '',
    guardianEmail: guardian.email || '',
    channel: 'email',
  });
}

function openSchoolSettingsPage({ tab = 'institutional', push = true } = {}) {
  Object.assign(schoolForm, {
    name: school.value.name || '', slug: school.value.slug || '', rbd: school.value.rbd || '',
    city: school.value.city || '',
    address: school.value.address || '',
    phone: school.value.phone || '', email: school.value.email || '', website: school.value.website || '',
    schoolType: school.value.schoolType || 'subvencionado',
    showLogoInSidebar: school.value.showLogoInSidebar !== false,
    sidebarCollapsible: school.value.sidebarCollapsible !== false,
    sidebarPanelCollapsible: school.value.sidebarPanelCollapsible !== false,
    sidebarBgColor: normalizeSidebarHex(school.value.sidebarBgColor, SIDEBAR_BG_DEFAULT),
    sidebarTextColor: normalizeSidebarHex(school.value.sidebarTextColor, SIDEBAR_TEXT_DEFAULT),
    sidebarFontSize: normalizeSidebarFontSize(school.value.sidebarFontSize, SIDEBAR_FONT_SIZE_DEFAULT),
    educationStages: Array.isArray(school.value.educationStages) && school.value.educationStages.length
      ? [...school.value.educationStages]
      : ['prekinder', 'kinder', 'basica', 'media'],
    banking: {
      originBank: school.value.banking?.originBank || '',
      originAccountType: school.value.banking?.originAccountType || '',
      originAccountNumber: '',
      originAccountNumberMasked: school.value.banking?.originAccountNumberMasked || '',
      companyRut: school.value.banking?.companyRut || '',
      companyName: school.value.banking?.companyName || school.value.name || '',
    },
  });
  if (Array.isArray(school.value.educationStageOptions) && school.value.educationStageOptions.length) {
    educationStageOptions.value = school.value.educationStageOptions;
  }
  error.value = '';
  removeAssociatedCoursesOnSave.value = false;
  educationStageImpactModal.value = null;
  currentView.value = 'Configurar colegio';
  expandedNav.value = 'Administración';
  sidebarOpen.value = false;
  loadJobTitles();
  loadSchoolLogoPreview();
  setSchoolTab(tab === 'logo' ? 'sidepanel' : tab, { push });
}

function schoolPathForTab(tab = 'institutional') {
  const key = SCHOOL_TAB_SLUGS[tab] ? tab : 'institutional';
  return `/administracion/colegio/${SCHOOL_TAB_SLUGS[key]}`;
}

function setSchoolTab(tab, { push = true } = {}) {
  const normalized = tab === 'logo' ? 'sidepanel' : tab;
  const next = SCHOOL_TAB_SLUGS[normalized] ? normalized : 'institutional';
  schoolTab.value = next;
  const path = schoolPathForTab(next);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (currentPath !== path) {
    const state = { view: 'Configurar colegio', schoolTab: next };
    if (push) window.history.pushState(state, '', path);
    else window.history.replaceState(state, '', path);
  }
  if (next === 'levels') loadEducationStageSummary();
  nextTick(() => {
    document.querySelector('.school-settings-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function integrationsPathForTab(tab = 'whatsapp') {
  const key = INTEGRATIONS_TAB_SLUGS[tab] ? tab : 'whatsapp';
  return `/administracion/integraciones/${INTEGRATIONS_TAB_SLUGS[key]}`;
}

function setIntegrationsTab(tab, { push = true } = {}) {
  const next = INTEGRATIONS_TAB_SLUGS[tab] ? tab : 'whatsapp';
  integrationsTab.value = next;
  const path = integrationsPathForTab(next);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (currentPath !== path) {
    const state = { view: 'Integraciones', integrationsTab: next };
    if (push) window.history.pushState(state, '', path);
    else window.history.replaceState(state, '', path);
  }
  nextTick(() => {
    document.querySelector('.integrations-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function openIntegrationsPage({ tab = 'whatsapp', push = true } = {}) {
  currentView.value = 'Integraciones';
  expandedNav.value = 'Administración';
  sidebarOpen.value = false;
  error.value = '';
  setIntegrationsTab(tab, { push });
}

const schoolInfoExportBusy = ref('');
const schoolInfoExportPacks = [
  { id: 'full', title: 'Informe completo', detail: 'Perfil, banca, personal, docentes, cuentas, cargos y cursos', icon: FileText },
  { id: 'profile', title: 'Perfil del colegio', detail: 'Datos institucionales y niveles educativos', icon: Building2 },
  { id: 'banking', title: 'Cuenta bancaria', detail: 'Empresa, RUT, banco y cuenta de origen', icon: CreditCard },
  { id: 'staff', title: 'Personal / RRHH', detail: 'Empleados activos, cargos y cuentas bancarias', icon: Users },
  { id: 'teachers', title: 'Profesores', detail: 'Cuerpo docente con acceso a la plataforma', icon: GraduationCap },
  { id: 'accounts', title: 'Cuentas admin', detail: 'Roles y accesos del equipo administrativo', icon: ShieldCheck },
  { id: 'jobs', title: 'Cargos', detail: 'Lista de cargos y jerarquías del colegio', icon: ClipboardList },
  { id: 'courses', title: 'Cursos', detail: 'Cursos, secciones, asignaturas y docentes', icon: BookOpen },
];

async function exportSchoolInfoPdf(pack = 'full') {
  if (schoolInfoExportBusy.value) return;
  schoolInfoExportBusy.value = pack;
  try {
    const response = await download(`/school/info/export.pdf?pack=${encodeURIComponent(pack)}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'No fue posible exportar la información.');
    }
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `informacion-colegio-${pack}.pdf`;
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast('PDF institucional descargado');
  } catch (err) {
    showToast(err.message || 'No fue posible exportar la información.', 'error');
  } finally {
    schoolInfoExportBusy.value = '';
  }
}

async function loadSchoolLogoPreview() {
  if (schoolLogoPreview.value) URL.revokeObjectURL(schoolLogoPreview.value);
  schoolLogoPreview.value = '';
  if (!school.value?.hasLogo) return;
  try {
    const response = await download('/school/logo');
    if (response.ok) schoolLogoPreview.value = URL.createObjectURL(await response.blob());
  } catch { /* Sin logo cargado. */ }
}

async function uploadSchoolLogo(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  schoolLogoBusy.value = true;
  error.value = '';
  try {
    const body = new FormData();
    body.append('file', file);
    await request('/school/logo', { method: 'POST', body });
    school.value = { ...school.value, hasLogo: true, showLogoInSidebar: school.value?.showLogoInSidebar !== false };
    schoolForm.showLogoInSidebar = school.value.showLogoInSidebar !== false;
    await loadSchoolLogoPreview();
    showToast('Logo del colegio actualizado');
  } catch (err) {
    error.value = err.message;
  } finally {
    schoolLogoBusy.value = false;
  }
}

async function removeSchoolLogo() {
  if (!(await askConfirmation('¿Quitar el logo del colegio?'))) return;
  schoolLogoBusy.value = true;
  error.value = '';
  try {
    await request('/school/logo', { method: 'DELETE' });
    school.value = { ...school.value, hasLogo: false };
    if (schoolLogoPreview.value) URL.revokeObjectURL(schoolLogoPreview.value);
    schoolLogoPreview.value = '';
    showToast('Logo eliminado');
  } catch (err) {
    error.value = err.message;
  } finally {
    schoolLogoBusy.value = false;
  }
}

function previewSidebarLogoToggle() {
  school.value = { ...school.value, showLogoInSidebar: Boolean(schoolForm.showLogoInSidebar) };
}
function previewSidebarCollapsibleToggle() {
  school.value = { ...school.value, sidebarCollapsible: Boolean(schoolForm.sidebarCollapsible) };
}
function previewSidebarPanelCollapsibleToggle() {
  school.value = { ...school.value, sidebarPanelCollapsible: Boolean(schoolForm.sidebarPanelCollapsible) };
  if (!schoolForm.sidebarPanelCollapsible && sidebarCompact.value) {
    sidebarCompact.value = false;
    sessionFlagSet('sidebar_compact', '0');
  }
}
function previewSidebarThemeColors() {
  school.value = {
    ...school.value,
    sidebarBgColor: normalizeSidebarHex(schoolForm.sidebarBgColor, SIDEBAR_BG_DEFAULT),
    sidebarTextColor: normalizeSidebarHex(schoolForm.sidebarTextColor, SIDEBAR_TEXT_DEFAULT),
    sidebarFontSize: normalizeSidebarFontSize(schoolForm.sidebarFontSize, SIDEBAR_FONT_SIZE_DEFAULT),
  };
}
function resetSidebarThemeColors() {
  schoolForm.sidebarBgColor = SIDEBAR_BG_DEFAULT;
  schoolForm.sidebarTextColor = SIDEBAR_TEXT_DEFAULT;
  schoolForm.sidebarFontSize = SIDEBAR_FONT_SIZE_DEFAULT;
  previewSidebarThemeColors();
}

async function openCourseSettingsPage() {
  if (isPublicSchool.value) {
    showToast('Los colegios públicos no usan mensualidades en hlquery.', 'error');
    return;
  }
  currentView.value = 'Mensualidades';
  expandedNav.value = 'Administración';
  courseDetailId.value = null;
  selectedCourse.value = '';
  courseSettingsError.value = '';
  window.history.pushState({ view: 'Mensualidades' }, '', viewRoutes.Mensualidades);
  sidebarOpen.value = false;
  if (!staffUsers.value.length) await loadStaffUsers();
  await loadData();
}

async function saveCourseTeacher(course) {
  courseTeacherSavingId.value = course.id;
  courseSettingsError.value = '';
  try {
    const result = await request(`/courses/${course.id}/teacher`, {
      method: 'PUT',
      body: JSON.stringify({ teacher: course.teacher || '' }),
    });
    course.teacher = result.course.teacher;
    showToast(course.teacher ? 'Profesor asignado correctamente' : 'Curso guardado sin profesor asignado');
    await loadData();
  } catch (err) {
    courseSettingsError.value = err.message;
  } finally {
    courseTeacherSavingId.value = null;
  }
}

async function saveCourseMonthlyFee(group) {
  courseFeeSavingId.value = group.id;
  courseSettingsError.value = '';
  try {
    const result = await request(`/courses/${group.id}/monthly-fee`, {
      method: 'PUT',
      body: JSON.stringify({ monthlyFee: Number(group.monthly_fee || 0) }),
    });
    group.monthly_fee = result.monthlyFee;
    for (const module of group.modules || []) module.monthly_fee = result.monthlyFee;
    showToast('Mensualidad del curso actualizada');
    await loadData();
  } catch (err) {
    courseSettingsError.value = err.message;
  } finally {
    courseFeeSavingId.value = null;
  }
}

async function loadJobTitles() {
  try {
    jobTitles.value = await request('/job-titles');
    if (currentView.value === 'Nuevo empleado' && !employeeForm.position && jobTitles.value[0]?.name) {
      employeeForm.position = jobTitles.value[0].name;
    }
    if (selectedJobTitle.value) {
      const current = jobTitles.value.find((title) => title.id === selectedJobTitle.value.id);
      if (current) selectedJobTitle.value = current;
      else {
        selectedJobTitle.value = null;
        jobTitleEmployees.value = [];
        jobTitleEmployeesError.value = '';
      }
    }
  } catch { jobTitles.value = []; }
}

async function openJobTitleEmployees(title, { push = true } = {}) {
  if (!title?.id) return;
  selectedJobTitle.value = title;
  jobTitleEmployeesLoading.value = true;
  jobTitleEmployeesError.value = '';
  jobTitleEmployees.value = [];
  currentView.value = 'Detalle del cargo';
  expandedNav.value = 'Administración';
  schoolTab.value = 'jobs';
  sidebarOpen.value = false;
  const path = `/administracion/colegio/cargos/${title.id}`;
  if (push && `${window.location.pathname}` !== path) {
    window.history.pushState(
      { view: 'Detalle del cargo', jobTitleId: title.id },
      '',
      path,
    );
  } else if (!push) {
    window.history.replaceState(
      { view: 'Detalle del cargo', jobTitleId: title.id },
      '',
      path,
    );
  }
  try {
    const data = await request(`/job-titles/${title.id}/employees`);
    selectedJobTitle.value = { ...title, ...(data.jobTitle || {}), employeeCount: data.employeeCount ?? title.employeeCount };
    jobTitleEmployees.value = data.employees || [];
    resetJobTitleEmployeesPage();
  } catch (err) {
    jobTitleEmployees.value = [];
    jobTitleEmployeesError.value = err.message;
  } finally {
    jobTitleEmployeesLoading.value = false;
  }
}

function backToJobTitles() {
  selectedJobTitle.value = null;
  jobTitleEmployees.value = [];
  jobTitleEmployeesError.value = '';
  openSchoolSettingsPage({ tab: 'jobs' });
}

async function openEmployeesByPosition(position) {
  if (!position) return;
  employeeStatus.value = 'active';
  selectedEmployee.value = null;
  currentView.value = 'RRHH';
  expandedNav.value = 'Recursos humanos';
  sidebarOpen.value = false;
  window.history.pushState({}, '', '/empleados/activos');
  await loadModule('hr');
  await nextTick();
  employeePositionFilter.value = position;
}

async function openEmployeeFromJobTitle(employee) {
  const id = Number(employee?.id);
  if (!Number.isInteger(id) || id < 1) return;
  expandedNav.value = 'Recursos humanos';
  sidebarOpen.value = false;
  await openEmployeeById(id);
}

async function saveJobTitle() {
  const name = newJobTitle.value.trim();
  if (name.length < 2) return;
  const hierarchyRaw = String(newJobTitleHierarchy.value ?? '').trim();
  jobTitleSaving.value = true;
  try {
    await request('/job-titles', {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(hierarchyRaw ? { hierarchy: Number(hierarchyRaw) } : { hierarchy: null }),
      }),
    });
    newJobTitle.value = '';
    newJobTitleHierarchy.value = '';
    await loadJobTitles();
    showToast('Cargo agregado');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    jobTitleSaving.value = false;
  }
}

async function updateJobTitleHierarchy(title, event) {
  const raw = String(event?.target?.value ?? '').trim();
  const next = raw === '' ? null : Number(raw);
  const current = title.hierarchy == null || title.hierarchy === '' ? null : Number(title.hierarchy);
  if (next === current || (Number.isNaN(next) && current == null)) {
    if (event?.target && next == null) event.target.value = '';
    return;
  }
  if (raw !== '' && (!Number.isInteger(next) || next < 1 || next > 999)) {
    showToast('La jerarquía debe ser un número entre 1 y 999, o quedar vacía.', 'error');
    if (event?.target) event.target.value = current == null ? '' : String(current);
    return;
  }
  jobTitleHierarchyBusyId.value = title.id;
  try {
    await request(`/job-titles/${title.id}`, {
      method: 'PUT',
      body: JSON.stringify({ hierarchy: next }),
    });
    await loadJobTitles();
    showToast('Jerarquía actualizada');
  } catch (err) {
    showToast(err.message, 'error');
    if (event?.target) event.target.value = current == null ? '' : String(current);
  } finally {
    jobTitleHierarchyBusyId.value = null;
  }
}

async function removeJobTitle(title) {
  if (Number(title.employeeCount) > 0) {
    showToast(`No se puede desactivar “${title.name}”: hay empleados con ese cargo. Revísalos y cámbiales el cargo primero.`, 'error');
    await openJobTitleEmployees(title);
    return;
  }
  if (!(await askConfirmation(`¿Desactivar el cargo “${title.name}”?`))) return;
  try {
    await request(`/job-titles/${title.id}`, { method: 'DELETE' });
    if (selectedJobTitle.value?.id === title.id) {
      selectedJobTitle.value = null;
      jobTitleEmployees.value = [];
    }
    await loadJobTitles();
  } catch (err) {
    showToast(err.message, 'error');
    const linked = err.details?.employees || [];
    if (err.status === 409 && (linked.length || err.details?.jobTitle)) {
      await openJobTitleEmployees({ ...title, ...(err.details.jobTitle || {}), employeeCount: err.details.employeeCount || linked.length });
    }
  }
}

async function searchGuardians() {
  const q = guardianForm.search.trim();
  if (q.length < 2) { guardianOptions.value = []; return; }
  try { guardianOptions.value = await request(`/guardians?q=${encodeURIComponent(q)}`); }
  catch { guardianOptions.value = []; }
}

function resetGuardianEditor() {
  Object.assign(guardianForm, { guardianId: '', fullName: '', email: '', password: '', nationalId: '', relationshipKind: 'Mamá', relationshipOther: '', search: '' });
  guardianOptions.value = [];
  guardianSelectedExisting.value = null;
  guardianReplaceId.value = '';
  guardianPickMode.value = 'existing';
}

function openGuardianEditor(mode = 'change', replaceId = null) {
  if (!studentProfile.value?.student?.id) return;
  const guardians = studentProfile.value.guardians || [];
  resetGuardianEditor();
  guardianEditorMode.value = guardians.length ? mode : 'add';
  if (replaceId) guardianReplaceId.value = String(replaceId);
  else if (guardians.length === 1 && guardianEditorMode.value === 'change') guardianReplaceId.value = String(guardians[0].id);
  else if (guardians.length > 1 && guardianEditorMode.value === 'change') guardianReplaceId.value = String(guardians[0].id);
  guardianEditorOpen.value = true;
}

function selectExistingGuardian(guardian) {
  guardianSelectedExisting.value = guardian;
  guardianForm.search = guardian.fullName || guardian.full_name || '';
  guardianOptions.value = [];
}

async function saveGuardianEditor() {
  if (!studentProfile.value?.student?.id) return;
  const studentId = studentProfile.value.student.id;
  const isChange = guardianEditorMode.value === 'change' && guardianReplaceId.value;
  if (isChange && !guardianReplaceId.value) {
    showToast('Selecciona qué apoderado quieres reemplazar.', 'error');
    return;
  }
  if (guardianPickMode.value === 'existing' && !guardianSelectedExisting.value) {
    showToast('Busca y selecciona un apoderado existente.', 'error');
    return;
  }
  if (guardianPickMode.value === 'create' && (!guardianForm.fullName || !guardianForm.email || !guardianForm.password)) {
    showToast('Completa nombre, correo y contraseña del nuevo apoderado.', 'error');
    return;
  }
  if (guardianForm.relationshipKind === 'Otro' && !String(guardianForm.relationshipOther || '').trim()) {
    showToast('Especifica el parentesco.', 'error');
    return;
  }
  guardianSaving.value = true;
  try {
    if (isChange) {
      await request(`/students/${studentId}/guardians/${guardianReplaceId.value}`, { method: 'DELETE' });
    }
    const body = guardianPickMode.value === 'existing'
      ? { guardianId: guardianSelectedExisting.value.id, relationship: resolveGuardianRelationship() }
      : {
          fullName: guardianForm.fullName,
          email: guardianForm.email,
          password: guardianForm.password,
          nationalId: guardianForm.nationalId,
          relationship: resolveGuardianRelationship(),
        };
    await request(`/students/${studentId}/guardians`, { method: 'POST', body: JSON.stringify(body) });
    guardianEditorOpen.value = false;
    resetGuardianEditor();
    await loadStudentProfile(studentId, 'apoderados');
    showToast(isChange ? 'Apoderado cambiado' : 'Apoderado asignado');
  } catch (err) {
    showToast(err.message, 'error');
    await loadStudentProfile(studentId, 'apoderados');
  } finally {
    guardianSaving.value = false;
  }
}

async function unlinkGuardian(guardian) {
  if (!studentProfile.value?.student?.id) return;
  if (!(await askConfirmation(`¿Quitar a ${guardian.full_name} como apoderado?`))) return;
  try {
    await request(`/students/${studentProfile.value.student.id}/guardians/${guardian.id}`, { method: 'DELETE' });
    await loadStudentProfile(studentProfile.value.student.id, 'apoderados');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function saveSchoolSettings() {
  managementSaving.value = true;
  error.value = '';
  try {
    const isLevels = schoolTab.value === 'levels';
    const payload = isLevels
      ? {
        name: schoolForm.name,
        rbd: schoolForm.rbd,
        city: schoolForm.city,
        address: schoolForm.address,
        phone: schoolForm.phone,
        email: schoolForm.email,
        website: schoolForm.website,
        schoolType: schoolForm.schoolType,
        educationStages: [...(schoolForm.educationStages || [])],
        removeAssociatedCourses: Boolean(removeAssociatedCoursesOnSave.value),
      }
      : {
        name: schoolForm.name,
        rbd: schoolForm.rbd,
        city: schoolForm.city,
        address: schoolForm.address,
        phone: schoolForm.phone,
        email: schoolForm.email,
        website: schoolForm.website,
        schoolType: schoolForm.schoolType,
        showLogoInSidebar: Boolean(schoolForm.showLogoInSidebar),
        sidebarCollapsible: Boolean(schoolForm.sidebarCollapsible),
        sidebarPanelCollapsible: Boolean(schoolForm.sidebarPanelCollapsible),
        sidebarBgColor: normalizeSidebarHex(schoolForm.sidebarBgColor, SIDEBAR_BG_DEFAULT),
        sidebarTextColor: normalizeSidebarHex(schoolForm.sidebarTextColor, SIDEBAR_TEXT_DEFAULT),
        sidebarFontSize: normalizeSidebarFontSize(schoolForm.sidebarFontSize, SIDEBAR_FONT_SIZE_DEFAULT),
        educationStages: [...(schoolForm.educationStages || [])],
        banking: {
          originBank: schoolForm.banking.originBank,
          originAccountType: schoolForm.banking.originAccountType,
          companyRut: schoolForm.banking.companyRut,
          companyName: schoolForm.banking.companyName,
          ...(schoolForm.banking.originAccountNumber ? { originAccountNumber: schoolForm.banking.originAccountNumber } : {}),
        },
      };
    if (isLevels && removeAssociatedCoursesOnSave.value) {
      // La confirmación ya ocurrió en el modal de impacto al desmarcar el nivel.
    }
    const result = await request('/school', { method: 'PUT', body: JSON.stringify(payload) });
    school.value = result.school;
    if (Array.isArray(result.school?.educationStages)) {
      schoolForm.educationStages = [...result.school.educationStages];
    }
    removeAssociatedCoursesOnSave.value = false;
    if (isLevels) await loadEducationStageSummary();
    showToast(isLevels ? 'Niveles del colegio actualizados' : 'Configuración del colegio actualizada');
  } catch (err) {
    showToast(err.message || 'No se pudo guardar la configuración.', 'error');
    error.value = err.message;
  }
  finally { managementSaving.value = false; }
}

async function saveCommunication() {
  communicationSaving.value = true;
  communicationError.value = '';
  try {
    if (communicationStudentContext.value && (!communicationAudienceSelected('student') || Number(communicationForm.studentId) !== Number(communicationStudentContext.value))) {
      communicationError.value = 'El destinatario debe ser el estudiante de esta ficha.';
      return;
    }
    if (!communicationForm.audiences.length) {
      communicationError.value = 'Selecciona al menos un destinatario.';
      return;
    }
    if (communicationAudienceSelected('student') && !communicationForm.studentId) {
      communicationError.value = 'Selecciona un estudiante.';
      return;
    }
    if (communicationAudienceSelected('guardian') && !communicationForm.guardianId) {
      communicationError.value = 'Selecciona un apoderado.';
      return;
    }
    if (communicationAudienceSelected('course') && !communicationForm.courseId) {
      communicationError.value = 'Selecciona un curso para el comunicado.';
      return;
    }
    if (communicationForm.channel === 'whatsapp' && !whatsappConfigured.value) {
      communicationError.value = 'WhatsApp no está habilitado para este colegio. Configúralo en Integraciones.';
      return;
    }
    if (communicationForm.channel === 'whatsapp' && communicationForm.audiences.length > 1) {
      communicationError.value = 'WhatsApp solo admite un tipo de destinatario por envío.';
      return;
    }
    const courseAudienceId = Number(communicationForm.courseId || 0);
    const payload = {
      subject: communicationForm.subject,
      body: communicationForm.body,
      channel: communicationForm.channel,
      audiences: [...communicationForm.audiences],
      audience: communicationPrimaryAudience.value,
      ...(communicationAudienceSelected('student') ? { studentId: communicationForm.studentId } : {}),
      ...(communicationAudienceSelected('guardian') ? { guardianId: communicationForm.guardianId } : {}),
      ...(communicationAudienceSelected('course') ? { courseId: courseAudienceId } : {}),
    };
    const result = await request('/communications', { method: 'POST', body: JSON.stringify(payload) });
    const sentCount = Number(
      result.delivery?.queued
      ?? result.communication?.recipientCount
      ?? result.communication?.recipient_count
      ?? 0,
    );
    showToast(sentCount > 0
      ? `Comunicado enviado a ${sentCount} persona${sentCount === 1 ? '' : 's'}`
      : (result.delivery ? `${result.delivery.queued} ${communicationForm.channel === 'whatsapp' ? 'mensajes WhatsApp' : 'correos'} en cola para envío` : 'Comunicado publicado correctamente'));
    if (communicationStudentContext.value) {
      await openStudentFicha(communicationStudentContext.value);
    } else if (communicationAudienceSelected('course') && courseAudienceId) {
      await openCourseClassroom(courseAudienceId, 'comunicados');
    } else {
      navigate('Comunicaciones');
    }
    await Promise.all([loadNotifications(), loadModule('communications')]);
  } catch (err) { communicationError.value = err.message; }
  finally { communicationSaving.value = false; }
}

async function syncRouteFromLocation() {
  if (window.location.pathname === '/documentos/asociados') {
    const params = new URLSearchParams(window.location.search);
    if (['studentId', 'employeeId', 'userId'].includes(params.get('type')) && Number(params.get('id')) > 0) {
      await showLinkedDocuments(params.get('type'), Number(params.get('id')), params.get('name') || '');
      return;
    }
  }
  if (window.location.pathname === '/documentos/nuevo') {
    if (!canManageDocuments.value) {
      navigate('Documentos');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const ownerType = params.get('type');
    const ownerId = Number(params.get('id'));
    const owner = ['studentId', 'employeeId', 'userId'].includes(ownerType) && ownerId > 0
      ? { type: ownerType, id: ownerId, name: params.get('name') || '' }
      : null;
    openDocumentUploadPage({ owner, push: false });
    return;
  }
  const studentRoute = studentRouteFromLocation();
  const allowedViews = [...visibleNavigation.value.map((item) => item.label), 'Mi cuenta'];
  if (allowedViews.includes('Finanzas')) allowedViews.push('Más años');
  if (authUser.value?.permissions?.manageUsers) allowedViews.push('Nuevo estudiante', 'Agregar estudiantes', 'Nuevo apoderado', 'Detalle apoderado');
  if (canManageDocuments.value) allowedViews.push('Subir documento', 'Documentos asociados');
  if (authUser.value?.permissions?.manageGrades) allowedViews.push('Nueva calificación');
  if (authUser.value?.permissions?.manageSchool) {
    allowedViews.push('Configurar colegio', 'Detalle del cargo');
    if (!isPublicSchool.value) allowedViews.push('Mensualidades');
  }
  if (authUser.value?.permissions?.manageUsers) allowedViews.push('Historial');
  if (canManageAcademicStructure.value) allowedViews.push('Nuevo curso');
  if (authUser.value?.platformPermissions?.includes('platform.infrastructure.write')) allowedViews.push('Agregar colegio');
  if (canManageHr.value) allowedViews.push('Remuneraciones', 'Nuevo empleado');
  if (canAccessLeave.value) allowedViews.push('Solicitudes', 'Nueva solicitud');
  if (authUser.value?.role === 'teacher') allowedViews.push('Tareas activas', 'Historial de tareas');
  if (!['finance', 'agente_finanzas', 'monitor'].includes(authUser.value?.role)) {
    allowedViews.push('Detalle comunicación');
  }
  if (!['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(authUser.value?.role)) {
    allowedViews.push('Nueva comunicación', 'Destinatarios comunicación');
  }
  if (allowedViews.includes('Libro de clases')) allowedViews.push('Detalle anotación');
  allowedViews.push('Detalle del curso', 'Aula del curso', 'Configurar aula', 'Asignatura del curso', 'Atención');
  if (studentRoute && !financialRoles.includes(authUser.value?.role) && allowedViews.includes('Estudiantes')) {
    await loadStudentProfile(studentRoute.id, studentRoute.section);
    return;
  }
  let route = routeInfoFromLocation();
  const routeYear = Number(new URLSearchParams(window.location.search).get('year'));
  if (Number.isInteger(routeYear) && routeYear >= 2000 && routeYear <= 2100) {
    financeYear.value = routeYear;
    accountabilityYear.value = routeYear;
  } else {
    financeYear.value = new Date().getFullYear();
    accountabilityYear.value = financeYear.value;
  }
  if (!route || !allowedViews.includes(route.view)) {
    const fallback = isPlatformConsole.value
      ? 'Plataforma'
      : financialRoles.includes(authUser.value?.role)
        ? 'Finanzas'
        : (allowedViews.includes('Resumen') ? 'Resumen' : allowedViews[0]);
    route = { view: fallback, section: '' };
    window.history.replaceState({ view: fallback }, '', viewRoutes[fallback]);
  } else if (route.view === 'Inbox de contacto' && (window.location.pathname === '/contactos' || window.location.pathname === '/plataforma/contacto')) {
    window.history.replaceState({ view: 'Inbox de contacto' }, '', '/plataforma/contactos');
  }
  if (route.view === 'Atención') {
    attentionKey.value = route.attention || '';
    attentionSortBy.value = '';
    attentionSortDir.value = 'ASC';
    attentionSearch.value = '';
    const target = `/atencion/${encodeURIComponent(attentionKey.value)}`;
    if (`${window.location.pathname}${window.location.search}` !== target) {
      window.history.replaceState({ view: 'Atención', attention: attentionKey.value }, '', target);
    }
  } else {
    attentionKey.value = '';
  }
  currentView.value = route.view;
  if (route.view === 'Estudiantes' && authUser.value?.role === 'student') {
    await openStudentDirectory();
    return;
  }
  if (route.view === 'Nueva comunicación') {
    const studentId = Number(new URLSearchParams(window.location.search).get('studentId'));
    if (Number.isSafeInteger(studentId) && studentId > 0) {
      await openCommunicationPage({ studentId }, false);
      try {
        const profile = await request(`/students/${studentId}`);
        if (communicationStudentContext.value === studentId) selectCommunicationStudent(profile.student);
      } catch (err) { communicationError.value = err.message; }
    } else if (communicationKeepDraft.value) {
      communicationKeepDraft.value = false;
      currentView.value = 'Nueva comunicación';
    } else {
      await openCommunicationPage(null, false);
    }
  }
  if (route.view === 'Destinatarios comunicación') {
    if (!canListCommunicationRecipients.value) {
      await openCommunicationPage(null, false);
    } else {
      await openCommunicationRecipientsPage(false);
    }
  }
  if (route.view === 'Detalle comunicación') {
    const communicationId = Number(route.communicationId || communicationDetailId.value);
    if (Number.isInteger(communicationId) && communicationId > 0) {
      await openCommunicationDetail(communicationId, false);
    } else {
      navigate('Comunicaciones');
      return;
    }
  }
  if (route.view === 'Detalle anotación') {
    const observationId = Number(route.observationId);
    if (Number.isInteger(observationId) && observationId > 0) {
      await openObservationDetail(observationId, { push: false });
    } else {
      navigate('Libro de clases');
      return;
    }
  }
  if (route.view === 'Apoderados') {
    const legacyId = Number(new URLSearchParams(window.location.search).get('id'));
    if (Number.isSafeInteger(legacyId) && legacyId > 0) {
      window.history.replaceState({ view: 'Detalle apoderado', guardianId: legacyId }, '', `/apoderados/${legacyId}`);
      guardiansFocusId.value = legacyId;
      guardiansKey.value += 1;
      currentView.value = 'Detalle apoderado';
      return;
    }
    guardiansFocusId.value = null;
    guardiansKey.value += 1;
  }
  if (route.view === 'Detalle apoderado') {
    guardiansFocusId.value = Number.isSafeInteger(route.guardianId) && route.guardianId > 0 ? route.guardianId : null;
    guardiansKey.value += 1;
  }
  if (route.view === 'Historial de pagos') {
    if (isPublicSchool.value) {
      navigate('Matrículas');
      return;
    }
    const studentId = new URLSearchParams(window.location.search).get('studentId');
    paymentStudentId.value = studentId && Number(studentId) > 0 ? String(studentId) : '';
  }
  if (route.view === 'RRHH') {
    if (route.employeeId) {
      await openEmployeeById(route.employeeId, { push: false });
    } else {
      employeeStatus.value = route.status || 'active';
      selectedEmployee.value = null;
      const canonicalHrPath = employeeStatus.value === 'inactive' ? '/empleados/historial' : '/empleados/activos';
      if (window.location.pathname !== canonicalHrPath) {
        window.history.replaceState({ view: 'RRHH' }, '', canonicalHrPath);
      }
    }
  }
  if (route.view === 'Agregar estudiantes') {
    coursePageLoading.value = true;
    courseDetailId.value = route.courseId;
    selectedCourse.value = route.courseId;
    try {
      await loadCourseContext(route.courseId);
      await verifyCourseAccess(route.courseId);
      if (!courseAccessDenied.value) await openEnrollmentModal(false);
    } finally {
      coursePageLoading.value = false;
    }
  }
  if (route.view === 'Nuevo curso') await prepareNewCoursePage();
  if (route.view === 'Nuevo empleado') {
    Object.assign(employeeForm, {
      fullName: '',
      position: jobTitles.value[0]?.name || 'Profesor/a',
      contractType: 'Indefinido',
      workModality: 'Full time',
      hiredOn: new Date().toISOString().slice(0, 10),
      netSalary: '',
      monthlySalary: '',
      lockBaseSalary: false,
      afp: employeeRecommendedAfp.value,
      healthSystem: 'Fonasa',
      isaprePlan: 0,
      isapreCode: '',
    });
    employeeSalaryEstimate.value = null;
    employeeSalaryEstimateError.value = '';
    managementError.value = '';
    await loadJobTitles();
    await loadEmployeeHireDefaults();
    if (!employeeForm.position && jobTitles.value[0]?.name) employeeForm.position = jobTitles.value[0].name;
    if (!employeeForm.afp) employeeForm.afp = employeeRecommendedAfp.value;
  }
  if (['Administración', 'Configurar colegio', 'Mensualidades', 'Integraciones', 'Detalle del cargo', 'Historial'].includes(route.view)) expandedNav.value = 'Administración';
  if (['RRHH', 'Nuevo empleado', 'Remuneraciones', 'Solicitudes', 'Nueva solicitud'].includes(route.view)) expandedNav.value = 'Recursos humanos';
  if (['Tareas activas', 'Historial de tareas'].includes(route.view)) expandedNav.value = 'Académico';
  if (route.view === 'Detalle anotación') expandedNav.value = 'Académico';
  if (route.view === 'Detalle del cargo') {
    schoolTab.value = 'jobs';
    const titleId = Number(route.jobTitleId);
    if (!Number.isInteger(titleId) || titleId < 1) {
      openSchoolSettingsPage({ tab: 'jobs' });
      return;
    }
    await loadJobTitles();
    const title = jobTitles.value.find((row) => Number(row.id) === titleId) || { id: titleId, name: 'Cargo' };
    await openJobTitleEmployees(title, { push: false });
  }
  if (route.view === 'Nueva calificación') {
    const studentId = Number(new URLSearchParams(window.location.search).get('studentId')) || '';
    if (studentId) await loadStudentProfile(studentId);
    currentView.value = 'Nueva calificación';
    await prepareGradeForm(studentId);
  }
  if (route.view === 'Configurar colegio') {
    Object.assign(schoolForm, {
      name: school.value.name || '', slug: school.value.slug || '', rbd: school.value.rbd || '',
      city: school.value.city || '',
      address: school.value.address || '',
      phone: school.value.phone || '', email: school.value.email || '', website: school.value.website || '',
      schoolType: school.value.schoolType || 'subvencionado',
      showLogoInSidebar: school.value.showLogoInSidebar !== false,
      sidebarCollapsible: school.value.sidebarCollapsible !== false,
      sidebarPanelCollapsible: school.value.sidebarPanelCollapsible !== false,
      sidebarBgColor: normalizeSidebarHex(school.value.sidebarBgColor, SIDEBAR_BG_DEFAULT),
      sidebarTextColor: normalizeSidebarHex(school.value.sidebarTextColor, SIDEBAR_TEXT_DEFAULT),
      sidebarFontSize: normalizeSidebarFontSize(school.value.sidebarFontSize, SIDEBAR_FONT_SIZE_DEFAULT),
      educationStages: Array.isArray(school.value.educationStages) && school.value.educationStages.length
        ? [...school.value.educationStages]
        : ['prekinder', 'kinder', 'basica', 'media'],
      banking: {
        originBank: school.value.banking?.originBank || '',
        originAccountType: school.value.banking?.originAccountType || '',
        originAccountNumber: '',
        originAccountNumberMasked: school.value.banking?.originAccountNumberMasked || '',
        companyRut: school.value.banking?.companyRut || '',
        companyName: school.value.banking?.companyName || school.value.name || '',
      },
    });
    if (Array.isArray(school.value.educationStageOptions) && school.value.educationStageOptions.length) {
      educationStageOptions.value = school.value.educationStageOptions;
    }
    loadJobTitles();
    loadSchoolLogoPreview();
    setSchoolTab(route.schoolTab || 'institutional', { push: false });
  }
  if (route.view === 'Integraciones') {
    setIntegrationsTab(route.integrationsTab || 'whatsapp', { push: false });
  }
  if (['Detalle del curso', 'Aula del curso', 'Asignatura del curso'].includes(route.view)) {
    coursePageLoading.value = true;
    courseDetailId.value = route.courseId;
    selectedCourse.value = route.courseId;
    classroomSection.value = ['foros', 'archivos', 'comunicados', 'enlaces'].includes(route.section) ? route.section : 'tareas';
    classroomForumId.value = route.forumId || null;
    try {
      await loadCourseContext(route.courseId);
      await verifyCourseAccess(route.courseId);
    } finally {
      coursePageLoading.value = false;
    }
  }
  if (route.view === 'Configurar aula') {
    coursePageLoading.value = true;
    courseDetailId.value = route.courseId;
    selectedCourse.value = route.courseId;
    classroomConfigTab.value = classroomConfigTabFromPath(route.section);
    try {
    if (!canOpenClassroomConfig.value) {
      currentView.value = 'Detalle del curso';
      window.history.replaceState({ view: 'Detalle del curso', courseId: route.courseId }, '', `/cursos/${route.courseId}`);
      await loadCourseContext(route.courseId);
      await verifyCourseAccess(route.courseId);
    } else {
      if ((classroomConfigTab.value === 'head' || classroomConfigTab.value === 'subjects' || classroomConfigTab.value === 'danger') && !canManageAcademicStructure.value) {
        classroomConfigTab.value = 'forums';
      }
      if (classroomConfigTab.value === 'forums' && !canConfigureCourseForum.value) {
        classroomConfigTab.value = canManageAcademicStructure.value ? 'head' : 'forums';
      }
      const canonical = `/cursos/${route.courseId}/configurar/${classroomConfigTabPath(classroomConfigTab.value)}`;
      if (window.location.pathname !== canonical) {
        window.history.replaceState(
          { view: 'Configurar aula', courseId: route.courseId, section: classroomConfigTabPath(classroomConfigTab.value) },
          '',
          canonical
        );
      }
      await loadCourseContext(route.courseId);
      await verifyCourseAccess(route.courseId);
      if (!courseAccessDenied.value) {
        if (classroomConfigTab.value === 'head' || classroomConfigTab.value === 'subjects') {
          if (!staffUsers.value.length) await loadStaffUsers();
          if (classroomConfigTab.value === 'head') {
            classroomHeadTeachers.value = parseTeacherList(courseDetailHeadTeacher.value);
          } else {
            initClassroomSubjectTeachers();
            await openFocusedClassroomSubject();
          }
        } else if (classroomConfigTab.value === 'forums') {
          await loadClassroomForumSettings(route.courseId);
        }
      }
    }
    } finally {
      coursePageLoading.value = false;
    }
  }
  activeModuleSection.value = route.section;
  if (route.view !== 'Nueva calificación') studentProfile.value = null;
  search.value = '';
  if (route.view === 'Mi cuenta') {
    Object.assign(accountForm, {
      fullName: authUser.value.fullName,
      username: authUser.value.username,
      position: authUser.value.position || '',
      phone: authUser.value.phone || '',
      whatsappOptIn: !!authUser.value.whatsappOptIn,
      askSchoolOnLogin: authUser.value.askSchoolOnLogin !== false,
      preferredSchoolId: authUser.value.preferredSchoolId || (authUser.value.memberships?.length ? authUser.value.schoolId : null),
    });
    Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
    accountError.value = '';
    passwordError.value = '';
    setAccountTab(route.accountTab || 'profile', { push: false });
    loadSignaturePreview();
  }
  if (route.view === 'Administración') {
    await loadStaffUsers();
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/administracion') {
      window.history.replaceState({ view: 'Administración' }, '', '/administracion/equipo');
    }
    if (route.staffFormMode === 'new') {
      openStaffForm(null, { push: false });
    } else if (Number.isInteger(route.staffUserId) && route.staffUserId > 0) {
      const user = staffUsers.value.find((row) => Number(row.id) === Number(route.staffUserId));
      if (user) openStaffForm(user, { push: false });
      else {
        showToast('No encontramos esa cuenta del equipo.', 'error');
        closeStaffForm({ push: false });
      }
    } else {
      staffFormOpen.value = false;
      staffError.value = '';
    }
  }
  if (moduleKeys[route.view]) await loadModule(moduleKeys[route.view]);
  if (route.view === 'Finanzas' && route.section === 'Rendición de cuentas' && canManageAccountability.value) await loadAccountability();
  if (isPlatformConsole.value && ['Plataforma', 'Colegios demo', 'Colegios', 'Agregar colegio', 'Buscar gente', 'Cuentas', 'Inbox de contacto', 'Correo SMTP', 'Plataforma pagos'].includes(route.view)) {
    loading.value = false;
  }
}

function backToStudents() {
  if (authUser.value?.role === 'student') {
    openStudentDirectory();
    return;
  }
  navigate('Estudiantes');
}

function retryCurrentView() {
  const studentRoute = studentRouteFromLocation();
  if (studentRoute) loadStudentProfile(studentRoute.id, studentRoute.section);
  else if (activeModuleKey.value) loadModule(activeModuleKey.value);
  else loadData();
}

function financeSectionSlug(title) {
  return Object.entries(financeSectionRoutes).find(([, section]) => section === title)?.[0] || '';
}

function navigateFinanceSection(title = '') {
  activeModuleSection.value = title;
  if (title === 'Rendición de cuentas' && accountabilityYear.value !== financeYear.value) {
    accountabilityYear.value = financeYear.value;
  }
  const slug = title ? financeSectionSlug(title) : '';
  const params = new URLSearchParams();
  if (financeYear.value !== new Date().getFullYear()) params.set('year', String(financeYear.value));
  const path = `${slug ? `/finanzas/${slug}` : '/finanzas'}${params.toString() ? `?${params}` : ''}`;
  if (`${window.location.pathname}${window.location.search}` !== path) window.history.pushState({ view: 'Finanzas', section: title }, '', path);
  if (title === 'Rendición de cuentas' && canManageAccountability.value) loadAccountability();
}

async function loadAccountability() {
  accountabilityLoading.value = true;
  accountabilityError.value = '';
  try { accountabilityData.value = await request(`/finance/accountability?year=${accountabilityYear.value}`); }
  catch (err) { accountabilityError.value = err.message; }
  finally { accountabilityLoading.value = false; }
}

function openAccountabilityForm() {
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  Object.assign(accountabilityForm, {
    period: `${accountabilityYear.value}-${month}`, movementType: 'income', fundingSource: 'Subvención general',
    category: 'Subvención recibida', documentType: 'Liquidación', documentNumber: '',
    counterparty: 'Ministerio de Educación', counterpartyTaxId: '', description: '', amount: '', status: 'draft'
  });
  accountabilityError.value = '';
  accountabilityModalOpen.value = true;
}

async function saveAccountabilityEntry() {
  accountabilitySaving.value = true;
  accountabilityError.value = '';
  try {
    await request('/finance/accountability', { method: 'POST', body: JSON.stringify(accountabilityForm) });
    accountabilityYear.value = Number(accountabilityForm.period.slice(0, 4));
    accountabilityModalOpen.value = false;
    showToast('Movimiento agregado a la rendición');
    await loadAccountability();
  } catch (err) { accountabilityError.value = err.message; }
  finally { accountabilitySaving.value = false; }
}

async function updateAccountabilityStatus(entry) {
  const previous = entry.status === 'verified' ? 'draft' : 'verified';
  try {
    const result = await request(`/finance/accountability/${entry.id}/status`, { method: 'PUT', body: JSON.stringify({ status: entry.status }) });
    entry.status = result.record.status;
    await loadAccountability();
    showToast(entry.status === 'verified' ? 'Movimiento marcado como revisado' : 'Movimiento devuelto a borrador');
  } catch (err) {
    entry.status = previous;
    showToast(err.message || 'No fue posible actualizar el estado.', 'error');
  }
}

async function exportAccountabilityPdf() {
  try {
    const response = await reports.accountability(accountabilityYear.value);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'No fue posible generar el PDF.');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `rendicion-cuentas-${accountabilityYear.value}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Rendición de cuentas exportada');
  } catch (err) {
    showToast(err.message || 'No fue posible generar el PDF.', 'error');
  }
}

function openStaffForm(user = null, { push = true } = {}) {
  Object.assign(staffForm, user
    ? {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      position: user.position || '',
      password: '',
      generatePassword: false,
      active: user.teamActive !== false && user.active !== false,
      teamActive: user.teamActive !== false && user.teamActive !== 0 && user.active !== false,
      platformAccess: user.platformAccess !== false && user.platformAccess !== 0,
      permissions: { manageUsers: false, manageGrades: true, viewReports: false, manageSchool: false, manageHr: false, manageFinance: false, approveLeave: false, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false, ...user.permissions },
    }
    : {
      id: null,
      username: '',
      fullName: '',
      role: 'teacher',
      position: '',
      password: '',
      generatePassword: true,
      active: true,
      teamActive: true,
      platformAccess: true,
      permissions: { manageUsers: false, manageGrades: true, viewReports: false, manageSchool: false, manageHr: false, manageFinance: false, approveLeave: false, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false },
    });
  staffFormOpen.value = true;
  staffError.value = '';
  currentView.value = 'Administración';
  expandedNav.value = 'Administración';
  const path = user?.id ? `/administracion/equipo/${user.id}` : '/administracion/equipo/nuevo';
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (currentPath !== path) {
    const state = { view: 'Administración', staffUserId: user?.id || null, staffFormMode: user ? 'edit' : 'new' };
    if (push) window.history.pushState(state, '', path);
    else window.history.replaceState(state, '', path);
  }
}

function closeStaffForm({ push = true } = {}) {
  staffFormOpen.value = false;
  staffError.value = '';
  const path = '/administracion/equipo';
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (currentView.value === 'Administración' && currentPath !== path) {
    const state = { view: 'Administración' };
    if (push) window.history.pushState(state, '', path);
    else window.history.replaceState(state, '', path);
  }
}

function openManagement(type, course = '', opts = {}) {
  if (type === 'course') return openNewCoursePage();
  if (type === 'document') return openDocumentUploadPage();
  if (type === 'employee') return openNewEmployeePage();
  managementModal.value = type;
  managementError.value = '';
  if (type === 'subject') {
    Object.assign(subjectForm, { name: '', code: '', sigeSubjectCode: '' });
    if (!Object.keys(sigeSubjectDefaults.value || {}).length) loadCourseTemplates();
  }
  if (type === 'courseAssignment' || type === 'headTeacherAssignment') {
    if (!staffUsers.value.length) loadStaffUsers();
    teacherAssignPickerQuery.value = '';
    Object.assign(courseAssignmentForm, {
      courseId: Number(course.id),
      courseName: type === 'headTeacherAssignment'
        ? `${course.name} · ${course.section}`
        : `${course.name} · ${course.section} · ${course.subject}`,
      teachers: type === 'headTeacherAssignment'
        ? parseTeacherList(course.head_teacher || course.headTeacher || courseDetailHeadTeacher.value || '')
        : parseTeacherList(course.teacher || ''),
      mode: type === 'headTeacherAssignment' ? 'head' : 'subject',
    });
  }
  if (['course'].includes(type) && authUser.value.permissions?.manageUsers && !staffUsers.value.length) loadStaffUsers();
  if (type === 'material') Object.assign(materialForm, { courseId: course, title: '', file: null });
  if (type === 'invoice') Object.assign(invoiceForm, { number: '', studentId: '', supplierId: '', amount: '', dueOn: new Date().toISOString().slice(0, 10), status: 'pending', file: null });
  if (['incident', 'observation'].includes(type)) {
    const prefillStudentId = opts.studentId ? Number(opts.studentId) : '';
    Object.assign(studentRecordForm, {
      id: null,
      studentId: prefillStudentId || '',
      courseId: '',
      detail: '',
      kind: 'negative',
      severity: 'medium',
      status: 'open',
      occurredOn: new Date().toISOString().slice(0, 10),
      file: null,
      attachmentName: '',
      removeAttachment: false,
    });
    observationCourseOptions.value = [];
    if (prefillStudentId && studentProfile.value?.student?.id === prefillStudentId) {
      studentRecordSearch.value = `${studentProfile.value.student.first_name} ${studentProfile.value.student.last_name}`.trim();
      refreshObservationCourses(prefillStudentId);
    } else {
      studentRecordSearch.value = '';
    }
  }
}

function openIncidentCase(row) {
  if (!canAddStudentRecord.value || !row?.id) return;
  managementModal.value = 'incident';
  managementError.value = '';
  Object.assign(studentRecordForm, {
    id: row.id,
    studentId: row.studentId || '',
    detail: row.detail || '',
    kind: 'negative',
    severity: ['low', 'medium', 'high'].includes(row.severity) ? row.severity : 'medium',
    status: ['open', 'in_progress', 'closed'].includes(row.status) ? row.status : 'open',
    occurredOn: String(row.occurredOn || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
    file: null,
    attachmentName: '',
    removeAttachment: false,
  });
  studentRecordSearch.value = row.studentName || '';
}

function openObservationCase(row) {
  if (!canManageObservation(row)) return;
  managementModal.value = 'observation';
  managementError.value = '';
  const attachmentName = observationHasAttachment(row) ? String(row.attachmentName || '').trim() : '';
  Object.assign(studentRecordForm, {
    id: row.id,
    studentId: row.studentId || '',
    courseId: row.courseId ? String(row.courseId) : '',
    detail: row.detail || '',
    kind: ['positive', 'negative', 'general'].includes(row.kind) ? row.kind : 'general',
    severity: 'medium',
    status: 'open',
    occurredOn: new Date().toISOString().slice(0, 10),
    file: null,
    attachmentName,
    removeAttachment: false,
  });
  studentRecordSearch.value = row.studentName || '';
  refreshObservationCourses(row.studentId, row.courseId);
}

async function openObservationDetail(rowOrId, { push = true } = {}) {
  const id = typeof rowOrId === 'object' ? Number(rowOrId?.id) : Number(rowOrId);
  if (!Number.isInteger(id) || id < 1) return;
  currentView.value = 'Detalle anotación';
  observationDetailLoading.value = true;
  observationDetailError.value = '';
  observationDetail.value = null;
  expandedNav.value = 'Académico';
  sidebarOpen.value = false;
  const path = `/libro-de-clases/anotaciones/${id}`;
  if (push) window.history.pushState({ view: 'Detalle anotación', observationId: id }, '', path);
  else window.history.replaceState({ view: 'Detalle anotación', observationId: id }, '', path);
  try {
    observationDetail.value = await request(`/classbook/observations/${id}`);
  } catch (err) {
    observationDetailError.value = err.message || 'No se pudo cargar la anotación.';
  } finally {
    observationDetailLoading.value = false;
  }
}

function editObservationFromDetail() {
  if (!observationDetail.value || !canManageObservation(observationDetail.value)) return;
  openObservationCase(observationDetail.value);
}

async function deleteObservationFromDetail() {
  if (!observationDetail.value || !canManageObservation(observationDetail.value)) return;
  const deleted = await deleteObservation(observationDetail.value);
  if (deleted && currentView.value === 'Detalle anotación') {
    navigate('Libro de clases');
  }
}

async function deleteObservation(row) {
  if (!canManageObservation(row)) return false;
  const ok = await askConfirmation(`¿Eliminar la anotación de ${row.studentName || 'este estudiante'}?`);
  if (!ok) return false;
  try {
    await request(`/classbook/observations/${row.id}`, { method: 'DELETE' });
    showToast('Anotación eliminada');
    await loadModule('classbook');
    if (studentProfile.value?.student?.id === Number(row.studentId)) {
      await loadStudentProfile(row.studentId, studentProfileSection.value);
    }
    return true;
  } catch (err) {
    error.value = err.message;
    return false;
  }
}

async function updateIncidentStatus(row, event) {
  const previous = row.status;
  const status = event?.target?.value;
  row.status = status;
  try {
    await request(`/incidents/${row.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast('Estado del caso actualizado');
  } catch (err) {
    row.status = previous;
    showToast(err.message || 'No se pudo actualizar el estado.', 'error');
  }
}

async function updateCitationStatus(row, event) {
  const previous = row.status;
  const status = event?.target?.value;
  row.status = status;
  try {
    await request(`/citations/${row.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast('Estado de la citación actualizado');
  } catch (err) {
    row.status = previous;
    showToast(err.message || 'No se pudo actualizar la citación.', 'error');
  }
}

async function saveManagement() {
  managementSaving.value = true;
  managementError.value = '';
  const type = managementModal.value
    || (currentView.value === 'Nuevo estudiante' ? 'student'
      : currentView.value === 'Nuevo curso' ? 'course'
        : currentView.value === 'Nuevo empleado' ? 'employee'
          : currentView.value === 'Subir documento' ? 'document'
            : '');
  try {
    if (['incident', 'observation'].includes(type)) {
      if (!Number(studentRecordForm.studentId)) throw new Error('Selecciona un estudiante de la búsqueda.');
      if (type === 'observation' && !Number(studentRecordForm.courseId)) {
        throw new Error('Selecciona el curso o asignatura donde ocurrió la anotación.');
      }
      if (type === 'incident' && studentRecordForm.id) {
        await request(`/coexistence/incidents/${studentRecordForm.id}`, { method: 'PUT', body: JSON.stringify(studentRecordForm) });
      } else if (type === 'observation') {
        const body = new FormData();
        body.append('studentId', String(studentRecordForm.studentId));
        body.append('courseId', String(studentRecordForm.courseId));
        body.append('kind', studentRecordForm.kind);
        body.append('detail', studentRecordForm.detail);
        if (studentRecordForm.file) body.append('file', studentRecordForm.file);
        if (studentRecordForm.id && studentRecordForm.removeAttachment && !studentRecordForm.file) {
          body.append('removeAttachment', '1');
        }
        const observationId = studentRecordForm.id;
        await request(
          observationId ? `/classbook/observations/${observationId}` : '/classbook/observations',
          { method: observationId ? 'PUT' : 'POST', body },
        );
      } else {
        await request('/coexistence/incidents', { method: 'POST', body: JSON.stringify(studentRecordForm) });
      }
    }
    if (type === 'citation') {
      if (!Number(citationForm.studentId)) throw new Error('Selecciona un estudiante.');
      if (!Number(citationForm.guardianId)) throw new Error('Selecciona un apoderado.');
      if (!String(citationForm.reason || '').trim()) throw new Error('Indica el motivo de la citación.');
      const result = await request('/citations', { method: 'POST', body: JSON.stringify(citationForm) });
      showToast(result.mail?.message || 'Citación creada');
    }
    if (type === 'student') {
      const { relationshipKind, relationshipOther, ...studentPayload } = studentForm;
      const result = await request('/students', {
        method: 'POST',
        body: JSON.stringify({
          ...studentPayload,
          relationship: resolveGuardianRelationship(relationshipKind, relationshipOther),
        }),
      });
      generatedCredentials.value = result.temporaryPassword
        ? {
            username: result.username,
            password: result.temporaryPassword,
            recipient: 'estudiante',
            deliveryMessage: 'Debes compartir estas credenciales directamente con el estudiante o su apoderado.'
          }
        : null;
      showToast(result.guardianEmail?.sent
        ? 'Estudiante creado y acceso enviado al apoderado'
        : result.guardianEmail ? `Estudiante creado; correo pendiente: ${result.guardianEmail.reason}` : 'Estudiante creado correctamente');
      const createdId = Number(result.student?.id);
      if (currentView.value === 'Nuevo estudiante' && Number.isInteger(createdId) && createdId > 0) {
        managementModal.value = '';
        await openStudentFicha(createdId);
        return;
      }
    }
    if (type === 'subject') {
      const result = await request('/subjects', { method: 'POST', body: JSON.stringify(subjectForm) });
      subjects.value = [...subjects.value, result.subject].sort((a, b) => a.name.localeCompare(b.name, 'es'));
      showToast(`Asignatura “${result.subject.name}” creada`);
    }
    if (type === 'course') {
      if (!courseForm.subjects.length && !courseForm.customSubjects.length) {
        throw new Error(isCustomCourseTemplate.value
          ? 'Agrega al menos un ramo personalizado.'
          : 'Selecciona al menos una asignatura de la plantilla o agrega una personalizada.');
      }
      const templateSubjects = selectedCourseTemplate.value?.subjects || [];
      const subjectsFromTemplate = courseForm.subjects.filter((name) => templateSubjects.includes(name));
      const subjectsFromCatalog = courseForm.subjects
        .filter((name) => !templateSubjects.includes(name))
        .map((name) => ({ name, color: '' }));
      const result = await request('/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...courseForm,
          color: courseForm.color || undefined,
          subjects: subjectsFromTemplate,
          customSubjects: [
            ...courseForm.customSubjects.map((item) => ({
              name: customSubjectName(item),
              color: customSubjectColor(item) || undefined,
            })),
            ...subjectsFromCatalog,
          ],
        }),
      });
      courses.value = [...result.courses.map(course => ({ ...course, student_count: 0, average: null })), ...courses.value];
      const count = result.courses.length;
      showToast(count === 1 ? `Curso creado con 1 asignatura` : `Curso creado con ${count} asignaturas`);
    }
    if (managementModal.value === 'courseAssignment' || managementModal.value === 'headTeacherAssignment') {
      if (courseAssignmentForm.mode === 'head') {
        const selected = parseTeacherList(courseAssignmentForm.teachers);
        const result = await request(`/courses/${courseAssignmentForm.courseId}/head-teacher`, {
          method: 'PUT',
          body: JSON.stringify({ headTeachers: selected }),
        });
        const headTeacherName = result.headTeacher || formatTeacherList(selected) || null;
        const siblingIds = new Set((result.courses || []).map((row) => Number(row.id)));
        if (!siblingIds.size) siblingIds.add(Number(courseAssignmentForm.courseId));
        courses.value = courses.value.map((row) => (
          siblingIds.has(Number(row.id)) ? { ...row, head_teacher: headTeacherName, headTeacher: headTeacherName } : row
        ));
        if (courseDetail.value && siblingIds.has(Number(courseDetail.value.id))) {
          courseDetail.value = { ...courseDetail.value, head_teacher: headTeacherName, headTeacher: headTeacherName };
        }
        courseGroups.value = await coursesApi.list({ grouped: 'true' });
        showToast(headTeacherName ? `Profesores jefes: ${headTeacherName}` : 'Curso sin profesor jefe');
        } else {
        const selected = parseTeacherList(courseAssignmentForm.teachers);
        const result = await request(`/courses/${courseAssignmentForm.courseId}/teacher`, {
          method: 'PUT',
          body: JSON.stringify({ teachers: selected }),
        });
        const teacherName = result.course?.teacher || formatTeacherList(selected) || null;
        courses.value = courses.value.map((row) => (
          Number(row.id) === Number(courseAssignmentForm.courseId) ? { ...row, teacher: teacherName } : row
        ));
        if (courseDetail.value && Number(courseDetail.value.id) === Number(courseAssignmentForm.courseId)) {
          courseDetail.value = { ...courseDetail.value, teacher: teacherName };
        }
        courseGroups.value = await coursesApi.list({ grouped: 'true' });
        showToast(teacherName ? `Profesores de asignatura: ${teacherName}` : 'Profesor quitado de la asignatura');
      }
    }
    if (type === 'employee') {
      if (employeeForm.contractType === 'Honorarios') {
        employeeForm.monthlySalary = Number(employeeForm.netSalary) || Number(employeeForm.monthlySalary) || 0;
      } else if (!Number(employeeForm.monthlySalary) && Number(employeeForm.netSalary)) {
        await refreshEmployeeSalaryEstimate();
      }
      if (!Number(employeeForm.monthlySalary)) throw new Error('Ingresa el sueldo líquido para calcular el base.');
      if (employeeForm.contractType !== 'Honorarios' && employeeForm.healthSystem === 'Isapre' && !employeeForm.isapreCode) {
        throw new Error('Selecciona la Isapre del trabajador.');
      }
      const payload = {
        fullName: employeeForm.fullName,
        position: employeeForm.position,
        contractType: employeeForm.contractType,
        workModality: employeeForm.workModality,
        hiredOn: employeeForm.hiredOn,
        monthlySalary: Number(employeeForm.monthlySalary),
        payrollProfile: employeeForm.contractType === 'Honorarios' ? null : employeePayrollProfilePayload(),
      };
      const created = await request('/hr/employees', { method: 'POST', body: JSON.stringify(payload) });
      const createdId = Number(created?.employee?.id || created?.id || 0);
      showToast('Empleado agregado correctamente');
      managementModal.value = '';
      if (Number.isInteger(createdId) && createdId > 0) {
        await openEmployee({
          id: createdId,
          fullName: employeeForm.fullName,
          position: employeeForm.position,
          contractType: employeeForm.contractType,
          workModality: employeeForm.workModality,
          hiredOn: employeeForm.hiredOn,
          monthlySalary: Number(employeeForm.monthlySalary),
        });
      } else {
        openEmployeeList('active');
        await loadModule('hr');
      }
      return;
    }
    if (managementModal.value === 'material') {
      const body = new FormData(); body.append('title', materialForm.title); body.append('file', materialForm.file);
      await request(`/courses/${materialForm.courseId}/materials`, { method: 'POST', body });
      await openCourseClassroom(materialForm.courseId, 'archivos');
    }
    if (managementModal.value === 'document' || type === 'document') {
      if (!documentForm.file) throw new Error('Selecciona un archivo para subir.');
      if (!String(documentForm.name || '').trim()) throw new Error('Indica el nombre del documento.');
      const body = new FormData();
      body.append('name', documentForm.name);
      body.append('kind', documentForm.kind);
      for (const key of ['studentId', 'employeeId', 'userId']) if (documentForm[key]) body.append(key, documentForm[key]);
      body.append('file', documentForm.file);
      await request('/documents', { method: 'POST', body });
      if (linkedDocumentOwner.value && (documentForm.studentId || documentForm.employeeId || documentForm.userId)) {
        const owner = linkedDocumentOwner.value;
        await showLinkedDocuments(owner.type, owner.id, owner.name);
      } else if (currentView.value === 'Subir documento') {
        navigate('Documentos');
      }
    }
    if (managementModal.value === 'invoice') {
      const body = new FormData();
      for (const [key, value] of Object.entries(invoiceForm)) if (value !== null) body.append(key, value);
      await request('/finance/invoices', { method: 'POST', body });
    }
    if (managementModal.value === 'payment') {
      const invoiceId = Number(paymentForm.invoiceId || 0);
      const payload = {
        amount: Number(paymentForm.amount),
        paidAt: paymentForm.paidAt,
        method: paymentForm.method,
      };
      if (invoiceId > 0) payload.invoiceId = invoiceId;
      else payload.studentId = Number(paymentForm.studentId);
      await request('/finance/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (paymentForm.studentId) paymentStudentId.value = String(paymentForm.studentId);
      await loadEnrollmentPayments();
      showToast(invoiceId > 0 ? 'Pago acreditado correctamente' : 'Abono registrado correctamente');
    }
    managementModal.value = '';
    if (type === 'course') navigate('Cursos');
    if (type === 'student' && currentView.value === 'Nuevo estudiante') navigate('Estudiantes');
    if (type === 'document') showToast('Archivo subido correctamente');
    else if (type === 'observation') showToast(studentRecordForm.id ? 'Anotación actualizada' : 'Anotación registrada');
    else if (type === 'incident') showToast(studentRecordForm.id ? 'Caso actualizado' : 'Caso registrado');
    else if (!['student', 'subject', 'course', 'payment', 'citation', 'employee'].includes(type)) showToast('Información guardada correctamente');
    if (['incident', 'observation'].includes(type)) {
      await loadModule(type === 'incident' ? 'coexistence' : 'classbook');
      if (type === 'observation' && studentProfile.value?.student?.id === Number(studentRecordForm.studentId)) {
        await loadStudentProfile(studentRecordForm.studentId, studentProfileSection.value === 'anotaciones' ? 'anotaciones' : studentProfileSection.value);
      }
      if (type === 'observation' && currentView.value === 'Detalle anotación' && Number(studentRecordForm.id) > 0) {
        await openObservationDetail(studentRecordForm.id, { push: false });
      }
    }
    else if (type === 'citation') await loadModule('citations');
    else if (type === 'employee') await loadModule('hr');
    else if (type === 'document' && currentView.value === 'Documentos') await loadModule('documents');
    else if (type === 'invoice') await loadModule('finance');
    else if (!['material', 'payment', 'document'].includes(type)) await loadData();
  } catch (err) {
    if (type === 'student') {
      managementError.value = err.message;
      showToast(err.message || 'Revisa el formato de los datos del estudiante.', 'error');
      return;
    }
    if (type === 'document' || currentView.value === 'Subir documento') {
      managementError.value = err.message;
      showToast(err.message || 'No se pudo subir el archivo.', 'error');
      return;
    }
    if (managementModal.value || ['Nuevo curso', 'Nuevo empleado'].includes(currentView.value)) managementError.value = err.message;
    else error.value = err.message;
  }
  finally { managementSaving.value = false; }
}

function showStudentValidationSnackbar(event) {
  const label = event.target?.closest?.('label')?.querySelector?.('span')?.textContent?.trim();
  const message = event.target?.validationMessage || 'Revisa el formato de los datos del estudiante.';
  showToast(`${label ? `${label}: ` : ''}${message}`, 'error');
}

function showDocumentValidationSnackbar(event) {
  const label = event.target?.closest?.('label')?.querySelector?.('span')?.childNodes?.[0]?.textContent?.trim()
    || event.target?.closest?.('label')?.querySelector?.('span')?.textContent?.trim();
  const message = event.target?.validationMessage || 'Revisa el archivo y los datos del documento.';
  showToast(`${label ? `${label}: ` : ''}${message}`, 'error');
}

async function openEnrollmentModal(push = true) {
  currentView.value = 'Agregar estudiantes';
  if (push) window.history.pushState({}, '', `/cursos/${courseDetailId.value}/estudiantes/agregar`);
  enrollmentLoading.value = true;
  enrollmentError.value = '';
  enrollmentSearch.value = '';
  selectedEnrollmentIds.value = [];
  try {
    const enrolledStudents = await request(`/students?courseId=${courseDetailId.value}`);
    enrollmentCandidates.value = [];
    enrolledEnrollmentIds.value = enrolledStudents.map((student) => student.id);
  } catch (err) {
    enrollmentError.value = err.message;
  } finally {
    enrollmentLoading.value = false;
  }
}

async function saveCourseEnrollments() {
  if (!selectedEnrollmentIds.value.length) {
    enrollmentError.value = 'Selecciona al menos un estudiante.';
    return;
  }
  enrollmentSaving.value = true;
  enrollmentError.value = '';
  try {
    const result = await request(`/courses/${courseDetailId.value}/enrollments`, {
      method: 'POST',
      body: JSON.stringify({ studentIds: selectedEnrollmentIds.value }),
    });
    await openCourseDetail(courseDetailId.value);
    showToast(result.added === 1 ? 'Estudiante agregado al curso' : `${result.added} estudiantes agregados al curso`);
    await loadData();
  } catch (err) {
    enrollmentError.value = err.message;
  } finally {
    enrollmentSaving.value = false;
  }
}

async function showMaterials(courseId) {
  materialCourseId.value = courseId;
  try { materials.value = await request(`/courses/${courseId}/materials`); }
  catch (err) { materials.value = []; error.value = err.message; }
}

async function downloadMaterial(item) {
  try {
    const response = await download(`/materials/${item.id}/download`);
    if (!response.ok) throw new Error('No fue posible descargar el material.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = item.originalName; link.click(); URL.revokeObjectURL(url);
  } catch (err) { error.value = err.message; }
}

async function saveStudentCourse(courseId = studentCourseId.value, status = 'active') {
  const wholeClass = arguments.length === 0;
  if (!courseId || studentCourseSaving.value) return;
  if (wholeClass && hasActiveEnrollment.value) {
    error.value = 'El estudiante ya tiene un curso. Retíralo antes de matricularlo en otro.';
    return;
  }
  studentCourseSaving.value = true;
  const studentId = studentProfile.value.student.id;
  const stayOnSection = studentProfileSection.value || 'ficha';
  try {
    if (wholeClass) await request(`/courses/${courseId}/enrollments`, { method: 'POST', body: JSON.stringify({ studentIds: [studentId] }) });
    else await request(`/students/${studentId}/courses/${courseId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    studentCourseId.value = '';
    await loadStudentProfile(studentId, stayOnSection, { soft: true });
    await loadData({ soft: true }).catch(() => {});
    showToast(wholeClass
      ? 'Estudiante matriculado en el curso'
      : status === 'exempt'
        ? 'Estudiante eximido de la asignatura; sus notas se conservan'
        : 'Asignatura reincorporada');
  } catch (err) { error.value = err.message; }
  finally { studentCourseSaving.value = false; }
}

async function downloadInvoice(item) {
  try {
    const response = await download(`/finance/invoices/${item.id}/download`);
    if (!response.ok) throw new Error('No fue posible descargar el adjunto.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = item.attachmentName; link.click(); URL.revokeObjectURL(url);
  } catch (err) { error.value = err.message; }
}

async function previewFile(path, fallbackName = 'documento') {
  try {
    const response = await download(`${path}`);
    if (!response.ok) throw new Error('No fue posible abrir la vista previa.');
    const blob = await response.blob();
    const url = URL.createObjectURL(new Blob([blob], { type: response.headers.get('content-type') || blob.type || 'application/octet-stream' }));
    const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = fallbackName;
      link.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    showToast(err.message || 'No fue posible abrir el archivo.', 'error');
  }
}
function previewInvoice(item) {
  if (!item?.attachmentName && !item?.attachmentKey) {
    showToast('Este documento de cobro no tiene archivo adjunto.', 'error');
    return;
  }
  return previewFile(`/finance/invoices/${item.id}/download`, item.attachmentName || 'documento-cobro.pdf');
}
function previewObservation(item) {
  if (!observationHasAttachment(item)) {
    showToast('Esta anotación no tiene archivo adjunto.', 'error');
    return;
  }
  return previewFile(`/classbook/observations/${item.id}/download`, item.attachmentName || 'anotacion');
}
function previewDocument(item) {
  return previewFile(`/documents/${item.id}/download`, item.name || 'documento');
}

async function downloadDocument(item) {
  try {
    const response = await download(`/documents/${item.id}/download`);
    if (!response.ok) throw new Error('No fue posible descargar el documento.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = item.name; link.click(); URL.revokeObjectURL(url);
  } catch (err) { error.value = err.message; }
}


async function deleteEmployee(employee) {
  if (deletingEmployeeId.value) return;
  const result = await askConfirmation(
    `¿Eliminar del sistema a ${employee.fullName}? La ficha quedará inactiva y el historial se conservará en Administración.`,
    { checkboxLabel: 'Revocar acceso a la plataforma', checkboxDefault: false }
  );
  if (!confirmationOk(result)) return;
  const revokeAccess = confirmationChecked(result);
  deletingEmployeeId.value = employee.id;
  try {
    await request(`/hr/employees/${employee.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ revokeAccess }),
    });
    selectedEmployee.value = null;
    showToast(revokeAccess
      ? 'Empleado desactivado y acceso a la plataforma revocado'
      : 'Empleado desactivado. El acceso a la plataforma se mantiene.');
    openEmployeeList('active');
  } catch (err) { showToast(err.message || 'No fue posible eliminar el empleado.', 'error'); }
  finally { deletingEmployeeId.value = null; }
}

async function saveEmployeeProfileEdits() {
  if (!selectedEmployee.value?.id || employeeRehireSaving.value) return;
  employeeRehireSaving.value = true;
  try {
    const data = await request(`/hr/employees/${selectedEmployee.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        fullName: employeeRehireForm.fullName,
        position: employeeRehireForm.position,
        contractType: employeeRehireForm.contractType,
        workModality: employeeRehireForm.workModality,
        hiredOn: employeeRehireForm.hiredOn,
        monthlySalary: Number(employeeRehireForm.monthlySalary) || 0,
        endedOn: employeeStatus.value === 'inactive' ? (selectedEmployee.value.endedOn || null) : null,
      }),
    });
    const updated = mapEmployeeRow(data.employee || { ...selectedEmployee.value, ...employeeRehireForm });
    selectedEmployee.value = {
      ...selectedEmployee.value,
      ...updated,
      platformAccess: selectedEmployee.value.platformAccess,
    };
    syncEmployeeRehireForm(selectedEmployee.value);
    showToast('Ficha actualizada');
    await loadModule('hr');
  } catch (err) {
    showToast(err.message || 'No fue posible guardar la ficha.', 'error');
  } finally {
    employeeRehireSaving.value = false;
  }
}

async function restoreEmployee(employee) {
  if (deletingEmployeeId.value || employeeRehireSaving.value) return;
  if (!(await askConfirmation(`¿Reintegrar a ${employeeRehireForm.fullName || employee.fullName}? Volverá a empleados activos con los datos que indiques.`))) return;
  deletingEmployeeId.value = employee.id;
  employeeRehireSaving.value = true;
  try {
    const data = await request(`/hr/employees/${employee.id}/restore`, {
      method: 'POST',
      body: JSON.stringify({
        restoreAccess: employeeRehireForm.restoreAccess !== false,
        fullName: employeeRehireForm.fullName,
        position: employeeRehireForm.position,
        contractType: employeeRehireForm.contractType,
        workModality: employeeRehireForm.workModality,
        hiredOn: employeeRehireForm.hiredOn,
        monthlySalary: Number(employeeRehireForm.monthlySalary) || 0,
      }),
    });
    const restored = mapEmployeeRow(data.employee || {
      ...employee,
      ...employeeRehireForm,
      active: true,
      endedOn: null,
    });
    selectedEmployee.value = {
      ...selectedEmployee.value,
      ...restored,
      active: 'Activo',
      endedOn: null,
      platformAccess: employee.userId && employeeRehireForm.restoreAccess !== false
        ? true
        : selectedEmployee.value?.platformAccess,
    };
    syncEmployeeRehireForm(selectedEmployee.value);
    showToast('Empleado reintegrado');
    employeeStatus.value = 'active';
    window.history.replaceState({ view: 'RRHH', employeeId: employee.id }, '', `/empleados/${employee.id}`);
    await Promise.all([loadModule('hr'), loadSalaries()]);
  } catch (err) { showToast(err.message || 'No fue posible reintegrar el empleado.', 'error'); }
  finally {
    deletingEmployeeId.value = null;
    employeeRehireSaving.value = false;
  }
}

async function setEmployeePlatformAccess(employee, active) {
  if (deletingEmployeeId.value || !employee?.userId) return;
  deletingEmployeeId.value = employee.id;
  try {
    await request(`/hr/employees/${employee.id}/platform-access`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    });
    if (selectedEmployee.value?.id === employee.id) {
      selectedEmployee.value = { ...selectedEmployee.value, platformAccess: active };
    }
    showToast(active ? 'Acceso a la plataforma restaurado' : 'Acceso a la plataforma revocado');
  } catch (err) { showToast(err.message || 'No fue posible actualizar el acceso.', 'error'); }
  finally { deletingEmployeeId.value = null; }
}

async function exportFinanceExcel() {
  try {
    const params = new URLSearchParams({ year: String(financeYear.value), section: financeExportSections[activeModuleSection.value] || 'all' });
    const response = await download(`/finance/export?${params}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'No fue posible exportar finanzas.');
    }
    const url = URL.createObjectURL(await response.blob());
    const suffix = financeExportSections[activeModuleSection.value] || 'todo';
    const link = document.createElement('a');
    link.href = url;
    link.download = `finanzas-${suffix}-${financeYear.value}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Informe financiero exportado a Excel');
  } catch (err) {
    showToast(err.message || 'No fue posible exportar finanzas.', 'error');
  }
}

async function loadSalaries() {
  try { salaries.value = await request('/hr/salaries'); } catch (err) { error.value = err.message; }
}

async function saveSalary(employee) {
  error.value = '';
  try {
    await request(`/hr/salaries/${employee.id}`, { method: 'PUT', body: JSON.stringify({ monthlySalary: employee.monthlySalary }) });
    showToast('Sueldo actualizado');
    await loadModule('hr');
  } catch (err) { error.value = err.message; }
}

function mapEmployeeRow(row) {
  const inactive = row.active === false || row.active === 0 || row.active === 'Inactivo' || row.active === 'No';
  return {
    ...row,
    id: Number(row.id),
    monthlySalary: Number(row.monthlySalary) || 0,
    userId: row.userId || null,
    platformAccess: row.platformAccess == null ? null : Boolean(row.platformAccess),
    active: inactive ? 'Inactivo' : 'Activo',
    endedOn: row.endedOn || null,
  };
}

function openEmployee(row, { push = true } = {}) {
  const employee = mapEmployeeRow(row);
  selectedEmployee.value = employee;
  employeeStatus.value = employee.active === 'Inactivo' ? 'inactive' : 'active';
  syncEmployeeRehireForm(employee);
  if (canManageHr.value) loadJobTitles();
  currentView.value = 'RRHH';
  sidebarOpen.value = false;
  if (push) window.history.pushState({ view: 'RRHH', employeeId: employee.id }, '', `/empleados/${employee.id}`);
}

async function openEmployeeById(id, { push = true } = {}) {
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId < 1) return;
  currentView.value = 'RRHH';
  sidebarOpen.value = false;
  error.value = '';
  employeeDetailLoading.value = true;
  try {
    const data = await request(`/hr/employees/${employeeId}`);
    openEmployee(data.employee, { push });
  } catch (err) {
    selectedEmployee.value = null;
    showToast(err.message || 'No fue posible abrir la ficha del empleado.', 'error');
    openEmployeeList(employeeStatus.value);
  } finally {
    employeeDetailLoading.value = false;
  }
}

function closeEmployee() {
  openEmployeeList(employeeStatus.value);
}

async function saveStaffUser() {
  staffSaving.value = true;
  staffError.value = '';
  try {
    const path = staffForm.id ? `/admin/users/${staffForm.id}` : '/admin/users';
    const payload = {
      ...staffForm,
      active: Boolean(staffForm.platformAccess),
      teamActive: Boolean(staffForm.teamActive),
      generatePassword: staffUsesEmail.value && staffForm.generatePassword
    };
    const data = await request(path, { method: staffForm.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    if (data.user.id === authUser.value.id) authUser.value = { ...authUser.value, ...data.user };
    generatedCredentials.value = data.temporaryPassword
      ? {
          username: data.user.username,
          password: data.temporaryPassword,
          recipient: 'usuario',
          deliveryMessage: data.email?.queued
            ? 'El correo de acceso está en cola para envío.'
            : data.email?.sent
            ? 'También enviamos estas credenciales al correo del usuario.'
            : 'El correo no fue enviado; debes compartir estas credenciales directamente.'
        }
      : null;
    staffFormOpen.value = false;
    const listPath = '/administracion/equipo';
    if ((window.location.pathname.replace(/\/$/, '') || '/') !== listPath) {
      window.history.replaceState({ view: 'Administración' }, '', listPath);
    }
    showToast(staffForm.id
      ? 'Cuenta actualizada correctamente'
      : data.email?.sent
        ? 'Cuenta creada y credenciales enviadas por correo'
        : data.email?.reason === 'La cuenta no tiene un correo asociado'
          ? 'Cuenta creada; entrega las credenciales directamente al usuario'
          : `Cuenta creada; correo pendiente: ${data.email?.reason || 'envío no disponible'}`);
    await loadStaffUsers();
  } catch (err) { staffError.value = err.message; }
  finally { staffSaving.value = false; }
}

async function deactivateStaffAccount() {
  if (!staffForm.id || staffForm.id === authUser.value.id || staffSaving.value) return;
  if (['guardian', 'student'].includes(staffForm.role)) {
    staffError.value = 'Da de baja a estudiantes y apoderados desde su ficha académica.';
    return;
  }
  const result = await askConfirmation(
    `¿Dar de baja a ${staffForm.fullName}? Saldrá del equipo activo y el historial se conservará.`,
    { checkboxLabel: 'Revocar acceso a la plataforma', checkboxDefault: false }
  );
  if (!confirmationOk(result)) return;
  const revokeAccess = confirmationChecked(result);
  staffSaving.value = true;
  staffError.value = '';
  try {
    const data = await request(`/admin/users/${staffForm.id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ revokeAccess }),
    });
    staffForm.teamActive = false;
    staffForm.active = false;
    staffForm.platformAccess = Boolean(data.user?.platformAccess);
    showToast(revokeAccess
      ? 'Cuenta dada de baja y acceso revocado'
      : 'Cuenta dada de baja. El acceso a la plataforma se mantiene.');
    await loadStaffUsers();
  } catch (err) { staffError.value = err.message; }
  finally { staffSaving.value = false; }
}

async function restoreStaffAccount() {
  if (!staffForm.id || staffSaving.value) return;
  if (!(await askConfirmation(`¿Reactivar a ${staffForm.fullName}? Volverá al equipo activo.`))) return;
  staffSaving.value = true;
  staffError.value = '';
  try {
    const data = await request(`/admin/users/${staffForm.id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ restoreAccess: true }),
    });
    staffForm.teamActive = true;
    staffForm.active = true;
    staffForm.platformAccess = data.user?.platformAccess !== false;
    showToast('Cuenta reactivada');
    await loadStaffUsers();
  } catch (err) { staffError.value = err.message; }
  finally { staffSaving.value = false; }
}

async function setStaffAccountPlatformAccess(active) {
  if (!staffForm.id || staffSaving.value) return;
  if (staffForm.id === authUser.value.id && !active) {
    staffError.value = 'No puedes revocar el acceso de tu propia cuenta.';
    return;
  }
  staffSaving.value = true;
  staffError.value = '';
  try {
    await request(`/admin/users/${staffForm.id}/platform-access`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    });
    staffForm.platformAccess = active;
    showToast(active ? 'Acceso a la plataforma restaurado' : 'Acceso a la plataforma revocado');
    await loadStaffUsers();
  } catch (err) { staffError.value = err.message; }
  finally { staffSaving.value = false; }
}

async function uploadStaffAvatar(event) {
  const file = event.target.files?.[0];
  if (!file || !staffForm.id) return;
  try {
    const body = new FormData(); body.append('file', file);
    await request(`/admin/users/${staffForm.id}/avatar`, { method: 'POST', body });
    await loadStaffUsers();
    showToast('Avatar actualizado correctamente');
  } catch (err) { staffError.value = err.message; }
  event.target.value = '';
}

async function copyGeneratedPassword() {
  if (!generatedCredentials.value) return;
  try {
    await navigator.clipboard.writeText(generatedCredentials.value.password);
    showToast('Contraseña temporal copiada');
  } catch (_error) {
    showToast('No fue posible copiarla; selecciónala manualmente', 'error');
  }
}

function openAccount({ tab = 'profile' } = {}) {
  Object.assign(accountForm, {
      fullName: authUser.value.fullName,
      username: authUser.value.username,
      position: authUser.value.position || '',
      phone: authUser.value.phone || '',
      whatsappOptIn: !!authUser.value.whatsappOptIn,
      askSchoolOnLogin: authUser.value.askSchoolOnLogin !== false,
      preferredSchoolId: authUser.value.preferredSchoolId || (authUser.value.memberships?.length ? authUser.value.schoolId : null),
    });
  Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
  accountError.value = '';
  passwordError.value = '';
  accessError.value = '';
  closeHeaderMenus();
  error.value = '';
  currentView.value = 'Mi cuenta';
  sidebarOpen.value = false;
  setAccountTab(tab, { push: true });
  loadSignaturePreview();
}

function accountPathForTab(tab = 'profile') {
  const key = ACCOUNT_TAB_SLUGS[tab] ? tab : 'profile';
  return `/mi-cuenta/${ACCOUNT_TAB_SLUGS[key]}`;
}

function setAccountTab(tab, { push = true } = {}) {
  const next = ACCOUNT_TAB_SLUGS[tab] ? tab : 'profile';
  accountTab.value = next;
  const path = accountPathForTab(next);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (currentPath !== path) {
    const state = { view: 'Mi cuenta', accountTab: next };
    if (push) window.history.pushState(state, '', path);
    else window.history.replaceState(state, '', path);
  }
  if (next === 'access') loadAccessInfo();
}

function describeAccessAgent(value = '') {
  const ua = String(value || '');
  if (!ua) return 'Cliente desconocido';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'SO desconocido';
  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Móvil' : 'Escritorio';
  return `${browser} · ${os} · ${device}`;
}

function formatAccessIp(ip, geo = {}) {
  if (!ip) return '—';
  const flag = geo.flag || '';
  const country = geo.country || '';
  if (flag && country) return `${flag} ${ip} · ${country}`;
  if (country) return `${ip} · ${country}`;
  return ip;
}

function formatAccessWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

async function loadAccessInfo() {
  accessLoading.value = true;
  accessError.value = '';
  try {
    accessInfo.value = await request('/auth/sessions');
    resetAccessSessionsPage();
  } catch (err) {
    accessError.value = err.message || 'No se pudo cargar el historial de acceso.';
  } finally {
    accessLoading.value = false;
  }
}

async function revokeOtherAccessSessions() {
  if (accessBusy.value) return;
  if (!(await askConfirmation('¿Cerrar las otras sesiones activas? Seguirás conectado en este dispositivo.'))) return;
  accessBusy.value = true;
  accessError.value = '';
  try {
    const result = await request('/auth/sessions', { method: 'DELETE' });
    showToast(result.revoked ? `Se cerraron ${result.revoked} sesión${result.revoked === 1 ? '' : 'es'}` : 'No había otras sesiones activas');
    await loadAccessInfo();
  } catch (err) {
    accessError.value = err.message || 'No se pudieron cerrar las otras sesiones.';
  } finally {
    accessBusy.value = false;
  }
}

watch(accountTab, (tab) => {
  if (tab === 'access' && currentView.value === 'Mi cuenta' && !accessLoading.value && !accessInfo.value) {
    loadAccessInfo();
  }
});

async function loadSignaturePreview() {
  if (signaturePreview.value) {
    URL.revokeObjectURL(signaturePreview.value);
    signaturePreview.value = '';
  }
  if (!authUser.value?.hasSignature && !authUser.value?.signatureKey) return;
  try {
    const response = await download(`/auth/signature?t=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) signaturePreview.value = URL.createObjectURL(await response.blob());
  } catch { /* Sin firma cargada: se usa el nombre. */ }
}

async function uploadOwnSignatureImage(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file || signatureBusy.value) return;
  signatureBusy.value = true;
  accountError.value = '';
  try {
    const body = new FormData();
    body.append('file', file);
    const result = await request('/auth/signature', { method: 'POST', body });
    authUser.value = {
      ...authUser.value,
      signatureKey: result.signatureKey || authUser.value.signatureKey,
      hasSignature: true,
    };
    await loadSignaturePreview();
    showToast('Firma actualizada');
  } catch (err) {
    accountError.value = err.message || 'No se pudo subir la firma.';
    setAccountTab('profile');
  } finally {
    signatureBusy.value = false;
  }
}

async function removeOwnSignatureImage() {
  if (signatureBusy.value) return;
  if (!(await askConfirmation('¿Quitar la imagen de firma? Se volverá a firmar con tu nombre.'))) return;
  signatureBusy.value = true;
  accountError.value = '';
  try {
    await request('/auth/signature', { method: 'DELETE' });
    authUser.value = { ...authUser.value, signatureKey: null, hasSignature: false };
    if (signaturePreview.value) URL.revokeObjectURL(signaturePreview.value);
    signaturePreview.value = '';
    showToast('Firma restablecida al nombre');
  } catch (err) {
    accountError.value = err.message || 'No se pudo quitar la firma.';
  } finally {
    signatureBusy.value = false;
  }
}

async function saveOwnProfile() {
  accountSaving.value = true;
  accountError.value = '';
  try {
    const phone = String(accountForm.phone || '').trim();
    if (accountForm.whatsappOptIn && !phone) {
      accountError.value = 'Para recibir WhatsApp indica un teléfono con código de país, por ejemplo +56912345678.';
      setAccountTab('notifications');
      return;
    }
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      accountError.value = 'El teléfono debe ir con código de país, por ejemplo +56912345678.';
      if (accountTab.value !== 'notifications') setAccountTab('profile');
      return;
    }
    const payload = {
      fullName: String(accountForm.fullName || '').trim(),
      username: String(accountForm.username || '').trim().toLowerCase(),
      position: String(accountForm.position || '').trim(),
      phone,
      whatsappOptIn: accountForm.whatsappOptIn,
    };
    if (showLinkedSchoolsPrefs.value) {
      payload.askSchoolOnLogin = true;
      payload.preferredSchoolId = accountForm.preferredSchoolId ? Number(accountForm.preferredSchoolId) : null;
    }
    const data = await request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
    authUser.value = data.user;
    showToast(accountTab.value === 'notifications' ? 'Preferencias de notificación guardadas' : 'Perfil actualizado correctamente');
  } catch (err) {
    accountError.value = err?.message || 'No pudimos guardar los cambios. Intenta nuevamente.';
  } finally {
    accountSaving.value = false;
  }
}

async function changeOwnPassword() {
  passwordError.value = '';
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Las contraseñas nuevas no coinciden.';
    return;
  }
  passwordSaving.value = true;
  try {
    await request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
    });
    Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Contraseña actualizada correctamente');
  } catch (err) { passwordError.value = err.message; }
  finally { passwordSaving.value = false; }
}

async function loadGradeStudents(courseId, lockedStudentId = '') {
  gradeStudents.value = [];
  if (!courseId) return;
  gradeStudentsLoading.value = true;
  gradeError.value = '';
  try {
    gradeStudents.value = await request(`/students?courseId=${Number(courseId)}`);
    if (lockedStudentId && !gradeStudents.value.some((student) => Number(student.id) === Number(lockedStudentId))) {
      gradeError.value = 'El estudiante no está matriculado en el curso seleccionado.';
    }
  } catch (err) { gradeError.value = err.message; }
  finally { gradeStudentsLoading.value = false; }
}

async function prepareGradeForm(studentId = '') {
  gradeStudentLocked.value = Boolean(studentId);
  gradeReturnStudentId.value = studentId ? Number(studentId) : null;
  gradeStep.value = 'pick';
  gradeError.value = '';
  if (studentId) {
    try {
      studentProfile.value = await request(`/students/${studentId}`);
      await loadData();
    } catch (err) {
      gradeError.value = err.message;
    }
  }
  Object.assign(form, {
    studentId: studentId || '',
    courseId: '',
    assessment: '',
    score: '',
    weight: 25,
    gradedAt: new Date().toISOString().slice(0, 10),
    feedback: '',
  });
  gradeStudents.value = [];
}

function selectGradeCourse(course) {
  form.courseId = course.id;
  gradeStep.value = 'form';
  loadGradeStudents(course.id, gradeStudentLocked.value ? form.studentId : '');
}

function backToGradeCoursePick() {
  gradeStep.value = 'pick';
  form.courseId = '';
  if (!gradeStudentLocked.value) form.studentId = '';
  gradeStudents.value = [];
}
async function openGradePage(studentId = '') {
  const preferredCourseId = ['Asignatura del curso', 'Detalle del curso'].includes(currentView.value)
    ? Number(courseDetailId.value || selectedCourse.value || 0)
    : 0;
  await prepareGradeForm(studentId);
  if (preferredCourseId) {
    const course = (gradeCourses.value || []).find((row) => Number(row.id) === preferredCourseId)
      || courses.value.find((row) => Number(row.id) === preferredCourseId);
    if (course) selectGradeCourse(course);
  }
  currentView.value = 'Nueva calificación';
  const query = studentId ? `?studentId=${Number(studentId)}` : '';
  window.history.pushState({ view: 'Nueva calificación', studentId }, '', `${viewRoutes['Nueva calificación']}${query}`);
  sidebarOpen.value = false;
}

function cancelGradePage() {
  if (gradeReturnStudentId.value) {
    openStudentNotas(gradeReturnStudentId.value);
    return;
  }
  navigate('Calificaciones');
}

async function saveGrade() {
  saving.value = true;
  gradeError.value = '';
  try {
    const profileStudentId = gradeReturnStudentId.value;
    await request('/grades', { method: 'POST', body: JSON.stringify(form) });
    showToast('Calificación guardada correctamente');
    await loadData();
    if (profileStudentId) await openStudentNotas(profileStudentId);
    else navigate('Calificaciones');
  } catch (err) { gradeError.value = err.message; }
  finally { saving.value = false; }
}

function gradeClass(score) {
  if (Number(score) >= 6) return 'excellent';
  if (Number(score) >= 4) return 'approved';
  return 'risk';
}
function subjectColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#0067b2';
}

function initials(first, last = '') { return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase(); }
function moduleStudentInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}
function moduleStudentAvatarColor(row) {
  const fromRow = row?.avatarColor || row?.avatar_color;
  if (fromRow) return fromRow;
  const id = Number(row?.studentId);
  if (id > 0) {
    const student = students.value.find((item) => Number(item.id) === id);
    if (student?.avatar_color || student?.avatarColor) {
      return student.avatar_color || student.avatarColor;
    }
  }
  return 'var(--color-primary)';
}
function enrichModuleStudentAvatars(result) {
  if (!result?.sections?.length) return result;
  const byId = new Map(
    (students.value || []).map((student) => [Number(student.id), student])
  );
  for (const section of result.sections) {
    for (const row of section.rows || []) {
      const id = Number(row.studentId);
      if (!(id > 0)) continue;
      const student = byId.get(id);
      if (!student) continue;
      row.avatarColor = row.avatarColor || row.avatar_color || student.avatar_color || student.avatarColor || null;
      row.avatar_color = row.avatarColor;
      row.avatarKey = row.avatarKey || row.avatar_key || student.avatar_key || student.avatarKey || null;
      row.avatar_key = row.avatarKey;
      if (!row.studentName) {
        row.studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || row.studentName;
      }
    }
  }
  return result;
}
function formatPeriod(value) { return new Intl.DateTimeFormat('es-CL', { month: 'short', year: 'numeric' }).format(new Date(`${String(value).slice(0, 7)}-15T12:00:00`)); }

watch(selectedCourse, (next, previous) => {
  // Course detail navigations load their own context; avoid a second full reload storm.
  if (!authUser.value) return;
  if (['Detalle del curso', 'Aula del curso', 'Configurar aula', 'Asignatura del curso', 'Agregar estudiantes'].includes(currentView.value)) return;
  // Estudiantes/Cursos filter client-side. Only refresh when clearing a previous API-scoped filter.
  if (['Estudiantes', 'Cursos'].includes(currentView.value)) {
    if (!next && previous) {
      loadData({ soft: true, keepCourses: true }).catch((err) => {
        showToast(err?.message || 'No pudimos actualizar el listado.', 'error');
      });
    }
    return;
  }
  if (['Resumen', 'Atención', 'Calificaciones'].includes(currentView.value)) {
    loadData({ soft: true, keepCourses: true }).catch((err) => {
      showToast(err?.message || 'No pudimos actualizar el filtro.', 'error');
    });
  }
});
watch(studentStatusFilter, () => {
  if (authUser.value && currentView.value === 'Estudiantes') loadData();
});
watch(() => form.courseId, (courseId, previousCourseId) => {
  if (currentView.value !== 'Nueva calificación' || gradeStep.value !== 'form') return;
  if (Number(courseId) === Number(previousCourseId)) return;
  if (!courseId) return;
  if (!gradeStudentLocked.value) form.studentId = '';
  loadGradeStudents(courseId, gradeStudentLocked.value ? form.studentId : '');
});
watch(selectedStudentYear, () => { expandedGradeGroup.value = ''; });
watch(communicationRows, () => {
  if (communicationPage.value > communicationPageCount.value) communicationPage.value = communicationPageCount.value;
});
watch(accountabilityYear, () => {
  if (!isAccountabilityView.value) return;
  if (financeYear.value !== accountabilityYear.value) {
    financeYear.value = accountabilityYear.value;
    return;
  }
  navigateFinanceSection('Rendición de cuentas');
});
watch(financeYear, () => {
  if (currentView.value === 'Finanzas') {
    if (isAccountabilityView.value && accountabilityYear.value !== financeYear.value) accountabilityYear.value = financeYear.value;
    loadModule('finance');
    navigateFinanceSection(activeModuleSection.value);
  }
});
watch(() => accountabilityForm.movementType, (type) => {
  accountabilityForm.category = type === 'income' ? incomeCategories[0] : expenseCategories[0];
});
watch(() => staffForm.role, (role) => {
  if (['teacher', 'guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(role)) {
    staffForm.permissions.manageUsers = false;
    staffForm.permissions.manageSchool = false;
    staffForm.permissions.manageHr = false;
    staffForm.permissions.manageFinance = false;
    staffForm.permissions['sige.view'] = false;
    staffForm.permissions['sige.configure'] = false;
    staffForm.permissions['sige.sync'] = false;
    staffForm.permissions['sige.view_logs'] = false;
    if (['finance', 'agente_finanzas'].includes(role)) {
      staffForm.permissions.approveLeave = true;
    } else if (['guardian', 'student', 'monitor'].includes(role)) {
      staffForm.permissions.approveLeave = false;
    }
    if (['finance', 'agente_finanzas', 'monitor'].includes(role)) {
      staffForm.permissions.manageGrades = false;
      staffForm.permissions.viewReports = role === 'monitor';
    }
  } else if (role === 'director') {
    Object.assign(staffForm.permissions, { manageUsers: true, manageGrades: true, viewReports: true, manageSchool: true, manageHr: true, manageFinance: true, approveLeave: true, 'sige.view': true, 'sige.configure': true, 'sige.sync': true, 'sige.view_logs': true });
  } else if (role === 'utp') {
    Object.assign(staffForm.permissions, { manageUsers: true, manageGrades: true, viewReports: true, manageSchool: false, manageHr: true, manageFinance: true, approveLeave: true, 'sige.view': true, 'sige.configure': true, 'sige.sync': true, 'sige.view_logs': true });
  } else if (role === 'manager') {
    staffForm.permissions.approveLeave = true;
  }
});
function handlePopState() {
  if (authUser.value) syncRouteFromLocation();
}

function handleDocumentClick(event) {
  closeHeaderMenus();
  document.querySelectorAll('.row-action-menu[open]').forEach((menu) => { menu.open = false; });
  const target = event?.target;
  if (sidebarIsCompact.value && expandedNav.value && target?.closest && !target.closest('.sidebar')) {
    closeCompactNavFlyout();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeHeaderMenus();
    closeCompactNavFlyout();
  }
}

function handleCompactNavViewportChange() {
  positionCompactNavFlyouts();
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
  window.addEventListener('resize', handleCompactNavViewportChange);
  window.addEventListener('scroll', handleCompactNavViewportChange, true);
  initializeApp();
});
onBeforeUnmount(() => {
  studentSearch.cancel();
  window.removeEventListener('popstate', handlePopState);
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
  window.removeEventListener('resize', handleCompactNavViewportChange);
  window.removeEventListener('scroll', handleCompactNavViewportChange, true);
  clearCompactNavFlyoutStyles();
  Object.values(studentAvatars.value).forEach((url) => URL.revokeObjectURL(url));
  Object.values(staffAvatars.value).forEach((url) => URL.revokeObjectURL(url));
});
</script>

<template>
  <div v-if="authLoading" class="auth-loading" role="status" aria-live="polite">
    <div class="brand-mark"><GraduationCap :size="23" /></div>
    <span class="spinner page-spinner" aria-hidden="true"></span>
    <strong>Cargando…</strong>
  </div>

  <PublicAdmission v-else-if="publicAdmissionSchoolId" :school-id="publicAdmissionSchoolId" />

  <section v-else-if="!authUser" class="login-page">
    <div class="login-visual">
      <div class="login-visual-glow" aria-hidden="true"></div>
      <div class="login-visual-grid" aria-hidden="true"></div>
      <div class="login-orb login-orb-a" aria-hidden="true"></div>
      <div class="login-orb login-orb-b" aria-hidden="true"></div>
      <div class="login-copy">
        <a class="login-brand-hero" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo login-logo-hero" src="/logo.png" alt="" width="56" height="56" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <h1>Todo el progreso de tu colegio, en un solo lugar.</h1>
        <p>Organiza calificaciones, acompaña a tus estudiantes y toma mejores decisiones con información clara.</p>
      </div>
      <p class="login-copyright">
        © 2026 hlquery · Educación que avanza
        <a class="login-social-link" href="https://x.com/hlquery" target="_blank" rel="noopener noreferrer">Twitter / X</a>
      </p>
    </div>
    <div class="login-form-side">
      <form v-if="loginPanel === 'login'" class="login-form" @submit.prevent="signIn">
        <a class="mobile-login-brand" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo" src="/logo.png" alt="" width="40" height="40" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <p class="login-eyebrow">Portal académico</p>
        <h2>Bienvenido de vuelta</h2>
        <p class="login-subtitle">Ingresa tus datos para acceder al panel.</p>
        <div v-if="platformDemoMode" class="login-demo-notice" role="status">
          <strong>Modo demo · solo lectura</strong>
          <p>{{ platformDemoMessage }}</p>
          <button type="button" class="login-demo-guide-button" @click="openDemoGuide">Instrucciones</button>
        </div>
        <div v-if="loginError" class="login-error" role="alert">{{ loginError }}</div>
        <label class="login-field"><span>Usuario o correo</span><div><Mail class="login-field-icon" :size="18" :stroke-width="2" /><input v-model.trim="loginForm.username" type="text" autocomplete="username" required placeholder="usuario o tu@colegio.cl" /></div></label>
        <label class="login-field"><span>Contraseña</span><div><Lock class="login-field-icon" :size="18" :stroke-width="2" /><input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="Tu contraseña" /><button type="button" aria-label="Mostrar contraseña" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="18" :stroke-width="2" /><Eye v-else :size="18" :stroke-width="2" /></button></div></label>
        <p class="login-hint">Tu sesión se mantendrá activa en este dispositivo.</p>
        <button class="login-button" :disabled="loginLoading"><span v-if="loginLoading" class="spinner"></span><LogIn v-else :size="18" />{{ loginLoading ? 'Ingresando...' : 'Iniciar sesión' }}</button>
        <p class="login-help">
          <button type="button" class="login-text-link" @click="openForgotPassword">¿Olvidaste tu contraseña?</button>
        </p>
      </form>

      <div v-else-if="loginPanel === 'demo-guide'" class="login-form login-demo-guide">
        <a class="mobile-login-brand" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo" src="/logo.png" alt="" width="40" height="40" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <p class="login-eyebrow">Modo demo</p>
        <h2>Instrucciones</h2>
        <p class="login-subtitle">{{ demoGuide?.intro || platformDemoMessage }}</p>
        <p class="login-demo-password-hint">Clave de todas las cuentas: <strong>{{ demoGuide?.passwordHint || 'admin' }}</strong></p>
        <div class="login-demo-guide-scroll">
          <section v-for="group in demoGuideGroups" :key="group.name" class="login-demo-group">
            <h3>{{ group.name }}</h3>
            <article v-for="account in group.accounts" :key="account.username" class="login-demo-account">
              <div class="login-demo-account-copy">
                <strong>{{ account.title || account.roleLabel }}</strong>
                <span class="login-demo-account-role">{{ account.roleLabel }} · {{ account.fullName }}</span>
                <p>{{ account.description }}</p>
                <code>{{ account.username }}</code>
              </div>
              <button type="button" class="edit-button" @click="useDemoAccount(account)">Usar</button>
            </article>
          </section>
          <ul v-if="demoGuide?.notes?.length" class="login-demo-notes">
            <li v-for="note in demoGuide.notes" :key="note">{{ note }}</li>
          </ul>
        </div>
        <p class="login-help">
          <button type="button" class="login-text-link" @click="closeDemoGuide">Volver al inicio de sesión</button>
        </p>
      </div>

      <div v-else-if="loginPanel === 'school-choice'" class="login-form">
        <a class="mobile-login-brand" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo" src="/logo.png" alt="" width="40" height="40" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <p class="login-eyebrow">Más de un colegio</p>
        <h2>Elige el colegio</h2>
        <p class="login-subtitle">{{ loginSchoolMessage || 'Tu cuenta está asociada a más de un colegio. Elige a cuál quieres entrar.' }}</p>
        <div v-if="loginError" class="login-error" role="alert">{{ loginError }}</div>
        <div class="login-school-choices" role="list">
          <button
            v-for="item in loginSchoolChoices"
            :key="item.schoolId"
            type="button"
            class="login-school-choice"
            role="listitem"
            :disabled="loginLoading || item.available === false"
            @click="chooseLoginSchool(item.schoolId)"
          >
            <strong>{{ item.school?.name || `Colegio #${item.schoolId}` }}</strong>
            <small>
              {{ roleLabels[item.role] || item.role || 'Cuenta' }}
              <template v-if="item.preferred"> · Preferido</template>
              <template v-if="item.readOnly"> · Solo historial</template>
            </small>
          </button>
        </div>
        <p class="login-hint">Esta pregunta solo aparece cuando tu usuario tiene acceso a varios colegios.</p>
        <p class="login-help">
          <button type="button" class="login-text-link" :disabled="loginLoading" @click="backToLoginCredentials">Volver</button>
        </p>
      </div>

      <form v-else-if="loginPanel === 'forgot'" class="login-form" @submit.prevent="submitForgotPassword">
        <a class="mobile-login-brand" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo" src="/logo.png" alt="" width="40" height="40" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <p class="login-eyebrow">Recuperar acceso</p>
        <h2>Olvidé mi contraseña</h2>
        <p class="login-subtitle">Ingresá el correo de tu cuenta. Si existe y tiene colegio asignado, te enviaremos una contraseña temporal.</p>
        <div v-if="forgotError" class="login-error" role="alert">{{ forgotError }}</div>
        <label class="login-field"><span>Correo de acceso</span><div><Mail class="login-field-icon" :size="18" :stroke-width="2" /><input v-model.trim="forgotEmail" type="email" autocomplete="email" required placeholder="tu@colegio.cl" /></div></label>
        <p class="login-hint">Por seguridad no indicamos si el correo está registrado.</p>
        <button class="login-button" :disabled="forgotLoading"><span v-if="forgotLoading" class="spinner"></span><Mail v-else :size="18" />{{ forgotLoading ? 'Enviando…' : 'Enviar contraseña temporal' }}</button>
        <p class="login-help">
          <button type="button" class="login-text-link" :disabled="forgotLoading" @click="backToLogin">Volver al inicio de sesión</button>
        </p>
      </form>

      <div v-else class="login-form">
        <a class="mobile-login-brand" href="https://www.hlquery.com" target="_blank" rel="noopener noreferrer" aria-label="Ir a hlquery">
          <img class="login-logo" src="/logo.png" alt="" width="40" height="40" decoding="async" />
          <span>dash<span>cole</span></span>
        </a>
        <p class="login-eyebrow">Correo enviado</p>
        <h2>Revisá tu bandeja</h2>
        <p class="login-subtitle">{{ forgotMessage }}</p>
        <p class="login-hint">Si no llega en unos minutos, revisá spam o pedí ayuda a dirección.</p>
        <button type="button" class="login-button" @click="backToLogin"><LogIn :size="18" />Volver a iniciar sesión</button>
      </div>
    </div>
  </section>

  <AppShell v-else :class="{ 'sidebar-is-compact': sidebarIsCompact }">
    <a class="skip-link" href="#main-content">Ir al contenido</a>
    <div v-if="authUser.impersonation" class="impersonation-banner"><strong>VIENDO COMO OTRA PERSONA</strong><span>{{ authUser.fullName }} · {{ school?.name || `Colegio #${authUser.schoolId}` }}</span><button @click="stopImpersonation">Salir y volver a la plataforma</button></div>
    <div v-else-if="authUser.demoMode || authUser.accessMode === 'demo'" class="impersonation-banner demo-mode-banner">
      <strong>MODO DEMO</strong>
      <span>{{ platformDemoMessage }}</span>
      <button type="button" @click="openDemoGuide">Instrucciones</button>
    </div>
    <div v-else-if="authUser.readOnly || authUser.accessMode === 'historical'" class="impersonation-banner historical-access-banner"><strong>ACCESO HISTÓRICO</strong><span>Puedes consultar tus datos, historial y apoderados. No puedes agregar ni modificar contenidos.</span></div>
    <div v-else-if="authUser.platformPermissions?.includes('platform.accounts.read') && !authUser.platformConsole" class="impersonation-banner platform-school-banner"><strong>DENTRO DEL COLEGIO</strong><span>{{ school?.name || authUser.memberships?.find(item => item.schoolId === authUser.schoolId)?.school?.name || `Colegio #${authUser.schoolId}` }}</span><button @click="returnToPlatformConsole">Volver a la plataforma</button></div>
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>
    <Sidebar
      :open="sidebarOpen"
      :class="{ 'is-themed': !isPlatformConsole, 'is-compact': sidebarIsCompact }"
      :style="sidebarThemeStyle || undefined"
      @close="sidebarOpen = false"
    >
      <div v-if="showSchoolBrandInSidebar" class="brand brand-school" :class="{ 'brand-school-text-only': !showSchoolLogoInSidebar }" :title="sidebarSchoolName || 'Colegio'">
        <div v-if="showSchoolLogoInSidebar" class="brand-logo-thumb">
          <img :src="schoolLogoPreview" :alt="`Logo de ${sidebarSchoolName || 'colegio'}`" />
        </div>
        <span class="brand-school-name">{{ sidebarSchoolName || 'Colegio' }}</span>
      </div>
      <div v-else class="brand"><div class="brand-mark"><GraduationCap :size="23" /></div><span>dash<span>cole</span></span></div>
      <nav :aria-label="isPlatformConsole ? 'Menú de plataforma' : 'Secciones del colegio'">
        <section v-for="group in navigationGroups" :key="group.title || 'main'" class="nav-task-group" :class="{ 'nav-group': group.title, 'nav-group-static': group.title && !group.direct && !sidebarNavCollapsible }">
          <template v-if="group.title">
            <button
              type="button"
              class="nav-group-toggle"
              :class="{
                active: group.items.some(item => isNavItemActive(item) || navItemHasActiveChild(item)) || (group.direct && ((group.title === 'Inicio' && currentView === 'Plataforma') || (group.title === 'Herramientas' && currentView === 'Colegios demo') || (group.title === 'Cobros' && currentView === 'Plataforma pagos') || (group.title === 'Contacto' && currentView === 'Inbox de contacto'))),
                'is-static': !group.direct && !sidebarNavCollapsible,
              }"
              :title="group.title"
              :aria-expanded="group.direct || !sidebarNavCollapsible ? undefined : expandedNav === group.title"
              :aria-controls="group.direct ? undefined : group.id"
              :tabindex="!group.direct && !sidebarNavCollapsible ? -1 : undefined"
              @click="toggleNavigationGroup(group.title)"
            >
              <component :is="group.icon" :size="18" />
              <span>{{ group.title }}</span>
              <ChevronDown v-if="!group.direct && sidebarNavCollapsible" :size="15" class="nav-chevron" :class="{ open: expandedNav === group.title }" />
            </button>
            <div v-if="!group.direct" v-show="isNavGroupOpen(group)" :id="group.id" class="nav-submenu">
              <template v-for="item in group.items" :key="item.label">
                <button
                  type="button"
                  :title="item.title || item.label"
                  :aria-current="isNavItemActive(item) ? 'page' : undefined"
                  :class="{ active: isNavItemActive(item), 'has-active-child': navItemHasActiveChild(item) }"
                  @click="selectNavigation(item.label)"
                >
                  <component :is="item.icon" :size="15" /><span>{{ item.title || item.label }}</span>
                </button>
                <div v-if="item.label === 'RRHH' && hrSubmenuOpen" class="staff-submenu">
                  <button type="button" :class="{ active: currentView === 'RRHH' && employeeStatus === 'active' }" @click="closeCompactNavFlyout(); openEmployeeList('active')">Activos</button>
                  <button type="button" :class="{ active: currentView === 'RRHH' && employeeStatus === 'inactive' }" @click="closeCompactNavFlyout(); openEmployeeList('inactive')">Historial</button>
                  <button v-if="canManageHr" type="button" :class="{ active: currentView === 'Remuneraciones' }" @click="closeCompactNavFlyout(); openHrPayments()">Pagos de nómina</button>
                  <button v-if="canManageHr" type="button" @click="closeCompactNavFlyout(); openHrPrevired()">Previred</button>
                  <button v-if="canAccessLeave" type="button" :class="{ active: currentView === 'Solicitudes' || currentView === 'Nueva solicitud' }" @click="closeCompactNavFlyout(); navigate('Solicitudes')">
                    Solicitudes
                    <span v-if="canApproveLeave && leavePendingCount" class="nav-unread">{{ leavePendingCount > 99 ? '99+' : leavePendingCount }}</span>
                  </button>
                  <button v-if="authUser.permissions?.manageSchool" type="button" @click="closeCompactNavFlyout(); openHrCargos()">Cargos</button>
                </div>
              </template>
            </div>
          </template>
          <template v-else v-for="item in group.items" :key="item.label">
            <button type="button" :title="item.title || item.label" :aria-current="currentView === item.label || (item.label === 'Apoderados' && (currentView === 'Nuevo apoderado' || currentView === 'Detalle apoderado')) ? 'page' : undefined" :class="{ active: currentView === item.label || (item.label === 'Apoderados' && (currentView === 'Nuevo apoderado' || currentView === 'Detalle apoderado')) }" @click="selectNavigation(item.label)">
              <component :is="item.icon" :size="18" /><span>{{ item.title || item.label }}</span>
            </button>
          </template>
        </section>
      </nav>
      <div class="sidebar-bottom">
        <button type="button" class="sidebar-logout" :title="'Cerrar sesión'" @click="signOut"><LogOut :size="18" /><span>Cerrar sesión</span></button>
        <button :class="{ active: currentView === 'Mi cuenta' }" :title="authUser.fullName || 'Mi cuenta'" @click="openAccount"><Settings :size="19" /><span>{{ authUser.fullName || 'Mi cuenta' }}</span></button>
      </div>
    </Sidebar>

    <main id="main-content" tabindex="-1">
      <Topbar>
        <div class="topbar-start">
          <button
            v-if="sidebarPanelCollapsible"
            type="button"
            class="sidebar-rail-toggle"
            :aria-pressed="sidebarIsCompact"
            :aria-label="sidebarIsCompact ? 'Expandir menú' : 'Colapsar menú'"
            :title="sidebarIsCompact ? 'Expandir menú' : 'Colapsar menú'"
            @click="toggleSidebarCompact"
          >
            <PanelLeftOpen v-if="sidebarIsCompact" :size="20" />
            <PanelLeftClose v-else :size="20" />
          </button>
          <button class="icon-button menu-button" aria-label="Abrir menú" @click="sidebarOpen = true">
            <Menu :size="20" stroke-width="2.25" />
          </button>
          <div v-if="!isPlatformConsole && !financialRoles.includes(authUser.role) && !['student', 'guardian'].includes(authUser.role)" class="top-search" :class="{ active: searchOpen }" @click.stop><Search :size="18" /><input v-model="search" aria-label="Buscar estudiante" aria-autocomplete="list" :aria-expanded="searchOpen" placeholder="Buscar estudiante" @input="searchOpen = search.trim().length >= 2" @keydown.escape="searchOpen = false" />
          <div v-if="searchOpen && search.trim().length >= 2" class="search-results" role="listbox">
            <div class="search-results-heading">Buscar estudiantes</div>
            <button
              v-for="student in topSearchResults"
              :key="student.id"
              role="option"
              @click="selectSearchStudent(student.id)"
            >
              <span
                class="avatar search-result-avatar"
                :style="{ background: student.avatar_color || student.avatarColor || 'var(--color-primary)' }"
              >
                <img v-if="studentAvatars[student.id]" :src="studentAvatars[student.id]" alt="" />
                <template v-else>{{ initials(student.first_name, student.last_name) }}</template>
              </span>
              <span>
                <strong>{{ student.first_name }} {{ student.last_name }}</strong>
                <small>{{ student.email || 'Sin correo registrado' }}</small>
              </span>
              <ChevronRight :size="15" />
            </button>
            <p v-if="searchLoading">Buscando…</p>
            <p v-else-if="searchError">{{ searchError }}</p>
            <p v-else-if="!topSearchResults.length">No encontramos estudiantes con ese nombre.</p>
          </div>
        </div>
        </div>
        <div class="top-actions" @click.stop>
          <div class="header-popover-wrap"><button class="icon-button notification" aria-label="Ver notificaciones" aria-haspopup="dialog" :aria-expanded="notificationsOpen" @click="toggleNotifications"><Bell :size="20" /><i v-if="hasUnreadNotifications"></i></button>
            <div v-if="notificationsOpen" class="header-popover notification-popover"><header><strong>{{ isPlatformConsole ? 'Alertas de plataforma' : 'Notificaciones' }}</strong><button v-if="isPlatformConsole" @click="navigate('Plataforma')">Ver resumen</button><button v-else-if="canOpenCommunications" @click="navigate('Comunicaciones')">Ver todas</button></header><div v-if="notifications.length" class="notification-list"><article v-for="item in notifications" :key="item.id" class="clickable-row" tabindex="0" role="button" @click="openNotification(item)" @keydown.enter="openNotification(item)" @keydown.space.prevent="openNotification(item)"><span><Bell :size="15" /></span><div><strong>{{ item.subject }}</strong><p>{{ item.body }}</p><small>{{ item.sentAt ? formatDate(item.sentAt.slice(0, 10)) : 'Ahora' }}</small></div></article></div><EmptyState v-else class="popover-empty">{{ isPlatformConsole ? 'Sin alertas de plataforma por ahora.' : 'No hay comunicados nuevos.' }}</EmptyState></div>
          </div>
          <div class="header-popover-wrap">
            <button
              class="header-profile is-name-only"
              :title="authUser.fullName"
              aria-haspopup="menu"
              :aria-expanded="profileMenuOpen"
              @click="toggleProfileMenu"
            >
              <span class="header-profile-name">{{ authUser.fullName }}</span>
              <ChevronDown :size="16" class="header-profile-chevron" />
            </button>
            <div v-if="profileMenuOpen" class="header-popover profile-popover">
              <div class="profile-popover-user is-name-only">
                <div>
                  <strong>{{ authUser.fullName }}</strong>
                  <small>{{ userRole }}</small>
                </div>
              </div>
              <label v-if="!isPlatformConsole && showLinkedSchoolsPrefs" class="field tenant-switcher">
                <span>Colegio activo</span>
                <select :value="authUser.schoolId" @change="switchSchool">
                  <option v-for="membership in authUser.memberships" :key="membership.id" :value="membership.schoolId">{{ membership.school?.name || `Colegio #${membership.schoolId}` }}</option>
                </select>
              </label>
              <button type="button" class="profile-account-link" @click="openAccount"><Settings :size="16" /><span>{{ authUser.fullName || 'Abrir perfil' }}</span></button>
              <button type="button" class="profile-logout" @click="signOut"><LogOut :size="16" /><span>Salir</span></button>
            </div>
          </div>
        </div>
      </Topbar>

      <section class="content">
        <PageHeader v-if="currentView !== 'Inbox de contacto'" class="page-heading">
          <div>
            <p class="eyebrow">{{ isPlatformConsole ? 'CONSOLA HLQUERY' : `CICLO ACADÉMICO ${new Date().getFullYear()}` }}</p>
            <h1>{{ pageTitle }}</h1>
            <p v-if="currentView === 'Resumen'" class="subtitle">{{ authUser.role === 'teacher' ? 'Resumen de los cursos donde eres profesor jefe o tienes una asignatura asignada.' : authUser.role === 'guardian' ? 'Resumen de tus estudiantes asociados: notas, asistencia y accesos rápidos.' : authUser.role === 'student' ? 'Tu resumen académico: notas, asistencia y accesos rápidos.' : 'Revisa lo que requiere atención y abre los registros para actuar.' }}</p>
            <p v-else-if="currentView === 'Atención'" class="subtitle">{{ attentionDetail?.definition || 'Detalle de la selección de atención.' }}</p>
            <p v-else-if="currentView === 'Matrículas'" class="subtitle">{{ isPublicSchool ? 'Estudiantes matriculados y cursos asociados.' : 'Saldos, fechas de pago y estado de cobro de cada estudiante matriculado.' }}</p>
            <p v-else-if="currentView === 'Historial de pagos'" class="subtitle">Pagos recibidos ordenados del más reciente al más antiguo, con fecha y medio.</p>
            <p v-else-if="currentView === 'Comunicaciones'" class="subtitle">Bandeja de comunicados enviados por correo, WhatsApp o portal.</p>
            <p v-else-if="currentView === 'Citaciones'" class="subtitle">Cita a apoderados a una reunión y envía el aviso por correo automáticamente.</p>
            <p v-else-if="currentView === 'Apoderados'" class="subtitle">Cuentas familiares del colegio: crea, edita y asigna estudiantes.</p>
            <p v-else-if="currentView === 'Detalle apoderado'" class="subtitle">Edita datos del apoderado y administra sus estudiantes vinculados.</p>
            <p v-else-if="currentView === 'Nuevo apoderado'" class="subtitle">Crea la cuenta familiar y asóciala a un estudiante si corresponde.</p>
            <p v-else-if="currentView === 'Nueva solicitud'" class="subtitle">Elige el tipo, las fechas y envía tu solicitud a revisión.</p>
            <p v-else-if="currentView === 'Plataforma'" class="subtitle">Vista general: colegios, cuentas y lo que puedes hacer hoy.</p>
            <p v-else-if="currentView === 'Colegios'" class="subtitle">Entra a un colegio, revisa su actividad, ajusta el plan o suspende el acceso.</p>
            <p v-else-if="currentView === 'Agregar colegio'" class="subtitle">Crea un colegio nuevo con su administrador y plan inicial.</p>
            <p v-else-if="currentView === 'Cuentas'" class="subtitle">Directorio de personas con acceso. Desde aquí puedes entrar como alguien para dar soporte.</p>
            <p v-else-if="currentView === 'Buscar gente'" class="subtitle">Encuentra a alguien por nombre, correo o RUT en toda la red.</p>
            <p v-else-if="currentView === 'Inbox de contacto'" class="subtitle">Consultas del formulario público del sitio.</p>
            <p v-else-if="currentView === 'Correo SMTP'" class="subtitle">Correo que hlquery usa para avisos a todos los colegios.</p>
            <p v-else-if="currentView === 'Plataforma pagos'" class="subtitle">Precios de suscripción y cobros a colegios.</p>
            <p v-else-if="currentView === 'Integraciones'" class="subtitle">WhatsApp y Webpay del colegio. Elige la pestaña para configurar cada proveedor.</p>
            <p v-else-if="currentView === 'Colegios demo'" class="subtitle">Reinicia o suspende los colegios de demostración.</p>
            <p v-else-if="currentView === 'Asistencia'" class="subtitle">{{ authUser.role === 'student' ? 'Consulta tu porcentaje de asistencia y días presentes.' : authUser.role === 'guardian' ? 'Consulta el historial de asistencia y atrasos.' : 'Registra presencia, ausencia y atrasos por curso y fecha.' }}</p>
            <p v-else-if="currentView === 'Tareas activas'" class="subtitle">Revisa todas tus tareas vigentes en un solo lugar.</p>
            <p v-else-if="currentView === 'Historial de tareas'" class="subtitle">Tareas vencidas de tus cursos.</p>
            <p v-else-if="isStudentProfileView" class="subtitle">{{ studentProfileSection === 'ficha' ? (authUser.permissions?.manageUsers ? 'Matrícula, datos y estado MINEDUC del estudiante.' : 'Datos, matrícula y resumen académico.') : studentProfileSection === 'historial' ? 'Todo el historial del estudiante: matrículas, asignaturas, apoderados, notas y cierres por año.' : studentProfileSection === 'apoderados' ? 'Familiares vinculados a este estudiante.' : studentProfileSection === 'anotaciones' ? 'Observaciones positivas, negativas y generales del estudiante.' : 'Historial de calificaciones del estudiante.' }}</p>
            <p v-else-if="currentView === 'Nuevo empleado'" class="subtitle">Sueldo líquido, AFP y previsión sugeridos según la ley.</p>
            <p v-else-if="currentView === 'RRHH' && selectedEmployee" class="subtitle">Ficha laboral, contrato y remuneraciones.</p>
            <p v-else-if="currentView === 'RRHH'" class="subtitle">{{ employeeStatus === 'inactive' ? 'Ex empleados y fichas dadas de baja.' : 'Personal vigente del colegio.' }}</p>
          </div>
          <PageActions v-if="['Resumen', 'Calificaciones', 'Estudiantes', 'Cursos', 'Matrículas', 'Historial de pagos', 'Comunicaciones'].includes(currentView)" class="heading-actions">
            <div
              v-if="['Resumen', 'Calificaciones', 'Estudiantes', 'Cursos'].includes(currentView) && (currentView !== 'Resumen' || !['director','manager','monitor'].includes(authUser.role))"
              class="select-wrap course-filter-select"
            >
              <BookOpen :size="17" aria-hidden="true" />
              <select v-model="selectedCourse" aria-label="Filtrar por curso">
                <option value="">{{ authUser.role === 'teacher' ? 'Todos mis cursos' : 'Todos los cursos' }}</option>
                <option v-for="course in headingCourseFilterOptions" :key="course.id" :value="String(course.id)">{{ course.label }}</option>
              </select>
              <ChevronDown :size="15" aria-hidden="true" />
            </div>
            <button v-if="currentView === 'Estudiantes' && authUser.permissions?.manageUsers" class="primary-button" @click="openNewStudentPage"><UserPlus :size="18" />Nuevo estudiante</button>
            <button v-if="currentView === 'Cursos' && canManageAcademicStructure" class="primary-button" @click="openNewCoursePage"><Plus :size="18" />Nuevo curso</button>
            <button v-if="currentView === 'Matrículas' && !isPublicSchool" type="button" class="secondary-button" @click="openEnrollmentPaymentHistory()"><CreditCard :size="16" />Pagos recibidos</button>
            <button v-if="currentView === 'Historial de pagos'" type="button" class="secondary-button" @click="navigate('Matrículas')"><ArrowLeft :size="16" />Volver a matrículas</button>
            <button v-if="currentView === 'Historial de pagos' && canManageFinance" type="button" class="primary-button" @click="openPaymentCredit()"><Plus :size="16" />Agregar pago</button>
            <button v-if="currentView === 'Comunicaciones' && !['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(authUser.role)" type="button" class="primary-button" @click="openCommunicationPage()"><Plus :size="17" />Redactar</button>
          </PageActions>
        </PageHeader>

        <ErrorState v-if="error" @retry="retryCurrentView">{{ error }}</ErrorState>
        <div v-else-if="loading || coursePageLoading || courseAccessChecking" class="page-loading" role="status" aria-live="polite">
          <span class="spinner page-spinner" aria-hidden="true"></span>
          <strong>{{ coursePageLoading || courseAccessChecking ? 'Cargando curso…' : 'Cargando página…' }}</strong>
          <span>{{ coursePageLoading || courseAccessChecking ? 'Preparando el detalle del curso' : `Preparando ${pageTitle || 'el panel'}` }}</span>
          <div class="loading-grid page-loading-skeletons" aria-hidden="true">
            <Skeleton v-for="n in 4" :key="n" class="skeleton" />
          </div>
        </div>
        <Attendance
          v-else-if="currentView === 'Asistencia'"
          :can-edit="Boolean(authUser.permissions?.manageGrades || authUser.permissions?.manageSchool || authUser.role === 'teacher')"
          :learner="['student', 'guardian'].includes(authUser.role)"
          :hide-absences="authUser.role === 'student'"
        />
        <TeacherTasks
          v-else-if="currentView === 'Tareas activas' || currentView === 'Historial de tareas'"
          :panel="currentView === 'Historial de tareas' ? 'history' : 'active'"
          @open-panel="(panel) => navigate(panel === 'history' ? 'Historial de tareas' : 'Tareas activas')"
          @open-task="(row) => openCourseClassroom(row.courseId, 'tareas')"
        />
        <Schedule v-else-if="currentView === 'Horario'" />
        <Planning v-else-if="currentView === 'Planificación'" />
        <AnnualResults v-else-if="currentView === 'Cierre anual'" />
        <SigeIntegration v-else-if="currentView === 'MINEDUC / SIGE'" :permissions="authUser.permissions || {}" />
        <Admissions
          v-else-if="currentView === 'Postulaciones'"
          :school-id="authUser.schoolId"
          :can-enroll="Boolean(authUser.permissions?.manageUsers)"
          @notify="(msg, type) => showToast(msg, type || 'success')"
        />
        <Guardians
          v-else-if="currentView === 'Apoderados' || currentView === 'Nuevo apoderado' || currentView === 'Detalle apoderado'"
          :key="currentView === 'Nuevo apoderado' ? 'guardians-create' : currentView === 'Detalle apoderado' ? `guardian-${guardiansFocusId}` : guardiansKey"
          :mode="currentView === 'Nuevo apoderado' ? 'create' : currentView === 'Detalle apoderado' ? 'detail' : 'list'"
          :focus-id="guardiansFocusId"
          @open-student="openStudentFicha"
          @open-communication="openGuardianCommunication"
          @go-create="openNewGuardianPage"
          @go-detail="openGuardianProfile"
          @go-list="backToGuardians"
        />
        <ContactInbox v-else-if="currentView === 'Inbox de contacto'" />
        <PlatformOverview v-else-if="currentView === 'Plataforma'" :permissions="authUser.platformPermissions || []" @navigate="navigate" />
        <PlatformDemo v-else-if="currentView === 'Colegios demo'" :permissions="authUser.platformPermissions || []" />
        <PlatformPeople v-else-if="currentView === 'Buscar gente'" @navigate="navigate" />
        <PlatformTenants
          v-else-if="currentView === 'Colegios' || currentView === 'Agregar colegio'"
          :key="platformTenantsKey"
          :mode="currentView === 'Agregar colegio' ? 'create' : 'list'"
          :permissions="authUser.platformPermissions || []"
          @enter-school="enterPlatformSchool"
          @go-list="navigate('Colegios')"
          @go-create="navigate('Agregar colegio')"
          @open-account="openPlatformPerson({ globalUserId: $event })"
        />
        <PlatformAccounts v-else-if="currentView === 'Cuentas'" :key="platformAccountsKey" :permissions="authUser.platformPermissions || []" />
        <PlatformSessions v-else-if="currentView === 'Sesiones'" @navigate="navigate" />
        <PlatformSmtp v-else-if="currentView === 'Correo SMTP'" :permissions="authUser.platformPermissions || []" />
        <PlatformBilling v-else-if="currentView === 'Plataforma pagos'" :permissions="authUser.platformPermissions || []" />
        <IntegrationsSettings
          v-else-if="currentView === 'Integraciones'"
          :tab="integrationsTab"
          @update:tab="setIntegrationsTab"
        />
        <template v-else-if="currentView === 'Agregar estudiantes' && courseDetail">
          <form class="panel enrollment-page" @submit.prevent="saveCourseEnrollments">
        <div class="modal-heading"><div class="modal-title-icon"><UserPlus /></div><div><h2>Matricular en curso</h2><p>Matricula alumnos existentes en {{ courseDetail.name }} · {{ courseDetail.section }}.</p></div><button type="button" class="icon-button" @click="openCourseDetail(courseDetailId)"><X /></button></div>
        <div v-if="enrollmentError" class="login-error account-error">{{ enrollmentError }}</div>
        <label class="field wide"><span>Buscar estudiante</span><input v-model.trim="enrollmentSearch" type="search" placeholder="Nombre o correo" /></label>
        <div v-if="enrollmentLoading" class="staff-loading enrollment-loading"><span class="spinner purple-spinner"></span>Cargando estudiantes...</div>
        <div v-else-if="!enrollmentSearch.trim()" class="enrollment-search-prompt"><Search :size="23" /><strong>Busca por nombre o correo</strong><span>Escribe para ver estudiantes y agregarlos al curso.</span></div>
        <div v-else-if="availableEnrollmentStudents.length" class="enrollment-list permissions-grid">
          <label v-for="student in availableEnrollmentStudents" :key="student.id" :class="{ disabled: student.isEnrolled }"><input v-model="selectedEnrollmentIds" type="checkbox" :value="student.id" :disabled="student.isEnrolled" /><span><Check :size="13" /><div class="enrollment-student"><strong>{{ student.first_name }} {{ student.last_name }}</strong><small v-if="student.isEnrolled" class="already-enrolled">Ya está en el curso</small><small v-else>{{ student.email || 'Sin correo registrado' }}</small></div></span></label>
        </div>
        <EmptyState v-else class="module-empty enrollment-empty">No encontramos estudiantes con ese nombre o correo.</EmptyState>
        <div class="modal-actions"><span class="enrollment-selection-count">{{ selectedEnrollmentIds.length }} seleccionados</span><button type="button" class="secondary-button" @click="openCourseDetail(courseDetailId)">Cancelar</button><button class="primary-button" :disabled="enrollmentSaving || enrollmentLoading || !selectedEnrollmentIds.length"><span v-if="enrollmentSaving" class="spinner"></span><Check v-else :size="18" />{{ enrollmentSaving ? 'Matriculando...' : 'Matricular' }}</button></div>
      </form>
        </template>
        <template v-else-if="isStudentProfileView">
          <div class="profile-page-toolbar student-profile-toolbar">
            <button class="secondary-button student-profile-back" @click="backToStudents"><ArrowLeft :size="16" />Volver</button>
            <div class="student-profile-actions">
              <button
                v-if="studentProfile || studentIdFromRoute()"
                type="button"
                class="secondary-button"
                :class="{ active: studentProfileSection === 'ficha' }"
                :aria-current="studentProfileSection === 'ficha' ? 'page' : undefined"
                @click="openStudentFicha((studentProfile?.student?.id) || studentIdFromRoute())"
              >Ficha</button>
              <button
                v-if="studentProfile || studentIdFromRoute()"
                type="button"
                class="secondary-button"
                :class="{ active: studentProfileSection === 'historial' }"
                :aria-current="studentProfileSection === 'historial' ? 'page' : undefined"
                @click="openStudentHistorial((studentProfile?.student?.id) || studentIdFromRoute())"
              >Historial</button>
              <button
                v-if="studentProfile || studentIdFromRoute()"
                type="button"
                class="secondary-button"
                :class="{ active: studentProfileSection === 'notas' }"
                :aria-current="studentProfileSection === 'notas' ? 'page' : undefined"
                @click="openStudentNotas((studentProfile?.student?.id) || studentIdFromRoute())"
              >Notas</button>
              <button
                v-if="studentProfile || studentIdFromRoute()"
                type="button"
                class="secondary-button"
                :class="{ active: studentProfileSection === 'anotaciones' }"
                :aria-current="studentProfileSection === 'anotaciones' ? 'page' : undefined"
                @click="openStudentAnotaciones((studentProfile?.student?.id) || studentIdFromRoute())"
              >Anotaciones</button>
              <button
                v-if="(authUser.permissions?.manageUsers || ['student', 'guardian'].includes(authUser.role) || authUser.readOnly) && (studentProfile || studentIdFromRoute())"
                type="button"
                class="secondary-button"
                :class="{ active: studentProfileSection === 'apoderados' }"
                :aria-current="studentProfileSection === 'apoderados' ? 'page' : undefined"
                @click="openStudentApoderados((studentProfile?.student?.id) || studentIdFromRoute())"
              >Apoderados</button>
              <button
                v-if="studentProfile && (canManageDocuments || authUser.role === 'teacher')"
                type="button"
                class="secondary-button student-profile-soft"
                @click="showLinkedDocuments('studentId', studentProfile.student.id, studentProfile.student.first_name)"
              >
                <FileText :size="15" />Documentos
              </button>
              <button
                v-if="studentProfile && canOpenCommunications"
                type="button"
                class="secondary-button student-profile-soft"
                @click="openStudentCommunication(studentProfile.student)"
              >
                <Send :size="15" />Comunicado
              </button>
              <button
                v-if="studentProfileSection === 'ficha' && authUser.permissions?.manageUsers && studentProfile && !hasActiveEnrollment"
                type="button"
                class="primary-button student-profile-primary"
                @click="focusStudentEnrollment"
              >
                <UserPlus :size="15" />Matricular
              </button>
              <button v-if="studentProfileSection === 'notas' && authUser.permissions?.manageGrades && studentProfile" type="button" class="primary-button student-profile-primary" @click="openGradePage(studentProfile.student.id)"><Plus :size="15" />Nueva nota</button>
              <button v-if="studentProfileSection === 'anotaciones' && canAddStudentRecord && studentProfile" type="button" class="primary-button student-profile-primary" @click="openManagement('observation', '', { studentId: studentProfile.student.id })"><Plus :size="15" />Nueva anotación</button>
              <button
                v-if="canDeactivateStudent && studentProfile && (studentProfile.student.active !== false && studentProfile.student.active !== 0)"
                type="button"
                class="secondary-button danger-button student-profile-delete"
                :disabled="deactivatingStudent"
                @click="deactivateStudent"
              ><Trash2 :size="15" />Dar de baja</button>
              <button
                v-else-if="canDeactivateStudent && studentProfile && (studentProfile.student.active === false || studentProfile.student.active === 0)"
                type="button"
                class="primary-button student-profile-primary"
                :disabled="deactivatingStudent"
                @click="restoreStudent"
              ><Check :size="15" />Reactivar</button>
            </div>
          </div>
          <article class="panel student-profile-page">
            <div v-if="studentProfileLoading" class="staff-loading"><span class="spinner purple-spinner"></span>{{ studentProfileSection === 'ficha' ? 'Cargando ficha...' : studentProfileSection === 'historial' ? 'Cargando historial...' : studentProfileSection === 'apoderados' ? 'Cargando apoderados...' : studentProfileSection === 'anotaciones' ? 'Cargando anotaciones...' : 'Cargando calificaciones...' }}</div>
            <template v-else-if="studentProfile">
              <template v-if="studentProfileSection === 'ficha'">
              <div class="student-ficha-layout">
              <section class="student-ficha-card student-ficha-identity">
                <div class="profile-summary">
                <div class="profile-avatar-wrap">
                  <button v-if="profileAvatar" type="button" class="avatar large profile-avatar-preview" aria-label="Ver avatar en pantalla completa" title="Ver imagen completa" :style="{ background: studentProfile.student.avatar_color }" @click="fullImagePreview = profileAvatar"><img :src="profileAvatar" alt="Avatar del estudiante" /></button>
                  <div
                    v-else
                    class="avatar large profile-avatar-fallback"
                    :style="{ background: studentProfile.student.avatar_color || studentProfile.student.avatarColor || 'var(--color-primary-soft)' }"
                    role="img"
                    :aria-label="`Avatar de ${studentProfile.student.first_name} ${studentProfile.student.last_name}`"
                  >
                    <User :size="34" stroke-width="1.75" />
                    <span>{{ initials(studentProfile.student.first_name, studentProfile.student.last_name) || 'ES' }}</span>
                  </div>
                  <button
                    v-if="studentProfileSection === 'ficha' && authUser.permissions?.manageUsers && profileAvatar"
                    type="button"
                    class="profile-avatar-remove"
                    aria-label="Quitar foto del estudiante"
                    title="Quitar foto"
                    @click="removeAvatar"
                  >
                    <X :size="14" />
                  </button>
                  <label v-if="studentProfileSection === 'ficha' && authUser.permissions?.manageUsers" class="profile-avatar-action" :aria-label="profileAvatar ? 'Cambiar foto del estudiante' : 'Agregar foto del estudiante'" :title="profileAvatar ? 'Cambiar foto' : 'Agregar foto'"><Camera :size="14" /><input type="file" accept="image/png,image/jpeg" @change="uploadAvatar" /></label>
                </div>
                <div class="profile-identity">
                  <span class="student-profile-eyebrow">Ficha del estudiante</span>
                  <h3>{{ studentProfile.student.first_name }} {{ studentProfile.student.last_name }}</h3>
                  <p>{{ studentIdentifierLabel(studentProfile.student) }} <span aria-hidden="true">·</span> {{ studentProfile.student.email || 'Sin correo registrado' }}</p>
                  <div class="student-identity-status">
                    <StatusBadge :value="studentProfile.student.active === false || studentProfile.student.active === 0 ? 'inactive' : 'active'" />
                    <span><CalendarDays :size="14" />Año académico {{ studentProfile.currentAcademicYear || '—' }}</span>
                    <span v-if="hasActiveEnrollment" class="student-enrollment-chip"><BookOpen :size="14" />{{ studentEnrollmentGroups[0]?.name }} · {{ studentEnrollmentGroups[0]?.section }}</span>
                    <span v-else class="student-enrollment-chip is-empty"><BookOpen :size="14" />Sin matrícula</span>
                  </div>
                </div>
                </div>
              </section>

              <section class="student-ficha-card student-ficha-metrics" aria-label="Resumen académico">
                <div class="profile-metrics">
                  <span>Promedio<strong :class="gradeClass(studentProfileMetrics.average)">{{ studentProfileMetrics.average || '—' }}</strong></span>
                  <button type="button" class="profile-metric-button" @click="openStudentNotas(studentProfile.student.id)">Notas<strong>{{ studentProfileMetrics.grade_count }}</strong></button>
                  <button type="button" class="profile-metric-button" @click="openStudentAnotaciones(studentProfile.student.id)">Anotaciones<strong>{{ (studentProfile.observations || []).length }}</strong></button>
                  <span v-if="studentProfile.attendance?.percentage != null">Asistencia<strong>{{ studentProfile.attendance.percentage }}%</strong></span>
                  <span v-else>Asistencia<strong>—</strong></span>
                </div>
              </section>

              <section class="student-ficha-card student-course-management student-facts-section">
                <div class="section-heading">
                  <div>
                    <h3>Datos del estudiante</h3>
                    <p>Información básica del alumno.</p>
                  </div>
                </div>
                <dl class="student-profile-facts">
                  <div><dt>Nombre completo</dt><dd>{{ studentProfile.student.first_name }} {{ studentProfile.student.last_name }}</dd></div>
                  <div><dt>{{ String(studentProfile.student.identifier_type || 'rut').toUpperCase() }}</dt><dd>{{ studentIdentifierLabel(studentProfile.student) }}</dd></div>
                  <div><dt>Correo electrónico</dt><dd>{{ studentProfile.student.email || 'Sin correo registrado' }}</dd></div>
                  <div><dt>Año de ingreso</dt><dd>{{ studentProfile.student.admission_year || '—' }}</dd></div>
                  <div><dt>Estado</dt><dd><StatusBadge :value="studentProfile.student.active === false || studentProfile.student.active === 0 ? 'inactive' : 'active'" /></dd></div>
                  <div v-if="studentProfile.student.userId && authUser.permissions?.manageUsers"><dt>Acceso plataforma</dt><dd>{{ studentProfile.student.platformAccess === false || studentProfile.student.platformAccess === 0 ? 'Revocado' : 'Activo' }}</dd></div>
                  <div v-if="studentProfile.attendance"><dt>Asistencia</dt><dd><template v-if="studentProfile.attendance.percentage != null">{{ studentProfile.attendance.percentage }}%<small>{{ studentProfile.attendance.present + studentProfile.attendance.late }} de {{ studentProfile.attendance.total }} registros</small></template><template v-else>Sin registros</template></dd></div>
                  <div><dt>Año académico</dt><dd>{{ studentProfile.currentAcademicYear || '—' }}</dd></div>
                </dl>
                <div v-if="authUser.permissions?.manageUsers" class="student-profile-access-actions">
                  <button
                    v-if="studentProfile.student.userId && (studentProfile.student.platformAccess === false || studentProfile.student.platformAccess === 0)"
                    type="button"
                    class="secondary-button"
                    :disabled="deactivatingStudent"
                    @click="setStudentPlatformAccess(true)"
                  >Restaurar acceso a la plataforma</button>
                  <button
                    v-else-if="studentProfile.student.userId && (studentProfile.student.active === false || studentProfile.student.active === 0)"
                    type="button"
                    class="secondary-button danger-button"
                    :disabled="deactivatingStudent"
                    @click="setStudentPlatformAccess(false)"
                  >Revocar acceso a la plataforma</button>
                </div>
              </section>

              <section v-if="authUser.permissions?.manageUsers" class="student-ficha-card student-course-management student-enrollment-first" data-student-enrollment>
                <div class="section-heading">
                  <div>
                    <h3>{{ hasActiveEnrollment ? 'Matrícula' : 'Matricular' }}</h3>
                    <p v-if="hasActiveEnrollment">Cursos y asignaturas del estudiante.</p>
                    <p v-else>Este estudiante aún no está matriculado. Elige un curso para inscribirlo.</p>
                  </div>
                </div>
                <form v-if="!hasActiveEnrollment && unenrolledClassOptions.length" class="student-course-add" @submit.prevent="saveStudentCourse()">
                  <label class="field"><span>Curso</span>
                    <select v-model="studentCourseId" required>
                      <option value="" disabled>Selecciona un curso</option>
                      <option v-for="course in unenrolledClassOptions" :key="course.id" :value="course.id">{{ classLabel(course) }}</option>
                    </select>
                  </label>
                  <div class="student-course-add-actions">
                    <button class="primary-button" type="submit" :disabled="studentCourseSaving || !studentCourseId">
                      <UserPlus :size="16" />Matricular en curso
                    </button>
                  </div>
                </form>
                <EmptyState v-else-if="!hasActiveEnrollment && !unenrolledClassOptions.length" class="module-empty">
                  <BookOpen :size="28" />
                  <strong>Sin cursos disponibles</strong>
                  <span>Crea un curso primero para poder matricular a este estudiante.</span>
                  <button v-if="canManageAcademicStructure" type="button" class="primary-button" @click="openNewCoursePage"><Plus :size="16" />Nuevo curso</button>
                </EmptyState>
                <p v-else-if="hasActiveEnrollment" class="field-help">El estudiante está en un curso. Retíralo si necesitas matricularlo en otro.</p>
                <template v-if="studentEnrollmentGroups[0]">
                  <div class="student-enrollment-summary">
                    <div>
                      <strong>{{ studentEnrollmentGroups[0].name }} · {{ studentEnrollmentGroups[0].section }}</strong>
                      <small>{{ studentEnrollmentGroups[0].modules.length }} asignatura{{ studentEnrollmentGroups[0].modules.length === 1 ? '' : 's' }}{{ studentEnrollmentGroups[0].exemptCount ? ` · ${studentEnrollmentGroups[0].exemptCount} eximida${studentEnrollmentGroups[0].exemptCount === 1 ? '' : 's'}` : '' }}</small>
                    </div>
                    <div class="course-row-actions enrollment-actions">
                      <button type="button" class="edit-button" @click="openCourseDetail(studentEnrollmentGroups[0].courseId)"><Eye :size="14" />Ver curso</button>
                      <button type="button" class="edit-button danger-button" :disabled="removingStudent" @click="removeFromCourse(studentProfile.student.id, studentEnrollmentGroups[0].courseId)">Retirar</button>
                    </div>
                  </div>
                  <p class="field-help">Puedes eximir una asignatura puntual sin retirar al estudiante del curso.</p>
                  <div class="table-scroll">
                    <DataTable>
                      <thead><tr><th>Asignatura</th><th>Estado</th><th></th></tr></thead>
                      <tbody>
                        <tr
                          v-for="entry in studentEnrollmentGroups[0].modules"
                          :key="entry.id"
                          class="student-enrollment-subject-row"
                        >
                          <td>
                            <button type="button" class="edit-button enrollment-link subject-color-chip" :style="{ '--subject-color': subjectColor(entry.color) }" @click="openCourseSubject(entry.id)">
                              <i class="subject-color-dot" aria-hidden="true"></i>{{ entry.subject }}
                              <ChevronRight :size="14" />
                            </button>
                          </td>
                          <td><StatusBadge :value="entry.status === 'exempt' ? 'exempt' : 'active'" /></td>
                          <td>
                            <button type="button" class="edit-button" :disabled="studentCourseSaving" @click="saveStudentCourse(entry.id, entry.status === 'exempt' ? 'active' : 'exempt')">
                              {{ entry.status === 'exempt' ? 'Reincorporar' : 'Eximir' }}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                </template>
              </section>
              <section v-else class="student-ficha-card student-course-management student-family-ficha student-enrollment-first">
                <div class="section-heading">
                  <div>
                    <h3>Matrícula</h3>
                    <p>Curso y asignaturas en las que está inscrito.</p>
                  </div>
                  <div class="section-heading-actions">
                    <button type="button" class="secondary-button" @click="openStudentNotas(studentProfile.student.id)">
                      <FileText :size="15" />Ver notas
                    </button>
                  </div>
                </div>
                <template v-if="studentEnrollmentGroups[0]">
                  <div class="student-enrollment-summary">
                    <div>
                      <strong>{{ studentEnrollmentGroups[0].name }} · {{ studentEnrollmentGroups[0].section }}</strong>
                      <small>{{ studentEnrollmentGroups[0].modules.length }} asignatura{{ studentEnrollmentGroups[0].modules.length === 1 ? '' : 's' }}{{ studentEnrollmentGroups[0].exemptCount ? ` · ${studentEnrollmentGroups[0].exemptCount} eximida${studentEnrollmentGroups[0].exemptCount === 1 ? '' : 's'}` : '' }}</small>
                    </div>
                  </div>
                  <div class="table-scroll">
                    <DataTable>
                      <thead><tr><th>Asignatura</th><th>Estado</th></tr></thead>
                      <tbody>
                        <tr
                          v-for="entry in studentEnrollmentGroups[0].modules"
                          :key="entry.id"
                          class="student-enrollment-subject-row"
                          tabindex="0"
                          role="link"
                          @click="openCourseSubject(entry.id)"
                          @keydown.enter.prevent="openCourseSubject(entry.id)"
                          @keydown.space.prevent="openCourseSubject(entry.id)"
                        >
                          <td>
                            <button type="button" class="edit-button enrollment-link subject-color-chip" :style="{ '--subject-color': subjectColor(entry.color) }" @click.stop="openCourseSubject(entry.id)">
                              <i class="subject-color-dot" aria-hidden="true"></i>{{ entry.subject }}
                              <ChevronRight :size="14" />
                            </button>
                          </td>
                          <td><StatusBadge :value="entry.status === 'exempt' ? 'exempt' : 'active'" /></td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                </template>
                <EmptyState v-else class="module-empty"><BookOpen :size="28" /><strong>Sin matrícula</strong><span>Este estudiante aún no está inscrito en un curso.</span></EmptyState>
              </section>

              <template v-if="!authUser.permissions?.manageUsers">
                <section v-if="(studentProfile.guardians || []).length" class="student-ficha-card student-family-block">
                <div class="section-heading student-family-contacts-heading">
                  <div>
                    <h3>Familia</h3>
                    <p>Apoderados vinculados a este estudiante.</p>
                  </div>
                </div>
                <div class="table-scroll">
                  <DataTable>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Parentesco</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="guardian in studentProfile.guardians" :key="guardian.id">
                        <td><strong>{{ guardian.full_name }}</strong></td>
                        <td>{{ guardian.relationship || 'Apoderado' }}</td>
                        <td>{{ guardian.email || '—' }}</td>
                        <td>{{ guardian.phone || '—' }}</td>
                      </tr>
                    </tbody>
                  </DataTable>
                </div>
                </section>

                <section v-if="(studentProfile.years || []).length" class="student-ficha-card student-family-block">
                <div class="section-heading student-family-years-heading">
                  <div>
                    <h3>Resumen por año</h3>
                    <p>Promedios disponibles. Abre Historial para ver el detalle de años anteriores.</p>
                  </div>
                  <button type="button" class="secondary-button" @click="openStudentHistorial(studentProfile.student.id)">
                    <History :size="15" />Ver historial
                  </button>
                </div>
                <div class="table-scroll">
                  <DataTable>
                    <thead><tr><th>Año</th><th>Calificaciones</th><th>Promedio</th><th></th></tr></thead>
                    <tbody>
                      <tr v-for="year in studentProfile.years.slice(0, 4)" :key="year.year">
                        <td>{{ year.year }}<small v-if="year.isCurrent" class="student-year-current"> · actual</small></td>
                        <td>{{ year.grade_count }}</td>
                        <td><strong :class="gradeClass(year.average)">{{ year.average || '—' }}</strong></td>
                        <td>
                          <button type="button" class="edit-button" @click="openStudentYearNotas(studentProfile.student.id, year.year)">
                            Ver
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </DataTable>
                </div>
                </section>
              </template>
              <StudentSigeStatus v-if="authUser.permissions?.['sige.view']" class="student-ficha-card" :student-id="studentProfile.student.id" :can-sync="Boolean(authUser.permissions?.['sige.sync'])" />
              </div>
              </template>
              <template v-else-if="studentProfileSection === 'historial'">
              <div class="student-ficha-layout student-historial-layout">
                <section class="student-ficha-card student-ficha-identity">
                  <div class="profile-summary">
                    <div class="profile-avatar-wrap">
                      <button v-if="profileAvatar" type="button" class="avatar large profile-avatar-preview" aria-label="Ver avatar en pantalla completa" title="Ver imagen completa" :style="{ background: studentProfile.student.avatar_color }" @click="fullImagePreview = profileAvatar"><img :src="profileAvatar" alt="Avatar del estudiante" /></button>
                      <div
                        v-else
                        class="avatar large profile-avatar-fallback"
                        :style="{ background: studentProfile.student.avatar_color || studentProfile.student.avatarColor || 'var(--color-primary-soft)' }"
                        role="img"
                        :aria-label="`Avatar de ${studentProfile.student.first_name} ${studentProfile.student.last_name}`"
                      >
                        <User :size="34" stroke-width="1.75" />
                        <span>{{ initials(studentProfile.student.first_name, studentProfile.student.last_name) || 'ES' }}</span>
                      </div>
                    </div>
                    <div class="profile-identity">
                      <span class="student-profile-eyebrow">Historial completo</span>
                      <h3>{{ studentProfile.student.first_name }} {{ studentProfile.student.last_name }}</h3>
                      <p>Matrículas, asignaturas, apoderados, notas, asistencia y cierres por cada año académico.</p>
                    </div>
                  </div>
                </section>

                <section class="student-ficha-card student-historial-years">
                  <div class="section-heading">
                    <div>
                      <h3>Años académicos</h3>
                      <p>Elige un año para ver todo lo registrado en ese período.</p>
                    </div>
                  </div>
                  <div v-if="studentHistoryYears.length" class="student-year-filter student-historial-year-filter" role="tablist" aria-label="Años académicos">
                    <button
                      v-for="year in studentHistoryYears"
                      :key="year.year"
                      type="button"
                      role="tab"
                      :aria-selected="String(selectedStudentYear) === String(year.year)"
                      :class="{ active: String(selectedStudentYear) === String(year.year) }"
                      @click="selectedStudentYear = String(year.year); expandedGradeGroup = ''"
                    >
                      {{ year.year }}
                      <small v-if="year.isCurrent">actual</small>
                    </button>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <History :size="28" />
                    <strong>Sin historial todavía</strong>
                    <span>Cuando haya matrículas o notas de años anteriores, aparecerán aquí.</span>
                  </EmptyState>
                </section>

                <section v-if="studentHistoryYears.length" class="student-ficha-card student-ficha-metrics" aria-label="Resumen del año">
                  <div class="section-heading">
                    <div>
                      <h3>Resumen {{ selectedStudentYear }}</h3>
                      <p>Indicadores del año seleccionado.</p>
                    </div>
                  </div>
                  <div class="student-historial-kpis student-historial-kpis-wide">
                    <article>
                      <span>Promedio</span>
                      <strong :class="gradeClass(studentProfileMetrics.average)">{{ studentProfileMetrics.average || '—' }}</strong>
                    </article>
                    <article>
                      <span>Aprobación</span>
                      <strong>{{ studentProfileMetrics.approval_rate != null ? `${studentProfileMetrics.approval_rate}%` : '—' }}</strong>
                    </article>
                    <article>
                      <span>Asistencia</span>
                      <strong>{{ studentHistoryAttendance?.percentage != null ? `${studentHistoryAttendance.percentage}%` : '—' }}</strong>
                    </article>
                    <article>
                      <span>Matrículas</span>
                      <strong>{{ studentHistoryClasses.length }}</strong>
                    </article>
                    <article>
                      <span>Asignaturas</span>
                      <strong>{{ studentHistoryEnrollments.length }}</strong>
                    </article>
                    <article>
                      <span>Notas</span>
                      <strong>{{ studentProfileMetrics.grade_count || 0 }}</strong>
                    </article>
                  </div>
                </section>

                <section v-if="studentHistoryYears.length" class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Matrículas históricas</h3>
                      <p>Cursos en los que estuvo matriculado en {{ selectedStudentYear }}.</p>
                    </div>
                  </div>
                  <div v-if="studentHistoryClasses.length" class="table-scroll">
                    <DataTable>
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Estado</th>
                          <th>Profesor jefe</th>
                          <th>Asignaturas</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="group in studentHistoryClasses" :key="group.key">
                          <td><strong>{{ group.name }} {{ group.section }}</strong></td>
                          <td>{{ group.statusLabel }}</td>
                          <td>{{ group.teacher || '—' }}</td>
                          <td>{{ group.subjects.length }}</td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <BookOpen :size="28" />
                    <strong>Sin matrículas en {{ selectedStudentYear }}</strong>
                    <span>No hay cursos registrados para este año.</span>
                  </EmptyState>
                </section>

                <section v-if="studentHistoryYears.length" class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Asignaturas históricas</h3>
                      <p>Ramos del año {{ selectedStudentYear }}, con estado de matrícula.</p>
                    </div>
                  </div>
                  <div v-if="studentHistoryEnrollments.length" class="table-scroll">
                    <DataTable>
                      <thead>
                        <tr>
                          <th>Asignatura</th>
                          <th>Curso</th>
                          <th>Profesor</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in studentHistoryEnrollments" :key="`${row.courseId}-${row.status}`">
                          <td>
                            <span class="student-historial-subject">
                              <i :style="{ background: subjectColor(row.color) }"></i>
                              <strong>{{ row.subject }}</strong>
                            </span>
                          </td>
                          <td>{{ row.name }} {{ row.section }}</td>
                          <td>{{ row.teacher || '—' }}</td>
                          <td>{{ historyEnrollmentStatusLabel[row.status] || row.status || '—' }}</td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <ClipboardList :size="28" />
                    <strong>Sin asignaturas en {{ selectedStudentYear }}</strong>
                    <span>No hay ramos históricos para este año.</span>
                  </EmptyState>
                </section>

                <section class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Apoderados</h3>
                      <p>Familia vinculada al estudiante (historial familiar del portal).</p>
                    </div>
                    <button
                      v-if="authUser.permissions?.manageUsers"
                      type="button"
                      class="secondary-button"
                      @click="openStudentApoderados(studentProfile.student.id)"
                    >Gestionar</button>
                  </div>
                  <div v-if="studentHistoryGuardians.length" class="table-scroll">
                    <DataTable>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Parentesco</th>
                          <th>Correo</th>
                          <th>Teléfono</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="guardian in studentHistoryGuardians" :key="guardian.id">
                          <td><strong>{{ guardian.full_name }}</strong></td>
                          <td>{{ guardian.relationship || 'Apoderado' }}</td>
                          <td>{{ guardian.email || '—' }}</td>
                          <td>{{ guardian.phone || '—' }}</td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <Users :size="28" />
                    <strong>Sin apoderados vinculados</strong>
                    <span>Cuando se asigne familia a este estudiante, aparecerá aquí.</span>
                  </EmptyState>
                </section>

                <section v-if="studentHistoryAnnualResults.length" class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Cierre anual</h3>
                      <p>Resultado oficial registrado para {{ selectedStudentYear }}.</p>
                    </div>
                  </div>
                  <div class="table-scroll">
                    <DataTable>
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Promedio</th>
                          <th>Asistencia</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in studentHistoryAnnualResults" :key="row.id">
                          <td><strong>{{ row.courseName }} {{ row.section }}</strong></td>
                          <td><strong :class="gradeClass(row.annualAverage)">{{ row.annualAverage }}</strong></td>
                          <td>{{ row.attendancePercentage != null ? `${row.attendancePercentage}%` : '—' }}</td>
                          <td>{{ historyFinalStatusLabel[row.finalStatus] || row.finalStatus || '—' }}</td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                </section>

                <section v-if="studentHistoryYears.length" class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Notas por asignatura</h3>
                      <p>{{ filteredStudentGrades.length }} evaluaciones en {{ selectedStudentYear }}.</p>
                    </div>
                    <button
                      v-if="authUser.permissions?.manageGrades"
                      type="button"
                      class="secondary-button"
                      @click="openStudentNotas(studentProfile.student.id)"
                    >Ir a notas</button>
                  </div>
                  <div v-if="filteredStudentGrades.length" class="profile-grade-groups">
                    <section
                      v-for="group in studentGradeGroups"
                      :key="`${group.subject}-${group.course}`"
                      class="profile-grade-group"
                      :class="{ open: expandedGradeGroup === `${group.subject}::${group.course}` }"
                      :style="{ '--subject-color': subjectColor(group.color) }"
                    >
                      <button
                        type="button"
                        class="profile-subject-header"
                        :aria-expanded="expandedGradeGroup === `${group.subject}::${group.course}`"
                        @click="toggleGradeGroup(group)"
                      >
                        <span class="profile-subject-icon"><BookOpen :size="18" /></span>
                        <div>
                          <h4>{{ group.subject }}</h4>
                          <p>{{ expandedGradeGroup === `${group.subject}::${group.course}` ? `${group.course} · ${group.grades.length} evaluaciones` : 'Haz clic para ver sus notas' }}</p>
                        </div>
                        <div class="profile-subject-actions">
                          <div v-if="expandedGradeGroup === `${group.subject}::${group.course}`" class="profile-subject-stats">
                            <span>Promedio<strong :class="gradeClass(group.average)">{{ group.average || '—' }}</strong></span>
                          </div>
                          <ChevronDown class="profile-subject-chevron" :size="18" />
                        </div>
                      </button>
                      <template v-if="expandedGradeGroup === `${group.subject}::${group.course}`">
                        <div class="profile-grade-columns"><span>Evaluación</span><span>Peso</span><span>Fecha</span><span>Nota</span></div>
                        <div class="profile-grade-list">
                          <div v-for="grade in group.grades" :key="grade.id" class="profile-grade-row">
                            <i :style="{ background: subjectColor(grade.color || group.color) }"></i>
                            <div>
                              <strong>{{ grade.assessment }}</strong>
                              <span v-if="grade.feedback">{{ grade.feedback }}</span>
                              <span v-else>Sin observaciones</span>
                            </div>
                            <span class="profile-weight">{{ grade.weight }}%</span>
                            <span class="profile-date">{{ formatDate(grade.graded_at) }}</span>
                            <strong class="grade-badge" :class="gradeClass(grade.score)">{{ grade.score }}</strong>
                          </div>
                        </div>
                      </template>
                    </section>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <FileText :size="28" />
                    <strong>Sin calificaciones en {{ selectedStudentYear }}</strong>
                    <span>No hay notas registradas para este año académico.</span>
                  </EmptyState>
                </section>

                <section v-if="studentHistoryYears.length" class="student-ficha-card">
                  <div class="section-heading">
                    <div>
                      <h3>Anotaciones del año</h3>
                      <p>{{ studentHistoryObservations.length }} observaciones en {{ selectedStudentYear }}.</p>
                    </div>
                    <button
                      type="button"
                      class="secondary-button"
                      @click="openStudentAnotaciones(studentProfile.student.id)"
                    >Ver todas</button>
                  </div>
                  <div v-if="studentHistoryObservations.length" class="table-scroll">
                    <DataTable>
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Detalle</th>
                          <th>Curso</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                        v-for="item in studentHistoryObservations"
                        :key="item.id"
                        :class="{ 'clickable-row': !isFamilyStudentView }"
                        :tabindex="isFamilyStudentView ? undefined : 0"
                        :role="isFamilyStudentView ? undefined : 'link'"
                        @click="!isFamilyStudentView && openObservationDetail(item)"
                        @keydown.enter="!isFamilyStudentView && openObservationDetail(item)"
                      >
                          <td>{{ observationKindLabel[item.kind] || item.kind }}</td>
                          <td>{{ item.detail }}</td>
                          <td>{{ item.courseName || '—' }}</td>
                          <td>{{ item.createdAt ? formatDate(String(item.createdAt).slice(0, 10)) : '—' }}</td>
                        </tr>
                      </tbody>
                    </DataTable>
                  </div>
                  <EmptyState v-else class="module-empty">
                    <MessageSquare :size="28" />
                    <strong>Sin anotaciones en {{ selectedStudentYear }}</strong>
                    <span>No hay observaciones registradas para este año.</span>
                  </EmptyState>
                </section>
              </div>
              </template>
              <template v-else>
              <div class="student-ficha-layout student-ficha-other">
              <section class="student-ficha-card student-ficha-identity">
                <div class="profile-summary">
                  <div class="profile-avatar-wrap">
                    <button v-if="profileAvatar" type="button" class="avatar large profile-avatar-preview" aria-label="Ver avatar en pantalla completa" title="Ver imagen completa" :style="{ background: studentProfile.student.avatar_color }" @click="fullImagePreview = profileAvatar"><img :src="profileAvatar" alt="Avatar del estudiante" /></button>
                    <div
                      v-else
                      class="avatar large profile-avatar-fallback"
                      :style="{ background: studentProfile.student.avatar_color || studentProfile.student.avatarColor || 'var(--color-primary-soft)' }"
                      role="img"
                      :aria-label="`Avatar de ${studentProfile.student.first_name} ${studentProfile.student.last_name}`"
                    >
                      <User :size="34" stroke-width="1.75" />
                      <span>{{ initials(studentProfile.student.first_name, studentProfile.student.last_name) || 'ES' }}</span>
                    </div>
                  </div>
                  <div class="profile-identity">
                    <span class="student-profile-eyebrow">{{ studentProfileSection === 'notas' ? 'Calificaciones' : studentProfileSection === 'anotaciones' ? 'Anotaciones' : studentProfileSection === 'apoderados' ? 'Apoderados' : 'Estudiante' }}</span>
                    <h3>{{ studentProfile.student.first_name }} {{ studentProfile.student.last_name }}</h3>
                    <p>{{ studentIdentifierLabel(studentProfile.student) }} <span aria-hidden="true">·</span> {{ studentProfile.student.email || 'Sin correo registrado' }}</p>
                  </div>
                </div>
              </section>
              <div v-if="authUser.role === 'teacher' && studentProfileSection === 'notas'" class="student-recommendation student-ficha-card"><Sparkles :size="18" /><div><strong>Recomendación pedagógica</strong><span>{{ studentRecommendation }}</span></div></div>
              <template v-if="studentProfileSection === 'apoderados'">
              <section v-if="authUser.permissions?.manageUsers" class="student-course-management guardian-assign-section">
                <div class="section-heading">
                  <div>
                    <h3>Apoderados vinculados</h3>
                    <p>Familiares con acceso al portal de este estudiante.</p>
                  </div>
                  <div class="section-heading-actions">
                    <button type="button" class="secondary-button" @click="navigate('Apoderados')">Panel de apoderados</button>
                    <button v-if="studentProfile.guardians?.length" type="button" class="secondary-button" @click="openGuardianEditor('add')"><Plus :size="15" />Agregar otro</button>
                    <button type="button" class="primary-button" @click="openGuardianEditor(studentProfile.guardians?.length ? 'change' : 'add')">
                      <Users :size="17" />{{ studentProfile.guardians?.length ? 'Cambiar apoderado' : 'Asignar apoderado' }}
                    </button>
                  </div>
                </div>
                <div v-if="studentProfile.guardians?.length" class="table-scroll">
                  <DataTable>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>RUT</th>
                        <th>Correo</th>
                        <th>Parentesco</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="guardian in studentProfile.guardians"
                        :key="guardian.id"
                        class="student-directory-row guardian-link-row"
                        tabindex="0"
                        :aria-label="`Abrir ficha de ${guardian.full_name}`"
                        @click="openGuardianProfile(guardian)"
                        @keydown.enter.prevent="openGuardianProfile(guardian)"
                        @keydown.space.prevent="openGuardianProfile(guardian)"
                      >
                        <td>
                          <div class="student-cell">
                            <div>
                              <strong>{{ guardian.full_name }}</strong>
                              <small class="student-hover-hint">Haz clic para abrir ficha →</small>
                            </div>
                          </div>
                        </td>
                        <td>{{ guardian.national_id || '—' }}</td>
                        <td>{{ guardian.email || '—' }}</td>
                        <td>{{ guardian.relationship || 'Apoderado' }}</td>
                        <td>
                          <div class="course-row-actions" @click.stop>
                            <button v-if="canOpenCommunications" type="button" class="edit-button" @click="openGuardianCommunication(guardian)"><Send :size="14" />Comunicado</button>
                            <button v-if="canAddStudentRecord" type="button" class="edit-button" @click="openCitation({ studentId: studentProfile.student.id, guardianId: guardian.id, studentName: `${studentProfile.student.first_name} ${studentProfile.student.last_name}`.trim() })"><CalendarDays :size="14" />Citar</button>
                            <button type="button" class="edit-button" @click="openGuardianEditor('change', guardian.id)">Cambiar</button>
                            <button type="button" class="edit-button danger-button" @click="unlinkGuardian(guardian)">Quitar</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </DataTable>
                </div>
                <EmptyState v-else class="module-empty"><Users :size="28" /><strong>Sin apoderados</strong><span>Usa Asignar apoderado arriba para vincular uno existente o crear una cuenta nueva.</span></EmptyState>
              </section>
              <section v-else class="student-course-management guardian-assign-section">
                <div class="section-heading">
                  <div>
                    <h3>Apoderados vinculados</h3>
                    <p>Familiares registrados en tu ficha{{ authUser.readOnly ? ' histórica' : '' }}.</p>
                  </div>
                </div>
                <div v-if="studentProfile.guardians?.length" class="table-scroll">
                  <DataTable>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>RUT</th>
                        <th>Correo</th>
                        <th>Parentesco</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="guardian in studentProfile.guardians" :key="guardian.id">
                        <td><strong>{{ guardian.full_name }}</strong></td>
                        <td>{{ guardian.national_id || '—' }}</td>
                        <td>{{ guardian.email || '—' }}</td>
                        <td>{{ guardian.relationship || 'Apoderado' }}</td>
                      </tr>
                    </tbody>
                  </DataTable>
                </div>
                <EmptyState v-else class="module-empty"><Users :size="28" /><strong>Sin apoderados</strong><span>No hay familiares vinculados a esta ficha.</span></EmptyState>
              </section>
              </template>
              <template v-else-if="studentProfileSection === 'anotaciones'">
                <div class="section-heading">
                  <div>
                    <h3>Anotaciones</h3>
                    <p>{{ (studentProfile.observations || []).length }} registro{{ (studentProfile.observations || []).length === 1 ? '' : 's' }} en el libro de clases.</p>
                  </div>
                </div>
                <div v-if="(studentProfile.observations || []).length" class="table-scroll">
                  <DataTable>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Curso</th>
                        <th>Detalle</th>
                        <th>Registrado por</th>
                        <th>Fecha</th>
                        <th>Adjunto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in studentProfile.observations"
                        :key="item.id"
                        :class="{ 'clickable-row': !isFamilyStudentView }"
                        :tabindex="isFamilyStudentView ? undefined : 0"
                        :role="isFamilyStudentView ? undefined : 'link'"
                        @click="!isFamilyStudentView && openObservationDetail(item)"
                        @keydown.enter="!isFamilyStudentView && openObservationDetail(item)"
                      >
                        <td><span class="observation-kind-pill" :data-kind="item.kind">{{ enumLabels[item.kind] || item.kind }}</span></td>
                        <td>{{ item.courseName || '—' }}</td>
                        <td>{{ item.detail }}</td>
                        <td>{{ item.createdByName || '—' }}</td>
                        <td>{{ formatDate(item.createdAt) }}</td>
                        <td>
                          <button
                            v-if="observationHasAttachment(item)"
                            type="button"
                            class="edit-button observation-attach-button"
                            :title="item.attachmentName || 'Descargar archivo'"
                            @click.stop="previewObservation(item)"
                          >
                            <Download :size="14" /><span>Descargar</span>
                          </button>
                          <span v-else class="observation-no-file">Sin archivo</span>
                        </td>
                      </tr>
                    </tbody>
                  </DataTable>
                </div>
                <EmptyState v-else class="module-empty student-observations-empty">
                  <MessageSquare :size="28" />
                  <strong>Sin anotaciones</strong>
                  <span>{{ isFamilyStudentView ? 'Cuando el colegio registre observaciones positivas o negativas, aparecerán aquí.' : 'Usa “Nueva anotación” para registrar la primera observación de este estudiante.' }}</span>
                </EmptyState>
              </template>
              <template v-else>
              <div class="profile-grades-heading"><div><h3>Historial de notas</h3><p>{{ filteredStudentGrades.length }} calificaciones {{ selectedStudentYear === 'all' ? 'de todos sus años' : `del año ${selectedStudentYear}` }}</p></div><button type="button" class="all-years-button" :aria-pressed="selectedStudentYear === 'all'" @click="selectedStudentYear = selectedStudentYear === 'all' ? String(studentProfile.currentAcademicYear) : 'all'"><CalendarDays :size="16" />{{ selectedStudentYear === 'all' ? `Volver a ${studentProfile.currentAcademicYear}` : 'Todos los años' }}</button></div>
              <div v-if="selectedStudentYear !== 'all'" class="student-year-navigation"><span>Año académico</span><strong class="current-academic-year">{{ selectedStudentYear }}</strong></div>
              <div v-else class="table-scroll"><DataTable><thead><tr><th>Año</th><th>Calificaciones</th><th>Promedio</th><th></th></tr></thead><tbody><tr v-for="year in studentProfile.years" :key="year.year"><td>{{ year.year }}</td><td>{{ year.grade_count }}</td><td>{{ year.average || '—' }}</td><td><button class="edit-button" @click="selectedStudentYear = String(year.year)">Ver notas</button></td></tr></tbody></DataTable></div>
              <div v-if="selectedStudentYear !== 'all' && filteredStudentGrades.length" class="profile-grade-groups"><section v-for="group in studentGradeGroups" :key="`${group.subject}-${group.course}`" class="profile-grade-group" :class="{ open: expandedGradeGroup === `${group.subject}::${group.course}` }" :style="{ '--subject-color': subjectColor(group.color) }"><button type="button" class="profile-subject-header" :aria-expanded="expandedGradeGroup === `${group.subject}::${group.course}`" @click="toggleGradeGroup(group)"><span class="profile-subject-icon"><BookOpen :size="18" /></span><div><h4>{{ group.subject }}</h4><p>{{ expandedGradeGroup === `${group.subject}::${group.course}` ? `${group.course} · ${group.grades.length} evaluaciones` : 'Haz clic para ver sus notas' }}</p></div><div class="profile-subject-actions"><div v-if="expandedGradeGroup === `${group.subject}::${group.course}`" class="profile-subject-stats"><span>Promedio<strong :class="gradeClass(group.average)">{{ group.average || '—' }}</strong></span></div><ChevronDown class="profile-subject-chevron" :size="18" /></div></button><template v-if="expandedGradeGroup === `${group.subject}::${group.course}`"><div class="profile-grade-columns"><span>Evaluación</span><span>Peso</span><span>Fecha</span><span>Nota</span></div><div class="profile-grade-list"><div v-for="grade in group.grades" :key="grade.id" class="profile-grade-row"><i :style="{ background: subjectColor(grade.color || group.color) }"></i><div><strong>{{ grade.assessment }}</strong><span v-if="grade.feedback">{{ grade.feedback }}</span><span v-else>Sin observaciones</span></div><span class="profile-weight">{{ grade.weight }}%</span><span class="profile-date">{{ formatDate(grade.graded_at) }}</span><strong class="grade-badge" :class="gradeClass(grade.score)">{{ grade.score }}</strong></div></div></template></section></div>
              <div v-else-if="selectedStudentYear !== 'all'" class="empty-grades"><FileText :size="28" /><strong>Sin calificaciones</strong><span>{{ selectedStudentYear === 'all' ? 'Este estudiante todavía no tiene notas registradas.' : `No hay notas registradas para ${selectedStudentYear}.` }}</span></div>
              </template>
              </div>
              </template>
            </template>
          </article>
        </template>

        <template v-else-if="currentView === 'Nuevo empleado' && canManageHr">
          <div class="profile-page-toolbar"><button type="button" class="secondary-button" @click="openEmployeeList('active')"><ArrowLeft :size="16" />Volver a empleados</button></div>
          <form class="panel standalone-form student-create-form" @submit.prevent="saveManagement">
            <div class="account-panel-heading"><span class="admin-icon"><UserPlus /></span><div><h2>Agregar empleado</h2><p>Indica el sueldo líquido. El sistema propone AFP, salud y el sueldo base según la ley chilena; puedes modificarlos.</p></div></div>
            <div v-if="managementError" class="login-error account-error" role="alert">{{ managementError }}</div>
            <div class="form-grid">
              <label class="field wide"><span>Nombre completo</span><input v-model.trim="employeeForm.fullName" required minlength="3" maxlength="120" placeholder="Ej. Carolina Soto" /></label>
              <label class="field wide"><span>Cargo</span>
                <div class="field-select">
                  <select v-model="employeeForm.position" required aria-label="Cargo del empleado">
                    <option value="" disabled>Selecciona un cargo</option>
                    <option v-for="title in employeePositionOptions" :key="title" :value="title">{{ title }}</option>
                  </select>
                  <ChevronDown :size="16" />
                </div>
              </label>
              <label class="field"><span>Tipo de contrato</span>
                <select v-model="employeeForm.contractType" required @change="scheduleEmployeeSalaryEstimate">
                  <option>Indefinido</option>
                  <option>Plazo fijo</option>
                  <option>Honorarios</option>
                  <option>Reemplazo</option>
                </select>
              </label>
              <label class="field"><span>Modalidad</span>
                <select v-model="employeeForm.workModality" required>
                  <option v-for="modality in EMPLOYEE_WORK_MODALITIES" :key="modality" :value="modality">{{ modality }}</option>
                </select>
              </label>
              <label class="field"><span>Fecha de ingreso</span><input v-model="employeeForm.hiredOn" required type="date" @change="scheduleEmployeeSalaryEstimate" /></label>
              <label class="field"><span>Sueldo líquido deseado</span>
                <input v-model.number="employeeForm.netSalary" required type="number" min="1" step="1" placeholder="Ej. 850000" @input="scheduleEmployeeSalaryEstimate" />
                <small class="field-help">Lo que recibirá el trabajador en la transferencia.</small>
              </label>
            </div>

            <FormSection v-if="employeeForm.contractType !== 'Honorarios'" class="permissions-field wide employee-hire-prevision">
              <legend>Previsión sugerida · editable</legend>
              <p>Se recomienda la AFP con menor comisión del período{{ employeeHireDefaults?.parameters?.uf ? ` (UF ${Number(employeeHireDefaults.parameters.uf).toLocaleString('es-CL')})` : '' }} y Fonasa al 7%. Cámbialos si el trabajador ya tiene otra institución.</p>
              <div class="form-grid">
                <label class="field"><span>AFP</span>
                  <select v-model="employeeForm.afp" required @change="scheduleEmployeeSalaryEstimate">
                    <option v-for="afp in employeeHireAfps" :key="afp.name" :value="afp.name">
                      {{ afp.name }} · comisión {{ formatAfpCommission(afp.commission) }}{{ afp.name === employeeRecommendedAfp ? ' · recomendada' : '' }}
                    </option>
                  </select>
                  <small class="field-help">Cotización obligatoria 10% + comisión AFP.</small>
                </label>
                <label class="field"><span>Salud</span>
                  <select v-model="employeeForm.healthSystem" required @change="onEmployeeHealthSystemChange">
                    <option>Fonasa</option>
                    <option>Isapre</option>
                  </select>
                  <small class="field-help">{{ employeeForm.healthSystem === 'Fonasa' ? '7% legal sobre la base imponible.' : 'Plan en UF; no puede ser menor al 7%.' }}</small>
                </label>
                <template v-if="employeeForm.healthSystem === 'Isapre'">
                  <label class="field"><span>Isapre</span>
                    <select v-model="employeeForm.isapreCode" required @change="scheduleEmployeeSalaryEstimate">
                      <option value="" disabled>Selecciona Isapre</option>
                      <option v-for="isapre in employeeHireIsapres" :key="isapre.code" :value="isapre.code">{{ isapre.name }}</option>
                    </select>
                  </label>
                  <label class="field"><span>Plan Isapre (UF)</span>
                    <input v-model.number="employeeForm.isaprePlan" type="number" min="0" step="0.01" placeholder="Ej. 4,2" @input="scheduleEmployeeSalaryEstimate" />
                  </label>
                </template>
                <label class="field"><span>Sueldo base (imponible)</span>
                  <input v-model.number="employeeForm.monthlySalary" required type="number" min="0" step="1" :readonly="!employeeForm.lockBaseSalary" @input="employeeForm.lockBaseSalary = true" />
                  <small class="field-help">{{ employeeForm.lockBaseSalary ? 'Fijado manualmente. Cambia el líquido o AFP para volver a estimar.' : 'Calculado automáticamente desde el líquido.' }}</small>
                </label>
                <label class="switch-field"><input v-model="employeeForm.lockBaseSalary" type="checkbox" @change="!employeeForm.lockBaseSalary && scheduleEmployeeSalaryEstimate()" /><span><i></i><strong>Fijar sueldo base</strong><small>Desactiva el cálculo automático desde el líquido.</small></span></label>
              </div>
            </FormSection>

            <div v-else class="form-grid">
              <label class="field"><span>Honorario mensual</span>
                <input v-model.number="employeeForm.netSalary" required type="number" min="0" step="1" placeholder="Ej. 850000" @input="employeeForm.monthlySalary = Number(employeeForm.netSalary) || ''" />
                <small class="field-help">En honorarios no aplica AFP/Fonasa de dependiente; se guarda el monto indicado.</small>
              </label>
            </div>

            <div v-if="employeeSalaryEstimateError" class="login-error account-error" role="alert">{{ employeeSalaryEstimateError }}</div>
            <article v-if="employeeSalaryEstimate && employeeForm.contractType !== 'Honorarios'" class="panel employee-hire-estimate">
              <header>
                <div>
                  <h3>Estimación legal del mes</h3>
                  <p>{{ employeeSalaryEstimating ? 'Recalculando…' : 'Descuentos previsionales e impuesto único según parámetros del período.' }}</p>
                </div>
                <strong>{{ formatCurrency(employeeSalaryEstimate.achievedNet || employeeSalaryEstimate.totals?.sueldo_liquido || 0) }} líquido</strong>
              </header>
              <dl>
                <div><dt>Sueldo base</dt><dd>{{ formatCurrency(employeeSalaryEstimate.monthlySalary || employeeSalaryEstimate.totals?.sueldo_bruto || 0) }}</dd></div>
                <div v-for="item in (employeeSalaryEstimate.items || []).filter((row) => row.kind === 'deduction' && Number(row.amount))" :key="item.code">
                  <dt>{{ item.label }}</dt><dd>−{{ formatCurrency(item.amount) }}</dd>
                </div>
                <div class="employee-hire-estimate-net"><dt>Líquido estimado</dt><dd>{{ formatCurrency(employeeSalaryEstimate.achievedNet || employeeSalaryEstimate.totals?.sueldo_liquido || 0) }}</dd></div>
                <div v-if="employeeSalaryEstimate.totals?.costo_empresa"><dt>Costo empresa</dt><dd>{{ formatCurrency(employeeSalaryEstimate.totals.costo_empresa) }}</dd></div>
              </dl>
            </article>

            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="openEmployeeList('active')">Cancelar</button>
              <button class="primary-button" :disabled="managementSaving || employeeSalaryEstimating"><span v-if="managementSaving" class="spinner"></span><Check v-else :size="18" />{{ managementSaving ? 'Guardando…' : 'Agregar empleado' }}</button>
            </div>
          </form>
        </template>

        <template v-else-if="currentView === 'Nuevo estudiante' && authUser.permissions?.manageUsers">
          <div class="profile-page-toolbar"><button class="secondary-button" @click="navigate('Estudiantes')"><ArrowLeft :size="16" />Volver a la lista</button></div>
          <form class="panel standalone-form student-create-form" @submit.prevent="saveManagement" @invalid.capture="showStudentValidationSnackbar">
            <div class="account-panel-heading"><span class="admin-icon"><UserPlus /></span><div><h2>Datos del estudiante</h2><p>Crea la cuenta. La matrícula en un curso es opcional y la puedes hacer después.</p></div></div>
            <div class="form-grid">
              <label class="field"><span>Nombre</span><input v-model.trim="studentForm.firstName" required maxlength="80" /></label>
              <label class="field"><span>Apellido</span><input v-model.trim="studentForm.lastName" required maxlength="80" /></label>
              <label class="field"><span>Usuario de acceso</span><input v-model.trim="studentForm.username" required minlength="3" maxlength="150" autocomplete="username" placeholder="Ej. camila.soto" /><small class="field-help">Puede iniciar sesión sin tener correo.</small></label>
              <label class="field"><span>Correo <small>Opcional</small></span><input v-model.trim="studentForm.email" type="email" autocomplete="email" placeholder="Ej. camila@correo.cl" /></label>
              <label class="switch-field password-generator-field wide"><input v-model="studentForm.generateStudentPassword" type="checkbox" /><span><i></i><strong>Generar contraseña segura automáticamente</strong><small>hlquery creará una clave temporal y la mostrará después de crear al estudiante.</small></span></label>
              <label v-if="!studentForm.generateStudentPassword" class="field wide"><span>Contraseña temporal <small>Mínimo 6 caracteres</small></span><input v-model="studentForm.studentPassword" required minlength="6" maxlength="128" type="password" autocomplete="new-password" /></label>
              <FormSection class="permissions-field wide"><legend>Acceso del apoderado (opcional)</legend><div class="form-grid"><label class="field wide"><span>Nombre completo</span><input v-model.trim="studentForm.guardianName" maxlength="120" /></label><label class="field"><span>Correo</span><input v-model.trim="studentForm.guardianEmail" :required="Boolean(studentForm.guardianName)" type="email" maxlength="150" /></label><label class="field"><span>Contraseña temporal</span><input v-model="studentForm.guardianPassword" :required="Boolean(studentForm.guardianName)" minlength="6" maxlength="128" type="password" /></label><label class="field"><span>Parentesco</span><select v-model="studentForm.relationshipKind"><option v-for="option in GUARDIAN_RELATIONSHIP_OPTIONS" :key="option" :value="option">{{ option }}</option></select></label><label v-if="studentForm.relationshipKind === 'Otro'" class="field"><span>Especificar</span><input v-model.trim="studentForm.relationshipOther" :required="Boolean(studentForm.guardianName)" maxlength="60" placeholder="Ej. Abuelo, Tutor…" /></label></div></FormSection>
              <FormSection class="permissions-field wide">
                <legend>Matrícula en curso · opcional</legend>
                <p>Si eliges un curso, el estudiante queda en ese curso con las asignaturas que ya tenga configuradas (no se crean asignaturas nuevas).</p>
                <label class="field wide"><span>Curso</span>
                  <div class="field-select">
                    <select :value="studentForm.courseIds[0] || ''" aria-label="Curso de matrícula" @change="studentForm.courseIds = $event.target.value ? [Number($event.target.value)] : []">
                      <option value="">Sin matricular aún</option>
                      <option v-for="course in classOptions" :key="course.id" :value="course.id">{{ classLabel(course) }}</option>
                    </select>
                    <ChevronDown :size="16" />
                  </div>
                </label>
              </FormSection>
            </div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="navigate('Estudiantes')">Cancelar</button><button class="primary-button" :disabled="managementSaving"><span v-if="managementSaving" class="spinner"></span><Check v-else :size="18" />{{ managementSaving ? 'Creando...' : 'Crear estudiante' }}</button></div>
          </form>
        </template>

        <template v-else-if="currentView === 'Nueva calificación' && authUser.permissions?.manageGrades">
          <div class="profile-page-toolbar">
            <button class="secondary-button" @click="gradeStep === 'form' && form.courseId ? backToGradeCoursePick() : cancelGradePage">
              <ArrowLeft :size="16" />
              {{ gradeStep === 'form' && form.courseId ? 'Cambiar asignatura' : (gradeReturnStudentId ? 'Volver a las notas' : 'Volver a calificaciones') }}
            </button>
          </div>

          <section v-if="gradeStep === 'pick'" class="panel standalone-form grade-create-form">
            <div class="account-panel-heading">
              <span class="admin-icon"><BookOpen /></span>
              <div>
                <h2>Elegir asignatura</h2>
                <p v-if="gradeStudentLocked && studentProfile">Selecciona la asignatura para {{ studentProfile.student.first_name }} {{ studentProfile.student.last_name }}.</p>
                <p v-else>Primero elige la asignatura. Después ingresas la nota.</p>
              </div>
            </div>
            <div v-if="gradeError" class="login-error account-error">{{ gradeError }}</div>
            <div
              v-if="authUser.role === 'teacher'"
              class="grade-scope-note"
              :data-tone="isClassHeadTeacher ? 'head' : 'subject'"
            >
              <span class="grade-scope-icon" aria-hidden="true">
                <GraduationCap v-if="isClassHeadTeacher" :size="18" />
                <ShieldCheck v-else :size="18" />
              </span>
              <div class="grade-scope-copy">
                <p class="grade-scope-kicker">Vista protegida</p>
                <strong>{{ isClassHeadTeacher ? 'Profesor jefe' : 'Solo tus ramos' }}</strong>
                <p class="grade-scope-text">{{ teacherScopeNote }}</p>
              </div>
            </div>
            <EmptyState v-if="!gradeCourses.length" class="module-empty">
              <BookOpen :size="28" />
              <strong>Sin asignaturas</strong>
              <span>{{ gradeStudentLocked ? 'Este estudiante no tiene cursos matriculados.' : 'No hay cursos disponibles.' }}</span>
            </EmptyState>
            <div v-else class="grade-subject-picker">
              <section v-for="group in gradeCoursesByClass" :key="group.key" class="grade-subject-group">
                <header>
                  <strong>{{ group.name }} {{ group.section }}</strong>
                  <span>{{ group.courses.length }} asignaturas</span>
                </header>
                <div class="grade-subject-grid">
                  <button
                    v-for="course in group.courses"
                    :key="course.id"
                    type="button"
                    class="grade-subject-card"
                    :style="{ '--subject-color': subjectColor(course.color) }"
                    @click="selectGradeCourse(course)"
                  >
                    <span class="grade-subject-dot" aria-hidden="true"></span>
                    <strong>{{ course.subject }}</strong>
                    <small>{{ course.teacher || 'Sin profesor asignado' }}</small>
                  </button>
                </div>
              </section>
            </div>
          </section>

          <form v-else class="panel standalone-form grade-create-form" @submit.prevent="saveGrade">
            <div class="account-panel-heading">
              <span class="admin-icon"><Sparkles /></span>
              <div>
                <h2>Ingresar nota</h2>
                <p v-if="selectedGradeCourse">{{ selectedGradeCourse.subject }} · {{ selectedGradeCourse.name }} {{ selectedGradeCourse.section }}</p>
                <p v-else>Registra el resultado de la evaluación.</p>
              </div>
            </div>
            <div v-if="gradeError" class="login-error account-error">{{ gradeError }}</div>
            <div class="form-grid">
              <div v-if="selectedGradeCourse" class="grade-selected-subject wide">
                <span class="grade-subject-dot" :style="{ background: subjectColor(selectedGradeCourse.color) }" aria-hidden="true"></span>
                <div>
                  <strong>{{ selectedGradeCourse.subject }}</strong>
                  <small>{{ selectedGradeCourse.name }} {{ selectedGradeCourse.section }}</small>
                </div>
                <button type="button" class="edit-button" @click="backToGradeCoursePick">Cambiar</button>
              </div>
              <label class="field wide"><span>Estudiante</span>
                <select v-model="form.studentId" required :disabled="gradeStudentLocked || gradeStudentsLoading">
                  <option value="" disabled>{{ gradeStudentsLoading ? 'Cargando estudiantes...' : 'Selecciona un estudiante' }}</option>
                  <option v-for="student in gradeStudents" :key="student.id" :value="student.id">{{ student.first_name }} {{ student.last_name }}</option>
                </select>
                <small v-if="gradeStudentLocked" class="field-help">La nota se agregará a la ficha que estabas viendo.</small>
                <small v-else-if="!gradeStudentsLoading && !gradeStudents.length" class="field-help">Esta asignatura todavía no tiene estudiantes matriculados.</small>
              </label>
              <label class="field wide"><span>Evaluación</span><input v-model.trim="form.assessment" required maxlength="120" placeholder="Ej. Control de fracciones" /></label>
              <label class="field"><span>Nota</span><input v-model="form.score" required type="number" min="1" max="7" step="0.1" placeholder="1,0 - 7,0" /></label>
              <label class="field"><span>Ponderación</span><div class="suffix-input"><input v-model="form.weight" required type="number" min="1" max="100" /><span>%</span></div></label>
              <label class="field wide"><span>Fecha</span><input v-model="form.gradedAt" required type="date" /></label>
              <label class="field wide"><span>Comentario <small>Opcional</small></span><textarea v-model.trim="form.feedback" rows="5" maxlength="500" placeholder="Agrega una observación para el estudiante..."></textarea></label>
            </div>
            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="backToGradeCoursePick">Cambiar asignatura</button>
              <button class="primary-button" :disabled="saving || gradeStudentsLoading || !form.studentId || !form.courseId">
                <span v-if="saving" class="spinner"></span>
                <Check v-else :size="18" />
                {{ saving ? 'Guardando...' : 'Guardar nota' }}
              </button>
            </div>
          </form>
        </template>

        <template v-else-if="currentView === 'Remuneraciones' && canManageHr">
          <PayrollPayments />
        </template>

        <template v-else-if="(currentView === 'Solicitudes' || currentView === 'Nueva solicitud') && canAccessLeave">
          <LeaveRequests
            :key="currentView === 'Nueva solicitud' ? 'leave-create' : leaveRequestsKey"
            :mode="currentView === 'Nueva solicitud' ? 'create' : 'list'"
            :can-approve="canApproveLeave"
            @pending-change="leavePendingCount = $event"
            @go-create="openNewLeavePage"
            @go-list="backToLeaveList"
          />
        </template>

        <template v-else-if="currentView === 'Configurar colegio' && authUser.permissions?.manageSchool">
          <div class="profile-page-toolbar"><button class="secondary-button" @click="navigate('Administración')"><ArrowLeft :size="16" />Volver a administración</button></div>
          <div class="account-shell school-settings-shell">
            <div class="account-tabs" role="tablist" aria-label="Secciones del colegio">
              <button type="button" role="tab" :aria-selected="schoolTab === 'info'" :class="{ active: schoolTab === 'info' }" @click="setSchoolTab('info')">
                <FileText :size="14" /><span>Información<small>Exportar PDF</small></span>
              </button>
              <button type="button" role="tab" :aria-selected="schoolTab === 'institutional'" :class="{ active: schoolTab === 'institutional' }" @click="setSchoolTab('institutional')">
                <Building2 :size="14" /><span>Datos institucionales<small>Nombre y contacto</small></span>
              </button>
              <button type="button" role="tab" :aria-selected="schoolTab === 'levels'" :class="{ active: schoolTab === 'levels' }" @click="setSchoolTab('levels')">
                <GraduationCap :size="14" /><span>Niveles<small>Prekínder a media</small></span>
              </button>
              <button type="button" role="tab" :aria-selected="schoolTab === 'sidepanel'" :class="{ active: schoolTab === 'sidepanel' }" @click="setSchoolTab('sidepanel')">
                <PanelLeft :size="14" /><span>Menú lateral<small>Barra del portal</small></span>
              </button>
              <button type="button" role="tab" :aria-selected="schoolTab === 'banking'" :class="{ active: schoolTab === 'banking' }" @click="setSchoolTab('banking')">
                <CreditCard :size="14" /><span>Cuenta bancaria<small>Nómina y Previred</small></span>
              </button>
              <button type="button" role="tab" :aria-selected="schoolTab === 'jobs'" :class="{ active: schoolTab === 'jobs' }" @click="setSchoolTab('jobs')">
                <Users :size="14" /><span>Cargos<small>Lista para RRHH</small></span>
              </button>
            </div>

            <div v-if="schoolTab === 'info'" class="panel account-panel" role="tabpanel">
              <div class="account-panel-heading">
                <span class="admin-icon"><FileText /></span>
                <div>
                  <h2>Información del colegio</h2>
                  <p>Exporta antecedentes institucionales a PDF profesional para respaldo administrativo.</p>
                </div>
              </div>
              <div class="school-info-export-grid">
                <article v-for="pack in schoolInfoExportPacks" :key="pack.id" class="school-info-export-card" :data-pack="pack.id">
                  <span class="school-info-export-icon"><component :is="pack.icon" :size="18" /></span>
                  <div>
                    <strong>{{ pack.title }}</strong>
                    <p>{{ pack.detail }}</p>
                  </div>
                  <button
                    type="button"
                    class="primary-button"
                    :disabled="Boolean(schoolInfoExportBusy)"
                    @click="exportSchoolInfoPdf(pack.id)"
                  >
                    <span v-if="schoolInfoExportBusy === pack.id" class="spinner"></span>
                    <Download v-else :size="16" />
                    {{ schoolInfoExportBusy === pack.id ? 'Generando…' : 'PDF' }}
                  </button>
                </article>
              </div>
              <p class="field-help school-info-export-note">Los PDF incluyen cabecera institucional, tablas y espacios de firma. Las cuentas bancarias salen enmascaradas por seguridad.</p>
            </div>

            <form v-else-if="schoolTab === 'institutional'" class="panel account-panel" role="tabpanel" @submit.prevent="saveSchoolSettings">
              <div class="account-panel-heading"><span class="admin-icon"><Building2 /></span><div><h2>Datos institucionales</h2><p>Información principal y de contacto del colegio.</p></div></div>
              <div class="form-grid">
                <label class="field wide"><span>Nombre del colegio</span><input v-model.trim="schoolForm.name" required minlength="3" maxlength="150" /></label>
                <label class="field"><span>Identificador</span><input v-model="schoolForm.slug" disabled /><small class="field-help">El identificador interno no se puede modificar.</small></label>
                <label class="field">
                  <span>Rol Base de Datos MINEDUC (RBD)</span>
                  <input v-model.trim="schoolForm.rbd" maxlength="12" inputmode="text" autocomplete="off" placeholder="Ej. 12345-6" />
                  <small class="field-help">Identificador oficial del establecimiento ante MINEDUC / SIGE.</small>
                </label>
                <label class="field"><span>Tipo de colegio</span><select v-model="schoolForm.schoolType"><option value="subvencionado">Subvencionado</option><option value="particular">Particular</option><option value="publico">Público</option></select></label>
                <label class="field">
                  <span>Ciudad</span>
                  <select v-model="schoolForm.city">
                    <option value="">Selecciona una ciudad</option>
                    <option v-for="city in CHILE_CITIES" :key="city" :value="city">{{ city }}</option>
                  </select>
                </label>
                <label class="field"><span>Teléfono</span><input v-model.trim="schoolForm.phone" maxlength="40" autocomplete="tel" placeholder="Ej. +56 2 2345 6789" /></label>
                <label class="field wide"><span>Dirección</span><input v-model.trim="schoolForm.address" maxlength="255" autocomplete="street-address" placeholder="Calle y número" /></label>
                <label class="field"><span>Correo institucional</span><input v-model.trim="schoolForm.email" type="email" maxlength="150" autocomplete="email" placeholder="contacto@colegio.cl" /></label>
                <label class="field"><span>Sitio web</span><input v-model.trim="schoolForm.website" type="url" maxlength="255" autocomplete="url" placeholder="https://colegio.cl" /></label>
              </div>
              <div class="account-actions">
                <button type="button" class="secondary-button" @click="navigate('Administración')">Cancelar</button>
                <button class="primary-button" :disabled="managementSaving"><span v-if="managementSaving" class="spinner"></span><Check v-else :size="18" />{{ managementSaving ? 'Guardando...' : 'Guardar datos' }}</button>
              </div>
            </form>

            <form v-else-if="schoolTab === 'levels'" class="panel account-panel" role="tabpanel" @submit.prevent="saveSchoolSettings">
              <div class="account-panel-heading">
                <span class="admin-icon"><GraduationCap /></span>
                <div>
                  <h2>Niveles que imparte el colegio</h2>
                  <p>Marca Prekínder, Kínder, básica y/o media. Eso filtra el menú de nuevo curso y las plantillas de sugerencias.</p>
                </div>
              </div>
              <div class="education-stages-grid" role="group" aria-label="Niveles educativos">
                <button
                  v-for="stage in educationStageOptions"
                  :key="stage.id"
                  type="button"
                  class="education-stage-card"
                  :class="{ selected: schoolForm.educationStages.includes(stage.id) }"
                  :aria-pressed="schoolForm.educationStages.includes(stage.id)"
                  :disabled="educationStageBusy || managementSaving"
                  @click="toggleEducationStage(stage.id)"
                >
                  <span class="education-stage-check" aria-hidden="true">
                    <Check v-if="schoolForm.educationStages.includes(stage.id)" :size="14" />
                  </span>
                  <span class="education-stage-copy">
                    <strong>{{ stage.name }}</strong>
                    <small>{{ stage.description }}</small>
                    <em v-if="stageGradeCount(stage.id)" class="education-stage-count">
                      {{ stageGradeCount(stage.id) }} grado{{ stageGradeCount(stage.id) === 1 ? '' : 's' }}
                    </em>
                  </span>
                </button>
              </div>
              <p class="field-help">Si quitas un nivel con cursos, verás el listado de grados y al confirmar se eliminarán. Los grados con calificaciones no se pueden borrar.</p>
              <div class="account-actions">
                <button type="button" class="secondary-button" @click="navigate('Administración')">Cancelar</button>
                <button class="primary-button" :disabled="managementSaving || educationStageBusy || !schoolForm.educationStages.length">
                  <span v-if="managementSaving" class="spinner"></span>
                  <Check v-else :size="18" />
                  {{ managementSaving ? 'Guardando...' : 'Guardar niveles' }}
                </button>
              </div>
            </form>

            <div v-else-if="schoolTab === 'sidepanel'" class="panel account-panel" role="tabpanel">
              <div class="account-panel-heading">
                <span class="admin-icon"><PanelLeft /></span>
                <div>
                  <h2>Menú lateral del colegio</h2>
                  <p>Logo, nombre y comportamiento del menú lateral.</p>
                </div>
              </div>

              <section class="sidepanel-settings-block">
                <h3>Colores del menú</h3>
                <p class="field-help" style="margin-top:0">Por defecto fondo <code>#0e2535</code>, texto <code>#f3f7fb</code>, Inter 500 · <code>14.7px</code> (+5%). Los cambios se previsualizan al instante.</p>
                <div class="sidepanel-color-grid">
                  <label class="field sidepanel-color-field">
                    <span>Fondo</span>
                    <div class="sidepanel-color-input">
                      <input v-model="schoolForm.sidebarBgColor" type="color" @input="previewSidebarThemeColors" />
                      <input v-model.trim="schoolForm.sidebarBgColor" maxlength="7" spellcheck="false" @change="previewSidebarThemeColors" />
                    </div>
                  </label>
                  <label class="field sidepanel-color-field">
                    <span>Texto / iconos</span>
                    <div class="sidepanel-color-input">
                      <input v-model="schoolForm.sidebarTextColor" type="color" @input="previewSidebarThemeColors" />
                      <input v-model.trim="schoolForm.sidebarTextColor" maxlength="7" spellcheck="false" @change="previewSidebarThemeColors" />
                    </div>
                  </label>
                </div>
                <label class="field sidepanel-font-size-field">
                  <span>Tamaño de fuente <small>{{ Number(schoolForm.sidebarFontSize).toFixed(1) }} px</small></span>
                  <div class="sidepanel-font-size-row">
                    <input
                      v-model.number="schoolForm.sidebarFontSize"
                      type="range"
                      min="11"
                      max="22"
                      step="0.1"
                      @input="previewSidebarThemeColors"
                    />
                    <input
                      v-model.number="schoolForm.sidebarFontSize"
                      type="number"
                      min="11"
                      max="22"
                      step="0.1"
                      @change="previewSidebarThemeColors"
                    />
                  </div>
                </label>
                <button type="button" class="edit-button" @click="resetSidebarThemeColors">Restablecer tipografía y colores</button>
              </section>

              <section class="sidepanel-settings-block">
                <h3>Comportamiento del menú</h3>
                <label class="switch-field school-logo-sidebar-toggle">
                  <input v-model="schoolForm.sidebarCollapsible" type="checkbox" @change="previewSidebarCollapsibleToggle" />
                  <span>
                    <i></i>
                    <strong>Permitir colapsar secciones</strong>
                    <small>Si está activo, Académico, Estudiantes, etc. se abren y cierran con chevron. Si lo desactivas, todas las secciones quedan siempre visibles.</small>
                  </span>
                </label>
                <label class="switch-field school-logo-sidebar-toggle">
                  <input v-model="schoolForm.sidebarPanelCollapsible" type="checkbox" @change="previewSidebarPanelCollapsibleToggle" />
                  <span>
                    <i></i>
                    <strong>Permitir colapsar el menú</strong>
                    <small>Si está activo, se puede reducir el panel lateral a solo iconos. Si lo desactivas, el menú queda siempre expandido.</small>
                  </span>
                </label>
              </section>

              <section class="sidepanel-settings-block">
                <h3>Logo en el menú</h3>
                <div class="school-logo-editor">
                  <div class="school-logo-preview">
                    <img v-if="schoolLogoPreview" :src="schoolLogoPreview" alt="Logo del colegio" />
                    <span v-else class="school-logo-fallback">{{ (schoolForm.name || 'C').trim().split(/\s+/).map(v => v[0]).slice(0,2).join('').toUpperCase() }}</span>
                  </div>
                  <div>
                    <strong>Archivo del logo</strong>
                    <p>JPG o PNG. Opcional: se muestra en miniatura junto al nombre del colegio.</p>
                    <div class="course-row-actions">
                      <label class="edit-button avatar-upload" :aria-disabled="schoolLogoBusy">{{ schoolLogoBusy ? 'Subiendo…' : 'Subir JPG o PNG' }}<input type="file" accept="image/png,image/jpeg" :disabled="schoolLogoBusy" @change="uploadSchoolLogo" /></label>
                      <button v-if="school.hasLogo || schoolLogoPreview" type="button" class="edit-button" :disabled="schoolLogoBusy" @click="removeSchoolLogo">Quitar logo</button>
                    </div>
                    <label v-if="school.hasLogo || schoolLogoPreview" class="switch-field school-logo-sidebar-toggle">
                      <input
                        v-model="schoolForm.showLogoInSidebar"
                        type="checkbox"
                        @change="previewSidebarLogoToggle"
                      />
                      <span>
                        <i></i>
                        <strong>Mostrar logo en el menú lateral</strong>
                        <small>Si está activo, el menú muestra el logo junto al nombre. Si lo desactivas, solo aparece el nombre del colegio.</small>
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              <div class="account-actions">
                <button type="button" class="secondary-button" @click="navigate('Administración')">Volver</button>
                <button type="button" class="primary-button" :disabled="managementSaving" @click="saveSchoolSettings">
                  <span v-if="managementSaving" class="spinner"></span>
                  <Check v-else :size="18" />
                  {{ managementSaving ? 'Guardando...' : 'Guardar menú lateral' }}
                </button>
              </div>
            </div>

            <form v-else-if="schoolTab === 'banking'" class="panel account-panel" role="tabpanel" @submit.prevent="saveSchoolSettings">
              <div class="account-panel-heading"><span class="admin-icon"><CreditCard /></span><div><h2>Cuenta bancaria de origen</h2><p>Datos de la empresa para archivos de nómina. El número de cuenta se cifra y se muestra parcial.</p></div></div>
              <div class="form-grid">
                <label class="field"><span>Nombre empresa</span><input v-model.trim="schoolForm.banking.companyName" maxlength="150" /></label>
                <label class="field"><span>RUT empresa</span><input v-model.trim="schoolForm.banking.companyRut" placeholder="76123456-7" /></label>
                <label class="field"><span>Banco origen</span><input v-model.trim="schoolForm.banking.originBank" list="school-banks" maxlength="80" /></label>
                <datalist id="school-banks"><option>Banco de Chile</option><option>Banco Estado</option><option>BCI</option><option>Banco Santander</option><option>Scotiabank</option></datalist>
                <label class="field"><span>Tipo cuenta origen</span><select v-model="schoolForm.banking.originAccountType"><option value="">Selecciona</option><option value="corriente">Corriente</option><option value="vista">Vista</option><option value="ahorro">Ahorro</option></select></label>
                <label class="field wide"><span>Número cuenta origen</span><input v-model="schoolForm.banking.originAccountNumber" inputmode="numeric" :placeholder="schoolForm.banking.originAccountNumberMasked || 'Solo dígitos'" /><small v-if="schoolForm.banking.originAccountNumberMasked && !schoolForm.banking.originAccountNumber" class="field-help">Guardada: {{ schoolForm.banking.originAccountNumberMasked }}</small></label>
              </div>
              <div class="account-actions">
                <button type="button" class="secondary-button" @click="navigate('Administración')">Cancelar</button>
                <button class="primary-button" :disabled="managementSaving"><span v-if="managementSaving" class="spinner"></span><Check v-else :size="18" />{{ managementSaving ? 'Guardando...' : 'Guardar cuenta' }}</button>
              </div>
            </form>

            <div v-else class="panel account-panel job-titles-panel" role="tabpanel">
              <div class="account-panel-heading"><span class="admin-icon"><Users /></span><div><h2>Cargos del colegio</h2><p>Haz clic en un cargo para ver a quiénes está asociado. No se puede desactivar si hay empleados activos con ese cargo.</p></div></div>
              <form class="job-title-add" @submit.prevent="saveJobTitle">
                <label class="field"><span>Nuevo cargo</span><input v-model.trim="newJobTitle" required minlength="2" maxlength="100" placeholder="Ej. Coordinador/a PIE" /></label>
                <label class="field job-title-hierarchy-field">
                  <span>Jerarquía <small>Opcional</small></span>
                  <input v-model.trim="newJobTitleHierarchy" type="number" min="1" max="999" inputmode="numeric" placeholder="Ej. 1" />
                </label>
                <button class="primary-button" :disabled="jobTitleSaving || newJobTitle.trim().length < 2">Agregar</button>
              </form>
              <div class="table-scroll">
                <DataTable
                  sortable
                  caption="Cargos del colegio"
                  :rows="sortedJobTitles"
                  :columns="jobTitleColumns"
                  :sort-by="jobTitleSortBy"
                  :sort-dir="jobTitleSortDir"
                  @sort="onJobTitleSort"
                >
                  <template #cell-name="{ row: title }">
                    <button type="button" class="job-title-name-button" @click="openJobTitleEmployees(title)">
                      <strong>{{ title.name }}</strong>
                      <small>Ver asociados</small>
                    </button>
                  </template>
                  <template #cell-employeeCount="{ row: title }">
                    <button type="button" class="job-title-count" @click="openJobTitleEmployees(title)">
                      {{ title.employeeCount || 0 }}
                    </button>
                  </template>
                  <template #cell-hierarchy="{ row: title }">
                    <label class="job-title-hierarchy-inline">
                      <span class="sr-only">Jerarquía de {{ title.name }}</span>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        inputmode="numeric"
                        :value="title.hierarchy ?? ''"
                        :disabled="jobTitleHierarchyBusyId === title.id"
                        placeholder="—"
                        @change="updateJobTitleHierarchy(title, $event)"
                      />
                    </label>
                  </template>
                  <template #cell-actions="{ row: title }">
                    <button
                      type="button"
                      class="edit-button"
                      :disabled="Number(title.employeeCount) > 0"
                      :title="Number(title.employeeCount) > 0 ? 'Cambia el cargo de los empleados asociados antes de desactivar' : 'Desactivar cargo'"
                      @click="removeJobTitle(title)"
                    >Desactivar</button>
                  </template>
                </DataTable>
              </div>
              <EmptyState v-if="!jobTitles.length" class="module-empty">Aún no hay cargos activos.</EmptyState>
            </div>
          </div>
        </template>

        <template v-else-if="currentView === 'Detalle del cargo' && authUser.permissions?.manageSchool">
          <div class="profile-page-toolbar">
            <button type="button" class="secondary-button" @click="backToJobTitles"><ArrowLeft :size="16" />Volver a cargos</button>
          </div>
          <div class="panel-with-pager">
          <section class="panel job-title-employees job-title-employees-page">
            <div class="job-title-employees-head">
              <div>
                <p class="eyebrow">CARGO DEL COLEGIO</p>
                <h2>{{ selectedJobTitle?.name || 'Cargo' }}</h2>
                <p>
                  {{ selectedJobTitle?.employeeCount || jobTitleEmployees.length || 0 }} activo{{ (selectedJobTitle?.employeeCount || jobTitleEmployees.length || 0) === 1 ? '' : 's' }}.
                  Cámbiales el cargo en RRHH si quieres desactivar este título.
                </p>
              </div>
              <div class="job-title-employees-actions">
                <button
                  v-if="(selectedJobTitle?.employeeCount || jobTitleEmployees.length)"
                  type="button"
                  class="secondary-button"
                  @click="openEmployeesByPosition(selectedJobTitle.name)"
                >Ver en RRHH</button>
              </div>
            </div>
            <p v-if="jobTitleEmployeesLoading" role="status">Cargando empleados…</p>
            <p v-else-if="jobTitleEmployeesError" class="login-error" role="alert">{{ jobTitleEmployeesError }}</p>
            <template v-else-if="jobTitleEmployees.length">
            <div class="table-scroll">
              <DataTable
                sortable
                row-clickable
                caption="Empleados del cargo"
                :rows="pagedJobTitleEmployees"
                :columns="jobTitleEmployeeColumns"
                :sort-by="jobTitleEmployeesSortBy"
                :sort-dir="jobTitleEmployeesSortDir"
                @sort="onJobTitleEmployeesSort"
                @row-click="openEmployeeFromJobTitle"
              >
                <template #cell-fullName="{ row: employee }">
                  <strong>{{ employee.fullName }}</strong>
                </template>
                <template #cell-contractType="{ value }">{{ value || '—' }}</template>
                <template #cell-hiredOn="{ value }">{{ value ? formatDate(value) : '—' }}</template>
                <template #cell-actions="{ row: employee }">
                  <button type="button" class="edit-button" @click.stop="openEmployeeFromJobTitle(employee)">
                    Modificar
                  </button>
                </template>
              </DataTable>
            </div>
            </template>
            <EmptyState v-else class="module-empty">No hay empleados activos con este cargo. Ya puedes desactivarlo.</EmptyState>
          </section>
          <TablePagination
            v-if="jobTitleEmployees.length"
            v-model:page="jobTitleEmployeesPage"
            :page-count="jobTitleEmployeesPageCount"
            :range-label="jobTitleEmployeesRangeLabel"
            :show="showJobTitleEmployeesPagination"
          />
          </div>
        </template>

        <template v-else-if="currentView === 'Mi cuenta'">
          <div class="account-shell">
            <div class="account-tabs" role="tablist" aria-label="Secciones de mi cuenta">
              <button type="button" role="tab" :aria-selected="accountTab === 'profile'" :class="{ active: accountTab === 'profile' }" @click="setAccountTab('profile')"><Users :size="17" /><span>Información personal<small>Datos de tu cuenta</small></span></button>
              <button type="button" role="tab" :aria-selected="accountTab === 'security'" :class="{ active: accountTab === 'security' }" @click="setAccountTab('security')"><ShieldCheck :size="17" /><span>Seguridad<small>Cambiar contraseña</small></span></button>
              <button type="button" role="tab" :aria-selected="accountTab === 'access'" :class="{ active: accountTab === 'access' }" @click="setAccountTab('access')"><History :size="17" /><span>Acceso<small>IP, sesiones e historial</small></span></button>
              <button type="button" role="tab" :aria-selected="accountTab === 'notifications'" :class="{ active: accountTab === 'notifications' }" @click="setAccountTab('notifications')"><Bell :size="17" /><span>Notificaciones<small>Solo WhatsApp</small></span></button>
            </div>
            <form v-if="accountTab === 'profile'" class="panel account-panel" role="tabpanel" @submit.prevent="saveOwnProfile">
              <div class="account-panel-heading"><span class="admin-icon"><Users /></span><div><h2>Información personal</h2><p>Actualiza los datos visibles de tu cuenta.</p></div></div>
              <div v-if="accountError" class="login-error account-error">{{ accountError }}</div>
              <div class="form-grid">
                <label class="field wide"><span>Nombre completo</span><input v-model.trim="accountForm.fullName" required minlength="3" maxlength="120" autocomplete="name" /></label>
                <label class="field wide"><span>Usuario o correo de acceso</span><input v-model.trim="accountForm.username" required minlength="3" maxlength="150" autocomplete="username" /></label>
                <label v-if="authUser.position" class="field wide"><span>Cargo laboral</span><input v-model.trim="accountForm.position" minlength="2" maxlength="100" /><small class="field-help">El rol de acceso se administra desde Cuentas.</small></label>
              </div>
              <section class="account-signature-block">
                <div class="account-panel-heading compact">
                  <span class="admin-icon"><PenLine /></span>
                  <div>
                    <h3>Firma</h3>
                    <p>Por defecto se firma con tu nombre. Opcionalmente puedes subir una imagen de tu firma.</p>
                  </div>
                </div>
                <div class="account-signature-editor">
                  <div class="account-signature-preview" :class="{ 'is-image': Boolean(signaturePreview) }">
                    <img v-if="signaturePreview" :src="signaturePreview" alt="Vista previa de tu firma" />
                    <span v-else class="account-signature-name">{{ accountForm.fullName || authUser.fullName || 'Tu nombre' }}</span>
                  </div>
                  <div class="account-signature-actions">
                    <strong>{{ signaturePreview ? 'Firma con imagen' : 'Firma con nombre' }}</strong>
                    <p v-if="signaturePreview">Esta imagen se usará al firmar documentos.</p>
                    <p v-else>Sin imagen: los documentos se firman con tu nombre completo.</p>
                    <div class="course-row-actions">
                      <label class="edit-button avatar-upload" :aria-disabled="signatureBusy">
                        {{ signatureBusy ? 'Subiendo…' : (signaturePreview ? 'Cambiar imagen' : 'Agregar firma') }}
                        <input type="file" accept="image/png,image/jpeg" :disabled="signatureBusy" @change="uploadOwnSignatureImage" />
                      </label>
                      <button
                        v-if="signaturePreview"
                        type="button"
                        class="edit-button"
                        :disabled="signatureBusy"
                        @click="removeOwnSignatureImage"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section v-if="showLinkedSchoolsPrefs" class="account-school-prefs">
                <div class="account-panel-heading compact">
                  <span class="admin-icon"><GraduationCap /></span>
                  <div>
                    <h3>Colegios vinculados</h3>
                    <p>Al iniciar sesión te pediremos elegir colegio porque tienes más de uno. Puedes marcar uno como preferido.</p>
                  </div>
                </div>
                <label class="field wide">
                  <span>Colegio preferido (opcional)</span>
                  <select v-model="accountForm.preferredSchoolId">
                    <option :value="null">Sin preferencia</option>
                    <option
                      v-for="membership in authUser.memberships"
                      :key="membership.id"
                      :value="membership.schoolId"
                    >
                      {{ membership.school?.name || `Colegio #${membership.schoolId}` }}
                    </option>
                  </select>
                  <small class="field-help">
                    Se marca como “Preferido” en la lista al ingresar. Siempre podrás elegir otro.
                  </small>
                </label>
              </section>
              <div class="account-actions"><button class="primary-button" :disabled="accountSaving"><span v-if="accountSaving" class="spinner"></span><Check v-else :size="17" />{{ accountSaving ? 'Guardando...' : 'Guardar cambios' }}</button></div>
            </form>
            <form v-else-if="accountTab === 'security'" class="panel account-panel" role="tabpanel" @submit.prevent="changeOwnPassword">
              <div class="account-panel-heading"><span class="admin-icon"><ShieldCheck /></span><div><h2>Seguridad</h2><p>Cambia la contraseña de acceso.</p></div></div>
              <div v-if="passwordError" class="login-error account-error">{{ passwordError }}</div>
              <div class="form-grid">
                <label class="field wide"><span>Contraseña actual</span><input v-model="passwordForm.currentPassword" required type="password" autocomplete="current-password" /></label>
                <label class="field wide"><span>Nueva contraseña <small>Mínimo 6 caracteres</small></span><input v-model="passwordForm.newPassword" required minlength="6" maxlength="128" type="password" autocomplete="new-password" /></label>
                <label class="field wide"><span>Confirmar nueva contraseña</span><input v-model="passwordForm.confirmPassword" required minlength="6" maxlength="128" type="password" autocomplete="new-password" /></label>
              </div>
              <div class="account-actions"><button class="primary-button" :disabled="passwordSaving"><span v-if="passwordSaving" class="spinner"></span><ShieldCheck v-else :size="17" />{{ passwordSaving ? 'Actualizando...' : 'Cambiar contraseña' }}</button></div>
            </form>
            <div v-else-if="accountTab === 'access'" class="panel account-panel" role="tabpanel">
              <div class="account-panel-heading">
                <span class="admin-icon"><History /></span>
                <div>
                  <h2>Acceso</h2>
                  <p>IP actual, sesiones realmente abiertas e historial de ingresos (incluye cerradas y vencidas).</p>
                </div>
                <button type="button" class="secondary-button account-access-refresh" :disabled="accessLoading || accessBusy" @click="loadAccessInfo">
                  <RefreshCw :size="15" />Actualizar
                </button>
              </div>
              <div v-if="accessError" class="login-error account-error">{{ accessError }}</div>
              <p v-if="accessLoading" class="account-access-loading">Cargando accesos…</p>
              <template v-else-if="accessInfo">
                <div class="account-access-summary">
                  <article>
                    <span>IP que estás usando</span>
                    <strong class="account-access-ip">
                      <span v-if="accessInfo.currentFlag" class="account-access-flag" aria-hidden="true">{{ accessInfo.currentFlag }}</span>
                      <span>{{ accessInfo.currentIp || '—' }}</span>
                    </strong>
                    <small>
                      <template v-if="accessInfo.currentCountry">{{ accessInfo.currentCountry }} · </template>{{ describeAccessAgent(accessInfo.currentUserAgent) }}
                    </small>
                  </article>
                  <article>
                    <span>Sesiones activas</span>
                    <strong>{{ accessInfo.activeCount || 0 }}</strong>
                    <small>{{ accessInfo.currentSession ? 'Incluye esta sesión' : 'Sin registro de sesión actual' }}</small>
                  </article>
                  <article>
                    <span>Última actividad</span>
                    <strong>{{ formatAccessWhen(accessInfo.currentSession?.lastSeenAt || accessInfo.sessions?.[0]?.lastSeenAt) }}</strong>
                    <small>{{ formatAccessIp(accessInfo.currentSession?.ip || accessInfo.sessions?.[0]?.ip, accessInfo.currentSession || accessInfo.sessions?.[0] || { flag: accessInfo.currentFlag, country: accessInfo.currentCountry }) }}</small>
                  </article>
                </div>
                <div class="account-access-toolbar">
                  <p>{{ accessInfo.sessions?.length || 0 }} de {{ accessInfo.sessionLimit || 30 }} sesiones guardadas</p>
                  <button
                    type="button"
                    class="secondary-button"
                    :disabled="accessBusy || (accessInfo.activeCount || 0) <= 1"
                    @click="revokeOtherAccessSessions"
                  >
                    {{ accessBusy ? 'Cerrando…' : 'Cerrar otras sesiones' }}
                  </button>
                </div>
                <div class="table-scroll account-access-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Dispositivo</th>
                        <th>IP</th>
                        <th>Inicio</th>
                        <th>Última actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in pagedAccessSessions" :key="item.id" :class="{ current: item.current }">
                        <td>
                          <span class="account-access-pill" :data-status="item.current ? 'current' : (item.active ? 'active' : 'closed')">
                            {{ item.current ? 'Esta sesión' : (item.active ? 'Activa' : 'Cerrada') }}
                          </span>
                        </td>
                        <td>
                          <strong>{{ describeAccessAgent(item.userAgent) }}</strong>
                          <small>{{ item.userAgent || 'Sin user-agent' }}</small>
                        </td>
                        <td>
                          <div class="account-access-ip-cell">
                            <span v-if="item.flag" class="account-access-flag" :title="item.country || item.countryCode || ''" aria-hidden="true">{{ item.flag }}</span>
                            <div>
                              <code>{{ item.ip || '—' }}</code>
                              <small v-if="item.country">{{ item.country }}</small>
                            </div>
                          </div>
                        </td>
                        <td>{{ formatAccessWhen(item.createdAt) }}</td>
                        <td>{{ formatAccessWhen(item.lastSeenAt) }}</td>
                      </tr>
                      <tr v-if="!pagedAccessSessions.length">
                        <td colspan="5" class="account-access-empty">Todavía no hay historial de acceso para esta cuenta.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  v-model:page="accessSessionsPage"
                  :page-count="accessSessionsPageCount"
                  :range-label="accessSessionsRangeLabel"
                  :show="showAccessSessionsPagination"
                />
              </template>
            </div>
            <form v-else class="panel account-panel" role="tabpanel" @submit.prevent="saveOwnProfile">
              <div class="account-panel-heading"><span class="admin-icon"><Bell /></span><div><h2>WhatsApp</h2><p>Controla si el colegio puede enviarte mensajes por WhatsApp. No afecta el correo ni la campanita de la app.</p></div></div>
              <div v-if="accountError" class="login-error account-error">{{ accountError }}</div>
              <div class="account-notify-card">
                <div class="account-notify-row">
                  <div class="account-notify-copy">
                    <strong>Recibir WhatsApp</strong>
                    <p>Si lo desactivás, no te llegan comunicados por WhatsApp aunque el colegio los envíe a tu grupo.</p>
                    <span class="account-notify-status" :class="accountForm.whatsappOptIn ? 'on' : 'off'">
                      {{ accountForm.whatsappOptIn ? 'Activado' : 'Desactivado' }}
                    </span>
                  </div>
                  <label class="account-notify-switch">
                    <input v-model="accountForm.whatsappOptIn" type="checkbox" />
                    <i aria-hidden="true"></i>
                    <span class="sr-only">{{ accountForm.whatsappOptIn ? 'Desactivar WhatsApp' : 'Activar WhatsApp' }}</span>
                  </label>
                </div>
                <label class="field wide">
                  <span>Teléfono WhatsApp</span>
                  <input
                    v-model.trim="accountForm.phone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    placeholder="+56912345678"
                    :required="accountForm.whatsappOptIn"
                    maxlength="40"
                  />
                  <small class="field-help">Usa código de país. Ejemplo Chile: +56912345678</small>
                </label>
                <p class="account-notify-hint">
                  {{ accountForm.whatsappOptIn
                    ? 'Con WhatsApp activado, el colegio podrá enviarte avisos a este número.'
                    : 'WhatsApp desactivado: se omite tu número al enviar comunicados por ese canal.' }}
                </p>
              </div>
              <div class="account-actions"><button class="primary-button" :disabled="accountSaving"><span v-if="accountSaving" class="spinner"></span><Check v-else :size="17" />{{ accountSaving ? 'Guardando...' : 'Guardar preferencias' }}</button></div>
            </form>
          </div>
        </template>

        <template v-else-if="currentView === 'Resumen'">
          <div
            v-if="authUser.role === 'teacher'"
            class="grade-scope-note teacher-home-cta"
            :data-tone="isClassHeadTeacher ? 'head' : 'subject'"
          >
            <span class="grade-scope-icon" aria-hidden="true">
              <GraduationCap v-if="isClassHeadTeacher" :size="18" />
              <BookOpen v-else :size="18" />
            </span>
            <div class="grade-scope-copy">
              <p class="grade-scope-kicker">{{ isClassHeadTeacher ? 'Rol activo' : 'Alcance' }}</p>
              <strong>{{ isClassHeadTeacher ? 'Profesor jefe' : 'Tus asignaturas' }}</strong>
              <p class="grade-scope-text">{{ teacherScopeNote }}</p>
            </div>
            <button type="button" class="primary-button" @click="navigate('Cursos')">Ver mis asignaturas</button>
          </div>
          <div class="stat-grid attention-grid">
            <StatCard
              v-for="item in attentionItems"
              :key="item.key"
              :tone="item.key"
              :label="item.label"
              :value="item.count"
              :hint="attentionVisual(item.key).hint"
              :icon="attentionVisual(item.key).icon"
              @select="selectAttention(item.key)"
            />
          </div>
          <DashboardCharts v-if="showDashboardCharts" :charts="dashboard.charts" />
          <section class="panel quick-action-panel"><h2>{{ ['guardian', 'student'].includes(authUser.role) ? 'Accesos rápidos' : 'Menú' }}</h2><div class="quick-action-grid"><button v-for="action in quickActions" :key="action.label" class="quick-action-button" @click="action.action"><component :is="action.icon" :size="18" /><span><strong>{{ action.label }}</strong><small>{{ action.detail }}</small></span><ChevronRight :size="16" /></button></div></section>
        </template>

        <template v-else-if="currentView === 'Atención'">
          <div class="panel attention-actions-bar">
            <button type="button" class="secondary-button" @click="backToResumen">
              <ArrowLeft :size="16" />Volver al resumen
            </button>
            <button v-if="attentionDetail?.key === 'unassigned'" type="button" class="secondary-button" @click="navigate('Cursos')">Abrir cursos y asignaturas</button>
            <button v-if="attentionDetail?.key === 'my-students'" type="button" class="secondary-button" @click="navigate('Estudiantes')">Ver lista de estudiantes</button>
            <button v-if="attentionDetail?.key === 'recent-grades' || attentionDetail?.key === 'low-grades'" type="button" class="secondary-button" @click="navigate('Calificaciones')">Abrir calificaciones</button>
            <button v-if="attentionDetail?.key === 'overdue'" type="button" class="secondary-button" @click="navigate('Finanzas')">Abrir finanzas</button>
            <button v-if="attentionDetail?.key === 'attendance-today'" type="button" class="secondary-button" @click="navigate('Asistencia')">Abrir asistencia</button>
            <button v-if="attentionDetail?.key === 'academic-risk'" type="button" class="secondary-button" @click="navigate('Calificaciones')">Abrir calificaciones</button>
          </div>
          <div class="panel-with-pager">
            <section class="panel attention-detail" :data-attention="attentionDetail?.key || attentionKey">
              <div class="panel-header attention-detail-header">
                <div class="attention-detail-heading">
                  <span class="attention-detail-icon" aria-hidden="true">
                    <component :is="attentionVisual(attentionDetail?.key || attentionKey).icon" :size="18" />
                  </span>
                  <div>
                    <h2>{{ attentionDetail?.label || 'Atención' }}</h2>
                    <p>{{ attentionDetail?.definition || 'Revisa el detalle de esta selección.' }}</p>
                  </div>
                </div>
                <label class="field attention-panel-search">
                  <span class="visually-hidden">Buscar</span>
                  <div class="module-search-shell">
                    <Search :size="16" aria-hidden="true" />
                    <input
                      v-model="attentionSearch"
                      type="search"
                      placeholder="Buscar…"
                      aria-label="Buscar en atención"
                    />
                  </div>
                </label>
              </div>
              <template v-if="pagedAttentionRows.length">
                <DataTable
                  sortable
                  :caption="attentionDetail.label"
                  :rows="pagedAttentionRows"
                  :columns="attentionDetail.columns"
                  :sort-by="attentionSortBy"
                  :sort-dir="attentionSortDir"
                  @sort="onAttentionSort"
                >
                  <template #cell-student="{ row, value }">
                    <button
                      v-if="row.studentId"
                      type="button"
                      class="student-cell student-cell-link"
                      :aria-label="attentionDetail.key === 'academic-risk' ? `Registrar nota para ${value}` : `Ver ficha de ${value}`"
                      @click="openAttentionStudent(row)"
                    ><strong>{{ value }}</strong><ChevronRight :size="14" /></button>
                    <span v-else>{{ value }}</span>
                  </template>
                  <template #cell-course="{ row, value }">
                    <div
                      v-if="attentionDetail.key === 'academic-risk' && Array.isArray(row.courses) && row.courses.length"
                      class="attention-course-cell"
                    >
                      <span v-if="row.courses.length === 1" class="attention-course-chip">{{ row.courses[0] }}</span>
                      <details v-else class="attention-course-menu">
                        <summary>
                          <span class="attention-course-chip attention-course-chip-trigger">
                            {{ row.courses.length }} asignaturas
                          </span>
                          <ChevronDown :size="14" aria-hidden="true" />
                        </summary>
                        <ul>
                          <li v-for="(courseName, index) in row.courses" :key="`${row.studentId}-${index}`">
                            <span class="attention-course-chip">{{ courseName }}</span>
                          </li>
                        </ul>
                      </details>
                    </div>
                    <span v-else>{{ value }}</span>
                  </template>
                  <template #cell-subject="{ row, value }">
                    <button
                      v-if="attentionDetail.key === 'unassigned' && row.id"
                      type="button"
                      class="student-cell student-cell-link"
                      :aria-label="`Asignar profesor a ${value}`"
                      @click="openAttentionUnassigned(row)"
                    ><strong>{{ value }}</strong><ChevronRight :size="14" /></button>
                    <span v-else>{{ value }}</span>
                  </template>
                  <template #cell-status="{ value }"><StatusBadge :value="value" /></template>
                  <template #cell-average="{ value }"><strong class="grade-badge" :class="gradeClass(value)">{{ value }}</strong></template>
                  <template #cell-score="{ value }"><strong class="grade-badge" :class="gradeClass(value)">{{ value }}</strong></template>
                </DataTable>
              </template>
              <EmptyState v-else-if="attentionDetail && attentionSearch.trim()">
                <strong>Sin resultados</strong>
                <p>No hay registros que coincidan con la búsqueda.</p>
              </EmptyState>
              <EmptyState v-else-if="attentionDetail"><strong>{{ familyAttentionEmpty(attentionDetail.key).title }}</strong><p>{{ familyAttentionEmpty(attentionDetail.key).body }}</p></EmptyState>
              <EmptyState v-else><strong>Sin datos</strong><p>No se encontró esta selección de atención.</p></EmptyState>
            </section>
            <TablePagination
              v-model:page="attentionPage"
              :page-count="attentionPageCount"
              :range-label="attentionRangeLabel"
              :show="showAttentionPagination"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Matrículas'">
          <div class="enrollment-summary-grid">
            <article class="panel enrollment-kpi"><span>Matriculados</span><strong>{{ enrollmentSummary.students }}</strong></article>
            <template v-if="!isPublicSchool">
              <article class="panel enrollment-kpi"><span>Cobrado</span><strong>{{ formatCurrency(enrollmentSummary.billed) }}</strong></article>
              <article class="panel enrollment-kpi"><span>Pagado</span><strong>{{ formatCurrency(enrollmentSummary.paid) }}</strong></article>
              <article class="panel enrollment-kpi" :class="{ warn: enrollmentSummary.balance > 0 }"><span>Saldo pendiente</span><strong>{{ formatCurrency(enrollmentSummary.balance) }}</strong><small v-if="enrollmentSummary.overdue">{{ enrollmentSummary.overdue }} con vencidos</small></article>
            </template>
          </div>

          <div class="panel-with-pager">
          <section class="panel enrollment-balances">
            <div class="enrollment-toolbar">

              <label class="field enrollment-search-field">
                <span>Buscar</span>
                <input v-model.trim="matriculaSearch" type="search" placeholder="Estudiante o curso" />
              </label>
              <label v-if="!isPublicSchool" class="field">
                <span>Estado de cobro</span>
                <select v-model="enrollmentStatusFilter">
                  <option value="">Todos</option>
                  <option value="al_dia">Al día</option>
                  <option value="deuda">Con deuda</option>
                  <option value="vencido">Vencido</option>
                  <option value="sin_cobros">Sin cobros</option>
                </select>
              </label>
              <span class="enrollment-toolbar-meta">{{ filteredEnrollmentRows.length }} de {{ enrollmentRows.length }} estudiantes</span>
            </div>
            <p v-if="enrollmentPaymentsLoading" role="status">Cargando matrículas…</p>
            <div v-else-if="enrollmentPaymentsError" role="alert" class="account-error">{{ enrollmentPaymentsError }} <button type="button" class="secondary-button" @click="loadEnrollmentPayments">Reintentar</button></div>
            <template v-else-if="filteredEnrollmentRows.length">
            <div class="table-scroll">
              <DataTable
                sortable
                caption="Matrículas y saldos"
                :rows="pagedEnrollmentRows"
                :columns="enrollmentColumns"
                :sort-by="enrollmentSortBy"
                :sort-dir="enrollmentSortDir"
                @sort="onEnrollmentSort"
              >
                <template #cell-name="{ row }">
                  <button
                    type="button"
                    class="student-cell student-cell-link enrollment-student-link"
                    :aria-label="`Ver ficha de ${row.name}`"
                    @click="openStudentProfile(row.id)"
                  >
                    <span class="avatar enrollment-student-avatar" :style="{ background: row.avatarColor || row.avatar_color || 'var(--color-primary-soft)' }">
                      <img v-if="studentAvatars[row.id]" :src="studentAvatars[row.id]" alt="" />
                      <template v-else>{{ row.name.split(' ').filter(Boolean).map(v => v[0]).slice(0, 2).join('').toUpperCase() }}</template>
                    </span>
                    <span class="enrollment-student-name">
                      <strong>{{ row.name }}</strong>
                      <small v-if="!isPublicSchool">{{ paymentStatusLabel(row.paymentStatus) }}</small>
                    </span>
                    <ChevronRight :size="14" />
                  </button>
                </template>
                <template #cell-courses="{ row }">
                  <span class="enrollment-courses">{{ row.courses || '—' }}</span>
                </template>
                <template #cell-lastPaymentAt="{ row }">
                  {{ row.lastPaymentAt ? formatDate(row.lastPaymentAt) : 'Sin pagos' }}
                </template>
                <template #cell-nextDueOn="{ row }">
                  <template v-if="row.paymentStatus === 'vencido'">{{ row.overdueCount }} vencido{{ row.overdueCount === 1 ? '' : 's' }}</template>
                  <template v-else-if="row.nextDueOn">{{ formatDate(row.nextDueOn) }}</template>
                  <template v-else>—</template>
                </template>
                <template #cell-paymentStatus="{ row }">
                  <span class="enrollment-status" :data-status="row.paymentStatus" :title="'Automático: ' + paymentStatusLabel(row.paymentStatus)">{{ paymentStatusLabel(row.paymentStatus) }}</span>
                </template>
                <template #cell-billed="{ row }">{{ formatCurrency(row.billed) }}</template>
                <template #cell-paid="{ row }">{{ formatCurrency(row.paid) }}</template>
                <template #cell-balance="{ row }">
                  <strong :class="{ 'enrollment-balance-due': row.balance > 0 }">{{ formatCurrency(row.balance) }}</strong>
                </template>
                <template #cell-actions="{ row }">
                  <button
                    type="button"
                    class="enrollment-pay-button"
                    :aria-label="`Ver pagos de ${row.name}`"
                    @click="openEnrollmentPaymentHistory(row.id)"
                  >
                    <CreditCard :size="15" />
                    Ver pagos
                  </button>
                </template>
              </DataTable>
            </div>
            </template>
            <EmptyState v-else-if="enrollmentRows.length">No hay estudiantes con ese filtro.</EmptyState>
            <EmptyState v-else>No hay estudiantes matriculados todavía.</EmptyState>
          </section>
            <TablePagination
              v-model:page="enrollmentPage"
              :page-count="enrollmentPageCount"
              :range-label="enrollmentRangeLabel"
              :show="showEnrollmentPagination"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Historial de pagos'">
          <div class="panel-with-pager">
          <section class="panel table-panel enrollment-payments">
            <div class="enrollment-payment-filters">
              <label v-if="!paymentStudentId" class="field"><span>Estudiante</span><select v-model="paymentStudentId"><option value="">Todos los estudiantes</option><option v-for="row in enrollmentRows" :key="row.id" :value="String(row.id)">{{ row.name }}</option></select></label>
              <label class="field"><span>Año del pago</span><select v-model="paymentYear"><option value="">Todos los años</option><option v-for="year in enrollmentPaymentYears" :key="year" :value="year">{{ year }}</option></select></label>
              <div class="enrollment-payment-summary">
                <strong>{{ filteredEnrollmentPayments.length }} pagos</strong>
                <span>Total {{ formatCurrency(paymentHistoryTotal) }}</span>
              </div>
            </div>

            <div v-if="selectedPaymentStudent" class="payment-student-card">
              <div>
                <p class="eyebrow">Resumen del estudiante</p>
                <h3>{{ selectedPaymentStudent.name }}</h3>
                <p>{{ paymentStatusLabel(selectedPaymentStudent.paymentStatus) }} · {{ selectedPaymentStudent.courses || 'Sin curso' }}</p>
              </div>
              <div class="payment-student-metrics">
                <div><span>Facturado</span><strong>{{ formatCurrency(selectedPaymentStudent.billed) }}</strong></div>
                <div><span>Pagado</span><strong>{{ formatCurrency(selectedPaymentStudent.paid) }}</strong></div>
                <div><span>Saldo</span><strong>{{ formatCurrency(selectedPaymentStudent.balance) }}</strong></div>
              </div>
              <button
                v-if="canManageFinance"
                type="button"
                class="primary-button"
                @click="openPaymentCredit({ studentId: selectedPaymentStudent.id })"
              >
                <Plus :size="16" />{{ selectedPaymentStudent.openInvoices?.length ? 'Creditar / agregar pago' : 'Agregar abono' }}
              </button>
            </div>

            <div v-if="selectedPaymentStudent?.openInvoices?.length" class="payment-open-invoices">
              <div class="section-heading">
                <div>
                  <h4>Cobros pendientes</h4>
                  <p>{{ selectedPaymentStudent.openInvoices.length }} documentos con saldo</p>
                </div>
              </div>
              <div class="table-scroll">
                <DataTable>
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Vencimiento</th>
                      <th>Estado</th>
                      <th>Saldo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in selectedPaymentStudent.openInvoices" :key="invoice.id">
                      <td>
                        <strong>{{ invoice.number }}</strong>
                        <small>Cobro {{ formatCurrency(invoice.amount) }}</small>
                      </td>
                      <td>{{ invoice.dueOn ? formatDate(invoice.dueOn) : '—' }}</td>
                      <td>{{ formatModuleCell('status', invoice.status) }}</td>
                      <td class="payment-amount">{{ formatCurrency(invoice.remaining) }}</td>
                      <td>
                        <button
                          v-if="canManageFinance"
                          type="button"
                          class="edit-button"
                          @click="openPaymentCredit({ studentId: selectedPaymentStudent.id, invoiceId: invoice.id })"
                        >
                          Creditar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </DataTable>
              </div>
            </div>

            <p v-if="enrollmentPaymentsLoading" role="status">Cargando historial de pagos…</p>
            <div v-else-if="enrollmentPaymentsError" role="alert" class="account-error">{{ enrollmentPaymentsError }} <button type="button" class="secondary-button" @click="loadEnrollmentPayments">Reintentar</button></div>
            <template v-else>
              <div class="section-heading payment-history-heading">
                <div>
                  <h4>Pagos recibidos</h4>
                  <p>Del más reciente al más antiguo</p>
                </div>
              </div>
              <div v-if="filteredEnrollmentPayments.length" class="table-scroll">
                <DataTable>
                  <thead>
                    <tr>
                      <th>Fecha de pago</th>
                      <th v-if="!paymentStudentId">Estudiante</th>
                      <th>Documento</th>
                      <th>Vencimiento</th>
                      <th>Medio</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in pagedEnrollmentPayments" :key="payment.id">
                      <td>
                        <strong>{{ formatDate(payment.paidAt) }}</strong>
                      </td>
                      <td v-if="!paymentStudentId"><button type="button" class="edit-button" @click="openStudentProfile(payment.studentId)">{{ payment.studentName }}</button></td>
                      <td>
                        {{ payment.invoiceNumber }}
                        <small v-if="payment.invoiceStatus === 'cancelled'" class="payment-cancelled">Documento anulado</small>
                        <small v-else-if="payment.invoiceAmount" class="payment-invoice-meta">Cobro {{ formatCurrency(payment.invoiceAmount) }}</small>
                      </td>
                      <td>{{ payment.invoiceDueOn ? formatDate(payment.invoiceDueOn) : '—' }}</td>
                      <td>{{ formatModuleCell('method', payment.method) }}</td>
                      <td class="payment-amount">{{ formatCurrency(payment.amount) }}</td>
                    </tr>
                  </tbody>
                </DataTable>
              </div>
              <EmptyState v-else>
                <template v-if="selectedPaymentStudent?.openInvoices?.length">
                  Todavía no hay pagos registrados. Hay {{ selectedPaymentStudent.openInvoices.length }} cobro(s) pendiente(s) por {{ formatCurrency(selectedPaymentStudent.balance) }}.
                </template>
                <template v-else-if="selectedPaymentStudent">
                  No hay pagos ni cobros pendientes para {{ selectedPaymentStudent.name }}.
                </template>
                <template v-else>
                  No hay pagos registrados para esta selección.
                </template>
              </EmptyState>
            </template>
          </section>
            <TablePagination
              v-model:page="paymentPage"
              :page-count="paymentPageCount"
              :show="paymentPageCount > 1"
            />
          </div>
        </template>


        <template v-else-if="currentView === 'Calificaciones'">
          <div class="panel-with-pager">
            <article class="panel table-panel">
              <div class="panel-header grades-panel-header">
                <div>
                  <h2>Registro de calificaciones</h2>
                  <p>{{ gradeStudentRows.length }} estudiantes encontrados · abre una ficha para ver el detalle completo</p>
                </div>
                <label class="field grades-panel-search">
                  <span class="visually-hidden">Buscar estudiante</span>
                  <div class="module-search-shell">
                    <Search :size="16" aria-hidden="true" />
                    <input
                      v-model="gradeSearch"
                      type="search"
                      placeholder="Buscar estudiante…"
                      aria-label="Buscar estudiante en calificaciones"
                    />
                  </div>
                </label>
              </div>
              <div
                v-if="authUser.role === 'teacher'"
                class="grade-scope-note"
                :data-tone="isClassHeadTeacher ? 'head' : 'subject'"
              >
                <span class="grade-scope-icon" aria-hidden="true">
                  <GraduationCap v-if="isClassHeadTeacher" :size="18" />
                  <BookOpen v-else :size="18" />
                </span>
                <div class="grade-scope-copy">
                  <p class="grade-scope-kicker">{{ isClassHeadTeacher ? 'Rol activo' : 'Alcance' }}</p>
                  <strong>{{ isClassHeadTeacher ? 'Profesor jefe' : 'Solo tus ramos' }}</strong>
                  <p class="grade-scope-text">{{ teacherScopeNote }}</p>
                </div>
              </div>
              <div v-if="gradeStudentRows.length" class="table-scroll">
                <DataTable
                  sortable
                  row-clickable
                  caption="Registro de calificaciones"
                  :rows="pagedGradeStudentRows"
                  :columns="gradeStudentColumns"
                  :sort-by="gradeListSortBy"
                  :sort-dir="gradeListSortDir"
                  @sort="onGradeListSort"
                  @row-click="(row) => openStudentNotas(row.student_id)"
                >
                  <template #cell-student="{ row }">
                    <button type="button" class="student-cell student-cell-link" :aria-label="`Ver notas de ${row.student}`" @click="openStudentNotas(row.student_id)">
                      <span class="avatar" :style="{ background: row.avatar_color }">{{ row.student.split(' ').map(v => v[0]).slice(0, 2).join('') }}</span>
                      <strong>{{ row.student }}</strong>
                      <ChevronRight :size="14" />
                    </button>
                  </template>
                  <template #cell-average="{ value }">
                    <strong class="grade-badge" :class="gradeClass(value)">{{ value || '—' }}</strong>
                  </template>
                  <template #cell-latest="{ value }">{{ formatDate(value) }}</template>
                  <template #cell-actions="{ row }">
                    <button type="button" class="edit-button" @click.stop="openStudentNotas(row.student_id)"><FileText :size="14" />Ver notas</button>
                  </template>
                </DataTable>
              </div>
              <EmptyState v-else class="module-empty">No hay estudiantes que coincidan con la búsqueda.</EmptyState>
            </article>
            <div v-if="gradeStudentRows.length" class="grades-pagination">
              <label class="grades-page-size">
                <span>Por página</span>
                <select v-model.number="gradePageSize" aria-label="Estudiantes por página">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </label>
              <TablePagination
                v-model:page="gradePage"
                :page-count="gradePageCount"
                :range-label="gradeRangeLabel"
                :show="gradePageCount > 1"
              />
            </div>
          </div>
        </template>

        <template v-else-if="currentView === 'Documentos asociados'">
          <article class="panel linked-documents-panel">
            <div class="linked-documents-hero"><button class="secondary-button" @click="backFromDocuments"><ArrowLeft :size="16" />Volver</button><div><span>DOCUMENTOS ASOCIADOS</span><h2>{{ linkedDocumentOwner?.name }}</h2><p>{{ linkedDocuments?.length || 0 }} archivos disponibles para esta ficha</p></div><button v-if="canManageDocuments" class="primary-button" @click="uploadLinkedDocument"><Plus :size="17" />Subir documento</button></div>
            <EmptyState v-if="linkedDocuments && !linkedDocuments.length" class="module-empty linked-documents-empty"><FileText :size="28" />No hay documentos asociados.</EmptyState>
            <div v-if="linkedDocuments?.length" class="linked-document-list">
              <div v-for="document in linkedDocuments" :key="document.id" class="linked-document"><span><FileText :size="17" /><strong>{{ document.name }}</strong><small>{{ document.kind }}</small></span><div class="document-actions"><button class="edit-button" @click="previewDocument(document)"><Eye :size="14" />Ver</button><button class="edit-button" @click="downloadDocument(document)"><Download :size="14" />Descargar</button></div></div>
            </div>
          </article>
        </template>

        <template v-else-if="currentView === 'Subir documento' && canManageDocuments">
          <div class="profile-page-toolbar">
            <button type="button" class="secondary-button" @click="linkedDocumentOwner ? backFromDocuments() : navigate('Documentos')">
              <ArrowLeft :size="16" />{{ linkedDocumentOwner ? 'Volver a la ficha' : 'Volver a documentos' }}
            </button>
          </div>
          <form class="panel standalone-form document-upload-page" @submit.prevent="saveManagement" @invalid.capture="showDocumentValidationSnackbar">
            <div class="account-panel-heading">
              <span class="admin-icon"><Upload /></span>
              <div>
                <h2>Subir archivo</h2>
                <p>Guarda un documento institucional o asociado a un estudiante, empleado o cuenta.</p>
              </div>
            </div>
            <p v-if="managementError" class="login-error account-error" role="alert">{{ managementError }}</p>
            <div class="form-grid document-upload-form">
              <p v-if="linkedDocumentOwner && (documentForm.studentId || documentForm.employeeId || documentForm.userId)" class="wide document-owner-note">
                Documento asociado a <strong>{{ linkedDocumentOwner.name }}</strong>
              </p>
              <label class="field wide">
                <span>Nombre del documento</span>
                <input v-model.trim="documentForm.name" required maxlength="180" placeholder="Ej. Certificado de matrícula" />
              </label>
              <label class="field wide">
                <span>Tipo</span>
                <div class="field-select">
                  <select v-model="documentForm.kind" required aria-label="Tipo de documento">
                    <option v-for="kind in ['General','Certificado','Informe','Matrícula','Contrato']" :key="kind" :value="kind">{{ kind }}</option>
                  </select>
                  <ChevronDown :size="16" />
                </div>
              </label>
              <label v-if="!documentForm.studentId && !documentForm.employeeId && !documentForm.userId" class="field wide">
                <span>Estudiante <small>Opcional</small></span>
                <input v-model="documentStudentSearch" type="search" placeholder="Busca por nombre (mínimo 2 letras)" />
                <div class="document-suggestions">
                  <button type="button" class="edit-button" @click="documentForm.studentId = ''">Documento institucional</button>
                  <button
                    v-for="student in documentStudentOptions"
                    :key="student.id"
                    type="button"
                    class="edit-button"
                    @click="documentForm.studentId = student.id; documentStudentSearch = student.first_name + ' ' + student.last_name"
                  >{{ student.first_name }} {{ student.last_name }}</button>
                  <small>{{ documentForm.studentId ? 'Estudiante seleccionado: ' + (students.find(s => s.id === Number(documentForm.studentId))?.first_name || documentForm.studentId) : 'Documento institucional' }}</small>
                </div>
              </label>
              <label class="field wide document-file-picker" :class="{ filled: documentForm.file }">
                <span><FileText :size="24" />{{ documentForm.file ? documentForm.file.name : 'Seleccionar archivo' }}</span>
                <input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" @change="documentForm.file = $event.target.files[0]" />
                <small class="field-help">{{ documentForm.file ? `${Math.ceil(documentForm.file.size / 1024)} KB · PDF, Office o imagen` : 'PDF, Office o imagen; máximo 25 MB.' }}</small>
              </label>
            </div>
            <div class="modal-actions document-upload-actions">
              <button type="button" class="secondary-button" :disabled="managementSaving" @click="linkedDocumentOwner ? backFromDocuments() : navigate('Documentos')">Cancelar</button>
              <button type="submit" class="primary-button document-upload-submit" :disabled="managementSaving">
                <span v-if="managementSaving" class="spinner"></span>
                <Upload v-else :size="18" />
                {{ managementSaving ? 'Subiendo…' : 'Subir archivo' }}
              </button>
            </div>
          </form>
        </template>

        <template v-else-if="currentView === 'Estudiantes'">
          <div class="panel-with-pager">
          <article class="panel table-panel student-table-panel">
            <div class="panel-header student-directory-header">
              <div>
                <h2>{{ authUser.role === 'guardian' ? 'Mis estudiantes' : 'Lista de estudiantes' }}</h2>
                <p>{{ filteredStudents.length }} {{ authUser.role === 'guardian' ? (filteredStudents.length === 1 ? 'estudiante vinculado' : 'estudiantes vinculados') : 'estudiantes encontrados' }}</p>
              </div>
              <div class="student-directory-tools">
                <label class="student-directory-search">
                  <span class="sr-only">Buscar estudiante</span>
                  <Search :size="16" />
                  <input v-model="studentDirectorySearch" type="search" placeholder="Buscar por nombre, correo, usuario o curso" />
                </label>
                <div v-if="authUser.permissions?.manageUsers" class="segmented-filter">
                  <button type="button" :class="{ active: studentStatusFilter === 'active' }" @click="studentStatusFilter = 'active'">Activos</button>
                  <button type="button" :class="{ active: studentStatusFilter === 'all' }" @click="studentStatusFilter = 'all'">Todos</button>
                </div>
                <div class="segmented-filter" role="group" aria-label="Filtro por matrícula">
                  <button type="button" :class="{ active: studentEnrollmentFilter === 'all' }" @click="studentEnrollmentFilter = 'all'">Con o sin curso</button>
                  <button type="button" :class="{ active: studentEnrollmentFilter === 'enrolled' }" @click="studentEnrollmentFilter = 'enrolled'">Con curso</button>
                  <button type="button" :class="{ active: studentEnrollmentFilter === 'unenrolled' }" @click="studentEnrollmentFilter = 'unenrolled'">Sin curso</button>
                </div>
                <div class="student-grade-filter" role="group" aria-label="Filtro por promedio">
                  <label class="field-select student-grade-filter-select">
                    <span class="sr-only">Filtro de notas</span>
                    <select v-model="studentGradeFilter" aria-label="Filtro de notas">
                      <option value="all">Cualquier promedio</option>
                      <option value="none">Sin notas</option>
                      <option value="lt">Promedio menor a</option>
                      <option value="gt">Promedio mayor a</option>
                    </select>
                    <ChevronDown :size="15" aria-hidden="true" />
                  </label>
                  <label v-if="studentGradeFilter === 'lt' || studentGradeFilter === 'gt'" class="student-grade-threshold">
                    <span class="sr-only">Umbral de promedio</span>
                    <input
                      v-model.number="studentGradeThreshold"
                      type="number"
                      min="1"
                      max="7"
                      step="0.1"
                      inputmode="decimal"
                      aria-label="Umbral de promedio"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class="table-scroll">
              <DataTable
                sortable
                row-clickable
                caption="Lista de estudiantes"
                :rows="pagedFilteredStudents"
                :columns="studentDirectoryColumns"
                :sort-by="studentDirectorySortBy"
                :sort-dir="studentDirectorySortDir"
                @sort="onStudentDirectorySort"
                @row-click="(row) => openStudentProfile(row.id)"
              >
                <template #cell-name="{ row: student }">
                  <div class="student-cell">
                    <span class="avatar" :style="{ background: student.avatar_color }">
                      <img v-if="studentAvatars[student.id]" :src="studentAvatars[student.id]" alt="" />
                      <template v-else>{{ initials(student.first_name, student.last_name) }}</template>
                    </span>
                    <div>
                      <strong>{{ student.first_name }} {{ student.last_name }}</strong>
                      <small class="student-hover-hint">{{ student.active === false ? 'Inactivo · haz clic para ver ficha' : 'Haz clic para ver su ficha →' }}</small>
                    </div>
                  </div>
                </template>
                <template #cell-courses="{ row: student }">
                  <span v-if="student.courses" class="student-course-cell">{{ student.courses }}</span>
                  <span v-else class="student-course-cell is-empty">Sin curso</span>
                </template>
                <template #cell-email="{ row: student }">{{ student.email || '—' }}</template>
                <template #cell-average="{ row: student }">
                  <strong :class="gradeClass(student.average)">{{ student.average || '—' }}</strong>
                </template>
                <template #cell-grade_count="{ row: student }">{{ student.grade_count }}</template>
                <template #cell-actions="{ row: student }">
                  <div class="course-row-actions">
                    <button type="button" class="edit-button student-row-profile-button" @click.stop="openStudentProfile(student.id)"><FileText :size="14" />Ver ficha</button>
                  </div>
                </template>
              </DataTable>
            </div>
            <EmptyState v-if="!filteredStudents.length" class="module-empty">No hay estudiantes que coincidan con la búsqueda.</EmptyState>
          </article>

            <TablePagination
              v-if="filteredStudents.length"
              v-model:page="studentDirectoryPage"
              :page-count="studentDirectoryPageCount"
              :range-label="studentDirectoryRangeLabel"
              :show="true"
            />
            
          </div>
        </template>


        <template v-else-if="currentView === 'Detalle del curso' && courseDetail">
          <div class="profile-page-toolbar course-detail-toolbar">
            <button class="secondary-button" @click="navigate('Cursos')">
              <ArrowLeft :size="16" />{{ authUser.role === 'teacher' ? 'Volver a mis asignaturas' : 'Volver a cursos' }}
            </button>
            <div class="course-detail-actions">
              <button
                v-if="authUser.role !== 'guardian'"
                class="primary-button"
                type="button"
                @click="openCourseClassroom(courseDetail.id, 'tareas')"
              >
                <BookOpen :size="15" />Ir al aula
              </button>
              <button
                v-if="authUser.permissions?.manageUsers"
                class="secondary-button"
                type="button"
                @click="openEnrollmentModal"
              >
                <UserPlus :size="15" />Matricular en curso
              </button>
              <button
                v-if="canConfigureCourseForum"
                class="secondary-button"
                type="button"
                @click="openCourseCommunication(courseDetail.id)"
              >
                <Send :size="15" />Nuevo comunicado
              </button>
              <button
                v-if="canOpenClassroomConfig"
                class="secondary-button"
                type="button"
                @click="openCourseClassroomConfig(courseDetail.id)"
              >
                <Settings :size="15" />Configurar aula
              </button>
            </div>
          </div>
          <article class="panel course-detail-card" :style="{ '--course-color': courseDetail.color }">
            <header class="course-detail-hero">
              <div class="course-detail-heading"><span class="subject-icon"><BookOpen /></span><div><span class="course-detail-eyebrow">{{ courseSiblingCourses.length }} asignatura{{ courseSiblingCourses.length === 1 ? '' : 's' }}</span><h2>{{ courseDetail.name }} · {{ courseDetail.section }}</h2>
                <div class="course-detail-head-teachers" @click.stop>
                  <details
                    v-if="courseDetailHeadTeachers.length > 1"
                    class="course-subject-teachers-menu"
                    @toggle="onRowActionToggle"
                  >
                    <summary class="course-subject-teacher is-menu" title="Profesores jefes del curso">
                      <GraduationCap :size="15" aria-hidden="true" />
                      <span>{{ headTeacherSummary(courseDetailHeadTeachers) }}</span>
                      <ChevronDown :size="14" class="course-subject-teachers-chevron" aria-hidden="true" />
                    </summary>
                    <ul class="course-subject-teachers-panel" role="list">
                      <li v-for="name in courseDetailHeadTeachers" :key="name">{{ name }}</li>
                    </ul>
                  </details>
                  <p v-else>
                    <GraduationCap :size="15" />{{ courseDetailHeadTeachers.length ? `Profesor jefe: ${courseDetailHeadTeachers[0]}` : 'Sin profesor jefe' }}
                  </p>
                </div>
              </div></div>
              <div class="course-detail-stats">
                <div><span><Users :size="16" /></span><div><strong>{{ students.length }}</strong><small>Estudiantes</small></div></div>
                <div><span><BookOpen :size="16" /></span><div><strong>{{ courseSiblingCourses.length }}</strong><small>Asignaturas</small></div></div>
                <div><span><TrendingUp :size="16" /></span><div><strong :class="gradeClass(courseDetail.average)">{{ courseDetail.average || '—' }}</strong><small>Promedio</small></div></div>
              </div>
            </header>

            <section v-if="canManageAcademicStructure" class="course-staffing-panel is-head-full">
              <div class="course-staffing-full">
                <div>
                  <small>Profesores jefes</small>
                  <details
                    v-if="courseDetailHeadTeachers.length > 1"
                    class="course-subject-teachers-menu course-staffing-teachers-menu"
                    @toggle="onRowActionToggle"
                  >
                    <summary class="course-subject-teacher is-menu" title="Ver profesores jefes">
                      <GraduationCap :size="14" aria-hidden="true" />
                      <span>{{ headTeacherSummary(courseDetailHeadTeachers) }}</span>
                      <ChevronDown :size="14" class="course-subject-teachers-chevron" aria-hidden="true" />
                    </summary>
                    <ul class="course-subject-teachers-panel" role="list">
                      <li v-for="name in courseDetailHeadTeachers" :key="name">{{ name }}</li>
                    </ul>
                  </details>
                  <strong v-else>{{ courseDetailHeadTeachers[0] || 'Sin asignar' }}</strong>
                  <p>Lideran el curso completo. Ven todas las notas; editan solo sus ramos. Asigna jefes y profesores de asignatura en Configurar aula.</p>
                </div>
              </div>
            </section>

            <div class="course-subjects-admin">
              <div class="course-subjects-admin-head">
                <div>
                  <h3>Asignaturas del curso</h3>
                  <p>Haz clic en un ramo para ver sus calificaciones y administrarlo.</p>
                </div>
                <button
                  v-if="canManageAcademicStructure"
                  type="button"
                  class="primary-button"
                  @click="openAddCourseSubject"
                >
                  <Plus :size="15" />Nueva asignatura
                </button>
              </div>

              <div v-if="courseSiblingCourses.length" class="course-subjects-list">
                <div
                  class="course-subjects-columns"
                  :class="{ 'is-admin': canManageAcademicStructure }"
                  role="row"
                >
                  <span>Asignatura</span>
                  <span v-if="canManageAcademicStructure">Profesor asignado</span>
                  <span v-if="canManageAcademicStructure" class="course-subjects-col-actions">Acciones</span>
                </div>
                <article
                  v-for="module in courseSiblingCourses"
                  :key="module.id"
                  class="course-subject-row"
                  :class="{ 'is-admin': canManageAcademicStructure }"
                >
                  <button type="button" class="course-subject-main" @click="openCourseSubject(module.id)">
                    <i class="subject-color-dot" :style="{ background: subjectColor(module.color) }" aria-hidden="true"></i>
                    <div>
                      <strong>{{ module.subject }}</strong>
                      <small v-if="!canManageAcademicStructure">{{ subjectTeacherSummary(module.teacher) }}</small>
                    </div>
                  </button>
                  <div v-if="canManageAcademicStructure && renameSubjectId === module.id" class="course-subject-rename">
                    <input v-model.trim="renameSubjectName" maxlength="100" @keydown.enter.prevent="saveRenameCourseSubject(module)" @keydown.esc.prevent="cancelRenameCourseSubject" />
                    <button type="button" class="edit-button" :disabled="renameSubjectBusy || !renameSubjectName.trim()" @click="saveRenameCourseSubject(module)">Guardar</button>
                    <button type="button" class="edit-button" :disabled="renameSubjectBusy" @click="cancelRenameCourseSubject">Cancelar</button>
                  </div>
                  <div v-else-if="canManageAcademicStructure && subjectColorId === module.id" class="course-subject-color-picker">
                    <div class="course-subject-color-copy">
                      <strong>Colores disponibles</strong>
                      <small>Dos asignaturas del mismo curso no pueden compartir color.</small>
                    </div>
                    <div class="course-subject-color-swatches" role="listbox" aria-label="Colores disponibles">
                      <button
                        v-for="color in SUBJECT_COLORS"
                        :key="color"
                        type="button"
                        class="course-subject-swatch"
                        role="option"
                        :aria-selected="normalizeSubjectColor(module.color) === normalizeSubjectColor(color)"
                        :aria-label="`Color ${color}`"
                        :disabled="subjectColorBusy || (isSubjectColorTaken(color, module.id) && normalizeSubjectColor(module.color) !== normalizeSubjectColor(color))"
                        :class="{
                          selected: normalizeSubjectColor(module.color) === normalizeSubjectColor(color),
                          taken: isSubjectColorTaken(color, module.id) && normalizeSubjectColor(module.color) !== normalizeSubjectColor(color),
                        }"
                        :style="{ '--swatch-color': color }"
                        @click="subjectColorCustomPickerOpen = false; saveSubjectColor(module, color)"
                      />
                      <button
                        type="button"
                        class="course-subject-swatch is-custom"
                        role="option"
                        :aria-selected="isCustomSubjectColor(module.color)"
                        :class="{ selected: isCustomSubjectColor(module.color) }"
                        :disabled="subjectColorBusy"
                        :style="isCustomSubjectColor(module.color) ? { '--swatch-color': module.color } : undefined"
                        @click="openSubjectColorCustomPicker(module)"
                      >Custom</button>
                    </div>
                    <label
                      v-if="subjectColorCustomPickerOpen || isCustomSubjectColor(module.color)"
                      class="course-subject-custom-color"
                    >
                      <span>Color personalizado</span>
                      <input
                        :id="`subject-custom-color-${module.id}`"
                        type="color"
                        :value="normalizeSubjectColor(module.color) || '#336699'"
                        :disabled="subjectColorBusy"
                        @change="onSubjectCustomColorInput(module, $event)"
                      />
                    </label>
                    <button type="button" class="edit-button" :disabled="subjectColorBusy" @click="cancelChangeSubjectColor">Cerrar</button>
                  </div>
                  <template v-else-if="canManageAcademicStructure">
                    <div class="course-subject-teacher-cell">
                      <details
                        v-if="parseTeacherList(module.teacher).length > 1"
                        class="course-subject-teachers-menu"
                        @click.stop
                        @toggle="onRowActionToggle"
                      >
                        <summary
                          class="course-subject-teacher is-menu"
                          :title="`Profesores de ${module.subject}`"
                        >
                          <GraduationCap :size="14" aria-hidden="true" />
                          <span>{{ parseTeacherList(module.teacher).length }} profesores</span>
                          <ChevronDown :size="14" class="course-subject-teachers-chevron" aria-hidden="true" />
                        </summary>
                        <ul class="course-subject-teachers-panel" role="list">
                          <li v-for="name in parseTeacherList(module.teacher)" :key="name">{{ name }}</li>
                        </ul>
                      </details>
                      <span
                        v-else
                        class="course-subject-teacher"
                        :class="{ empty: !module.teacher }"
                        :title="module.teacher ? `Profesor de ${module.subject}` : 'Sin profesor de asignatura'"
                      >
                        <GraduationCap :size="14" aria-hidden="true" />
                        {{ subjectTeacherSummary(module.teacher) }}
                      </span>
                    </div>
                    <div class="course-subject-actions">
                      <button type="button" class="edit-button" @click="openCourseSubject(module.id)">
                        <ClipboardList :size="14" />Calificaciones
                      </button>
                      <details class="row-action-menu" @click.stop @toggle="onRowActionToggle">
                        <summary class="row-action-trigger" aria-label="Más acciones de la asignatura"><MoreHorizontal :size="16" /></summary>
                        <div class="row-action-panel">
                          <button type="button" @click="openAssignCourseTeacher(module); $event.currentTarget.closest('details').open = false"><GraduationCap :size="15" />Asignar profesor</button>
                          <button type="button" @click="startRenameCourseSubject(module); $event.currentTarget.closest('details').open = false"><Pencil :size="15" />Renombrar</button>
                          <button type="button" @click="startChangeSubjectColor(module); $event.currentTarget.closest('details').open = false"><Sparkles :size="15" />Cambiar color</button>
                          <button type="button" class="danger" :disabled="removingSubjectId === module.id" @click="removeCourseSubject(module); $event.currentTarget.closest('details').open = false"><Trash2 :size="15" />{{ removingSubjectId === module.id ? 'Quitando…' : 'Quitar' }}</button>
                        </div>
                      </details>
                    </div>
                  </template>
                </article>
              </div>
              <EmptyState v-else class="module-empty">
                <BookOpen :size="28" />
                <strong>Sin asignaturas</strong>
                <span>Agrega la primera asignatura para este curso.</span>
                <button v-if="canManageAcademicStructure" type="button" class="primary-button" @click="openAddCourseSubject"><Plus :size="15" />Nueva asignatura</button>
              </EmptyState>

              <div v-if="addCourseSubjectOpen" id="course-add-subject-panel" class="course-add-subject-panel">
                <div class="course-add-subject-head">
                  <div>
                    <strong>Nueva asignatura en {{ courseDetail.name }} · {{ courseDetail.section }}</strong>
                    <p>Escribe cualquier nombre. Se crea al instante y hereda los estudiantes ya matriculados.</p>
                  </div>
                  <button type="button" class="icon-button" @click="closeAddCourseSubject"><X :size="16" /></button>
                </div>
                <p v-if="addCourseSubjectError" class="login-error account-error">{{ addCourseSubjectError }}</p>
                <div class="course-new-subject-row">
                  <label class="field">
                    <span>Nombre de la asignatura</span>
                    <input
                      id="course-new-subject-input"
                      v-model.trim="addCourseSubjectCustom"
                      maxlength="100"
                      placeholder="Ej. Religión, Taller de robótica, Filosofía…"
                      :disabled="addCourseSubjectBusy"
                      @input="onAddCourseSubjectNameInput"
                      @keydown.enter.prevent="createCourseSubjectNow"
                    />
                  </label>
                  <label class="field course-sige-code-field">
                    <span>Código SIGE <span class="optional-tag">opcional</span></span>
                    <input
                      v-model.trim="addCourseSubjectSigeCode"
                      inputmode="numeric"
                      maxlength="20"
                      placeholder="Se sugiere si el sistema lo conoce"
                      :disabled="addCourseSubjectBusy"
                      @keydown.enter.prevent="createCourseSubjectNow"
                    />
                  </label>
                  <button
                    type="button"
                    class="primary-button course-add-subject-button"
                    :disabled="addCourseSubjectBusy || !addCourseSubjectCustom.trim()"
                    @click="createCourseSubjectNow"
                  >
                    <span v-if="addCourseSubjectBusy" class="spinner"></span>
                    <Plus v-else :size="16" />
                    {{ addCourseSubjectBusy ? 'Creando…' : 'Crear asignatura' }}
                  </button>
                </div>
                <div class="new-course-color-picker course-add-subject-colors">
                  <div class="new-course-color-copy">
                    <strong>Color <span class="optional-tag">opcional</span></strong>
                    <small>Si no eliges, se asigna solo. No puede repetirse en el mismo curso.</small>
                  </div>
                  <div class="course-subject-color-swatches" role="listbox" aria-label="Color opcional">
                    <button
                      type="button"
                      class="course-subject-swatch is-none"
                      role="option"
                      :aria-selected="!addCourseSubjectCustomColor"
                      :class="{ selected: !addCourseSubjectCustomColor }"
                      :disabled="addCourseSubjectBusy"
                      @click="clearAddCourseSubjectColor"
                    >Auto</button>
                    <button
                      v-for="color in SUBJECT_COLORS"
                      :key="`add-${color}`"
                      type="button"
                      class="course-subject-swatch"
                      role="option"
                      :aria-selected="normalizeSubjectColor(addCourseSubjectCustomColor) === normalizeSubjectColor(color)"
                      :aria-label="`Color ${color}`"
                      :disabled="addCourseSubjectBusy || isSubjectColorTaken(color)"
                      :class="{
                        selected: normalizeSubjectColor(addCourseSubjectCustomColor) === normalizeSubjectColor(color),
                        taken: isSubjectColorTaken(color),
                      }"
                      :style="{ '--swatch-color': color }"
                      @click="selectAddCourseSubjectPaletteColor(color)"
                    />
                    <button
                      type="button"
                      class="course-subject-swatch is-custom"
                      role="option"
                      :aria-selected="isCustomSubjectColor(addCourseSubjectCustomColor)"
                      :class="{ selected: isCustomSubjectColor(addCourseSubjectCustomColor) }"
                      :disabled="addCourseSubjectBusy"
                      :style="isCustomSubjectColor(addCourseSubjectCustomColor) ? { '--swatch-color': addCourseSubjectCustomColor } : undefined"
                      @click="openAddCourseSubjectCustomColor"
                    >Custom</button>
                  </div>
                  <label
                    v-if="addCourseSubjectCustomPickerOpen || isCustomSubjectColor(addCourseSubjectCustomColor)"
                    class="course-subject-custom-color"
                  >
                    <span>Color personalizado</span>
                    <input
                      id="add-course-subject-custom-color"
                      type="color"
                      :value="normalizeSubjectColor(addCourseSubjectCustomColor) || '#336699'"
                      :disabled="addCourseSubjectBusy"
                      @input="onAddCourseSubjectCustomColorInput"
                    />
                  </label>
                </div>

                <details class="course-subject-suggestions" :open="addCourseSubjectShowSuggestions" @toggle="addCourseSubjectShowSuggestions = $event.target.open">
                  <summary>Opcional: agregar varias desde sugerencias</summary>
                  <label class="field">
                    <span>Plantilla de sugerencias</span>
                    <select v-model="addCourseSubjectTemplateId" @change="onAddCourseSubjectTemplateChange">
                      <option v-for="template in courseTemplates" :key="template.id" :value="template.id">{{ template.name }}</option>
                    </select>
                  </label>
                  <div class="new-course-selection">
                    <button type="button" class="edit-button" :disabled="!addCourseSubjectOptions.length" @click="selectAllAddCourseSubjects">Seleccionar sugeridas</button>
                    <button type="button" class="edit-button" :disabled="!addCourseSubjectSelected.length" @click="clearAddCourseSubjects">Desmarcar</button>
                    <span class="new-course-count">{{ addCourseSubjectSelected.length + addCourseSubjectCustoms.length }} para agregar</span>
                  </div>
                  <div v-if="addCourseSubjectOptions.length" class="new-course-subjects course-add-subject-options">
                    <label v-for="subject in addCourseSubjectOptions" :key="subject" :class="{ selected: addCourseSubjectSelected.includes(subject) }">
                      <input v-model="addCourseSubjectSelected" type="checkbox" :value="subject" />
                      <span>{{ subject }}</span>
                    </label>
                  </div>
                  <p v-else class="field-help">No quedan sugerencias disponibles para este curso.</p>
                  <div v-if="addCourseSubjectCustoms.length" class="new-course-custom-list">
                    <span
                      v-for="item in addCourseSubjectCustoms"
                      :key="customSubjectName(item)"
                      class="new-course-custom-chip"
                      :style="customSubjectColor(item) ? { '--subject-color': customSubjectColor(item) } : undefined"
                    >
                      <i v-if="customSubjectColor(item)" class="subject-color-dot" aria-hidden="true"></i>
                      {{ customSubjectName(item) }}
                      <button type="button" :aria-label="`Quitar ${customSubjectName(item)}`" @click="removeAddCourseCustomSubject(customSubjectName(item))"><X :size="13" /></button>
                    </span>
                  </div>
                  <div class="modal-actions">
                    <button type="button" class="secondary-button" :disabled="addCourseSubjectBusy" @click="closeAddCourseSubject">Cancelar</button>
                    <button type="button" class="primary-button" :disabled="addCourseSubjectBusy || (!addCourseSubjectSelected.length && !addCourseSubjectCustoms.length)" @click="saveAddCourseSubjects">
                      <span v-if="addCourseSubjectBusy" class="spinner"></span>
                      <Plus v-else :size="16" />
                      {{ addCourseSubjectBusy ? 'Agregando…' : 'Agregar seleccionadas' }}
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </article>
        </template>

        <template v-else-if="currentView === 'Asignatura del curso' && courseDetail">
          <div class="profile-page-toolbar course-detail-toolbar">
            <button class="secondary-button" @click="openCourseDetail(courseDetail.id)"><ArrowLeft :size="16" />Volver al curso</button>
            <div class="course-detail-actions">
              <button
                v-if="authUser.permissions?.manageGrades"
                class="primary-button"
                type="button"
                @click="openGradePage()"
              >
                <Plus :size="15" />Agregar nota
              </button>
              <button
                v-if="canConfigureCourseForum"
                class="secondary-button"
                type="button"
                @click="openCourseClassroom(courseDetail.id, 'tareas')"
              >
                <BookOpen :size="15" />Ir al aula
              </button>
              <button
                v-if="canOpenClassroomConfig"
                class="secondary-button"
                type="button"
                @click="openCourseClassroomConfig(courseDetail.id, canManageAcademicStructure ? 'subjects' : undefined)"
              >
                <Settings :size="15" />Configurar aula
              </button>
            </div>
          </div>
          <article class="panel course-detail-card" :style="{ '--course-color': courseDetail.color }">
            <header class="course-detail-hero">
              <div class="course-detail-heading">
                <span class="subject-icon"><BookOpen /></span>
                <div>
                  <span class="course-detail-eyebrow">{{ courseDetail.name }} · {{ courseDetail.section }}</span>
                  <h2>{{ courseDetail.subject }}</h2>
                  <p>
                    <GraduationCap :size="15" />
                    {{ courseDetail.teacher ? `Profesor: ${courseDetail.teacher}` : 'Sin profesor de asignatura' }}
                    <template v-if="courseDetailHeadTeacher"> · Jefe: {{ courseDetailHeadTeacher }}</template>
                  </p>
                </div>
              </div>
              <div class="course-detail-stats">
                <div><span><Users :size="16" /></span><div><strong>{{ students.length }}</strong><small>Estudiantes</small></div></div>
                <div><span><ClipboardList :size="16" /></span><div><strong>{{ courseAssessments.length }}</strong><small>Evaluaciones</small></div></div>
                <div><span><TrendingUp :size="16" /></span><div><strong :class="gradeClass(courseDetail.average)">{{ courseDetail.average || '—' }}</strong><small>Promedio</small></div></div>
              </div>
            </header>

            <section v-if="canManageAcademicStructure" class="course-staffing-panel">
              <div class="course-staffing-head">
                <div>
                  <h3>Administrar asignatura</h3>
                  <p>Renombra o cambia el color del ramo. El profesor asignado se gestiona en Configurar aula.</p>
                </div>
              </div>
              <div class="course-staffing-grid">
                <article class="course-staffing-card">
                  <div>
                    <small>Profesor de asignatura</small>
                    <strong>{{ courseDetail.teacher || 'Sin asignar' }}</strong>
                    <span>Puede cargar y editar notas de este ramo.</span>
                  </div>
                </article>
                <article class="course-staffing-card">
                  <div>
                    <small>Identidad del ramo</small>
                    <strong>{{ courseDetail.subject }}</strong>
                    <span>Renombra o cambia el color para distinguirlo en el curso.</span>
                  </div>
                  <div class="course-subject-actions" style="margin:0;padding:0;border:0">
                    <button type="button" class="edit-button" @click="startRenameCourseSubject(courseDetail)"><Pencil :size="14" />Renombrar</button>
                    <button type="button" class="edit-button" @click="startChangeSubjectColor(courseDetail)"><Sparkles :size="14" />Color</button>
                  </div>
                </article>
              </div>
              <div v-if="renameSubjectId === courseDetail.id" class="course-subject-rename" style="margin-top:0.85rem">
                <input v-model.trim="renameSubjectName" maxlength="100" @keydown.enter.prevent="saveRenameCourseSubject(courseDetail)" @keydown.esc.prevent="cancelRenameCourseSubject" />
                <button type="button" class="edit-button" :disabled="renameSubjectBusy || !renameSubjectName.trim()" @click="saveRenameCourseSubject(courseDetail)">Guardar</button>
                <button type="button" class="edit-button" :disabled="renameSubjectBusy" @click="cancelRenameCourseSubject">Cancelar</button>
              </div>
              <div v-else-if="subjectColorId === courseDetail.id" class="course-subject-color-picker" style="margin-top:0.85rem">
                <div class="course-subject-color-copy">
                  <strong>Colores disponibles</strong>
                  <small>Dos asignaturas del mismo curso no pueden compartir color.</small>
                </div>
                <div class="course-subject-color-swatches" role="listbox" aria-label="Colores disponibles">
                  <button
                    v-for="color in SUBJECT_COLORS"
                    :key="color"
                    type="button"
                    class="course-subject-swatch"
                    role="option"
                    :aria-selected="normalizeSubjectColor(courseDetail.color) === normalizeSubjectColor(color)"
                    :aria-label="`Color ${color}`"
                    :disabled="subjectColorBusy || (isSubjectColorTaken(color, courseDetail.id) && normalizeSubjectColor(courseDetail.color) !== normalizeSubjectColor(color))"
                    :class="{
                      selected: normalizeSubjectColor(courseDetail.color) === normalizeSubjectColor(color),
                      taken: isSubjectColorTaken(color, courseDetail.id) && normalizeSubjectColor(courseDetail.color) !== normalizeSubjectColor(color),
                    }"
                    :style="{ '--swatch-color': color }"
                    @click="subjectColorCustomPickerOpen = false; saveSubjectColor(courseDetail, color)"
                  />
                  <button
                    type="button"
                    class="course-subject-swatch is-custom"
                    role="option"
                    :aria-selected="isCustomSubjectColor(courseDetail.color)"
                    :class="{ selected: isCustomSubjectColor(courseDetail.color) }"
                    :disabled="subjectColorBusy"
                    :style="isCustomSubjectColor(courseDetail.color) ? { '--swatch-color': courseDetail.color } : undefined"
                    @click="openSubjectColorCustomPicker(courseDetail)"
                  >Custom</button>
                </div>
                <label
                  v-if="subjectColorCustomPickerOpen || isCustomSubjectColor(courseDetail.color)"
                  class="course-subject-custom-color"
                >
                  <span>Color personalizado</span>
                  <input
                    :id="`subject-custom-color-${courseDetail.id}`"
                    type="color"
                    :value="normalizeSubjectColor(courseDetail.color) || '#336699'"
                    :disabled="subjectColorBusy"
                    @change="onSubjectCustomColorInput(courseDetail, $event)"
                  />
                </label>
                <button type="button" class="edit-button" :disabled="subjectColorBusy" @click="cancelChangeSubjectColor">Cerrar</button>
              </div>
            </section>
          </article>

          <div class="panel-with-pager course-gradebook-stack">
            <article class="panel table-panel course-gradebook-panel">
              <div class="panel-header course-gradebook-heading">
                <div>
                  <h2>Calificaciones</h2>
                  <p>Notas de {{ courseDetail.subject }}. Abre la ficha de cada estudiante o agrega una evaluación.</p>
                </div>
                <span>{{ courseGradeRows.length }} alumnos</span>
              </div>
              <div v-if="courseGradeRows.length" class="table-scroll course-gradebook">
                <DataTable>
                  <thead>
                    <tr>
                      <th
                        class="sortable-th"
                        :class="courseGradeSortGlyph('student')"
                        :aria-sort="courseGradeSortAria('student')"
                        scope="col"
                      >
                        <button type="button" class="sortable-th-button" @click="toggleCourseGradeSort('student')">
                          <span>Estudiante</span>
                          <span class="sort-indicator" aria-hidden="true">
                            <i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i>
                            <i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i>
                          </span>
                        </button>
                      </th>
                      <th
                        v-for="assessment in courseAssessments"
                        :key="assessment"
                        class="sortable-th"
                        :class="courseGradeSortGlyph(assessment)"
                        :aria-sort="courseGradeSortAria(assessment)"
                        scope="col"
                      >
                        <button type="button" class="sortable-th-button" @click="toggleCourseGradeSort(assessment)">
                          <span>{{ assessment }}</span>
                          <span class="sort-indicator" aria-hidden="true">
                            <i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i>
                            <i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i>
                          </span>
                        </button>
                      </th>
                      <th
                        class="sortable-th"
                        :class="courseGradeSortGlyph('average')"
                        :aria-sort="courseGradeSortAria('average')"
                        scope="col"
                      >
                        <button type="button" class="sortable-th-button" @click="toggleCourseGradeSort('average')">
                          <span>Promedio</span>
                          <span class="sort-indicator" aria-hidden="true">
                            <i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i>
                            <i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i>
                          </span>
                        </button>
                      </th>
                      <th class="course-student-actions-cell"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in pagedCourseGradeRows" :key="row.student.id" class="course-student-row">
                      <td>
                        <button class="student-cell student-cell-link" @click="openStudentProfile(row.student.id)">
                          <span class="avatar" :style="{ background: row.student.avatar_color }">{{ initials(row.student.first_name, row.student.last_name) }}</span>
                          <span class="course-student-name">
                            <strong>{{ row.student.first_name }} {{ row.student.last_name }}</strong>
                            <small>{{ row.student.email || 'Sin correo registrado' }}</small>
                          </span>
                          <ChevronRight :size="14" />
                        </button>
                      </td>
                      <td v-for="assessment in courseAssessments" :key="assessment">
                        <strong v-if="row.grades[assessment]" class="grade-badge" :class="gradeClass(row.grades[assessment].score)">{{ row.grades[assessment].score }}</strong>
                        <span v-else class="grade-empty">—</span>
                      </td>
                      <td><strong class="course-average" :class="gradeClass(row.student.average)">{{ row.student.average || '—' }}</strong></td>
                      <td class="course-student-actions-cell">
                        <details class="row-action-menu" @click.stop @toggle="onRowActionToggle">
                          <summary class="row-action-trigger" aria-label="Acciones del estudiante"><MoreHorizontal :size="16" /></summary>
                          <div class="row-action-panel">
                            <button v-if="authUser.permissions?.manageGrades" type="button" @click="openGradePage(row.student.id); $event.currentTarget.closest('details').open = false"><Plus :size="15" />Agregar nota</button>
                            <button type="button" @click="openStudentProfile(row.student.id); $event.currentTarget.closest('details').open = false"><Eye :size="15" />Ver ficha</button>
                            <button v-if="authUser.permissions?.manageUsers" type="button" class="danger" :disabled="removingStudent" @click="removeFromCourse(row.student.id); $event.currentTarget.closest('details').open = false"><Trash2 :size="15" />Retirar del curso</button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  </tbody>
                </DataTable>
              </div>
              <div v-else class="course-empty-state">
                <span><Users :size="27" /></span>
                <h3>Este curso aún no tiene estudiantes</h3>
                <p>Matricula alumnos para comenzar a gestionar las calificaciones de esta asignatura.</p>
                <button v-if="authUser.permissions?.manageUsers" class="primary-button" @click="openEnrollmentModal"><UserPlus :size="17" />Matricular en curso</button>
              </div>
            </article>
            <TablePagination
              v-model:page="courseGradePage"
              :page-count="courseGradePageCount"
              :range-label="courseGradeRangeLabel"
              :show="showCourseGradePagination"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Aula del curso' && courseDetail && classroomSection === 'foros'">
          <div class="profile-page-toolbar course-detail-toolbar">
            <button class="secondary-button" @click="openCourseDetail(courseDetail.id)"><ArrowLeft :size="16" />Volver al curso</button>
            <div class="module-subnav classroom-route-tabs">
              <button :class="{ active: classroomSection === 'tareas' }" @click="openCourseClassroom(courseDetail.id, 'tareas')">Tareas</button>
              <button v-if="authUser.role !== 'guardian'" :class="{ active: classroomSection === 'foros' }" @click="openCourseClassroom(courseDetail.id, 'foros')">Foros</button>
              <button :class="{ active: classroomSection === 'comunicados' }" @click="openCourseClassroom(courseDetail.id, 'comunicados')">Comunicados</button>
              <button :class="{ active: classroomSection === 'archivos' }" @click="openCourseClassroom(courseDetail.id, 'archivos')">Archivos</button>
              <button :class="{ active: classroomSection === 'enlaces' }" @click="openCourseClassroom(courseDetail.id, 'enlaces')">Enlaces</button>
            </div>
          </div>
          <div class="classroom-course-strip" :style="{ '--course-color': courseDetail.color }">
            <i aria-hidden="true"></i>
            <div>
              <strong>{{ courseDetail.name }} · {{ courseDetail.section }}</strong>
              <span>{{ courseDetail.subject }}{{ courseDetail.teacher ? ` · ${courseDetail.teacher}` : '' }} · {{ students.length }} estudiante{{ students.length === 1 ? '' : 's' }}</span>
            </div>
          </div>
          <CourseForum
            :key="`forum-${courseDetail.id}-${classroomForumId || 'board'}`"
            :course-id="Number(courseDetail.id)"
            :course-label="`${courseDetail.name} · ${courseDetail.section} · ${courseDetail.subject}`"
            :forum-id="classroomForumId"
            :request="request"
            :download="download"
            :user="authUser"
            :open-settings="classroomOpenSettings"
            @settings-opened="classroomOpenSettings = false"
            @open-course="openCourseDetail(courseDetail.id)"
            @open-aula="openCourseClassroom(courseDetail.id, 'tareas')"
            @open-forum="openCourseClassroom(courseDetail.id, 'foros', { forumId: $event })"
            @leave="navigate('Cursos')"
          />
        </template>

        <template v-else-if="currentView === 'Aula del curso' && courseDetail">
          <div class="profile-page-toolbar course-detail-toolbar"><button class="secondary-button" @click="openCourseDetail(courseDetail.id)"><ArrowLeft :size="16" />Volver al curso</button><div class="module-subnav classroom-route-tabs"><button :class="{ active: classroomSection === 'tareas' }" @click="openCourseClassroom(courseDetail.id, 'tareas')">Tareas</button><button v-if="authUser.role !== 'guardian'" :class="{ active: classroomSection === 'foros' }" @click="openCourseClassroom(courseDetail.id, 'foros')">Foros</button><button :class="{ active: classroomSection === 'comunicados' }" @click="openCourseClassroom(courseDetail.id, 'comunicados')">Comunicados</button><button :class="{ active: classroomSection === 'archivos' }" @click="openCourseClassroom(courseDetail.id, 'archivos')">Archivos</button><button :class="{ active: classroomSection === 'enlaces' }" @click="openCourseClassroom(courseDetail.id, 'enlaces')">Enlaces</button></div></div>
          <article class="panel classroom-course-banner" :style="{ '--course-color': courseDetail.color }">
            <div><span>{{ courseDetail.subject }}</span><h2>{{ courseDetail.name }} · {{ courseDetail.section }}</h2><p>Profesor {{ courseDetail.teacher }} · {{ students.length }} estudiantes</p></div>
          </article>
          <Classroom :key="`${courseDetail.id}-${classroomSection}`" :course-id="Number(courseDetail.id)" :request="request" :user="authUser" :initial-section="classroomSection" :open-settings="classroomOpenSettings" @change-section="openCourseClassroom(courseDetail.id, $event)" @create-communication="openCourseCommunication(courseDetail.id)" @settings-opened="classroomOpenSettings = false" @notify="(msg, type) => showToast(msg, type || 'success')" />
        </template>

        <template v-else-if="currentView === 'Configurar aula' && courseDetail && canOpenClassroomConfig">
          <div class="profile-page-toolbar">
            <button class="secondary-button" type="button" @click="openCourseDetail(courseDetail.id)">
              <ArrowLeft :size="16" />Volver al curso
            </button>
          </div>
          <div class="account-shell school-settings-shell">
            <div class="account-tabs" role="tablist" aria-label="Secciones de configurar aula">
              <button
                v-if="canManageAcademicStructure"
                type="button"
                role="tab"
                :aria-selected="classroomConfigTab === 'head'"
                :class="{ active: classroomConfigTab === 'head' }"
                @click="setClassroomConfigTab('head')"
              >
                <GraduationCap :size="17" /><span>Profesores jefes<small>Responsables del curso</small></span>
              </button>
              <button
                v-if="canManageAcademicStructure"
                type="button"
                role="tab"
                :aria-selected="classroomConfigTab === 'subjects'"
                :class="{ active: classroomConfigTab === 'subjects' }"
                @click="setClassroomConfigTab('subjects')"
              >
                <Users :size="17" /><span>Profesores asignados<small>Por asignatura</small></span>
              </button>
              <button
                v-if="canConfigureCourseForum"
                type="button"
                role="tab"
                :aria-selected="classroomConfigTab === 'forums'"
                :class="{ active: classroomConfigTab === 'forums' }"
                @click="setClassroomConfigTab('forums')"
              >
                <MessageSquare :size="17" /><span>Foros<small>Permisos del aula</small></span>
              </button>
              <button
                v-if="canManageAcademicStructure"
                type="button"
                role="tab"
                class="account-tab-danger"
                :aria-selected="classroomConfigTab === 'danger'"
                :class="{ active: classroomConfigTab === 'danger' }"
                @click="setClassroomConfigTab('danger')"
              >
                <Trash2 :size="17" /><span>Eliminar curso<small>Zona de peligro</small></span>
              </button>
            </div>

            <form
              v-if="classroomConfigTab === 'head' && canManageAcademicStructure"
              class="panel account-panel"
              role="tabpanel"
              @submit.prevent="saveClassroomHeadTeacher"
            >
              <div class="account-panel-heading">
                <span class="admin-icon"><GraduationCap /></span>
                <div>
                  <h2>Profesores jefes</h2>
                  <p>Asigna uno o más profesores jefes de {{ courseDetail.name }} · {{ courseDetail.section }}. Ven todas las notas del curso; solo editan las de sus asignaturas.</p>
                </div>
              </div>
              <div v-if="classroomHeadTeacherError" class="login-error account-error">{{ classroomHeadTeacherError }}</div>
              <div class="form-grid">
                <div class="selected-material-course wide">
                  <span class="subject-icon"><BookOpen :size="18" /></span>
                  <div>
                    <small>Curso seleccionado</small>
                    <strong>{{ courseDetail.name }} · {{ courseDetail.section }}</strong>
                  </div>
                </div>
                <fieldset class="field wide permissions-field teacher-picker-field">
                  <legend>Profesores jefes</legend>
                  <label class="teacher-picker-search">
                    <span class="sr-only">Buscar profesor</span>
                    <Search :size="15" aria-hidden="true" />
                    <input v-model.trim="teacherPickerQuery" type="search" placeholder="Buscar por nombre o correo…" />
                  </label>
                  <p class="teacher-picker-meta">
                    {{ classroomHeadTeachers.length }} seleccionado{{ classroomHeadTeachers.length === 1 ? '' : 's' }}
                    · {{ filteredClassroomTeachers.length }} de {{ teacherUsers.length }}
                  </p>
                  <div v-if="pagedClassroomTeachers.length" class="permissions-grid teacher-picker-grid">
                    <label v-for="teacher in pagedClassroomTeachers" :key="teacher.id">
                      <input v-model="classroomHeadTeachers" type="checkbox" :value="teacher.fullName" />
                      <span>
                        <Check :size="13" />
                        {{ teacher.fullName }}
                        <small v-if="teacher.username" class="teacher-pick-user">{{ teacher.username }}</small>
                      </span>
                    </label>
                  </div>
                  <p v-else-if="teacherUsers.length">Ningún profesor coincide con la búsqueda.</p>
                  <p v-else>No hay profesores activos para asignar.</p>
                  <TablePagination
                    v-model:page="classroomTeacherPage"
                    :page-count="classroomTeacherPageCount"
                    :range-label="classroomTeacherRangeLabel"
                    :show="showClassroomTeacherPagination"
                  />
                  <small class="field-help">Puedes marcar varios. Ven todas las notas del curso (todas las asignaturas).</small>
                </fieldset>
              </div>
              <div class="account-actions">
                <button type="button" class="secondary-button" @click="openCourseDetail(courseDetail.id)">Cancelar</button>
                <button class="primary-button" :disabled="classroomHeadTeacherSaving">
                  <span v-if="classroomHeadTeacherSaving" class="spinner"></span>
                  <Check v-else :size="18" />
                  {{ classroomHeadTeacherSaving ? 'Guardando…' : 'Guardar profesores jefes' }}
                </button>
              </div>
            </form>

            <form
              v-else-if="classroomConfigTab === 'subjects' && canManageAcademicStructure"
              class="panel account-panel"
              role="tabpanel"
              @submit.prevent="classroomSubjectFocusId && saveClassroomSubjectTeacher(classroomSubjectFocusId)"
            >
              <div class="account-panel-heading">
                <span class="admin-icon"><Users /></span>
                <div>
                  <h2>Profesores asignados</h2>
                  <p>Asigna uno o más profesores a cada asignatura de {{ courseDetail.name }} · {{ courseDetail.section }}. Ven y editan solo las notas de su ramo.</p>
                </div>
              </div>
              <div v-if="classroomSubjectError" class="login-error account-error">{{ classroomSubjectError }}</div>
              <div v-if="courseSiblingCourses.length" class="form-grid">
                <div class="selected-material-course wide">
                  <span class="subject-icon"><BookOpen :size="18" /></span>
                  <div>
                    <small>Curso seleccionado</small>
                    <strong>{{ courseDetail.name }} · {{ courseDetail.section }}</strong>
                  </div>
                </div>
                <label class="field wide">
                  <span>Asignatura</span>
                  <select v-model.number="classroomSubjectFocusId" @change="onClassroomSubjectSelect">
                    <option
                      v-for="module in courseSiblingCourses"
                      :key="module.id"
                      :value="Number(module.id)"
                    >
                      {{ module.subject }}{{ (classroomSubjectTeachers[module.id] || []).length ? ` · ${(classroomSubjectTeachers[module.id] || []).join(', ')}` : ' · Sin profesor' }}
                    </option>
                  </select>
                </label>
                <fieldset
                  v-if="classroomSubjectFocusId"
                  class="field wide permissions-field teacher-picker-field"
                >
                  <legend>Profesores asignados</legend>
                  <label class="teacher-picker-search">
                    <span class="sr-only">Buscar profesor</span>
                    <Search :size="15" aria-hidden="true" />
                    <input v-model.trim="teacherPickerQuery" type="search" placeholder="Buscar por nombre o correo…" />
                  </label>
                  <p class="teacher-picker-meta">
                    {{ (classroomSubjectTeachers[classroomSubjectFocusId] || []).length }} seleccionado{{ (classroomSubjectTeachers[classroomSubjectFocusId] || []).length === 1 ? '' : 's' }}
                    · {{ filteredClassroomTeachers.length }} de {{ teacherUsers.length }}
                  </p>
                  <div v-if="pagedClassroomTeachers.length" class="permissions-grid teacher-picker-grid">
                    <label v-for="teacher in pagedClassroomTeachers" :key="teacher.id">
                      <input
                        v-model="classroomSubjectTeachers[classroomSubjectFocusId]"
                        type="checkbox"
                        :value="teacher.fullName"
                      />
                      <span>
                        <Check :size="13" />
                        {{ teacher.fullName }}
                        <small v-if="teacher.username" class="teacher-pick-user">{{ teacher.username }}</small>
                      </span>
                    </label>
                  </div>
                  <p v-else-if="teacherUsers.length">Ningún profesor coincide con la búsqueda.</p>
                  <p v-else>No hay profesores activos para asignar.</p>
                  <TablePagination
                    v-model:page="classroomTeacherPage"
                    :page-count="classroomTeacherPageCount"
                    :range-label="classroomTeacherRangeLabel"
                    :show="showClassroomTeacherPagination"
                  />
                  <small class="field-help">Puedes marcar varios. Ven y administran solo las notas de esta asignatura.</small>
                </fieldset>
              </div>
              <EmptyState v-else class="module-empty">
                <BookOpen :size="28" />
                <strong>Sin asignaturas</strong>
                <span>Agrega asignaturas en el curso para poder asignar profesores.</span>
                <button type="button" class="primary-button" @click="openCourseDetail(courseDetail.id)"><ArrowLeft :size="15" />Volver al curso</button>
              </EmptyState>
              <div v-if="courseSiblingCourses.length" class="account-actions">
                <button type="button" class="secondary-button" @click="openCourseDetail(courseDetail.id)">Cancelar</button>
                <button
                  class="primary-button"
                  :disabled="!classroomSubjectFocusId || classroomSubjectSavingId === Number(classroomSubjectFocusId)"
                >
                  <span v-if="classroomSubjectSavingId === Number(classroomSubjectFocusId)" class="spinner"></span>
                  <Check v-else :size="18" />
                  {{ classroomSubjectSavingId === Number(classroomSubjectFocusId) ? 'Guardando…' : 'Guardar profesores asignados' }}
                </button>
              </div>
            </form>

            <form
              v-else-if="classroomConfigTab === 'forums' && canConfigureCourseForum"
              class="panel account-panel"
              role="tabpanel"
              @submit.prevent="saveClassroomForumSettings"
            >
              <div class="account-panel-heading">
                <span class="admin-icon"><MessageSquare /></span>
                <div>
                  <h2>Foros del aula</h2>
                  <p>Reglas generales para todos los foros de este curso y quién puede participar.</p>
                </div>
              </div>
              <div v-if="classroomForumSettingsError" class="login-error account-error">{{ classroomForumSettingsError }}</div>
              <p v-if="classroomForumSettingsLoading" class="account-access-loading">Cargando preferencias…</p>
              <template v-else>
                <label class="field wide">
                  <span>Normas generales del curso <small>{{ classroomForumSettings.forumGuidelines.length }}/5000</small></span>
                  <textarea
                    v-model="classroomForumSettings.forumGuidelines"
                    maxlength="5000"
                    rows="6"
                    placeholder="Normas de respeto y participación que aplican a todos los foros del curso…"
                  />
                  <small class="field-help">Aplica a todos los foros de este curso (no a un tema en particular). Se muestra arriba de la lista de temas.</small>
                </label>
                <div class="settings-grid classroom-config-settings">
                  <label class="switch-field">
                    <input v-model="classroomForumSettings.allowStudentsCreateForum" type="checkbox" />
                    <span>
                      <i></i>
                      <strong>Estudiantes pueden crear temas</strong>
                      <small>Por defecto apagado: solo docentes abren nuevos hilos.</small>
                    </span>
                  </label>
                  <label class="switch-field">
                    <input v-model="classroomForumSettings.allowStudentsReplyForum" type="checkbox" />
                    <span>
                      <i></i>
                      <strong>Estudiantes pueden responder</strong>
                      <small>Permite mensajes en temas abiertos.</small>
                    </span>
                  </label>
                </div>
              </template>
              <div class="account-actions">
                <button type="button" class="secondary-button" @click="openCourseDetail(courseDetail.id)">Cancelar</button>
                <button class="primary-button" :disabled="classroomForumSettingsSaving || classroomForumSettingsLoading">
                  <span v-if="classroomForumSettingsSaving" class="spinner"></span>
                  <Check v-else :size="18" />
                  {{ classroomForumSettingsSaving ? 'Guardando…' : 'Guardar preferencias' }}
                </button>
              </div>
            </form>

            <section
              v-else-if="classroomConfigTab === 'danger' && canManageAcademicStructure"
              class="panel account-panel classroom-danger-panel"
              role="tabpanel"
              aria-label="Eliminar curso"
            >
              <div class="account-panel-heading">
                <span class="admin-icon"><Trash2 /></span>
                <div>
                  <h2>Eliminar curso</h2>
                  <p>Borra {{ courseDetail.name }} · {{ courseDetail.section }} con todas sus asignaturas. No se puede deshacer.</p>
                </div>
              </div>
              <p class="field-help classroom-danger-help">
                Se eliminan matrículas, foros, tareas y materiales del curso. Si alguna asignatura tiene calificaciones, la eliminación se bloquea.
              </p>
              <div class="account-actions">
                <button
                  type="button"
                  class="secondary-button danger-button"
                  :disabled="classroomDeleteBusy"
                  @click="deleteClassroomCourse(courseDetail)"
                >
                  <span v-if="classroomDeleteBusy" class="spinner"></span>
                  <Trash2 v-else :size="16" />
                  {{ classroomDeleteBusy ? 'Eliminando…' : `Eliminar ${courseDetail.name} · ${courseDetail.section}` }}
                </button>
              </div>
            </section>
          </div>
        </template>

        <template v-else-if="['Detalle del curso', 'Aula del curso', 'Configurar aula', 'Agregar estudiantes', 'Asignatura del curso'].includes(currentView) && (courseAccessDenied || !courseDetail)">
          <EmptyState class="module-empty course-access-denied">
            <BookOpen :size="28" />
            <strong>{{ courseAccessTitle }}</strong>
            <span>{{ courseAccessMessage || courseAccessHelp }}</span>
            <small v-if="courseAccessMessage && !courseAccessChecking" class="course-access-hint">{{ courseAccessHelp }}</small>
            <button type="button" class="primary-button" @click="navigate('Cursos')"><ArrowLeft :size="16" />Volver a cursos</button>
          </EmptyState>
        </template>

        <template v-else-if="currentView === 'Mensualidades' && authUser.permissions?.manageSchool && !isPublicSchool">
          <div class="profile-page-toolbar"><button class="secondary-button" @click="navigate('Administración')"><ArrowLeft :size="16" />Volver a administración</button></div>
          <div class="panel-with-pager">
            <article class="panel table-panel">
              <div class="panel-header"><div><h2>Mensualidad por curso</h2><p>Define el arancel mensual de cada curso. Se aplica a todas sus asignaturas.</p></div></div>
              <div v-if="courseSettingsError" class="login-error account-error">{{ courseSettingsError }}</div>
              <div class="table-scroll"><DataTable><thead><tr><th>Curso</th><th>Asignaturas</th><th>Mensualidad CLP</th><th></th></tr></thead><tbody><tr v-for="group in pagedCourseGroupRows" :key="`${group.name}-${group.section}-${group.academic_year_id}`"><td><strong>{{ group.name }} · {{ group.section }}</strong></td><td>{{ group.modules?.length || 0 }}</td><td><input v-model.number="group.monthly_fee" class="salary-input" type="number" min="0" step="1" /></td><td><button class="edit-button" :disabled="courseFeeSavingId === group.id" @click="saveCourseMonthlyFee(group)">{{ courseFeeSavingId === group.id ? 'Guardando…' : 'Guardar' }}</button></td></tr></tbody></DataTable></div>
              <EmptyState v-if="!courseGroupRows.length" class="module-empty">Crea un curso para configurar su mensualidad.</EmptyState>
            </article>
            <TablePagination
              v-model:page="courseGroupsPage"
              :page-count="courseGroupsPageCount"
              :range-label="courseGroupsRangeLabel"
              :show="courseGroupRows.length > 0"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Nuevo curso' && canManageAcademicStructure">
          <div class="profile-page-toolbar"><button class="secondary-button" @click="navigate('Cursos')"><ArrowLeft :size="16" />Volver a cursos</button></div>
          <form class="new-course-page" @submit.prevent="saveManagement">
            <div class="new-course-intro"><h2>Nuevo curso escolar</h2><p>Según el sistema chileno: primero el nivel, luego la mención solo si corresponde (3° y 4° medio).</p></div>
            <div v-if="managementError" class="form-error" role="alert">{{ managementError }}<button v-if="!courseTemplates.length" type="button" class="edit-button" @click="loadCourseTemplates">Reintentar</button></div>
            <div class="new-course-layout">
              <div class="new-course-settings">
                <section class="new-course-panel">
                  <h3>Nivel y sección</h3>
                  <div class="new-course-fields">
                    <label class="field">
                      <span>Nivel</span>
                      <select v-model="courseForm.levelId" required @change="onCourseLevelChange">
                        <option v-for="level in courseLevels" :key="level.id" :value="level.id">{{ level.name }}</option>
                      </select>
                    </label>
                    <label class="field"><span>Sección</span><input v-model.trim="courseForm.section" required maxlength="10" placeholder="Ej. A" /></label>
                  </div>
                  <p class="new-course-help">{{ newCoursePlanHint }}</p>
                </section>
                <FormSection v-if="needsCourseTrack" class="new-course-panel new-course-templates">
                  <legend>Plan de 3° / 4° medio</legend>
                  <p>En Chile la diferenciación empieza en 3° medio.</p>
                  <label v-for="track in availableCourseTracks" :key="track.id" class="new-course-template" :class="{ selected: courseForm.trackId === track.id }">
                    <input v-model="courseForm.trackId" type="radio" name="course-track" :value="track.id" @change="onCourseTrackChange" />
                    <span><strong>{{ track.name }}</strong><small>{{ track.description }}</small></span>
                  </label>
                </FormSection>
                <section v-else class="new-course-panel">
                  <h3>Plan sugerido</h3>
                  <p class="new-course-help">{{ selectedCourseTemplate?.name || '—' }} · {{ selectedCourseTemplate?.description || newCoursePlanHint }}</p>
                </section>
              </div>
              <section class="new-course-panel new-course-modules">
                <div class="new-course-modules-heading">
                  <div>
                    <h3>{{ isCustomCourseTemplate ? 'Tus ramos' : 'Ramos del curso' }}</h3>
                    <p>{{ isCustomCourseTemplate ? (courseForm.trackId === 'tp' ? 'Agrega los ramos de la especialidad TP.' : 'Escribe y agrega cada ramo.') : 'Marcamos el plan típico; puedes quitar o sumar ramos.' }}</p>
                  </div>
                  <span class="new-course-count">{{ courseForm.subjects.length + courseForm.customSubjects.length }} seleccionadas</span>
                </div>
                <p v-if="courseTemplatesLoading" role="status">Cargando plan de estudios…</p>
                <template v-else-if="selectedCourseTemplate">
                  <template v-if="!isCustomCourseTemplate">
                    <div class="new-course-selection"><button type="button" class="edit-button" @click="selectAllCourseTemplateSubjects">Seleccionar todos</button><button type="button" class="edit-button" @click="clearCourseTemplateSubjects">Desmarcar todos</button></div>
                    <div class="new-course-subjects"><label v-for="subject in newCourseSubjectOptions" :key="subject" :class="{ selected: courseForm.subjects.includes(subject) }"><input v-model="courseForm.subjects" type="checkbox" :value="subject" /><span>{{ subject }}</span></label></div>
                  </template>
                  <div class="new-course-custom-subject">
                    <label class="field">
                      <span>{{ isCustomCourseTemplate || courseForm.trackId === 'tp' ? 'Agregar ramo' : 'Ramo extra' }}</span>
                      <input v-model.trim="newCourseCustomSubject" maxlength="100" :placeholder="courseForm.trackId === 'tp' ? 'Ej. Especialidad electricidad' : 'Ej. Religión'" @keydown.enter.prevent="addCourseCustomSubject" />
                    </label>
                    <button type="button" class="secondary-button" :disabled="!newCourseCustomSubject.trim()" @click="addCourseCustomSubject"><Plus :size="15" />Agregar</button>
                  </div>
                  <div class="new-course-color-picker">
                    <div class="new-course-color-copy">
                      <strong>Color del ramo <span class="optional-tag">opcional</span></strong>
                      <small>Si no eliges, se asigna automáticamente. Después también puedes cambiarlo en el curso.</small>
                    </div>
                    <div class="course-subject-color-swatches" role="listbox" aria-label="Color opcional del ramo">
                      <button
                        type="button"
                        class="course-subject-swatch is-none"
                        role="option"
                        :aria-selected="!newCourseCustomColor"
                        :class="{ selected: !newCourseCustomColor }"
                        @click="newCourseCustomColor = ''"
                      >Auto</button>
                      <button
                        v-for="color in SUBJECT_COLORS"
                        :key="color"
                        type="button"
                        class="course-subject-swatch"
                        role="option"
                        :aria-selected="normalizeSubjectColor(newCourseCustomColor) === normalizeSubjectColor(color)"
                        :aria-label="`Color ${color}`"
                        :disabled="isNewCourseCustomColorTaken(color)"
                        :class="{
                          selected: normalizeSubjectColor(newCourseCustomColor) === normalizeSubjectColor(color),
                          taken: isNewCourseCustomColorTaken(color),
                        }"
                        :style="{ '--swatch-color': color }"
                        @click="newCourseCustomColor = color"
                      />
                    </div>
                  </div>
                  <div v-if="courseForm.customSubjects.length" class="new-course-custom-list">
                    <span
                      v-for="item in courseForm.customSubjects"
                      :key="customSubjectName(item)"
                      class="new-course-custom-chip"
                      :style="customSubjectColor(item) ? { '--subject-color': customSubjectColor(item) } : undefined"
                    >
                      <i v-if="customSubjectColor(item)" class="subject-color-dot" aria-hidden="true"></i>
                      {{ customSubjectName(item) }}
                      <details class="new-course-chip-color" @click.stop>
                        <summary :aria-label="`Color de ${customSubjectName(item)}`"><Sparkles :size="12" /></summary>
                        <div class="new-course-chip-swatches">
                          <button type="button" class="course-subject-swatch is-none" :class="{ selected: !customSubjectColor(item) }" @click="setCourseCustomSubjectColor(customSubjectName(item), '')">Auto</button>
                          <button
                            v-for="color in SUBJECT_COLORS"
                            :key="`${customSubjectName(item)}-${color}`"
                            type="button"
                            class="course-subject-swatch"
                            :disabled="isNewCourseCustomColorTaken(color, customSubjectName(item))"
                            :class="{
                              selected: customSubjectColor(item) === normalizeSubjectColor(color),
                              taken: isNewCourseCustomColorTaken(color, customSubjectName(item)),
                            }"
                            :style="{ '--swatch-color': color }"
                            @click="setCourseCustomSubjectColor(customSubjectName(item), color)"
                          />
                        </div>
                      </details>
                      <button type="button" :aria-label="`Quitar ${customSubjectName(item)}`" @click="removeCourseCustomSubject(customSubjectName(item))"><X :size="13" /></button>
                    </span>
                  </div>
                  <p v-if="isCustomCourseTemplate && !courseForm.customSubjects.length" class="new-course-help">Agrega al menos un ramo para crear el curso.</p>
                  <p v-else class="new-course-help">El color es opcional. Después podrás sumar, quitar o recolorear ramos desde el detalle del curso.</p>
                </template>
              </section>
            </div>
            <div class="new-course-actions"><span>{{ courseForm.name || 'Nuevo curso' }} · {{ courseForm.section || 'Sin sección' }}<small>{{ courseForm.subjects.length + courseForm.customSubjects.length }} ramos para crear</small></span><div><button type="button" class="secondary-button" :disabled="managementSaving" @click="navigate('Cursos')">Cancelar</button><button class="primary-button" :disabled="managementSaving || courseTemplatesLoading || (!courseForm.subjects.length && !courseForm.customSubjects.length)"><Plus :size="18" />{{ managementSaving ? 'Creando curso…' : 'Crear curso' }}</button></div></div>
          </form>
        </template>

        <template v-else-if="currentView === 'Cursos'">
          <div
            v-if="authUser.role === 'teacher'"
            class="grade-scope-note"
            :data-tone="isClassHeadTeacher ? 'head' : 'subject'"
          >
            <span class="grade-scope-icon" aria-hidden="true">
              <GraduationCap v-if="isClassHeadTeacher" :size="18" />
              <BookOpen v-else :size="18" />
            </span>
            <div class="grade-scope-copy">
              <p class="grade-scope-kicker">{{ isClassHeadTeacher ? 'Rol activo' : 'Alcance' }}</p>
              <strong>{{ isClassHeadTeacher ? 'Profesor jefe' : 'Solo tus ramos' }}</strong>
              <p class="grade-scope-text">{{ teacherScopeNote }}</p>
            </div>
          </div>
          <div class="panel-with-pager">
            <article class="panel table-panel courses-table-panel">
              <div class="panel-header courses-panel-header">
                <div>
                  <h2>{{ authUser.role === 'teacher' ? 'Mis asignaturas' : 'Lista de cursos' }}</h2>
                  <p v-if="authUser.role === 'teacher'">
                    {{ isClassHeadTeacher ? 'Cursos donde eres profesor jefe y ramos que dictas.' : 'Solo aparecen los ramos donde estás asignado.' }}
                    · {{ sortedCourseGroupRows.length }} curso{{ sortedCourseGroupRows.length === 1 ? '' : 's' }}
                  </p>
                  <p v-else>{{ sortedCourseGroupRows.length }} cursos · {{ courses.length }} asignaturas registradas</p>
                </div>
                <label class="field courses-panel-search">
                  <span class="visually-hidden">Buscar curso</span>
                  <div class="module-search-shell">
                    <Search :size="16" aria-hidden="true" />
                    <input
                      v-model="courseDirectorySearch"
                      type="search"
                      placeholder="Buscar curso…"
                      aria-label="Buscar curso"
                    />
                  </div>
                </label>
              </div>
              <div v-if="sortedCourseGroupRows.length" class="table-scroll">
                <DataTable
                  sortable
                  row-clickable
                  caption="Lista de cursos"
                  :rows="pagedCourseGroupRows"
                  :columns="courseGroupColumns"
                  :sort-by="courseGroupsSortBy"
                  :sort-dir="courseGroupsSortDir"
                  @sort="onCourseGroupsSort"
                  @row-click="(row) => openCourseDetail(row.id)"
                >
                  <template #cell-name="{ row: group }">
                    <div class="course-table-name">
                      <i :style="{ background: group.color }"></i>
                      <div><strong>{{ group.name }} · {{ group.section }}</strong></div>
                    </div>
                  </template>
                  <template #cell-moduleCount="{ row: group }">
                    <span class="course-module-count">{{ group.moduleCount || group.modules?.length || 0 }}</span>
                  </template>
                  <template #cell-head_teacher="{ row: group }">
                    <div class="course-head-teacher-cell" @click.stop>
                      <details
                        v-if="headTeacherNames(group).length > 1"
                        class="course-subject-teachers-menu"
                        @toggle="onRowActionToggle"
                      >
                        <summary
                          class="course-subject-teacher is-menu"
                          :title="`Profesores jefes de ${group.name} · ${group.section}`"
                        >
                          <GraduationCap :size="14" aria-hidden="true" />
                          <span>{{ headTeacherSummary(group) }}</span>
                          <ChevronDown :size="14" class="course-subject-teachers-chevron" aria-hidden="true" />
                        </summary>
                        <ul class="course-subject-teachers-panel" role="list">
                          <li v-for="name in headTeacherNames(group)" :key="name">{{ name }}</li>
                        </ul>
                      </details>
                      <span
                        v-else
                        class="course-subject-teacher"
                        :class="{ empty: !headTeacherNames(group).length }"
                        :title="headTeacherNames(group).length ? `Profesor jefe de ${group.name} · ${group.section}` : 'Sin profesor jefe'"
                      >
                        <GraduationCap :size="14" aria-hidden="true" />
                        {{ headTeacherSummary(group) }}
                      </span>
                    </div>
                  </template>
                  <template #cell-student_count="{ value }">{{ value || 0 }}</template>
                  <template #cell-average="{ value }">
                    <strong :class="gradeClass(value)">{{ value || '—' }}</strong>
                  </template>
                  <template #cell-actions="{ row: group }">
                    <div class="course-row-actions">
                      <button type="button" class="edit-button" @click.stop="openCourseDetail(group.id)"><Eye :size="14" />Abrir curso</button>
                      <button
                        v-if="authUser.role !== 'guardian'"
                        type="button"
                        class="edit-button"
                        @click.stop="openCourseClassroom(group.id, 'archivos')"
                      ><FileText :size="14" />Archivos</button>
                    </div>
                  </template>
                </DataTable>
              </div>
              <EmptyState v-else class="module-empty">
                <BookOpen :size="28" />
                <strong>{{
                  courseDirectorySearch.trim()
                    ? 'Sin resultados'
                    : authUser.role === 'teacher'
                      ? 'Sin asignaturas asignadas'
                      : ['guardian', 'student'].includes(authUser.role)
                        ? 'Sin cursos visibles'
                        : 'Aún no hay cursos'
                }}</strong>
                <span>{{
                  courseDirectorySearch.trim()
                    ? 'No hay cursos que coincidan con la búsqueda.'
                    : authUser.role === 'teacher'
                      ? 'Cuando te asignen un ramo o te nombren profesor jefe, aparecerán aquí.'
                      : authUser.role === 'guardian'
                        ? 'Cuando el colegio vincule estudiantes a tu cuenta, verás sus cursos aquí.'
                        : authUser.role === 'student'
                          ? 'Cuando te matriculen en un curso, aparecerá aquí.'
                          : 'Crea un curso y elige solo las asignaturas que necesitas.'
                }}</span>
                <button v-if="canManageAcademicStructure && !courseDirectorySearch.trim()" class="primary-button" @click="openNewCoursePage"><Plus :size="17" />Nuevo curso</button>
              </EmptyState>
            </article>
            <TablePagination
              v-if="sortedCourseGroupRows.length"
              v-model:page="courseGroupsPage"
              :page-count="courseGroupsPageCount"
              :range-label="courseGroupsRangeLabel"
              :show="true"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Nueva comunicación' && !['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(authUser.role)">
          <div class="profile-page-toolbar"><button class="secondary-button" @click="backFromCommunication"><ArrowLeft :size="16" />{{ communicationStudentContext ? 'Volver al estudiante' : 'Volver a comunicaciones' }}</button></div>
          <form class="panel standalone-form communication-create-form" @submit.prevent="saveCommunication">
            <div class="account-panel-heading"><span class="admin-icon"><Send /></span><div><h2>{{ communicationStudentContext ? 'Comunicado al estudiante' : 'Preparar comunicación' }}</h2><p>{{ communicationStudentContext ? 'Redacta el mensaje para este estudiante y sus apoderados.' : 'Define los destinatarios y redacta el mensaje antes de publicarlo.' }}</p></div></div>
            <div v-if="communicationError" class="login-error account-error">{{ communicationError }}</div>
            <FormSection class="communication-audience-field">
              <legend>{{ communicationStudentContext ? 'Destinatario' : '¿A quién quieres enviar?' }}</legend>
              <div v-if="!communicationStudentContext" class="communication-audience-grid">
                <label :class="{ selected: communicationAudienceSelected('all') }" @click.prevent="toggleCommunicationAudience('all')"><input :checked="communicationAudienceSelected('all')" name="communication-audience-all" type="checkbox" value="all" tabindex="-1" /><span class="communication-audience-icon"><Users :size="20" /></span><span><strong>Toda la comunidad</strong><small>Estudiantes, apoderados y equipo</small></span><Check v-if="communicationAudienceSelected('all')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('students') }" @click.prevent="toggleCommunicationAudience('students')"><input :checked="communicationAudienceSelected('students')" name="communication-audience-students" type="checkbox" value="students" tabindex="-1" /><span class="communication-audience-icon"><GraduationCap :size="20" /></span><span><strong>Todos los estudiantes</strong><small>Sólo cuentas de alumnos</small></span><Check v-if="communicationAudienceSelected('students')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('guardians') }" @click.prevent="toggleCommunicationAudience('guardians')"><input :checked="communicationAudienceSelected('guardians')" name="communication-audience-guardians" type="checkbox" value="guardians" tabindex="-1" /><span class="communication-audience-icon"><ShieldCheck :size="20" /></span><span><strong>Todos los apoderados</strong><small>Sólo cuentas familiares</small></span><Check v-if="communicationAudienceSelected('guardians')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('teachers') }" @click.prevent="toggleCommunicationAudience('teachers')"><input :checked="communicationAudienceSelected('teachers')" name="communication-audience-teachers" type="checkbox" value="teachers" tabindex="-1" /><span class="communication-audience-icon"><BookOpen :size="20" /></span><span><strong>Todos los profesores</strong><small>Sólo cuentas docentes</small></span><Check v-if="communicationAudienceSelected('teachers')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('managers') }" @click.prevent="toggleCommunicationAudience('managers')"><input :checked="communicationAudienceSelected('managers')" name="communication-audience-managers" type="checkbox" value="managers" tabindex="-1" /><span class="communication-audience-icon"><ShieldCheck :size="20" /></span><span><strong>Equipo directivo</strong><small>Managers y administración del colegio</small></span><Check v-if="communicationAudienceSelected('managers')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('course') }" @click.prevent="toggleCommunicationAudience('course')"><input :checked="communicationAudienceSelected('course')" name="communication-audience-course" type="checkbox" value="course" tabindex="-1" /><span class="communication-audience-icon"><BookOpen :size="20" /></span><span><strong>Un curso</strong><small>Estudiantes matriculados en el curso</small></span><Check v-if="communicationAudienceSelected('course')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('student') }" @click.prevent="toggleCommunicationAudience('student')"><input :checked="communicationAudienceSelected('student')" name="communication-audience-student" type="checkbox" value="student" tabindex="-1" /><span class="communication-audience-icon"><GraduationCap :size="20" /></span><span><strong>Un estudiante</strong><small>Él o ella y sus apoderados</small></span><Check v-if="communicationAudienceSelected('student')" :size="17" /></label>
                <label :class="{ selected: communicationAudienceSelected('guardian') }" @click.prevent="toggleCommunicationAudience('guardian')"><input :checked="communicationAudienceSelected('guardian')" name="communication-audience-guardian" type="checkbox" value="guardian" tabindex="-1" /><span class="communication-audience-icon"><ShieldCheck :size="20" /></span><span><strong>Un apoderado</strong><small>Solo esa cuenta familiar</small></span><Check v-if="communicationAudienceSelected('guardian')" :size="17" /></label>
              </div>
              <div v-if="!communicationStudentContext" class="communication-audience-actions">
                <button type="button" class="edit-button" :disabled="!canListCommunicationRecipients" @click="openCommunicationRecipientsPage"><ClipboardList :size="15" />Listar destinatarios</button>
                <small v-if="communicationForm.audiences.length > 1">Puedes combinar estudiantes, apoderados, profesores y equipo directivo. Toda la comunidad es exclusiva.</small>
              </div>
              <div v-if="communicationAudienceSelected('course')" class="communication-student-picker">
                <label class="field"><span>Curso</span>
                  <select v-model.number="communicationForm.courseId" required>
                    <option :value="null" disabled>Selecciona un curso</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.name }} · {{ course.section }} · {{ course.subject }}</option>
                  </select>
                </label>
              </div>
              <div v-if="communicationAudienceSelected('student')" class="communication-student-picker">
                <div v-if="communicationStudentSelected" class="communication-recipient-chip">
                  <span class="avatar">{{ initials(communicationStudentSelected.first_name, communicationStudentSelected.last_name) }}</span>
                  <div>
                    <strong>{{ communicationStudentSelected.first_name }} {{ communicationStudentSelected.last_name }}</strong>
                    <small>Se envía al estudiante y a sus apoderados</small>
                  </div>
                  <button v-if="!communicationStudentContext" type="button" class="edit-button" @click="communicationForm.studentId = null; communicationStudentSelected = null; communicationStudentSearch = ''">Cambiar</button>
                </div>
                <template v-else>
                  <label class="field wide communication-student-search">
                    <span>Buscar estudiante</span>
                    <div class="communication-search-bar">
                      <Search :size="17" />
                      <input v-model.trim="communicationStudentSearch" type="search" placeholder="Nombre o correo del estudiante" autocomplete="off" />
                    </div>
                  </label>
                  <div v-if="communicationStudentCandidates.length" class="student-autocomplete communication-student-results">
                    <button v-for="student in communicationStudentCandidates" :key="student.id" type="button" @click="selectCommunicationStudent(student)">
                      <strong>{{ student.first_name }} {{ student.last_name }}</strong>
                      <small>{{ student.email || 'Sin correo' }}</small>
                    </button>
                  </div>
                  <p v-else-if="communicationStudentSearch.trim().length >= 2" class="communication-picker-hint">No encontramos estudiantes con ese criterio.</p>
                  <p v-else class="communication-picker-hint">Escribe al menos 2 caracteres para buscar.</p>
                </template>
              </div>
              <div v-else-if="communicationAudienceSelected('guardian')" class="communication-student-picker">
                <div v-if="communicationGuardianSelected" class="communication-recipient-chip">
                  <span class="avatar">{{ initials(...String(communicationGuardianSelected.full_name || '').trim().split(/\s+/)) }}</span>
                  <div>
                    <strong>{{ communicationGuardianSelected.full_name }}</strong>
                    <small>{{ communicationGuardianSelected.email || 'Apoderado seleccionado' }}</small>
                  </div>
                  <button type="button" class="edit-button" @click="communicationForm.guardianId = null; communicationGuardianSelected = null; communicationGuardianSearch = ''; communicationGuardianCandidates = []">Cambiar</button>
                </div>
                <template v-else>
                  <label class="field wide communication-student-search">
                    <span>Buscar apoderado</span>
                    <div class="communication-search-bar">
                      <Search :size="17" />
                      <input v-model.trim="communicationGuardianSearch" type="search" placeholder="Nombre o correo del apoderado" autocomplete="off" @input="searchCommunicationGuardians" />
                    </div>
                  </label>
                  <div v-if="communicationGuardianCandidates.length" class="student-autocomplete communication-student-results">
                    <button v-for="guardian in communicationGuardianCandidates" :key="guardian.id" type="button" @click="selectCommunicationGuardian(guardian)">
                      <strong>{{ guardian.fullName || guardian.full_name }}</strong>
                      <small>{{ guardian.email || 'Sin correo' }}</small>
                    </button>
                  </div>
                  <p v-else-if="communicationGuardianSearch.trim().length >= 2" class="communication-picker-hint">No encontramos apoderados con ese criterio.</p>
                  <p v-else class="communication-picker-hint">Escribe al menos 2 caracteres o usa <strong>Enviar comunicado</strong> desde la ficha.</p>
                </template>
              </div>
            </FormSection>
            <FormSection class="communication-channel-field">
              <legend>¿Cómo lo envías?</legend>
              <div class="communication-channel-grid">
                <label class="communication-channel-card" :class="{ selected: communicationForm.channel === 'notification' }">
                  <input v-model="communicationForm.channel" name="communication-channel" required type="radio" value="notification" />
                  <span class="communication-channel-icon is-portal"><Bell :size="18" /></span>
                  <span><strong>Portal</strong><small>Queda en la bandeja de hlquery</small></span>
                </label>
                <label class="communication-channel-card" :class="{ selected: communicationForm.channel === 'email' }">
                  <input v-model="communicationForm.channel" name="communication-channel" required type="radio" value="email" />
                  <span class="communication-channel-icon is-email"><Mail :size="18" /></span>
                  <span><strong>Correo</strong><small>Envío por email a los destinatarios</small></span>
                </label>
                <label class="communication-channel-card" :class="{ selected: communicationForm.channel === 'whatsapp', disabled: !whatsappConfigured }" :aria-disabled="!whatsappConfigured">
                  <input v-model="communicationForm.channel" name="communication-channel" type="radio" value="whatsapp" :disabled="!whatsappConfigured" />
                  <span class="communication-channel-icon is-whatsapp"><MessageCircle :size="18" /></span>
                  <span>
                    <strong>WhatsApp</strong>
                    <small>{{ whatsappConfigured ? 'Mensaje por la integración activa del colegio' : 'Actívalo en Integraciones para usarlo' }}</small>
                  </span>
                </label>
              </div>
            </FormSection>
            <div class="form-grid communication-fields">
              <label class="field wide"><span>Asunto</span><input v-model.trim="communicationForm.subject" required minlength="3" maxlength="180" placeholder="Ej. Reunión de apoderados" /></label>
              <label class="field wide"><span>Mensaje</span><textarea v-model.trim="communicationForm.body" required minlength="5" maxlength="5000" rows="9" placeholder="Escribe el comunicado..." /></label>
            </div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="backFromCommunication">Cancelar</button><button class="primary-button" :disabled="communicationSaving"><span v-if="communicationSaving" class="spinner"></span><Send v-else :size="17" />{{ communicationSaving ? 'Enviando...' : 'Enviar comunicación' }}</button></div>
          </form>
        </template>

        <template v-else-if="currentView === 'Destinatarios comunicación' && !['guardian', 'student', 'finance', 'agente_finanzas', 'monitor'].includes(authUser.role)">
          <div class="profile-page-toolbar">
            <button class="secondary-button" @click="backToCommunicationComposer"><ArrowLeft :size="16" />Volver a la comunicación</button>
          </div>
          <div class="panel-with-pager">
          <section class="panel standalone-form communication-recipients-page">
            <div class="account-panel-heading">
              <span class="admin-icon"><ClipboardList /></span>
              <div>
                <h2>Destinatarios del comunicado</h2>
                <p>{{ communicationRecipientsTotal }} {{ communicationRecipientsTotal === 1 ? 'persona' : 'personas' }} según la selección actual.</p>
              </div>
            </div>
            <div v-if="communicationRecipientsError" class="login-error account-error">{{ communicationRecipientsError }}</div>
            <div v-if="communicationRecipientsLoading" class="communication-picker-hint">Cargando destinatarios…</div>
            <div v-else-if="!communicationRecipients.length" class="communication-picker-hint">No hay destinatarios para esta selección.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in pagedCommunicationRecipients" :key="`${row.email || row.name}-${index}`">
                    <td>{{ row.name || '—' }}</td>
                    <td>{{ row.email || 'Sin correo' }}</td>
                    <td>{{ row.roleLabel || formatModuleCell('audience', row.role) || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
            <TablePagination
              v-model:page="communicationRecipientsPage"
              :page-count="communicationRecipientsPageCount"
              :range-label="communicationRecipientsRangeLabel"
              :show="showCommunicationRecipientsPagination"
            />
          </div>
        </template>

        <template v-else-if="currentView === 'Detalle comunicación' && !['finance', 'agente_finanzas', 'monitor'].includes(authUser.role)">
          <div class="profile-page-toolbar">
            <button class="secondary-button" type="button" @click="backFromCommunicationDetail">
              <ArrowLeft :size="16" />{{ canOpenCommunications ? 'Volver a comunicaciones' : 'Volver' }}
            </button>
          </div>
          <section class="panel standalone-form communication-detail-page">
            <div v-if="communicationDetailLoading" class="communication-picker-hint">Cargando comunicado…</div>
            <div v-else-if="communicationDetailError" class="login-error account-error">{{ communicationDetailError }}</div>
            <template v-else-if="communicationDetail">
              <div class="communication-detail-hero">
                <div class="account-panel-heading">
                  <span class="admin-icon"><Inbox /></span>
                  <div>
                    <h2>{{ communicationDetail.subject }}</h2>
                    <p>
                      {{ communicationChannelLabel(communicationDetail.channel) }}
                      <template v-if="!['guardian', 'student'].includes(authUser.role)">
                        · {{ formatModuleCell('audience', communicationDetail.audience) }}
                      </template>
                      <template v-if="communicationDetail.courseName"> · {{ communicationDetail.courseName }}</template>
                      · {{ communicationDetail.sentAt ? formatDate(String(communicationDetail.sentAt).slice(0, 10)) : 'Sin fecha' }}
                    </p>
                  </div>
                </div>
                <div v-if="!['guardian', 'student'].includes(authUser.role)" class="communication-sent-count" aria-label="Cantidad de destinatarios">
                  <strong>{{ communicationDetailTotal }}</strong>
                  <small>{{ communicationDetailTotal === 1 ? 'destinatario' : 'destinatarios' }}</small>
                </div>
              </div>

              <div class="communication-detail-meta panel-inset">
                <div>
                  <span>Enviado por</span>
                  <strong>{{ communicationDetail.senderName || 'Usuario del colegio' }}</strong>
                  <small v-if="communicationDetail.senderRoleLabel || communicationDetail.senderRole">
                    {{ communicationDetail.senderRoleLabel || roleLabels[communicationDetail.senderRole] || communicationDetail.senderRole }}
                  </small>
                </div>
                <div>
                  <span>Canal</span>
                  <strong>{{ communicationChannelLabel(communicationDetail.channel) }}</strong>
                </div>
                <div v-if="!['guardian', 'student'].includes(authUser.role)">
                  <span>Destinatarios</span>
                  <strong>{{ formatModuleCell('audience', communicationDetail.audience) }}</strong>
                </div>
                <div>
                  <span>Fecha</span>
                  <strong>{{ communicationDetail.sentAt ? formatDate(String(communicationDetail.sentAt).slice(0, 10)) : 'Sin fecha' }}</strong>
                </div>
              </div>

              <div class="communication-detail-body panel-inset">
                <h3>Mensaje</h3>
                <p class="preserve-lines">{{ communicationDetail.body }}</p>
              </div>

              <div v-if="!['guardian', 'student'].includes(authUser.role)" class="communication-sent-to">
                <div class="communication-sent-to-head">
                  <div>
                    <h3>Enviado a</h3>
                    <p>{{ communicationDetailTotal }} {{ communicationDetailTotal === 1 ? 'persona alcanzada por este comunicado' : 'personas alcanzadas por este comunicado' }}.</p>
                  </div>
                </div>
                <div v-if="!communicationDetailRecipients.length" class="communication-picker-hint">No se encontraron destinatarios para este comunicado.</div>
                <div v-else class="table-wrap">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in pagedCommunicationDetailRecipients" :key="`${row.email || row.name}-${index}`">
                        <td>{{ (communicationDetailRecipientsPage - 1) * 15 + index + 1 }}</td>
                        <td>{{ row.name || '—' }}</td>
                        <td>{{ row.email || 'Sin correo' }}</td>
                        <td>{{ row.roleLabel || formatModuleCell('audience', row.role) || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  v-model:page="communicationDetailRecipientsPage"
                  :page-count="communicationDetailRecipientsPageCount"
                  :range-label="communicationDetailRecipientsRangeLabel"
                  :show="showCommunicationDetailRecipientsPagination"
                />

              </div>
            </template>
          </section>
        </template>

        <template v-else-if="currentView === 'Comunicaciones' && moduleData">
          <section class="gmail-inbox panel">
            <aside class="gmail-list-pane">
              <div class="gmail-list-tools">
                <label class="gmail-search">
                  <Search :size="16" />
                  <input v-model="moduleSearch" type="search" placeholder="Buscar en comunicados" aria-label="Buscar comunicaciones" />
                </label>
                <div class="gmail-channel-tabs" role="tablist" aria-label="Canal">
                  <button type="button" role="tab" :aria-selected="inboxChannelFilter === 'all'" :class="{ active: inboxChannelFilter === 'all' }" @click="setInboxChannelFilter('all')">Todos <em>{{ inboxChannelCounts.all }}</em></button>
                  <button type="button" role="tab" :aria-selected="inboxChannelFilter === 'email'" :class="{ active: inboxChannelFilter === 'email' }" @click="setInboxChannelFilter('email')">Correo <em>{{ inboxChannelCounts.email }}</em></button>
                  <button type="button" role="tab" :aria-selected="inboxChannelFilter === 'whatsapp'" :class="{ active: inboxChannelFilter === 'whatsapp' }" @click="setInboxChannelFilter('whatsapp')">WhatsApp <em>{{ inboxChannelCounts.whatsapp }}</em></button>
                  <button type="button" role="tab" :aria-selected="inboxChannelFilter === 'notification'" :class="{ active: inboxChannelFilter === 'notification' }" @click="setInboxChannelFilter('notification')">Portal <em>{{ inboxChannelCounts.notification }}</em></button>
                </div>
              </div>
              <div v-if="pagedCommunicationRows.length" class="gmail-thread-list" role="listbox" aria-label="Lista de comunicados">
                <button
                  v-for="row in pagedCommunicationRows"
                  :key="row.id"
                  type="button"
                  role="option"
                  class="gmail-thread"
                  :class="{ active: selectedInboxMessage?.id === row.id }"
                  :aria-selected="selectedInboxMessage?.id === row.id"
                  @click="selectInboxMessage(row)"
                >
                  <span class="gmail-channel-dot" :data-channel="row.channel" aria-hidden="true">
                    <Mail v-if="row.channel === 'email'" :size="14" />
                    <MessageCircle v-else-if="row.channel === 'whatsapp'" :size="14" />
                    <Bell v-else :size="14" />
                  </span>
                  <span class="gmail-thread-main">
                    <span class="gmail-thread-top">
                      <strong>{{ row.subject }}</strong>
                      <time>{{ row.sentAt === '—' ? '' : formatDate(String(row.sentAt).slice(0, 10)) }}</time>
                    </span>
                    <span class="gmail-thread-meta">
                      <span class="gmail-channel-pill" :data-channel="row.channel">{{ communicationChannelLabel(row.channel) }}</span>
                      <span>{{ formatModuleCell('audience', row.audience) }}</span>
                      <span v-if="communicationRecipientLabel(row)" class="gmail-recipient-count">{{ communicationRecipientLabel(row) }}</span>
                    </span>
                    <em>{{ row.body }}</em>
                  </span>
                </button>
              </div>
              <EmptyState v-else class="gmail-list-empty">No hay comunicados en esta vista.</EmptyState>
              <TablePagination
                v-if="communicationPageCount > 1"
                class="gmail-list-pager"
                v-model:page="communicationPage"
                :page-count="communicationPageCount"
              />
            </aside>

            <article class="gmail-read-pane">
              <template v-if="selectedInboxMessage">
                <header class="gmail-read-header">
                  <div class="gmail-read-title">
                    <h2>{{ selectedInboxMessage.subject }}</h2>
                    <span class="gmail-channel-pill" :data-channel="selectedInboxMessage.channel">{{ communicationChannelLabel(selectedInboxMessage.channel) }}</span>
                  </div>
                  <div class="gmail-read-meta">
                    <div>
                      <span>De</span>
                      <strong>{{ selectedInboxMessage.senderName || 'Usuario del colegio' }}</strong>
                    </div>
                    <div>
                      <span>Para</span>
                      <strong>{{ formatModuleCell('audience', selectedInboxMessage.audience) }}</strong>
                    </div>
                    <div>
                      <span>Personas</span>
                      <strong>{{ communicationRecipientLabel(selectedInboxMessage) || 'Sin conteo' }}</strong>
                    </div>
                    <div>
                      <span>Enviado</span>
                      <strong>{{ selectedInboxMessage.sentAt === '—' ? 'Sin fecha' : formatDate(String(selectedInboxMessage.sentAt).slice(0, 10)) }}</strong>
                    </div>
                    <div>
                      <span>Canal</span>
                      <strong>{{ communicationChannelLabel(selectedInboxMessage.channel) }}</strong>
                    </div>
                  </div>
                </header>
                <div class="gmail-read-body" :data-channel="selectedInboxMessage.channel">{{ selectedInboxMessage.body }}</div>
              </template>
              <EmptyState v-else class="gmail-read-empty">
                <Inbox :size="36" />
                <strong>Selecciona un comunicado</strong>
                <span>La bandeja se lee como el correo: lista a la izquierda y mensaje completo a la derecha.</span>
              </EmptyState>
            </article>
          </section>
        </template>

        <template v-else-if="currentView === 'Más años'">
          <section class="panel finance-years-page">
            <PageHeader><div><h2>Seleccionar año de Finanzas</h2><p>Elige un año para consultar sus movimientos.</p></div><PageActions><button type="button" class="secondary-button" @click="openFinanceYear(financeYear)"><ArrowLeft :size="16" />Volver a Finanzas</button></PageActions></PageHeader>
            <div class="finance-years-grid"><button v-for="year in accountabilityYears" :key="year" type="button" :class="{ active: year === financeYear }" :aria-pressed="year === financeYear" @click="openFinanceYear(year)">{{ year }}</button></div>
          </section>
        </template>

        <template v-else-if="currentView === 'Detalle anotación'">
          <div class="profile-page-toolbar">
            <button class="secondary-button" type="button" @click="navigate('Libro de clases')">
              <ArrowLeft :size="16" />Volver al libro de clases
            </button>
            <div v-if="observationDetail && canManageObservation(observationDetail)" class="profile-page-toolbar-actions">
              <button type="button" class="edit-button" @click="editObservationFromDetail"><Pencil :size="15" />Editar</button>
              <button type="button" class="edit-button danger-button" @click="deleteObservationFromDetail"><Trash2 :size="15" />Eliminar</button>
            </div>
          </div>
          <section class="panel standalone-form communication-detail-page observation-detail-page">
            <div v-if="observationDetailLoading" class="communication-picker-hint">Cargando anotación…</div>
            <div v-else-if="observationDetailError" class="login-error account-error">{{ observationDetailError }}</div>
            <template v-else-if="observationDetail">
              <div class="communication-detail-hero">
                <div class="account-panel-heading">
                  <span class="admin-icon"><BookOpen /></span>
                  <div>
                    <h2>{{ observationDetail.studentName || 'Anotación' }}</h2>
                    <p>
                      <span class="observation-kind-pill" :data-kind="observationDetail.kind">{{ observationKindLabel[observationDetail.kind] || observationDetail.kind }}</span>
                      <template v-if="observationDetail.courseName"> · {{ observationDetail.courseName }}</template>
                      · {{ observationDetail.createdAt ? formatDate(String(observationDetail.createdAt).slice(0, 10)) : 'Sin fecha' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="communication-detail-meta panel-inset">
                <div>
                  <span>Registrado por</span>
                  <strong>{{ observationDetail.createdByName || 'Usuario del colegio' }}</strong>
                  <small v-if="observationDetail.createdByRoleLabel || observationDetail.createdByRole">
                    {{ observationDetail.createdByRoleLabel || ROLE_OBS_LABELS[observationDetail.createdByRole] || observationDetail.createdByRole }}
                  </small>
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>{{ observationKindLabel[observationDetail.kind] || observationDetail.kind || '—' }}</strong>
                </div>
                <div>
                  <span>Curso / asignatura</span>
                  <strong>{{ observationDetail.courseName || '—' }}</strong>
                </div>
                <div>
                  <span>Fecha</span>
                  <strong>{{ observationDetail.createdAt ? formatDate(String(observationDetail.createdAt).slice(0, 10)) : 'Sin fecha' }}</strong>
                </div>
              </div>

              <div class="communication-detail-body panel-inset">
                <h3>Detalle</h3>
                <p class="preserve-lines">{{ observationDetail.detail || 'Sin detalle' }}</p>
              </div>

              <div v-if="observationHasAttachment(observationDetail)" class="communication-detail-body panel-inset">
                <h3>Adjunto</h3>
                <button type="button" class="edit-button observation-attach-button" @click="previewObservation(observationDetail)">
                  <Download :size="14" /><span>{{ observationDetail.attachmentName || 'Descargar archivo' }}</span>
                </button>
              </div>

              <div v-if="observationDetail.studentId" class="observation-detail-actions">
                <button type="button" class="secondary-button" @click="openStudentAnotaciones(observationDetail.studentId)">
                  Ver anotaciones del estudiante
                </button>
              </div>
            </template>
          </section>
        </template>

        <template v-else-if="activeModuleKey">
          <div v-if="(moduleLoading && !moduleData && !(currentView === 'RRHH' && selectedEmployee)) || (currentView === 'RRHH' && employeeDetailLoading && !selectedEmployee)" class="page-loading" role="status" aria-live="polite">
            <span class="spinner page-spinner" aria-hidden="true"></span>
            <strong>Cargando…</strong>
            <span>{{ currentView === 'RRHH' ? (selectedEmployee || employeeDetailLoading ? 'Ficha del empleado' : (employeeStatus === 'inactive' ? 'Historial de empleados' : 'Empleados activos')) : (moduleData?.title || currentView) }}</span>
            <div class="loading-grid page-loading-skeletons" aria-hidden="true">
              <Skeleton v-for="n in 4" :key="n" class="skeleton" />
            </div>
          </div>
          <div v-else-if="moduleData || (currentView === 'RRHH' && selectedEmployee)" class="erp-module" :aria-busy="moduleLoading || employeeDetailLoading">
            <template v-if="currentView === 'RRHH' && selectedEmployee">
              <div class="profile-page-toolbar">
                <button type="button" class="secondary-button" @click="closeEmployee"><ArrowLeft :size="16" />Volver al listado</button>
              </div>
              <article class="panel employee-profile">
                <div class="employee-profile-heading"><span class="avatar avatar-photo">{{ selectedEmployee.fullName.split(' ').map(v => v[0]).slice(0,2).join('') }}</span><div><small>FICHA DEL EMPLEADO</small><h2>{{ selectedEmployee.fullName }}</h2><p>{{ selectedEmployee.position }} · Contrato {{ formatModuleCell('contractType', selectedEmployee.contractType) }}<template v-if="selectedEmployee.workModality"> · {{ selectedEmployee.workModality }}</template></p></div></div>
                <div class="employee-profile-actions">
                  <button class="secondary-button" @click="showLinkedDocuments('employeeId', selectedEmployee.id, selectedEmployee.fullName)"><FileText :size="16" />Ver documentos</button>
                  <button v-if="canManageHr && employeeStatus === 'active'" class="secondary-button danger-button" :disabled="deletingEmployeeId === selectedEmployee.id" @click="deleteEmployee(selectedEmployee)"><Trash2 :size="16" />Eliminar del sistema</button>
                  <button
                    v-if="canManageHr && selectedEmployee.userId && selectedEmployee.platformAccess === false"
                    type="button"
                    class="secondary-button"
                    :disabled="deletingEmployeeId === selectedEmployee.id"
                    @click="setEmployeePlatformAccess(selectedEmployee, true)"
                  >Restaurar acceso a la plataforma</button>
                  <button
                    v-else-if="canManageHr && selectedEmployee.userId && selectedEmployee.platformAccess !== false && employeeStatus === 'inactive'"
                    type="button"
                    class="secondary-button danger-button"
                    :disabled="deletingEmployeeId === selectedEmployee.id"
                    @click="setEmployeePlatformAccess(selectedEmployee, false)"
                  >Revocar acceso a la plataforma</button>
                </div>

                <form v-if="canManageHr" class="employee-rehire-form" @submit.prevent="employeeStatus === 'inactive' ? restoreEmployee(selectedEmployee) : saveEmployeeProfileEdits()">
                  <div class="account-panel-heading">
                    <span class="admin-icon"><Users /></span>
                    <div>
                      <h3>{{ employeeStatus === 'inactive' ? 'Reintegrar y modificar' : 'Editar ficha' }}</h3>
                      <p>{{ employeeStatus === 'inactive' ? 'Corrige cargo, contrato, modalidad o sueldo y vuelve a activar al trabajador.' : 'Actualiza los datos laborales del colaborador.' }}</p>
                    </div>
                  </div>
                  <div class="form-grid">
                    <label class="field wide"><span>Nombre completo</span><input v-model.trim="employeeRehireForm.fullName" required minlength="3" maxlength="120" /></label>
                    <label class="field wide"><span>Cargo</span>
                      <div class="field-select">
                        <select v-model="employeeRehireForm.position" required>
                          <option value="" disabled>Selecciona un cargo</option>
                          <option v-for="title in employeePositionOptions" :key="title" :value="title">{{ title }}</option>
                          <option v-if="employeeRehireForm.position && !employeePositionOptions.includes(employeeRehireForm.position)" :value="employeeRehireForm.position">{{ employeeRehireForm.position }}</option>
                        </select>
                        <ChevronDown :size="16" />
                      </div>
                    </label>
                    <label class="field"><span>Tipo de contrato</span>
                      <select v-model="employeeRehireForm.contractType" required>
                        <option>Indefinido</option>
                        <option>Plazo fijo</option>
                        <option>Honorarios</option>
                        <option>Reemplazo</option>
                      </select>
                    </label>
                    <label class="field"><span>Modalidad</span>
                      <select v-model="employeeRehireForm.workModality" required>
                        <option v-for="modality in EMPLOYEE_WORK_MODALITIES" :key="modality" :value="modality">{{ modality }}</option>
                      </select>
                    </label>
                    <label class="field"><span>Fecha de ingreso</span><input v-model="employeeRehireForm.hiredOn" required type="date" /></label>
                    <label class="field"><span>Sueldo base</span><input v-model.number="employeeRehireForm.monthlySalary" required type="number" min="0" step="1" /></label>
                    <label v-if="employeeStatus === 'inactive' && selectedEmployee.userId" class="switch-field wide">
                      <input v-model="employeeRehireForm.restoreAccess" type="checkbox" />
                      <span><i></i><strong>Restaurar acceso a la plataforma</strong><small>Si tiene cuenta de usuario, vuelve a activarla al reintegrar.</small></span>
                    </label>
                  </div>
                  <div class="modal-actions">
                    <button v-if="employeeStatus === 'active'" type="submit" class="primary-button" :disabled="employeeRehireSaving"><span v-if="employeeRehireSaving" class="spinner"></span><Check v-else :size="18" />{{ employeeRehireSaving ? 'Guardando…' : 'Guardar cambios' }}</button>
                    <template v-else>
                      <button type="button" class="secondary-button" :disabled="employeeRehireSaving" @click="saveEmployeeProfileEdits"><span v-if="employeeRehireSaving" class="spinner"></span>{{ employeeRehireSaving ? 'Guardando…' : 'Solo guardar' }}</button>
                      <button type="submit" class="primary-button" :disabled="employeeRehireSaving || deletingEmployeeId === selectedEmployee.id"><span v-if="employeeRehireSaving" class="spinner"></span><Check v-else :size="18" />{{ employeeRehireSaving ? 'Reintegrando…' : 'Reintegrar empleado' }}</button>
                    </template>
                  </div>
                </form>

                <div class="employee-profile-data"><span>Fecha de ingreso<strong>{{ selectedEmployee.hiredOn === '—' ? '—' : formatDate(selectedEmployee.hiredOn) }}</strong></span><span v-if="selectedEmployee.endedOn">Hasta<strong>{{ formatDate(selectedEmployee.endedOn) }}</strong></span><span>Modalidad<strong>{{ selectedEmployee.workModality || '—' }}</strong></span><span>Estado<strong>{{ selectedEmployee.active }}</strong></span><span v-if="selectedEmployee.userId">Acceso plataforma<strong>{{ selectedEmployee.platformAccess === false ? 'Revocado' : 'Activo' }}</strong></span></div>
                <Payroll v-if="canManageHr" :employee-id="Number(selectedEmployee.id)" :key="`${selectedEmployee.id}-${selectedEmployee.active}`" />
              </article>
            </template>
            <template v-else>
            <div class="module-intro" :class="{ 'documents-intro': currentView === 'Documentos' }">
              <span class="admin-icon">
                <BookOpen v-if="currentView === 'Libro de clases'" />
                <Users v-else-if="currentView === 'RRHH'" />
                <CreditCard v-else-if="currentView === 'Finanzas'" />
                <Upload v-else-if="currentView === 'Documentos'" />
                <FileText v-else />
              </span>
              <div>
                <h2>{{ currentView === 'RRHH' ? (employeeStatus === 'inactive' ? 'Historial de empleados' : 'Empleados activos') : moduleData.title }}</h2>
                <p>{{ currentView === 'RRHH' ? (employeeStatus === 'inactive' ? 'Ex empleados y fichas dadas de baja. Puedes modificar y reintegrar cuando corresponda.' : 'Personal vigente del colegio: contratos, cargos y vigencia laboral.') : moduleData.description }}</p>
              </div>
              <div class="module-intro-actions">
                <button v-if="canAddStudentRecord && ['Convivencia', 'Libro de clases'].includes(currentView)" class="module-create-button" @click="openManagement(currentView === 'Convivencia' ? 'incident' : 'observation')"><Plus :size="17" />{{ currentView === 'Convivencia' ? 'Agregar caso' : 'Agregar anotación' }}</button>
                <button v-if="canAddStudentRecord && currentView === 'Citaciones'" class="module-create-button" type="button" @click="openCitation()"><Plus :size="17" />Citar a apoderado</button>
                <label v-if="currentView === 'Finanzas' && canManageFinance" class="module-year-select"><span>Año</span><select :value="financeYear" aria-label="Año de Finanzas" @change="selectFinanceYear"><option v-for="year in recentFinanceYears" :key="year" :value="year">{{ year }}</option><option value="more">Más años…</option></select></label>
                <button v-if="currentView === 'Finanzas' && canManageFinance" class="module-create-button" @click="exportFinanceExcel"><Download :size="17" />Exportar a Excel</button>
                <button v-if="currentView === 'Finanzas' && canManageFinance && (!activeModuleSection || activeModuleSection === 'Documentos de cobro')" class="module-create-button" @click="openManagement('invoice')"><Plus :size="17" />Documento de cobro</button>
                <button
                  v-if="currentView === 'Documentos' && canManageDocuments"
                  type="button"
                  class="module-create-button module-create-button--emphasis"
                  @click="openDocumentUploadPage()"
                >
                  <Upload :size="17" />Subir archivo
                </button>
                <button v-if="currentView === 'RRHH' && canManageHr && employeeStatus === 'active'" class="module-create-button" @click="openNewEmployeePage"><UserPlus :size="17" />Agregar empleado</button>
              </div>
            </div>
            <nav v-if="!['Finanzas', 'Documentos', 'Asistencia', 'RRHH', 'Historial'].includes(currentView) && moduleSubnavSections.length > 1" class="module-subnav" aria-label="Submenús"><button :class="{ active: !activeModuleSection }" @click="activeModuleSection = ''">Todo</button><button v-for="section in moduleSubnavSections" :key="section.title" :class="{ active: activeModuleSection === section.title }" @click="activeModuleSection = section.title">{{ section.title }}</button></nav>
            <div
              v-if="['Finanzas', 'RRHH', 'Historial', 'Citaciones', 'Libro de clases', 'Convivencia'].includes(currentView)"
              class="module-filter-bar"
              :class="{ 'module-filter-bar--rrhh': currentView === 'RRHH' }"
            >
              <label class="field module-search">
                <span>{{ currentView === 'Libro de clases' ? 'Buscar estudiante' : currentView === 'RRHH' ? 'Buscar empleado' : 'Buscar registros' }}</span>
                <div class="module-search-shell">
                  <Search :size="17" aria-hidden="true" />
                  <input
                    v-model="moduleSearch"
                    type="search"
                    :placeholder="currentView === 'Libro de clases' ? 'Nombre del estudiante, detalle o tipo' : currentView === 'RRHH' ? 'Nombre, cargo o contrato' : 'Nombre, número, persona o estado'"
                    :aria-label="currentView === 'Libro de clases' ? 'Buscar estudiante' : currentView === 'RRHH' ? 'Buscar empleado' : 'Buscar registros'"
                  />
                </div>
              </label>
              <label v-if="currentView === 'Libro de clases'" class="field">
                <span>Tipo</span>
                <select v-model="classbookKindFilter" aria-label="Filtrar por tipo de anotación">
                  <option value="">Todos</option>
                  <option value="positive">Positiva</option>
                  <option value="negative">Negativa</option>
                  <option value="general">General</option>
                </select>
              </label>
              <label v-if="currentView === 'RRHH'" class="field employee-type-filter">
                <span>Tipo de empleado</span>
                <select v-model="employeePositionFilter" aria-label="Filtrar por tipo de empleado">
                  <option value="">Todos</option>
                  <option v-for="position in employeeTypeFilterOptions" :key="position" :value="position">{{ position }}</option>
                </select>
              </label>
            </div>
            <div v-if="moduleKpis.length" class="module-kpi-grid"><article v-for="kpi in moduleKpis" :key="kpi.label" class="panel module-kpi"><span>{{ kpi.label }}</span><strong>{{ kpi.value }}</strong><small>{{ kpi.detail }}</small></article></div>
            <div v-if="currentView === 'Documentos'" class="documents-toolbar">
              <nav class="documents-kind-nav" aria-label="Tipos de documentos">
                <button
                  v-for="kind in ['', 'Certificado', 'Informe', 'Matrícula', 'Contrato', 'General']"
                  :key="kind || 'all'"
                  type="button"
                  :class="{ active: documentKind === kind }"
                  @click="documentKind = kind"
                >{{ kind || 'Todos' }}</button>
              </nav>
            </div>
            <div v-if="currentView === 'Finanzas'" class="module-subnav"><button :class="{ active: !activeModuleSection }" @click="navigateFinanceSection()">Todo</button><button v-for="section in moduleData.sections" :key="section.title" :class="{ active: activeModuleSection === section.title }" @click="navigateFinanceSection(section.title)">{{ section.title }}</button><button v-if="canManageAccountability" :class="{ active: isAccountabilityView }" @click="navigateFinanceSection('Rendición de cuentas')">Rendición de cuentas</button></div>
            <section v-if="isAccountabilityView" class="accountability-view">
              <div class="accountability-toolbar">
                <div><span>PERÍODO DE RENDICIÓN</span><select :value="financeYear" aria-label="Año de rendición" @change="selectFinanceYear"><option v-for="year in recentFinanceYears" :key="year" :value="year">Año {{ year }}</option><option value="more">Más años…</option></select></div>
                <div class="accountability-actions"><button class="secondary-button" :disabled="accountabilityLoading" @click="exportAccountabilityPdf"><Download :size="16" />Exportar informe PDF</button><button class="primary-button" @click="openAccountabilityForm"><Plus :size="17" />Agregar movimiento</button></div>
              </div>
              <div class="accountability-notice"><ShieldCheck :size="18" /><div><strong>Libro auxiliar para establecimientos subvencionados</strong><span>Registra respaldos y revisa saldos antes de la declaración oficial. Este módulo no reemplaza el proceso exigido por Mineduc o la Superintendencia de Educación.</span></div></div>
              <div v-if="accountabilityError && !accountabilityModalOpen" class="login-error account-error">{{ accountabilityError }}</div>
              <div v-if="accountabilityLoading" class="loading-grid"><div v-for="n in 4" :key="n" class="skeleton"></div></div>
              <template v-else>
                <div class="accountability-kpis"><article class="panel"><span>Ingresos</span><strong>{{ formatCurrency(accountabilityData.summary.income) }}</strong><small>Recursos registrados</small></article><article class="panel"><span>Egresos</span><strong>{{ formatCurrency(accountabilityData.summary.expenses) }}</strong><small>Usos registrados</small></article><article class="panel"><span>Saldo</span><strong :class="{ risk: accountabilityData.summary.balance < 0 }">{{ formatCurrency(accountabilityData.summary.balance) }}</strong><small>Ingresos menos egresos</small></article><article class="panel"><span>Revisados</span><strong>{{ accountabilityData.summary.verified }} / {{ accountabilityData.records.length }}</strong><small>Movimientos verificados</small></article></div>
                <div class="panel-with-pager"><article class="panel table-panel accountability-table"><div class="panel-header"><div><h2>Movimientos del año {{ accountabilityYear }}</h2><p>{{ accountabilityData.records.length }} respaldos registrados</p></div></div><div v-if="accountabilityData.records.length" class="table-scroll"><DataTable><thead><tr><th>Período</th><th>Tipo</th><th>Origen</th><th>Categoría</th><th>Documento</th><th>Contraparte</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr></thead><tbody><tr v-for="entry in pagedAccountabilityRecords" :key="entry.id"><td>{{ formatPeriod(entry.period) }}</td><td><span class="movement-pill" :class="entry.movementType">{{ entry.movementType === 'income' ? 'Ingreso' : 'Egreso' }}</span></td><td>{{ entry.fundingSource }}</td><td>{{ entry.category }}</td><td><strong>{{ entry.documentType }}</strong><small class="table-subline">{{ entry.documentNumber }}</small></td><td>{{ entry.counterparty }}<small v-if="entry.counterpartyTaxId" class="table-subline">{{ entry.counterpartyTaxId }}</small></td><td>{{ entry.description }}</td><td><strong>{{ formatCurrency(entry.amount) }}</strong></td><td><select v-model="entry.status" class="status-select" @change="updateAccountabilityStatus(entry)"><option value="draft">Borrador</option><option value="verified">Revisado</option></select></td></tr></tbody></DataTable></div>
            <EmptyState v-if="!accountabilityData.records.length" class="module-empty">No hay movimientos para este año. Agrega el primer ingreso o egreso con su documento de respaldo.</EmptyState></article>
                <TablePagination
                  v-model:page="accountabilityPage"
                  :page-count="accountabilityPageCount"
                  :range-label="accountabilityRangeLabel"
                  :show="showAccountabilityPagination"
                />
                </div>
              </template>
            </section>
            <div v-if="moduleLoading" class="page-loading page-loading-inline" role="status" aria-live="polite">
              <span class="spinner page-spinner" aria-hidden="true"></span>
              <strong>Actualizando registros…</strong>
              <span>{{ currentView === 'RRHH' ? (employeeStatus === 'inactive' ? 'Historial de empleados' : 'Empleados activos') : moduleData.title }}</span>
            </div>
            <div v-for="section in (moduleLoading ? [] : visibleModuleSections)" :key="section.title" class="module-section-stack panel-with-pager">
            <article class="panel table-panel module-section">
              <div class="panel-header" :class="{ 'documents-panel-header': currentView === 'Documentos' }">
                <div>
                  <h2>{{ section.title }}</h2>
                  <p>{{ filteredModuleRows(section).length }} registros</p>
                </div>
                <label v-if="currentView === 'Documentos'" class="field documents-panel-search">
                  <span class="visually-hidden">Buscar archivos</span>
                  <div class="module-search-shell">
                    <Search :size="16" aria-hidden="true" />
                    <input
                      v-model="moduleSearch"
                      type="search"
                      placeholder="Buscar archivo…"
                      aria-label="Buscar archivos"
                    />
                  </div>
                </label>
              </div>
              <div v-if="filteredModuleRows(section).length" class="table-scroll">
                <DataTable>
                  <thead>
                    <tr>
                      <th
                        v-for="column in section.columns"
                        :key="column.key"
                        scope="col"
                        class="sortable-th"
                        :class="{
                          active: moduleSortState(section).key === column.key,
                          asc: moduleSortState(section).key === column.key && String(moduleSortState(section).dir).toUpperCase() === 'ASC',
                          desc: moduleSortState(section).key === column.key && String(moduleSortState(section).dir).toUpperCase() === 'DESC',
                        }"
                        :aria-sort="moduleSortState(section).key === column.key ? (String(moduleSortState(section).dir).toUpperCase() === 'DESC' ? 'descending' : 'ascending') : 'none'"
                      >
                        <button type="button" class="sortable-th-button" @click="onModuleSort(section, column.key)">
                          <span>{{ column.label }}</span>
                          <span class="sort-indicator" aria-hidden="true">
                            <i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i>
                            <i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i>
                          </span>
                        </button>
                      </th>
                      <th v-if="currentView === 'Documentos' || section.title === 'Documentos de cobro' || (currentView === 'Libro de clases' && canAddStudentRecord)">Acciones</th>
                    </tr>
                  </thead>
                  <tbody><tr v-for="(row, index) in pagedModuleRows(section)" :key="row.id || index" :class="{ 'clickable-row': currentView === 'RRHH' || currentView === 'Libro de clases' }" @click="currentView === 'RRHH' ? openEmployee(row) : (currentView === 'Libro de clases' && openObservationDetail(row))"><td v-for="column in section.columns" :key="column.key"><button v-if="['studentId', 'studentName'].includes(column.key) && Number(row.studentId) > 0 && !financialRoles.includes(authUser.role)" type="button" class="student-cell student-cell-link module-student-link" :aria-label="`Ver ficha de ${row.studentName || row.studentId}`" @click.stop="openStudentProfile(row.studentId)"><span class="avatar" :style="{ background: moduleStudentAvatarColor(row) }"><img v-if="studentAvatars[row.studentId]" :src="studentAvatars[row.studentId]" alt="" /><template v-else>{{ moduleStudentInitials(row.studentName) }}</template></span><strong>{{ row.studentName || row.studentId }}</strong></button><select v-else-if="currentView === 'Convivencia' && column.key === 'status' && canAddStudentRecord" :value="row.status" aria-label="Estado del caso" @change="updateIncidentStatus(row,$event)"><option value="open">Abierto</option><option value="in_progress">En seguimiento</option><option value="closed">Cerrado</option></select><select v-else-if="currentView === 'Citaciones' && column.key === 'status' && canAddStudentRecord" :value="row.status" aria-label="Estado de la citación" @change="updateCitationStatus(row,$event)"><option value="scheduled">Agendada</option><option value="completed">Realizada</option><option value="cancelled">Cancelada</option></select><button v-else-if="column.key === 'attachmentName' && observationHasAttachment(row)" type="button" class="edit-button observation-attach-button" :title="row.attachmentName || 'Descargar archivo'" :aria-label="row.attachmentName ? `Descargar ${row.attachmentName}` : 'Descargar archivo'" @click.stop="previewObservation(row)"><Download :size="14" /><span>Descargar</span></button><span v-else-if="column.key === 'attachmentName'" class="observation-no-file">Sin archivo</span><span v-else-if="column.key === 'endedOn' && !row.endedOn" class="status-pill"><i></i>Actualmente empleado</span><span v-else-if="column.key === 'endedOn'" class="status-pill inactive">Hasta {{ formatDate(row.endedOn) }}</span><span v-else-if="currentView === 'Libro de clases' && column.key === 'kind'" class="observation-kind-pill" :data-kind="row.kind">{{ formatModuleCell('kind', row.kind) }}</span><span v-else-if="currentView === 'Libro de clases' && column.key === 'detail'" class="observation-detail-cell" :title="row.detail">{{ row.detail || '—' }}</span><template v-else>{{ formatModuleCell(column.key, row[column.key], currentView === 'Citaciones' ? 'citation' : '') }}</template></td><td v-if="currentView === 'Documentos'"><div class="document-actions"><button class="edit-button" @click="previewDocument(row)"><Eye :size="14" />Ver</button><button class="edit-button" @click="downloadDocument(row)"><Download :size="14" />Descargar</button></div></td><td v-if="section.title === 'Documentos de cobro'"><div v-if="row.attachmentName" class="document-actions"><button class="edit-button" @click="previewInvoice(row)"><Eye :size="14" />Ver</button><button class="edit-button" @click="downloadInvoice(row)"><Download :size="14" />{{ row.attachmentName }}</button></div><span v-else>Sin adjunto</span></td><td v-if="currentView === 'Libro de clases' && canAddStudentRecord" class="module-actions-cell"><details v-if="canManageObservation(row)" class="row-action-menu module-row-actions" @click.stop @toggle="onRowActionToggle"><summary class="row-action-trigger" aria-label="Acciones de la anotación"><MoreHorizontal :size="16" /></summary><div class="row-action-panel"><button type="button" @click="openObservationCase(row); $event.currentTarget.closest('details').open = false"><Pencil :size="15" />Editar</button><button type="button" class="danger" @click="deleteObservation(row); $event.currentTarget.closest('details').open = false"><Trash2 :size="15" />Eliminar</button></div></details><span v-else class="observation-no-file">—</span></td></tr></tbody>
                </DataTable>
              </div>
              <EmptyState v-else class="module-empty">Aún no hay registros en esta sección.</EmptyState>
            </article>
              <TablePagination
                v-if="showModulePagination(section)"
                :page="modulePage(section)"
                :page-count="modulePageCount(section)"
                :range-label="moduleRangeLabel(section)"
                :show="true"
                @update:page="setModulePage(section, $event)"
              />
            </div>
            </template>
          </div>
        </template>

        <template v-else-if="currentView === 'Administración' && authUser.permissions?.manageUsers">
          <div v-if="staffFormOpen" class="staff-form-page">
            <button type="button" class="secondary-button staff-form-back" @click="closeStaffForm"><ArrowLeft :size="16" />Volver al equipo</button>
            <form class="panel staff-form-panel" @submit.prevent="saveStaffUser">
              <div class="staff-form-heading"><button v-if="staffForm.id && staffAvatars[staffForm.id]" type="button" class="avatar staff-avatar staff-avatar-button" @click="fullImagePreview = staffAvatars[staffForm.id]"><img :src="staffAvatars[staffForm.id]" alt="Avatar del usuario" /></button><span v-else class="admin-icon"><UserPlus /></span><div><p>ADMINISTRACIÓN DE ACCESOS</p><h2>{{ staffForm.id ? 'Editar cuenta' : 'Nueva cuenta' }}</h2><span>{{ staffForm.id ? 'Actualiza los datos y permisos del usuario.' : 'Agrega un integrante al equipo académico.' }}</span></div></div>
              <div v-if="staffError" class="login-error account-error">{{ staffError }}</div>
              <div class="form-grid">
                <label v-if="staffForm.id" class="field wide staff-avatar-upload"><span>Avatar del usuario</span><div><button v-if="staffAvatars[staffForm.id]" type="button" class="edit-button" @click="fullImagePreview = staffAvatars[staffForm.id]"><Eye :size="14" />Ver imagen completa</button><label class="edit-button avatar-upload">Subir JPG o PNG<input type="file" accept="image/png,image/jpeg" @change="uploadStaffAvatar" /></label></div></label>
                <label class="field wide"><span>Nombre completo</span><input v-model.trim="staffForm.fullName" required minlength="3" maxlength="120" placeholder="Ej. Daniela Morales" /></label>
                <label class="field wide"><span>Usuario o correo</span><input v-model.trim="staffForm.username" required type="text" minlength="3" maxlength="150" autocomplete="username" placeholder="Ej. daniela o daniela@colegio.cl" /><small class="field-help">Se utilizará para iniciar sesión. El acceso sólo se envía si es un correo.</small></label>
                <label class="field wide"><span>Cargo</span><select v-model="staffForm.role" required :disabled="staffForm.id && ['guardian','student'].includes(staffForm.role)"><option value="teacher">Profesor</option><option v-if="authUser.role !== 'manager'" value="agente_finanzas">Agente de finanzas</option><option v-if="authUser.role !== 'manager'" value="manager">Equipo directivo</option><option v-if="authUser.role !== 'manager'" value="monitor">Monitor</option><option v-if="authUser.role !== 'manager'" value="utp">Jefe de UTP</option><option v-if="authUser.role !== 'manager'" value="director">Director</option><option v-if="staffForm.id && staffForm.role === 'guardian'" value="guardian">Apoderado</option><option v-if="staffForm.id && staffForm.role === 'student'" value="student">Estudiante</option></select><small v-if="staffForm.id && ['guardian','student'].includes(staffForm.role)" class="field-help">Este cargo está vinculado a su perfil académico y no se puede cambiar aquí.</small><small v-else class="field-help">Los estudiantes y apoderados se crean desde Nuevo estudiante para vincular correctamente sus perfiles.</small></label><label v-if="staffForm.role === 'teacher'" class="field wide"><span>Tipo de profesor</span><input v-model.trim="staffForm.position" maxlength="100" list="teacher-positions" placeholder="Profesor de Matemáticas, educador diferencial…" /><datalist id="teacher-positions"><option>Profesor de Matemáticas</option><option>Educador diferencial</option><option v-for="position in [...new Set(staffUsers.filter(u => u.role === 'teacher' && u.position).map(u => u.position))]" :key="position">{{ position }}</option></datalist><small>Escribe un cargo nuevo o selecciona uno existente.</small></label>
                <label v-if="!staffForm.id && staffUsesEmail" class="switch-field password-generator-field wide"><input v-model="staffForm.generatePassword" type="checkbox" /><span><i></i><strong>Generar contraseña segura automáticamente</strong><small>hlquery creará una clave temporal y la enviará al correo.</small></span></label>
                <label v-if="staffForm.id || !staffForm.generatePassword || !staffUsesEmail" class="field wide"><span>Contraseña temporal <small>{{ staffForm.id ? 'Déjala vacía para conservar la actual' : 'Mínimo 6 caracteres' }}</small></span><input v-model="staffForm.password" :required="!staffForm.id && (!staffForm.generatePassword || !staffUsesEmail)" minlength="6" maxlength="128" type="password" autocomplete="new-password" placeholder="••••••••" /><small v-if="!staffForm.id && !staffUsesEmail" class="field-help">Entrégala directamente al usuario; no hay un correo donde enviarla.</small></label>
                <FormSection class="permissions-field wide"><legend>Permisos especiales</legend><p>{{ staffForm.role === 'monitor' ? 'Este rol ve todos los módulos para monitoreo, sin permisos de escritura.' : staffForm.role === 'agente_finanzas' ? 'Este rol tiene acceso exclusivo a Finanzas y RRHH.' : staffForm.role === 'director' ? 'Este cargo conserva acceso completo al panel.' : staffForm.role === 'utp' ? 'Jefe de UTP: acceso académico completo, sin configuración institucional del colegio.' : 'Activa solo las funciones necesarias para este usuario.' }}</p><div class="permissions-grid"><label><input v-model="staffForm.permissions.manageGrades" type="checkbox" :disabled="['director','utp','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Administrar notas</span></label><label><input v-model="staffForm.permissions.viewReports" type="checkbox" :disabled="['director','utp','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Ver reportes</span></label><label><input v-model="staffForm.permissions.manageUsers" type="checkbox" :disabled="['director','agente_finanzas','monitor'].includes(staffForm.role) || staffForm.id === authUser.id" /><span><Check :size="13" />Administrar usuarios</span></label><label><input v-model="staffForm.permissions.manageSchool" type="checkbox" :disabled="['director','utp','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Configurar colegio</span></label><label><input v-model="staffForm.permissions.manageHr" type="checkbox" :disabled="['director','agente_finanzas','monitor','teacher','guardian','student'].includes(staffForm.role)" /><span><Check :size="13" />RRHH</span></label><label><input v-model="staffForm.permissions.manageFinance" type="checkbox" :disabled="['director','agente_finanzas','monitor','teacher','guardian','student'].includes(staffForm.role)" /><span><Check :size="13" />Finanzas</span></label><label><input v-model="staffForm.permissions.approveLeave" type="checkbox" :disabled="['director','utp','agente_finanzas','monitor','guardian','student'].includes(staffForm.role)" /><span><Check :size="13" />Aprobar solicitudes</span></label></div></FormSection>
                <FormSection class="permissions-field wide"><legend>Permisos MINEDUC / SIGE</legend><p>La configuración y la sincronización se asignan por separado. Profesores y apoderados no reciben estos permisos.</p><div class="permissions-grid"><label><input v-model="staffForm.permissions['sige.view']" type="checkbox" :disabled="['director','utp','teacher','guardian','student','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Ver integración</span></label><label><input v-model="staffForm.permissions['sige.configure']" type="checkbox" :disabled="['director','utp','teacher','guardian','student','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Configurar SIGE</span></label><label><input v-model="staffForm.permissions['sige.sync']" type="checkbox" :disabled="['director','utp','teacher','guardian','student','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Sincronizar</span></label><label><input v-model="staffForm.permissions['sige.view_logs']" type="checkbox" :disabled="['director','utp','teacher','guardian','student','agente_finanzas','monitor'].includes(staffForm.role)" /><span><Check :size="13" />Ver logs</span></label></div></FormSection>
                <div v-if="staffForm.id && !['guardian', 'student'].includes(staffForm.role)" class="staff-access-panel wide">
                  <div class="staff-access-status">
                    <span>Equipo<strong>{{ staffForm.teamActive ? 'Activo' : 'Dado de baja' }}</strong></span>
                    <span>Acceso plataforma<strong>{{ staffForm.platformAccess ? 'Activo' : 'Revocado' }}</strong></span>
                  </div>
                  <div class="student-profile-access-actions">
                    <button
                      v-if="staffForm.teamActive && staffForm.id !== authUser.id"
                      type="button"
                      class="secondary-button danger-button"
                      :disabled="staffSaving"
                      @click="deactivateStaffAccount"
                    ><Trash2 :size="16" />Dar de baja</button>
                    <button
                      v-else-if="!staffForm.teamActive"
                      type="button"
                      class="primary-button"
                      :disabled="staffSaving"
                      @click="restoreStaffAccount"
                    ><Check :size="16" />Reactivar cuenta</button>
                    <button
                      v-if="!staffForm.platformAccess"
                      type="button"
                      class="secondary-button"
                      :disabled="staffSaving"
                      @click="setStaffAccountPlatformAccess(true)"
                    >Restaurar acceso a la plataforma</button>
                    <button
                      v-else-if="!staffForm.teamActive && staffForm.id !== authUser.id"
                      type="button"
                      class="secondary-button danger-button"
                      :disabled="staffSaving"
                      @click="setStaffAccountPlatformAccess(false)"
                    >Revocar acceso a la plataforma</button>
                  </div>
                  <small class="field-help">Al dar de baja puedes elegir revocar el acceso. Por defecto se conserva para poder revertirlo desde esta ficha.</small>
                </div>
              </div>
              <div class="staff-form-actions"><button type="button" class="secondary-button" @click="closeStaffForm">Cancelar</button><button class="primary-button" :disabled="staffSaving"><span v-if="staffSaving" class="spinner"></span><Check v-else :size="18" />{{ staffSaving ? 'Guardando...' : 'Guardar cuenta' }}</button></div>
            </form>
          </div>
          <div v-else class="panel-with-pager admin-equipo-page">
            <div class="admin-intro-grid">
              <article class="panel admin-intro-card">
                <div class="admin-header admin-header-plain">
                  <div>
                    <span class="admin-icon"><Users /></span>
                    <div>
                      <p class="admin-eyebrow">Accesos del colegio</p>
                      <h2>Equipo</h2>
                      <p>Quién entra al panel, con qué cargo y si la cuenta está activa.</p>
                    </div>
                  </div>
                  <button class="primary-button" @click="openStaffForm()"><UserPlus :size="17" />Nuevo usuario</button>
                </div>
              </article>
              <article class="panel admin-intro-card admin-intro-card-perms">
                <div class="admin-header admin-header-plain">
                  <div>
                    <span class="admin-icon"><Lock /></span>
                    <div>
                      <p class="admin-eyebrow">Control de acceso</p>
                      <h2>Permisos</h2>
                      <p>El cargo define el rol base. Los permisos especiales amplían o limitan lo que cada persona puede hacer en el panel.</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <article class="panel admin-panel admin-list-panel">
              <div class="admin-list-heading">
                <div>
                  <h3>Cuentas del equipo</h3>
                  <p>Filtra por estado, cargo o permiso y abre una ficha para editarla.</p>
                </div>
                <strong class="staff-filters-count">{{ filteredStaffUsers.length }} {{ filteredStaffUsers.length === 1 ? 'cuenta' : 'cuentas' }}</strong>
              </div>
              <div v-if="staffLoading" class="staff-loading"><span class="spinner purple-spinner"></span>Cargando equipo...</div>
              <div class="staff-filters" role="search" aria-label="Filtrar equipo">
                <div class="staff-filters-main">
                  <label>
                    <span class="staff-filter-label"><Radio :size="13" aria-hidden="true" />Estado</span>
                    <select v-model="staffStatusFilter">
                      <option value="active">Activas</option>
                      <option value="all">Todas</option>
                    </select>
                  </label>
                  <label>
                    <span class="staff-filter-label"><GraduationCap :size="13" aria-hidden="true" />Cargo</span>
                    <select v-model="staffRoleFilter">
                      <option value="all">Todos</option>
                      <option value="director">Directores</option>
                      <option value="manager">Equipo directivo</option>
                      <option value="monitor">Monitores</option>
                      <option value="utp">Jefes de UTP</option>
                      <option value="agente_finanzas">Agentes de finanzas</option>
                      <option value="teacher">Profesores</option>
                      <option value="guardian">Apoderados</option>
                      <option value="student">Estudiantes</option>
                    </select>
                  </label>
                  <label>
                    <span class="staff-filter-label"><Lock :size="13" aria-hidden="true" />Permiso</span>
                    <select v-model="staffFlagFilter">
                      <option value="all">Todos</option>
                      <option value="manageUsers">Usuarios</option>
                      <option value="manageGrades">Notas</option>
                      <option value="viewReports">Reportes</option>
                      <option value="manageSchool">Colegio</option>
                      <option value="manageHr">RRHH</option>
                      <option value="approveLeave">Aprobar solicitudes</option>
                      <option value="manageFinance">Finanzas</option>
                    </select>
                  </label>
                </div>
              </div>
              <div v-if="!staffLoading" class="table-scroll admin-table"><DataTable><thead><tr><th><button type="button" class="table-sort-button" :class="{ active: staffListSort.key === 'fullName' }" :aria-sort="staffSortAria('fullName')" @click="toggleStaffListSort('fullName')">Nombre<span class="table-sort-icons" aria-hidden="true"><ChevronUp :size="12" :class="{ on: staffListSort.key === 'fullName' && staffListSort.dir === 'asc' }" /><ChevronDown :size="12" :class="{ on: staffListSort.key === 'fullName' && staffListSort.dir === 'desc' }" /></span></button></th><th><button type="button" class="table-sort-button" :class="{ active: staffListSort.key === 'username' }" :aria-sort="staffSortAria('username')" @click="toggleStaffListSort('username')">Usuario o correo<span class="table-sort-icons" aria-hidden="true"><ChevronUp :size="12" :class="{ on: staffListSort.key === 'username' && staffListSort.dir === 'asc' }" /><ChevronDown :size="12" :class="{ on: staffListSort.key === 'username' && staffListSort.dir === 'desc' }" /></span></button></th><th><button type="button" class="table-sort-button" :class="{ active: staffListSort.key === 'role' }" :aria-sort="staffSortAria('role')" @click="toggleStaffListSort('role')">Cargo<span class="table-sort-icons" aria-hidden="true"><ChevronUp :size="12" :class="{ on: staffListSort.key === 'role' && staffListSort.dir === 'asc' }" /><ChevronDown :size="12" :class="{ on: staffListSort.key === 'role' && staffListSort.dir === 'desc' }" /></span></button></th><th><button type="button" class="table-sort-button" :class="{ active: staffListSort.key === 'permissions' }" :aria-sort="staffSortAria('permissions')" @click="toggleStaffListSort('permissions')">Permisos especiales<span class="table-sort-icons" aria-hidden="true"><ChevronUp :size="12" :class="{ on: staffListSort.key === 'permissions' && staffListSort.dir === 'asc' }" /><ChevronDown :size="12" :class="{ on: staffListSort.key === 'permissions' && staffListSort.dir === 'desc' }" /></span></button></th><th><button type="button" class="table-sort-button" :class="{ active: staffListSort.key === 'status' }" :aria-sort="staffSortAria('status')" @click="toggleStaffListSort('status')">Estado<span class="table-sort-icons" aria-hidden="true"><ChevronUp :size="12" :class="{ on: staffListSort.key === 'status' && staffListSort.dir === 'asc' }" /><ChevronDown :size="12" :class="{ on: staffListSort.key === 'status' && staffListSort.dir === 'desc' }" /></span></button></th><th></th></tr></thead><tbody><tr v-for="staff in pagedStaffUsers" :key="staff.id" class="admin-user-row" tabindex="0" @click="openStaffForm(staff)" @keydown.enter.prevent="openStaffForm(staff)" @keydown.space.prevent="openStaffForm(staff)"><td><div class="student-cell student-cell-text"><div><strong>{{ staff.fullName }}</strong><small v-if="staff.id === authUser.id">Tu cuenta</small><small v-else class="admin-row-hint">Clic para editar</small></div></div></td><td><code class="username-code">{{ staff.username }}</code></td><td><span class="role-pill" :class="staff.role"><ShieldCheck v-if="['director','manager','monitor'].includes(staff.role)" :size="13" /><GraduationCap v-else :size="13" />{{ roleLabels[staff.role] || staff.role }}</span><small v-if="staff.role === 'teacher' && staff.position" class="staff-position">{{ staff.position }}</small></td><td @click.stop><template v-for="labels in [staffPermissionLabels(staff)]" :key="`perms-${staff.id}`"><details v-if="labels.length" class="staff-perm-menu" @toggle="onStaffPermToggle"><summary class="staff-perm-trigger"><span>{{ labels.length }} {{ labels.length === 1 ? 'permiso' : 'permisos' }}</span><ChevronDown :size="14" /></summary><div class="staff-perm-panel flag-list"><span v-for="label in labels" :key="label">{{ label }}</span></div></details><small v-else class="staff-perm-empty">Sin permisos adicionales</small></template></td><td><span class="status-pill" :class="{ inactive: staff.teamActive === false || staff.active === false }"><i></i>{{ staff.teamActive === false || staff.active === false ? 'Inactivo' : 'Activo' }}</span><small v-if="staff.platformAccess === false" class="table-subline">Sin acceso</small></td><td><button v-if="canManageDocuments" class="edit-button" @click.stop="showLinkedDocuments('userId', staff.id, staff.fullName)">Ver documentos</button><button class="edit-button admin-row-edit" @click.stop="openStaffForm(staff)"><Pencil :size="15" />Modificar ficha</button></td></tr></tbody></DataTable></div>
              <div v-if="salaries.length" class="table-scroll"><DataTable><thead><tr><th>Empleado</th><th>Cargo</th><th>Sueldo mensual</th><th></th></tr></thead><tbody><tr v-for="employee in pagedSalaries" :key="employee.id"><td>{{ employee.User?.fullName || employee.fullName || 'Sin cuenta vinculada' }}</td><td>{{ employee.position }}</td><td><input v-model.number="employee.monthlySalary" class="salary-input" type="number" min="0" /></td><td><button class="edit-button" @click="saveSalary(employee)">Guardar</button></td></tr></tbody></DataTable></div>
            </article>
            <TablePagination
              v-model:page="staffPage"
              :page-count="staffPageCount"
              :range-label="staffRangeLabel"
              :show="showStaffPagination"
            />
            <TablePagination
              v-model:page="salariesPage"
              :page-count="salariesPageCount"
              :range-label="salariesRangeLabel"
              :show="showSalariesPagination"
            />
          </div>
        </template>
      </section>
    </main>

    <Modal @close="accountabilityModalOpen = false" label="Detalle y edición" v-if="accountabilityModalOpen" class="modal-wrap" @mousedown.self="accountabilityModalOpen = false">
      <form class="modal accountability-modal" @submit.prevent="saveAccountabilityEntry">
        <div class="modal-heading"><div class="modal-title-icon"><TrendingUp /></div><div><h2>Agregar movimiento</h2><p>Registra el ingreso o uso de recursos con su respaldo.</p></div><button type="button" class="icon-button" @click="accountabilityModalOpen = false"><X /></button></div>
        <div v-if="accountabilityError" class="login-error account-error">{{ accountabilityError }}</div>
        <div class="form-grid">
          <label class="field"><span>Período</span><input v-model="accountabilityForm.period" required type="month" min="2000-01" max="2100-12" /></label>
          <label class="field"><span>Movimiento</span><select v-model="accountabilityForm.movementType" required><option value="income">Ingreso</option><option value="expense">Egreso</option></select></label>
          <label class="field"><span>Origen del recurso</span><select v-model="accountabilityForm.fundingSource" required><option v-for="source in fundingSources" :key="source">{{ source }}</option></select></label>
          <label class="field"><span>Categoría</span><select v-model="accountabilityForm.category" required><option v-for="category in accountabilityForm.movementType === 'income' ? incomeCategories : expenseCategories" :key="category">{{ category }}</option></select></label>
          <label class="field"><span>Tipo de documento</span><select v-model="accountabilityForm.documentType" required><option>Liquidación</option><option>Factura</option><option>Boleta</option><option>Comprobante</option><option>Contrato</option><option>Otro</option></select></label>
          <label class="field"><span>Número de documento</span><input v-model.trim="accountabilityForm.documentNumber" required maxlength="80" placeholder="Ej. 001245" /></label>
          <label class="field"><span>Contraparte</span><input v-model.trim="accountabilityForm.counterparty" required maxlength="160" placeholder="Entidad o proveedor" /></label>
          <label class="field"><span>RUT contraparte <small>Opcional</small></span><input v-model.trim="accountabilityForm.counterpartyTaxId" maxlength="20" placeholder="12.345.678-9" /></label>
          <label class="field wide"><span>Descripción</span><textarea v-model.trim="accountabilityForm.description" required maxlength="500" rows="3" placeholder="Describe el ingreso o el uso educativo de los recursos..."></textarea></label>
          <label class="field"><span>Monto CLP</span><input v-model.number="accountabilityForm.amount" required type="number" min="1" step="1" placeholder="Ej. 1250000" /></label>
          <label class="field"><span>Estado</span><select v-model="accountabilityForm.status" required><option value="draft">Borrador</option><option value="verified">Revisado</option></select></label>
        </div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="accountabilityModalOpen = false">Cancelar</button><button class="primary-button" :disabled="accountabilitySaving"><span v-if="accountabilitySaving" class="spinner"></span><Check v-else :size="18" />{{ accountabilitySaving ? 'Guardando...' : 'Guardar movimiento' }}</button></div>
      </form>
    </Modal>
    <Modal v-if="guardianEditorOpen" class="modal-wrap" label="Apoderado" @close="guardianEditorOpen = false" @mousedown.self="guardianEditorOpen = false">
      <form class="modal-card guardian-editor-modal" @submit.prevent="saveGuardianEditor">
        <div class="modal-heading">
          <div class="modal-title-icon"><Users /></div>
          <div>
            <h2>{{ guardianEditorMode === 'change' ? 'Cambiar apoderado' : 'Asignar apoderado' }}</h2>
            <p>{{ guardianEditorMode === 'change' ? 'Reemplaza al apoderado actual por otra cuenta o una nueva.' : 'Vincula un familiar a este estudiante.' }}</p>
          </div>
          <button type="button" class="icon-button" @click="guardianEditorOpen = false"><X /></button>
        </div>
        <div class="form-grid guardian-editor-form">
          <label v-if="guardianEditorMode === 'change' && (studentProfile?.guardians?.length || 0) > 1" class="field wide">
            <span>Apoderado a reemplazar</span>
            <select v-model="guardianReplaceId" required>
              <option v-for="guardian in studentProfile.guardians" :key="guardian.id" :value="String(guardian.id)">{{ guardian.full_name }} · {{ guardian.email || 'sin correo' }}</option>
            </select>
          </label>
          <p v-else-if="guardianEditorMode === 'change' && studentProfile?.guardians?.length === 1" class="field-help wide">Se reemplazará a {{ studentProfile.guardians[0].full_name }}.</p>
          <div class="guardian-pick-tabs wide" role="tablist" aria-label="Tipo de apoderado">
            <button type="button" role="tab" :aria-selected="guardianPickMode === 'existing'" :class="{ active: guardianPickMode === 'existing' }" @click="guardianPickMode = 'existing'; guardianSelectedExisting = null">Usar existente</button>
            <button type="button" role="tab" :aria-selected="guardianPickMode === 'create'" :class="{ active: guardianPickMode === 'create' }" @click="guardianPickMode = 'create'; guardianSelectedExisting = null; guardianOptions = []">Crear nuevo</button>
          </div>
          <template v-if="guardianPickMode === 'existing'">
            <label class="field wide">
              <span>Buscar apoderado</span>
              <input v-model.trim="guardianForm.search" type="search" placeholder="Nombre o correo" autocomplete="off" @input="searchGuardians" />
            </label>
            <div v-if="guardianOptions.length" class="student-autocomplete wide">
              <button v-for="guardian in guardianOptions" :key="guardian.id" type="button" :class="{ selected: Number(guardianSelectedExisting?.id) === Number(guardian.id) }" @click="selectExistingGuardian(guardian)">
                <strong>{{ guardian.fullName || guardian.full_name }}</strong>
                <small>{{ guardian.email || 'sin correo' }}</small>
              </button>
            </div>
            <p v-else-if="guardianForm.search.trim().length >= 2" class="field-help wide">No encontramos apoderados con ese criterio.</p>
            <div v-if="guardianSelectedExisting" class="guardian-selected-chip wide">
              <span class="avatar">{{ initials(...String(guardianSelectedExisting.fullName || guardianSelectedExisting.full_name || '').trim().split(/\s+/)) }}</span>
              <div>
                <strong>{{ guardianSelectedExisting.fullName || guardianSelectedExisting.full_name }}</strong>
                <small>{{ guardianSelectedExisting.email || 'sin correo' }}</small>
              </div>
            </div>
          </template>
          <template v-else>
            <label class="field wide"><span>Nombre completo</span><input v-model.trim="guardianForm.fullName" required maxlength="120" placeholder="Nombre del apoderado" /></label>
            <label class="field"><span>RUT <small>Opcional</small></span><input v-model.trim="guardianForm.nationalId" maxlength="20" placeholder="12345678-9" /></label>
            <label class="field"><span>Correo</span><input v-model.trim="guardianForm.email" required type="email" maxlength="150" /></label>
            <label class="field wide"><span>Contraseña temporal</span><input v-model="guardianForm.password" required type="password" minlength="6" maxlength="128" /></label>
          </template>
          <label class="field"><span>Parentesco</span><select v-model="guardianForm.relationshipKind"><option v-for="option in GUARDIAN_RELATIONSHIP_OPTIONS" :key="option" :value="option">{{ option }}</option></select></label>
          <label v-if="guardianForm.relationshipKind === 'Otro'" class="field"><span>Especificar</span><input v-model.trim="guardianForm.relationshipOther" required maxlength="60" placeholder="Ej. Abuelo, Tutor…" /></label>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="guardianEditorOpen = false">Cancelar</button>
          <button class="primary-button" :disabled="guardianSaving">
            <span v-if="guardianSaving" class="spinner"></span>
            <Check v-else :size="18" />
            {{ guardianSaving ? 'Guardando…' : (guardianEditorMode === 'change' ? 'Cambiar apoderado' : 'Asignar apoderado') }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal @close="managementModal = ''" label="Detalle y edición" v-if="managementModal" class="modal-wrap" @mousedown.self="managementModal = ''">
      <form class="modal" :class="{ 'teacher-assign-modal': managementModal === 'courseAssignment' || managementModal === 'headTeacherAssignment' }" @submit.prevent="saveManagement">
        <div class="modal-heading"><div class="modal-title-icon"><Settings /></div><div><h2>{{ managementModal === 'citation' ? 'Citar a apoderado' : managementModal === 'incident' ? (studentRecordForm.id ? 'Editar caso de convivencia' : 'Nuevo caso de convivencia') : managementModal === 'observation' ? (studentRecordForm.id ? 'Editar anotación' : 'Nueva anotación') : { subject: 'Nueva asignatura', course: 'Nuevo curso', courseAssignment: 'Asignar profesores de asignatura', headTeacherAssignment: 'Asignar profesores jefes', material: 'Subir material', document: 'Subir documento', invoice: 'Nuevo documento de cobro', payment: 'Agregar pago / creditar' }[managementModal] }}</h2><p>{{ managementModal === 'citation' ? 'Agenda la reunión y se enviará un correo notificador al apoderado.' : managementModal === 'incident' && studentRecordForm.id ? 'Actualiza el detalle, gravedad o estado del caso.' : managementModal === 'observation' && studentRecordForm.id ? 'Modifica el tipo, el detalle o el archivo de la anotación.' : managementModal === 'payment' ? (paymentFormInvoices.length ? 'Acredita un abono sobre un documento de cobro pendiente.' : 'Registra un abono del apoderado aunque no haya cobros pendientes.') : managementModal === 'headTeacherAssignment' ? 'Puedes asignar uno o más profesores jefes; ven todas las notas del curso.' : 'Completa los datos para guardar el registro.' }}</p></div><button type="button" class="icon-button" @click="managementModal = ''"><X /></button></div>
        <div v-if="managementError" class="login-error account-error">{{ managementError }}</div>
        <div v-if="managementModal === 'citation'" class="form-grid">
          <label class="field wide student-autocomplete-field"><span>Buscar estudiante</span><input v-model.trim="citationStudentSearch" type="search" placeholder="Nombre o correo · mínimo 2 caracteres" autocomplete="off" />
            <div v-if="citationStudentOptions.length" class="student-autocomplete">
              <button v-for="student in citationStudentOptions" :key="student.id" type="button" :class="{ selected: Number(citationForm.studentId) === Number(student.id) }" @click="selectCitationStudent(student)">
                <strong>{{ student.first_name }} {{ student.last_name }}</strong>
                <small>{{ student.email || 'sin correo' }}</small>
              </button>
            </div>
            <small v-else-if="citationStudentSearch.trim().length >= 2" class="field-help">Sin coincidencias para esa búsqueda.</small>
            <small v-else class="field-help">Escribe al menos dos caracteres; los resultados aparecen aquí.</small>
          </label>
          <label class="field wide">
            <span>Apoderado a citar</span>
            <select v-model="citationForm.guardianId" required :disabled="!citationForm.studentId || citationGuardiansLoading">
              <option value="">{{ !citationForm.studentId ? 'Primero selecciona un estudiante' : citationGuardiansLoading ? 'Cargando apoderados…' : citationGuardianOptions.length ? 'Selecciona un apoderado' : 'Sin apoderados vinculados' }}</option>
              <option v-for="guardian in citationGuardianOptions" :key="guardian.id" :value="String(guardian.id)">{{ guardian.label }}</option>
            </select>
          </label>
          <label class="field"><span>Fecha</span><input v-model="citationForm.scheduledOn" required type="date" /></label>
          <label class="field"><span>Hora</span><input v-model="citationForm.scheduledTime" required type="time" /></label>
          <label class="field wide"><span>Lugar</span><input v-model.trim="citationForm.location" required maxlength="180" placeholder="Dirección del colegio" /></label>
          <label class="field wide"><span>Motivo</span><textarea v-model.trim="citationForm.reason" required minlength="5" maxlength="5000" placeholder="Indica el motivo de la citación"></textarea></label>
          <p class="field-help wide">Al guardar se envía un correo notificador al apoderado (si tiene correo y SMTP está configurado).</p>
        </div>
        <div v-if="['incident', 'observation'].includes(managementModal)" class="form-grid">
          <label class="field wide student-autocomplete-field"><span>Buscar estudiante</span><input v-model.trim="studentRecordSearch" type="search" placeholder="Nombre o correo · mínimo 2 caracteres" autocomplete="off" />
            <div v-if="studentRecordOptions.length" class="student-autocomplete">
              <button v-for="student in studentRecordOptions" :key="student.id" type="button" :class="{ selected: Number(studentRecordForm.studentId) === Number(student.id) }" @click="selectObservationStudent(student)">
                <strong>{{ student.first_name }} {{ student.last_name }}</strong>
                <small>{{ student.email || 'sin correo' }}</small>
              </button>
            </div>
            <small v-else-if="studentRecordSearch.trim().length >= 2" class="field-help">Sin coincidencias para esa búsqueda.</small>
            <small v-else class="field-help">Escribe al menos dos caracteres; los resultados aparecen aquí.</small>
            <small v-if="studentRecordForm.studentId" class="field-help">Seleccionado: {{ students.find(s => Number(s.id) === Number(studentRecordForm.studentId)) ? `${students.find(s => Number(s.id) === Number(studentRecordForm.studentId)).first_name} ${students.find(s => Number(s.id) === Number(studentRecordForm.studentId)).last_name}` : studentRecordForm.studentId }}</small>
          </label>
          <label v-if="managementModal === 'observation'" class="field wide">
            <span>Curso / asignatura</span>
            <select v-model="studentRecordForm.courseId" required :disabled="!studentRecordForm.studentId || observationCoursesLoading">
              <option value="">{{ !studentRecordForm.studentId ? 'Primero selecciona un estudiante' : observationCoursesLoading ? 'Cargando cursos…' : observationCourseOptions.length ? 'Selecciona dónde ocurrió' : 'Sin cursos matriculados' }}</option>
              <option v-for="course in observationCourseOptions" :key="course.id" :value="String(course.id)">{{ course.label }}</option>
            </select>
            <small class="field-help">Indica en qué curso o asignatura sucedió la situación.</small>
          </label>
          <label v-if="managementModal === 'observation'" class="field wide"><span>Tipo de anotación</span><div class="observation-kind-grid"><label v-for="kind in [{ value: 'negative', label: 'Negativa' }, { value: 'positive', label: 'Positiva' }, { value: 'general', label: 'General' }]" :key="kind.value" :class="['observation-kind', kind.value, { selected: studentRecordForm.kind === kind.value }]"><input v-model="studentRecordForm.kind" type="radio" :value="kind.value" name="observation-kind" />{{ kind.label }}</label></div></label>
          <template v-else><label class="field"><span>Fecha</span><input v-model="studentRecordForm.occurredOn" required type="date" /></label><label class="field"><span>Gravedad</span><select v-model="studentRecordForm.severity"><option value="low">Leve</option><option value="medium">Moderada</option><option value="high">Grave</option></select></label><label class="field"><span>Estado</span><select v-model="studentRecordForm.status"><option value="open">Abierto</option><option value="in_progress">En seguimiento</option><option value="closed">Cerrado</option></select></label></template>
          <label class="field wide"><span>Detalle</span><textarea v-model.trim="studentRecordForm.detail" required minlength="5" maxlength="5000"></textarea></label>
          <label v-if="managementModal === 'observation'" class="field wide document-file-picker" :class="{ filled: studentRecordForm.file || (studentRecordForm.attachmentName && !studentRecordForm.removeAttachment) }">
            <span><FileText :size="24" />{{ studentRecordForm.file ? studentRecordForm.file.name : (studentRecordForm.attachmentName && !studentRecordForm.removeAttachment ? studentRecordForm.attachmentName : 'Adjuntar documento (opcional)') }}</span>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" @change="studentRecordForm.file = $event.target.files[0] || null; if (studentRecordForm.file) studentRecordForm.removeAttachment = false" />
            <small class="field-help">{{ studentRecordForm.file ? `${Math.ceil(studentRecordForm.file.size / 1024)} KB · PDF, Office o imagen` : studentRecordForm.attachmentName && !studentRecordForm.removeAttachment ? 'Archivo actual · elige otro para reemplazarlo' : 'PDF, Office o imagen; máximo 25 MB. Visible en la ficha del estudiante.' }}</small>
          </label>
          <div v-if="managementModal === 'observation' && studentRecordForm.attachmentName && !studentRecordForm.removeAttachment && !studentRecordForm.file" class="field wide">
            <button type="button" class="edit-button danger-button" @click="studentRecordForm.removeAttachment = true; studentRecordForm.attachmentName = ''"><Trash2 :size="14" />Quitar adjunto</button>
          </div>
        </div>
        <div v-if="managementModal === 'subject'" class="form-grid">
          <label class="field wide"><span>Nombre de la asignatura</span><input v-model="subjectForm.name" required placeholder="Historia" @input="subjectForm.sigeSubjectCode = subjectForm.sigeSubjectCode || lookupSigeSubjectDefault(subjectForm.name)" /></label>
          <label class="field"><span>Código interno</span><input v-model="subjectForm.code" placeholder="HIS-1" /></label>
          <label class="field"><span>Código SIGE <span class="optional-tag">opcional</span></span><input v-model.trim="subjectForm.sigeSubjectCode" inputmode="numeric" placeholder="Ej. 21220" /></label>
        </div>
        <div v-if="managementModal === 'courseAssignment' || managementModal === 'headTeacherAssignment'" class="form-grid teacher-assign-form">
          <div class="selected-material-course wide">
            <span class="subject-icon"><GraduationCap :size="18" /></span>
            <div>
              <small>{{ courseAssignmentForm.mode === 'head' ? 'Curso seleccionado' : 'Asignatura seleccionada' }}</small>
              <strong>{{ courseAssignmentForm.courseName }}</strong>
            </div>
          </div>
          <fieldset class="field wide permissions-field teacher-picker-field">
            <legend>{{ courseAssignmentForm.mode === 'head' ? 'Profesores jefes' : 'Profesores de asignatura' }}</legend>
            <label class="teacher-picker-search">
              <span class="sr-only">Buscar profesor</span>
              <Search :size="15" aria-hidden="true" />
              <input v-model.trim="teacherAssignPickerQuery" type="search" placeholder="Buscar por nombre o correo…" />
            </label>
            <p class="teacher-picker-meta">
              {{ courseAssignmentForm.teachers.length }} seleccionado{{ courseAssignmentForm.teachers.length === 1 ? '' : 's' }}
              · {{ filteredAssignTeachers.length }} de {{ teacherUsers.length }}
            </p>
            <div v-if="pagedAssignTeachers.length" class="permissions-grid teacher-picker-grid">
              <label v-for="teacher in pagedAssignTeachers" :key="teacher.id">
                <input v-model="courseAssignmentForm.teachers" type="checkbox" :value="teacher.fullName" />
                <span>
                  <Check :size="13" />
                  {{ teacher.fullName }}
                  <small v-if="teacher.username" class="teacher-pick-user">{{ teacher.username }}</small>
                </span>
              </label>
            </div>
            <p v-else-if="teacherUsers.length">Ningún profesor coincide con la búsqueda.</p>
            <p v-else>No hay profesores activos para asignar.</p>
            <TablePagination
              v-model:page="assignTeacherPage"
              :page-count="assignTeacherPageCount"
              :range-label="assignTeacherRangeLabel"
              :show="showAssignTeacherPagination"
            />
            <small class="field-help">{{ courseAssignmentForm.mode === 'head' ? 'Puedes marcar varios. Ven todas las notas del curso; solo editan las de sus propios ramos.' : 'Puedes marcar varios. Ven y administran solo las notas de este ramo.' }}</small>
          </fieldset>
        </div>
        <div v-if="managementModal === 'material'" class="form-grid">
          <div class="selected-material-course wide"><span class="subject-icon" :style="{ color: uploadMaterialCourse?.color, background: `${uploadMaterialCourse?.color}18` }"><BookOpen :size="18" /></span><div><small>Contenido para</small><strong>{{ uploadMaterialCourse?.subject }}</strong><span>{{ uploadMaterialCourse?.name }} · {{ uploadMaterialCourse?.section }}</span></div></div>
          <label class="field wide"><span>Título del contenido</span><input v-model="materialForm.title" required placeholder="Ej. Guía de fracciones" /></label>
          <label class="field wide document-file-picker" :class="{ filled: materialForm.file }">
            <span><FileText :size="24" />{{ materialForm.file ? materialForm.file.name : 'Seleccionar archivo' }}</span>
            <input required type="file" accept=".ppt,.pptx,.pdf" @change="materialForm.file = $event.target.files[0]" />
            <small class="field-help">{{ materialForm.file ? `${Math.ceil(materialForm.file.size / 1024)} KB · PPT, PPTX o PDF` : 'PPT, PPTX o PDF · máximo 25 MB' }}</small>
          </label>
        </div>
        <div v-if="managementModal === 'invoice'" class="form-grid"><label class="field"><span>Número</span><input v-model.trim="invoiceForm.number" required maxlength="50" placeholder="Ej. COB-2026-001" /></label><label class="field"><span>Estudiante <small>Opcional</small></span><select v-model="invoiceForm.studentId" @change="invoiceForm.supplierId = ''"><option value="">Sin estudiante asociado</option><option v-for="student in students" :key="student.id" :value="student.id">{{ student.first_name }} {{ student.last_name }}</option></select></label><label class="field"><span>Proveedor <small>Opcional</small></span><select v-model="invoiceForm.supplierId" @change="invoiceForm.studentId = ''"><option value="">Sin proveedor asociado</option><option v-for="supplier in moduleData?.sections?.find(s => s.title === 'Proveedores')?.rows || []" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option></select></label><label class="field"><span>Monto CLP</span><input v-model.number="invoiceForm.amount" required type="number" min="1" step="1" /></label><label class="field"><span>Vencimiento</span><input v-model="invoiceForm.dueOn" required type="date" /></label><label class="field wide"><span>Estado del documento</span><select v-model="invoiceForm.status"><option value="pending">Pendiente (automático: pasa a vencido/pagado solo)</option><option value="cancelled">Anulado</option></select><small class="field-help">Pagado y vencido se calculan solos: al acreditar un pago o al pasar la fecha de vencimiento.</small></label><label class="field wide"><span>Archivo adjunto <small>Opcional</small></span><input type="file" accept=".pdf,.png,.jpg,.jpeg" @change="invoiceForm.file = $event.target.files[0] || null" /><small class="field-help">PDF o imagen JPG/PNG; máximo 25 MB.</small></label></div>
        <div v-if="managementModal === 'payment'" class="form-grid">
          <label class="field wide">
            <span>Estudiante</span>
            <select v-model="paymentForm.studentId" required :disabled="Boolean(paymentStudentId)" @change="onPaymentStudentChange">
              <option value="" disabled>Selecciona un estudiante</option>
              <option v-for="row in enrollmentRows" :key="row.id" :value="String(row.id)">{{ row.name }}</option>
            </select>
          </label>
          <label v-if="paymentFormInvoices.length" class="field wide">
            <span>Documento de cobro</span>
            <select v-model="paymentForm.invoiceId" required>
              <option value="" disabled>Selecciona un cobro</option>
              <option v-for="invoice in paymentFormInvoices" :key="invoice.id" :value="String(invoice.id)">
                {{ invoice.number }} · saldo {{ formatCurrency(invoice.remaining) }}
              </option>
            </select>
          </label>
          <p v-else-if="paymentForm.studentId" class="field-help wide">Sin cobros pendientes: se registrará como <strong>abono</strong> del apoderado.</p>
          <label class="field"><span>{{ paymentFormInvoices.length ? 'Monto a acreditar' : 'Monto del abono' }}</span><input v-model.number="paymentForm.amount" required type="number" min="1" step="1" /></label>
          <label class="field"><span>Fecha de pago</span><input v-model="paymentForm.paidAt" required type="date" /></label>
          <label class="field wide">
            <span>Medio de pago</span>
            <select v-model="paymentForm.method" required>
              <option value="transfer">Transferencia</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
          </label>
        </div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="managementModal = ''">Cancelar</button><button class="primary-button" :disabled="managementSaving || (managementModal === 'payment' && !paymentForm.studentId)"><span v-if="managementSaving" class="spinner"></span><Check v-else :size="18" />{{ managementModal === 'payment' ? (managementSaving ? 'Guardando…' : (paymentFormInvoices.length ? 'Acreditar pago' : 'Registrar abono')) : 'Guardar' }}</button></div>
      </form>
    </Modal>

    <Modal @close="fullImagePreview = null" label="Detalle y edición" v-if="fullImagePreview" class="modal-wrap image-preview-wrap" @mousedown.self="fullImagePreview = null">
      <section class="modal image-preview-modal" role="dialog" aria-modal="true" aria-label="Vista completa del avatar">
        <button type="button" class="icon-button image-preview-close" aria-label="Cerrar" @click="fullImagePreview = null"><X /></button>
        <img :src="fullImagePreview" alt="Avatar en tamaño completo" />
      </section>
    </Modal>
    <Modal v-if="generatedCredentials" class="modal-wrap">
      <section class="modal generated-password-modal" role="dialog" aria-modal="true" aria-labelledby="generated-password-title">
        <div class="modal-heading"><div class="modal-title-icon"><ShieldCheck /></div><div><h2 id="generated-password-title">Cuenta creada correctamente</h2><p>Guarda estas credenciales antes de cerrar.</p></div><button type="button" class="icon-button" aria-label="Cerrar" @click="generatedCredentials = null"><X /></button></div>
        <div class="generated-password-notice"><strong>Contraseña temporal generada</strong><span>Esta clave se muestra una sola vez. Entrégasela al {{ generatedCredentials.recipient }} por un medio seguro.</span></div>
        <dl class="generated-credentials">
          <div><dt>Usuario</dt><dd>{{ generatedCredentials.username }}</dd></div>
          <div><dt>Contraseña temporal</dt><dd><code>{{ generatedCredentials.password }}</code><button type="button" class="edit-button" @click="copyGeneratedPassword"><Copy :size="15" />Copiar</button></dd></div>
        </dl>
        <p class="generated-email-status">{{ generatedCredentials.deliveryMessage }}</p>
        <div class="modal-actions"><button type="button" class="primary-button" @click="generatedCredentials = null"><Check :size="17" />Entendido</button></div>
      </section>
    </Modal>
    <ConfirmDialog
      v-if="confirmMessage"
      :message="confirmMessage"
      :checkbox-label="confirmCheckboxLabel"
      v-model:checkbox-checked="confirmCheckboxChecked"
      @answer="answerConfirmation"
    />
    <Modal v-if="educationStageImpactModal" class="modal-wrap" @close="closeEducationStageImpactModal">
      <section class="modal education-stage-impact-modal" role="dialog" aria-modal="true" aria-labelledby="education-stage-impact-title">
        <div class="modal-heading">
          <div class="modal-title-icon"><GraduationCap /></div>
          <div>
            <h2 id="education-stage-impact-title">¿Quitar {{ educationStageImpactModal.impact.removedStages.map((row) => row.name).join(', ') }}?</h2>
            <p>
              Se eliminarán
              <strong>{{ educationStageImpactModal.impact.gradeCount }}</strong>
              grado{{ educationStageImpactModal.impact.gradeCount === 1 ? '' : 's' }}
              ({{ educationStageImpactModal.impact.courseCount }} asignatura{{ educationStageImpactModal.impact.courseCount === 1 ? '' : 's' }})
              al guardar.
            </p>
          </div>
          <button type="button" class="icon-button" aria-label="Cerrar" @click="closeEducationStageImpactModal"><X /></button>
        </div>
        <div class="education-stage-impact-list">
          <article v-for="grade in educationStageImpactModal.impact.grades" :key="`${grade.stageId}-${grade.name}-${grade.section}`">
            <strong>{{ grade.name }} {{ grade.section }}</strong>
            <small>{{ grade.stageName }} · {{ grade.subjectCount }} asignatura{{ grade.subjectCount === 1 ? '' : 's' }}</small>
          </article>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeEducationStageImpactModal">Conservar nivel</button>
          <button type="button" class="primary-button" :disabled="managementSaving" @click="confirmEducationStageRemoval">
            <span v-if="managementSaving" class="spinner"></span>
            {{ managementSaving ? 'Eliminando…' : 'Sí, quitar nivel' }}
          </button>
        </div>
      </section>
    </Modal>
    <transition name="toast"><Toast v-if="toast" :class="toastType" role="status" aria-live="polite"><span class="toast-icon" aria-hidden="true"><X v-if="toastType === 'error'" :size="16" /><Check v-else :size="16" /></span><span class="toast-copy">{{ toast }}</span></Toast></transition>
  </AppShell>

  <div
    v-if="demoGuideOpenFromSession && authUser"
    class="login-demo-guide-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Instrucciones del modo demo"
    @mousedown.self="closeDemoGuide"
  >
    <div class="login-form login-demo-guide login-demo-guide-modal">
      <p class="login-eyebrow">Modo demo</p>
      <h2>Instrucciones</h2>
      <p class="login-subtitle">{{ demoGuide?.intro || platformDemoMessage }}</p>
      <p class="login-demo-password-hint">Clave de todas las cuentas: <strong>{{ demoGuide?.passwordHint || 'admin' }}</strong></p>
      <div class="login-demo-guide-scroll">
        <section v-for="group in demoGuideGroups" :key="group.name" class="login-demo-group">
          <h3>{{ group.name }}</h3>
          <article v-for="account in group.accounts" :key="account.username" class="login-demo-account">
            <div class="login-demo-account-copy">
              <strong>{{ account.title || account.roleLabel }}</strong>
              <span class="login-demo-account-role">{{ account.roleLabel }} · {{ account.fullName }}</span>
              <p>{{ account.description }}</p>
              <code>{{ account.username }}</code>
            </div>
            <button type="button" class="edit-button" @click="useDemoAccount(account)">Usar</button>
          </article>
        </section>
        <ul v-if="demoGuide?.notes?.length" class="login-demo-notes">
          <li v-for="note in demoGuide.notes" :key="note">{{ note }}</li>
        </ul>
      </div>
      <p class="login-help">
        <button type="button" class="login-text-link" @click="closeDemoGuide">Cerrar</button>
      </p>
    </div>
  </div>
</template>
