'use client';

import { useEffect, useState } from 'react';

export default function AdSlot({ location }) {
  const [html, setHtml] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads?location=${location}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && data.html) setHtml(data.html);
        setDone(true);
      })
      .catch(() => { if (!cancelled) setDone(true); });
    return () => { cancelled = true; };
  }, [location]);

  if (done && !html) return null;
  if (!html) return null;

  return (
    <div
      className="ad-slot"
      data-location={location}
      style={{ width: '100%', textAlign: 'center', overflow: 'hidden', margin: '16px 0' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
