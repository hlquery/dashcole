import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { parse, compileScript } from '@vue/compiler-sfc';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Element', 'HTMLElement', 'SVGElement', 'Node']) globalThis[key] = dom.window[key];
const { mount, flushPromises } = await import('@vue/test-utils');
const { descriptor } = parse(readFileSync(new URL('../src/components/Classroom.vue', import.meta.url), 'utf8'));
const compiled = compileScript(descriptor, { id: 'classroom-test', inlineTemplate: true }).content.replace(/from (["'])(vue|@lucide\/vue)\1/g, (_match, _quote, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { default: Classroom } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

function setup(props = {}) {
  const requests = [];
  const canTeach = props.user?.role !== 'student';
  const wrapper = mount(Classroom, { props: {
    courseId: 297, user: { role: 'teacher' }, initialSection: 'archivos',
    request: async (url, options) => {
      requests.push([url, options]);
      if (url.endsWith('/materials')) return [{ id: 20, title: 'Guía', description: 'Texto del profesor', originalName: 'guia.pdf' }];
      if (url.includes('/posts?')) return { posts: [{ id: 1, text: 'Mi respuesta', authorName: 'Pedro', authorRole: 'student' }], total: 1 };
      return { canTeach, canCreateForum: canTeach, canParticipate: true, assignments: [], forums: [], materials: [{ id: 20, title: 'Guía', description: 'Texto del profesor', originalName: 'guia.pdf' }], settings: {} };
    }, ...props,
  } });
  return { wrapper, requests };
}

test('foros section hands navigation off to CourseForum via change-section', async () => {
  const { wrapper } = setup({ initialSection: 'foros' });
  await flushPromises();
  assert.match(wrapper.text(), /Abriendo foros|Ir a foros/);
  assert.ok((wrapper.emitted('change-section') || []).some((args) => args[0] === 'foros'));
  wrapper.unmount();
});

test('students can read materials but cannot edit or delete publications', async () => {
  const { wrapper } = setup({ initialSection: 'archivos', user: { role: 'student' } });
  await flushPromises();
  assert.match(wrapper.text(), /Texto del profesor/);
  const actions = wrapper.get('.publication-actions').text();
  assert.match(actions, /Descargar/);
  assert.doesNotMatch(actions, /Editar|Eliminar/);
  assert.equal(wrapper.find('.create-panel').exists(), false);
  wrapper.unmount();
});

test('teacher opens material editor with existing text and optional attachment', async () => {
  const { wrapper } = setup({ initialSection: 'archivos' });
  await flushPromises();
  const edit = wrapper.findAll('.publication-actions button').find(button => button.text() === 'Editar');
  await edit.trigger('click');
  assert.equal(wrapper.get('.create-panel textarea').element.value, 'Texto del profesor');
  assert.equal(wrapper.get('input[type=file]').element.required, false);
  assert.match(wrapper.get('.create-panel').text(), /Guardar cambios/);
  wrapper.unmount();
});
