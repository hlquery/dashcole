<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ArrowLeft, BookOpen, MessageSquare, Pencil, Pin, Plus, Reply, Send, Settings, Trash2, Users, X } from '@lucide/vue';
import { TablePagination } from './ui/index.js';

const props = defineProps({
  courseId: { type: Number, required: true },
  courseLabel: { type: String, default: '' },
  forumId: { type: Number, default: null },
  request: { type: Function, required: true },
  download: { type: Function, default: null },
  user: { type: Object, default: null },
  openSettings: { type: Boolean, default: false },
});

const emit = defineEmits(['open-forum', 'open-course', 'open-aula', 'settings-opened', 'leave']);

const DEFAULT_COURSE_FORUM_GUIDELINES = [
  'Normas generales de los foros de este curso:',
  '• Participa con respeto mutuo hacia compañeros y docentes.',
  '• Usa un lenguaje claro y cordial; no se permiten insultos, burlas ni mensajes ofensivos.',
  '• Comparte dudas o aportes de forma concreta para ayudar a la conversación.',
  '• Este es un espacio de aprendizaje: colabora y cuida el clima del curso.',
].join('\n');

const data = ref({
  forums: [],
  canTeach: false,
  canCreateForum: false,
  canParticipate: false,
  settings: {
    allowStudentsCreateForum: false,
    allowStudentsReplyForum: true,
    forumGuidelines: '',
  },
});
const error = ref('');
const accessDenied = ref(false);
const busy = ref(false);
const selectedForum = ref(null);
const posts = ref([]);
const authorAvatars = ref({});
const total = ref(0);
const page = ref(1);
const message = ref('');
const forumQuery = ref('');
const forumFilter = ref('all');
const showCreateForum = ref(false);
const showSettings = ref(false);
const settingsSaving = ref(false);
const settingsForm = reactive({
  allowStudentsCreateForum: false,
  allowStudentsReplyForum: true,
  forumGuidelines: DEFAULT_COURSE_FORUM_GUIDELINES,
});
const forum = reactive({ title: '', description: '', notifyEmail: true });
const editingPostId = ref(null);
const editDraft = ref('');
const deletingPostId = ref(null);
const composerEl = ref(null);

const base = () => `/courses/${props.courseId}/classroom`;
const forumPath = () => `${base()}/forums/${selectedForum.value.id}`;

const accessDeniedDetail = computed(() => {
  const role = props.user?.role;
  if (role === 'teacher') {
    return 'Solo puedes abrir foros de las asignaturas que tienes a cargo o donde eres profesor jefe.';
  }
  if (role === 'guardian') return 'Los foros del aula son solo para docentes y estudiantes.';
  if (role === 'student') return 'Solo puedes ver foros de los cursos en los que estás matriculado.';
  return 'No tienes permiso para ver este contenido.';
});

async function run(action) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  accessDenied.value = false;
  try { await action(); }
  catch (err) {
    error.value = err.message || 'No pudimos cargar el foro.';
    accessDenied.value = Number(err.status) === 403 || /no tienes acceso/i.test(error.value);
  }
  finally { busy.value = false; }
}

async function loadAuthorAvatars(rows) {
  if (!props.download || !Array.isArray(rows) || !rows.length) return;
  const next = { ...authorAvatars.value };
  const pending = rows.filter((item) => item?.hasAvatar && item.createdBy && !next[item.createdBy]);
  await Promise.all(pending.map(async (item) => {
    try {
      const response = await props.download(`${base()}/authors/${item.createdBy}/avatar`);
      if (response?.ok) next[item.createdBy] = URL.createObjectURL(await response.blob());
    } catch { /* sin avatar: no se muestra nada */ }
  }));
  authorAvatars.value = next;
}

async function loadPosts() {
  const result = await props.request(`${forumPath()}/posts?page=${page.value}`);
  posts.value = result.posts;
  total.value = result.total;
  await loadAuthorAvatars(result.posts);
}

async function load() {
  data.value = await props.request(base());
  settingsForm.allowStudentsCreateForum = Boolean(data.value.settings?.allowStudentsCreateForum);
  settingsForm.allowStudentsReplyForum = data.value.settings?.allowStudentsReplyForum !== false;
  settingsForm.forumGuidelines = String(data.value.settings?.forumGuidelines || '').trim() || DEFAULT_COURSE_FORUM_GUIDELINES;
  if (props.forumId) {
    selectedForum.value = data.value.forums.find((item) => Number(item.id) === Number(props.forumId)) || null;
    if (!selectedForum.value) {
      error.value = 'Este tema no existe o ya no está disponible.';
      posts.value = [];
      total.value = 0;
    } else {
      page.value = 1;
      await loadPosts();
    }
  } else {
    selectedForum.value = null;
    posts.value = [];
    total.value = 0;
  }
}

