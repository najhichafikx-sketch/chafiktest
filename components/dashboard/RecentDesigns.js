'use client';

import { Sparkles } from 'lucide-react';

export default function RecentDesigns({ designs = [], onSelect }) {
  return (
    <div
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24,
        paddingTop: 8,
        backgroundColor: '#0d0d0f',
        borderTop: '1px solid #1e1e22',
      }}
    >
      <div
        className="flex items-center"
        style={{ marginBottom: 12, gap: 8 }}
      >
        <Sparkles size={14} style={{ color: '#d4a827' }} />
        <h3
          className="font-bold tracking-wide"
          style={{ fontSize: 12, color: '#9a9890', textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Recent Designs
        </h3>
        {designs.length > 0 && (
          <span style={{ fontSize: 11, color: '#5a5a62' }}>
            ({designs.length})
          </span>
        )}
      </div>

      {designs.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={{
            paddingTop: 40,
            paddingBottom: 40,
            borderRadius: 10,
            border: '1px dashed #2a2a2e',
            backgroundColor: '#111114',
          }}
        >
          <div className="text-center">
            <p
              className="font-semibold"
              style={{ fontSize: 13, color: '#9a9890', marginBottom: 4 }}
            >
              No history yet
            </p>
            <p style={{ fontSize: 12, color: '#5a5a62' }}>
              Start creating now!
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex overflow-x-auto"
          style={{ gap: 12, paddingBottom: 4 }}
        >
          {designs.slice(0, 8).map((design, i) => (
            <button
              key={design.id || i}
              onClick={() => onSelect?.(design)}
              className="group shrink-0 text-left transition-all"
              style={{
                width: 160,
                borderRadius: 10,
                backgroundColor: '#111114',
                border: '1px solid #1e1e22',
                overflow: 'hidden',
                cursor: onSelect ? 'pointer' : 'default',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4a827';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e1e22';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  backgroundColor: '#0d0d0f',
                  overflow: 'hidden',
                  borderBottom: '1px solid #1e1e22',
                }}
              >
                {design.image_url || design.imageUrl ? (
                  <img
                    src={design.image_url || design.imageUrl}
                    alt={design.title || ''}
                    className="w-full h-full"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ color: '#5a5a62' }}
                  >
                    <Sparkles size={20} />
                  </div>
                )}
              </div>
              <div style={{ padding: 8 }}>
                <p
                  className="font-semibold truncate"
                  style={{ fontSize: 12, color: '#e8e6e0', marginBottom: 2 }}
                >
                  {design.title || 'Untitled'}
                </p>
                <p style={{ fontSize: 11, color: '#5a5a62' }}>
                  {design.dimension || '16:9'} · {design.model || 'basic'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
