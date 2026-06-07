(function () {
  if (typeof window === 'undefined') return;
  if (window.__chafikAdsBootstrap) return;
  window.__chafikAdsBootstrap = true;

  function loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.dataset.cfasync = 'false';
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  function pathBlacklisted(path) {
    if (!path) return true;
    if (path === '/') return true;
    if (path.startsWith('/admin')) return true;
    if (path === '/admin-login' || path === '/login' || path === '/register') return true;
    return false;
  }

  function ready() {
    if (!window.ChafikAds) {
      setTimeout(ready, 200);
      return;
    }
    const Ads = window.ChafikAds;
    const path = window.location.pathname;

    if (pathBlacklisted(path)) return;

    Ads.AdController.init();
    Ads.AdController.bindClickPopunder();
    Ads.AdController.bindSocialBarTrigger(() => Ads.AdController.maybeShowSocialBar());

    if (Ads.Geo && typeof Ads.Geo.detect === 'function') {
      Ads.Geo.detect().catch(() => {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
