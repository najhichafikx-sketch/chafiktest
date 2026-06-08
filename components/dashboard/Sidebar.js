'use client';

import { useState, useRef } from 'react';
import { FileText, Plus, UserPlus, Palette, Image as ImageIcon, X, Sparkles, Hexagon } from 'lucide-react';

export default function Sidebar({
  title, onTitleChange, references, onReferencesChange,
  personImage, onPersonImageChange, colors, onColorsChange,
  model, onModelChange, dimension, onDimensionChange,
  onGenerate, loading, estimatedCost,
}) {
  const fileRef = useRef(null);
  const personRef = useRef(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [focus, setFocus] = useState(null);

  const handleRefs = (e) => {
    const files = Array.from(e.target.files || []);
    const rem = 10 - (references?.length || 0);
    onReferencesChange?.([...(references || []), ...files.slice(0, rem)]);
    e.target.value = '';
  };
  const handlePerson = (e) => {
    const f = e.target.files?.[0];
    if (f) onPersonImageChange?.(URL.createObjectURL(f));
    e.target.value = '';
  };

  const colorsPreset = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff', '#6b7280'];

  const section = (label, kids) => (
    <div className="p-3.5 rounded-xl transition-all duration-200" style={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.04)' }}>
      {label}
      {kids}
    </div>
  );

  const lbl = (icon, text, extra) => (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234,179,8,0.1)' }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.6px]" style={{ color: '#808090' }}>{text}</span>
      </div>
      {extra}
    </div>
  );

  const btnCls = (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    border: active ? '1px solid rgba(234,179,8,0.25)' : '1px dashed rgba(255,255,255,0.06)',
    color: active ? '#eab308' : '#606070',
    backgroundColor: active ? 'rgba(234,179,8,0.06)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <aside className="flex flex-col h-full shrink-0" style={{ width: 310, backgroundColor: '#0a0a0f', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#eab308] to-[#e85c26] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 12px rgba(234,179,8,0.25)' }}>
          <Hexagon size={13} className="text-[#0a0a0f]" />
        </div>
        <span className="text-[13px] font-extrabold tracking-tight" style={{ color: '#f0f0f0' }}>Controls</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.15)' }}>READY</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.03) transparent' }}>
        {/* Title */}
        {section(
          lbl(<FileText size={11} className="text-[#eab308]" />, 'Title', <span className="text-[10px] font-mono" style={{ color: (title?.length || 0) > 80 ? '#ef4444' : '#606070' }}>{(title || '').length}/100</span>),
          <div className="relative">
            <textarea value={title} onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
              onFocus={() => setFocus('t')} onBlur={() => setFocus(null)}
              placeholder="e.g. I Tested This AI Tool for 30 Days..."
              rows={3} className="w-full text-[12px] rounded-xl resize-none outline-none transition-all duration-200 leading-relaxed"
              style={{
                backgroundColor: '#0a0a0f', border: `1px solid ${focus === 't' ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.05)'}`,
                padding: '10px 14px', color: '#f0f0f0',
                boxShadow: focus === 't' ? '0 0 24px rgba(234,179,8,0.03)' : 'none',
              }} />
            <span className="absolute bottom-2.5 left-3 text-[9px]" style={{ color: '#404048' }}>Use <span className="text-[#eab308] font-bold">@</span> to position images</span>
          </div>
        )}

        {/* References */}
        {section(
          lbl(<ImageIcon size={11} className="text-[#eab308]" />, 'References', <span className="text-[10px] font-mono" style={{ color: '#606070' }}>{(references?.length || 0)}/10</span>),
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleRefs} hidden />
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={btnCls(references?.length > 0)}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(234,179,8,0.35)'; e.target.style.backgroundColor = 'rgba(234,179,8,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = references?.length > 0 ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.06)'; e.target.style.backgroundColor = references?.length > 0 ? 'rgba(234,179,8,0.06)' : 'transparent'; }}>
              <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
              Add reference images
            </button>
            {references?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {references.map((ref, i) => (
                  <div key={i} className="group relative w-[68px] aspect-video rounded-lg overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-[#eab308]/40" style={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => onReferencesChange?.(references.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={7} className="text-white" /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Person + Colors */}
        <div className="flex gap-2.5">
          <div className="flex-1 p-3.5 rounded-xl" style={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.04)' }}>
            {lbl(<UserPlus size={11} className="text-[#eab308]" />, 'Person')}
            <input ref={personRef} type="file" accept="image/*" onChange={handlePerson} hidden />
            <button onClick={() => personRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={btnCls(!!personImage)}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(234,179,8,0.35)'; e.target.style.backgroundColor = 'rgba(234,179,8,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = personImage ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.06)'; e.target.style.backgroundColor = personImage ? 'rgba(234,179,8,0.06)' : 'transparent'; }}>
              {personImage ? (
                <div className="w-5 h-5 rounded-full overflow-hidden ring-2" style={{ boxShadow: '0 0 12px rgba(234,179,8,0.2)' }}>
                  <img src={personImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : <UserPlus size={14} />}
              {personImage ? 'Change' : 'Upload photo'}
            </button>
          </div>
          <div className="flex-1 p-3.5 rounded-xl relative" style={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.04)' }}>
            {lbl(<Palette size={11} className="text-[#eab308]" />, 'Colors')}
            <button onClick={() => setColorOpen(!colorOpen)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={btnCls(colors?.length > 0)}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(234,179,8,0.35)'; e.target.style.backgroundColor = 'rgba(234,179,8,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = colors?.length > 0 ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.06)'; e.target.style.backgroundColor = colors?.length > 0 ? 'rgba(234,179,8,0.06)' : 'transparent'; }}>
              {colors?.length > 0 ? (
                <div className="flex -space-x-1">
                  {colors.slice(0, 4).map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-[#121218]" style={{ backgroundColor: c }} />)}
                </div>
              ) : <Palette size={14} />}
              {colors?.length > 0 ? `${colors.length} colors` : 'Pick palette'}
            </button>
            {colorOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {colorsPreset.map((c) => (
                    <button key={c} onClick={() => onColorsChange?.([...(colors || []), c])}
                      className="w-6 h-6 rounded-full transition-all duration-150 hover:scale-125 active:scale-95"
                      style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid rgba(255,255,255,0.15)' : colors?.includes(c) ? '2px solid #eab308' : '1px solid transparent' }} />
                  ))}
                </div>
                <div className="flex items-center gap-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <input type="color" onChange={(e) => onColorsChange?.([...(colors || []), e.target.value])} className="w-8 h-8 rounded-lg cursor-pointer shrink-0" style={{ border: 'none', padding: 0, background: 'transparent' }} />
                  <span className="text-[10px]" style={{ color: '#606070' }}>Custom color</span>
                </div>
                {colors?.length > 0 && (
                  <div className="mt-3 pt-2.5 flex flex-wrap gap-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-[8px] font-mono uppercase" style={{ color: '#808090' }}>{c.slice(1)}</span>
                        <button onClick={() => onColorsChange?.(colors.filter((_, j) => j !== i))} className="text-[#606070] hover:text-red-400 transition-colors"><X size={8} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Model + Dimensions */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-2.5" style={{ color: '#808090' }}>Model</span>
              <select value={model} onChange={(e) => onModelChange(e.target.value)}
                className="w-full text-[12px] font-semibold rounded-xl outline-none appearance-none cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.05)', padding: '9px 12px',
                  color: '#f0f0f0',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23606070' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '14px',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(234,179,8,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}>
                <option value="basic">Basic &mdash; 20 pts</option>
                <option value="pro">Pro &mdash; 50 pts</option>
                <option value="ultra">Ultra &mdash; 100 pts</option>
              </select>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-2.5" style={{ color: '#808090' }}>Aspect</span>
              <div className="flex gap-1.5">
                {['16:9', '9:16'].map((d) => (
                  <button key={d} onClick={() => onDimensionChange?.(d)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold relative transition-all duration-200"
                    style={{
                      backgroundColor: dimension === d ? '#eab308' : '#0a0a0f',
                      color: dimension === d ? '#0a0a0f' : '#606070',
                      border: dimension === d ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: dimension === d ? '0 4px 16px rgba(234,179,8,0.25)' : 'none',
                    }}
                    onMouseEnter={e => { if (dimension !== d) e.target.style.borderColor = 'rgba(234,179,8,0.3)'; }}
                    onMouseLeave={e => { if (dimension !== d) e.target.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                    {d}
                    {d === '9:16' && <span className="absolute -top-2.5 -right-2.5 text-[6px] font-extrabold text-white px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #e85c26, #eab308)' }}>NEW</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', backgroundColor: '#0a0a0f' }}>
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#eab308]">{estimatedCost} <span className="text-[10px] font-medium" style={{ color: '#606070' }}>pts</span></span>
          </div>
          <span className="text-[9px] font-medium" style={{ color: '#808090' }}>Estimated cost</span>
        </div>
        <button onClick={onGenerate} disabled={loading || !title?.trim()}
          className="w-full py-3.5 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group"
          style={{
            backgroundColor: loading || !title?.trim() ? '#181820' : '#eab308',
            color: loading || !title?.trim() ? '#404048' : '#0a0a0f',
            cursor: loading ? 'wait' : !title?.trim() ? 'not-allowed' : 'pointer',
            boxShadow: !loading && title?.trim() ? '0 6px 30px rgba(234,179,8,0.3)' : 'none',
          }}>
          {loading ? (
            <><span className="inline-block w-4 h-4 rounded-full border-2 border-[#404048] border-t-transparent animate-spin" /> Generating...</>
          ) : (
            <><span className="relative z-10 flex items-center gap-2"><Sparkles size={15} /> Create Thumbnail</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', transform: 'skewX(-20deg)' }} /></>
          )}
        </button>
      </div>
    </aside>
  );
}
