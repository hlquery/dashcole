import { request } from './client.js';
import { resource } from './resources.js';
export const invoices = resource('/finance/invoices');
export const accountability = resource('/finance/accountability');
export const finance = { list: year => request(`/modules/finance?year=${encodeURIComponent(year)}`) };
