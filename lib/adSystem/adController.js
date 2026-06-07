import { ADS_CONFIG, getPageType } from './adsConfig';
import { Storage } from './storage';
import { Geo } from './geo';
import { ABTesting } from './abTesting';
import { Tracker } from './tracker';
import { MonetagService } from './monetagService';
import { AdsterraService } from './adsterraService';

function isDoNotTrack() {
  if (typeof navigator === 'undefined') return false;
  if (!ADS_CONFIG.antiAnnoyance.respectDoNotTrack) return false;
  const nav = navigator;
  return nav.doNotTrack === '1' || nav.msDoNotTrack === '1' || window.doNotTrack === '1';
}

function getContext(overrides = {}) {
  if (typeof window === 'undefined') {
    return {
      pageType: 'home',
      path: '/',
      device: 'unknown',
      geo: { country: null, tier: 'standard', boost: 1 },
      variant: { id: 'control' },
      config: ADS_CONFIG
    };
  }
  const path = overrides.path || window.location.pathname;
  const pageType = overrides.pageType || getPageType(path);
  const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
  const geo = Geo.syncFromProps(overrides.geo || {});
  const visitorId = Storage.getVisitorId();
  const variant = ABTesting.getVariant(visitorId);
  const config = ABTesting.applyOverlay(variant.id, ADS_CONFIG);
  return { pageType, path, device, geo, variant, config, visitorId };
}

function secondsOnPage() {
  if (typeof window === 'undefined') return 0;
  const enter = Storage.getOrSetPageEnter();
  return Math.floor((Date.now() - enter) / 1000);
}

function isNewUser() {
  if (typeof window === 'undefined') return true;
  const enter = Storage.getOrSetPageEnter();
  return Date.now() - enter < ADS_CONFIG.timing.newUserGraceSeconds * 1000;
}

function hasInteracted() {
  return Storage.getInteractions() > 0;
}

function popunderInCooldown(ctx) {
  const last = Storage.getLastAdTime(Storage.KEYS.lastPop);
  if (!last) return false;
  const capMs = ctx.config.frequency.popunderHours * 3600000;
  return Date.now() - last < capMs;
}

function sessionAdLimitReached(ctx) {
  return Storage.getSessionAds() >= ctx.config.frequency.sessionCountCap;
}

function reductionActive() {
  return Storage.isReductionActive();
}

let interactionHandlersBound = false;
function bindInteractionTracking() {
  if (typeof window === 'undefined') return;
  if (interactionHandlersBound) return;
  interactionHandlersBound = true;

  const track = () => Storage.incrementInteractions();
  ['click', 'keydown', 'touchstart', 'pointerdown', 'scroll'].forEach(ev => {
    window.addEventListener(ev, track, { passive: true, once: false });
  });

  let bounced = false;
  const enter = Storage.getOrSetPageEnter();
  const checkBounce = () => {
    if (bounced) return;
    const interactions = Storage.getInteractions();
    if (interactions === 0 && Date.now() - enter > ADS_CONFIG.bounceProtection.windowMs) {
      bounced = true;
      Storage.recordBounce();
      const bounces = Storage.getBounces();
      if (bounces >= 3) {
        const until = Date.now() + ADS_CONFIG.bounceProtection.reductionTtlHours * 3600000;
        Storage.setReductionUntil(until);
      }
    }
  };
  setTimeout(checkBounce, ADS_CONFIG.bounceProtection.windowMs + 500);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && Storage.getInteractions() === 0) {
      Storage.recordBounce();
    }
  });
}

