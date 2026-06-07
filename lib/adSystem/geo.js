import { ADS_CONFIG } from './adsConfig';
import { Storage } from './storage';

function tierFor(country) {
  if (!country) return 'standard';
  const c = String(country).toUpperCase();
  if (ADS_CONFIG.geo.premiumTier.includes(c)) return 'premium';
  if (ADS_CONFIG.geo.standardTier.includes(c)) return 'standard';
  if (ADS_CONFIG.geo.lowTier.includes(c)) return 'low';
  return 'standard';
}

function boostFor(tier) {
  if (tier === 'premium') return ADS_CONFIG.geo.premiumBoost;
  if (tier === 'low') return ADS_CONFIG.geo.lowBoost;
  return ADS_CONFIG.geo.standardBoost;
}

const memoryCache = { data: null, ts: 0 };

export const Geo = {
  tierFor,
  boostFor,

  async detect(force = false) {
    if (typeof window === 'undefined') return { country: null, tier: 'standard', boost: 1 };
    if (!force) {
      const cached = Storage.get('chafik_ads_geo', null);
      if (cached && cached.country) return cached;
      if (memoryCache.data && Date.now() - memoryCache.ts < 3600000) {
        return memoryCache.data;
      }
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(ADS_CONFIG.geo.apiEndpoint, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('geo fetch failed');
      const data = await res.json();
      const country = data.country_code || data.country || null;
      const tier = tierFor(country);
      const result = {
        country,
        tier,
        boost: boostFor(tier),
        city: data.city || null,
        region: data.region || null
      };
      Storage.set('chafik_ads_geo', result, ADS_CONFIG.geo.cacheHours * 3600000);
      memoryCache.data = result;
      memoryCache.ts = Date.now();
      return result;
    } catch {
      const fallback = { country: null, tier: 'standard', boost: 1 };
      return fallback;
    }
  },

  syncFromProps(props = {}) {
    if (props.country || props.tier) {
      return {
        country: props.country || null,
        tier: props.tier || 'standard',
        boost: boostFor(props.tier || 'standard')
      };
    }
    if (typeof window === 'undefined') return { country: null, tier: 'standard', boost: 1 };
    return Storage.get('chafik_ads_geo', { country: null, tier: 'standard', boost: 1 });
  }
};

export default Geo;
