import geoip from 'geoip-country';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function normalizeIp(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('::ffff:')) return raw.slice(7);
  if (raw.startsWith('[') && raw.endsWith(']')) return raw.slice(1, -1);
  return raw;
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '0.0.0.0' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')) return true;
  return false;
}

function flagEmoji(countryCode) {
  const code = String(countryCode || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function lookupIpCountry(value) {
  const ip = normalizeIp(value);
  if (!ip) return null;
  if (isPrivateIp(ip)) {
    return {
      ip,
      countryCode: null,
      country: 'Red local',
      flag: '',
      private: true,
    };
  }
  let hit = null;
  try {
    hit = geoip.lookup(ip);
  } catch {
    hit = null;
  }
  const countryCode = hit?.country ? String(hit.country).toUpperCase() : null;
  if (!countryCode) {
    return {
      ip,
      countryCode: null,
      country: null,
      flag: '',
      private: false,
    };
  }
  const country = regionNames.of(countryCode) || hit.name || countryCode;
  return {
    ip,
    countryCode,
    country,
    flag: flagEmoji(countryCode),
    private: false,
  };
}

export function attachIpGeo(target, ip = target?.ip) {
  const geo = lookupIpCountry(ip);
  if (!target || typeof target !== 'object') return geo;
  target.countryCode = geo?.countryCode || null;
  target.country = geo?.country || null;
  target.flag = geo?.flag || '';
  return target;
}
