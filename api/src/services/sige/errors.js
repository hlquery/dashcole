import { ApiError } from '../../http.js';

export class SigeError extends ApiError {
  constructor(message, code = 'SIGE_ERROR', status = 502, details = undefined) {
    super(status, code, message, details);
    this.name = this.constructor.name;
  }
}

export class SigeNotConfiguredError extends SigeError {
  constructor(message = 'SIGE authentication provider has not been configured') { super(message, 'SIGE_NOT_CONFIGURED', 503); }
}
export class SigeAuthenticationError extends SigeError {
  constructor(message = 'No fue posible autenticar la integración SIGE.') { super(message, 'SIGE_AUTHENTICATION_ERROR', 502); }
}
export class SigeConnectionError extends SigeError {
  constructor(message = 'No fue posible conectar con SIGE.') { super(message, 'SIGE_CONNECTION_ERROR', 502); }
}
export class SigeValidationError extends SigeError {
  constructor(message = 'Los datos no cumplen los requisitos de sincronización.') { super(message, 'SIGE_VALIDATION_ERROR', 400); }
}
export class SigeRemoteError extends SigeError {
  constructor(message = 'SIGE rechazó la operación.') { super(message, 'SIGE_REMOTE_ERROR', 502); }
}
export class SigeConflictError extends SigeError {
  constructor(message = 'La información local y remota presenta un conflicto.', details) { super(message, 'SIGE_CONFLICT', 409, details); }
}
export class SigeRateLimitError extends SigeError {
  constructor(message = 'SIGE limitó temporalmente las solicitudes.') { super(message, 'SIGE_RATE_LIMIT', 429); }
}
