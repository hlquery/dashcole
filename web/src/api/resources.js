import { request, download } from './client.js';
export function resource(path) {
  return {
    list: (query = {}, options = {}) => request(`${path}?${new URLSearchParams(query)}`, options),
    get: (id, options) => request(`${path}/${id}`, options),
    create: body => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    update: (id, body) => request(`${path}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: id => request(`${path}/${id}`, { method: 'DELETE' }),
    download: id => download(`${path}/${id}/download`),
  };
}
