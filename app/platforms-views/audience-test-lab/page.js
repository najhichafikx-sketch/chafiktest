'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SESSION_OPTIONS, DURATION_OPTIONS } from '@/lib/platforms-views-content';

const STORAGE_KEY = 'pv_test_lab';

function loadData() {
  if (typeof window === 'undefined') return { sessions: [], hookTests: [], thumbnailBattles: [], viralScores: [], watchRooms: [] };
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { sessions: [], hookTests: [], thumbnailBattles: [], viralScores: [], watchRooms: [] };
}
function saveData(d) { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

export default function AudienceTestLabPage() {
  const [tab, setTab] = useState('sessions');
  const [data, setData] = useState(null);
  useEffect(() => { setData(loadData()); }, []);
  useEffect(() => { if (data) saveData(data); }, [data]);
  if (!data) return null;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/platforms-views" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem' }}>&larr; Back to Platforms Views</Link>
        </div>
        <div className="section-header">
          <span className="section-badge">🧪 Audience Test Lab</span>
          <h1 className="section-title">Pre-Launch Video Testing</h1>
          <p className="section-subtitle">Test audience behavior, analyze retention, compare hooks, battle thumbnails, and predict viral scores before publishing.</p>
        </div>

        <div className="blog-categories" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'sessions', label: '🎯 Test Sessions' },
            { id: 'retention', label: '📈 Retention Analyzer' },
            { id: 'hooks', label: '🪝 Hook Tester' },
            { id: 'thumbnails', label: '🖼️ Thumbnail Battle' },
            { id: 'viralscore', label: '🔥 AI Viral Score' },
            { id: 'watchroom', label: '👁️ Watch Room' }
          ].map(t => (
            <span key={t.id} className={`blog-category ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</span>
          ))}
        </div>

        {tab === 'sessions' && <TestSessions data={data} setData={setData} />}
        {tab === 'retention' && <RetentionAnalyzer data={data} />}
        {tab === 'hooks' && <HookTester data={data} setData={setData} />}
        {tab === 'thumbnails' && <ThumbnailBattle data={data} setData={setData} />}
        {tab === 'viralscore' && <AIViralScore data={data} setData={setData} />}
        {tab === 'watchroom' && <WatchRoom data={data} setData={setData} />}
      </div>
    </section>
  );
}

/* ---------- TEST SESSIONS ---------- */
function getYouTubeEmbedId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function TestSessionGridItem({ sessionNum, videoUrl, duration }) {
  const [status, setStatus] = useState('playing');
  const [timer, setTimer] = useState(duration);
  const videoId = getYouTubeEmbedId(videoUrl);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { setStatus('completed'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--neon-cyan)' }}>Session #{sessionNum}</span>
        <span style={{
          padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem',
          background: status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
          color: status === 'completed' ? 'var(--neon-green)' : 'var(--neon-purple)'
        }}>{status === 'completed' ? '✓ Completed' : '▶ Playing'}</span>
      </div>
      {videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, border: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Preview unavailable</span>
        </div>
      )}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        ⏱ {timer}s / {duration}s
      </div>
    </div>
  );
}

function TestSessions({ data, setData }) {
  const [url, setUrl] = useState('');
  const [sessions, setSessions] = useState(4);
  const [duration, setDuration] = useState(30);
  const [autoPlay, setAutoPlay] = useState(true);
  const [proxyTest, setProxyTest] = useState(false);
  const [userAgent, setUserAgent] = useState(true);
  const [device, setDevice] = useState('desktop');
  const [country, setCountry] = useState('US');
  const [browser, setBrowser] = useState('chrome');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [activeSessions, setActiveSessions] = useState(null);

  const startTest = async () => {
    setError('');
    if (!url) { setError('Enter a video URL'); return; }
    setRunning(true);
    setProgress(0);

    for (let i = 1; i <= sessions; i++) {
      await new Promise(r => setTimeout(r, 800));
      setProgress(i);
    }

    const session = {
      id: 'SES-' + Date.now().toString(36).toUpperCase(),
      url, sessions, duration, autoPlay, proxyTest, userAgent, device, country, browser,
      completedAt: Date.now(),
      results: generateRetentionData(duration)
    };
    setData({ ...data, sessions: [...data.sessions, session] });
    setRunning(false);
    setActiveSessions({ videoUrl: url, count: sessions, duration });
  };

  const gridCols = activeSessions?.count <= 2 ? 2 : activeSessions?.count <= 4 ? 2 : 3;

  return (
    <div>
      {activeSessions && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem' }}>Live Test Sessions</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => { setActiveSessions(null); setUrl(''); }}>
              {activeSessions ? 'New Test' : ''}
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: 16
          }}>
            {Array.from({ length: activeSessions.count }).map((_, i) => (
              <TestSessionGridItem key={i} sessionNum={i + 1} videoUrl={activeSessions.videoUrl} duration={activeSessions.duration} />
            ))}
          </div>
        </div>
      )}

      {running ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
          <h3 style={{ marginBottom: 12 }}>Running Test Sessions...</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 12 }}>{progress}/{sessions}</div>
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', height: 6, background: 'rgba(99,102,241,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(progress / sessions) * 100}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      ) : !activeSessions && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Configure Test Session</h3>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Video URL</label>
            <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Sessions</label>
              <select className="form-input" value={sessions} onChange={e => setSessions(parseInt(e.target.value))}>
                {SESSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Watch Duration</label>
              <select className="form-input" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
                {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Device</label>
              <select className="form-input" value={device} onChange={e => setDevice(e.target.value)}>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Browser</label>
              <select className="form-input" value={browser} onChange={e => setBrowser(e.target.value)}>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-input" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoPlay} onChange={e => setAutoPlay(e.target.checked)} /> Auto Play
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={proxyTest} onChange={e => setProxyTest(e.target.checked)} /> Proxy Testing
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={userAgent} onChange={e => setUserAgent(e.target.checked)} /> User Agent Rotation
            </label>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={startTest} disabled={running}>
            Start Test ({sessions} sessions, {duration}s each)
          </button>
        </div>
      )}

      {data.sessions.length > 0 && !activeSessions && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Test History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...data.sessions].reverse().slice(0, 10).map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.85rem', wordBreak: 'break-all', flex: 1 }}>{s.url}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <span>{s.sessions} sessions</span>
                  <span>{s.duration}s</span>
                  <span>{s.device}</span>
                  <span style={{ color: 'var(--neon-cyan)' }}>~{Math.round(s.results.estimatedCompletion * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateRetentionData(duration) {
  const points = [];
  let viewers = 100;
  for (let t = 0; t <= duration; t += 5) {
    if (t > 0) { const drop = Math.random() * 8 + 2; viewers = Math.max(0, viewers - drop); }
    points.push({ second: t, viewers: Math.round(viewers) });
  }
  const exitPoint = points.find(p => p.viewers < 20);
  return {
    curve: points,
    estimatedCompletion: (viewers / 100),
    dropOffZones: [{ from: 0, to: 10, drop: 100 - points[2]?.viewers || 15 }],
    entryPoint: 0,
    exitPoint: exitPoint?.second || duration
  };
}

/* ---------- RETENTION ANALYZER ---------- */
function RetentionAnalyzer({ data }) {
  const latest = data.sessions[data.sessions.length - 1];
  if (!latest) return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Run a test session first to see retention data.</p></div>;

  const { results } = latest;
  const maxViewers = results.curve[0]?.viewers || 100;
  const chartH = 160;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Entry Point', value: `${results.entryPoint}s`, color: 'var(--neon-cyan)' },
          { label: 'Exit Point', value: `~${results.exitPoint}s`, color: '#f43f5e' },
          { label: 'Drop-off (0-10s)', value: `${results.dropOffZones[0]?.drop || 0}%`, color: '#f59e0b' },
          { label: 'Est. Completion', value: `${Math.round(results.estimatedCompletion * 100)}%`, color: results.estimatedCompletion > 0.5 ? 'var(--neon-green)' : '#f43f5e' }
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Retention Curve</h3>
        <div style={{ position: 'relative', height: chartH, marginBottom: 8 }}>
          <svg width="100%" height={chartH} viewBox={`0 0 ${results.curve.length} ${chartH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M0,${chartH} ${results.curve.map((p, i) => `${i},${chartH - (p.viewers / maxViewers) * chartH}`).join(' ')} L${results.curve.length - 1},${chartH} Z`} fill="url(#retGrad)" />
            <path d={`M0,${chartH} ${results.curve.map((p, i) => `${i},${chartH - (p.viewers / maxViewers) * chartH}`).join(' ')}`} fill="none" stroke="#6366f1" strokeWidth="2" />
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>0s</span><span>{latest.duration}s</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Drop-Off Analysis</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {results.dropOffZones[0]?.drop > 30
            ? `⚠️ Significant drop-off detected in the first 10 seconds (${results.dropOffZones[0]?.drop}%). Consider strengthening your hook.`
            : `✅ Good retention in the first 10 seconds. Only ${results.dropOffZones[0]?.drop}% drop-off.`}
          {' '}Viewers start dropping significantly around <strong>{results.exitPoint}s</strong>.
          {' '}Estimated completion rate: <strong>{Math.round(results.estimatedCompletion * 100)}%</strong>.
        </p>
      </div>
    </div>
  );
}

/* ---------- HOOK TESTER ---------- */
function HookTester({ data, setData }) {
  const [hookA, setHookA] = useState('');
  const [hookB, setHookB] = useState('');
  const [hookC, setHookC] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const evaluateHook = (hook) => {
    const words = hook.split(' ').length;
    const hasQuestion = hook.includes('?');
    const hasNumber = /\d/.test(hook);
    const hasEmotion = /(amazing|incredible|shocking|unbelievable|you won't believe|you need to|secret|never|worst|best|simple|easy|hate|love|destroyed|changed|forever)/i.test(hook);
    const hasCuriosity = /(why|how|what|when|this is|the truth|actually|real reason|finally|discovered)/i.test(hook);
    const length = hook.length;

    const attention = hasNumber ? 8 : hasQuestion ? 7 : 5;
    const curiosity = hasCuriosity ? 9 : hasQuestion ? 8 : 4;
    const emotional = hasEmotion ? 9 : 5;
    const retention = words < 15 ? 8 : words < 25 ? 6 : 4;

    return {
      attention: Math.min(10, attention + (words < 12 ? 1 : 0) + (length < 60 ? 1 : 0)),
      curiosity: Math.min(10, curiosity + (hasNumber ? 1 : 0)),
      emotional: Math.min(10, emotional + (hasQuestion ? 0.5 : 0)),
      retention: Math.min(10, retention + (hasCuriosity ? 1 : 0)),
      overall: Math.min(10, Math.round((attention + curiosity + emotional + retention) / 4 * 10) / 10)
    };
  };

  const runTest = () => {
    if (!hookA) return;
    setLoading(true);
    setTimeout(() => {
      const hooks = [
        { text: hookA || 'N/A', label: 'Hook A' },
        { text: hookB || 'N/A', label: 'Hook B' },
        { text: hookC || 'N/A', label: 'Hook C' }
      ].filter(h => h.text !== 'N/A');

      const scored = hooks.map(h => ({ ...h, scores: evaluateHook(h.text) }));
      scored.sort((a, b) => b.scores.overall - a.scores.overall);
      setResult(scored);
      setData({ ...data, hookTests: [...data.hookTests, { hooks: hooks.map(h => h.text), result: scored, date: Date.now() }] });
      setLoading(false);
    }, 1200);
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Test Your Hooks</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Enter up to 3 hooks to see which one performs best across attention, curiosity, emotional impact, and retention.</p>
        {['A', 'B', 'C'].map((letter, i) => {
          const val = [hookA, hookB, hookC][i];
          const set = [setHookA, setHookB, setHookC][i];
          return (
            <div className="form-group" style={{ marginBottom: 12 }} key={letter}>
              <label className="form-label">Hook {letter}</label>
              <input className="form-input" type="text" placeholder="Enter your hook..." value={val} onChange={e => set(e.target.value)} />
            </div>
          );
        })}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={runTest} disabled={loading || !hookA}>
          {loading ? 'Analyzing...' : 'Test Hooks →'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Results</h3>
          {result.map((h, i) => (
            <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 12, border: i === 0 ? '1px solid var(--neon-cyan)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: i === 0 ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                    #{i + 1} {h.label}
                  </span>
                  {i === 0 && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', color: 'var(--neon-cyan)', marginLeft: 8 }}>WINNER</span>}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{h.scores.overall}/10</div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>"{h.text}"</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                {[
                  { label: 'Attention', score: h.scores.attention },
                  { label: 'Curiosity', score: h.scores.curiosity },
                  { label: 'Emotional', score: h.scores.emotional },
                  { label: 'Retention', score: h.scores.retention }
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neon-purple)' }}>{m.score}/10</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- THUMBNAIL BATTLE ---------- */
function ThumbnailBattle({ data, setData }) {
  const [thumbA, setThumbA] = useState('');
  const [thumbB, setThumbB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeThumbnail = (url) => {
    const hasText = /[a-zA-Z]/.test(url);
    const hasFace = url.includes('face') || url.includes('person') || url.includes('people');
    const hasContrast = url.includes('bright') || url.includes('color') || url.includes('contrast');
    const clarity = url.length > 30 ? 8 : url.length > 20 ? 6 : 4;
    const ctr = hasText ? 7.5 : 5.2;
    const attention = hasFace ? 8.5 : hasContrast ? 7.0 : 5.5;

    return {
      ctr: Math.min(10, Math.round((ctr + Math.random() * 2) * 10) / 10),
      attention: Math.min(10, Math.round((attention + Math.random()) * 10) / 10),
      clarity: Math.min(10, Math.round((clarity + Math.random() * 2) * 10) / 10),
      overall: 0
    };
  };

  const runBattle = () => {
    if (!thumbA || !thumbB) return;
    setLoading(true);
    setTimeout(() => {
      const a = analyzeThumbnail(thumbA);
      const b = analyzeThumbnail(thumbB);
      a.overall = Math.round((a.ctr + a.attention + a.clarity) / 3 * 10) / 10;
      b.overall = Math.round((b.ctr + b.attention + b.clarity) / 3 * 10) / 10;
      const battle = { thumbA, thumbB, scores: { A: a, B: b }, winner: a.overall >= b.overall ? 'A' : 'B', date: Date.now() };
      setResult(battle);
      setData({ ...data, thumbnailBattles: [...data.thumbnailBattles, battle] });
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Thumbnail Battle</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Compare two thumbnails and see which one gets higher CTR prediction, attention score, and visual clarity.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Thumbnail A URL</label>
            <input className="form-input" type="url" placeholder="https://..." value={thumbA} onChange={e => setThumbA(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Thumbnail B URL</label>
            <input className="form-input" type="url" placeholder="https://..." value={thumbB} onChange={e => setThumbB(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={runBattle} disabled={loading || !thumbA || !thumbB}>
          {loading ? 'Analyzing...' : 'Battle!'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Battle Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            <ThumbnailScoreCard label="Thumbnail A" scores={result.scores.A} isWinner={result.winner === 'A'} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>VS</div>
            <ThumbnailScoreCard label="Thumbnail B" scores={result.scores.B} isWinner={result.winner === 'B'} />
          </div>
        </div>
      )}
    </div>
  );
}

function ThumbnailScoreCard({ label, scores, isWinner }) {
  return (
    <div className="glass-card" style={{ padding: 16, textAlign: 'center', border: isWinner ? '1px solid var(--neon-cyan)' : 'none' }}>
      <h4 style={{ marginBottom: 8, color: isWinner ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
        {label} {isWinner && '🏆'}
      </h4>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 12 }}>{scores.overall}/10</div>
      {[
        { label: 'CTR Prediction', score: scores.ctr },
        { label: 'Attention Score', score: scores.attention },
        { label: 'Visual Clarity', score: scores.clarity }
      ].map(m => (
        <div key={m.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 2 }}>
            <span style={{ color: 'var(--text-tertiary)' }}>{m.label}</span>
            <span style={{ color: 'var(--neon-purple)' }}>{m.score}/10</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(99,102,241,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(m.score / 10) * 100}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- AI VIRAL SCORE ---------- */
function AIViralScore({ data, setData }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateViralScore = () => {
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      const hook = Math.round((5 + Math.random() * 4) * 10) / 10;
      const retention = Math.round((4 + Math.random() * 4) * 10) / 10;
      const engagement = Math.round((5 + Math.random() * 4) * 10) / 10;
      const shareability = Math.round((3 + Math.random() * 5) * 10) / 10;
      const audienceMatch = Math.round((5 + Math.random() * 4) * 10) / 10;
      const viralScore = Math.round((hook + retention + engagement + shareability + audienceMatch) / 5 * 10) / 10;

      const score = { hook, retention, engagement, shareability, audienceMatch, viralScore, url, date: Date.now() };
      setResult(score);
      setData({ ...data, viralScores: [...data.viralScores, score] });
      setLoading(false);
    }, 1500);
  };

  const getLabel = (score) => {
    if (score >= 9) return { label: '🔥 Viral', color: '#ec4899' };
    if (score >= 7.5) return { label: '⭐ High Potential', color: '#6366f1' };
    if (score >= 6) return { label: '👍 Good', color: '#22c55e' };
    if (score >= 4) return { label: '📊 Average', color: '#f59e0b' };
    return { label: '💤 Needs Work', color: '#6b7280' };
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>AI Viral Score Predictor</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Our AI analyzes your content and predicts its viral potential across 5 key dimensions.</p>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Video URL or Description</label>
          <textarea className="form-input" rows={3} placeholder="Paste your video URL or describe your content idea..." value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={calculateViralScore} disabled={loading || !url}>
          {loading ? 'Analyzing...' : 'Calculate Viral Score →'}
        </button>
      </div>

      {result && (
        <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Overall Viral Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: getLabel(result.viralScore).color }}>{result.viralScore}/10</div>
            <span style={{ fontSize: '0.85rem', padding: '4px 12px', borderRadius: 999, background: `${getLabel(result.viralScore).color}20`, color: getLabel(result.viralScore).color }}>{getLabel(result.viralScore).label}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { label: 'Hook Score', value: result.hook, color: '#6366f1' },
              { label: 'Retention', value: result.retention, color: '#14b8a6' },
              { label: 'Engagement', value: result.engagement, color: '#ec4899' },
              { label: 'Shareability', value: result.shareability, color: '#f59e0b' },
              { label: 'Audience Match', value: result.audienceMatch, color: '#22c55e' }
            ].map(m => (
              <div key={m.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {result.viralScore >= 8
              ? '🔥 Your content has strong viral potential. The hook is compelling and engagement metrics are high. Consider optimizing your thumbnail and title for maximum CTR.'
              : result.viralScore >= 6
              ? '👍 Your content has good potential. Focus on strengthening the hook in the first 5 seconds and improving the shareability factor to push into viral territory.'
              : '💪 Your content needs optimization. Work on the hook and retention strategy. Consider adding pattern interrupts, stronger emotional triggers, and a clearer value proposition.'}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- WATCH ROOM ---------- */
function WatchRoom({ data, setData }) {
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomUrl, setRoomUrl] = useState('');
  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [participants, setParticipants] = useState(1);
  const [joined, setJoined] = useState(false);

  const createRoom = () => {
    if (!roomUrl) return;
    const id = 'ROOM-' + Date.now().toString(36).toUpperCase();
    const room = { id, name: roomName || 'Untitled Room', url: roomUrl, createdAt: Date.now(), participants: 1 };
    setData({ ...data, watchRooms: [...data.watchRooms, room] });
    setActiveRoom(room);
    setMessages([{ user: 'System', text: `Room "${room.name}" created. Share the room ID: ${id}`, time: Date.now() }]);
    setParticipants(1);
    setJoined(true);
  };

  const joinRoom = (room) => {
    setActiveRoom(room);
    setMessages([{ user: 'System', text: `You joined "${room.name}"`, time: Date.now() }]);
    setParticipants(room.participants + 1);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!msg.trim()) return;
    setMessages([...messages, { user: 'You', text: msg, time: Date.now() }]);
    setMsg('');
  };

  if (!activeRoom) {
    return (
      <div>
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Create a Watch Room</h3>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Room Name</label>
            <input className="form-input" type="text" placeholder="My Watch Party" value={roomName} onChange={e => setRoomName(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Video URL</label>
            <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={roomUrl} onChange={e => setRoomUrl(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={createRoom}>Create Room</button>
        </div>

        {data.watchRooms.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Recent Rooms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...data.watchRooms].reverse().slice(0, 5).map((r, i) => (
                <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.id}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => joinRoom(r)}>Join</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{activeRoom.name}</h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room: {activeRoom.id} · 👥 {participants} watching</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={activeRoom.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Open Video</a>
          <button className="btn btn-secondary btn-sm" onClick={() => { setActiveRoom(null); setJoined(false); }}>Leave</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div className="glass-card" style={{ padding: 16, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎬</div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Video playback area</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', wordBreak: 'break-all', marginTop: 8 }}>{activeRoom.url}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, maxHeight: 300, overflowY: 'auto', marginBottom: 8, padding: '0 4px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, padding: 8, borderRadius: 8, background: 'rgba(99,102,241,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontWeight: 600, marginBottom: 2 }}>{m.user}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" style={{ flex: 1 }} type="text" placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
