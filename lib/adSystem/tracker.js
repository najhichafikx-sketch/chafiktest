import { ADS_CONFIG } from './adsConfig';
import { Storage } from './storage';

const queue = [];
let flushing = false;
let lastFlush = 0;
let flushTimer = null;

function deviceType() {
  if (typeof window === 'undefined') return 'unknown';
  return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
}

function safeSend(events) {
  if (typeof navigator === 'undefined') return;
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
      navigator.sendBeacon(ADS_CONFIG.tracking.endpoint, blob);
      return;
    } catch {}
  }
  try {
    fetch(ADS_CONFIG.tracking.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true
    }).catch(() => {});
  } catch {}
}

function shouldSample() {
  return Math.random() < ADS_CONFIG.tracking.sampleRate;
}

function scheduleFlush() {
  if (flushTimer) return;
  const interval = ADS_CONFIG.tracking.flushIntervalMs;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush(true);
  }, interval);
}

export const Tracker = {
  pageEnter(pageType, path) {
    if (!ADS_CONFIG.tracking.enabled) return;
    if (!shouldSample()) return;
    queue.push({
      type: 'page_enter',
      pageType,
      path,
      ts: Date.now(),
      visitorId: Storage.getVisitorId(),
      sessionId: Storage.getSessionId(),
      device: deviceType()
    });
    scheduleFlush();
  },

  impression(adType, slot, network, meta = {}) {
    if (!ADS_CONFIG.tracking.enabled) return;
    queue.push({
      type: 'impression',
      adType,
      slot,
      network,
      ts: Date.now(),
      visitorId: Storage.getVisitorId(),
      sessionId: Storage.getSessionId(),
      device: deviceType(),
      ...meta
    });
    scheduleFlush();
  },

  click(adType, slot, network, meta = {}) {
    if (!ADS_CONFIG.tracking.enabled) return;
    queue.push({
      type: 'click',
      adType,
      slot,
      network,
      ts: Date.now(),
      visitorId: Storage.getVisitorId(),
      sessionId: Storage.getSessionId(),
      device: deviceType(),
      ...meta
    });
    flush(true);
  },

  blocked(reason, context = {}) {
    if (!ADS_CONFIG.tracking.enabled) return;
    queue.push({
      type: 'blocked',
      reason,
      ts: Date.now(),
      visitorId: Storage.getVisitorId(),
      sessionId: Storage.getSessionId(),
      device: deviceType(),
      ...context
    });
    scheduleFlush();
  },

  conversion(action, value = 0, meta = {}) {
    if (!ADS_CONFIG.tracking.enabled) return;
    queue.push({
      type: 'conversion',
      action,
      value,
      ts: Date.now(),
      visitorId: Storage.getVisitorId(),
      sessionId: Storage.getSessionId(),
      ...meta
    });
    flush(true);
  },

  flush(force = false) {
    if (flushing) return;
    if (queue.length === 0) return;
    if (!force && Date.now() - lastFlush < 2000) return;
    flushing = true;
    const events = queue.splice(0, ADS_CONFIG.tracking.maxQueueSize);
    lastFlush = Date.now();
    safeSend(events);
    flushing = false;
    if (queue.length > 0) scheduleFlush();
  },

  onUnload() {
    if (typeof window === 'undefined') return;
    if (!ADS_CONFIG.tracking.sendBeaconOnUnload) return;
    window.addEventListener('pagehide', () => this.flush(true));
    window.addEventListener('beforeunload', () => this.flush(true));
  }
};

export default Tracker;
