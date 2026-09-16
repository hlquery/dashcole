import fs from 'node:fs';
import { safeUploadPath } from '../uploads.js';

const ROLE_SIGNATURE_LABEL = {
  super_admin: 'Super administrador/a',
  school_admin: 'Administrador/a del establecimiento',
  director: 'Director/a del establecimiento',
  manager: 'Manager / Coordinación académica',
  utp: 'Jefe/a de UTP',
  monitor: 'Monitor/a',
  finance: 'Encargado/a de finanzas',
  agente_finanzas: 'Encargado/a de finanzas',
};

/** Absolute path to the user's profile signature image, or empty if missing/unreadable. */
export function signatureImagePath(user) {
  const key = String(user?.signatureKey || user?.signature_key || '').trim();
  if (!key) return '';
  try {
    const fullPath = safeUploadPath(key);
    if (fs.existsSync(fullPath)) return fullPath;
  } catch {
    /* clave inválida o fuera de UPLOAD_DIR */
  }
  return '';
}

/** Slot for finance/school drawSignatures: label, printed name, optional image. */
export function pdfSignerSlot(user, { label } = {}) {
  return {
    label: label || ROLE_SIGNATURE_LABEL[user?.role] || 'Responsable',
    signerName: String(user?.fullName || '').trim(),
    imagePath: signatureImagePath(user),
  };
}

/**
 * Puts the exporter signature on the first slot (or merges into a role-matching slot).
 * Remaining labels stay as blank institutional lines.
 */
export function signatureSlotsForExport(user, institutionalLabels = []) {
  const exporter = pdfSignerSlot(user);
  const labels = institutionalLabels.length
    ? institutionalLabels
    : ['Director/a del establecimiento', 'Secretaría / Administración'];
  const matchIndex = labels.findIndex((label) => {
    const text = String(label || '').toLowerCase();
    if (['director', 'school_admin', 'super_admin'].includes(user?.role)) {
      return text.includes('director') || text.includes('administrador');
    }
    if (['finance', 'agente_finanzas'].includes(user?.role)) {
      return text.includes('finanz');
    }
    if (user?.role === 'utp') return text.includes('utp');
    return false;
  });
  const index = matchIndex >= 0 ? matchIndex : 0;
  return labels.map((label, i) => (
    i === index
      ? { ...exporter, label: exporter.label || label }
      : { label }
  ));
}
