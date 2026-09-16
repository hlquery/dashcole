import { defineComponent, h, ref, onMounted, onBeforeUnmount, nextTick, watch, useId } from 'vue';
import { formatCell } from '../../design/format.js';
import { pageWindow } from '../../composables/pagination.js';
const box = (name, tag, className, defaults = {}) => defineComponent({ name, setup(_, { slots, attrs }) { return () => h(tag, { ...defaults, ...attrs, class: [className, attrs.class] }, slots.default?.()); } });
export const AppShell = box('AppShell', 'div', 'app-shell');
export const Topbar = box('Topbar', 'header', 'topbar');
export const PageHeader = box('PageHeader', 'header', 'page-heading');
export const PageActions = box('PageActions', 'div', 'heading-actions');
export const FilterBar = box('FilterBar', 'div', 'filter-bar', { role: 'search', 'aria-label': 'Filtros' });
export const FormSection = box('FormSection', 'fieldset', 'form-section');
export const EmptyState = box('EmptyState', 'div', 'empty-state', { role: 'status' });
export const ErrorState = defineComponent({ name: 'ErrorState', emits: ['retry'], setup(_, { slots, attrs, emit }) { return () => h('div', { ...attrs, class: ['error-banner', attrs.class], role: 'alert' }, [h('span', slots.default?.()), attrs.onRetry ? h('button', { type: 'button', onClick: () => emit('retry') }, 'Reintentar') : null]); } });
export const Skeleton = box('Skeleton', 'div', 'skeleton', { role: 'status', 'aria-label': 'Cargando datos', 'aria-busy': 'true' });
export const Toast = box('Toast', 'div', 'toast', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
export const StatusBadge = defineComponent({ name: 'StatusBadge', props: ['value'], setup(props) { return () => h('span', { class: ['status-badge', `status-${props.value}`] }, formatCell('status', props.value)); } });
export const SearchInput = defineComponent({ name: 'SearchInput', props: { modelValue: String, label: { default: 'Buscar' }, placeholder: String }, emits: ['update:modelValue'], setup(props, { emit }) { return () => h('label', { class: 'field search-input' }, [h('span', props.label), h('input', { type: 'search', value: props.modelValue, placeholder: props.placeholder, onInput: e => emit('update:modelValue', e.target.value) })]); } });
export const StatCard = defineComponent({
  name: 'StatCard',
  props: {
    label: String,
    value: [String, Number],
    selected: Boolean,
    hint: { type: String, default: '' },
    icon: { type: [Object, Function], default: null },
    tone: { type: String, default: '' },
  },
  emits: ['select'],
  setup(props, { emit }) {
    return () => h('button', {
      type: 'button',
      class: [
        'stat-card',
        'attention-card',
        props.tone ? `attention-${props.tone}` : null,
        {
          selected: props.selected,
          empty: Number(props.value) === 0,
        },
      ],
      'aria-pressed': !!props.selected,
      onClick: () => emit('select'),
    }, [
      h('span', { class: 'attention-card-glow', 'aria-hidden': 'true' }),
      h('span', { class: 'attention-card-orb attention-card-orb--a', 'aria-hidden': 'true' }),
      h('span', { class: 'attention-card-orb attention-card-orb--b', 'aria-hidden': 'true' }),
      h('div', { class: 'attention-card-top' }, [
        props.icon
          ? h('span', { class: 'attention-card-icon', 'aria-hidden': 'true' }, [h(props.icon, { size: 15 })])
          : null,
        h('span', { class: 'attention-card-label' }, props.label),
      ]),
      h('strong', { class: 'attention-card-value' }, props.value ?? 0),
      props.hint ? h('small', { class: 'attention-card-hint' }, props.hint) : null,
    ]);
  },
});
export const DataTable = defineComponent({
  name: 'DataTable',
  inheritAttrs: false,
  props: {
    rows: Array,
    columns: Array,
    caption: { default: 'Registros' },
    sortable: { type: Boolean, default: false },
    sortBy: { type: String, default: '' },
    sortDir: { type: String, default: 'ASC' },
    rowClickable: { type: Boolean, default: false },
  },
  emits: ['sort', 'row-click'],
  setup(props, { slots, attrs, emit }) {
    const toggleSort = (key, event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (!props.sortable || !key) return;
      const currentDir = String(props.sortDir || 'ASC').toUpperCase();
      const dir = props.sortBy === key && currentDir === 'ASC' ? 'DESC' : 'ASC';
      emit('sort', { key, dir });
    };
    const onRowActivate = (row, event) => {
      if (!props.rowClickable) return;
      if (event?.target?.closest?.('button, a, input, select, textarea, label')) return;
      emit('row-click', row);
    };
    return () => h('div', { class: ['data-table-scroll', attrs.class], role: 'region', 'aria-label': props.caption }, [
      h('table', [
        h('caption', { class: 'sr-only' }, props.caption),
        ...(props.columns ? [
          h('thead', [
            h('tr', props.columns.map((c) => {
              const canSort = props.sortable && c.key && c.sortable !== false;
              const active = canSort && props.sortBy === c.key;
              const dir = String(props.sortDir || 'ASC').toUpperCase();
              if (!canSort) return h('th', { scope: 'col', key: c.key || c.label }, c.label);
              return h('th', {
                scope: 'col',
                key: c.key,
                class: ['sortable-th', { active, asc: active && dir === 'ASC', desc: active && dir === 'DESC' }],
                'aria-sort': active ? (dir === 'DESC' ? 'descending' : 'ascending') : 'none',
              }, [
                h('button', {
                  type: 'button',
                  class: 'sortable-th-button',
                  onClick: (event) => toggleSort(c.key, event),
                }, [
                  h('span', c.label),
                  h('span', { class: 'sort-indicator', 'aria-hidden': 'true' }, [
                    h('i', { class: 'sort-bar sort-bar-up sort-arrow sort-arrow-up' }),
                    h('i', { class: 'sort-bar sort-bar-down sort-arrow sort-arrow-down' }),
                  ]),
                ]),
              ]);
            })),
          ]),
          h('tbody', (props.rows || []).map((row) => h('tr', {
            key: row.id ?? row.student_id ?? JSON.stringify(row),
            class: props.rowClickable ? 'clickable-row' : undefined,
            tabindex: props.rowClickable ? 0 : undefined,
            role: props.rowClickable ? 'link' : undefined,
            onClick: props.rowClickable ? (event) => onRowActivate(row, event) : undefined,
            onKeydown: props.rowClickable ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRowActivate(row, event);
              }
            } : undefined,
          }, props.columns.map((c) => {
            const slotted = slots[`cell-${c.key}`]?.({ row, value: row[c.key] });
            return h('td', null, slotted == null || slotted === false ? formatCell(c.key, row[c.key]) : slotted);
          })))),
        ] : (slots.default?.() || [])),
      ]),
    ]);
  },
});
export const TablePagination = defineComponent({
  name: 'TablePagination',
  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    rangeLabel: { type: String, default: '' },
    show: { type: Boolean, default: undefined },
    maxVisible: { type: Number, default: 10 },
  },
  emits: ['goto', 'update:page'],
  setup(props, { emit, attrs }) {
    const go = (target) => {
      const total = Math.max(1, Number(props.pageCount) || 1);
      const next = Math.min(total, Math.max(1, Number(target) || 1));
      if (next === props.page) return;
      emit('update:page', next);
      emit('goto', next);
    };
    return () => {
      const visible = props.show === undefined ? props.pageCount > 1 : props.show;
      if (!visible) return null;
      const pages = pageWindow(props.page, props.pageCount, props.maxVisible);
      return h('nav', {
        class: ['google-pagination', attrs.class],
        'aria-label': 'Paginación',
      }, [
        props.rangeLabel
          ? h('span', { class: 'google-pagination-range' }, props.rangeLabel)
          : h('span', { class: 'google-pagination-range' }, `Página ${props.page} de ${props.pageCount}`),
        h('div', { class: 'google-pagination-controls' }, [
          h('button', {
            type: 'button',
            class: 'google-page-nav',
            disabled: props.page <= 1,
            'aria-label': 'Página anterior',
            onClick: () => go(props.page - 1),
          }, '<'),
          ...pages.map((item, idx) => h('button', {
            key: `${item}-${idx}`,
            type: 'button',
            class: [
              'google-page-num',
              item === props.page ? 'active' : '',
              item === '…' ? 'ellipsis' : '',
            ].filter(Boolean),
            disabled: item === '…',
            'aria-current': item === props.page ? 'page' : undefined,
            'aria-label': item === '…' ? 'Más páginas' : `Ir a la página ${item}`,
            onClick: () => item !== '…' && go(item),
          }, item)),
          h('button', {
            type: 'button',
            class: 'google-page-nav',
            disabled: props.page >= props.pageCount,
            'aria-label': 'Página siguiente',
            onClick: () => go(props.page + 1),
          }, '>'),
        ]),
      ]);
    };
  },
});
export const Breadcrumbs = defineComponent({ name: 'Breadcrumbs', props: ['items'], setup(props) { return () => h('nav', { class: 'breadcrumbs', 'aria-label': 'Ubicación' }, h('ol', props.items?.map((item, i) => h('li', item.href ? h('a', { href: item.href }, item.label) : h('span', { 'aria-current': i === props.items.length - 1 ? 'page' : undefined }, item.label))))); } });
export const Timeline = box('Timeline', 'ol', 'timeline');
export const Tabs = defineComponent({ name: 'Tabs', props: ['items', 'modelValue'], emits: ['update:modelValue'], setup(props, { emit }) { const activate = i => emit('update:modelValue', props.items[(i + props.items.length) % props.items.length].value); return () => h('div', { class: 'ui-tabs', role: 'tablist' }, props.items.map((item, i) => h('button', { type: 'button', role: 'tab', 'aria-selected': props.modelValue === item.value, tabindex: props.modelValue === item.value ? 0 : -1, onClick: () => activate(i), onKeydown: e => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const n = e.key === 'Home' ? 0 : e.key === 'End' ? props.items.length - 1 : i + (e.key === 'ArrowRight' ? 1 : -1); activate(n); nextTick(() => e.target.parentElement.querySelector('[aria-selected="true"]')?.focus()); } } }, item.label))); } });
export const ActionMenu = defineComponent({ name: 'ActionMenu', props: { label: { default: 'Más acciones' } }, setup(props, { slots }) { return () => h('details', { class: 'action-menu' }, [h('summary', props.label), h('div', slots.default?.())]); } });
function trap(root, close) {
  const previous = document.activeElement;
  const focusable = () => [...root.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
  const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } if (e.key === 'Tab') { const items = focusable(); const first = items[0] || root, last = items.at(-1) || root; if (!items.length || (e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); } } };
  const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
  root.addEventListener('keydown', key); (focusable()[0] || root).focus();
  return () => { root.removeEventListener('keydown', key); document.body.style.overflow = overflow; previous?.focus(); };
}
export const Modal = defineComponent({ name: 'Modal', props: { label: { default: 'Diálogo' } }, emits: ['close'], setup(props, { slots, attrs, emit }) { const root = ref(); const titleId = useId(); let release; onMounted(() => { const title = root.value.querySelector('h2'); if (title) { title.id ||= titleId; root.value.setAttribute('aria-labelledby', title.id); } release = trap(root.value, () => emit('close')); }); onBeforeUnmount(() => release?.()); return () => h('div', { ...attrs, ref: root, class: ['modal-wrap', attrs.class], role: 'dialog', 'aria-modal': 'true', 'aria-label': props.label, tabindex: -1, onMousedown: e => { if (e.target === e.currentTarget) emit('close'); } }, slots.default?.()); } });
export const Drawer = defineComponent({
  name: 'Drawer',
  props: ['open'],
  emits: ['close'],
  setup(props, { slots, attrs, emit }) {
    const root = ref();
    let release;
    const update = async () => {
      release?.();
      release = null;
      await nextTick();
      if (props.open && window.matchMedia('(max-width: 1100px)').matches) release = trap(root.value, () => emit('close'));
    };
    watch(() => props.open, update);
    onMounted(update);
    onBeforeUnmount(() => release?.());
    return () => h('aside', {
      ...attrs,
      ref: root,
      class: ['sidebar', { open: props.open }, attrs.class],
      'aria-label': 'Navegación principal',
      tabindex: -1,
    }, [
      h('button', {
        class: 'drawer-close icon-button',
        type: 'button',
        'aria-label': 'Cerrar menú',
        onClick: () => emit('close'),
      }, [
        h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '18',
          height: '18',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2.25',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        }, [
          h('path', { d: 'M18 6 6 18' }),
          h('path', { d: 'm6 6 12 12' }),
        ]),
      ]),
      slots.default?.(),
    ]);
  },
});
export const Sidebar = Drawer;
export const ConfirmDialog = defineComponent({
  name: 'ConfirmDialog',
  props: {
    message: { type: String, required: true },
    checkboxLabel: { type: String, default: '' },
    checkboxChecked: { type: Boolean, default: false },
  },
  emits: ['answer', 'update:checkboxChecked'],
  setup(props, { emit }) {
    return () => h(Modal, { label: 'Confirmar acción', onClose: () => emit('answer', false) }, {
      default: () => h('section', { class: 'modal confirm-dialog' }, [
        h('h2', 'Confirmar acción'),
        h('p', props.message),
        props.checkboxLabel
          ? h('label', { class: 'switch-field confirm-dialog-option' }, [
            h('input', {
              type: 'checkbox',
              checked: props.checkboxChecked,
              onChange: (event) => emit('update:checkboxChecked', event.target.checked),
            }),
            h('span', [
              h('i'),
              h('strong', props.checkboxLabel),
              h('small', 'Por defecto se conserva el acceso para historial o reactivación.'),
            ]),
          ])
          : null,
        h('div', { class: 'page-actions' }, [
          h('button', { type: 'button', class: 'secondary-button', onClick: () => emit('answer', false) }, 'Cancelar'),
          h('button', { type: 'button', class: 'primary-button', onClick: () => emit('answer', true) }, 'Confirmar'),
        ]),
      ]),
    });
  },
});
