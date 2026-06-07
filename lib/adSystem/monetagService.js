import { ADS_CONFIG } from './adsConfig';

function injectScript(src, attrs = {}) {
  if (typeof document === 'undefined') return null;
  if (document.querySelector(`script[data-monetag-src="${src}"]`)) {
    return document.querySelector(`script[data-monetag-src="${src}"]`);
  }
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.dataset.cfasync = 'false';
  for (const [k, v] of Object.entries(attrs)) {
    s.dataset[k] = v;
  }
  s.setAttribute('data-monetag-src', src);
  return s;
}

export const MonetagService = {
  name: 'monetag',

  canRun() {
    return ADS_CONFIG.networks.monetag && typeof window !== 'undefined';
  },

  push() {
    if (!this.canRun()) return false;
    if (window.__mtagPushInjected) return true;
    const s = injectScript(ADS_CONFIG.networks.monetag.scripts.push);
    if (!s) return false;
    s.dataset.zone = ADS_CONFIG.networks.monetag.zones.push;
    document.body.appendChild(s);
    window.__mtagPushInjected = true;
    return true;
  },

  onclick() {
    if (!this.canRun()) return false;
    if (window.__mtagOnclickInjected) return true;
    const s = injectScript(ADS_CONFIG.networks.monetag.scripts.onclick, {
      zone: ADS_CONFIG.networks.monetag.zones.onclick
    });
    if (!s) return false;
    document.body.appendChild(s);
    window.__mtagOnclickInjected = true;
    return true;
  },

  socialBar() {
    if (!this.canRun()) return false;
    if (window.__mtagSocialInjected) return true;
    const s = injectScript(ADS_CONFIG.networks.monetag.scripts.socialBar, {
      zone: ADS_CONFIG.networks.monetag.zones.socialBar
    });
    if (!s) return false;
    document.body.appendChild(s);
    window.__mtagSocialInjected = true;
    return true;
  },

  banner(container, options = {}) {
    if (!this.canRun() || !container) return false;
    const key = 'mtagBanner-' + (container.id || Math.random().toString(36).slice(2, 8));
    if (container.dataset[key]) return true;
    container.dataset[key] = '1';
    const s = injectScript(ADS_CONFIG.networks.monetag.scripts.socialBar, {
      zone: ADS_CONFIG.networks.monetag.zones.banner
    });
    if (!s) return false;
    container.appendChild(s);
    return true;
  }
};

export default MonetagService;
