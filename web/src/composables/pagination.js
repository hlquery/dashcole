import { computed, nextTick, ref, unref, watch } from 'vue';

/** Google-style page list: 1 2 3 … 10 or 1 … 4 5 6 … 20 (max ~10 slots). */
export function pageWindow(current, total, maxVisible = 10) {
  const tot = Math.max(1, Number(total) || 1);
  const cur = Math.min(Math.max(1, Number(current) || 1), tot);
  if (tot <= maxVisible) return Array.from({ length: tot }, (_, i) => i + 1);

  const inner = Math.max(1, maxVisible - 4);
  let start = Math.max(2, cur - Math.floor(inner / 2));
  let end = Math.min(tot - 1, start + inner - 1);
  start = Math.max(2, end - inner + 1);

  const items = [1];
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < tot - 1) items.push('…');
  items.push(tot);
  return items;
}

/** Client-side pager for in-memory table rows. */
export function useClientPagination(source, options = {}) {
  const pageSize = Number(options.pageSize) > 0 ? Number(options.pageSize) : 15;
  const page = ref(1);
  const items = computed(() => {
    const value = unref(source);
    return Array.isArray(value) ? value : [];
  });
  const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)));
  const paged = computed(() => {
    const start = (page.value - 1) * pageSize;
    return items.value.slice(start, start + pageSize);
  });
  const rangeLabel = computed(() => {
    if (!items.value.length) return '0 resultados';
    const from = (page.value - 1) * pageSize + 1;
    const to = Math.min(items.value.length, page.value * pageSize);
    return `${from}–${to} de ${items.value.length}`;
  });
  const show = computed(() => items.value.length > pageSize);
  const pages = computed(() => pageWindow(page.value, pageCount.value));

  function goTo(target) {
    const next = Math.min(pageCount.value, Math.max(1, Number(target) || 1));
    page.value = next;
  }

  function goPrev() {
    goTo(page.value - 1);
  }

  function goNext() {
    goTo(page.value + 1);
  }

  function reset() {
    page.value = 1;
  }

  // Defer watches until after the caller's <script setup> finishes initializing.
  // Watching pageCount eagerly evaluates `source`; if that computed closes over a
  // later `const` (e.g. normalizeSearch), we hit "Cannot access before initialization".
  nextTick(() => {
    watch(pageCount, (count) => {
      if (page.value > count) page.value = count;
    });

    if (options.resetOn) {
      const deps = Array.isArray(options.resetOn) ? options.resetOn : [options.resetOn];
      watch(deps, reset);
    }
  });

  return {
    page,
    pageSize,
    pageCount,
    pages,
    paged,
    rangeLabel,
    show,
    goTo,
    goPrev,
    goNext,
    reset,
  };
}
