'use client';

import { useState, useRef } from 'react';
import { FileText, Plus, UserPlus, Palette, ChevronDown, Image as ImageIcon, HelpCircle, X, Trash2, Sparkles } from 'lucide-react';

export default function Sidebar({
  title,
  onTitleChange,
  references,
  onReferencesChange,
  personImage,
  onPersonImageChange,
  colors,
  onColorsChange,
  model,
  onModelChange,
  dimension,
  onDimensionChange,
  onGenerate,
  loading,
  estimatedCost,
}) {
  const fileInputRef = useRef(null);
  const personInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - (references?.length || 0);
    const toAdd = files.slice(0, remaining);
    onReferencesChange?.([...(references || []), ...toAdd]);
    e.target.value = '';
  };

  const removeReference = (index) => {
    const updated = references.filter((_, i) => i !== index);
    onReferencesChange?.(updated);
  };

  const handlePersonUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onPersonImageChange?.(url);
    }
    e.target.value = '';
  };

  const handleColorAdd = (color) => {
    onColorsChange?.([...(colors || []), color]);
  };

  const removeColor = (index) => {
    const updated = colors.filter((_, i) => i !== index);
    onColorsChange?.(updated);
  };

  const presetColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4',
    '#FFFFFF', '#9CA3AF', '#6B7280', '#1F2937',
  ];

  const sectionCard = (children, label, icon, bgGlow = false) => (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        backgroundColor: '#0d0d0f',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: 14,
      }}
      onMouseEnter={() => setHoveredSection(label)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: hoveredSection === label ? 'rgba(212,168,39,0.15)' : 'rgba(255,255,255,0.04)',
            }}
          >
            {icon}
          </div>
          <span style={{ color: '#9a9890', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {label.replace(/\d+$/, '')}
          </span>
        </div>
      </div>
      {children}
    </div>
  );

  const btnBase = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    border: '1px dashed rgba(212,168,39,0.2)',
    color: '#d4a827',
    backgroundColor: 'rgba(212,168,39,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <aside
      style={{
        width: 320,
        backgroundColor: '#0d0d0f',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e22 transparent' }}>
        {/* Header */}
        <div className="flex items-center gap-2.5 px-1 py-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4a827] to-[#e85c26] flex items-center justify-center shadow-lg shadow-[#d4a827]/20">
            <Sparkles size={14} className="text-black" />
          </div>
          <span style={{ color: '#e8e6e0', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>Tool Panel</span>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(212,168,39,0.1)', border: '1px solid rgba(212,168,39,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a827] animate-pulse" />
            <span style={{ color: '#d4a827', fontSize: 9, fontWeight: 700, letterSpacing: '0.3px' }}>ACTIVE</span>
          </div>
        </div>

        {/* Section A - Title */}
        {sectionCard(
          <>
            <div className="relative">
              <textarea
                value={title}
                onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholder="Write your video title..."
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${titleFocused ? 'rgba(212,168,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: '#e8e6e0',
                  fontSize: 13,
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.5,
                }}
              />
              <div
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono transition-all"
                style={{
                  backgroundColor: (title?.length || 0) > 80 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  color: (title?.length || 0) > 80 ? '#EF4444' : '#5a5a62',
                }}
              >
                <span>{title?.length || 0}</span>
                <span style={{ opacity: 0.5 }}>/</span>
                <span>100</span>
              </div>
            </div>
            <p style={{ color: '#5a5a62', fontSize: 10, marginTop: 6, paddingLeft: 2 }}>
              Tip: Use <span style={{ color: '#d4a827' }}>@</span> to tag and position images
            </p>
          </>,
          'Title',
          <FileText size={13} className="text-[#d4a827]" />
        )}

        {/* Section B - References */}
        {sectionCard(
          <>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleReferenceUpload} style={{ display: 'none' }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={btnBase}
              onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(212,168,39,0.1)'; e.target.style.borderColor = 'rgba(212,168,39,0.4)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(212,168,39,0.04)'; e.target.style.borderColor = 'rgba(212,168,39,0.2)'; }}
            >
              <Plus size={15} />
              Add reference images
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(212,168,39,0.15)', color: '#d4a827' }}>
                {references?.length || 0}/10
              </span>
            </button>
            {references?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {references.map((ref, i) => (
                  <div
                    key={i}
                    className="group relative w-[72px] aspect-video rounded-lg overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-[#d4a827]/50"
                    style={{ backgroundColor: '#111114', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeReference(i)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={8} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>,
          'References',
          <ImageIcon size={13} className="text-[#d4a827]" />
        )}

        {/* Section C - Person & Colors */}
        <div className="flex gap-2.5">
          <div className="flex-1">
            {sectionCard(
              <>
                <input ref={personInputRef} type="file" accept="image/*" onChange={handlePersonUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => personInputRef.current?.click()}
                  style={{
                    ...btnBase,
                    borderStyle: 'solid',
                    borderColor: personImage ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: personImage ? 'rgba(212,168,39,0.08)' : 'rgba(255,255,255,0.02)',
                    color: personImage ? '#d4a827' : '#5a5a62',
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(212,168,39,0.12)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = personImage ? 'rgba(212,168,39,0.08)' : 'rgba(255,255,255,0.02)'; }}
                >
                  {personImage ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-[#d4a827]/30">
                      <img src={personImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <UserPlus size={14} />
                  )}
                  {personImage ? 'Change' : 'Add person'}
                </button>
              </>,
              'Person',
              <UserPlus size={13} className="text-[#d4a827]" />,
              'person'
            )}
          </div>
          <div className="flex-1" style={{ position: 'relative' }}>
            {sectionCard(
              <>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    ...btnBase,
                    borderStyle: 'solid',
                    borderColor: colors?.length > 0 ? 'rgba(212,168,39,0.3)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: colors?.length > 0 ? 'rgba(212,168,39,0.08)' : 'rgba(255,255,255,0.02)',
                    color: colors?.length > 0 ? '#d4a827' : '#5a5a62',
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(212,168,39,0.12)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = colors?.length > 0 ? 'rgba(212,168,39,0.08)' : 'rgba(255,255,255,0.02)'; }}
                >
                  {colors?.length > 0 ? (
                    <div className="flex -space-x-1">
                      {colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-[#0d0d0f]" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  ) : (
                    <Palette size={14} />
                  )}
                  {colors?.length > 0 ? `${colors.length}` : 'Add colors'}
                </button>
                {showColorPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      marginTop: 4,
                      padding: 10,
                      backgroundColor: '#111114',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {presetColors.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleColorAdd(c)}
                          className="w-6 h-6 rounded-full transition-transform duration-150 hover:scale-125 active:scale-95"
                          style={{
                            backgroundColor: c,
                            border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: colors?.includes(c) ? '0 0 0 2px #d4a827' : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <input
                        type="color"
                        onChange={(e) => handleColorAdd(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer flex-shrink-0"
                        style={{ border: 'none', padding: 0, backgroundColor: 'transparent' }}
                      />
                      <span style={{ color: '#5a5a62', fontSize: 10 }}>Custom color</span>
                    </div>
                    {colors?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {colors.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                            <span style={{ color: '#9a9890', fontSize: 9, textTransform: 'uppercase', fontFamily: 'monospace' }}>{c.slice(1)}</span>
                            <button onClick={() => removeColor(i)} className="ml-0.5 text-[#5a5a62] hover:text-red-400 transition-colors">
                              <Trash2 size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>,
              'Colors',
              <Palette size={13} className="text-[#d4a827]" />,
              'colors'
            )}
          </div>
        </div>

        {/* Section D - Model & Dimensions */}
        <div
          className="rounded-xl p-4 transition-all duration-200"
          style={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <ChevronDown size={11} className="text-[#5a5a62]" />
                </div>
                <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</span>
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={model}
                  onChange={(e) => onModelChange(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    color: '#e8e6e0',
                    fontSize: 12,
                    fontWeight: 600,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="basic">Basic — 20 pts</option>
                  <option value="pro">Pro — 50 pts</option>
                  <option value="ultra">Ultra — 100 pts</option>
                </select>
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronDown size={12} className="text-[#5a5a62]" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <ImageIcon size={11} className="text-[#d4a827]" />
                </div>
                <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aspect</span>
              </div>
              <div className="flex gap-1.5">
                {['16:9', '9:16'].map((asp) => (
                  <button
                    key={asp}
                    onClick={() => onDimensionChange?.(asp)}
                    className="flex-1 py-2 rounded-lg text-[11px] font-bold relative transition-all duration-200"
                    style={{
                      backgroundColor: dimension === asp ? '#d4a827' : 'rgba(0,0,0,0.3)',
                      color: dimension === asp ? '#0d0d0f' : '#5a5a62',
                      border: dimension === asp ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={(e) => { if (dimension !== asp) e.target.style.borderColor = 'rgba(212,168,39,0.3)'; }}
                    onMouseLeave={(e) => { if (dimension !== asp) e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    {asp}
                    {asp === '9:16' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -7,
                          right: -7,
                          fontSize: 7,
                          fontWeight: 800,
                          backgroundColor: '#e85c26',
                          color: '#fff',
                          padding: '1px 4px',
                          borderRadius: 4,
                          letterSpacing: '0.3px',
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        className="p-4 space-y-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          backgroundColor: '#0d0d0f',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200"
          style={{ backgroundColor: 'rgba(212,168,39,0.06)', border: '1px solid rgba(212,168,39,0.1)' }}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black" style={{ color: '#d4a827' }}>{estimatedCost}</span>
            <span style={{ color: '#5a5a62', fontSize: 11, fontWeight: 500 }}>points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle size={11} className="text-[#5a5a62]" />
            <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 500 }}>Estimated cost</span>
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
            boxShadow: !loading && title?.trim() ? '0 4px 24px rgba(212,168,39,0.25)' : 'none',
          }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 rounded-full border-2 border-[#5a5a62] border-t-transparent animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={16} />
                Create Thumbnail
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transform: 'skewX(-20deg)',
                }}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
