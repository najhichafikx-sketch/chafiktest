'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdsterraBanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__adsterraBannerLoaded) return;
    window.__adsterraBannerLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js';
    s.async = true;
    s.dataset.cfasync = 'false';
    document.body.appendChild(s);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0', minHeight: 90, background: 'rgba(0,0,0,0.02)' }}>
      <ins id="adsterra-anchor" style={{ display: 'inline-block', width: 728, height: 90 }}></ins>
    </div>
  );
}
