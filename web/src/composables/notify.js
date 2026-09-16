import { inject } from 'vue';

export const NOTIFY_KEY = 'dashcoleNotify';

export function useNotify() {
  const notify = inject(NOTIFY_KEY, null);
  return (message, type = 'success') => {
    if (typeof notify === 'function') notify(message, type);
  };
}
