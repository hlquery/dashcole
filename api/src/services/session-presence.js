import { redis } from '../database.js';

const PRESENCE_KEY = 'dashcole:presence';
const SESSION_KEY_PREFIX = 'dashcole:session:';
/** Ventana para considerar a alguien “en línea ahora”. */
export const ONLINE_WITHIN_SEC = 15 * 60;
/** Alineado al TTL de sesión (12 h). */
export const PRESENCE_MAX_AGE_SEC = 60 * 60 * 12;

function sessionKey(token) {
  return `${SESSION_KEY_PREFIX}${token}`;
}

export async function touchPresence(token, at = Date.now()) {
  if (!redis.isReady || !token) return;
  await redis.zAdd(PRESENCE_KEY, [{ score: at / 1000, value: token }]);
}

export async function clearPresence(token) {
  if (!redis.isReady || !token) return;
  await redis.zRem(PRESENCE_KEY, token);
}

export async function clearPresenceMany(tokens = []) {
  if (!redis.isReady || !tokens.length) return;
  await redis.zRem(PRESENCE_KEY, tokens);
}

async function prunePresence(maxAgeSec = PRESENCE_MAX_AGE_SEC) {
  if (!redis.isReady) return 0;
  const cutoff = (Date.now() / 1000) - maxAgeSec;
  return redis.zRemRangeByScore(PRESENCE_KEY, '-inf', cutoff);
}

export async function countOnline({ withinSec = ONLINE_WITHIN_SEC } = {}) {
  if (!redis.isReady) return 0;
  await prunePresence();
  const min = (Date.now() / 1000) - withinSec;
  return redis.zCount(PRESENCE_KEY, min, '+inf');
}

/**
 * Lista sesiones realmente presentes en Redis (no registros demo de MySQL).
 * Devuelve filas enriquecidas desde el JSON de sesión + score de última actividad.
 */
export async function listOnline({ withinSec = ONLINE_WITHIN_SEC, limit = 200, schoolId = null } = {}) {
  if (!redis.isReady) return { total: 0, withinSec, rows: [] };
  await prunePresence();
  const nowSec = Date.now() / 1000;
  const min = nowSec - withinSec;
  const fetchCount = Math.max(1, Math.min(500, Number(schoolId) ? 500 : limit));
  // zRangeByScoreWithScores es el camino fiable: ZRANGE … BYSCORE REV exige max→min
  // y con (min, +inf) + REV node-redis/Redis puede devolver vacío.
  const scored = await redis.zRangeByScoreWithScores(PRESENCE_KEY, min, '+inf', {
    LIMIT: { offset: 0, count: fetchCount },
  });
  scored.reverse();

  const wantedSchool = Number.isSafeInteger(Number(schoolId)) && Number(schoolId) > 0 ? Number(schoolId) : null;
  const rows = [];
  for (const entry of scored) {
    const token = entry.value;
    const lastSeenAt = new Date(Number(entry.score) * 1000);
    const raw = await redis.get(sessionKey(token));
    if (!raw) {
      await redis.zRem(PRESENCE_KEY, token);
      continue;
    }
    let user;
    try { user = JSON.parse(raw); }
    catch {
      await redis.zRem(PRESENCE_KEY, token);
      continue;
    }
    if (wantedSchool && Number(user.schoolId) !== wantedSchool) continue;
    const school = Array.isArray(user.memberships)
      ? user.memberships.find(item => Number(item.schoolId) === Number(user.schoolId))?.school
      : null;
    rows.push({
      tokenHint: `${String(token).slice(0, 8)}…`,
      globalUserId: user.globalUserId || null,
      userId: user.id,
      fullName: user.fullName || 'Sin nombre',
      email: user.username || null,
      role: user.role || null,
      schoolId: user.schoolId || null,
      schoolName: school?.name || null,
      platformConsole: Boolean(user.platformConsole),
      lastSeenAt: lastSeenAt.toISOString(),
      secondsAgo: Math.max(0, Math.round(nowSec - Number(entry.score))),
    });
    if (rows.length >= limit) break;
  }

  return { total: rows.length, withinSec, schoolId: wantedSchool, rows };
}
