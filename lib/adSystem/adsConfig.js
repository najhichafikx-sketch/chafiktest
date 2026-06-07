export const ADS_CONFIG = {
  enabled: true,
  version: '1.0.0',
  debug: false,

  networks: {
    monetag: {
      name: 'Monetag',
      priority: 1,
      primary: true,
      zones: {
        push: '11103150',
        onclick: '11103201',
        socialBar: '11103207',
        banner: '11103207'
      },
      scripts: {
        push: 'https://5gvci.com/pfe/current/tag.min.js?z=11103150',
        onclick: 'https://al5sm.com/tag.min.js',
        socialBar: 'https://nap5k.com/tag.min.js'
      }
    },
    adsterra: {
      name: 'Adsterra',
      priority: 2,
      fallback: true,
      key: 'a64a753a91e1df2d14eac4534cea9820',
      zones: {
        banner: 'a64a753a91e1df2d14eac4534cea9820'
      },
      cdns: [
        'https://cdns.gtagserv.com',
        'https://www.highperformanceformat.com',
        'https://www.profitabledisplaynetwork.com'
      ]
    }
  },

  frequency: {
    popunderHours: 3,
    socialBarPerSession: 1,
    bannerReloadSeconds: 45,
    sessionCountCap: 30
  },

  timing: {
    newUserGraceSeconds: 45,
    interactionDelayMs: 1500,
    socialBarDelayMs: 22000,
    socialBarScrollPercent: 60,
    postInteractionCooldownMs: 8000
  },

  probability: {
    popunderOnInteraction: 0.8,
    socialBarOnScroll: 0.85,
    mobileAdReduction: 0.3,
    newUserSkipChance: 0.95
  },

  geo: {
    premiumTier: ['US', 'CA', 'GB', 'UK', 'AU', 'DE', 'FR', 'CH', 'SE', 'NO', 'NL'],
    standardTier: ['BR', 'MX', 'ES', 'IT', 'PL', 'TR', 'AE', 'SA'],
    lowTier: ['IN', 'PK', 'BD', 'PH', 'ID', 'VN', 'EG', 'NG', 'KE'],
    premiumBoost: 1.6,
    standardBoost: 1.0,
    lowBoost: 0.7,
    cacheHours: 24,
    apiEndpoint: 'https://ipapi.co/json/'
  },

  pages: {
    home: {
      allowed: ['socialBar', 'bannerTop'],
      maxBanners: 1,
      popunderEnabled: false
    },
    tool: {
      allowed: ['popunder', 'socialBar', 'bannerTop', 'bannerBottom'],
      maxBanners: 2,
      popunderEnabled: true,
      adsterraFallback: true
    },
    blog: {
      allowed: ['bannerInContent', 'bannerBottom', 'socialBar'],
      maxBanners: 2,
      popunderEnabled: false
    },
    landing: {
      allowed: ['bannerTop', 'bannerBottom', 'socialBar'],
      maxBanners: 2,
      popunderEnabled: true
    },
    admin: {
      allowed: [],
      maxBanners: 0,
      popunderEnabled: false
    },
    auth: {
      allowed: [],
      maxBanners: 0,
      popunderEnabled: false
    }
  },

  antiAnnoyance: {
    noAdsOnFirstLoad: true,
    maxPopupsPerSession: 1,
    minSecondsBetweenAds: 12,
    respectDoNotTrack: true,
    pauseWhenHidden: true
  },

  abTesting: {
    enabled: true,
    variants: [
      { id: 'control', weight: 25, label: 'Control', desc: 'Baseline behavior' },
      { id: 'aggressive', weight: 25, label: 'Aggressive', desc: 'Higher density, premium geo focus' },
      { id: 'conservative', weight: 25, label: 'Conservative', desc: 'UX-first, reduced density' },
      { id: 'smart_geo', weight: 25, label: 'Smart Geo', desc: 'Geo-optimized fill' }
    ]
  },

  bounceProtection: {
    enabled: true,
    windowMs: 5000,
    trackPattern: 'no_interaction_quick_exit',
    reductionFactor: 0.5,
    reductionTtlHours: 6
  },

  tracking: {
    enabled: true,
    endpoint: '/api/ads/track',
    sampleRate: 1.0,
    maxQueueSize: 50,
    flushIntervalMs: 15000,
    sendBeaconOnUnload: true
  },

  performance: {
    asyncLoad: true,
    intersectionObserverRootMargin: '200px',
    idleTimeoutMs: 4000,
    maxConcurrentAdScripts: 2
  }
};

export const AD_SLOTS = {
  'site-top': { page: 'global', network: 'mixed', sizes: [[728, 90], [300, 250]] },
  'site-bottom': { page: 'global', network: 'mixed', sizes: [[728, 90], [300, 250]] },
  'in-content': { page: 'blog', network: 'mixed', sizes: [[728, 90], [336, 280]] },
  'side-left': { page: 'global', network: 'adsterra', sizes: [[300, 250]] },
  'side-right': { page: 'global', network: 'adsterra', sizes: [[300, 250]] },
  'tool-top': { page: 'tool', network: 'mixed', sizes: [[728, 90]] },
  'tool-bottom': { page: 'tool', network: 'mixed', sizes: [[728, 90]] }
};

export function getPageType(pathname) {
  if (!pathname) return 'home';
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/admin') || pathname === '/admin-login') return 'admin';
  if (pathname === '/login' || pathname === '/register') return 'auth';
  if (pathname.startsWith('/blog/') || pathname === '/blog') return 'blog';
  if (pathname.startsWith('/tools/')) return 'tool';
  if (pathname.startsWith('/landing')) return 'landing';
  return 'home';
}

export default ADS_CONFIG;
