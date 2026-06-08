'use client';

import { useState, useRef } from 'react';
import { FileText, Plus, UserPlus, Palette, ChevronDown, Image as ImageIcon, X, Sparkles, Trash2, HelpCircle } from 'lucide-react';

export default function Sidebar({
  title, onTitleChange, references, onReferencesChange,
  personImage, onPersonImageChange, colors, onColorsChange,
  model, onModelChange, dimension, onDimensionChange,
  onGenerate, loading, estimatedCost,
}) {
  const fileInputRef = useRef(null);
  const personInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const handleRefs = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - (references?.length || 0);
    onReferencesChange?.([...(references || []), ...files.slice(0, remaining)]);
    e.target.value = '';
  };
  const handlePerson = (e) => {
    const f = e.target.files?.[0];
    if (f) onPersonImageChange?.(URL.createObjectURL(f));
    e.target.value = '';
  };

  const presetColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#FFFFFF', '#6B7280'];

  const SectionLabel = ({ icon, label, count, right }) => (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,39,0.1)' }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: '#9a9890' }}>{label}</span>
      </div>
      {right || (count !== undefined && <span className="text-[10px] font-mono" style={{ color: '#5a5a62' }}>{count}</span>)}
    </div>
  );

  const inputSx = {
    width: '100%',
    backgroundColor: '#0d0d0f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e8e6e0',
    fontSize: 12,
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const btnSx = (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    border: active ? '1px solid rgba(212,168,39,0.3)' : '1px dashed rgba(255,255,255,0.08)',
    color: active ? '#d4a827' : '#5a5a62',
    backgroundColor: active ? 'rgba(212,168,39,0.06)' : 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <aside className="flex flex-col h-full relative" style={{ width: 300, backgroundColor: '#111114', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Panel header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#d4a827] to-[#e85c26] flex items-center justify-center shadow-lg shadow-[#d4a827]/20">
          <Sparkles size={13} className="text-black" />
        </div>
        <div>
          <span className="text-[13px] font-extrabold tracking-tight" style={{ color: '#e8e6e0' }}>Tool Panel</span>
          <span className="text-[9px] mr-2 px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(212,168,39,0.1)', color: '#d4a827', border: '1px solid rgba(212,168,39,0.15)' }}>ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.04) transparent' }}>
        {/* ===== TITLE ===== */}
        <div className="p-3.5 rounded-xl transition-all duration-200" style={{ backgroundColor: '#0d0d0f', border: `1px solid ${focusField === 'title' ? 'rgba(212,168,39,0.2)' : 'rgba(255,255,255,0.03)'}` }}>
          <SectionLabel icon={<FileText size={11} className="text-[#d4a827]" />} label="Video Title" count={`${(title || '').length}/100`} />
          <div className="relative">
            <textarea
              value={title}
              onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
              onFocus={() => setFocusField('title')}
              onBlur={() => setFocusField(null)}
              placeholder="e.g. I Tried This AI Tool for 30 Days..."
              rows={3}
              className="w-full text-[12px] rounded-xl resize-none outline-none transition-all duration-200 leading-relaxed"
              style={{
                ...inputSx,
                borderColor: focusField === 'title' ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.06)',
                boxShadow: focusField === 'title' ? '0 0 20px rgba(212,168,39,0.04)' : 'none',
              }}
            />
            <div className="absolute bottom-2.5 left-3 flex items-center gap-1 opacity-40">
              <span className="text-[9px]" style={{ color: '#5a5a62' }}>Tip: use</span>
              <span className="text-[9px] font-bold text-[#d4a827]">@</span>
              <span className="text-[9px]" style={{ color: '#5a5a62' }}>to tag images</span>
            </div>
          </div>
        </div>

        {/* ===== REFERENCES ===== */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.03)' }}>
          <SectionLabel icon={<ImageIcon size={11} className="text-[#d4a827]" />} label="References" count={`${references?.length || 0}/10`} />
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleRefs} hidden />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200 group"
            style={btnSx(references?.length > 0)}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(212,168,39,0.4)'; e.target.style.backgroundColor = 'rgba(212,168,39,0.08)'; }}
            onMouseLeave={e => { e.target.style.borderColor = references?.length > 0 ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = references?.length > 0 ? 'rgba(212,168,39,0.06)' : 'rgba(255,255,255,0.02)'; }}
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90 duration-200" />
            <span>Add reference images</span>
          </button>
          {references?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {references.map((ref, i) => (
                <div key={i} className="group relative w-[68px] aspect-video rounded-lg overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-[#d4a827]/40" style={{ backgroundColor: '#111114', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => onReferencesChange?.(references.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <X size={8} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== PERSON + COLORS ===== */}
        <div className="flex gap-2.5">
          {/* Person */}
          <div className="flex-1 p-3.5 rounded-xl" style={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.03)' }}>
            <SectionLabel icon={<UserPlus size={11} className="text-[#d4a827]" />} label="Person" />
            <input ref={personInputRef} type="file" accept="image/*" onChange={handlePerson} hidden />
            <button
              onClick={() => personInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={btnSx(!!personImage)}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(212,168,39,0.4)'; e.target.style.backgroundColor = 'rgba(212,168,39,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = personImage ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = personImage ? 'rgba(212,168,39,0.06)' : 'rgba(255,255,255,0.02)'; }}
            >
              {personImage ? (
                <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-[#d4a827]/40 shadow-lg shadow-[#d4a827]/10">
                  <img src={personImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : <UserPlus size={14} />}
              {personImage ? 'Change photo' : 'Upload photo'}
            </button>
          </div>

          {/* Colors */}
          <div className="flex-1 p-3.5 rounded-xl relative" style={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.03)' }}>
            <SectionLabel icon={<Palette size={11} className="text-[#d4a827]" />} label="Colors" />
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={btnSx(colors?.length > 0)}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(212,168,39,0.4)'; e.target.style.backgroundColor = 'rgba(212,168,39,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = colors?.length > 0 ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = colors?.length > 0 ? 'rgba(212,168,39,0.06)' : 'rgba(255,255,255,0.02)'; }}
            >
              {colors?.length > 0 ? (
                <div className="flex -space-x-1">
                  {colors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border-2 border-[#0d0d0f]" style={{ backgroundColor: c }} />
                  ))}
                </div>
              ) : <Palette size={14} />}
              {colors?.length > 0 ? `${colors.length} colors` : 'Pick palette'}
            </button>

            {/* Color picker popover */}
            {showColorPicker && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: '#111114', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {presetColors.map((c) => (
                    <button key={c} onClick={() => onColorsChange?.([...(colors || []), c])}
                      className="w-6 h-6 rounded-full transition-all duration-150 hover:scale-125 active:scale-95"
                      style={{
                        backgroundColor: c,
                        border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : colors?.includes(c) ? '2px solid #d4a827' : '1px solid transparent',
                        boxShadow: colors?.includes(c) ? '0 0 12px rgba(212,168,39,0.3)' : 'none',
                      }} />
                  ))}
                </div>
                <div className="flex items-center gap-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <input type="color" onChange={(e) => onColorsChange?.([...(colors || []), e.target.value])}
                    className="w-8 h-8 rounded-lg cursor-pointer flex-shrink-0" style={{ border: 'none', padding: 0, backgroundColor: 'transparent' }} />
                  <span className="text-[10px]" style={{ color: '#5a5a62' }}>Custom color</span>
                </div>
                {colors?.length > 0 && (
                  <div className="mt-3 pt-2.5 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-[8px] font-mono uppercase" style={{ color: '#9a9890' }}>{c.slice(1)}</span>
                        <button onClick={() => onColorsChange?.(colors.filter((_, j) => j !== i))} className="text-[#5a5a62] hover:text-red-400 transition-colors ml-0.5">
                          <Trash2 size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== MODEL + DIMENSIONS ===== */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <ChevronDown size={10} className="text-[#5a5a62]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5px]" style={{ color: '#9a9890' }}>Model</span>
              </div>
              <div className="relative">
                <select value={model} onChange={(e) => onModelChange(e.target.value)}
                  className="w-full text-[12px] font-semibold rounded-xl outline-none appearance-none cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.06)', padding: '9px 12px',
                    color: '#e8e6e0',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,168,39,0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <option value="basic">Basic &mdash; 20 pts</option>
                  <option value="pro">Pro &mdash; 50 pts</option>
                  <option value="ultra">Ultra &mdash; 100 pts</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <ImageIcon size={10} className="text-[#d4a827]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5px]" style={{ color: '#9a9890' }}>Aspect</span>
              </div>
              <div className="flex gap-1.5">
                {['16:9', '9:16'].map((d) => (
                  <button key={d} onClick={() => onDimensionChange?.(d)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold relative transition-all duration-200"
                    style={{
                      backgroundColor: dimension === d ? '#d4a827' : '#0d0d0f',
                      color: dimension === d ? '#0d0d0f' : '#5a5a62',
                      border: dimension === d ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: dimension === d ? '0 4px 16px rgba(212,168,39,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (dimension !== d) e.target.style.borderColor = 'rgba(212,168,39,0.3)'; }}
                    onMouseLeave={e => { if (dimension !== d) e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                    {d}
                    {d === '9:16' && <span className="absolute -top-2.5 -right-2.5 text-[6px] font-extrabold bg-gradient-to-r from-[#e85c26] to-[#d4a827] text-white px-1.5 py-0.5 rounded-full">NEW</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ACTION BAR ===== */}
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', backgroundColor: '#111114' }}>
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200" style={{ backgroundColor: 'rgba(212,168,39,0.05)', border: '1px solid rgba(212,168,39,0.1)' }}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black" style={{ color: '#d4a827' }}>{estimatedCost}</span>
            <span className="text-[10px] font-medium" style={{ color: '#5a5a62' }}>points</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle size={10} className="text-[#5a5a62]" />
            <span className="text-[9px] font-medium" style={{ color: '#9a9890' }}>Estimated</span>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || !title?.trim()}
          className="w-full py-3.5 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group"
          style={{
            backgroundColor: loading || !title?.trim() ? '#1e1e22' : '#d4a827',
            color: loading || !title?.trim() ? '#5a5a62' : '#0d0d0f',
            cursor: loading ? 'wait' : !title?.trim() ? 'not-allowed' : 'pointer',
            boxShadow: !loading && title?.trim() ? '0 4px 24px rgba(212,168,39,0.3)' : 'none',
          }}
        >
          {loading ? (
            <><span className="inline-block w-4 h-4 rounded-full border-2 border-[#5a5a62] border-t-transparent animate-spin" /> Generating...</>
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={15} />
                Create Thumbnail
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', transform: 'skewX(-20deg)' }} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
