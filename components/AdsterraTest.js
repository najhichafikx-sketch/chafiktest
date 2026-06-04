'use client';

import { useEffect } from 'react';

export default function AdsterraTest() {
  useEffect(() => {
    const s1 = document.createElement('script');
    s1.textContent = `atOptions={'key':'a4638a9f907475a8243f653a6e4bd7ad','format':'iframe','height':250,'width':300,'params':{}};`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.src = 'https://www.highperformanceformat.com/a4638a9f907475a8243f653a6e4bd7ad/invoke.js';
    s2.async = true;
    document.head.appendChild(s2);
  }, []);

  return (
    <div
      id="adsterra-test-container"
      style={{ width: 300, height: 250, margin: '20px auto', border: '1px solid #333' }}
    />
  );
}
