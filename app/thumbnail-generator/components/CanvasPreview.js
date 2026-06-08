'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, RotateCcw, Wand2 } from 'lucide-react';

const STATUS_MESSAGES = [
  { icon: '🎨', text: 'Generating background with AI...' },
  { icon: '✂️', text: 'Removing background from person...' },
  { icon: '✨', text: 'Applying visual effects...' },
  { icon: '🖼️', text: 'Compositing all layers...' },
  { icon: '🎯', text: 'Adding final touches...' },
];

export default function CanvasPreview({ loading, loadingMessage, result, onDownload, onRedo, progress }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setMsgIndex(0); return; }
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#0d0d0f' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-4xl rounded-2xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500"
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: '#111114',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: result ? '0 0 80px rgba(212,168,39,0.06)' : 'none',
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center px-8 w-full max-w-sm">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse"
                style={{ backgroundColor: 'rgba(212,168,39,0.1)' }}
              >
                <Wand2 size={28} className="text-[#d4a827]" />
              </div>
              <div className="w-full mb-5">
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#d4a827',
                      boxShadow: '0 0 12px rgba(212,168,39,0.3)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-base">{STATUS_MESSAGES[msgIndex].icon}</span>
                <p className="text-[13px] font-medium" style={{ color: '#e8e6e0' }}>
                  {STATUS_MESSAGES[msgIndex].text}
                </p>
              </div>
              <p className="text-[11px]" style={{ color: '#5a5a62' }}>This may take a few seconds...</p>
            </div>
          ) : result ? (
            <div className="w-full h-full relative group">
              <img src={result} alt="Generated thumbnail" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={onDownload}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#e8e6e0',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={onRedo}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#e8e6e0',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <RotateCcw size={14} /> Redo
                </button>
              </div>
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#9a9890', backdropFilter: 'blur(8px)' }}>
                  AI Generated
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-700">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 hover:scale-105 cursor-default"
                style={{ backgroundColor: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.1)' }}
              >
                <Sparkles size={26} className="text-[#d4a827]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#e8e6e0] mb-2 tracking-tight">Ready to create</h2>
              <p className="text-[13px]" style={{ color: '#5a5a62', maxWidth: 240, lineHeight: 1.6 }}>
                Configure your settings in the tool panel and click <span style={{ color: '#d4a827', fontWeight: 600 }}>Create</span> to generate your thumbnail
              </p>
              <div className="flex items-center gap-3 mt-6">
                {['16:9', '9:16'].map((asp) => (
                  <div
                    key={asp}
                    className="px-3 py-1 rounded-lg text-[10px] font-mono"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#5a5a62', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {asp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
