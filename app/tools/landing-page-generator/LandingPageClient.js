'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { generateLandingPage, getDefaultFormData, TEMPLATES } from '@/lib/landing-page-templates';

const LANGUAGES = [
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const COOLDOWN_MS = 5 * 60 * 60 * 1000;
const STORAGE_KEY = 'lp_last_used';

const EXPORT_FORMATS = [
  { id: 'png', label: 'PNG', desc: 'صورة شفافة عالية الجودة' },
  { id: 'jpg', label: 'JPG', desc: 'صورة مضغوطة بحجم أصغر' },
  { id: 'webp', label: 'WEBP', desc: 'تنسيق ويب حديث' },
];

const SIZE_OPTIONS = [
  { id: 'mobile', label: 'KairosFit (موبايل)', w: 375, h: 700 },
  { id: 'tablet', label: 'Tablet (تابلت)', w: 768, h: 1024 },
  { id: 'desktop', label: 'Desktop (مكتب)', w: 1440, h: 900 },
];

const COLOR_PRESETS = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#0f172a'];

const cardStyle = {
  background: 'var(--bg-glass)',
  border: '1px solid var(--bg-glass-border)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--bg-glass-border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  direction: 'ltr',
};

export default function LandingPageClient() {
  const [form, setForm] = useState(getDefaultFormData());
  const [previewMode, setPreviewMode] = useState('mobile');
  const [aiLoading, setAiLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [now, setNow] = useState(() => Date.now());
  const [serverCooldown, setServerCooldown] = useState(0);
  const [apiKeyInfo, setApiKeyInfo] = useState({ isConfigured: false, maskedKey: null, source: 'none' });
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [imageSize, setImageSize] = useState('mobile');
  const [pngLoading, setPngLoading] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetch('/api/landing-page/key-status')
      .then(r => r.json())
      .then(d => setApiKeyInfo(d || { isConfigured: false, maskedKey: null, source: 'none' }))
      .catch(() => setApiKeyInfo({ isConfigured: false, maskedKey: null, source: 'none' }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#form=/, '');
    if (hash) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(hash)));
        if (decoded && typeof decoded === 'object') {
          setForm(prev => ({ ...prev, ...decoded }));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (aiLoading) return;
    const localRemaining = getLocalCooldownRemaining();
    const totalRemaining = Math.max(localRemaining, serverCooldown);
    if (totalRemaining <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [aiLoading, serverCooldown]);

  function getLocalCooldownRemaining() {
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (!last) return 0;
      const diff = Date.now() - last;
      return diff < COOLDOWN_MS ? COOLDOWN_MS - diff : 0;
    } catch { return 0; }
  }

  const localRemaining = Math.max(0, COOLDOWN_MS - (now - Number((typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 0)));
  const cooldownRemaining = Math.max(localRemaining, serverCooldown);
  const isOnCooldown = cooldownRemaining > 0;

  function formatCooldown(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${h} ساعة ${m} دقيقة`;
    if (m > 0) return `${m} دقيقة`;
    return `${totalSec} ثانية`;
  }

  const generatedHTML = useMemo(() => generateLandingPage({ ...form, dark: darkPreview }), [form, darkPreview]);

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    if (type !== 'error') {
      setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    }
  }

  async function aiEnhance() {
    if (aiLoading) return;
    if (isOnCooldown) {
      showMsg(`⏳ الخدمة غير متاحة حالياً. المحاولة التالية بعد ${formatCooldown(cooldownRemaining)}`, 'error');
      return;
    }
    if (!apiKeyInfo.isConfigured) {
      showMsg('⚙️ الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
      return;
    }
    setAiLoading(true);
    showMsg('✨ AI is enhancing your texts...', 'info');

    const customPrompt = `You are an expert landing page copywriter specializing in conversion optimization.

Given the following product info, improve the headline and description to be more professional, compelling, and conversion-focused. Keep the same meaning but make it more persuasive.

Product name: ${form.name}
Current headline: ${form.headline}
Current description: ${form.description}

Return your response in EXACTLY this plain text format (no markdown, no code blocks, no quotes):
HEADLINE: [improved headline, max 80 characters]
DESCRIPTION: [improved description, 1-2 sentences, max 200 characters]`;

    try {
      const res = await fetch('/api/landing-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          language: form.language || 'en',
          template_type: form.template || 'default'
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        const retryMs = (data.retry_after_seconds || 18000) * 1000;
        setServerCooldown(retryMs);
        showMsg('⏳ الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
        return;
      }

      const data = await res.json();
      if (!data.success && !data.text) {
        showMsg(data.message || 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
        return;
      }

      const text = (data.text || data.html || '').replace(/<[^>]*>/g, '');
      const headlineMatch = text.match(/HEADLINE:\s*([^\n]+?)(?:\s*DESCRIPTION:|$)/i);
      const descMatch = text.match(/DESCRIPTION:\s*([\s\S]+?)$/i);

      if (headlineMatch) updateField('headline', headlineMatch[1].trim().slice(0, 120));
      if (descMatch) updateField('description', descMatch[1].trim().slice(0, 300));

      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setNow(Date.now());
        setServerCooldown(0);
      } catch {}
      showMsg('✅ Texts improved by AI!', 'success');
    } catch (err) {
      showMsg('الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  function copyHTML() {
    navigator.clipboard.writeText(generatedHTML).then(
      () => showMsg('✅ HTML copied to clipboard!', 'success'),
      () => showMsg('❌ Failed to copy', 'error')
    );
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (form.name || 'landing-page').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.href = url;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg('✅ HTML file downloaded!', 'success');
  }

  async function downloadImage() {
    if (!iframeRef.current) {
      showMsg('❌ Preview not ready', 'error');
      return;
    }
    setPngLoading(true);
    showMsg('🖼️ Generating ' + exportFormat.toUpperCase() + '...', 'info');
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        showMsg('❌ Cannot access preview', 'error');
        return;
      }
      const sizeOption = SIZE_OPTIONS.find(s => s.id === imageSize) || SIZE_OPTIONS[0];
      const clonedHTML = iframeDoc.documentElement.outerHTML;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeOption.w}" height="${sizeOption.h}"><foreignObject width="100%" height="100%">${clonedHTML.replace(/<script[\s\S]*?<\/script>/gi, '')}</foreignObject></svg>`;
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = sizeOption.w;
      canvas.height = sizeOption.h;
      const ctx = canvas.getContext('2d');
      const isJpg = exportFormat === 'jpg';
      if (isJpg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sizeOption.w, sizeOption.h);
      } else {
        ctx.clearRect(0, 0, sizeOption.w, sizeOption.h);
      }
      ctx.drawImage(img, 0, 0, sizeOption.w, sizeOption.h);
      URL.revokeObjectURL(url);
      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : (exportFormat === 'webp' ? 'image/webp' : 'image/png');
      const quality = isJpg ? 0.92 : undefined;
      canvas.toBlob((blob) => {
        if (!blob) { showMsg('❌ Failed to create image', 'error'); return; }
        const imgUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (form.name || 'landing-page').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.href = imgUrl;
        a.download = `${safeName}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(imgUrl);
        showMsg(`✅ ${exportFormat.toUpperCase()} downloaded!`, 'success');
      }, mimeType, quality);
    } catch (err) {
      showMsg('❌ Image export failed: ' + err.message, 'error');
    } finally {
      setPngLoading(false);
    }
  }

  function generateShareLink() {
    try {
      const payload = btoa(encodeURIComponent(JSON.stringify(form)));
      const url = `${window.location.origin}${window.location.pathname}#form=${payload}`;
      navigator.clipboard.writeText(url).then(
        () => showMsg('✅ Shareable link copied!', 'success'),
        () => showMsg('❌ Failed to copy link', 'error')
      );
    } catch {
      showMsg('❌ Failed to generate link', 'error');
    }
  }

  const selectedSize = SIZE_OPTIONS.find(s => s.id === imageSize) || SIZE_OPTIONS[0];
  const msgColor = msg.type === 'error' ? '#ef4444' : msg.type === 'success' ? '#10b981' : 'var(--neon-purple)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #fafafa)', direction: 'rtl' }}>
      <style jsx>{`
        @media (max-width: 900px) {
          .lp-container { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--bg-glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <strong style={{ fontSize: 18, color: 'var(--text-primary)' }}>KairosFit</strong>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>· Landing Page</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={form.template}
            onChange={e => updateField('template', e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 13,
              background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
              border: '1px solid var(--bg-glass-border)'
            }}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setDarkPreview(v => !v)}
            aria-label="Toggle preview theme"
            style={{
              background: 'transparent', border: '1px solid var(--bg-glass-border)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              color: 'var(--text-primary)', fontSize: 16
            }}
          >
            {darkPreview ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{
          padding: '10px 20px', background: msgColor + '20', color: msgColor,
          textAlign: 'center', fontWeight: 600, fontSize: 14,
          borderBottom: `1px solid ${msgColor}40`
        }}>
          {msg.text}
        </div>
      )}

      <div className="lp-container" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: 16, padding: 16, maxWidth: 1400, margin: '0 auto'
      }}>

        {/* LEFT: PREVIEW */}
        <div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={sectionTitleStyle}>📱 صفحة المعاينة</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => setPreviewMode('mobile')}
                  className={previewMode === 'mobile' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ padding: '4px 10px', fontSize: 12 }}>📱 موبايل</button>
                <button type="button" onClick={() => setPreviewMode('desktop')}
                  className={previewMode === 'desktop' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ padding: '4px 10px', fontSize: 12 }}>🖥️ Desktop</button>
                <button type="button" onClick={() => setPreviewMode('tablet')}
                  className={previewMode === 'tablet' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ padding: '4px 10px', fontSize: 12 }}>📟 Tablet</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflow: 'auto', padding: 8, background: darkPreview ? '#0f0f1a' : '#f5f5f5', borderRadius: 12, minHeight: 600 }}>
              <iframe
                ref={iframeRef}
                srcDoc={generatedHTML}
                style={{
                  width: previewMode === 'mobile' ? 375 : previewMode === 'tablet' ? 768 : '100%',
                  maxWidth: '100%',
                  height: previewMode === 'mobile' ? 700 : previewMode === 'tablet' ? 800 : 700,
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: previewMode === 'mobile' ? 32 : 12,
                  background: '#fff'
                }}
                title="Landing Page Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: CONTROLS */}
        <div style={{ minWidth: 0 }}>

          {/* API KEY (linked to admin) */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🔑 مفتاح OPENROUTER API</div>
            <div style={{ position: 'relative' }}>
              <input
                type={apiKeyVisible ? 'text' : 'password'}
                value={apiKeyInfo.maskedKey || ''}
                readOnly
                placeholder={apiKeyInfo.isConfigured ? '' : 'غير مُعيَّن — يُدار من لوحة الإدارة'}
                style={{ ...inputStyle, paddingRight: 44, cursor: 'not-allowed' }}
              />
              <button
                type="button"
                onClick={() => setApiKeyVisible(v => !v)}
                aria-label={apiKeyVisible ? 'إخفاء' : 'إظهار'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', padding: 4, display: 'flex'
                }}
              >
                {apiKeyVisible ? '🙈' : '👁'}
              </button>
            </div>
            <div style={{
              marginTop: 8, padding: '6px 10px',
              background: apiKeyInfo.isConfigured ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${apiKeyInfo.isConfigured ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: 6, fontSize: 12, color: apiKeyInfo.isConfigured ? '#10b981' : '#f59e0b'
            }}>
              {apiKeyInfo.isConfigured
                ? `✓ المفتاح مرتبط بلوحة الإدارة — لا حاجة لإدخاله هنا`
                : `⚠ المفتاح يتغيَّر بـ 42... (أضفه من /admin → إعدادات الذكاء الاصطناعي)`}
            </div>
          </div>

          {/* LANGUAGE */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🌍 اختر اللغة</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => updateField('language', l.id)}
                  className={form.language === l.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ padding: '8px 4px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexDirection: 'column', minHeight: 50 }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
                  <span style={{ fontSize: '0.7rem' }}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI ENHANCE */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>✨ تحسين AI للنصوص</div>
            <button
              type="button"
              onClick={aiEnhance}
              disabled={aiLoading || isOnCooldown || !apiKeyInfo.isConfigured}
              className="btn btn-primary"
              data-tool-action
              style={{ width: '100%', marginBottom: 6 }}
            >
              {aiLoading ? '⏳ جاري التحسين...' : isOnCooldown ? '⏳ غير متاح' : !apiKeyInfo.isConfigured ? '⚙️ المفتاح غير مُعيَّن' : '✨ تحسين AI'}
            </button>
            {isOnCooldown && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                المحاولة التالية بعد {formatCooldown(cooldownRemaining)}
              </div>
            )}
            {apiKeyInfo.isConfigured && !isOnCooldown && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 4 }}>
                يحسّن العنوان والوصف تلقائياً
              </div>
            )}
          </div>

          {/* EXPORT FORMAT */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>📦 تنسيق التصدير</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 6 }}>
              {EXPORT_FORMATS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id)}
                  className={exportFormat === f.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ padding: '8px 4px', fontSize: 13 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              يمكنك تصدير أو تنزيل بأي من تنسيقات PNG - JPG - WEBP
            </div>
          </div>

          {/* IMAGE SIZE */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>📐 حجم الصورة</div>
            <select
              value={imageSize}
              onChange={e => setImageSize(e.target.value)}
              style={inputStyle}
            >
              {SIZE_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.label} ({s.w}×{s.h})</option>
              ))}
            </select>
          </div>

          {/* BRAND COLOR */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🎨 لون العلامة التجارية</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input
                type="color"
                value={form.color}
                onChange={e => updateField('color', e.target.value)}
                style={{ width: 48, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
              />
              <input
                type="text"
                value={form.color}
                onChange={e => updateField('color', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateField('color', c)}
                  aria-label={`Color ${c}`}
                  style={{
                    width: 26, height: 26, borderRadius: 6, background: c,
                    border: form.color === c ? '2px solid var(--text-primary)' : '1px solid var(--bg-glass-border)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          {/* BASIC INFO */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>📝 معلومات أساسية</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="اسم المنتج / الخدمة *"
                style={inputStyle}
              />
              <input
                type="text"
                value={form.headline}
                onChange={e => updateField('headline', e.target.value)}
                placeholder="العنوان الرئيسي"
                style={inputStyle}
              />
              <textarea
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="الوصف المختصر"
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  value={form.ctaText}
                  onChange={e => updateField('ctaText', e.target.value)}
                  placeholder="نص الزر"
                  style={inputStyle}
                />
                <input
                  type="url"
                  value={form.ctaUrl}
                  onChange={e => updateField('ctaUrl', e.target.value)}
                  placeholder="رابط الزر"
                  style={inputStyle}
                />
              </div>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="📞 رقم الهاتف (مثل +966 5X XXX XXXX)"
                style={inputStyle}
              />
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={e => updateField('whatsapp', e.target.value)}
                placeholder="💬 واتساب (رقم أو بريد)"
                style={inputStyle}
              />
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🔗 منصات التواصل</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['twitter','instagram','facebook','linkedin','youtube'].map(p => (
                <button
                  key={p}
                  type="button"
                  aria-label={p}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--bg-glass-border)',
                    cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {p === 'twitter' ? '𝕏' : p === 'instagram' ? '📷' : p === 'facebook' ? 'ƒ' : p === 'linkedin' ? 'in' : '▶'}
                </button>
              ))}
            </div>
          </div>

          {/* DOWNLOAD BUTTONS */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={downloadImage}
              disabled={pngLoading}
              className="btn btn-primary"
              data-tool-action
              style={{ flex: 2 }}
            >
              {pngLoading ? '⏳ جاري التوليد...' : '⬇️ تنزيل'}
            </button>
            <button
              type="button"
              onClick={downloadHTML}
              className="btn btn-secondary"
              data-tool-action
              style={{ flex: 1 }}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={copyHTML}
              className="btn btn-secondary"
              data-tool-action
              style={{ flex: 1 }}
            >
              📋
            </button>
            <button
              type="button"
              onClick={generateShareLink}
              className="btn btn-secondary"
              data-tool-action
              style={{ flex: 1 }}
            >
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
