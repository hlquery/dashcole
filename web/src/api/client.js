export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = {}, requestId } = {}) {
    super(message); this.name = 'ApiError'; Object.assign(this, { status, code, details, requestId });
  }
}

const LEGACY_PREFIX = 'nextedu_';
const STORAGE_PREFIX = 'dashcole_';

function readMigrated(key) {
  const current = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (current != null) return current;
  const legacy = localStorage.getItem(`${LEGACY_PREFIX}${key}`);
  if (legacy == null) return null;
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, legacy);
  localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
  return legacy;
}

function writeStorage(key, value) {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}

function clearStorage(key) {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}

export const session = {
  getToken: () => readMigrated('token'),
  setToken: (token) => writeStorage('token', token),
  clear: () => clearStorage('token'),
};

export function storageGet(key) {
  return readMigrated(key);
}

export function storageSet(key, value) {
  writeStorage(key, value);
}

export function storageRemove(key) {
  clearStorage(key);
}

export function sessionFlagGet(key) {
  const current = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (current != null) return current;
  const legacy = sessionStorage.getItem(`${LEGACY_PREFIX}${key}`);
  if (legacy == null) return null;
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, legacy);
  sessionStorage.removeItem(`${LEGACY_PREFIX}${key}`);
  return legacy;
}

export function sessionFlagSet(key, value) {
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  sessionStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}

export function sessionFlagRemove(key) {
  sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  sessionStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}

let onUnauthorized = () => session.clear();
export function configureSession(handler) { onUnauthorized = handler; }
export function createApiClient({ baseUrl = '/api', getToken = session.getToken, unauthorized = () => onUnauthorized(), fetchImpl = (...args) => fetch(...args), timeout = 30000 } = {}) {
  return async function request(path, options = {}) {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) throw new ApiError('Ruta API inválida.', { code: 'INVALID_PATH' });
    const { raw = false, envelope = false, signal, timeoutMs = timeout, ...init } = options;
    const controller = new AbortController();
    const cancel = () => controller.abort(signal.reason);
    if (signal?.aborted) cancel(); else signal?.addEventListener('abort', cancel, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const headers = new Headers(init.headers);
      if (!headers.has('Accept')) headers.set('Accept', 'application/vnd.dashcole.v1+json');
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
      const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}${path}`, { ...init, headers, signal: controller.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401 && path !== '/auth/login' && path !== '/auth/forgot-password' && path !== '/public/demo-reset' && !path.startsWith('/public/admissions')) unauthorized();
        throw new ApiError(payload.error?.message || payload.message || ({ 403: 'No tienes permiso para realizar esta acción.', 409: 'Los datos cambiaron o ya existe este registro.' }[response.status]) || 'No pudimos completar la solicitud.', { status: response.status, ...payload.error });
      }
      if (response.status === 204) return null;
      // Consume binary bodies under the same timeout/cancellation policy.
      if (raw) {
        const blob = await response.blob();
        return new Response(blob, { status: response.status, statusText: response.statusText, headers: response.headers });
      }
      let payload;
      try { payload = await response.json(); }
      catch (error) { if (controller.signal.aborted) throw error; throw new ApiError('La API devolvió una respuesta inválida.', { code: 'INVALID_RESPONSE' }); }
      return !envelope && payload && Object.hasOwn(payload, 'data') && Object.hasOwn(payload, 'meta') ? payload.data : payload;
    } catch (error) {
      if (timedOut) throw new ApiError('La solicitud tardó demasiado. Intenta nuevamente.', { code: 'TIMEOUT' });
      if (signal?.aborted) throw new DOMException('Solicitud cancelada.', 'AbortError');
      if (error instanceof ApiError) throw error;
      throw new ApiError('No pudimos conectar con el servidor.');
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort', cancel);
    }
  };
}
export const request = createApiClient({ baseUrl: import.meta.env?.VITE_API_URL || '/api' });
export const download = (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', '*/*');
  return request(path, { ...options, raw: true, headers });
};
export function latestRequest(loader) {
  let controller;
  return { cancel: () => controller?.abort(), run: (...args) => {
    controller?.abort(); controller = new AbortController();
    return loader(controller.signal, ...args);
  } };
}
