'use client';

import { useRef, useState, useEffect } from 'react';
import AdManager from '@/components/AdManager';

const SLOT_STYLES = {
  top: {
    container: { marginBottom: 24 },
    inner: { maxWidth: 728, margin: '0 auto' }
  },
  mid: {
    container: {
      marginBottom: 24, marginTop: 24,
      position: 'sticky', top: 80, zIndex: 10,
      background: 'var(--bg-primary)'
    },
    inner: { maxWidth: 728, margin: '0 auto' }
  },
  bottom: {
    container: { marginTop: 24, marginBottom: 24 },
    inner: { maxWidth: 728, margin: '0 auto' }
  }
};

export default function AdToolSlot({ position, toolId }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (position === 'mid' && el.parentElement) {
      const parent = el.parentElement;
      const mediaQuery = window.matchMedia('(min-width: 768px)');

      function updateSticky() {
        if (mediaQuery.matches) {
          el.style.position = 'sticky';
          el.style.top = '80px';
          el.style.zIndex = '10';
          el.style.background = 'var(--bg-primary)';
        } else {
          el.style.position = 'static';
          el.style.zIndex = '';
          el.style.background = '';
        }
      }

      updateSticky();
      mediaQuery.addEventListener('change', updateSticky);
      return () => mediaQuery.removeEventListener('change', updateSticky);
    }
  }, [position]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { rootMargin: '200px' });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const styleKey = position || 'top';
  const styles = SLOT_STYLES[styleKey] || SLOT_STYLES.top;

  return (
    <div
      ref={ref}
      className={`ad-tool-slot ad-tool-slot-${position}`}
      style={{
        ...styles.container,
        minHeight: visible ? 0 : 90,
        transition: 'min-height 0.3s ease'
      }}
    >
      <div style={styles.inner}>
        {visible && <AdManager location={position === 'mid' ? 'in_tool' : position === 'top' ? 'content_top' : 'mid_result'} toolId={toolId} />}
      </div>
    </div>
  );
}
