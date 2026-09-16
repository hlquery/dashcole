import { request } from './client.js';
export const auth = {
  me: () => request('/auth/me'),
  login: body => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: body => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  demoResetStatus: () => request('/public/demo-reset'),
  resetDemo: body => request('/public/demo-reset', {
    method: 'POST',
    body: JSON.stringify(body),
    timeoutMs: 10 * 60 * 1000,
  }),
};
