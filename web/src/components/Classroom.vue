<script setup>
import { computed, ref, reactive, watch } from 'vue';
import { ClipboardList, Download, ExternalLink, FileText, Bell, Link2, MessageSquare, Paperclip, Pencil, Pin, Plus, Reply, Send, Trash2, Upload, X, ArrowLeft } from '@lucide/vue';
import { useClientPagination } from '../composables/pagination.js';
import { DataTable, TablePagination } from './ui/index.js';

const props = defineProps({
  courseId: Number,
  initialForumId: { type: Number, default: null },
  request: Function,
  user: Object,
  initialSection: { type: String, default: 'tareas' },
  openSettings: { type: Boolean, default: false },
});
const emit = defineEmits(['change-section', 'create-communication', 'settings-opened', 'open-forum', 'notify']);

const data = ref({
  assignments: [],
  forums: [],
  materials: [],
  links: [],
  communications: [],
  canTeach: false,
  canCreateForum: false,
  canParticipate: false,
  settings: { allowStudentsCreateForum: false, allowStudentsReplyForum: true },
});
const error = ref('');
const accessDenied = ref(false);
const busy = ref(false);
const selectedAssignment = ref(null);
const selectedForum = ref(null);
const submissions = ref([]);
const posts = ref([]);
const total = ref(0);
const page = ref(1);
const message = ref('');
const activeSection = ref(normalizeSection(props.initialSection));
const taskQuery = ref('');
const taskFilter = ref('all');
const forumQuery = ref('');
const forumFilter = ref('all');
const materialQuery = ref('');
const linkQuery = ref('');
const selectedMaterial = ref(null);
const showCreateTask = ref(false);
const showCreateForum = ref(false);
const showUploadMaterial = ref(false);
const showLinkEditor = ref(false);
const showSettings = ref(false);
const settingsSaving = ref(false);
const settingsForm = reactive({
  allowStudentsCreateForum: false,
  allowStudentsReplyForum: true,
  forumGuidelines: '',
});
const task = reactive({ title: '', instructions: '', dueAt: '', notifyEmail: true });
const taskFile = ref(null);
const taskFileInput = ref(null);
const removeTaskAttachment = ref(false);
const editingTaskAttachmentName = ref('');
const forum = reactive({ title: '', description: '' });
const materialForm = reactive({ title: '', description: '', file: null });
const linkForm = reactive({ title: '', url: '', description: '' });
const editingTaskId = ref(null);
const editingMaterialId = ref(null);
const editingLinkId = ref(null);
const pendingDelete = ref(null);
const materialFileInput = ref(null);
const answer = ref('');
const file = ref(null);
const fileInput = ref(null);
const editingPostId = ref(null);
const editDraft = ref('');
const deletingPostId = ref(null);
const composerEl = ref(null);

function normalizeSection(section) {
  if (section === 'foros') return 'foros';
  if (section === 'archivos') return 'archivos';
  if (section === 'comunicados') return 'comunicados';
  if (section === 'enlaces') return 'enlaces';
  return 'tareas';
}

const base = () => `/courses/${props.courseId}/classroom`;

async function run(action) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  accessDenied.value = false;
  try { await action(); }
  catch (err) {
    error.value = err.message || 'No pudimos cargar el aula.';
    accessDenied.value = Number(err.status) === 403 || /no tienes acceso/i.test(error.value);
  }
  finally { busy.value = false; }
}

async function load() {
  data.value = await props.request(base());
  if (props.initialForumId && activeSection.value === 'foros') {
    const firstLoad = !selectedForum.value;
    selectedForum.value = data.value.forums.find(item => Number(item.id) === props.initialForumId) || null;
    if (!selectedForum.value) error.value = 'Este tema no existe o ya no está disponible.';
    else if (firstLoad) await loadPosts();
  }
  settingsForm.allowStudentsCreateForum = Boolean(data.value.settings?.allowStudentsCreateForum);
  settingsForm.allowStudentsReplyForum = data.value.settings?.allowStudentsReplyForum !== false;
  settingsForm.forumGuidelines = data.value.settings?.forumGuidelines || '';
  try {
    data.value.materials = await props.request(`/courses/${props.courseId}/materials`);
  } catch {
    data.value.materials = data.value.materials || [];
  }
  try {
    data.value.links = await props.request(`/courses/${props.courseId}/links`);
  } catch {
    data.value.links = data.value.links || [];
  }
  if (selectedMaterial.value?.id) {
    selectedMaterial.value = (data.value.materials || []).find((item) => Number(item.id) === Number(selectedMaterial.value.id)) || null;
  }
}

watch(() => props.courseId, () => {
  editingTaskId.value = null;
  editingMaterialId.value = null;
  editingLinkId.value = null;
  pendingDelete.value = null;
  selectedAssignment.value = null;
  selectedForum.value = null;
  selectedMaterial.value = null;
  submissions.value = [];
  posts.value = [];
  showCreateTask.value = false;
  showCreateForum.value = false;
  showUploadMaterial.value = false;
  showLinkEditor.value = false;
  editingPostId.value = null;
  deletingPostId.value = null;
  run(load);
}, { immediate: true });

watch(() => props.initialSection, (section) => {
  activeSection.value = normalizeSection(section);
  editingTaskId.value = null;
  editingMaterialId.value = null;
  pendingDelete.value = null;
  selectedAssignment.value = null;
  selectedForum.value = null;
  selectedMaterial.value = null;
  submissions.value = [];
  posts.value = [];
  showCreateTask.value = false;
  showCreateForum.value = false;
  showUploadMaterial.value = false;
  editingPostId.value = null;
  deletingPostId.value = null;
});

watch(() => [props.openSettings, props.initialSection, data.value.canTeach], ([open]) => {
  if (!open || !data.value.canTeach) return;
  emit('change-section', 'foros');
  emit('settings-opened');
});

watch(() => activeSection.value, (section) => {
  if (section === 'foros') emit('change-section', 'foros');
}, { immediate: true });

function goSection(section) {
  const normalized = normalizeSection(section);
  if (normalized === 'foros') {
    emit('change-section', 'foros');
    return;
  }
  activeSection.value = normalized;
  emit('change-section', normalized);
}

