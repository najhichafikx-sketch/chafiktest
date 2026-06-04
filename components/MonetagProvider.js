'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const VIGNETTE_SESSION_KEY = 'mntg_vignette';
const POPUNDER_SESSION_KEY = 'mntg_popunder';
const VIGNETTE_COOLDOWN = 300000;
const POPUNDER_SAFE_DELAY = 15000;

export default function MonetagProvider({ children }) {
  const pathname = usePathname();
  const mountedRef = useRef(false);
  const lastPathRef = useRef(pathname);
  const interactCountRef = useRef(0);
  const readyForPopunderRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    const lastVignette = sessionStorage.getItem(VIGNETTE_SESSION_KEY);
    if (lastVignette && Date.now() - parseInt(lastVignette) < VIGNETTE_COOLDOWN) return;

    sessionStorage.setItem(VIGNETTE_SESSION_KEY, Date.now().toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [pathname]);

  useEffect(() => {
    const increment = () => {
      interactCountRef.current++;
      if (interactCountRef.current >= 2) readyForPopunderRef.current = true;
    };
    window.addEventListener('click', increment, { once: false });
    window.addEventListener('touchstart', increment, { once: false });

    const timeout = setTimeout(() => { readyForPopunderRef.current = true; }, POPUNDER_SAFE_DELAY);

    const interval = setInterval(() => {
      if (readyForPopunderRef.current) {
        try {
          if (typeof window.__mntg !== 'undefined' && window.__mntg?.readyPopunder) {
            window.__mntg.readyPopunder();
          }
        } catch {}
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.removeEventListener('click', increment);
      window.removeEventListener('touchstart', increment);
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return children;
}
