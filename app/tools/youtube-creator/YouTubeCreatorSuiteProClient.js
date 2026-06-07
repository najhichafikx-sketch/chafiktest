'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './youtube-creator-suite-pro.module.css';

const SIDEBAR = [
  {
    group: 'الرئيسية',
    items: [
      { id: 'trends', label: 'الترندات', icon: '🔥' },
      { id: 'revenue', label: 'توقعات الربح', icon: '💰' }
    ]
  },
  {
    group: 'أدوات الذكاء الاصطناعي',
    items: [
      { id: 'ai-idea', label: 'Video Idea Generator', icon: '💡' },
      { id: 'ai-hooks', label: 'Viral Hooks', icon: '🪝' },
      { id: 'ai-script', label: 'Script Writer', icon: '📜' },
      { id: 'ai-title', label: 'Title Generator', icon: '✏️' },
      { id: 'ai-description', label: 'Description Generator', icon: '📄' },
      { id: 'ai-tags', label: 'Tags Generator', icon: '🏷️' },
      { id: 'ai-thumbnail', label: 'Thumbnail Prompts', icon: '🖼️' },
      { id: 'ai-seo', label: 'SEO Optimizer', icon: '🔍' }
    ]
  },
  {
    group: 'أدوات يوتيوب',
    items: [
      { id: 'ut-tags', label: 'مستخرج التاغات', icon: '🏷️' },
      { id: 'ut-hashtag', label: 'مولد الهاشتاقات', icon: '#️⃣' },
      { id: 'ut-title-extract', label: 'مستخرج العنوان', icon: '📝' },
      { id: 'ut-title-gen', label: 'مولد العنوان', icon: '✍️' },
      { id: 'ut-title-length', label: 'مدقق طول العنوان', icon: '📏' },
      { id: 'ut-desc-extract', label: 'مستخرج الوصف', icon: '📋' },
      { id: 'ut-desc-gen', label: 'مولد الوصف', icon: '📃' },
      { id: 'ut-embed', label: 'مولد كود التضمين', icon: '📺' },
      { id: 'ut-channel-id', label: 'مستخرج ID القناة', icon: '🆔' },
      { id: 'ut-video-stats', label: 'إحصائيات الفيديو', icon: '📊' },
      { id: 'ut-channel-stats', label: 'إحصائيات القناة', icon: '📈' },
      { id: 'ut-region', label: 'فحص القيود الإقليمية', icon: '🌍' },
      { id: 'ut-channel-logo', label: 'تحميل لوغو القناة', icon: '🖼️' },
      { id: 'ut-channel-banner', label: 'تحميل بنر القناة', icon: '🎨' },
      { id: 'ut-channel-finder', label: 'البحث عن قناة', icon: '🔍' },
      { id: 'ut-thumbnail', label: 'تحميل الصورة المصغرة', icon: '🖼️' },
      { id: 'ut-timestamp', label: 'مولد رابط الطابع الزمني', icon: '⏱️' },
      { id: 'ut-subscribe', label: 'مولد رابط الاشتراك', icon: '🔔' },
      { id: 'ut-revenue-calc', label: 'حاسبة الأرباح', icon: '💵' },
      { id: 'ut-video-count', label: 'عداد الفيديوهات', icon: '🔢' },
      { id: 'ut-title-cap', label: 'أداة كتابة العنوان بالحروف الكبيرة', icon: '🔠' },
      { id: 'ut-comment-pick', label: 'منتقي التعليقات', icon: '🎲' },
      { id: 'ut-views-ratio', label: 'حاسبة نسبة المشاهدات', icon: '📐' },
      { id: 'ut-channel-age', label: 'فحص عمر القناة', icon: '🎂' }
    ]
  }
];

const NICHES = [
  { id: 'tech', label: 'التقنية', categoryId: '28' },
  { id: 'health', label: 'الصحة', categoryId: '26' },
  { id: 'money', label: 'الربح من الإنترنت', categoryId: '28' },
  { id: 'cooking', label: 'الطبخ', categoryId: '26' },
  { id: 'education', label: 'التعليم', categoryId: '27' },
  { id: 'gaming', label: 'الألعاب', categoryId: '20' },
  { id: 'travel', label: 'السفر', categoryId: '19' },
  { id: 'sports', label: 'الرياضة', categoryId: '17' }
];

const COUNTRIES = [
  { code: 'SA', label: 'السعودية' },
  { code: 'EG', label: 'مصر' },
  { code: 'AE', label: 'الإمارات' },
  { code: 'US', label: 'أمريكا' },
  { code: 'GB', label: 'بريطانيا' }
];

const LANGUAGES = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' }
];