function openTaskEditor(item = null) {
  editingTaskId.value = item?.id || null;
  const due = item ? new Date(item.dueAt) : null;
  Object.assign(task, {
    title: item?.title || '',
    instructions: item?.instructions || '',
    dueAt: due ? new Date(due.getTime() - due.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
    notifyEmail: true,
  });
  taskFile.value = null;
  removeTaskAttachment.value = false;
  editingTaskAttachmentName.value = item?.originalName || '';
  if (taskFileInput.value) taskFileInput.value.value = '';
  showCreateTask.value = true;
}
async function createTask() {
  await run(async () => {
    const id = editingTaskId.value;
    const body = new FormData();
    body.append('title', task.title);
    body.append('instructions', task.instructions);
    body.append('dueAt', new Date(task.dueAt).toISOString());
    if (!id) body.append('notifyEmail', task.notifyEmail ? '1' : '0');
    if (taskFile.value) body.append('file', taskFile.value);
    if (id && removeTaskAttachment.value && !taskFile.value) body.append('removeAttachment', '1');
    const saved = await props.request(`${base()}/assignments${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body });
    const wantedEmail = !id && task.notifyEmail;
    Object.assign(task, { title: '', instructions: '', dueAt: '', notifyEmail: true });
    taskFile.value = null;
    removeTaskAttachment.value = false;
    editingTaskAttachmentName.value = '';
    if (taskFileInput.value) taskFileInput.value.value = '';
    showCreateTask.value = false;
    editingTaskId.value = null;
    await load();
    if (saved?.id) {
      selectedAssignment.value = data.value.assignments.find((item) => item.id === saved.id) || selectedAssignment.value;
    } else if (selectedAssignment.value?.id === id) {
      selectedAssignment.value = data.value.assignments.find((item) => item.id === id) || null;
    }
    if (!id && saved) {
      const parts = [`Tarea publicada · ${saved.notified || 0} notificación${(saved.notified || 0) === 1 ? '' : 'es'} in-app`];
      if (wantedEmail) {
        if (saved.emailSkipped) parts.push('correo no enviado (SMTP no configurado)');
        else parts.push(`${saved.emailed || 0} correo${(saved.emailed || 0) === 1 ? '' : 's'} en cola`);
      }
      emit('notify', parts.join(' · '));
    } else if (id) {
      emit('notify', 'Tarea actualizada');
    }
  });
}
function onTaskFileChange(event) {
  taskFile.value = event.target.files?.[0] || null;
  if (taskFile.value) removeTaskAttachment.value = false;
}
function clearTaskFile() {
  taskFile.value = null;
  if (taskFileInput.value) taskFileInput.value.value = '';
}
function clearExistingTaskAttachment() {
  removeTaskAttachment.value = true;
  editingTaskAttachmentName.value = '';
  clearTaskFile();
}
async function downloadAssignmentFile(item = selectedAssignment.value) {
  if (!item?.id || !(item.hasAttachment || item.originalName)) return;
  await run(async () => {
    const response = await props.request(`${base()}/assignments/${item.id}/download`, { raw: true });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = item.originalName || 'adjunto-tarea';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
function openMaterialEditor(item = null) {
  editingMaterialId.value = item?.id || null;
  Object.assign(materialForm, { title: item?.title || '', description: item?.description || '', file: null });
  if (materialFileInput.value) materialFileInput.value.value = '';
  showUploadMaterial.value = true;
}
function openMaterialDetail(item) {
  selectedMaterial.value = item;
  showUploadMaterial.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeMaterialDetail() {
  selectedMaterial.value = null;
}
async function deletePublication() {
  const target = pendingDelete.value;
  if (!target || !data.value.canTeach) return;
  await run(async () => {
    const url = target.kind === 'task'
      ? `${base()}/assignments/${target.id}`
      : target.kind === 'link'
        ? `/links/${target.id}`
        : `/materials/${target.id}`;
    await props.request(url, { method: 'DELETE' });
    if (target.kind === 'task') {
      if (selectedAssignment.value?.id === target.id) { selectedAssignment.value = null; submissions.value = []; }
      if (editingTaskId.value === target.id) { editingTaskId.value = null; showCreateTask.value = false; }
    } else if (target.kind === 'link') {
      if (editingLinkId.value === target.id) { editingLinkId.value = null; showLinkEditor.value = false; }
    } else {
      if (editingMaterialId.value === target.id) { editingMaterialId.value = null; showUploadMaterial.value = false; }
      if (selectedMaterial.value?.id === target.id) selectedMaterial.value = null;
    }
    pendingDelete.value = null;
    await load();
  });
}

function openLinkEditor(item = null) {
  editingLinkId.value = item?.id || null;
  linkForm.title = item?.title || '';
  linkForm.url = item?.url || '';
  linkForm.description = item?.description || '';
  showLinkEditor.value = true;
}

function closeLinkEditor() {
  showLinkEditor.value = false;
  editingLinkId.value = null;
  Object.assign(linkForm, { title: '', url: '', description: '' });
}

async function saveLink() {
  if (!linkForm.title.trim() || !linkForm.url.trim()) return;
  await run(async () => {
    const body = JSON.stringify({
      title: linkForm.title.trim(),
      url: linkForm.url.trim(),
      description: linkForm.description.trim(),
    });
    const editingId = editingLinkId.value;
    await props.request(editingId ? `/links/${editingId}` : `/courses/${props.courseId}/links`, {
      method: editingId ? 'PUT' : 'POST',
      body,
    });
    closeLinkEditor();
    await load();
  });
}

async function createForum() {
  await run(async () => {
    await props.request(`${base()}/forums`, { method: 'POST', body: JSON.stringify(forum) });
    Object.assign(forum, { title: '', description: '' });
    showCreateForum.value = false;
    await load();
  });
}

async function uploadMaterial() {
  if (!materialForm.title.trim() || (!editingMaterialId.value && !materialForm.file)) return;
  await run(async () => {
    const body = new FormData();
    body.append('title', materialForm.title);
    body.append('description', materialForm.description);
    if (materialForm.file) body.append('file', materialForm.file);
    const editingId = editingMaterialId.value;
    const result = await props.request(editingId ? `/materials/${editingId}` : `/courses/${props.courseId}/materials`, { method: editingId ? 'PUT' : 'POST', body });
    editingMaterialId.value = null;
    materialForm.description = '';
    materialForm.title = '';
    materialForm.file = null;
    if (materialFileInput.value) materialFileInput.value.value = '';
    showUploadMaterial.value = false;
    await load();
    const saved = result?.material || null;
    if (saved?.id) selectedMaterial.value = saved;
    else if (editingId && selectedMaterial.value?.id === editingId) {
      selectedMaterial.value = (data.value.materials || []).find((item) => Number(item.id) === Number(editingId)) || null;
    }
  });
}

const submissionPath = () => `${base()}/assignments/${selectedAssignment.value.id}/submissions`;
async function loadSubmissions() { submissions.value = await props.request(submissionPath()); }
async function selectTask(item) {
  await run(async () => {
    selectedAssignment.value = item;
    answer.value = '';
    file.value = null;
    if (fileInput.value) fileInput.value.value = '';
    await loadSubmissions();
  });
}
function onFileChange(event) { file.value = event.target.files?.[0] || null; }
function clearFile() {
  file.value = null;
  if (fileInput.value) fileInput.value.value = '';
}
function onMaterialFileChange(event) { materialForm.file = event.target.files?.[0] || null; }
function clearMaterialFile() {
  materialForm.file = null;
  if (materialFileInput.value) materialFileInput.value.value = '';
}

async function submit() {
  await run(async () => {
    const body = new FormData();
    body.append('text', answer.value);
    if (file.value) body.append('file', file.value);
    await props.request(submissionPath(), { method: 'POST', body });
    answer.value = '';
    clearFile();
    await loadSubmissions();
  });
}

async function feedback(item) {
  await run(async () => {
    await props.request(`${submissionPath()}/${item.id}`, { method: 'PUT', body: JSON.stringify({ feedback: item.feedback }) });
    await loadSubmissions();
  });
}

async function download(item) {
  await run(async () => {
    const response = await props.request(`${submissionPath()}/${item.id}/download`, { raw: true });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = item.originalName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

async function downloadMaterial(item) {
  await run(async () => {
    const response = await props.request(`/materials/${item.id}/download`, { raw: true });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = item.originalName || item.title || 'archivo';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

const forumPath = () => `${base()}/forums/${selectedForum.value.id}`;
async function loadPosts() {
  const result = await props.request(`${forumPath()}/posts?page=${page.value}`);
  posts.value = result.posts;
  total.value = result.total;
}
function selectForum(item) {
  emit('open-forum', item.id);
}

async function post() {
  await run(async () => {
    await props.request(`${forumPath()}/posts`, { method: 'POST', body: JSON.stringify({ text: message.value }) });
    message.value = '';
    await loadPosts();
    await load();
  });
}
async function toggleForum() {
  await run(async () => {
    selectedForum.value = await props.request(forumPath(), { method: 'PUT', body: JSON.stringify({ closed: !selectedForum.value.closed }) });
    await load();
  });
}
async function togglePinned() {
  await run(async () => {
    selectedForum.value = await props.request(forumPath(), { method: 'PUT', body: JSON.stringify({ pinned: !selectedForum.value.pinned }) });
    await load();
  });
}
function closeThread() {
  emit('open-forum', null);
  selectedForum.value = null;
  posts.value = [];
  total.value = 0;
  page.value = 1;
  message.value = '';
}
function quote(item) {
  message.value = `${message.value ? `${message.value}\n\n` : ''}@${item.authorName}: `;
  composerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function absoluteDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
}
async function saveSettings() {
  settingsSaving.value = true;
  error.value = '';
  try {
    data.value.settings = await props.request(`${base()}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settingsForm),
    });
    await load();
    showSettings.value = false;
  } catch (err) {
    error.value = err.message;
  } finally {
    settingsSaving.value = false;
  }
}
function startEdit(item) {
  editingPostId.value = item.id;
  editDraft.value = item.text;
  deletingPostId.value = null;
}
function cancelEdit() {
  editingPostId.value = null;
  editDraft.value = '';
}
async function saveEdit(item) {
  const value = editDraft.value.trim();
  if (!value || value === item.text) { cancelEdit(); return; }
  await run(async () => {
    await props.request(`${forumPath()}/posts/${item.id}`, { method: 'PUT', body: JSON.stringify({ text: value }) });
    cancelEdit();
    await loadPosts();
  });
}
async function removePost(item) {
  if (deletingPostId.value !== item.id) {
    deletingPostId.value = item.id;
    editingPostId.value = null;
    return;
  }
  await run(async () => {
    await props.request(`${forumPath()}/posts/${item.id}`, { method: 'DELETE' });
    deletingPostId.value = null;
    await loadPosts();
    await load();
  });
}
async function changePage(delta) {
  await run(async () => {
    page.value += delta;
    await loadPosts();
  });
}

const taskState = (item) => (item.submitted ? (item.hasFeedback ? 'Revisada' : 'Entregada') : new Date(item.dueAt) < new Date() ? 'Vencida' : 'Pendiente');
const taskStateClass = (item) => taskState(item).toLowerCase().replace('revisada', 'feedback');

const filteredTasks = computed(() => data.value.assignments.filter((item) => {
  const matches = !taskQuery.value || `${item.title} ${item.instructions}`.toLowerCase().includes(taskQuery.value.toLowerCase());
  if (!matches || taskFilter.value === 'all') return matches;
  if (taskFilter.value === 'pending') return !item.submitted && new Date(item.dueAt) >= new Date();
  if (taskFilter.value === 'submitted') return item.submitted;
  if (taskFilter.value === 'feedback') return item.hasFeedback;
  return new Date(item.dueAt) < new Date();
}));

const tasksSortBy = ref('dueAt');
const tasksSortDir = ref('ASC');
const sortedTasks = computed(() => {
  const rows = [...filteredTasks.value];
  const key = tasksSortBy.value || 'dueAt';
  const dir = tasksSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    if (key === 'dueAt' || key === 'createdAt' || key === 'updatedAt') {
      const diff = new Date(a[key] || a.dueAt || 0).getTime() - new Date(b[key] || b.dueAt || 0).getTime();
      if (diff) return diff * dir;
      return String(a.title || '').localeCompare(String(b.title || ''), 'es');
    }
    if (key === 'submissionCount') {
      const diff = (Number(a.submissionCount) || 0) - (Number(b.submissionCount) || 0);
      if (diff) return diff * dir;
      return String(a.title || '').localeCompare(String(b.title || ''), 'es');
    }
    if (key === 'status') {
      const cmp = taskState(a).localeCompare(taskState(b), 'es');
      if (cmp) return cmp * dir;
      return String(a.title || '').localeCompare(String(b.title || ''), 'es');
    }
    return String(a.title || '').localeCompare(String(b.title || ''), 'es') * dir;
  });
  return rows;
});

