'use client';

import { Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="flex items-center justify-between px-8 shrink-0" style={{ height: 48, backgroundColor: '#0a0a0f', borderBottom: '1px solid #121218' }}>
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-500/20" />
        <button className="relative text-[#606070] hover:text-[#f0f0f0] transition-colors">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#eab308]" />
        </button>
        <button className="px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200"
          style={{ backgroundColor: '#eab308', color: '#0a0a0f', boxShadow: '0 2px 12px rgba(234,179,8,0.2)' }}>
          Upgrade
        </button>
        <button className="px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors"
          style={{ color: '#808090', border: '1px solid #1a1a24' }}
          onMouseEnter={e => e.target.style.borderColor = '#2a2a34'}
          onMouseLeave={e => e.target.style.borderColor = '#1a1a24'}>
          User guide
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-bold tracking-tight" style={{ color: '#f0f0f0' }}>Thum</span>
        <span className="text-[15px] font-bold text-[#eab308]">Pure</span>
        <div className="w-4 h-4 rounded border border-[#eab308] flex items-center justify-center ml-0.5">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#eab308' }} />
        </div>
      </div>
    </div>
  );
}
