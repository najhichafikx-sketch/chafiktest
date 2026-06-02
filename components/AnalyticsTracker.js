'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/ga4';

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

      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
