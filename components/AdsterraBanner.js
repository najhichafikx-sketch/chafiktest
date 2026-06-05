'use client';

import Script from 'next/script';

export default function AdsterraBanner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0', margin: '0 auto', maxWidth: 728 }}>
      <Script id="adsterra-banner-config" strategy="afterInteractive">
        {`atOptions = {
          'key' : 'a64a753a91e1df2d14eac4534cea9820',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };`}
      </Script>
      <Script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js" strategy="afterInteractive" />
    </div>
  );
}
