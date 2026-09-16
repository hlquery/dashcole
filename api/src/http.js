import crypto from 'node:crypto';

export class ApiError extends Error {
  constructor(status, code, message, details = {}) {
    super(message); Object.assign(this, { status, code, details });
  }
}
const codes = { 400: 'VALIDATION_ERROR', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'FILE_TOO_LARGE', 423: 'READ_ONLY', 429: 'RATE_LIMITED', 500: 'INTERNAL_ERROR', 503: 'SERVICE_UNAVAILABLE' };
export function apiContract(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.set('X-Request-Id', req.requestId);
  res.vary('Accept');
  const normalized = req.get('Accept')?.includes('application/vnd.dashcole.v1+json');
  const json = res.json.bind(res);
  let finalizingError = false;
  res.json = value => {
    if (res.statusCode >= 400) {
      const rawError = value?.error;
      const message = typeof rawError === 'string'
        ? rawError
        : (rawError?.message || value?.message || 'No pudimos completar la solicitud.');
      const code = (typeof rawError === 'object' && rawError?.code) || codes[res.statusCode] || 'REQUEST_FAILED';
      const details = (typeof rawError === 'object' && rawError?.details) || value?.details || {};
      const error = { code, message, details, requestId: req.requestId };
      return json({ error, ...(!normalized ? { message: error.message } : {}) });
    }
    return json(normalized && !(value && Object.hasOwn(value, 'data') && Object.hasOwn(value, 'meta')) ? { data: value, meta: {} } : value);
  };
  const end = res.end.bind(res);
  res.end = (chunk, encoding, callback) => {
    const empty = chunk === undefined || chunk === null || chunk === '';
    if (empty && res.statusCode >= 400 && !res.headersSent && !finalizingError) {
      finalizingError = true;
      // Escribir el cuerpo directo con end() — no llamar json()/send() (recursión end↔json).
      const message = codes[res.statusCode] === 'NOT_FOUND'
        ? 'Recurso no encontrado.'
        : 'No pudimos completar la solicitud.';
      const payload = JSON.stringify({
        error: {
          code: codes[res.statusCode] || 'REQUEST_FAILED',
          message,
          details: {},
          requestId: req.requestId,
        },
        ...(!normalized ? { message } : {}),
      });
      if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return end(payload, encoding, callback);
    }
    return end(chunk, encoding, callback);
  };
  next();
}
export function apiErrorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let code = error.code;
  let message = error.message;
  if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY' || code === 'ER_DUP_ENTRY') {
    status = 409; code = 'CONFLICT'; message = 'Ya existe un registro con esos datos.';
  } else if (error.name === 'MulterError') {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400; code = codes[status]; message = 'Revisa el tamaño y la cantidad de archivos.';
  } else if (error.name === 'SequelizeValidationError' || error.type === 'entity.parse.failed') {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Revisa los datos enviados.';
  } else if (error.code === 'ENOENT') {
    status = 404; code = 'NOT_FOUND'; message = 'Archivo no encontrado.';
  }
  if (status >= 500 && !(error instanceof ApiError)) { console.error(`[${req.requestId}]`, error); message = 'Ocurrió un error inesperado.'; code = codes[status] || 'INTERNAL_ERROR'; }
  res.status(status).json({ error: { code: code || codes[status], message, details: status < 500 ? error.details || {} : {} } });
}
