import { download } from './client.js';
export const reports = {
  finance: (year, section = 'all') => download(`/finance/export?${new URLSearchParams({ year, section })}`),
  accountability: year => download(`/finance/accountability/export?${new URLSearchParams({ year })}`),
};