const RPM_TABLE = {
  finance: { min: 8, max: 15, growth: 12 },
  tech: { min: 4, max: 9, growth: 8 },
  health: { min: 3, max: 7, growth: 6 },
  education: { min: 2, max: 5, growth: 4 },
  gaming: { min: 1, max: 3, growth: 3 },
  entertainment: { min: 1, max: 3, growth: 2 },
  cooking: { min: 2, max: 5, growth: 4 },
  travel: { min: 2, max: 6, growth: 5 },
  sports: { min: 2, max: 5, growth: 4 }
};

const NICHE_TO_RPM = {
  tech: 'tech',
  health: 'health',
  money: 'finance',
  cooking: 'cooking',
  education: 'education',
  gaming: 'gaming',
  travel: 'travel',
  sports: 'sports'
};

const AI_TOOL_PROMPTS = {
  'ai-idea': 'You are a YouTube content strategist. Generate 10 unique, viral video ideas for the given niche. Include: title idea, hook, why it will perform well. Output in the user\'s chosen language.',
  'ai-hooks': 'You are a YouTube hook specialist. Generate 10 powerful opening hooks for the given video topic. Each hook must grab attention in the first 3 seconds. Output in the user\'s chosen language.',
  'ai-script': 'You are a professional YouTube scriptwriter. Write a complete video script with: Hook (0-15s), Intro, Main Content (with timestamps), CTA, Outro. Output in the user\'s chosen language.',
  'ai-title': 'You are a YouTube SEO expert. Generate 10 optimized video titles for the given topic. Mix curiosity, numbers, and power words. Output in the user\'s chosen language.',
  'ai-description': 'You are a YouTube SEO specialist. Write a full video description with: main paragraph, timestamps section, keywords section, links section, hashtags. Output in the user\'s chosen language.',
  'ai-tags': 'You are a YouTube tags expert. Generate 30 optimized tags for the given video. Mix broad, medium, and long-tail keywords. Output as comma-separated list.',
  'ai-thumbnail': 'You are an AI image prompt specialist for YouTube thumbnails. Generate 5 detailed image generation prompts (for Midjourney/DALL-E/Flux) for the given video topic. Each prompt must describe: composition, colors, text overlay suggestion, emotion, style.',
  'ai-seo': 'You are a YouTube SEO auditor. Given a video title, description, and tags, provide a full SEO audit with: score out of 100, what is good, what to improve, optimized versions of title/description/tags. Output in the user\'s chosen language.'
};

const UTILITY_CONFIG = {
  'ut-tags': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/... أو videoId', tool: 'tag-extractor', submitLabel: 'استخراج التاغات' },
  'ut-hashtag': { kind: 'text-ai', label: 'الموضوع', placeholder: 'مثال: تقنية، طبخ، ألعاب...', tool: 'ai-generate', systemPrompt: 'You are a YouTube hashtag expert. Generate 20 relevant hashtags for the given topic. Mix broad, niche, and trending hashtags. Format as a space-separated list with # prefix.', submitLabel: 'توليد الهاشتاقات' },
  'ut-title-extract': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/...', tool: 'title-extractor', submitLabel: 'استخراج العنوان' },
  'ut-title-gen': { kind: 'text-ai', label: 'الموضوع', placeholder: 'مثال: مراجعة iPhone 15', tool: 'ai-generate', systemPrompt: 'You are a YouTube title specialist. Generate 15 viral video titles for the given topic. Mix curiosity, numbers, and power words. Output as a numbered list. Output in the user\'s chosen language.', submitLabel: 'توليد العناوين' },
  'ut-title-length': { kind: 'frontend', frontend: 'title-length', label: 'العنوان', placeholder: 'اكتب العنوان هنا...', submitLabel: 'فحص الطول' },
  'ut-desc-extract': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/...', tool: 'description-extractor', submitLabel: 'استخراج الوصف' },
  'ut-desc-gen': { kind: 'text-ai', label: 'عنوان الفيديو', placeholder: 'مثال: أفضل 5 لغات برمجة 2026', tool: 'ai-generate', systemPrompt: 'You are a YouTube description specialist. Write a full YouTube description for the given title with: hook paragraph, what viewers will learn, timestamps placeholder, keywords section, hashtags, and CTA. Output in the user\'s chosen language.', submitLabel: 'توليد الوصف' },
  'ut-embed': { kind: 'frontend', frontend: 'embed', label: 'رابط الفيديو', placeholder: 'https://www.youtube.com/watch?v=...', submitLabel: 'توليد كود التضمين' },
  'ut-channel-id': { kind: 'frontend', frontend: 'channel-id', label: 'رابط أو اسم القناة', placeholder: 'https://www.youtube.com/@channelname', tool: 'channel-id-extractor', submitLabel: 'استخراج ID القناة' },
  'ut-video-stats': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/...', tool: 'video-statistics', submitLabel: 'عرض الإحصائيات' },
  'ut-channel-stats': { kind: 'channelRef', label: 'رابط أو ID القناة', placeholder: 'https://youtube.com/@channel', tool: 'channel-statistics', submitLabel: 'عرض إحصائيات القناة' },
  'ut-region': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/...', tool: 'region-restriction', submitLabel: 'فحص القيود' },
  'ut-channel-logo': { kind: 'channelRef', label: 'رابط أو ID القناة', placeholder: 'https://youtube.com/@channel', tool: 'channel-logo', submitLabel: 'جلب اللوغو' },
  'ut-channel-banner': { kind: 'channelRef', label: 'رابط أو ID القناة', placeholder: 'https://youtube.com/@channel', tool: 'channel-banner', submitLabel: 'جلب البنر' },
  'ut-channel-finder': { kind: 'text', label: 'اسم القناة للبحث', placeholder: 'مثال: Marques Brownlee', tool: 'channel-finder', submitLabel: 'البحث' },
  'ut-thumbnail': { kind: 'videoId', label: 'رابط أو ID الفيديو', placeholder: 'https://youtu.be/...', tool: 'thumbnail-downloader', submitLabel: 'جلب الصور المصغرة' },
  'ut-timestamp': { kind: 'frontend', frontend: 'timestamp', label: 'رابط الفيديو والوقت', placeholder: 'الصق الرابط والثواني (مثال: https://youtu.be/abc 90)', submitLabel: 'توليد الرابط' },
  'ut-subscribe': { kind: 'frontend', frontend: 'subscribe', label: 'رابط القناة', placeholder: 'https://youtube.com/@channel', submitLabel: 'توليد رابط الاشتراك' },
  'ut-revenue-calc': { kind: 'frontend', frontend: 'revenue-calc', label: '', placeholder: '', submitLabel: 'احسب' },
  'ut-video-count': { kind: 'channelRef', label: 'رابط أو ID القناة', placeholder: 'https://youtube.com/@channel', tool: 'video-count', submitLabel: 'عدّ الفيديوهات' },
  'ut-title-cap': { kind: 'frontend', frontend: 'title-cap', label: 'العنوان', placeholder: 'اكتب العنوان هنا...', submitLabel: 'تحويل' },
  'ut-comment-pick': { kind: 'frontend', frontend: 'comment-pick', label: 'التعليقات (واحد في كل سطر)', placeholder: 'تعليق 1\nتعليق 2\n...', submitLabel: 'اختيار تعليق عشوائي' },
  'ut-views-ratio': { kind: 'frontend', frontend: 'views-ratio', label: '', placeholder: '', submitLabel: 'احسب النسبة' },
  'ut-channel-age': { kind: 'channelRef', label: 'رابط أو ID القناة', placeholder: 'https://youtube.com/@channel', tool: 'channel-age', submitLabel: 'فحص العمر' }
};

