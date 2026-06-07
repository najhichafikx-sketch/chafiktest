import { ADS_CONFIG } from './adsConfig';

function tryLoadAdsterra(container, key, cdns, onResult) {
  if (!container) { onResult && onResult(false); return () => {}; }
  let idx = 0;
  let stopped = false;
  let timeoutId;

  const cleanup = () => {
    try { container.innerHTML = ''; } catch {}
    if (timeoutId) clearTimeout(timeoutId);
  };

  const tryNext = () => {
    if (stopped || idx >= cdns.length) {
      onResult && onResult(false);
      return;
    }
    const cdn = cdns[idx++];
    cleanup();
    const config = document.createElement('script');
    config.type = 'text/javascript';
    config.text = `window.atOptions={'key':'${key}','format':'iframe','height':250,'width':300,'params':{}};`;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = `${cdn}/${key}/invoke.js`;
    s.async = false;
    s.dataset.cfasync = 'false';
    s.onerror = () => { if (!stopped) tryNext(); };
    s.onload = () => {
      if (stopped) return;
      timeoutId = setTimeout(() => {
        if (!container.querySelector('iframe')) tryNext();
        else onResult && onResult(true);
      }, 2500);
    };
    container.appendChild(config);
    container.appendChild(s);
  };

  tryNext();
  return () => { stopped = true; cleanup(); };
}

export const AdsterraService = {
  name: 'adsterra',

  canRun() {
    return ADS_CONFIG.networks.adsterra && typeof window !== 'undefined';
  },

  banner(container, options = {}) {
    if (!this.canRun() || !container) return () => {};
    const cfg = ADS_CONFIG.networks.adsterra;
    if (container.dataset.adsterraLoaded) return () => {};
    container.dataset.adsterraLoaded = '1';
    return tryLoadAdsterra(container, cfg.key, cfg.cdns, options.onResult);
  },

  native(container, options = {}) {
    if (!this.canRun() || !container) return () => {};
    return this.banner(container, options);
  }
};

export default AdsterraService;
