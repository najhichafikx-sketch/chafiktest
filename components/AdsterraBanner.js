'use client';

import { useEffect } from 'react';

export default function AdsterraBanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__adsterraBannerLoaded) return;
    window.__adsterraBannerLoaded = true;

    window.atOptions = {
      'key': 'a64a753a91e1df2d14eac4534cea9820',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js';
    script.async = true;
    script.dataset.cfasync = 'false';
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0', minHeight: 90 }}>
      <ins id="adsterra-anchor" style={{ display: 'inline-block', width: 728, height: 90 }}></ins>
    </div>
  );
}