export default function YouTubeCreatorSuiteProClient() {
  const [active, setActive] = useState('trends');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rateLimit, setRateLimit] = useState({ allowed: true, retry_after_seconds: 0 });
  const [globalError, setGlobalError] = useState('');
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    async function loadRateLimit() {
      try {
        const res = await fetch('/api/creator-suite/rate-limit-status');
        const data = await res.json();
        if (data && typeof data.allowed === 'boolean') {
          setRateLimit({ allowed: data.allowed, retry_after_seconds: data.retry_after_seconds || 0 });
        }
      } catch {}
    }
    loadRateLimit();
  }, []);

  function formatCountdown(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className={styles.shell}>
      <button type="button" className={styles.mobileToggle} onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>📺</span>
            <div>
              <div className={styles.brandTitle}>YouTube Creator</div>
              <div className={styles.brandSubtitle}>Suite Pro</div>
            </div>
          </div>
        </div>

        <div className={styles.langRow}>
          <label className={styles.langLabel}>اللغة</label>
          <select className={styles.langSelect} value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div className={`${styles.rateBox} ${rateLimit.allowed ? styles.rateBoxOk : styles.rateBoxWarn}`}>
          {rateLimit.allowed ? (
            <>✅ جاهز للاستخدام</>
          ) : (
            <>⏳ الرجاء الانتظار: <strong>{formatCountdown(rateLimit.retry_after_seconds)}</strong></>
          )}
        </div>

        <nav className={styles.nav}>
          {SIDEBAR.map((group, gi) => (
            <div key={gi} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
                  onClick={() => { setActive(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                >
                  <span className={styles.navItemIcon}>{item.icon}</span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        {globalError && <div className={styles.globalError}>⚠️ {globalError}</div>}
        {active === 'trends' && <TrendsView language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
        {active === 'revenue' && <RevenueView />}
        {active.startsWith('ai-') && <AIToolView toolId={active} language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
        {active.startsWith('ut-') && <UtilityToolView toolId={active} language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
      </main>
    </div>
  );
}

function extractVideoId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m1 = s.match(/[?&]v=([\w-]{11})/);
  if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([\w-]{11})/);
  if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([\w-]{11})/);
  if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([\w-]{11})/);
  if (m4) return m4[1];
  return s;
}

function extractChannelRef(input) {
  if (!input) return '';
  const s = String(input).trim();
  const m1 = s.match(/youtube\.com\/channel\/([\w-]+)/);
  if (m1) return { type: 'id', value: m1[1] };
  const m2 = s.match(/youtube\.com\/@([\w.-]+)/);
  if (m2) return { type: 'handle', value: '@' + m2[1] };
  if (s.startsWith('@')) return { type: 'handle', value: s };
  if (/^UC[\w-]{20,}$/.test(s)) return { type: 'id', value: s };
  return { type: 'handle', value: s };
}

function formatNumber(n) {
  if (n == null) return '0';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days < 1) return 'اليوم';
  if (days < 7) return `قبل ${days} يوم`;
  if (days < 30) return `قبل ${Math.floor(days / 7)} أسبوع`;
  if (days < 365) return `قبل ${Math.floor(days / 30)} شهر`;
  return `قبل ${Math.floor(days / 365)} سنة`;
}

function TrendsView({ language, onError, onRateLimit }) {
  const [niche, setNiche] = useState('tech');
  const [country, setCountry] = useState('SA');
  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractStates, setExtractStates] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      onError('');
      const cat = NICHES.find(n => n.id === niche)?.categoryId || '28';
      try {
        const res = await fetch('/api/creator-suite/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche, country, categoryId: cat, keyword })
        });
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          onError(data.message || 'فشل تحميل الترندات');
          setVideos([]);
        } else {
          setVideos(data.videos || []);
        }
      } catch (e) {
        if (!cancelled) onError('فشل الاتصال بالخادم');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [niche, country, keyword, refreshKey, onError]);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  async function handleExtract(video, type) {
    const key = `${video.id}-${type}`;
    setExtractStates(s => ({ ...s, [key]: { loading: true, output: '' } }));
    let systemPrompt = '';
    let userPrompt = '';
    const title = video.title;
    const transcriptHint = video.id ? `\n\nVideo ID: ${video.id}` : '';

    if (type === 'script') {
      systemPrompt = 'You are a professional YouTube scriptwriter. Write a complete video script based on the given video title with: Hook (0-15s), Intro, Main Content (with timestamps), CTA, Outro. Make it engaging and well-structured.';
      userPrompt = `Write a complete YouTube script for a video titled: "${title}".${transcriptHint}\n\nInclude timestamps, narration, and visual cues.`;
    } else if (type === 'title') {
      systemPrompt = 'You are a YouTube SEO expert. Generate 10 optimized alternative titles for the given video. Mix curiosity, numbers, and power words.';
      userPrompt = `Generate 10 optimized alternative titles for a YouTube video titled: "${title}". Make them more clickable and SEO-friendly.`;
    } else if (type === 'tags') {
      systemPrompt = 'You are a YouTube tags expert. Generate 30 optimized tags for the given video. Mix broad, medium, and long-tail keywords. Output as a comma-separated list.';
      userPrompt = `Generate 30 optimized YouTube tags for a video titled: "${title}". Output as a comma-separated list.`;
    } else if (type === 'thumbnail') {
      systemPrompt = 'You are an AI image prompt specialist for YouTube thumbnails. Generate 5 detailed image generation prompts (for Midjourney/DALL-E/Flux) for the given video topic. Each prompt must describe: composition, colors, text overlay suggestion, emotion, style.';
      userPrompt = `Generate 5 detailed image generation prompts for YouTube thumbnails based on this video title: "${title}".`;
    }

    try {
      const res = await fetch('/api/creator-suite/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: type, prompt: userPrompt, systemPrompt, language })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        setExtractStates(s => ({ ...s, [key]: { loading: false, output: '', error: data.message || 'فشل التوليد' } }));
      } else {
        setExtractStates(s => ({ ...s, [key]: { loading: false, output: data.result || '', error: '' } }));
        if (data.retry_after_seconds != null) onRateLimit({ allowed: true, retry_after_seconds: 0 });
      }
    } catch (e) {
      setExtractStates(s => ({ ...s, [key]: { loading: false, output: '', error: 'فشل الاتصال' } }));
    }
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>🔥 الترندات — أكثر الفيديوهات رواجاً</h2>
        <p className={styles.viewSubtitle}>اكتشف الفيديوهات الرائجة في مجالك واستخرج منها نصوصاً وعناوين بالذكاء الاصطناعي</p>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="🔍 ابحث بكلمة مفتاحية (اختياري)..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') refresh(); }}
        />
        <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <button type="button" className={styles.btnPrimary} onClick={refresh} disabled={loading}>
          {loading ? '⏳ جاري التحميل...' : '🔄 تحديث'}
        </button>
      </div>

      <div className={styles.pills}>
        {NICHES.map(n => (
          <button
            key={n.id}
            type="button"
            className={`${styles.pill} ${niche === n.id ? styles.pillActive : ''}`}
            onClick={() => setNiche(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل الفيديوهات الرائجة...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className={styles.emptyBox}>لا توجد فيديوهات. تأكد من إضافة مفتاح YouTube Data API في لوحة الإدارة.</div>
      ) : (
        <div className={styles.videoGrid}>
          {videos.map((v, i) => (
            <div key={v.id} className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src={v.thumbnail} alt={v.title} loading="lazy" />
                <span className={styles.videoRank}>#{i + 1}</span>
              </div>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{v.title}</h3>
                <div className={styles.videoMeta}>
                  <span>👁️ {formatNumber(v.views)}</span>
                  <span>👍 {formatNumber(v.likes)}</span>
                  <span>🕒 {timeAgo(v.publishedAt)}</span>
                </div>
                <div className={styles.extractRow}>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'script')} disabled={extractStates[`${v.id}-script`]?.loading}>
                    سكريبت
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'title')} disabled={extractStates[`${v.id}-title`]?.loading}>
                    عنوان
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'tags')} disabled={extractStates[`${v.id}-tags`]?.loading}>
                    كلمات مفتاحية
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'thumbnail')} disabled={extractStates[`${v.id}-thumbnail`]?.loading}>
                    Thumbnail
                  </button>
                </div>
                {(extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output) && (
                  <div className={styles.extractOutput}>
                    <pre>{extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output}</pre>
                    <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output)}>
                      📋 نسخ
                    </button>
                  </div>
                )}
                {Object.entries(extractStates).filter(([k]) => k.startsWith(v.id + '-') && extractStates[k]?.error).map(([k, s]) => (
                  <div key={k} className={styles.extractError}>⚠️ {s.error}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueView() {
  const [views, setViews] = useState(10000);
  const [videosPerMonth, setVideosPerMonth] = useState(8);
  const [niche, setNiche] = useState('tech');
  const [country, setCountry] = useState('SA');

  const result = useMemo(() => {
    const rpm = RPM_TABLE[NICHE_TO_RPM[niche] || 'tech'];
    const totalViews = views * videosPerMonth;
    const minRevenue = (totalViews / 1000) * rpm.min;
    const maxRevenue = (totalViews / 1000) * rpm.max;
    const avgRpm = ((rpm.min + rpm.max) / 2);
    return {
      minRevenue, maxRevenue, avgRpm, totalViews, growth: rpm.growth,
      perVideo: Array.from({ length: Math.min(videosPerMonth, 30) }, (_, i) => ({
        n: i + 1,
        views,
        minR: (views / 1000) * rpm.min,
        maxR: (views / 1000) * rpm.max
      }))
    };
  }, [views, videosPerMonth, niche]);

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>💰 توقعات الربح الشهري</h2>
        <p className={styles.viewSubtitle}>احسب أرباحك المتوقعة من قناتك على يوتيوب بناءً على المشاهدات والمجال</p>
      </div>

      <div className={styles.card}>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>متوسط المشاهدات لكل فيديو</label>
            <input type="number" className={styles.input} value={views} onChange={e => setViews(Number(e.target.value) || 0)} min="0" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>عدد الفيديوهات شهرياً</label>
            <input type="number" className={styles.input} value={videosPerMonth} onChange={e => setVideosPerMonth(Number(e.target.value) || 0)} min="0" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>المجال</label>
            <select className={styles.select} value={niche} onChange={e => setNiche(e.target.value)}>
              <option value="tech">التقنية</option>
              <option value="health">الصحة</option>
              <option value="money">الربح من الإنترنت</option>
              <option value="cooking">الطبخ</option>
              <option value="education">التعليم</option>
              <option value="gaming">الألعاب</option>
              <option value="travel">السفر</option>
              <option value="sports">الرياضة</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>المنطقة الجغرافية</label>
            <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💵</div>
              <div className={styles.statLabel}>إجمالي الربح المتوقع</div>
              <div className={styles.statValue}>${result.minRevenue.toFixed(0)} - ${result.maxRevenue.toFixed(0)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statLabel}>متوسط RPM</div>
              <div className={styles.statValue}>${result.avgRpm.toFixed(2)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👁️</div>
              <div className={styles.statLabel}>إجمالي المشاهدات</div>
              <div className={styles.statValue}>{formatNumber(result.totalViews)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statLabel}>نسبة النمو المتوقعة</div>
              <div className={styles.statValue}>+{result.growth}%</div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>تفاصيل كل فيديو</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>الفيديو</th>
                    <th>المشاهدات</th>
                    <th>الربح الأدنى</th>
                    <th>الربح الأعلى</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perVideo.map(v => (
                    <tr key={v.n}>
                      <td>#{v.n}</td>
                      <td>{formatNumber(v.views)}</td>
                      <td>${v.minR.toFixed(2)}</td>
                      <td>${v.maxR.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AIToolView({ toolId, language, onError, onRateLimit }) {
  const [input, setInput] = useState('');
  const [extra, setExtra] = useState('');
  const [extra2, setExtra2] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const config = {
    'ai-idea': { title: '💡 مولد أفكار الفيديو', placeholder: 'صف مجالك أو موضوع قناتك...', multiline: true, hint: 'مثال: قناة تقنية متخصصة في المراجعات' },
    'ai-hooks': { title: '🪝 مولد الهوكات الفيروسية', placeholder: 'موضوع الفيديو...', multiline: true, hint: 'مثال: كيف تبدأ مشروعك التجاري' },
    'ai-script': { title: '📜 كاتب السكريبت', placeholder: 'عنوان أو موضوع الفيديو...', multiline: true, hint: 'مثال: أفضل 5 لغات برمجة في 2026' },
    'ai-title': { title: '✏️ مولد العناوين', placeholder: 'موضوع الفيديو...', multiline: false, hint: 'مثال: مراجعة iPhone 15 Pro Max' },
    'ai-description': { title: '📄 مولد الوصف', placeholder: 'عنوان الفيديو...', multiline: false, hint: 'مثال: أفضل 5 لغات برمجة للمبتدئين' },
    'ai-tags': { title: '🏷️ مولد التاغات', placeholder: 'عنوان أو موضوع الفيديو...', multiline: false, hint: 'مثال: مراجعة آيفون 15' },
    'ai-thumbnail': { title: '🖼️ مولد بروموت الصور المصغرة', placeholder: 'موضوع الفيديو...', multiline: true, hint: 'مثال: كيف تربح من اليوتيوب' },
    'ai-seo': { title: '🔍 محسّن SEO', placeholder: 'العنوان الحالي', multiline: false, extra: true, extraPlaceholder: 'الوصف الحالي...', extra2: true, extra2Placeholder: 'التاغات الحالية (مفصولة بفواصل)...', hint: 'الصق العنوان والوصف والتاغات لتحليلها' }
  }[toolId] || {};

  async function generate() {
    if (!input.trim()) {
      onError('الرجاء إدخال مدخلات');
      return;
    }
    setLoading(true);
    setOutput('');
    onError('');
    const languageName = LANGUAGES.find(l => l.code === language)?.label || 'العربية';
    const baseSystem = AI_TOOL_PROMPTS[toolId] || '';
    const systemPrompt = `${baseSystem} Output language: ${languageName}.`;

    let userPrompt = input;
    if (toolId === 'ai-seo') {
      userPrompt = `Title: ${input}\n\nDescription: ${extra || '(none provided)'}\n\nTags: ${extra2 || '(none provided)'}\n\nPlease provide a complete SEO audit.`;
    }

    try {
      const res = await fetch('/api/creator-suite/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, prompt: userPrompt, systemPrompt, language })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        onError(data.message || 'فشل التوليد');
      } else {
        setOutput(data.result || '');
        if (data.retry_after_seconds != null) onRateLimit({ allowed: true, retry_after_seconds: 0 });
      }
    } catch (e) {
      onError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{config.title}</h2>
        {config.hint && <p className={styles.viewSubtitle}>{config.hint}</p>}
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label}>المدخل</label>
          <textarea className={styles.textarea} value={input} onChange={e => setInput(e.target.value)} placeholder={config.placeholder} rows={config.multiline ? 4 : 2} />
        </div>
        {config.extra && (
          <div className={styles.field}>
            <label className={styles.label}>المدخل الإضافي</label>
            <textarea className={styles.textarea} value={extra} onChange={e => setExtra(e.target.value)} placeholder={config.extraPlaceholder} rows={3} />
          </div>
        )}
        {config.extra2 && (
          <div className={styles.field}>
            <label className={styles.label}>المدخل الإضافي 2</label>
            <textarea className={styles.textarea} value={extra2} onChange={e => setExtra2(e.target.value)} placeholder={config.extra2Placeholder} rows={2} />
          </div>
        )}
        <button type="button" className={styles.btnPrimary} onClick={generate} disabled={loading}>
          {loading ? '⏳ جاري التوليد...' : '✨ توليد'}
        </button>
      </div>

      {output && (
        <div className={styles.card}>
          <div className={styles.outputHeader}>
            <h3 className={styles.cardTitle}>النتيجة</h3>
            <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output)}>📋 نسخ</button>
          </div>
          <pre className={styles.output}>{output}</pre>
        </div>
      )}
    </div>
  );
}

function UtilityToolView({ toolId, language, onError, onRateLimit }) {
  const cfg = UTILITY_CONFIG[toolId] || {};
  const [input, setInput] = useState('');
  const [extra, setExtra2] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [frontendState, setFrontendState] = useState({});

  async function run() {
    if (cfg.kind === 'frontend') {
      return runFrontend();
    }
    if (!input.trim()) {
      onError('الرجاء إدخال قيمة');
      return;
    }
    setLoading(true);
    setOutput(null);
    onError('');

    try {
      let body = { tool: cfg.tool, input, language };

      if (cfg.kind === 'videoId') {
        body.videoId = extractVideoId(input);
      } else if (cfg.kind === 'channelRef') {
        body.channelRef = extractChannelRef(input);
      }

      if (cfg.kind === 'text-ai') {
        body.tool = 'ai-generate';
        body.systemPrompt = cfg.systemPrompt;
      }

      const res = await fetch('/api/creator-suite/youtube-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        onError(data.message || 'فشل التوليد');
        setOutput({ error: data.message || 'فشل' });
      } else {
        setOutput(data);
      }
    } catch (e) {
      onError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  function runFrontend() {
    setOutput(null);
    onError('');
    const v = input.trim();
    if (cfg.frontend === 'title-length') {
      if (!v) { onError('أدخل عنواناً'); return; }
      const len = v.length;
      let status = 'green';
      if (len > 70) status = 'red';
      else if (len > 60) status = 'yellow';
      setOutput({ type: 'title-length', length: len, status, recommendation: len > 70 ? 'العنوان طويل جداً - YouTube يقطع بعد 70 حرف' : len > 60 ? 'مقبول لكن حاول تقصيره' : 'طول مثالي' });
    } else if (cfg.frontend === 'embed') {
      const vid = extractVideoId(v);
      if (!vid || vid.length !== 11) { onError('رابط غير صالح'); return; }
      const embed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${vid}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      setOutput({ type: 'embed', embed, videoId: vid });
    } else if (cfg.frontend === 'channel-id') {
      const ref = extractChannelRef(v);
      const id = ref.type === 'id' ? ref.value : '';
      setOutput({ type: 'channel-id', ref, id });
    } else if (cfg.frontend === 'timestamp') {
      const parts = v.split(/\s+/);
      if (parts.length < 2) { onError('الصق الرابط ثم الوقت بالثواني'); return; }
      const seconds = parseInt(parts[parts.length - 1]);
      const url = parts.slice(0, -1).join(' ');
      const vid = extractVideoId(url);
      if (!vid || vid.length !== 11) { onError('رابط غير صالح'); return; }
      if (isNaN(seconds) || seconds < 0) { onError('وقت غير صالح'); return; }
      setOutput({ type: 'timestamp', url: `https://youtu.be/${vid}?t=${seconds}`, seconds });
    } else if (cfg.frontend === 'subscribe') {
      const ref = extractChannelRef(v);
      const target = ref.type === 'id' ? `channel/${ref.value}` : ref.value;
      setOutput({ type: 'subscribe', url: `https://www.youtube.com/${target}?sub_confirmation=1` });
    } else if (cfg.frontend === 'title-cap') {
      if (!v) { onError('أدخل عنواناً'); return; }
      const titled = v.toLowerCase().split(/\s+/).map((w, i) => {
        if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
        const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
        return small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
      setOutput({ type: 'title-cap', original: v, titled });
    } else if (cfg.frontend === 'comment-pick') {
      const lines = v.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) { onError('الصق تعليقاً واحداً على الأقل'); return; }
      const pick = lines[Math.floor(Math.random() * lines.length)];
      setOutput({ type: 'comment-pick', winner: pick, total: lines.length });
    } else if (cfg.frontend === 'revenue-calc') {
      onError('استخدم أداة "توقعات الربح" من القائمة الرئيسية');
    } else if (cfg.frontend === 'views-ratio') {
      onError('الرجاء استخدام الحقول أدناه');
    }
  }

  function runViewsRatio() {
    const views = Number(frontendState.views) || 0;
    const likes = Number(frontendState.likes) || 0;
    if (views <= 0) { onError('أدخل عدد المشاهدات'); return; }
    const ratio = (likes / views) * 100;
    let benchmark = '';
    if (ratio >= 4) benchmark = 'ممتاز - أعلى من المتوسط';
    else if (ratio >= 2.5) benchmark = 'جيد جداً';
    else if (ratio >= 1) benchmark = 'متوسط';
    else benchmark = 'منخفض - حاول تحسين المحتوى';
    setOutput({ type: 'views-ratio', ratio, likes, views, benchmark });
  }

  if (cfg.frontend === 'revenue-calc') {
    return (
      <div className={styles.view}>
        <div className={styles.viewHeader}>
          <h2 className={styles.viewTitle}>💵 حاسبة الأرباح</h2>
          <p className={styles.viewSubtitle}>اذهب إلى &quot;توقعات الربح&quot; في القائمة الرئيسية لاستخدام الحاسبة الكاملة</p>
        </div>
        <div className={styles.card}>
          <button type="button" className={styles.btnPrimary} onClick={() => window.scrollTo(0, 0)}>افتح توقعات الربح</button>
        </div>
      </div>
    );
  }

  if (cfg.frontend === 'views-ratio') {
    return (
      <div className={styles.view}>
        <div className={styles.viewHeader}>
          <h2 className={styles.viewTitle}>📐 حاسبة نسبة المشاهدات للإعجابات</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>عدد المشاهدات</label>
              <input type="number" className={styles.input} value={frontendState.views || ''} onChange={e => setFrontendState({ ...frontendState, views: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>عدد الإعجابات</label>
              <input type="number" className={styles.input} value={frontendState.likes || ''} onChange={e => setFrontendState({ ...frontendState, likes: e.target.value })} />
            </div>
          </div>
          <button type="button" className={styles.btnPrimary} onClick={runViewsRatio}>احسب النسبة</button>
        </div>
        {output?.type === 'views-ratio' && (
          <div className={styles.card}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>نسبة الإعجاب</div>
              <div className={styles.statValue}>{output.ratio.toFixed(2)}%</div>
              <div className={styles.statIcon}>✅</div>
            </div>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{output.benchmark}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{cfg.label || 'أداة'}</h2>
        {cfg.placeholder && <p className={styles.viewSubtitle}>أدخل القيمة المطلوبة ثم اضغط {cfg.submitLabel}</p>}
      </div>

      {cfg.kind !== 'frontend' || ['title-length', 'embed', 'channel-id', 'timestamp', 'subscribe', 'title-cap', 'comment-pick'].includes(cfg.frontend) ? (
        <div className={styles.card}>
          {cfg.label && (
            <div className={styles.field}>
              <label className={styles.label}>{cfg.label}</label>
              {cfg.kind === 'comment-pick' ? (
                <textarea className={styles.textarea} value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder} rows={8} />
              ) : (
                <input className={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder} />
              )}
            </div>
          )}
          <button type="button" className={styles.btnPrimary} onClick={run} disabled={loading}>
            {loading ? '⏳ جاري المعالجة...' : `✨ ${cfg.submitLabel}`}
          </button>
        </div>
      ) : null}

      {output && <UtilityOutput output={output} frontend={cfg.frontend} />}
    </div>
  );
}

function UtilityOutput({ output, frontend }) {
  if (output.error) {
    return <div className={styles.card}><div className={styles.extractError}>⚠️ {output.error}</div></div>;
  }

  if (frontend === 'title-length' && output.type === 'title-length') {
    const color = output.status === 'green' ? '#10b981' : output.status === 'yellow' ? '#f59e0b' : '#ef4444';
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>النتيجة</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color, margin: '12px 0' }}>{output.length} حرف</div>
        <div className={styles.statLabel} style={{ color }}>{output.recommendation}</div>
      </div>
    );
  }

  if (frontend === 'embed' && output.type === 'embed') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>كود التضمين</div>
        <pre className={styles.output}>{output.embed}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.embed)}>📋 نسخ</button>
      </div>
    );
  }

  if (frontend === 'timestamp' && output.type === 'timestamp') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>الرابط بالطابع الزمني</div>
        <pre className={styles.output}>{output.url}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.url)}>📋 نسخ</button>
      </div>
    );
  }

  if (frontend === 'subscribe' && output.type === 'subscribe') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>رابط الاشتراك المباشر</div>
        <pre className={styles.output}>{output.url}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.url)}>📋 نسخ</button>
      </div>
    );
  }

  if (frontend === 'title-cap' && output.type === 'title-cap') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>النتيجة</div>
        <pre className={styles.output}>{output.titled}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.titled)}>📋 نسخ</button>
      </div>
    );
  }

  if (frontend === 'comment-pick' && output.type === 'comment-pick') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>🎉 الفائز من {output.total} تعليق</div>
        <pre className={styles.output}>{output.winner}</pre>
        <button type="button" className={styles.btnPrimary} onClick={() => location.reload()}>🎲 اختيار آخر</button>
      </div>
    );
  }

  if (output.type === 'channel-id') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>النتيجة</div>
        {output.id ? (
          <>
            <div className={styles.statLabel}>Channel ID</div>
            <pre className={styles.output}>{output.id}</pre>
            <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.id)}>📋 نسخ</button>
          </>
        ) : (
          <div className={styles.extractError}>⚠️ للـ handles (مثل @name) يلزم YouTube API key - أضفه في الإدارة ثم ارجع</div>
        )}
      </div>
    );
  }

  if (output.data) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>النتيجة</div>
        <pre className={styles.output}>{JSON.stringify(output.data, null, 2)}</pre>
      </div>
    );
  }

  if (output.result && toolIdIsAI(frontend)) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>النتيجة</div>
        <pre className={styles.output}>{output.result}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.result)}>📋 نسخ</button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>النتيجة</div>
      <pre className={styles.output}>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}

function toolIdIsAI(frontend) {
  return ['ut-hashtag', 'ut-title-gen', 'ut-desc-gen'].includes(frontend);
}
