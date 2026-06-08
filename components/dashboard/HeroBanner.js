'use client';

import { Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 72, backgroundColor: '#0a0a0f', borderColor: '#1a1a24' }}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eab308]/20 to-[#eab308]/5 flex items-center justify-center border border-[#eab308]/10">
          <Sparkles size={18} className="text-[#eab308]" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight" style={{ color: '#f0f0f0' }}>AI Thumbnail Creator</h1>
          <p className="text-[11px]" style={{ color: '#808090' }}>Generate professional thumbnails powered by AI</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ backgroundColor: '#121218', border: '1px solid #1a1a24' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider text-[#eab308]">AI POWERED</span>
        </div>
        <button className="px-5 py-2 rounded-full text-[12px] font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#eab308', color: '#0a0a0f', boxShadow: '0 4px 20px rgba(234,179,8,0.2)' }}>
          Start now &rarr;
        </button>
      </div>
    </div>
  );
}
