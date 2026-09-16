import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { ApiError } from './http.js';

export const uploadRoot = path.resolve(process.env.UPLOAD_DIR || new URL('../uploads', import.meta.url).pathname);
export const UPLOAD_CATEGORIES = Object.freeze(['avatars', 'files']);

const formats = {
  '.pdf': ['application/pdf'], '.png': ['image/png'], '.jpg': ['image/jpeg'], '.jpeg': ['image/jpeg'],
  '.doc': ['application/msword'], '.xls': ['application/vnd.ms-excel'], '.ppt': ['application/vnd.ms-powerpoint'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

/** Avatars and school logos live under uploads/avatars; everything else under uploads/files. */
export function uploadCategory(basename) {
  return /^(avatar-|logo-)/.test(String(basename || '')) ? 'avatars' : 'files';
}

function assertSafeBasename(name) {
  if (!name || name !== path.basename(name) || name === '.' || name === '..') {
    throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
  }
}

function assertTenantSegment(segment) {
  if (!/^tenant-\d+$/.test(segment)) throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
}

/**
 * Accepted logical keys (stored in DB):
 * - basename
 * - tenant-{id}/basename
 * - avatars|files/tenant-{id}/basename
 * - avatars|files/basename
 */
export function parseUploadKey(key) {
  if (typeof key !== 'string' || !key || key.includes('\\') || key.includes('\0')) {
    throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
  }
  const parts = key.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
  }

  if (parts.length === 1) {
    assertSafeBasename(parts[0]);
    return { category: uploadCategory(parts[0]), tenant: null, basename: parts[0] };
  }

  if (parts.length === 2) {
    if (UPLOAD_CATEGORIES.includes(parts[0])) {
      assertSafeBasename(parts[1]);
      return { category: parts[0], tenant: null, basename: parts[1] };
    }
    assertTenantSegment(parts[0]);
    assertSafeBasename(parts[1]);
    return { category: uploadCategory(parts[1]), tenant: parts[0], basename: parts[1] };
  }

  if (parts.length === 3 && UPLOAD_CATEGORIES.includes(parts[0])) {
    assertTenantSegment(parts[1]);
    assertSafeBasename(parts[2]);
    return { category: parts[0], tenant: parts[1], basename: parts[2] };
  }

  throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
}

export function safeUploadPath(key) {
  const { category, tenant, basename } = parseUploadKey(key);
  return tenant
    ? path.join(uploadRoot, category, tenant, basename)
    : path.join(uploadRoot, category, basename);
}

/** Logical key kept in DB (stable). Physical path is resolved via safeUploadPath. */
export function tenantUploadKey(schoolId, key) {
  const id = Number(schoolId);
  if (!Number.isSafeInteger(id) || id < 1 || key !== path.basename(key)) {
    throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
  }
  return `tenant-${id}/${key}`;
}

export function tenantCategoryDir(schoolId, category = 'files') {
  const id = Number(schoolId);
  if (!Number.isSafeInteger(id) || id < 1 || !UPLOAD_CATEGORIES.includes(category)) {
    throw new ApiError(400, 'INVALID_FILE_KEY', 'Archivo inválido.');
  }
  return path.join(uploadRoot, category, `tenant-${id}`);
}

export async function persistUpload(key, data, save) {
  const filename = safeUploadPath(key);
  await fs.mkdir(path.dirname(filename), { recursive: true });
  try {
    await fs.writeFile(filename, data, { flag: 'wx' });
  } catch (error) {
    // An existing key belongs to another upload and must never be removed.
    if (error.code !== 'EEXIST') await fs.unlink(filename).catch(() => {});
    throw error;
  }
  try {
    return await save();
  } catch (error) {
    await fs.unlink(filename).catch(() => {});
    throw error;
  }
}

export function validateFile(file, extensions = Object.keys(formats)) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (file.originalname.length > 255 || !extensions.includes(extension) || !(formats[extension]?.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) throw new ApiError(400, 'INVALID_FILE_TYPE', 'Formato no permitido. Usa un archivo PDF, Office o imagen compatible.');
}

export function createUpload({ kind = 'document', disk = false } = {}) {
  const extensions = kind === 'avatar' ? ['.png', '.jpg', '.jpeg'] : kind === 'material' ? ['.pdf', '.ppt', '.pptx'] : kind === 'invoice' ? ['.pdf', '.png', '.jpg', '.jpeg'] : Object.keys(formats);
  const upload = multer({
    storage: disk ? multer.diskStorage({
      destination: async (req, file, callback) => {
        try {
          const basename = `${kind}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
          file.__uploadBasename = basename;
          const destination = req.user?.schoolId
            ? tenantCategoryDir(req.user.schoolId, uploadCategory(basename))
            : path.join(uploadRoot, uploadCategory(basename));
          await fs.mkdir(destination, { recursive: true });
          callback(null, destination);
        } catch (error) {
          callback(error);
        }
      },
      filename: (_req, file, callback) => callback(null, file.__uploadBasename || `${kind}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }) : multer.memoryStorage(),
    limits: { fileSize: (kind === 'avatar' ? 5 : 25) * 1024 * 1024, files: 1, fields: 30, fieldSize: 100 * 1024 },
    fileFilter: (_req, file, callback) => { try { validateFile(file, extensions); callback(null, true); } catch (error) { callback(error); } },
  });
  return { single: field => (req, res, next) => upload.single(field)(req, res, async error => {
    if (error || !req.file) return next(error);
    try {
      const buffer = req.file.buffer || await fs.readFile(req.file.path);
      validateFileContent(req.file.originalname, buffer);
      req.file.mimetype = formats[path.extname(req.file.originalname).toLowerCase()][0];
      if (disk && req.user?.schoolId) req.file.filename = tenantUploadKey(req.user.schoolId, path.basename(req.file.filename));
      next();
    } catch (error) { next(error); }
  }) };

}

// Disk uploads that fail validation or persistence never become permanent orphans.
export function cleanupFailedUpload(req, res, next) {
  let cleaned = false;
  const cleanup = () => {
    if (cleaned || req.uploadCommitted || !req.file?.path) return;
    if (res.statusCode >= 400 || !res.writableFinished) {
      cleaned = true;
      fs.unlink(req.file.path).catch(error => { if (error.code !== 'ENOENT') console.warn('Upload cleanup:', error.message); });
    }
  };
  res.on('finish', cleanup); res.on('close', cleanup); next();
}

export function validateFileContent(name, buffer) {
  const extension = path.extname(name).toLowerCase();
  const starts = bytes => buffer.subarray(0, bytes.length).equals(Buffer.from(bytes));
  const valid = extension === '.pdf' ? starts([37, 80, 68, 70, 45])
    : extension === '.png' ? starts([137, 80, 78, 71, 13, 10, 26, 10])
    : ['.jpg', '.jpeg'].includes(extension) ? starts([255, 216, 255])
    : ['.docx', '.xlsx', '.pptx'].includes(extension) ? starts([80, 75, 3, 4])
    : ['.doc', '.xls', '.ppt'].includes(extension) && starts([208, 207, 17, 224, 161, 177, 26, 225]);
  if (!valid) throw new ApiError(400, 'INVALID_FILE_CONTENT', 'El contenido no coincide con el formato del archivo.');
}

async function moveIfExists(from, to) {
  try {
    await fs.access(from);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  await fs.mkdir(path.dirname(to), { recursive: true });
  try {
    await fs.rename(from, to);
  } catch (error) {
    if (error.code !== 'EEXIST' && error.code !== 'EXDEV') throw error;
    await fs.cp(from, to, { recursive: false, errorOnExist: true });
    await fs.unlink(from);
  }
  return true;
}

async function removeEmptyDir(dir) {
  try {
    await fs.rmdir(dir);
  } catch {
    /* still has files or missing */
  }
}

/**
 * One-shot layout migration for existing installs:
 *   uploads/tenant-N/*  → uploads/{avatars|files}/tenant-N/*
 *   uploads/*           → uploads/{avatars|files}/*
 * Idempotent; skips already-organized trees.
 */
export async function migrateUploadLayout(root = uploadRoot) {
  let moved = 0;
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.join(root, 'avatars'), { recursive: true });
      await fs.mkdir(path.join(root, 'files'), { recursive: true });
      return { moved: 0 };
    }
    throw error;
  }

  for (const entry of entries) {
    if (UPLOAD_CATEGORIES.includes(entry.name)) continue;
    const source = path.join(root, entry.name);

    if (entry.isDirectory() && /^tenant-\d+$/.test(entry.name)) {
      const files = await fs.readdir(source, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile()) continue;
        const from = path.join(source, file.name);
        const to = path.join(root, uploadCategory(file.name), entry.name, file.name);
        if (await moveIfExists(from, to)) moved += 1;
      }
      await removeEmptyDir(source);
      continue;
    }

    if (entry.isFile()) {
      const to = path.join(root, uploadCategory(entry.name), entry.name);
      if (await moveIfExists(source, to)) moved += 1;
    }
  }

  await fs.mkdir(path.join(root, 'avatars'), { recursive: true });
  await fs.mkdir(path.join(root, 'files'), { recursive: true });
  return { moved };
}
