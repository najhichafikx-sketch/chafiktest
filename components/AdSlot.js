'use client';

import { useEffect, useState } from 'react';

const FALLBACKS = {
  header: { text: 'Header Banner — 728x90', h: 90 },
  sidebar: { text: 'Sidebar Ad — 300x600', h: 250 },
  content_top: { text: 'Content Ad', h: 120 },
  content_bottom: { text: 'Content Footer Ad', h: 120 },
  in_tool: { text: 'In-Tool Banner — 320x50', h: 60 },
  loading_state: { text: 'Loading Ad — 320x50', h: 60 },
  mid_result: { text: 'Mid-Result Banner', h: 120 },
  footer: { text: 'Footer Banner — 728x90', h: 90 },
};

export default function AdSlot({ location }) {
  const [html, setHtml] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads?location=${location}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && data.html) setHtml(data.html);
        else setFailed(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [location]);

  const fb = FALLBACKS[location] || { text: 'Ad Space', h: 90 };

  if (html) {
    return (
      <div
        className="ad-slot"
        data-location={location}
        style={{ minHeight: fb.h, width: '100%', textAlign: 'center', overflow: 'hidden', margin: '16px 0' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className="ad-slot ad-slot-fallback"
      data-location={location}
      style={{
        minHeight: fb.h,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(6,182,212,0.05))',
        border: '1px dashed rgba(99,102,241,0.2)',
        borderRadius: 8,
        color: 'var(--text-tertiary)',
        fontSize: '0.8rem',
        margin: '16px 0',
      }}
    >
      {fb.text}
    </div>
  );
}
