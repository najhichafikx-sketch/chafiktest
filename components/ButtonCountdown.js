'use client';

import { useEffect, useState, useCallback } from 'react';

export default function ButtonCountdown() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(3);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const showCountdown = useCallback((e) => {
    let target = e.target;
    while (target && target !== document.body) {
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button' || target.classList.contains('btn') || target.closest('button')) {
        const rect = target.getBoundingClientRect();
        setPos({ x: rect.right + 10, y: rect.top + rect.height / 2 });
        setCount(3);
        setVisible(true);
        return;
      }
      target = target.parentElement;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', showCountdown);
    return () => document.removeEventListener('click', showCountdown);
  }, [showCountdown]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    const timeout = setTimeout(() => { setVisible(false); setCount(3); }, 3200);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y, transform: 'translateY(-50%)',
      zIndex: 999999, pointerEvents: 'none',
      animation: 'countSlide 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, height: 28, padding: '0 4px', borderRadius: 6,
        background: 'rgba(13,13,15,0.9)', border: '1px solid rgba(212,168,39,0.3)',
        boxShadow: '0 0 16px rgba(212,168,39,0.1)',
        fontSize: '0.85rem', fontWeight: 800,
        color: count > 1 ? '#6c63ff' : '#22c55e',
        textShadow: count > 1 ? '0 0 8px rgba(99,102,241,0.3)' : '0 0 8px rgba(34,197,94,0.3)',
      }}>
        {count > 0 ? count : '✓'}
      </span>
      <style>{`
        @keyframes countSlide { 0% { opacity: 0; transform: translateY(-50%) scale(0.5); } 100% { opacity: 1; transform: translateY(-50%) scale(1); } }
      `}</style>
    </div>
  );
}
