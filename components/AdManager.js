'use client';

import { useEffect, useRef, useCallback } from 'react';

const RETRY_DELAYS = [500, 2000, 5000];

const globalScripts = typeof window !== 'undefined' && (window.__adLoadedScripts__ || (window.__adLoadedScripts__ = new Set()));

export default function AdManager({ location, toolId }) {
  const ref = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const scriptsRef = useRef([]);

  const injectAd = useCallback((code) => {
    if (!ref.current) return;

    scriptsRef.current.forEach(s => { try { document.body.removeChild(s); } catch {} });
    scriptsRef.current = [];

    const htmlPart = code.replace(/<script[\s\S]*?<\/script>/gi, '');
    const scriptMatches = code.match(/<script[\s\S]*?<\/script>/gi) || [];

    if (htmlPart.trim()) {
      ref.current.insertAdjacentHTML('beforeend', htmlPart);
    }

    scriptMatches.forEach((tag) => {
      const srcMatch = tag.match(/src\s*=\s*"([^"]+)"/);
      const isAsync = /async/gi.test(tag);
      const hasCfasync = /data-cfasync\s*=\s*"false"/gi.test(tag);

      if (srcMatch) {
        const src = srcMatch[1];
        if (globalScripts.has(src)) return;
        globalScripts.add(src);
      }

      const script = document.createElement('script');

      if (srcMatch) {
        script.src = srcMatch[1];
        if (isAsync) script.async = true;
      } else {
        const raw = tag.replace(/<\/?script[^>]*>/gi, '');
        script.textContent = raw;
      }

      if (hasCfasync) script.setAttribute('data-cfasync', 'false');
      script.setAttribute('data-admanager', location);

      document.body.appendChild(script);
      scriptsRef.current.push(script);
    });
  }, [location]);

  const loadAd = useCallback(() => {
    if (!mountedRef.current) return;

    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        if (!mountedRef.current) return;
        if (!data.success) return;

        const ad = data.ads?.[location];
        if (!ad?.enabled || !ad?.code) return;

        injectAd(ad.code);
      })
      .catch(() => {});
  }, [location, injectAd]);

  useEffect(() => {
    mountedRef.current = true;

    loadAd();

    let attempt = 0;
    function nextRetry() {
      if (!mountedRef.current) return;
      const delay = RETRY_DELAYS[attempt];
      if (delay === undefined) return;
      attempt += 1;
      timerRef.current = setTimeout(() => {
        loadAd();
        nextRetry();
      }, delay);
    }
    nextRetry();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      scriptsRef.current.forEach(s => { try { document.body.removeChild(s); } catch {} });
      scriptsRef.current = [];
    };
  }, [loadAd]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: 90,
        width: '100%',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    />
  );
}
