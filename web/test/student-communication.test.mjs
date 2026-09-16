import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8');
const opening = source.slice(source.indexOf('async function openCommunicationPage('), source.indexOf('function openCourseCommunication('));
const saving = source.slice(source.indexOf('async function saveCommunication()'), source.indexOf('async function syncRouteFromLocation()'));
function setup(request) {
  const context = {
    request,
    communicationForm: { audiences: ['all'] },
    encodeURIComponent,
    Number,
    Boolean,
    viewRoutes: {
      'Nueva comunicación': '/comunicaciones/nueva',
      'Destinatarios comunicación': '/comunicaciones/nueva/destinatarios',
    },
    window: { history: { pushState(_state, _title, url) { context.url = url; } } },
    courses: { value: [1] },
    setTimeout() {},
    navigate(view) { context.destination = view; },
    async openStudentFicha(id) { context.destination = id; },
    async loadNotifications() {},
    async loadModule() {},
    communicationAudienceSelected(value) { return context.communicationForm.audiences.includes(value); },
    communicationPrimaryAudience: { value: 'all' },
    get communicationPrimaryAudienceValue() { return context.communicationForm.audiences[0] || 'all'; },
  };
  for (const name of [
    'communicationStudentContext', 'communicationError', 'communicationStudentSearch', 'communicationStudentCandidates',
    'communicationStudentSelected', 'communicationGuardianSelected', 'communicationGuardianSearch', 'communicationGuardianCandidates',
    'whatsappConfigured', 'currentView', 'sidebarOpen', 'communicationSaving', 'toast', 'communicationKeepDraft',
    'communicationRecipients', 'communicationRecipientsLoading', 'communicationRecipientsError', 'communicationRecipientsTotal',
    'canListCommunicationRecipients',
  ]) context[name] = { value: null };
  context.canListCommunicationRecipients.value = true;
  Object.defineProperty(context, 'communicationPrimaryAudience', {
    get() { return { value: context.communicationForm.audiences[0] || 'all' }; },
  });
  vm.createContext(context);
  vm.runInContext(opening + saving, context);
  return context;
}

test('student recipient is set before WhatsApp configuration resolves', async () => {
  let resolve;
  const c = setup(() => new Promise(done => { resolve = done; }));
  const pending = c.openCommunicationPage({ studentId: 336, firstName: 'Ana', lastName: 'Prueba' });
  assert.equal(JSON.stringify(c.communicationForm.audiences), JSON.stringify(['student']));
  assert.equal(c.communicationForm.studentId, 336);
  assert.equal(c.communicationStudentSelected.value.first_name, 'Ana');
  assert.equal(c.url, '/comunicaciones/nueva?studentId=336');
  resolve({ configured: false });
  await pending;
  c.backFromCommunication();
  assert.equal(c.destination, 336);
});

test('student context cannot send a community-wide communication', async () => {
  const requests = [];
  const c = setup(async (...args) => { requests.push(args); return {}; });
  await c.openCommunicationPage({ studentId: 336 });
  c.communicationForm.audiences = ['all'];
  await c.saveCommunication();
  assert.equal(requests.filter(([, options]) => options?.method === 'POST').length, 0);
  assert.match(c.communicationError.value, /destinatario/);
});

test('student message payload and return navigation retain the selected student', async () => {
  let payload;
  const c = setup(async (_url, options) => { if (options?.method === 'POST') payload = JSON.parse(options.body); return {}; });
  await c.openCommunicationPage({ studentId: 336 });
  Object.assign(c.communicationForm, { subject: 'Reunión', body: 'Mensaje de prueba' });
  await c.saveCommunication();
  assert.equal(JSON.stringify(payload.audiences), JSON.stringify(['student']));
  assert.equal(payload.audience, 'student');
  assert.equal(payload.studentId, 336);
  assert.equal(c.destination, 336);
  await c.openCommunicationPage();
  assert.equal(c.communicationStudentContext.value, null);
  assert.equal(JSON.stringify(c.communicationForm.audiences), JSON.stringify(['all']));
});
