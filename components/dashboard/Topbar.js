'use client';

import { Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <div
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: 48,
        backgroundColor: '#111114',
        borderBottom: '1px solid #1e1e22',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #d4a827, #e85c26)',
            border: '1px solid #2a2a2e',
          }}
        />
        <button
          className="relative"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 6,
            color: '#9a9890',
            cursor: 'pointer',
            borderRadius: 7,
          }}
        >
          <Bell size={16} />
        </button>
        <button
          className="font-bold transition-colors"
          style={{
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 8,
            fontSize: 12,
            backgroundColor: '#d4a827',
            color: '#0d0d0f',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c49a20')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d4a827')}
        >
          Upgrade
        </button>
        <button
          className="font-medium transition-colors"
          style={{
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 8,
            fontSize: 12,
            backgroundColor: 'transparent',
            color: '#9a9890',
            border: '1px solid #2a2a2e',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e8e6e0';
            e.currentTarget.style.borderColor = '#5a5a62';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9a9890';
            e.currentTarget.style.borderColor = '#2a2a2e';
          }}
        >
          User guide
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: 16, color: '#d4a827' }}
        >
          Thumb
        </span>
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: 16, color: '#e8e6e0' }}
        >
          Pure
        </span>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: '#d4a827',
            marginLeft: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 1,
              backgroundColor: '#0d0d0f',
            }}
          />
        </div>
      </div>
    </div>
  );
}
