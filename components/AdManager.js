'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const AD_VARIANTS = {
  sidebar: [{ size: '300x250' }, { size: '160x600' }, { size: '300x600' }],
  content_top: [{ size: '728x90' }, { size: '468x60' }],
  content_bottom: [{ size: '728x90' }, { size: '468x60' }],
  header: [{ size: '728x90' }, { size: '468x60' }],
  footer: [{ size: '728x90' }, { size: '468x60' }],
  popup: [{ size: '300x250' }, { size: '320x480' }],
  in_tool: [{ size: '468x60' }, { size: '728x90' }],
  loading_state: [{ size: '300x250' }, { size: '468x60' }],
  mid_result: [{ size: '300x250' }, { size: '468x60' }]
};

const PLACEHOLDER_HEIGHTS = {
  header: 90, footer: 90, sidebar: 250, content_top: 120, content_bottom: 120, popup: 250,
  in_tool: 90, loading_state: 60, mid_result: 100
};

function getVariant(location) {
  const variants = AD_VARIANTS[location];
  if (!variants) return null;
  const stored = localStorage.getItem(`ad_variant_${location}`);
  if (stored) return variants[parseInt(stored)];
  const idx = Math.floor(Math.random() * variants.length);
  localStorage.setItem(`ad_variant_${location}`, String(idx));
  return variants[idx];
}

async function track(sessionId, eventType, data) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
      body: JSON.stringify({ event_type: eventType, page_url: window.location.pathname, metadata: data })
    });
  } catch {}
}

export default function AdManager({ location, toolId }) {
  const [adData, setAdData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [variant, setVariant] = useState(null);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const sessionId = useRef('');
  const tracked = useRef(false);

  useEffect(() => {
    sessionId.current = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sessionId.current);
    setVariant(getVariant(location));
  }, [location]);

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const ad = data.ads[location] || null;
          setAdData(ad);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [location]);

  useEffect(() => {
    if (!adData?.enabled || !adData?.code || !containerRef.current) return;
    if (tracked.current) return;

    const el = containerRef.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.innerHTML = adData.code;
        setVisible(true);
        tracked.current = true;

        track(sessionId.current, 'ad_impression', {
          slot: location,
          toolId: toolId || '',
          variant: variant?.size || 'default',
          url: window.location.pathname
        });

        if (obs) obs.disconnect();
      }
    }, { rootMargin: '100px' });

    obs.observe(el);
    observerRef.current = obs;

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [adData, variant, location, toolId]);

  const handleClick = useCallback(() => {
    track(sessionId.current, 'ad_click', {
      slot: location,
      toolId: toolId || '',
      variant: variant?.size || 'default',
      url: window.location.pathname
    });
  }, [location, toolId, variant]);

  if (!loaded) {
    return (
      <div
        className={`ad-slot ad-slot-${location}`}
        style={{ minHeight: PLACEHOLDER_HEIGHTS[location] || 90 }}
      />
    );
  }

  if (!adData?.enabled || !adData?.code) return null;

  return (
    <div
      ref={containerRef}
      className={`ad-slot ad-slot-${location}`}
      onClick={handleClick}
      style={{
        minHeight: 1,
        overflow: 'hidden',
        textAlign: 'center',
        maxWidth: '100%',
        cursor: 'pointer'
      }}
    />
  );
}
