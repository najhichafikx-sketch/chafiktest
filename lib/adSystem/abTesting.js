import { ADS_CONFIG } from './adsConfig';
import { Storage } from './storage';

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

export const ABTesting = {
  enabled() {
    return ADS_CONFIG.abTesting.enabled && ADS_CONFIG.abTesting.variants.length > 0;
  },

  getVariant(visitorId = null) {
    if (!ABTesting.enabled()) {
      return ADS_CONFIG.abTesting.variants[0] || { id: 'control', weight: 100 };
    }
    const vid = visitorId || Storage.getVisitorId();
    const cached = Storage.get('chafik_ads_variant', null);
    if (cached && cached.visitorId === vid) return cached.variant;

    const variants = ADS_CONFIG.abTesting.variants;
    const total = variants.reduce((s, v) => s + (v.weight || 0), 0);
    const bucket = (hashString(vid) % 1000) / 1000 * total;

    let acc = 0;
    let selected = variants[0];
    for (const v of variants) {
      acc += v.weight || 0;
      if (bucket < acc) { selected = v; break; }
    }

    Storage.set('chafik_ads_variant', { visitorId: vid, variant: selected }, 30 * 86400000);
    return selected;
  },

  applyOverlay(variantId, baseConfig) {
    const overlay = {
      aggressive: {
        frequency: { popunderHours: 2 },
        probability: { popunderOnInteraction: 0.95, socialBarOnScroll: 0.95 },
        geo: { premiumBoost: 1.8 }
      },
      conservative: {
        frequency: { popunderHours: 6 },
        probability: { popunderOnInteraction: 0.55, socialBarOnScroll: 0.55 },
        timing: { newUserGraceSeconds: 60 }
      },
      smart_geo: {
        geo: { premiumBoost: 2.0, standardBoost: 0.8 },
        probability: { popunderOnInteraction: 0.85 }
      },
      control: {}
    };

    const ov = overlay[variantId] || {};
    const out = JSON.parse(JSON.stringify(baseConfig));
    for (const k of Object.keys(ov)) {
      out[k] = { ...(out[k] || {}), ...ov[k] };
    }
    return out;
  }
};

export default ABTesting;