const {
  page: tasksPage,
  pageCount: tasksPageCount,
  paged: pagedTasks,
  rangeLabel: tasksRangeLabel,
  show: showTasksPagination,
} = useClientPagination(sortedTasks, {
  pageSize: 15,
  resetOn: [taskQuery, taskFilter, tasksSortBy, tasksSortDir],
});

const taskColumns = computed(() => ([
  { key: 'title', label: 'Tarea' },
  { key: 'dueAt', label: 'Entrega' },
  { key: 'status', label: data.value.canTeach ? 'Entregas' : 'Estado', sortable: true },
  { key: 'attachment', label: 'Archivo', sortable: false },
]));

function onTasksSort({ key, dir }) {
  tasksSortBy.value = key;
  tasksSortDir.value = dir;
}

function closeTaskDetail() {
  selectedAssignment.value = null;
  submissions.value = [];
  answer.value = '';
  clearFile();
  showCreateTask.value = false;
  editingTaskId.value = null;
}
const filteredForums = computed(() => data.value.forums.filter((item) => {
  const matches = !forumQuery.value || `${item.title} ${item.description}`.toLowerCase().includes(forumQuery.value.toLowerCase());
  return matches && (forumFilter.value === 'all' || (forumFilter.value === 'open' && !item.closed) || (forumFilter.value === 'closed' && item.closed) || (forumFilter.value === 'pinned' && item.pinned));
}));
const filteredMaterials = computed(() => {
  const q = materialQuery.value.trim().toLowerCase();
  const rows = data.value.materials || [];
  if (!q) return rows;
  return rows.filter((item) => `${item.title} ${item.originalName || ''}`.toLowerCase().includes(q));
});
const filteredLinks = computed(() => {
  const q = linkQuery.value.trim().toLowerCase();
  const rows = data.value.links || [];
  if (!q) return rows;
  return rows.filter((item) => `${item.title} ${item.url || ''} ${item.description || ''}`.toLowerCase().includes(q));
});
const {
  page: linksPage,
  pageCount: linksPageCount,
  paged: pagedLinks,
  rangeLabel: linksRangeLabel,
  show: showLinksPagination,
} = useClientPagination(filteredLinks, {
  pageSize: 15,
  resetOn: [linkQuery],
});
const openForumCount = computed(() => data.value.forums.filter((item) => !item.closed).length);
const messageCount = computed(() => data.value.forums.reduce((sum, item) => sum + Number(item.postCount || 0), 0));
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / 20)));
const accessDeniedDetail = computed(() => {
  const role = props.user?.role;
  if (role === 'teacher') return 'Solo puedes abrir el aula de las asignaturas que tienes a cargo o donde eres profesor jefe.';
  if (role === 'guardian') return 'Solo puedes ver el aula de los cursos de tus estudiantes asociados.';
  if (role === 'student') return 'Solo puedes ver el aula de los cursos en los que estás matriculado.';
  return 'No tienes permiso para ver este curso.';
});

function relativeDate(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const [amount, unit] = absolute < 60 ? [seconds, 'second'] : absolute < 3600 ? [Math.round(seconds / 60), 'minute'] : absolute < 86400 ? [Math.round(seconds / 3600), 'hour'] : [Math.round(seconds / 86400), 'day'];
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(amount, unit);
}
const roleLabel = (role) => (['teacher', 'director', 'manager', 'utp', 'school_admin', 'super_admin'].includes(role) ? 'Docente' : 'Estudiante');
const fileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
function fileKind(name = '') {
  const lower = String(name).toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (/\.(ppt|pptx)$/.test(lower)) return 'ppt';
  if (/\.(doc|docx)$/.test(lower)) return 'doc';
  if (/\.(xls|xlsx)$/.test(lower)) return 'xls';
  if (/\.(png|jpe?g|gif|webp)$/.test(lower)) return 'image';
  return 'file';
}
function fileKindLabel(name = '') {
  return { pdf: 'PDF', ppt: 'Presentación', doc: 'Documento', xls: 'Planilla', image: 'Imagen', file: 'Archivo' }[fileKind(name)] || 'Archivo';
}
const initials = (name = '') => name.split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
</script>

