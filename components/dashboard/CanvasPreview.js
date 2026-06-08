'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Download, RotateCcw } from 'lucide-react';

const STEPS = [
  { icon: '🎨', text: 'Generating background...' },
  { icon: '✂️', text: 'Removing background...' },
  { icon: '✨', text: 'Applying effects...' },
  { icon: '🖼️', text: 'Compositing layers...' },
  { icon: '🎯', text: 'Final touches...' },
];

export default function CanvasPreview({ loading, result, onDownload, onRedo, progress }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!loading) { setIdx(0); return; }
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % STEPS.length), 2500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  return (
    <div className="flex-1 flex flex-col relative" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl rounded-2xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500"
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: '#121218',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: result ? '0 0 80px rgba(234,179,8,0.05)' : 'inset 0 0 60px rgba(0,0,0,0.4)',
          }}>
          {loading ? (
            <div className="flex flex-col items-center px-8 w-full max-w-sm">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 animate-pulse" style={{ backgroundColor: 'rgba(234,179,8,0.08)' }}>
                <Sparkles size={24} className="text-[#eab308]" />
              </div>
              <div className="w-full mb-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, backgroundColor: '#eab308', boxShadow: '0 0 12px rgba(234,179,8,0.3)' }} />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-base">{STEPS[idx].icon}</span>
                <p className="text-[13px] font-medium" style={{ color: '#f0f0f0' }}>{STEPS[idx].text}</p>
              </div>
              <p className="text-[11px]" style={{ color: '#606070' }}>This may take a few seconds...</p>
            </div>
          ) : result ? (
            <div className="w-full h-full relative group">
              <img src={result} alt="" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button onClick={onDownload} className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#f0f0f0', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Download size={14} /> Download
                </button>
                <button onClick={onRedo} className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#f0f0f0', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <RotateCcw size={14} /> Redo
                </button>
              </div>
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="px-3 py-1.5 rounded-lg text-[9px] font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#808090', backdropFilter: 'blur(8px)' }}>AI Generated</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-700">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 hover:scale-105 cursor-default"
                style={{ backgroundColor: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.08)' }}>
                <Sparkles size={26} className="text-[#eab308]" />
              </div>
              <h2 className="text-xl font-extrabold mb-1 tracking-tight" style={{ color: '#f0f0f0' }}>Ready to create</h2>
              <p className="text-[12px]" style={{ color: '#808090', maxWidth: 240, lineHeight: 1.6 }}>
                Set your options in the panel and click <span className="font-semibold text-[#eab308]">Create</span> to generate
              </p>
              <div className="flex items-center gap-2.5 mt-5">
                {['16:9', '9:16'].map((a) => (
                  <div key={a} className="px-2.5 py-1 rounded-lg text-[9px] font-mono" style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#606070', border: '1px solid rgba(255,255,255,0.03)' }}>{a}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Designs */}
      <div className="px-8 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234,179,8,0.1)' }}>
            <Sparkles size={11} className="text-[#eab308]" />
          </div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.6px]" style={{ color: '#808090' }}>Recent Designs</h3>
        </div>
        <div className="w-full rounded-xl py-12 flex items-center justify-center" style={{ border: '1px dashed rgba(255,255,255,0.05)', backgroundColor: 'rgba(18,18,24,0.3)' }}>
          <div className="text-center">
            <p className="text-[13px] font-medium" style={{ color: '#606070' }}>No history yet</p>
            <p className="text-[11px] mt-1" style={{ color: '#404048' }}>Your generated thumbnails will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
