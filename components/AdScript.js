'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AD_URL = 'https://pl29606008.effectivecpmnetwork.com/c2/dc/af/c2dcaf12d7d28b9604b8957217fbf8d4.js';

export default function AdScript() {
  const pathname = usePathname();

  useEffect(() => {
    const id = 'adsterra-auto-ads';

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.src = AD_URL;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