let scrollHandlersBound = false;
function bindScrollTracking(onTrigger) {
  if (typeof window === 'undefined') return;
  if (scrollHandlersBound) return;
  scrollHandlersBound = true;

  let fired = false;
  const onScroll = () => {
    if (fired) return;
    const h = document.documentElement;
    const scrollable = (h.scrollHeight - h.clientHeight) || 1;
    const pct = (h.scrollTop / scrollable) * 100;
    if (pct >= ADS_CONFIG.timing.socialBarScrollPercent) {
      fired = true;
      onTrigger();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

export const AdController = {
  Storage,
  Geo,
  ABTesting,
  Tracker,
  MonetagService,
  AdsterraService,
  ADS_CONFIG,

  init(options = {}) {
    if (typeof window === 'undefined') return;
    const ctx = getContext(options);
    Tracker.pageEnter(ctx.pageType, ctx.path);
    Tracker.onUnload();
    bindInteractionTracking();
    return ctx;
  },

  bindSocialBarTrigger(trigger) {
    if (typeof window === 'undefined') return;
    if (!trigger) trigger = () => this.maybeShowSocialBar();
    const ctx = this.getContext();
    if (ctx.config.tracking.enabled) {
      setTimeout(() => trigger(), ctx.config.timing.socialBarDelayMs);
    }
    bindScrollTracking(trigger);
  },

  getContext(overrides) {
    return getContext(overrides);
  },

  isNewUser,
  hasInteracted,
  secondsOnPage,
  popunderInCooldown,
  reductionActive,

  canShowAd(adType, overrides = {}) {
    if (!ADS_CONFIG.enabled) return false;
    if (isDoNotTrack()) return false;
    const ctx = getContext(overrides);
    const pageRule = ctx.config.pages[ctx.pageType] || ctx.config.pages.home;

    if (!pageRule.allowed.includes(adType)) return false;

    if (reductionActive() && adType !== 'socialBar') {
      if (Math.random() > ctx.config.bounceProtection.reductionFactor) return false;
    }

    if (ctx.device === 'mobile') {
      if (Math.random() < ctx.config.probability.mobileAdReduction) {
        if (adType === 'bannerTop' || adType === 'bannerBottom' || adType === 'bannerInContent') {
          return false;
        }
      }
    }

    if (isNewUser()) {
      if (adType === 'popunder' || adType === 'socialBar') {
        if (Math.random() < ctx.config.probability.newUserSkipChance) return false;
      }
    }

    if (adType === 'popunder') {
      if (!pageRule.popunderEnabled) return false;
      if (popunderInCooldown(ctx)) return false;
      if (sessionAdLimitReached(ctx)) return false;
      if (isNewUser()) return false;
      if (!hasInteracted()) return false;
    }

    if (adType === 'socialBar') {
      const last = Storage.getLastAdTime(Storage.KEYS.lastSocial);
      if (last && Storage.getSessionAds() >= 1 && Date.now() - last < 3600000) return false;
    }

    if (adType === 'bannerTop' || adType === 'bannerBottom' || adType === 'bannerInContent') {
      const last = Storage.getLastAdTime(Storage.KEYS.lastBanner);
      if (last && Date.now() - last < ctx.config.frequency.bannerReloadSeconds * 1000) return false;
    }

    return true;
  },

  recordImpression(adType, slot, network, meta = {}) {
    Tracker.impression(adType, slot, network, meta);
    if (adType === 'popunder') Storage.setLastAdTime(Storage.KEYS.lastPop);
    else if (adType === 'socialBar') Storage.setLastAdTime(Storage.KEYS.lastSocial);
    else if (adType.startsWith('banner')) Storage.setLastAdTime(Storage.KEYS.lastBanner);
    Storage.incrementSessionAds();
  },

  recordClick(adType, slot, network, meta = {}) {
    Tracker.click(adType, slot, network, meta);
  },

  recordBlocked(reason, context = {}) {
    Tracker.blocked(reason, context);
  },

  chooseNetworkForSlot(slot, network) {
    if (network && network !== 'auto') return network;
    const geo = Geo.syncFromProps({});
    if (geo.boost >= 1.5) return 'adsterra';
    return 'mixed';
  },

  async maybeShowPopunder(triggerSource = 'click') {
    if (typeof window === 'undefined') return false;
    if (!this.canShowAd('popunder')) {
      this.recordBlocked('popunder_disallowed', { triggerSource });
      return false;
    }
    const ctx = this.getContext();
    if (Math.random() > ctx.config.probability.popunderOnInteraction) {
      this.recordBlocked('probability_skip', { triggerSource });
      return false;
    }
    const shown = MonetagService.push();
    if (shown) {
      this.recordImpression('popunder', 'global', 'monetag', { triggerSource, geo: ctx.geo.tier });
    }
    return shown;
  },

  maybeShowSocialBar() {
    if (typeof window === 'undefined') return false;
    if (!this.canShowAd('socialBar')) {
      this.recordBlocked('socialbar_disallowed');
      return false;
    }
    const ctx = this.getContext();
    if (Math.random() > ctx.config.probability.socialBarOnScroll) {
      this.recordBlocked('socialbar_probability');
      return false;
    }
    const shown = MonetagService.socialBar();
    if (shown) {
      this.recordImpression('socialBar', 'global', 'monetag', { geo: ctx.geo.tier });
    }
    return shown;
  },

  loadBannerInto(container, slot, options = {}) {
    if (typeof window === 'undefined' || !container) return () => {};
    if (!this.canShowAd(options.adType || 'bannerTop', options)) {
      this.recordBlocked('banner_disallowed', { slot });
      return () => {};
    }
    const ctx = this.getContext();
    const network = this.chooseNetworkForSlot(slot, options.network);
    const cleanup = (network === 'adsterra')
      ? AdsterraService.banner(container, {
          onResult: (ok) => {
            if (!ok) {
              MonetagService.banner(container);
              this.recordImpression(options.adType || 'bannerTop', slot, 'monetag-fallback', { geo: ctx.geo.tier });
            } else {
              this.recordImpression(options.adType || 'bannerTop', slot, 'adsterra', { geo: ctx.geo.tier });
            }
          }
        })
      : (() => {
          const ok = MonetagService.banner(container);
          this.recordImpression(options.adType || 'bannerTop', slot, 'monetag', { geo: ctx.geo.tier });
          return () => {};
        })();
    return cleanup;
  },

  bindClickPopunder() {
    if (typeof window === 'undefined') return;
    if (window.__mtagClickBound) return;
    window.__mtagClickBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      const interactive = target.closest(
        'button, a, [data-tool-action], .tool-btn, .generate-btn, input[type="submit"]'
      );
      if (!interactive) return;
      const ctx = this.getContext();
      if (!ctx.config.frequency.popunderHours) return;
      setTimeout(() => {
        this.maybeShowPopunder('click');
      }, ctx.config.timing.interactionDelayMs);
    }, { passive: true });
  }
};

export default AdController;
