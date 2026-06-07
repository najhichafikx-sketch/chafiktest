const KEYS = {
  visitor: 'chafik_ads_visitor',
  session: 'chafik_ads_session',
  lastPop: 'chafik_ads_lastpop',
  lastSocial: 'chafik_ads_lastsocial',
  lastBanner: 'chafik_ads_lastbanner',
  interactions: 'chafik_ads_interactions',
  bounces: 'chafik_ads_bounces',
  geo: 'chafik_ads_geo',
  variant: 'chafik_ads_variant',
  pageEnter: 'chafik_ads_page_enter',
  sessionAds: 'chafik_ads_session_count',
  reduction: 'chafik_ads_reduction_until'
};

function safeWindow() {
  return typeof window !== 'undefined';
}

function makeVisitorId() {
  return 'v-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
}

function makeSessionId() {
  return 's-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
}

export const Storage = {
  KEYS,

  get(key, defaultValue = null) {
    if (!safeWindow()) return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'value' in parsed && 'exp' in parsed) {
        if (parsed.exp && parsed.exp < Date.now()) {
          window.localStorage.removeItem(key);
          return defaultValue;
        }
        return parsed.value;
      }
      return parsed;
    } catch {
      return defaultValue;
    }
  },

  set(key, value, ttlMs = null) {
    if (!safeWindow()) return;
    try {
      const payload = ttlMs ? { value, exp: Date.now() + ttlMs } : value;
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {}
  },

  remove(key) {
    if (!safeWindow()) return;
    try { window.localStorage.removeItem(key); } catch {}
  },

  session: {
    get(key, defaultValue = null) {
      if (!safeWindow()) return defaultValue;
      try {
        const raw = window.sessionStorage.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
      } catch { return defaultValue; }
    },
    set(key, value) {
      if (!safeWindow()) return;
      try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
    remove(key) {
      if (!safeWindow()) return;
      try { window.sessionStorage.removeItem(key); } catch {}
    }
  },

  cookie: {
    get(name) {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    },
    set(name, value, days = 30) {
      if (typeof document === 'undefined') return;
      const exp = new Date(Date.now() + days * 86400000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
    }
  },

  getVisitorId() {
    let id = Storage.get(KEYS.visitor);
    if (!id) {
      id = makeVisitorId();
      Storage.set(KEYS.visitor, id, 365 * 86400000);
    }
    return id;
  },

  getSessionId() {
    let id = Storage.session.get(KEYS.session);
    if (!id) {
      id = makeSessionId();
      Storage.session.set(KEYS.session, id);
    }
    return id;
  },

  getOrSetPageEnter() {
    let ts = Storage.session.get(KEYS.pageEnter);
    if (!ts) {
      ts = Date.now();
      Storage.session.set(KEYS.pageEnter, ts);
    }
    return ts;
  },

  incrementInteractions() {
    const n = (Storage.get(KEYS.interactions, 0) || 0) + 1;
    Storage.set(KEYS.interactions, n, 86400000);
    return n;
  },

  getInteractions() {
    return Storage.get(KEYS.interactions, 0) || 0;
  },

  incrementSessionAds() {
    const n = (Storage.session.get(KEYS.sessionAds) || 0) + 1;
    Storage.session.set(KEYS.sessionAds, n);
    return n;
  },

  getSessionAds() {
    return Storage.session.get(KEYS.sessionAds) || 0;
  },

  resetSessionAds() {
    Storage.session.set(KEYS.sessionAds, 0);
  },

  recordBounce() {
    const n = (Storage.get(KEYS.bounces, 0) || 0) + 1;
    Storage.set(KEYS.bounces, n, 7 * 86400000);
  },

  getBounces() {
    return Storage.get(KEYS.bounces, 0) || 0;
  },

  getLastAdTime(slot) {
    return Storage.get(slot, 0) || 0;
  },

  setLastAdTime(slot) {
    Storage.set(slot, Date.now(), 86400000);
  },

  getReductionUntil() {
    return Storage.get(KEYS.reduction, 0) || 0;
  },

  setReductionUntil(ts) {
    Storage.set(KEYS.reduction, ts, 7 * 86400000);
  },

  isReductionActive() {
    return Date.now() < Storage.getReductionUntil();
  }
};

export default Storage;
