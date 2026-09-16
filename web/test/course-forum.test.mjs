import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { parse, compileScript } from '@vue/compiler-sfc';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Element', 'HTMLElement', 'SVGElement', 'Node']) {
  globalThis[key] = dom.window[key];
}
Object.defineProperty(globalThis, 'scrollTo', { value: () => {}, configurable: true });

const { mount, flushPromises } = await import('@vue/test-utils');
const { descriptor } = parse(readFileSync(new URL('../src/components/CourseForum.vue', import.meta.url), 'utf8'));
const compiled = compileScript(descriptor, { id: 'course-forum-test', inlineTemplate: true }).content
  .replace(/from (["'])(vue|@lucide\/vue)\1/g, (_match, _quote, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { default: CourseForum } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const topic = {
  id: 12,
  title: 'Preguntas de la unidad',
  description: 'Comparte tus dudas',
  authorName: 'Ana',
  createdAt: '2026-09-01',
  postCount: 1,
  closed: false,
  pinned: false,
};

function setup(props = {}) {
  const requests = [];
  const canTeach = props.user?.role !== 'student';
  const wrapper = mount(CourseForum, {
    props: {
      courseId: 297,
      user: { role: 'teacher' },
      request: async (url) => {
        requests.push(url);
        if (url.includes('/posts?')) {
          return {
            posts: [{ id: 1, text: 'Mi respuesta', authorName: 'Pedro', authorRole: 'student', canEdit: false, createdAt: '2026-09-02' }],
            total: 1,
          };
        }
        return {
          canTeach,
          canCreateForum: canTeach,
          canParticipate: true,
          forums: [topic],
          settings: { allowStudentsCreateForum: false, allowStudentsReplyForum: true },
        };
      },
      ...props,
    },
  });
  return { wrapper, requests };
}

test('forum index lists topics and navigates through the parent router', async () => {
  const { wrapper } = setup();
  await flushPromises();
  assert.match(wrapper.text(), /Preguntas de la unidad/);
  assert.match(wrapper.text(), /Ana/);
  await wrapper.get('.forum-topic-main').trigger('click');
  assert.deepEqual(wrapper.emitted('open-forum'), [[12]]);
  wrapper.unmount();
});

test('direct topic navigation loads messages and offers return to all topics', async () => {
  const { wrapper, requests } = setup({ forumId: 12 });
  await flushPromises();
  assert.ok(requests.some((url) => url === '/courses/297/classroom/forums/12/posts?page=1'));
  assert.match(wrapper.text(), /Mi respuesta/);
  await wrapper.get('.secondary-button').trigger('click');
  assert.deepEqual(wrapper.emitted('open-forum'), [[null]]);
  wrapper.unmount();
});

test('missing topic shows empty state with return action', async () => {
  const { wrapper } = setup({ forumId: 99 });
  await flushPromises();
  assert.match(wrapper.text(), /Este tema no está disponible/);
  await wrapper.get('.primary-button').trigger('click');
  assert.deepEqual(wrapper.emitted('open-forum'), [[null]]);
  wrapper.unmount();
});

test('forbidden classroom shows clear access denied message', async () => {
  const { ApiError } = await import('../src/api/client.js');
  const wrapper = mount(CourseForum, {
    props: {
      courseId: 356,
      forumId: 176,
      user: { role: 'teacher' },
      request: async () => {
        throw new ApiError('No tienes acceso a este curso.', { status: 403 });
      },
    },
  });
  await flushPromises();
  assert.match(wrapper.text(), /No tienes acceso a este foro/);
  assert.match(wrapper.text(), /asignaturas que tienes a cargo|profesor jefe/i);
  await wrapper.get('.primary-button').trigger('click');
  assert.ok(wrapper.emitted('leave'));
  wrapper.unmount();
});
