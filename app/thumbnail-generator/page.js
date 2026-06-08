'use client';

import { useState, useRef, useCallback } from 'react';

const THUMBNAIL_PLACEHOLDERS = [
  'https://picsum.photos/seed/thumb1/320/180',
  'https://picsum.photos/seed/thumb2/320/180',
  'https://picsum.photos/seed/thumb3/320/180',
  'https://picsum.photos/seed/thumb4/320/180',
  'https://picsum.photos/seed/thumb5/320/180',
  'https://picsum.photos/seed/thumb6/320/180',
  'https://picsum.photos/seed/thumb7/320/180',
  'https://picsum.photos/seed/thumb8/320/180',
];

const STYLES = [
  { value: 'cinematic', label: 'سينمائي' },
  { value: 'vlog', label: 'فلوق' },
  { value: 'gaming', label: 'ألعاب' },
];

export default function ThumbnailGeneratorPage() {
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [faceImage, setFaceImage] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFaceUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaceImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFacePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/thumbnail-generator', {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic: topic.trim(), style, faceImage: facePreview }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setResult({ error: data.error || 'فشل التوليد' });
      }
    } catch {
      setResult({ error: 'خطأ في الشبكة' });
    } finally {
      setLoading(false);
    }
  }, [topic, style, facePreview]);

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: '#0a0a0f', color: '#f0f0f5' }}>
      {/* ===== MARQUEE ===== */}
      <section className="relative overflow-hidden py-4" style={{ background: '#0a0a0f' }}>
        <div className="relative">
          <div className="flex gap-4 animate-marquee" style={{ width: 'max-content' }}>
            {[...THUMBNAIL_PLACEHOLDERS, ...THUMBNAIL_PLACEHOLDERS].map((url, i) => (
              <div key={i} className="shrink-0 rounded-xl overflow-hidden" style={{ width: 280, height: 158 }}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 w-24 pointer-events-none" style={{
            background: 'linear-gradient(to left, #0a0a0f, transparent)'
          }} />
          <div className="absolute inset-y-0 left-0 w-24 pointer-events-none" style={{
            background: 'linear-gradient(to right, #0a0a0f, transparent)'
          }} />
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🖼️', value: '1', label: 'الإنشاءات' },
            { icon: '⚡', value: '80', label: 'النقاط' },
            { icon: '👥', value: '0', label: 'الشخصيات' },
            { icon: '🎨', value: '0', label: 'لوحات الألوان' },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-4 text-center" style={{
              background: '#13131a',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-2xl font-bold" style={{ color: '#f0f0f5' }}>{card.value}</div>
              <div className="text-sm" style={{ color: '#6b6b80' }}>{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ACTION BANNER ===== */}
      <section className="px-4 pb-10 max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" style={{
          background: 'linear-gradient(135deg, #13131a 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255,215,0,0.1)',
        }}>
          {/* subtle warm glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.08), transparent 70%)',
          }} />
          {/* right side — text */}
          <div className="flex items-center gap-4 flex-1 z-10">
            <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{
              background: '#0a0a0f',
              border: '1px solid rgba(255,215,0,0.2)',
              boxShadow: '0 0 20px rgba(255,215,0,0.1)',
            }}>
              ✨
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mb-2" style={{
                background: 'rgba(255,215,0,0.12)',
                color: '#ffd700',
              }}>
                AI POWERED ⚡
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: '#f0f0f5' }}>
                إنشاء صورة مصغرة
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6b6b80', maxWidth: 340 }}>
                أنشئ صور مصغرة احترافية بالذكاء الاصطناعي في ثوان باستخدام هوية علامتك.
              </p>
            </div>
          </div>
          {/* left side — button */}
          <div className="shrink-0 z-10">
            <button onClick={() => setShowModal(true)} className="relative group px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300" style={{
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              color: '#0a0a0f',
              boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
            }}>
              <span className="relative z-10">ابدأ الآن ⬅</span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                filter: 'brightness(1.2)',
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden" style={{
            background: '#13131a',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-lg font-bold">مصمم الصور المصغرة</h3>
              <button onClick={() => { setShowModal(false); setResult(null); }} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                ✕
              </button>
            </div>

            {/* body */}
            <div className="p-6 space-y-5">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#a0a0b8' }}>موضوع الفيديو</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2} placeholder="مثال: مراجعة آيفون 16 برو" className="w-full rounded-xl px-4 py-3 text-sm resize-none" style={{
                  background: '#0a0a0f',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f0f5',
                }} />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#a0a0b8' }}>النمط البصري</label>
                <div className="flex gap-2">
                  {STYLES.map(s => (
                    <button key={s.value} onClick={() => setStyle(s.value)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all" style={style === s.value ? {
                      background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                      color: '#0a0a0f',
                    } : {
                      background: '#0a0a0f',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#6b6b80',
                    }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Face upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#a0a0b8' }}>صورة مرجعية للشخصية (اختياري)</label>
                <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl p-4 text-center border-2 border-dashed transition" style={{
                  borderColor: facePreview ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)',
                  background: facePreview ? 'rgba(255,215,0,0.04)' : 'transparent',
                }}>
                  {facePreview ? (
                    <div className="flex items-center gap-3 justify-center">
                      <img src={facePreview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <span className="text-sm" style={{ color: '#a0a0b8' }}>تم الرفع — اضغط للتغيير</span>
                    </div>
                  ) : (
                    <div className="text-sm" style={{ color: '#6b6b80' }}>
                      <span className="text-2xl block mb-1">📷</span>
                      اضغط لرفع صورة الوجه
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
              </div>

              {/* Generate */}
              <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full py-3.5 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2" style={loading || !topic.trim() ? {
                background: 'rgba(255,215,0,0.2)',
                color: '#6b6b80',
                cursor: 'not-allowed',
              } : {
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#0a0a0f',
                boxShadow: '0 4px 20px rgba(255,215,0,0.25)',
              }}>
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 rounded-full border-2" style={{
                      borderColor: '#0a0a0f #0a0a0f transparent transparent',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    جاري التوليد...
                  </>
                ) : 'توليد الصورة المصغرة'}
              </button>

              {/* Result */}
              {result && (
                <div className="rounded-xl p-4" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {result.error ? (
                    <p className="text-sm text-center" style={{ color: '#ef4444' }}>{result.error}</p>
                  ) : (
                    <div className="space-y-2 text-sm leading-relaxed" style={{ color: '#a0a0b8' }}>
                      <p className="font-semibold" style={{ color: '#10b981' }}>✅ تم التوليد بنجاح</p>
                      <p>{result.prompt}</p>
                      {result.imageUrl && (
                        <img src={result.imageUrl} alt="Generated thumbnail" className="w-full rounded-lg mt-2" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* keyframes */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
