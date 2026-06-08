'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText, Plus, User, Palette, X, ChevronDown, Sparkles,
} from 'lucide-react';

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#d4a827', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
  '#ffffff', '#5a5a62', '#9a9890', '#0d0d0f', '#e85c26',
];

const STYLE_OPTIONS = [
  { value: 'basic', label: 'Basic', cost: 20 },
  { value: 'pro', label: 'Pro', cost: 50 },
  { value: 'ultra', label: 'Ultra', cost: 100 },
];

export default function Sidebar({
  title, onTitleChange,
  references, onReferencesChange,
  personImage, onPersonImageChange,
  colors, onColorsChange,
  model, onModelChange,
  dimension, onDimensionChange,
  onGenerate, loading, estimatedCost,
}) {
  const fileRef = useRef(null);
  const personRef = useRef(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [titleFocus, setTitleFocus] = useState(false);
  const colorRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target)) setColorOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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

  const toggleColor = (c) => {
    if (colors?.includes(c)) onColorsChange?.(colors.filter((x) => x !== c));
    else onColorsChange?.([...(colors || []), c]);
  };

  const sectionStyle = {
    backgroundColor: '#111114',
    border: '1px solid #1e1e22',
    borderRadius: 12,
    padding: 14,
  };

  const sectionLabel = (text, counter) => (
    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
      <span
        className="font-semibold"
        style={{ fontSize: 12, color: '#9a9890' }}
      >
        {text}
      </span>
      {counter != null && (
        <span style={{ fontSize: 11, color: '#5a5a62' }}>
          {counter}
        </span>
      )}
    </div>
  );

  return (
    <aside
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        width: 300,
        backgroundColor: '#0d0d0f',
        borderRight: '1px solid #1e1e22',
      }}
    >
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a2e transparent',
        }}
      >
        {/* Section A: Title */}
        <div style={sectionStyle}>
          {sectionLabel('Title', `${(title || '').length}/100`)}
          <textarea
            value={title}
            onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
            onFocus={() => setTitleFocus(true)}
            onBlur={() => setTitleFocus(false)}
            placeholder="Write your video title... (use @ to tag images)"
            rows={3}
            className="w-full outline-none transition-colors"
            style={{
              fontSize: 13,
              borderRadius: 7,
              backgroundColor: '#0d0d0f',
              border: `1px solid ${titleFocus ? '#d4a827' : '#1e1e22'}`,
              color: '#e8e6e0',
              padding: '10px 12px',
              resize: 'none',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Section B: References */}
        <div style={sectionStyle}>
          {sectionLabel('References', `${references?.length || 0}/10`)}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleRefs} hidden />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 transition-colors"
            style={{
              fontSize: 12,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 8,
              border: '1px dashed #2a2a2e',
              backgroundColor: 'transparent',
              color: '#9a9890',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4a827';
              e.currentTarget.style.color = '#d4a827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2e';
              e.currentTarget.style.color = '#9a9890';
            }}
          >
            <Plus size={14} />
            Add reference (style / assets)
          </button>
          {references?.length > 0 && (
            <div
              className="flex flex-wrap"
              style={{ marginTop: 10, gap: 6 }}
            >
              {references.map((ref, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={{
                    width: 56,
                    height: 32,
                    borderRadius: 7,
                    overflow: 'hidden',
                    border: '1px solid #2a2a2e',
                    backgroundColor: '#0d0d0f',
                  }}
                >
                  <img
                    src={URL.createObjectURL(ref)}
                    alt=""
                    className="w-full h-full"
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => onReferencesChange?.(references.filter((_, j) => j !== i))}
                    className="absolute flex items-center justify-center"
                    style={{
                      top: 2,
                      right: 2,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={8} style={{ color: '#fff' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C: Colors & Person */}
        <div style={sectionStyle}>
          {sectionLabel('Style')}
          <div className="flex" style={{ gap: 8 }}>
            <div className="flex-1 relative" ref={colorRef}>
              <button
                onClick={() => setColorOpen(!colorOpen)}
                className="w-full flex items-center justify-center gap-2 transition-colors"
                style={{
                  fontSize: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 8,
                  border: `1px solid ${colorOpen || (colors?.length || 0) > 0 ? '#d4a827' : '#1e1e22'}`,
                  backgroundColor: colorOpen || (colors?.length || 0) > 0 ? 'rgba(212, 168, 39, 0.08)' : 'transparent',
                  color: colorOpen || (colors?.length || 0) > 0 ? '#d4a827' : '#9a9890',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <Palette size={14} />
                Add colors
                {colors?.length > 0 && (
                  <span style={{ fontSize: 11, color: '#d4a827', marginLeft: 4 }}>
                    ({colors.length})
                  </span>
                )}
              </button>
              {colorOpen && (
                <div
                  className="absolute z-50"
                  style={{
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#111114',
                    border: '1px solid #2a2a2e',
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleColor(c)}
                        className="transition-transform"
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 6,
                          backgroundColor: c,
                          border: colors?.includes(c)
                            ? '2px solid #d4a827'
                            : c === '#ffffff'
                              ? '1px solid #2a2a2e'
                              : '1px solid transparent',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ))}
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      paddingTop: 10,
                      borderTop: '1px solid #1e1e22',
                      gap: 8,
                    }}
                  >
                    <input
                      type="color"
                      onChange={(e) => {
                        if (!colors?.includes(e.target.value)) {
                          onColorsChange?.([...(colors || []), e.target.value]);
                        }
                      }}
                      className="shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        borderRadius: 6,
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#5a5a62' }}>
                      Custom color
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input ref={personRef} type="file" accept="image/*" onChange={handlePerson} hidden />
              <button
                onClick={() => personRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 transition-colors"
                style={{
                  fontSize: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 8,
                  border: `1px solid ${personImage ? '#d4a827' : '#1e1e22'}`,
                  backgroundColor: personImage ? 'rgba(212, 168, 39, 0.08)' : 'transparent',
                  color: personImage ? '#d4a827' : '#9a9890',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {personImage ? (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      overflow: 'hidden',
                      border: '1px solid #d4a827',
                    }}
                  >
                    <img
                      src={personImage}
                      alt=""
                      className="w-full h-full"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <User size={14} />
                )}
                {personImage ? 'Change' : 'Add person'}
              </button>
            </div>
          </div>
        </div>

        {/* Section D: Dimensions & Model */}
        <div style={sectionStyle}>
          {sectionLabel('Dimensions')}
          <div className="flex" style={{ gap: 6, marginBottom: 12 }}>
            {['16:9', '9:16'].map((d) => {
              const isActive = dimension === d;
              return (
                <button
                  key={d}
                  onClick={() => onDimensionChange?.(d)}
                  className="relative flex-1 font-bold transition-colors"
                  style={{
                    fontSize: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 7,
                    backgroundColor: isActive ? '#d4a827' : '#0d0d0f',
                    color: isActive ? '#0d0d0f' : '#9a9890',
                    border: isActive ? '1px solid #d4a827' : '1px solid #1e1e22',
                    cursor: 'pointer',
                  }}
                >
                  {d}
                  {d === '9:16' && !isActive && (
                    <span
                      className="absolute font-extrabold"
                      style={{
                        top: -6,
                        right: -6,
                        fontSize: 9,
                        paddingLeft: 5,
                        paddingRight: 5,
                        paddingTop: 2,
                        paddingBottom: 2,
                        borderRadius: 7,
                        backgroundColor: '#e85c26',
                        color: '#fff',
                        letterSpacing: '0.5px',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {sectionLabel('Model')}
          <div className="relative">
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full outline-none appearance-none cursor-pointer font-semibold"
              style={{
                fontSize: 13,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 12,
                paddingRight: 32,
                borderRadius: 7,
                backgroundColor: '#0d0d0f',
                border: '1px solid #1e1e22',
                color: '#e8e6e0',
                fontFamily: 'inherit',
              }}
            >
              {STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: '#111114' }}>
                  {opt.label} — {opt.cost} pts
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute pointer-events-none"
              style={{ right: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a62' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Cost + Create */}
      <div
        style={{
          padding: 14,
          borderTop: '1px solid #1e1e22',
          backgroundColor: '#0d0d0f',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            marginBottom: 10,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            backgroundColor: '#111114',
            border: '1px solid #1e1e22',
          }}
        >
          <span style={{ fontSize: 11, color: '#9a9890' }}>Estimated cost</span>
          <span
            className="font-extrabold"
            style={{ fontSize: 14, color: '#d4a827' }}
          >
            {estimatedCost} pts
          </span>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || !title?.trim()}
          className="w-full font-extrabold flex items-center justify-center gap-2 transition-all"
          style={{
            height: 48,
            fontSize: 14,
            borderRadius: 8,
            backgroundColor: loading || !title?.trim() ? '#1e1e22' : '#d4a827',
            color: loading || !title?.trim() ? '#5a5a62' : '#0d0d0f',
            border: 'none',
            cursor: loading ? 'wait' : !title?.trim() ? 'not-allowed' : 'pointer',
            letterSpacing: '0.3px',
          }}
        >
          {loading ? (
            <>
              <span
                className="inline-block"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  border: '2px solid #5a5a62',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Create
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