<template>
  <article class="panel classroom-panel">
    <div class="panel-header classroom-header">
      <div>
        <h2>{{
          activeSection === 'tareas' ? 'Tareas'
            : activeSection === 'foros' ? 'Foros'
              : activeSection === 'comunicados' ? 'Comunicados'
                : activeSection === 'enlaces' ? 'Enlaces'
                  : 'Archivos'
        }}</h2>
        <p>
          {{ activeSection === 'tareas'
            ? 'Publica actividades, revisa entregas y registra devoluciones.'
            : activeSection === 'foros'
              ? 'Conversaciones del curso: temas, respuestas y participación.'
              : activeSection === 'comunicados'
                ? 'Avisos del profesor para este curso.'
                : activeSection === 'enlaces'
                  ? 'Páginas y recursos externos con una breve descripción.'
                  : 'Material de apoyo: guías, presentaciones y lecturas del curso.' }}
        </p>
      </div>
    </div>

    <p v-if="error && !accessDenied" role="alert" class="login-error">{{ error }}</p>
    <div v-if="accessDenied" class="classroom-empty forum-empty-list" role="alert">
      <MessageSquare :size="26" />
      <strong>No tienes acceso a este curso</strong>
      <span>{{ accessDeniedDetail }}</span>
    </div>
    <div v-else-if="pendingDelete && data.canTeach" class="publication-confirm" role="alert">
      <strong>¿Eliminar «{{ pendingDelete.title }}»?</strong>
      <p>{{
        pendingDelete.kind === 'task'
          ? 'Se eliminarán la tarea y sus entregas. Esta acción no se puede deshacer.'
          : pendingDelete.kind === 'link'
            ? 'El enlace dejará de estar disponible para el curso.'
            : 'El material dejará de estar disponible para el curso.'
      }}</p>
      <div class="publication-actions"><button type="button" class="secondary-button" :disabled="busy" @click="pendingDelete = null">Cancelar</button><button type="button" class="primary-button" :disabled="busy" @click="deletePublication">Eliminar definitivamente</button></div>
    </div>

    <div v-if="!accessDenied && !initialForumId" class="classroom-overview">
      <template v-if="activeSection === 'tareas'">
        <div><strong>{{ data.assignments.length }}</strong><span>Tareas</span></div>
        <div><strong>{{ data.assignments.filter(item => item.submitted).length }}</strong><span>{{ data.canTeach ? 'Con entregas' : 'Entregadas' }}</span></div>
        <div><strong>{{ data.assignments.filter(item => new Date(item.dueAt) < new Date() && !item.submitted).length }}</strong><span>Vencidas</span></div>
        <div v-if="data.canTeach"><strong>{{ data.enrolled || 0 }}</strong><span>Estudiantes</span></div>
        <div v-else><strong>{{ data.assignments.filter(item => item.hasFeedback).length }}</strong><span>Con devolución</span></div>
      </template>
      <template v-else-if="activeSection === 'comunicados'">
        <div><strong>{{ (data.communications || []).length }}</strong><span>Comunicados</span></div>
        <div><strong>{{ data.enrolled || 0 }}</strong><span>Destinatarios</span></div>
      </template>
      <template v-else-if="activeSection === 'enlaces'">
        <div><strong>{{ (data.links || []).length }}</strong><span>Enlaces</span></div>
        <div><strong>{{ (data.links || []).filter(item => item.description).length }}</strong><span>Con descripción</span></div>
      </template>
      <template v-else>
        <div><strong>{{ (data.materials || []).length }}</strong><span>Archivos</span></div>
        <div><strong>{{ (data.materials || []).filter(item => fileKind(item.originalName) === 'pdf').length }}</strong><span>PDF</span></div>
        <div><strong>{{ (data.materials || []).filter(item => fileKind(item.originalName) === 'ppt').length }}</strong><span>Presentaciones</span></div>
        <div><strong>{{ fileSize((data.materials || []).reduce((sum, item) => sum + Number(item.size || 0), 0)) }}</strong><span>Peso total</span></div>
      </template>
    </div>

    <!-- TAREAS -->
    <section v-if="!accessDenied && activeSection === 'tareas'" class="classroom-workspace">
      <template v-if="selectedAssignment">
        <div class="task-detail">
          <div class="task-detail-bar">
            <button type="button" class="secondary-button" @click="closeTaskDetail">
              <ArrowLeft :size="15" />Tareas
            </button>
            <div class="publication-actions">
              <template v-if="data.canTeach">
                <button type="button" class="secondary-button" :disabled="busy" @click="openTaskEditor(selectedAssignment)">
                  <Pencil :size="15" />Editar
                </button>
                <button type="button" class="secondary-button danger-button" :disabled="busy" @click="pendingDelete = { kind: 'task', id: selectedAssignment.id, title: selectedAssignment.title }">
                  <Trash2 :size="15" />Eliminar
                </button>
              </template>
            </div>
          </div>

          <form v-if="showCreateTask && data.canTeach && editingTaskId === selectedAssignment.id" class="create-panel" @submit.prevent="createTask">
            <div class="create-panel-heading">
              <div><h4>Editar tarea</h4><p>Actualiza el contenido, la fecha o el archivo adjunto.</p></div>
              <button type="button" class="icon-button" aria-label="Cerrar" @click="showCreateTask = false"><X :size="16" /></button>
            </div>
            <div class="create-grid">
              <label class="field"><span>Título</span><input v-model="task.title" required maxlength="180" placeholder="Ej. Ensayo de comprensión lectora" /></label>
              <label class="field"><span>Fecha de entrega</span><input v-model="task.dueAt" type="datetime-local" required /></label>
              <label class="field wide"><span>Instrucciones</span><textarea v-model="task.instructions" required maxlength="10000" placeholder="Describe qué deben entregar los estudiantes…"></textarea></label>
              <div class="field wide">
                <span>Archivo de la tarea <small>Opcional</small></span>
                <label class="file-drop" :class="{ filled: taskFile || (editingTaskAttachmentName && !removeTaskAttachment) }">
                  <input ref="taskFileInput" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" @change="onTaskFileChange" />
                  <span class="file-drop-icon"><Paperclip :size="20" /></span>
                  <span v-if="taskFile" class="file-drop-copy"><strong>{{ taskFile.name }}</strong><small>{{ fileSize(taskFile.size) }} · se guardará al publicar</small></span>
                  <span v-else-if="editingTaskAttachmentName && !removeTaskAttachment" class="file-drop-copy"><strong>{{ editingTaskAttachmentName }}</strong><small>Archivo actual · elige otro para reemplazarlo</small></span>
                  <span v-else class="file-drop-copy"><strong>Adjuntar guía o material</strong><small>PDF, Office o imagen · máx. 25 MB</small></span>
                  <button v-if="taskFile" type="button" class="file-clear" aria-label="Quitar archivo nuevo" @click.prevent="clearTaskFile"><X :size="14" /></button>
                </label>
                <div v-if="editingTaskAttachmentName && !removeTaskAttachment && !taskFile" class="task-attachment-actions">
                  <button type="button" class="edit-button" @click="downloadAssignmentFile({ id: editingTaskId, originalName: editingTaskAttachmentName, hasAttachment: true })"><Download :size="14" />Descargar actual</button>
                  <button type="button" class="edit-button danger-button" @click="clearExistingTaskAttachment"><Trash2 :size="14" />Eliminar archivo</button>
                </div>
                <p v-if="removeTaskAttachment && !taskFile" class="field-help">El archivo actual se eliminará al guardar. Puedes adjuntar uno nuevo antes de publicar.</p>
              </div>
            </div>
            <div class="create-actions">
              <button type="button" class="secondary-button" @click="showCreateTask = false">Cancelar</button>
              <button class="primary-button" :disabled="busy">Guardar cambios</button>
            </div>
          </form>

          <article class="panel task-detail-card">
            <header class="task-detail-head">
              <span class="task-state" :class="taskStateClass(selectedAssignment)">
                {{ data.canTeach ? `${selectedAssignment.submissionCount}/${data.enrolled || 0} entregas` : taskState(selectedAssignment) }}
              </span>
              <div>
                <p class="task-detail-kicker">Tarea del curso</p>
                <h3>{{ selectedAssignment.title }}</h3>
                <small>
                  Entrega {{ new Date(selectedAssignment.dueAt).toLocaleString('es-CL') }}
                  · {{ relativeDate(selectedAssignment.dueAt) }}
                  <template v-if="selectedAssignment.hasAttachment || selectedAssignment.originalName"> · Con archivo</template>
                </small>
              </div>
            </header>
            <div class="task-detail-body">
              <h4>Instrucciones</h4>
              <p class="preserve-lines task-instructions">{{ selectedAssignment.instructions }}</p>
              <div v-if="selectedAssignment.hasAttachment || selectedAssignment.originalName" class="task-attachment-block">
                <strong>Archivo de la tarea</strong>
                <button type="button" class="file-chip" :disabled="busy" @click="downloadAssignmentFile(selectedAssignment)">
                  <Download :size="14" />
                  <span>{{ selectedAssignment.originalName || 'Descargar adjunto' }}</span>
                  <small v-if="selectedAssignment.size">{{ fileSize(selectedAssignment.size) }}</small>
                </button>
              </div>
            </div>
          </article>

          <form v-if="user.role === 'student'" class="submit-panel" @submit.prevent="submit">
            <h4>Tu entrega</h4>
            <label class="field"><span>Respuesta</span><textarea v-model="answer" maxlength="10000" placeholder="Escribe tu respuesta…"></textarea></label>
            <label class="file-drop" :class="{ filled: file }">
              <input ref="fileInput" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" @change="onFileChange" />
              <span class="file-drop-icon"><Paperclip :size="20" /></span>
              <span v-if="!file" class="file-drop-copy"><strong>Adjuntar archivo</strong><small>PDF, Office o imagen · máx. 25 MB</small></span>
              <span v-else class="file-drop-copy"><strong>{{ file.name }}</strong><small>{{ fileSize(file.size) }}</small></span>
              <button v-if="file" type="button" class="file-clear" @click.prevent="clearFile"><X :size="14" /></button>
            </label>
            <button class="primary-button" :disabled="busy || (!answer.trim() && !file)">Guardar entrega</button>
          </form>

          <section class="task-submissions-panel panel">
            <h4>{{ data.canTeach ? 'Entregas del curso' : 'Mis entregas' }}</h4>
            <p v-if="!submissions.length" class="classroom-empty inline">Sin entregas todavía.</p>
            <div v-for="item in submissions" :key="item.id" class="submission-card">
              <div class="submission-heading"><strong v-if="data.canTeach">{{ item.studentName }}</strong><span v-else>Tu entrega</span><small>{{ relativeDate(item.updatedAt || item.updated_at || item.createdAt || item.created_at) }}</small></div>
              <p class="preserve-lines">{{ item.text }}</p>
              <button v-if="item.originalName" type="button" class="file-chip" :disabled="busy" @click="download(item)"><Download :size="14" /><span>{{ item.originalName }}</span></button>
              <form v-if="data.canTeach" class="classroom-form" @submit.prevent="feedback(item)">
                <label class="field"><span>Devolución</span><textarea v-model="item.feedback" required maxlength="10000"></textarea></label>
                <button class="secondary-button" :disabled="busy">Guardar devolución</button>
              </form>
              <p v-else-if="item.feedback" class="preserve-lines feedback-note"><strong>Devolución:</strong> {{ item.feedback }}</p>
            </div>
          </section>
        </div>
      </template>

      <template v-else>
        <div class="classroom-toolstrip">
          <div><h3>Actividades</h3><span>{{ data.assignments.length }} tareas publicadas</span></div>
          <button v-if="data.canTeach" type="button" class="primary-button" @click="showCreateTask ? showCreateTask = false : openTaskEditor()">
            <Plus :size="16" />{{ showCreateTask ? 'Cerrar' : 'Crear tarea' }}
          </button>
        </div>
        <form v-if="showCreateTask && data.canTeach" class="create-panel" @submit.prevent="createTask">
          <div class="create-panel-heading">
            <div><h4>{{ editingTaskId ? 'Editar tarea' : 'Nueva tarea' }}</h4><p>Define el contenido, la fecha de entrega y un archivo opcional para los estudiantes.</p></div>
            <button type="button" class="icon-button" aria-label="Cerrar" @click="showCreateTask = false"><X :size="16" /></button>
          </div>
          <div class="create-grid">
            <label class="field"><span>Título</span><input v-model="task.title" required maxlength="180" placeholder="Ej. Ensayo de comprensión lectora" /></label>
            <label class="field"><span>Fecha de entrega</span><input v-model="task.dueAt" type="datetime-local" required /></label>
            <label class="field wide"><span>Instrucciones</span><textarea v-model="task.instructions" required maxlength="10000" placeholder="Describe qué deben entregar los estudiantes…"></textarea></label>
            <div class="field wide">
              <span>Archivo de la tarea <small>Opcional</small></span>
              <label class="file-drop" :class="{ filled: taskFile || (editingTaskAttachmentName && !removeTaskAttachment) }">
                <input ref="taskFileInput" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" @change="onTaskFileChange" />
                <span class="file-drop-icon"><Paperclip :size="20" /></span>
                <span v-if="taskFile" class="file-drop-copy"><strong>{{ taskFile.name }}</strong><small>{{ fileSize(taskFile.size) }} · se guardará al publicar</small></span>
                <span v-else-if="editingTaskAttachmentName && !removeTaskAttachment" class="file-drop-copy"><strong>{{ editingTaskAttachmentName }}</strong><small>Archivo actual · elige otro para reemplazarlo</small></span>
                <span v-else class="file-drop-copy"><strong>Adjuntar guía o material</strong><small>PDF, Office o imagen · máx. 25 MB</small></span>
                <button v-if="taskFile" type="button" class="file-clear" aria-label="Quitar archivo nuevo" @click.prevent="clearTaskFile"><X :size="14" /></button>
              </label>
              <div v-if="editingTaskAttachmentName && !removeTaskAttachment && !taskFile" class="task-attachment-actions">
                <button type="button" class="edit-button" @click="downloadAssignmentFile({ id: editingTaskId, originalName: editingTaskAttachmentName, hasAttachment: true })"><Download :size="14" />Descargar actual</button>
                <button type="button" class="edit-button danger-button" @click="clearExistingTaskAttachment"><Trash2 :size="14" />Eliminar archivo</button>
              </div>
              <p v-if="removeTaskAttachment && !taskFile" class="field-help">El archivo actual se eliminará al guardar. Puedes adjuntar uno nuevo antes de publicar.</p>
            </div>
            <label v-if="!editingTaskId" class="notify-email-option wide">
              <input v-model="task.notifyEmail" type="checkbox" />
              <span>
                <strong>Enviar email a los estudiantes</strong>
                <small>La campanita in-app se envía siempre. Marca esto para avisar también por correo a quienes tengan email registrado.</small>
              </span>
            </label>
          </div>
          <div class="create-actions">
            <button type="button" class="secondary-button" @click="showCreateTask = false">Cancelar</button>
            <button class="primary-button" :disabled="busy">{{ editingTaskId ? 'Guardar cambios' : 'Publicar tarea' }}</button>
          </div>
        </form>
        <div class="classroom-filters">
          <input v-model.trim="taskQuery" type="search" placeholder="Buscar tareas…">
          <select v-model="taskFilter">
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="submitted">Entregadas</option>
            <option value="feedback">Con devolución</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>
        <div v-if="pagedTasks.length" class="tasks-table-wrap">
          <DataTable
            class="tasks-table"
            caption="Tareas del curso"
            :rows="pagedTasks"
            :columns="taskColumns"
            sortable
            :sort-by="tasksSortBy"
            :sort-dir="tasksSortDir"
            row-clickable
            @sort="onTasksSort"
            @row-click="selectTask"
          >
            <template #cell-title="{ row }">
              <strong class="task-table-title">{{ row.title }}</strong>
              <small class="task-table-preview">{{ String(row.instructions || '').slice(0, 90) }}{{ String(row.instructions || '').length > 90 ? '…' : '' }}</small>
            </template>
            <template #cell-dueAt="{ row }">
              <strong>{{ new Date(row.dueAt).toLocaleDateString('es-CL') }}</strong>
              <small>{{ new Date(row.dueAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }} · {{ relativeDate(row.dueAt) }}</small>
            </template>
            <template #cell-status="{ row }">
              <span class="task-state" :class="taskStateClass(row)">
                {{ data.canTeach ? `${row.submissionCount || 0}/${data.enrolled || 0}` : taskState(row) }}
              </span>
            </template>
            <template #cell-attachment="{ row }">
              {{ row.hasAttachment || row.originalName ? 'Sí' : '—' }}
            </template>
          </DataTable>
          <TablePagination
            v-model:page="tasksPage"
            :page-count="tasksPageCount"
            :range-label="tasksRangeLabel"
            :show="showTasksPagination"
          />
        </div>
        <div v-else class="classroom-empty forum-empty-list">
          <ClipboardList :size="26" />
          <strong>{{ data.assignments.length ? 'Sin resultados' : 'Aún no hay tareas' }}</strong>
          <span>{{ data.assignments.length ? 'Prueba otro filtro o búsqueda.' : (data.canTeach ? 'Publica la primera actividad del curso.' : 'Cuando el docente publique una tarea aparecerá aquí.') }}</span>
          <button v-if="data.canTeach && !data.assignments.length" type="button" class="primary-button" @click="openTaskEditor()">
            <Plus :size="15" />Crear tarea
          </button>
        </div>
      </template>
    </section>

    <!-- FOROS: manejados por CourseForum en App.vue -->
    <section v-else-if="!accessDenied && activeSection === 'foros'" class="classroom-workspace">
      <div class="classroom-empty forum-empty-list">
        <MessageSquare :size="26" />
        <strong>Abriendo foros…</strong>
        <span>Los foros del curso se abren en la vista dedicada.</span>
        <button type="button" class="primary-button" @click="emit('change-section', 'foros')">Ir a foros</button>
      </div>
    </section>

    <!-- COMUNICADOS -->
    <section v-else-if="!accessDenied && activeSection === 'comunicados'" class="classroom-workspace">
      <div class="classroom-toolstrip">
        <div><h3>Comunicados del curso</h3><span>Avisos para los estudiantes de este curso</span></div>
        <button v-if="data.canTeach" type="button" class="primary-button" @click="emit('create-communication')">
          <Plus :size="16" />Nuevo comunicado
        </button>
      </div>
      <div v-if="(data.communications || []).length" class="course-comms-list">
        <article v-for="item in data.communications" :key="item.id" class="course-comm-card">
          <header>
            <strong>{{ item.subject }}</strong>
            <small>{{ absoluteDate(item.sentAt || item.createdAt) }} · {{ ({ notification: 'Notificación', email: 'Correo', whatsapp: 'WhatsApp' })[item.channel] || item.channel }}</small>
          </header>
          <p class="preserve-lines">{{ item.body }}</p>
        </article>
      </div>
      <div v-else class="classroom-empty forum-empty-list">
        <Bell :size="24" />
        <strong>Sin comunicados todavía</strong>
        <span>{{ data.canTeach ? 'Publica el primer aviso para este curso.' : 'Cuando el docente publique un aviso aparecerá aquí.' }}</span>
        <button v-if="data.canTeach" type="button" class="primary-button" @click="emit('create-communication')"><Plus :size="15" />Crear comunicado</button>
      </div>
    </section>

    <!-- ARCHIVOS -->
    <section v-else-if="!accessDenied && activeSection === 'archivos'" class="classroom-workspace">
      <template v-if="selectedMaterial">
        <div class="material-detail">
          <div class="material-detail-bar">
            <button type="button" class="secondary-button" @click="closeMaterialDetail">
              <ArrowLeft :size="15" />Archivos
            </button>
            <div class="publication-actions">
              <button type="button" class="primary-button" :disabled="busy" @click="downloadMaterial(selectedMaterial)">
                <Download :size="15" />Descargar
              </button>
              <template v-if="data.canTeach">
                <button type="button" class="secondary-button" :disabled="busy" @click="openMaterialEditor(selectedMaterial)">
                  <Pencil :size="15" />Editar
                </button>
                <button type="button" class="secondary-button danger-button" :disabled="busy" @click="pendingDelete = { kind: 'material', id: selectedMaterial.id, title: selectedMaterial.title }">
                  <Trash2 :size="15" />Eliminar
                </button>
              </template>
            </div>
          </div>

          <form v-if="showUploadMaterial && data.canTeach && editingMaterialId === selectedMaterial.id" class="create-panel" @submit.prevent="uploadMaterial">
            <div class="create-panel-heading">
              <div><h4>Editar material</h4><p>Actualiza el título, la explicación o el archivo.</p></div>
              <button type="button" class="icon-button" aria-label="Cerrar" @click="showUploadMaterial = false"><X :size="16" /></button>
            </div>
            <div class="create-grid">
              <label class="field wide"><span>Título</span><input v-model.trim="materialForm.title" required maxlength="180" placeholder="Ej. Guía de la unidad 1" /></label>
              <label class="field wide">
                <span>De qué trata</span>
                <textarea v-model.trim="materialForm.description" maxlength="10000" rows="5" placeholder="Explica a los estudiantes de qué trata este archivo y cómo usarlo…"></textarea>
              </label>
              <p class="field wide">Puedes reemplazar el archivo adjunto. Si no eliges uno nuevo, se conserva el actual.</p>
              <label class="file-drop wide" :class="{ filled: materialForm.file }">
                <input ref="materialFileInput" type="file" accept=".ppt,.pptx,.pdf" @change="onMaterialFileChange" />
                <span class="file-drop-icon"><Upload :size="20" /></span>
                <span v-if="!materialForm.file" class="file-drop-copy"><strong>Reemplazar archivo</strong><small>PDF, PPT o PPTX · máx. 25 MB</small></span>
                <span v-else class="file-drop-copy"><strong>{{ materialForm.file.name }}</strong><small>{{ fileSize(materialForm.file.size) }} · {{ fileKindLabel(materialForm.file.name) }}</small></span>
                <button v-if="materialForm.file" type="button" class="file-clear" @click.prevent="clearMaterialFile"><X :size="14" /></button>
              </label>
            </div>
            <div class="create-actions">
              <button type="button" class="secondary-button" @click="showUploadMaterial = false">Cancelar</button>
              <button class="primary-button" :disabled="busy || !materialForm.title">Guardar cambios</button>
            </div>
          </form>

          <article class="panel material-detail-card">
            <header class="material-detail-head">
              <span class="material-file-icon" :class="fileKind(selectedMaterial.originalName)"><FileText :size="22" /></span>
              <div>
                <p class="material-detail-kicker">Material del curso</p>
                <h3>{{ selectedMaterial.title }}</h3>
                <small>{{ selectedMaterial.originalName }} · {{ fileKindLabel(selectedMaterial.originalName) }} · {{ fileSize(selectedMaterial.size) }}</small>
              </div>
            </header>
            <div class="material-detail-body">
              <h4>De qué trata</h4>
              <p v-if="selectedMaterial.description" class="preserve-lines">{{ selectedMaterial.description }}</p>
              <div v-else class="material-detail-empty">
                <strong>{{ data.canTeach ? 'Todavía no explicaste este archivo' : 'Sin explicación todavía' }}</strong>
                <span>{{ data.canTeach ? 'Agrega una descripción para que el curso entienda de qué trata y cómo usarlo.' : 'Cuando el docente agregue una explicación aparecerá aquí.' }}</span>
                <button v-if="data.canTeach" type="button" class="primary-button" @click="openMaterialEditor(selectedMaterial)">
                  <Pencil :size="15" />Agregar explicación
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>

      <template v-else>
        <div class="classroom-toolstrip">
          <div><h3>Material del curso</h3><span>{{ (data.materials || []).length }} archivos disponibles</span></div>
          <button v-if="data.canTeach" type="button" class="primary-button" @click="showUploadMaterial ? showUploadMaterial = false : openMaterialEditor()">
            <Upload :size="16" />{{ showUploadMaterial ? 'Cerrar' : 'Subir archivo' }}
          </button>
        </div>
        <form v-if="showUploadMaterial && data.canTeach" class="create-panel" @submit.prevent="uploadMaterial">
          <div class="create-panel-heading">
            <div><h4>{{ editingMaterialId ? 'Editar material' : 'Subir material' }}</h4><p>Comparte el archivo y explica de qué trata.</p></div>
            <button type="button" class="icon-button" aria-label="Cerrar" @click="showUploadMaterial = false"><X :size="16" /></button>
          </div>
          <div class="create-grid">
            <label class="field wide"><span>Título</span><input v-model.trim="materialForm.title" required maxlength="180" placeholder="Ej. Guía de la unidad 1" /></label>
            <label class="field wide">
              <span>De qué trata</span>
              <textarea v-model.trim="materialForm.description" maxlength="10000" rows="4" placeholder="Explica a los estudiantes de qué trata este archivo y cómo usarlo…"></textarea>
            </label>
            <p v-if="editingMaterialId" class="field wide">Puedes reemplazar el archivo adjunto. Si no eliges uno nuevo, se conserva el actual.</p>
            <label class="file-drop wide" :class="{ filled: materialForm.file }">
              <input ref="materialFileInput" :required="!editingMaterialId" type="file" accept=".ppt,.pptx,.pdf" @change="onMaterialFileChange" />
              <span class="file-drop-icon"><Upload :size="20" /></span>
              <span v-if="!materialForm.file" class="file-drop-copy"><strong>Seleccionar archivo</strong><small>PDF, PPT o PPTX · máx. 25 MB</small></span>
              <span v-else class="file-drop-copy"><strong>{{ materialForm.file.name }}</strong><small>{{ fileSize(materialForm.file.size) }} · {{ fileKindLabel(materialForm.file.name) }}</small></span>
              <button v-if="materialForm.file" type="button" class="file-clear" @click.prevent="clearMaterialFile"><X :size="14" /></button>
            </label>
          </div>
          <div class="create-actions">
            <button type="button" class="secondary-button" @click="showUploadMaterial = false">Cancelar</button>
            <button class="primary-button" :disabled="busy || !materialForm.title || (!editingMaterialId && !materialForm.file)">{{ editingMaterialId ? 'Guardar cambios' : 'Subir material' }}</button>
          </div>
        </form>
        <div class="classroom-filters single"><input v-model.trim="materialQuery" type="search" placeholder="Buscar archivos…"></div>
        <div v-if="filteredMaterials.length" class="material-file-list">
          <article
            v-for="item in filteredMaterials"
            :key="item.id"
            class="material-file-row material-file-row-clickable"
            role="button"
            tabindex="0"
            @click="openMaterialDetail(item)"
            @keydown.enter.prevent="openMaterialDetail(item)"
            @keydown.space.prevent="openMaterialDetail(item)"
          >
            <span class="material-file-icon" :class="fileKind(item.originalName)"><FileText :size="20" /></span>
            <div class="material-file-meta">
              <strong>{{ item.title }}</strong>
              <p v-if="item.description" class="material-description-preview">{{ item.description }}</p>
              <small v-else class="material-no-desc">{{ data.canTeach ? 'Sin explicación · haz clic para agregar' : 'Sin explicación todavía' }}</small>
              <small>{{ item.originalName }} · {{ fileKindLabel(item.originalName) }} · {{ fileSize(item.size) }}</small>
            </div>
            <div class="publication-actions" @click.stop>
              <button type="button" class="secondary-button" :disabled="busy" @click="downloadMaterial(item)"><Download :size="15" />Descargar</button>
              <template v-if="data.canTeach">
                <button type="button" class="secondary-button" :disabled="busy" @click="openMaterialEditor(item)"><Pencil :size="15" />Editar</button>
                <button type="button" class="secondary-button danger-button" :disabled="busy" @click="pendingDelete = { kind: 'material', id: item.id, title: item.title }"><Trash2 :size="15" />Eliminar</button>
              </template>
            </div>
          </article>
        </div>
        <div v-else class="classroom-empty forum-empty-list materials-empty">
          <FileText :size="24" />
          <strong>{{ (data.materials || []).length ? 'Sin resultados' : 'Sin archivos todavía' }}</strong>
          <span>{{ (data.materials || []).length ? 'Prueba otra búsqueda.' : (data.canTeach ? 'Sube el primer material y explica de qué trata.' : 'Cuando el docente publique material aparecerá en esta lista.') }}</span>
          <button v-if="!(data.materials || []).length && data.canTeach" type="button" class="primary-button" @click="openMaterialEditor()"><Upload :size="15" />Subir primer archivo</button>
        </div>
      </template>
    </section>

    <!-- ENLACES -->
    <section v-else-if="!accessDenied && activeSection === 'enlaces'" class="classroom-workspace">
      <div class="classroom-toolstrip">
        <div>
          <h3>Enlaces del curso</h3>
          <span>{{ (data.links || []).length }} recurso{{ (data.links || []).length === 1 ? '' : 's' }} disponible{{ (data.links || []).length === 1 ? '' : 's' }}</span>
        </div>
        <button v-if="data.canTeach" type="button" class="primary-button" @click="showLinkEditor ? closeLinkEditor() : openLinkEditor()">
          <Plus :size="16" />{{ showLinkEditor ? 'Cerrar' : 'Agregar enlace' }}
        </button>
      </div>
      <form v-if="showLinkEditor && data.canTeach" class="create-panel" @submit.prevent="saveLink">
        <div class="create-panel-heading">
          <div>
            <h4>{{ editingLinkId ? 'Editar enlace' : 'Nuevo enlace' }}</h4>
            <p>Comparte una página útil y explica para qué sirve.</p>
          </div>
          <button type="button" class="icon-button" aria-label="Cerrar" @click="closeLinkEditor"><X :size="16" /></button>
        </div>
        <div class="create-grid">
          <label class="field wide">
            <span>Título</span>
            <input v-model.trim="linkForm.title" required maxlength="180" placeholder="Ej. Simulador de fracciones" />
          </label>
          <label class="field wide">
            <span>URL</span>
            <input v-model.trim="linkForm.url" type="text" inputmode="url" required maxlength="2000" placeholder="https://…" />
          </label>
          <label class="field wide">
            <span>Descripción</span>
            <textarea v-model.trim="linkForm.description" maxlength="5000" rows="4" placeholder="Explica qué encontrarán en esta página y cómo usarla…" />
          </label>
        </div>
        <div class="create-actions">
          <button type="button" class="secondary-button" @click="closeLinkEditor">Cancelar</button>
          <button class="primary-button" :disabled="busy || !linkForm.title || !linkForm.url">
            {{ editingLinkId ? 'Guardar cambios' : 'Publicar enlace' }}
          </button>
        </div>
      </form>
      <div class="classroom-filters single">
        <input v-model.trim="linkQuery" type="search" placeholder="Buscar enlaces…" />
      </div>
      <div v-if="pagedLinks.length" class="material-file-list course-links-list">
        <article v-for="item in pagedLinks" :key="item.id" class="material-file-row course-link-row">
          <span class="material-file-icon link"><Link2 :size="20" /></span>
          <div class="material-file-meta">
            <strong>{{ item.title }}</strong>
            <p v-if="item.description" class="material-description-preview preserve-lines">{{ item.description }}</p>
            <small class="course-link-url">{{ item.url }}</small>
          </div>
          <div class="publication-actions">
            <a class="secondary-button" :href="item.url" target="_blank" rel="noopener noreferrer">
              <ExternalLink :size="15" />Abrir
            </a>
            <template v-if="data.canTeach">
              <button type="button" class="secondary-button" :disabled="busy" @click="openLinkEditor(item)">
                <Pencil :size="15" />Editar
              </button>
              <button
                type="button"
                class="secondary-button danger-button"
                :disabled="busy"
                @click="pendingDelete = { kind: 'link', id: item.id, title: item.title }"
              >
                <Trash2 :size="15" />Eliminar
              </button>
            </template>
          </div>
        </article>
      </div>
      <div v-else class="classroom-empty forum-empty-list materials-empty">
        <Link2 :size="24" />
        <strong>{{ (data.links || []).length ? 'Sin resultados' : 'Sin enlaces todavía' }}</strong>
        <span>
          {{ (data.links || []).length
            ? 'Prueba otra búsqueda.'
            : (data.canTeach ? 'Agrega el primer enlace para el curso.' : 'Cuando el docente publique enlaces aparecerán aquí.') }}
        </span>
        <button v-if="!(data.links || []).length && data.canTeach" type="button" class="primary-button" @click="openLinkEditor()">
          <Plus :size="15" />Agregar primer enlace
        </button>
      </div>
      <TablePagination
        v-model:page="linksPage"
        :page-count="linksPageCount"
        :range-label="linksRangeLabel"
        :show="showLinksPagination"
      />
    </section>
  </article>
</template>

<style scoped>
.classroom-panel { padding: 24px; margin-top: 18px; }
.classroom-header { align-items: center; gap: 16px; }
.classroom-switch { padding: 4px; display: flex; gap: 4px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-canvas); }
.classroom-switch button { height: 36px; padding: 0 14px; border: 0; border-radius: 9px; display: inline-flex; align-items: center; gap: 7px; color: var(--color-subtle); background: transparent; font-size: 12px; font-weight: 700; cursor: pointer; }
.classroom-switch button.active { color: white; background: var(--color-primary); }
.classroom-workspace { margin-top: 22px; }
.classroom-overview { margin-top: 18px; display: grid; grid-template-columns: repeat(4, minmax(110px, 1fr)); gap: 10px; }
.classroom-overview div { padding: 14px 16px; border: 1px solid var(--color-border); border-radius: 14px; display: grid; gap: 4px; background: var(--color-surface); }
.classroom-overview strong { color: var(--color-text); font-size: 22px; line-height: 1; }
.classroom-overview span { color: var(--color-subtle); font-size: 11px; font-weight: 700; }
.classroom-toolstrip { min-height: 64px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 14px; display: flex; align-items: center; justify-content: space-between; gap: 14px; background: var(--color-canvas); }
.classroom-toolstrip h3 { margin: 0 0 4px; color: var(--color-text); font-size: 15px; }
.classroom-toolstrip span { color: var(--color-subtle); font-size: 12px; font-weight: 650; }
.create-panel { margin-top: 14px; padding: 20px; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-surface); }
.create-panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.create-panel-heading h4 { margin: 0 0 4px; font-size: 16px; }
.create-panel-heading p { margin: 0; color: var(--color-subtle); font-size: 12px; }
.create-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
.create-grid .wide { grid-column: 1 / -1; }
.create-grid textarea { min-height: 110px; resize: vertical; }
.create-actions { margin-top: 16px; display: flex; justify-content: flex-end; gap: 10px; }
.tasks-table-wrap { margin-top: 14px; display: grid; gap: 0; }
.tasks-table :deep(td) { vertical-align: top; }
.task-table-title { display: block; color: var(--color-text); font-size: 14px; }
.task-table-preview {
  display: block;
  margin-top: 4px;
  color: var(--color-subtle);
  font-size: 12px;
  line-height: 1.35;
  font-weight: 500;
}
.tasks-table :deep(td small) {
  display: block;
  margin-top: 3px;
  color: var(--color-subtle);
  font-size: 12px;
  font-weight: 500;
}
.task-detail { display: grid; gap: 14px; }
.task-detail-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.task-detail-card { padding: 0; overflow: hidden; }
.task-detail-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-canvas);
}
.task-detail-head > div { min-width: 0; display: grid; gap: 4px; }
.task-detail-kicker {
  margin: 0;
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.task-detail-head h3 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -.02em;
  line-height: 1.25;
}
.task-detail-head small { color: var(--color-subtle); font-size: 12px; }
.task-detail-body { padding: 18px 20px; display: grid; gap: 12px; }
.task-detail-body h4 { margin: 0; font-size: 14px; }
.task-submissions-panel { padding: 18px 20px; display: grid; gap: 12px; }
.task-submissions-panel h4 { margin: 0; }
.notify-email-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-canvas);
  cursor: pointer;
}
.notify-email-option input {
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  accent-color: var(--color-primary);
  flex: 0 0 18px;
}
.notify-email-option span { display: grid; gap: 2px; }
.notify-email-option strong { font-size: 13px; color: var(--color-text); }
.notify-email-option small { color: var(--color-subtle); font-size: 12px; line-height: 1.4; }
.classroom-layout { margin-top: 16px; display: grid; grid-template-columns: minmax(210px, 280px) minmax(0, 1fr); gap: 18px; align-items: start; }
.classroom-filters { margin-top: 12px; display: grid; grid-template-columns: minmax(180px, 1fr) 180px; gap: 9px; }
.classroom-filters.single { grid-template-columns: 1fr; }
.classroom-filters input, .classroom-filters select { min-height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 10px; background: white; font-size: 13px; }
.classroom-list { display: grid; gap: 9px; }
.classroom-form { display: grid; gap: 14px; margin: 16px 0; }
.classroom-item { display: grid; width: 100%; gap: 6px; text-align: left; padding: 14px; background: white; border: 1px solid var(--color-border); border-radius: 12px; color: var(--color-text); cursor: pointer; transition: .18s; }
.classroom-item:hover, .classroom-item.active { border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border)); background: var(--color-primary-soft); box-shadow: inset 3px 0 0 var(--color-primary); }
.classroom-item strong { color: var(--color-text); font-size: 13px; }
.classroom-item small { color: var(--color-subtle); font-size: 11px; }
.task-state { width: fit-content; padding: 5px 9px; border-radius: 999px; color: var(--color-primary); background: var(--color-primary-soft); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; }
.task-state.entregada, .task-state.feedback { color: var(--color-success); background: var(--color-success-soft); }
.task-state.vencida { color: var(--color-error); background: var(--color-error-soft); }
.task-detail-heading, .submission-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.task-detail-heading h4 { margin: 8px 0 0; font-size: 18px; }
.task-detail-heading time { color: var(--color-subtle); font-size: 12px; }
.task-instructions { padding: 16px; border-radius: 12px; background: var(--color-canvas); line-height: 1.65; font-size: 13px; }
.task-attachment-block { margin: 14px 0 4px; display: grid; gap: 8px; }
.task-attachment-block strong { font-size: 12px; color: var(--color-muted); }
.task-attachment-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.field .field-help { margin: 8px 0 0; color: var(--color-subtle); font-size: 12px; }
.submit-panel { margin: 18px 0; padding: 18px; border: 1px solid var(--color-border); border-radius: 14px; display: grid; gap: 14px; background: var(--color-surface); }
.submit-panel h4 { margin: 0; }
.file-drop { position: relative; min-height: 84px; padding: 14px 16px; border: 1.5px dashed color-mix(in srgb, var(--color-primary) 28%, var(--color-border)); border-radius: 14px; display: flex; align-items: center; gap: 12px; background: var(--color-canvas); cursor: pointer; transition: .18s; }
.file-drop:hover, .file-drop.filled { border-color: var(--color-primary); border-style: solid; background: var(--color-primary-soft); }
.file-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.file-drop-icon { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; color: var(--color-primary); background: white; flex: 0 0 auto; }
.file-drop-copy { display: grid; gap: 2px; min-width: 0; }
.file-drop-copy strong { color: var(--color-text); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-drop-copy small { color: var(--color-subtle); font-size: 11px; }
.file-clear { position: relative; z-index: 1; margin-left: auto; width: 28px; height: 28px; border: 0; border-radius: 8px; display: grid; place-items: center; color: var(--color-muted); background: white; cursor: pointer; }
.file-chip { height: 34px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; color: var(--color-primary); background: var(--color-primary-soft); font-size: 12px; font-weight: 700; cursor: pointer; }
.submission-card { margin-top: 10px; padding: 16px; border: 1px solid var(--color-border); border-radius: 13px; background: var(--color-surface); display: grid; gap: 10px; }
.submission-heading small { color: var(--color-subtle); }
.feedback-note { padding: 12px; border-radius: 10px; background: var(--color-success-soft); }
.classroom-detail { min-height: 260px; padding: 20px; border: 1px solid var(--color-border); border-radius: 14px; background: white; overflow-wrap: anywhere; }
.classroom-detail p { margin: 12px 0; }
.classroom-placeholder { display: grid; place-content: center; justify-items: center; gap: 8px; text-align: center; color: var(--color-subtle); }
.classroom-placeholder h4 { margin: 0; color: var(--color-muted); }
.classroom-placeholder p { margin: 0; max-width: 280px; font-size: 13px; }
.classroom-empty { margin: 0; padding: 18px; border: 1px dashed var(--color-border); border-radius: 12px; color: var(--color-subtle); background: var(--color-canvas); font-size: 13px; }
.classroom-empty.inline { margin: 12px 0; }
.forum-empty-list { display: grid; justify-items: center; gap: 8px; text-align: center; padding: 36px 18px; }
.forum-empty-list strong { color: var(--color-text); font-size: 14px; }
.forum-empty-list span { max-width: 260px; line-height: 1.45; color: var(--color-subtle); font-size: 13px; }
.classroom-form textarea { min-height: 90px; resize: vertical; max-width: 100%; }
.classroom-pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 16px 0; }
.preserve-lines { white-space: pre-wrap; overflow-wrap: anywhere; }
.classroom-toolstrip-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.settings-grid { display: grid; gap: 10px; }
.forum-table-panel {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  overflow: hidden;
}
.forum-table {
  width: 100%;
  border-collapse: collapse;
}
.forum-table th,
.forum-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
}
.forum-table th {
  color: var(--color-subtle);
  background: var(--color-canvas);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .3px;
  text-transform: uppercase;
}
.forum-table tr:last-child td { border-bottom: 0; }
.forum-table-row {
  cursor: pointer;
  transition: background .15s ease;
}
.forum-table-row:hover,
.forum-table-row:focus-visible {
  background: var(--color-primary-soft);
  outline: none;
}
.forum-table-row.pinned {
  background: color-mix(in srgb, var(--color-warning-soft, #fff7ed) 45%, transparent);
}
.forum-table-row.pinned:hover,
.forum-table-row.pinned:focus-visible {
  background: color-mix(in srgb, var(--color-warning-soft, #fff7ed) 70%, var(--color-primary-soft));
}
.forum-table-topic {
  display: grid;
  gap: 4px;
  min-width: 180px;
  max-width: 420px;
}
.forum-table-topic strong {
  color: var(--color-text);
  font-size: 13.5px;
  font-weight: 700;
}
.forum-table-topic small {
  color: var(--color-subtle);
  font-size: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.forum-table-topic .pin-badge { margin-top: 2px; }
.forum-topic-status {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  color: #166534;
  background: #dcfce7;
  font-size: 11px;
  font-weight: 750;
}
.forum-topic-status.closed {
  color: #9f1239;
  background: #ffe4e6;
}
.topic-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.pin-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 999px;
  color: #9a3412;
  background: #ffedd5;
  font-size: 10px;
  font-weight: 750;
}
.forum-board-solo {
  margin-top: 0;
}
.forum-board {
  min-height: 420px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface);
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-content: start;
}
.forum-board-header {
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  background: linear-gradient(180deg, var(--color-canvas), var(--color-surface));
}
.forum-back {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  background: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.forum-back:hover { border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border)); background: var(--color-primary-soft); }
.forum-board-title { flex: 1; min-width: 180px; }
.forum-board-title h4 { margin: 6px 0 4px; color: var(--color-text); font: 750 18px/1.3 var(--font-primary); }
.forum-board-title p { margin: 0; color: var(--color-subtle); font-size: 12px; }
.forum-moderation { display: flex; gap: 8px; flex-wrap: wrap; }
.forum-thread {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: var(--color-canvas);
  max-height: min(58vh, 640px);
  overflow: auto;
}
.forum-post {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
  overflow: hidden;
}
.forum-post.opener {
  border-color: color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary-soft) 55%, white), white);
}
.forum-post.teacher {
  border-color: color-mix(in srgb, #0f766e 18%, var(--color-border));
}
.forum-post-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
}
.forum-post-who { min-width: 0; display: grid; gap: 2px; }
.forum-post-who strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 750;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.forum-post-who em {
  width: fit-content;
  padding: 2px 7px;
  border-radius: 999px;
  color: var(--color-muted);
  background: var(--color-canvas);
  font-size: 10px;
  font-style: normal;
  font-weight: 750;
}
.forum-post.teacher .forum-post-who em {
  color: #0f766e;
  background: #ccfbf1;
}
.forum-post-meta {
  display: grid;
  justify-items: end;
  gap: 2px;
}
.forum-post-time,
.forum-post-meta time {
  color: var(--color-subtle);
  font-size: 11px;
}
.post-number {
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 750;
}
.forum-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  background: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
  flex: 0 0 auto;
}
.forum-avatar.teacher { background: #0f766e; }
.forum-avatar.opener-avatar {
  color: var(--color-primary);
  background: white;
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
}
.forum-post-body { padding: 14px 16px 14px; display: grid; gap: 12px; }
.forum-post-body p {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.65;
}
.forum-edit-box {
  width: 100%;
  min-height: 96px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  resize: vertical;
  font: inherit;
  line-height: 1.55;
}
.post-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.post-action {
  height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.post-action:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.post-action.danger { color: var(--color-error); }
.post-action.danger:hover { background: var(--color-error-soft); }
.forum-empty-thread {
  min-height: 140px;
  padding: 28px 16px;
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 6px;
  color: var(--color-subtle);
  text-align: center;
  background: white;
}
.forum-empty-thread strong { color: var(--color-muted); font-size: 14px; }
.forum-empty-thread span { font-size: 12px; }
.forum-pagination {
  margin: 0;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background: white;
}
.forum-composer {
  margin: 0;
  padding: 16px 18px;
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 10px;
  background: white;
}
.forum-composer-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.forum-composer-head strong { color: var(--color-text); font-size: 13px; }
.forum-composer-head small { color: var(--color-subtle); font-size: 12px; }
.forum-composer textarea {
  min-height: 108px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  resize: vertical;
  line-height: 1.55;
  font: inherit;
  font-size: 14px;
  background: var(--color-canvas);
}
.forum-composer textarea:focus {
  outline: 0;
  border-color: var(--color-border);
  box-shadow: none;
  background: white;
}
.composer-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.composer-hint { color: var(--color-subtle); font-size: 12px; }
.composer-footer .primary-button { display: inline-flex; align-items: center; gap: 7px; }
.forum-closed-note {
  margin: 0;
  padding: 14px 18px;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  background: var(--color-canvas);
  font-size: 13px;
  font-weight: 650;
}
.forum-placeholder { min-height: 420px; }
.course-comms-list { display: grid; gap: 12px; }
.course-comm-card {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  display: grid;
  gap: 8px;
}
.course-comm-card header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.course-comm-card strong { color: var(--color-text); font-size: 14px; }
.course-comm-card small { color: var(--color-subtle); font-size: 12px; }
.course-comm-card p { margin: 0; color: var(--color-muted); font-size: 13px; line-height: 1.55; }
.material-file-list { margin-top: 14px; display: grid; gap: 10px; }
.material-file-row {
  padding: 14px 16px; border: 1px solid var(--color-border); border-radius: 14px;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; background: var(--color-surface);
}
.material-file-row-clickable {
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.material-file-row-clickable:hover,
.material-file-row-clickable:focus-visible {
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary-soft) 35%, var(--color-surface));
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-text) 6%, transparent);
  outline: none;
}
.material-file-meta { min-width: 0; display: grid; gap: 3px; }
.material-file-meta strong { color: var(--color-text); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.material-file-meta small { color: var(--color-subtle); font-size: 12px; }
.material-description-preview {
  margin: 2px 0;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.material-no-desc {
  color: var(--color-subtle);
  font-style: italic;
}
.material-file-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; color: var(--color-primary); background: var(--color-primary-soft); }
.material-file-icon.pdf { color: var(--color-error); background: var(--color-error-soft); }
.material-file-icon.ppt { color: #b45309; background: #ffedd5; }
.material-file-icon.doc { color: #1d4ed8; background: #dbeafe; }
.material-file-icon.xls { color: #047857; background: #d1fae5; }
.material-file-icon.image { color: #7c3aed; background: #ede9fe; }
.material-file-icon.link { color: #0f766e; background: #ccfbf1; }
.course-link-url { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 42ch; }
.course-links-list .publication-actions a.secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}
.materials-empty { margin-top: 14px; }
.material-detail { display: grid; gap: 14px; }
.material-detail-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.material-detail-card { padding: 0; overflow: hidden; }
.material-detail-head {
  padding: 20px 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-canvas) 70%, transparent);
}
.material-detail-head > div { min-width: 0; display: grid; gap: 4px; }
.material-detail-kicker {
  margin: 0;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.material-detail-head h3 {
  margin: 0;
  color: var(--color-text);
  font: 800 18px/1.25 var(--font-primary);
}
.material-detail-head small { color: var(--color-subtle); font-size: 12px; }
.material-detail-body {
  padding: 20px 22px 24px;
  display: grid;
  gap: 10px;
}
.material-detail-body h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 750;
}
.material-detail-body > p {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.6;
}
.material-detail-empty {
  padding: 18px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  display: grid;
  gap: 8px;
  justify-items: start;
  background: var(--color-canvas);
}
.material-detail-empty strong { color: var(--color-text); font-size: 14px; }
.material-detail-empty span { color: var(--color-muted); font-size: 13px; line-height: 1.45; }
@media (max-width: 900px) {
  .forum-post-head { grid-template-columns: auto minmax(0, 1fr); }
  .forum-post-meta { grid-column: 2; justify-items: start; }
  .forum-table th:nth-child(4),
  .forum-table td:nth-child(4) { display: none; }
}
@media (max-width: 760px) {
  .classroom-header, .classroom-toolstrip { align-items: stretch; flex-direction: column; }
  .classroom-switch { width: 100%; }
  .classroom-switch button { flex: 1; justify-content: center; padding: 0 8px; font-size: 11px; }
  .classroom-overview { grid-template-columns: repeat(2, 1fr); }
  .classroom-filters, .create-grid { grid-template-columns: 1fr; }
  .classroom-layout { grid-template-columns: minmax(0, 1fr); }
  .classroom-panel { padding: 16px; }
  .forum-board-header { flex-direction: column; }
  .forum-table th:nth-child(3),
  .forum-table td:nth-child(3),
  .forum-table th:nth-child(5),
  .forum-table td:nth-child(5) { display: none; }
  .material-file-row { grid-template-columns: auto minmax(0, 1fr); }
  .material-file-row .secondary-button { grid-column: 1 / -1; width: 100%; justify-content: center; }
  .forum-composer .primary-button, .create-actions .primary-button, .create-actions .secondary-button { width: 100%; }
  .composer-footer { flex-direction: column; align-items: stretch; }
  .create-actions { flex-direction: column-reverse; }
}
.publication-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.publication-confirm { position: sticky; top: 12px; z-index: 5; margin: 16px 0; padding: 18px; border: 1px solid var(--color-error); border-radius: 12px; background: var(--color-surface); box-shadow: 0 8px 30px #0002; }
.publication-confirm p { margin: 8px 0 16px; }
.material-description { margin: 8px 0; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.material-file-row { align-items: start; }
.forum-table-topic a { color: var(--color-primary); font-size: 15px; font-weight: 750; text-decoration: none; }
.forum-table-topic a:hover { text-decoration: underline; }
.forum-author, .forum-last-activity { color: var(--color-muted); font-size: 12px; }
.forum-last-activity { display: grid; gap: 6px; }
.forum-table thead { background: var(--color-primary-soft); }
.forum-table-row td { padding-top: 20px; padding-bottom: 20px; }
.forum-board-solo .forum-post { display: grid; grid-template-columns: 210px minmax(0, 1fr); overflow: hidden; }
.forum-board-solo .forum-post-head { grid-template-columns: auto minmax(0, 1fr); align-content: start; justify-content: flex-start; padding: 20px; border-right: 1px solid var(--color-border); background: var(--color-canvas); }
.forum-board-solo .forum-post-meta { grid-column: 1 / -1; justify-items: start; margin: 10px 0 0; width: 100%; }
.forum-board-solo .forum-post-body { padding: 24px; min-width: 0; overflow-wrap: anywhere; }
@media (max-width: 700px) {
  .forum-board-solo .forum-post { grid-template-columns: minmax(0, 1fr); }
  .forum-board-solo .forum-post-head { border-right: 0; }
  .material-file-row > .publication-actions { grid-column: 1 / -1; }
}
</style>
