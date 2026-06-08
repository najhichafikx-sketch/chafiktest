'use client';

import { Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: 96,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        backgroundColor: '#111114',
        borderBottom: '1px solid #1e1e22',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: 'rgba(212, 168, 39, 0.1)',
          border: '1px solid rgba(212, 168, 39, 0.2)',
          marginBottom: 10,
        }}
      >
        <Sparkles size={20} style={{ color: '#d4a827' }} />
      </div>
      <h1
        className="font-extrabold tracking-tight"
        style={{ fontSize: 20, color: '#e8e6e0', marginBottom: 4 }}
      >
        Create AI Thumbnail
      </h1>
      <p style={{ fontSize: 13, color: '#9a9890' }}>
        Generate professional thumbnails using AI
      </p>
    </div>
  );
}
