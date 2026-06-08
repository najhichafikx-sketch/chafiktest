'use client';

import { Sparkles, Zap } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div
      className="flex items-center justify-between px-6 border-b shrink-0"
      style={{ height: 76, backgroundColor: '#111114', borderColor: '#1e1e22' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: 'rgba(212, 168, 39, 0.1)',
            border: '1px solid rgba(212, 168, 39, 0.2)',
          }}
        >
          <Sparkles size={18} style={{ color: '#d4a827' }} />
        </div>
        <div>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: 16, color: '#e8e6e0', marginBottom: 2 }}
          >
            Create AI Thumbnail
          </h1>
          <p style={{ fontSize: 12, color: '#9a9890' }}>
            Generate professional thumbnails using AI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2"
          style={{
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 7,
            backgroundColor: '#1e1e22',
            border: '1px solid #2a2a2e',
          }}
        >
          <Zap size={12} style={{ color: '#d4a827', fill: '#d4a827' }} />
          <span
            className="font-bold tracking-wider"
            style={{ fontSize: 11, color: '#d4a827' }}
          >
            AI POWERED
          </span>
        </div>
        <button
          className="font-bold transition-colors"
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            fontSize: 13,
            backgroundColor: '#d4a827',
            color: '#0d0d0f',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c49a20')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d4a827')}
        >
          Start now →
        </button>
      </div>
    </div>
  );
}