watch(() => [props.courseId, props.forumId], async () => {
  editingPostId.value = null;
  deletingPostId.value = null;
  showCreateForum.value = false;
  message.value = '';
  await run(load);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, { immediate: true });

watch(() => [props.openSettings, data.value.canTeach], ([open]) => {
  if (!open || !data.value.canTeach) return;
  showSettings.value = true;
  emit('settings-opened');
});

function openTopic(item) {
  emit('open-forum', item?.id || null);
}

async function createForum() {
  await run(async () => {
    const payload = {
      title: forum.title,
      description: forum.description,
      ...(data.value.canTeach ? { notifyEmail: forum.notifyEmail } : {}),
    };
    const created = await props.request(`${base()}/forums`, { method: 'POST', body: JSON.stringify(payload) });
    Object.assign(forum, { title: '', description: '', notifyEmail: true });
    showCreateForum.value = false;
    await load();
    if (created?.id) emit('open-forum', created.id);
  });
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

async function saveSettings() {
  settingsSaving.value = true;
  error.value = '';
  try {
    data.value.settings = await props.request(`${base()}/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        allowStudentsCreateForum: Boolean(settingsForm.allowStudentsCreateForum),
        allowStudentsReplyForum: Boolean(settingsForm.allowStudentsReplyForum),
        forumGuidelines: String(settingsForm.forumGuidelines || '').trim(),
      }),
    });
    await load();
    showSettings.value = false;
  } catch (err) {
    error.value = err.message;
  } finally {
    settingsSaving.value = false;
  }
}

function applyForumPreset(preset) {
  if (preset === 'readonly') {
    settingsForm.allowStudentsCreateForum = false;
    settingsForm.allowStudentsReplyForum = false;
  } else if (preset === 'reply') {
    settingsForm.allowStudentsCreateForum = false;
    settingsForm.allowStudentsReplyForum = true;
  } else if (preset === 'open') {
    settingsForm.allowStudentsCreateForum = true;
    settingsForm.allowStudentsReplyForum = true;
  }
}

const forumPreset = computed(() => {
  const create = Boolean(settingsForm.allowStudentsCreateForum);
  const reply = Boolean(settingsForm.allowStudentsReplyForum);
  if (!create && !reply) return 'readonly';
  if (!create && reply) return 'reply';
  if (create && reply) return 'open';
  return 'custom';
});

const forumModeLabel = computed(() => {
  const settings = data.value.settings || {};
  if (!settings.allowStudentsReplyForum && !settings.allowStudentsCreateForum) {
    return 'Solo lectura';
  }
  if (settings.allowStudentsCreateForum) return 'Estudiantes pueden crear temas y responder';
  if (settings.allowStudentsReplyForum) return 'Estudiantes pueden responder';
  return 'Participación restringida';
});

const forumGuidelinesText = computed(() => String(data.value.settings?.forumGuidelines || '').trim());

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
  await goToForumPage(page.value + delta);
}
async function goToForumPage(target) {
  const next = Math.min(pageCount.value, Math.max(1, Number(target) || 1));
  if (next === page.value) return;
  await run(async () => {
    page.value = next;
    await loadPosts();
  });
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
function relativeDate(value) {
  if (!value) return '—';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const [amount, unit] = absolute < 60 ? [seconds, 'second'] : absolute < 3600 ? [Math.round(seconds / 60), 'minute'] : absolute < 86400 ? [Math.round(seconds / 3600), 'hour'] : [Math.round(seconds / 86400), 'day'];
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(amount, unit);
}
const roleLabel = (role) => (['teacher', 'director', 'manager', 'utp', 'school_admin', 'super_admin'].includes(role) ? 'Docente' : 'Estudiante');
const isTeacherRole = (role) => roleLabel(role) === 'Docente';
const authorAvatar = (item) => (item?.createdBy ? authorAvatars.value[item.createdBy] : null);

const filteredForums = computed(() => data.value.forums.filter((item) => {
  const matches = !forumQuery.value || `${item.title} ${item.description}`.toLowerCase().includes(forumQuery.value.toLowerCase());
  return matches && (forumFilter.value === 'all' || (forumFilter.value === 'open' && !item.closed) || (forumFilter.value === 'closed' && item.closed) || (forumFilter.value === 'pinned' && item.pinned));
}));
const sortedForums = computed(() => [...filteredForums.value].sort((a, b) => {
  if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
  return new Date(b.lastActivityAt || b.updatedAt || 0) - new Date(a.lastActivityAt || a.updatedAt || 0);
}));
const openForumCount = computed(() => data.value.forums.filter((item) => !item.closed).length);
const messageCount = computed(() => data.value.forums.reduce((sum, item) => sum + Number(item.postCount || 0), 0));
const pinnedForumCount = computed(() => data.value.forums.filter((item) => item.pinned).length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / 20)));
const replyCount = (item) => Math.max(0, Number(item.postCount || 0));
const pinnedTopics = computed(() => sortedForums.value.filter((item) => item.pinned));
const regularTopics = computed(() => sortedForums.value.filter((item) => !item.pinned));
const forumFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'pinned', label: 'Fijados' },
  { value: 'closed', label: 'Cerrados' },
];
</script>

<template>
  <div class="course-forum-page">
    <section v-if="accessDenied" class="panel forum-empty forum-access-denied" role="alert">
      <MessageSquare :size="28" />
      <strong>{{ forumId ? 'No tienes acceso a este foro' : 'No tienes acceso a este curso' }}</strong>
      <span>{{ accessDeniedDetail }}</span>
      <button type="button" class="primary-button" @click="emit('leave')">
        <ArrowLeft :size="15" />Volver a cursos
      </button>
    </section>

    <template v-else>
    <p v-if="error && selectedForum" class="login-error" role="alert">{{ error }}</p>

    <!-- Lista de temas -->
    <template v-if="!forumId">
      <section class="panel forum-board">
        <header class="forum-board-bar">
          <div>
            <p class="forum-board-kicker">Conversación del curso</p>
            <h2>Temas del foro</h2>
          </div>
          <div class="forum-board-actions">
            <button v-if="data.canTeach" type="button" class="secondary-button" @click="showSettings = !showSettings">
              <Settings :size="15" />Configurar
            </button>
            <button v-if="data.canCreateForum" type="button" class="primary-button" @click="showCreateForum = !showCreateForum">
              <Plus :size="16" />{{ showCreateForum ? 'Cerrar' : 'Nuevo tema' }}
            </button>
          </div>
        </header>

        <div class="forum-stat-row" aria-label="Resumen del foro">
          <div><strong>{{ data.forums.length }}</strong><span>tema{{ data.forums.length === 1 ? '' : 's' }}</span></div>
          <div><strong>{{ openForumCount }}</strong><span>abierto{{ openForumCount === 1 ? '' : 's' }}</span></div>
          <div><strong>{{ pinnedForumCount }}</strong><span>fijado{{ pinnedForumCount === 1 ? '' : 's' }}</span></div>
          <div><strong>{{ messageCount }}</strong><span>mensaje{{ messageCount === 1 ? '' : 's' }}</span></div>
        </div>

        <aside v-if="forumGuidelinesText && !showSettings" class="forum-guidelines-card">
          <div class="forum-guidelines-icon" aria-hidden="true"><BookOpen :size="18" /></div>
          <div>
            <strong>Normas de los foros del curso</strong>
            <p class="preserve-lines">{{ forumGuidelinesText }}</p>
          </div>
        </aside>

        <p v-if="!showSettings" class="forum-mode-chip">
          <Users :size="14" />
          {{ forumModeLabel }}
        </p>

        <form v-if="showSettings && data.canTeach" class="forum-settings-panel" @submit.prevent="saveSettings">
          <div class="forum-inline-head">
            <div>
              <strong>Configurar foros del curso</strong>
              <span>Reglas generales para todos los foros y quién puede participar.</span>
            </div>
            <button type="button" class="icon-button" aria-label="Cerrar" @click="showSettings = false"><X :size="16" /></button>
          </div>

          <section class="forum-settings-section">
            <header>
              <h3>Modo rápido</h3>
              <p>Elige un punto de partida y ajústalo abajo si hace falta.</p>
            </header>
            <div class="forum-preset-grid" role="group" aria-label="Modos del foro">
              <button type="button" class="forum-preset" :class="{ active: forumPreset === 'readonly' }" @click="applyForumPreset('readonly')">
                <strong>Solo lectura</strong>
                <small>Ven temas y mensajes, sin publicar.</small>
              </button>
              <button type="button" class="forum-preset" :class="{ active: forumPreset === 'reply' }" @click="applyForumPreset('reply')">
                <strong>Responder</strong>
                <small>Pueden responder; solo el docente crea temas.</small>
              </button>
              <button type="button" class="forum-preset" :class="{ active: forumPreset === 'open' }" @click="applyForumPreset('open')">
                <strong>Abierto</strong>
                <small>Pueden crear temas y responder.</small>
              </button>
            </div>
          </section>

          <section class="forum-settings-section">
            <header>
              <h3>Normas generales del curso</h3>
              <p>Aplica a todos los foros de este curso. Se muestra arriba de la lista de temas.</p>
            </header>
            <label class="forum-field">
              <span>Normas de participación <small>{{ settingsForm.forumGuidelines.length }}/5000</small></span>
              <textarea
                v-model="settingsForm.forumGuidelines"
                maxlength="5000"
                rows="6"
                placeholder="Normas de respeto y participación que aplican a todos los foros del curso…"
              />
            </label>
          </section>

          <section class="forum-settings-section">
            <header>
              <h3>Participación</h3>
              <p>Controla quién publica y cómo.</p>
            </header>
            <div class="settings-grid">
              <label class="switch-field">
                <input v-model="settingsForm.allowStudentsCreateForum" type="checkbox" />
                <span>
                  <i></i>
                  <strong>Estudiantes pueden crear temas</strong>
                  <small>Por defecto apagado: solo docentes abren nuevos hilos.</small>
                </span>
              </label>
              <label class="switch-field">
                <input v-model="settingsForm.allowStudentsReplyForum" type="checkbox" />
                <span>
                  <i></i>
                  <strong>Estudiantes pueden responder</strong>
                  <small>Permite mensajes en temas abiertos.</small>
                </span>
              </label>
            </div>
          </section>

          <div class="forum-inline-actions">
            <button type="button" class="secondary-button" @click="showSettings = false">Cancelar</button>
            <button class="primary-button" :disabled="settingsSaving">{{ settingsSaving ? 'Guardando…' : 'Guardar configuración' }}</button>
          </div>
        </form>

        <form v-if="showCreateForum && data.canCreateForum" class="forum-inline-panel" @submit.prevent="createForum">
          <div class="forum-inline-head">
            <div><strong>Nuevo tema</strong><span>Se abrirá en su propia conversación.</span></div>
            <button type="button" class="icon-button" aria-label="Cerrar" @click="showCreateForum = false"><X :size="16" /></button>
          </div>
          <label class="forum-field">
            <span>Título</span>
            <input v-model="forum.title" required maxlength="180" placeholder="Ej. Dudas de la unidad 2" />
          </label>
          <label class="forum-field">
            <span>Mensaje inicial</span>
            <textarea v-model="forum.description" required maxlength="10000" rows="4" placeholder="Describe el tema y orienta las respuestas…" />
          </label>
          <label v-if="data.canTeach" class="switch-field">
            <input v-model="forum.notifyEmail" type="checkbox" />
            <span>
              <i></i>
              <strong>Notificar estudiantes por correo</strong>
              <small>Envía un email a los matriculados. La campanita in-app se envía siempre.</small>
            </span>
          </label>
          <div class="forum-inline-actions">
            <button type="button" class="secondary-button" @click="showCreateForum = false">Cancelar</button>
            <button class="primary-button" :disabled="busy">Publicar tema</button>
          </div>
        </form>

        <div class="forum-toolbar">
          <div class="forum-filter-chips" role="tablist" aria-label="Filtrar temas">
            <button
              v-for="option in forumFilterOptions"
              :key="option.value"
              type="button"
              role="tab"
              :aria-selected="forumFilter === option.value"
              :class="{ active: forumFilter === option.value }"
              @click="forumFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <input v-model.trim="forumQuery" type="search" placeholder="Buscar por título o mensaje…" aria-label="Buscar temas" />
        </div>

        <div v-if="!sortedForums.length" class="forum-empty">
          <MessageSquare :size="26" />
          <strong>{{ data.forums.length ? 'Sin resultados' : 'Todavía no hay temas' }}</strong>
          <span>{{ data.forums.length ? 'Prueba otro filtro o búsqueda.' : (data.canCreateForum ? 'Crea el primer tema para abrir la conversación.' : 'Cuando publiquen un tema aparecerá aquí.') }}</span>
          <button v-if="!data.forums.length && data.canCreateForum" type="button" class="primary-button" @click="showCreateForum = true">
            <Plus :size="15" />Crear primer tema
          </button>
        </div>

        <div v-else class="forum-sections">
          <section v-if="pinnedTopics.length" class="forum-section">
            <header class="forum-section-head">
              <Pin :size="14" />
              <strong>Fijados</strong>
              <span>{{ pinnedTopics.length }}</span>
            </header>
            <ul class="forum-topic-list">
              <li
                v-for="item in pinnedTopics"
                :key="item.id"
                class="forum-topic-card pinned"
                :class="{ closed: item.closed }"
              >
                <button type="button" class="forum-topic-main" @click="openTopic(item)">
                  <span class="forum-topic-icon" aria-hidden="true"><Pin :size="16" /></span>
                  <span class="forum-topic-copy">
                    <span class="forum-topic-title-row">
                      <strong>{{ item.title }}</strong>
                      <span v-if="item.closed" class="forum-topic-status closed">Cerrado</span>
                    </span>
                    <span class="forum-topic-meta">{{ item.authorName || 'Sin autor' }}</span>
                    <span v-if="item.description" class="forum-topic-excerpt">{{ item.description }}</span>
                  </span>
                  <span class="forum-topic-side">
                    <span class="forum-topic-metric">
                      <strong>{{ replyCount(item) }}</strong>
                      <small>resp.</small>
                    </span>
                    <span class="forum-topic-when">
                      {{ item.lastActivityAt ? relativeDate(item.lastActivityAt) : absoluteDate(item.createdAt) }}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </section>

          <section v-if="regularTopics.length" class="forum-section">
            <header v-if="pinnedTopics.length" class="forum-section-head">
              <MessageSquare :size="14" />
              <strong>Otros temas</strong>
              <span>{{ regularTopics.length }}</span>
            </header>
            <ul class="forum-topic-list">
              <li
                v-for="item in regularTopics"
                :key="item.id"
                class="forum-topic-card"
                :class="{ closed: item.closed }"
              >
                <button type="button" class="forum-topic-main" @click="openTopic(item)">
                  <span class="forum-topic-icon" aria-hidden="true"><MessageSquare :size="17" /></span>
                  <span class="forum-topic-copy">
                    <span class="forum-topic-title-row">
                      <strong>{{ item.title }}</strong>
                      <span v-if="item.closed" class="forum-topic-status closed">Cerrado</span>
                    </span>
                    <span class="forum-topic-meta">{{ item.authorName || 'Sin autor' }}</span>
                    <span v-if="item.description" class="forum-topic-excerpt">{{ item.description }}</span>
                  </span>
                  <span class="forum-topic-side">
                    <span class="forum-topic-metric">
                      <strong>{{ replyCount(item) }}</strong>
                      <small>resp.</small>
                    </span>
                    <span class="forum-topic-when">
                      {{ item.lastActivityAt ? relativeDate(item.lastActivityAt) : absoluteDate(item.createdAt) }}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </section>
    </template>

    <!-- Hilo -->
    <section v-else-if="selectedForum" class="panel forum-thread-page">
      <header class="forum-thread-bar">
        <button type="button" class="secondary-button" @click="openTopic(null)">
          <ArrowLeft :size="15" />Temas
        </button>
        <div class="forum-thread-title">
          <div class="forum-topic-title-row">
            <h2>{{ selectedForum.title }}</h2>
            <span v-if="selectedForum.pinned" class="pin-badge"><Pin :size="11" />Fijado</span>
            <span class="forum-topic-status" :class="{ closed: selectedForum.closed }">{{ selectedForum.closed ? 'Cerrado' : 'Abierto' }}</span>
          </div>
          <p>
            {{ selectedForum.authorName || 'Usuario' }}
            · {{ replyCount(selectedForum) }} respuesta{{ replyCount(selectedForum) === 1 ? '' : 's' }}
            <span v-if="selectedForum.lastActivityAt"> · última actividad {{ relativeDate(selectedForum.lastActivityAt) }}</span>
          </p>
        </div>
        <div v-if="data.canTeach" class="forum-moderation">
          <button type="button" class="secondary-button" :disabled="busy" @click="togglePinned">
            <Pin :size="14" />{{ selectedForum.pinned ? 'Quitar fijado' : 'Fijar' }}
          </button>
          <button type="button" class="secondary-button" :disabled="busy" @click="toggleForum">
            {{ selectedForum.closed ? 'Reabrir' : 'Cerrar tema' }}
          </button>
        </div>
      </header>

      <div class="forum-thread">
        <article class="forum-post opener">
          <header class="forum-post-head">
            <div class="forum-post-identity">
              <div class="forum-avatar opener-avatar"><MessageSquare :size="16" /></div>
              <div class="forum-post-who">
                <strong>{{ selectedForum.authorName || 'Apertura del tema' }}</strong>
                <em>Mensaje inicial</em>
                <time class="forum-post-time">{{ absoluteDate(selectedForum.createdAt || selectedForum.created_at) }}</time>
              </div>
            </div>
          </header>
          <div class="forum-post-body">
            <p class="preserve-lines">{{ selectedForum.description }}</p>
          </div>
        </article>

        <article
          v-for="item in posts"
          :key="item.id"
          class="forum-post"
          :class="{ teacher: isTeacherRole(item.authorRole) }"
        >
          <header class="forum-post-head">
            <div class="forum-post-identity">
              <div v-if="authorAvatar(item)" class="forum-avatar" :class="{ teacher: isTeacherRole(item.authorRole) }">
                <img :src="authorAvatar(item)" :alt="item.authorName || 'Avatar'" />
              </div>
              <div class="forum-post-who">
                <strong>{{ item.authorName }}</strong>
                <em v-if="isTeacherRole(item.authorRole)">Docente</em>
                <time class="forum-post-time" :datetime="item.createdAt">{{ absoluteDate(item.updatedAt || item.createdAt) }}</time>
              </div>
            </div>
            <div
              v-if="editingPostId !== item.id && ((data.canParticipate && !selectedForum.closed) || item.canEdit)"
              class="post-actions"
            >
              <button v-if="data.canParticipate && !selectedForum.closed" type="button" class="post-action" @click="quote(item)"><Reply :size="14" />Citar</button>
              <button v-if="item.canEdit" type="button" class="post-action" @click="startEdit(item)"><Pencil :size="14" />Editar</button>
              <button v-if="item.canEdit" type="button" class="post-action danger" @click="removePost(item)"><Trash2 :size="14" />{{ deletingPostId === item.id ? 'Confirmar' : 'Eliminar' }}</button>
              <button v-if="deletingPostId === item.id" type="button" class="post-action" @click="deletingPostId = null">Cancelar</button>
            </div>
          </header>
          <div class="forum-post-body">
            <template v-if="editingPostId === item.id">
              <textarea v-model="editDraft" class="forum-edit-box" maxlength="5000" rows="4"></textarea>
              <div class="post-actions edit-save-actions">
                <button type="button" class="secondary-button" @click="cancelEdit">Cancelar</button>
                <button type="button" class="primary-button" :disabled="busy || !editDraft.trim()" @click="saveEdit(item)">Guardar</button>
              </div>
            </template>
            <p v-else class="preserve-lines">{{ item.text }}</p>
          </div>
        </article>

        <div v-if="!posts.length" class="forum-empty">
          <MessageSquare :size="26" />
          <strong>Sin respuestas todavía</strong>
          <span>Sé el primero en aportar a este tema.</span>
        </div>
      </div>

      <TablePagination
        class="forum-pagination"
        :page="page"
        :page-count="pageCount"
        :show="total > 20"
        @goto="goToForumPage"
      />

      <form v-if="data.canParticipate && !selectedForum.closed" ref="composerEl" class="forum-composer" @submit.prevent="post">
        <div class="forum-composer-head">
          <strong>Tu respuesta</strong>
          <small>{{ message.length }}/5000</small>
        </div>
        <textarea v-model="message" required maxlength="5000" placeholder="Escribe una respuesta clara y respetuosa…" rows="4"></textarea>
        <div class="composer-footer">
          <span class="composer-hint">Visible para todo el curso</span>
          <button class="primary-button" :disabled="busy || !message.trim()"><Send :size="15" />Publicar respuesta</button>
        </div>
      </form>
      <div v-else-if="selectedForum.closed" class="forum-closed-note">Este tema está cerrado. Solo se puede leer el historial.</div>
      <div v-else-if="!data.canParticipate" class="forum-closed-note">No tienes permiso para responder en este foro.</div>
    </section>

    <section v-else class="panel forum-empty">
      <MessageSquare :size="26" />
      <strong>Este tema no está disponible</strong>
      <span>Puede haber sido eliminado o el enlace ya no es válido.</span>
      <button type="button" class="primary-button" @click="openTopic(null)">
        <ArrowLeft :size="15" />Volver a temas
      </button>
    </section>
    </template>
  </div>
</template>

<style scoped>
.course-forum-page {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}
.forum-board {
  padding: 0;
  overflow: hidden;
}
.forum-board-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 18px 20px 14px;
}
.forum-board-kicker {
  margin: 0 0 4px;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.forum-board-bar h2 {
  margin: 0;
  font-size: 18px;
}
.forum-board-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.forum-stat-row {
  margin: 0 20px 14px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  background: var(--color-canvas);
}
.forum-stat-row > div {
  min-width: 0;
  padding: 4px 8px;
  display: grid;
  gap: 2px;
}
.forum-stat-row strong {
  color: var(--color-text);
  font: 800 16px/1.1 var(--font-primary);
}
.forum-stat-row span {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 650;
}
.forum-guidelines-card {
  margin: 0 20px 12px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: color-mix(in srgb, var(--color-primary-soft) 45%, var(--color-surface));
}
.forum-guidelines-icon {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-surface);
}
.forum-guidelines-card strong {
  display: block;
  margin-bottom: 4px;
  color: var(--color-text);
  font-size: 13px;
}
.forum-guidelines-card p {
  margin: 0;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.5;
}
.forum-mode-chip {
  margin: 0 20px 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--color-muted);
  background: var(--color-canvas);
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 650;
}
.forum-settings-panel {
  display: grid;
  gap: 16px;
  margin: 0 20px 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-canvas);
}
.forum-settings-section {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}
.forum-settings-section header h3 {
  margin: 0 0 3px;
  color: var(--color-text);
  font-size: 14px;
}
.forum-settings-section header p {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.4;
}
.forum-preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.forum-preset {
  min-height: 84px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: grid;
  gap: 6px;
  align-content: start;
  text-align: left;
  color: var(--color-text);
  background: var(--color-canvas);
  cursor: pointer;
}
.forum-preset strong { font-size: 13px; }
.forum-preset small {
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.35;
}
.forum-preset.active {
  border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary-soft) 55%, white);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
.forum-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 0 20px 14px;
  border-bottom: 1px solid var(--color-border);
}
.forum-filter-chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: var(--color-canvas);
}
.forum-filter-chips button {
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  color: var(--color-muted);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.forum-filter-chips button.active {
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text) 10%, transparent);
}
.forum-toolbar input {
  flex: 1;
  min-width: min(220px, 100%);
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 14px;
}
.forum-sections { display: grid; }
.forum-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 8px;
  color: var(--color-muted);
  background: color-mix(in srgb, var(--color-canvas) 70%, transparent);
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
}
.forum-section-head strong {
  color: var(--color-text);
  font-size: 12px;
  font-weight: 750;
}
.forum-section-head span {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 750;
}
.forum-topic-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
}
.forum-topic-card { border-bottom: 1px solid var(--color-border); }
.forum-topic-card:last-child { border-bottom: 0; }
.forum-topic-card.pinned { background: color-mix(in srgb, #fff4d6 40%, transparent); }
.forum-topic-card.closed { opacity: .84; }
.forum-topic-main {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 16px 20px;
  border: 0;
  background: transparent;
  text-align: left;
  color: inherit;
  cursor: pointer;
}
.forum-topic-main:hover {
  background: color-mix(in srgb, var(--color-primary-soft) 40%, transparent);
}
.forum-topic-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.forum-topic-card.pinned .forum-topic-icon {
  color: #8a5a12;
  background: #fff0d6;
}
.forum-topic-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}
.forum-topic-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.forum-topic-title-row strong,
.forum-thread-title h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 15px;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.forum-topic-meta {
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.4;
}
.forum-topic-excerpt {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.forum-topic-side {
  min-width: 88px;
  display: grid;
  justify-items: end;
  gap: 6px;
  padding-top: 2px;
}
.forum-topic-metric {
  display: grid;
  justify-items: end;
  gap: 1px;
}
.forum-topic-metric strong {
  color: var(--color-text);
  font: 800 15px/1 var(--font-primary);
}
.forum-topic-metric small,
.forum-topic-when {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.forum-topic-status,
.pin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}
.forum-topic-status {
  background: color-mix(in srgb, var(--color-success) 14%, #fff);
  color: var(--color-success);
}
.forum-topic-status.closed {
  background: color-mix(in srgb, var(--color-error) 12%, #fff);
  color: var(--color-error);
}
.pin-badge {
  background: #fff0d6;
  color: #8a5a12;
}
.forum-empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 42px 20px;
  text-align: center;
  color: var(--color-muted);
}
.forum-empty strong { color: var(--color-text); }
.forum-access-denied { min-height: 280px; align-content: center; }
.forum-access-denied span { max-width: 34ch; }
.forum-inline-panel {
  display: grid;
  gap: 12px;
  margin: 0 20px 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-canvas);
}
.forum-inline-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.forum-inline-head strong { display: block; margin-bottom: 2px; }
.forum-inline-head span { color: var(--color-muted); font-size: 13px; }
.forum-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.forum-field { display: grid; gap: 6px; }
.forum-field span {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.forum-field span small {
  font-weight: 600;
  color: var(--color-subtle);
}
.forum-field input,
.forum-field textarea,
.forum-edit-box,
.forum-composer textarea {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 14px;
}
.forum-field textarea,
.forum-edit-box,
.forum-composer textarea {
  min-height: 110px;
  resize: vertical;
  width: 100%;
}
.forum-field input:focus,
.forum-field input:focus-visible,
.forum-field textarea:focus,
.forum-field textarea:focus-visible,
.forum-edit-box:focus,
.forum-edit-box:focus-visible,
.forum-composer textarea:focus,
.forum-composer textarea:focus-visible {
  outline: none;
  box-shadow: none;
  border-color: var(--color-border);
  background: var(--color-surface);
}
.forum-toolbar input:focus,
.forum-toolbar input:focus-visible {
  outline: none;
  box-shadow: none;
  border-color: var(--color-border);
}
.settings-grid { display: grid; gap: 8px; }
.switch-field {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  cursor: pointer;
}
.switch-field > input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.switch-field > span {
  display: grid;
  grid-template-columns: 34px 1fr;
  column-gap: 10px;
  width: 100%;
}
.switch-field i {
  grid-row: 1 / 3;
  width: 34px;
  height: 19px;
  padding: 2px;
  border-radius: 15px;
  background: var(--color-border);
  transition: .2s;
}
.switch-field i::after {
  content: '';
  display: block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-dark, #0f172a) 13%, transparent);
  transition: .2s;
}
.switch-field input:checked + span i { background: var(--color-primary); }
.switch-field input:checked + span i::after { transform: translateX(15px); }
.switch-field strong { font-size: 13px; }
.switch-field small { color: var(--color-muted); font-size: 12px; }
.forum-thread-page {
  padding: 16px 18px 18px;
  display: grid;
  gap: 14px;
}
.forum-thread-bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}
.forum-thread-title p {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: 13px;
}
.forum-moderation {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.forum-thread { display: grid; gap: 12px; }
.forum-post {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-surface);
}
.forum-post.opener {
  border-color: color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary-soft) 35%, var(--color-surface));
}
.forum-post.teacher {
  border-color: color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
}
.forum-post-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-canvas) 65%, transparent);
}
.forum-post-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.forum-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  overflow: hidden;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  font-size: 11px;
  font-weight: 800;
}
.forum-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.forum-avatar.teacher,
.opener-avatar {
  color: var(--color-surface);
  background: var(--color-primary);
}
.forum-post-who { min-width: 0; display: grid; gap: 2px; }
.forum-post-who strong { color: var(--color-text); font-size: 13px; }
.forum-post-who em {
  color: var(--color-muted);
  font-size: 11px;
  font-style: normal;
}
.forum-post-time {
  color: var(--color-muted);
  font-size: 11px;
  white-space: nowrap;
}
.forum-post-body {
  padding: 14px 16px;
  display: grid;
  gap: 12px;
}
.preserve-lines {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
  font-size: 14px;
}
.post-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}
.edit-save-actions { justify-content: flex-end; }
.post-action {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
  background: var(--color-surface);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.post-action:hover { color: var(--color-primary); }
.post-action.danger { color: var(--color-error); }
.forum-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.forum-composer {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-canvas);
}
.forum-composer-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.forum-composer-head small { color: var(--color-muted); }
.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.composer-hint { color: var(--color-muted); font-size: 12px; }
.composer-footer .primary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.forum-closed-note {
  padding: 14px 16px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  color: var(--color-muted);
  background: var(--color-canvas);
  font-size: 13px;
}
@media (max-width: 720px) {
  .forum-stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .forum-preset-grid { grid-template-columns: 1fr; }
  .forum-topic-main { grid-template-columns: auto minmax(0, 1fr); }
  .forum-topic-side {
    grid-column: 2;
    justify-items: start;
    grid-auto-flow: column;
    grid-template-columns: auto auto;
    align-items: center;
    min-width: 0;
    width: 100%;
  }
  .forum-topic-metric {
    justify-items: start;
    grid-auto-flow: column;
    align-items: baseline;
    gap: 4px;
  }
  .forum-thread-bar { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .forum-post-head {
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .forum-post-head .post-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
