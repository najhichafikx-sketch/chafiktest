'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    const sid = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sid);

    if (pathname !== lastPath.current) {
      lastPath.current = pathname;

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
        body: JSON.stringify({
          event_type: 'page_view',
          page_url: pathname,
          metadata: { referrer: document.referrer || '' }
        })
      }).catch(() => {});

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
          page_path: pathname
        });
      }
    }
  }, [pathname]);

  return null;
}
