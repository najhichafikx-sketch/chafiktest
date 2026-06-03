'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdManager({ location, toolId }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;

        const ad = data.ads?.[location];
        if (!ad?.enabled || !ad?.code) return;

        // inject safely
        el.innerHTML = ad.code;

        // execute scripts
        el.querySelectorAll('script').forEach(old => {
          const s = document.createElement('script');
          if (old.src) s.src = old.src;
          else s.textContent = old.textContent;
          document.body.appendChild(s);
        });

        setLoaded(true);
      })
      .catch(() => {});
  }, [location]);

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