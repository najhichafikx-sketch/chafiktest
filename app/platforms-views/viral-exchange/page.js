'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { CATEGORIES, LANGUAGES, generateCampaignId } from '@/lib/platforms-views-content';

const STORAGE_KEY = 'pv_viral_exchange';

function loadData() {
  if (typeof window === 'undefined') return { credits: 50, campaigns: [], watchHistory: [], leaderboard: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { credits: 50, campaigns: [], watchHistory: [], leaderboard: [] };
}

function saveData(data) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function ViralExchangePage() {
  const [tab, setTab] = useState('earn');
  const [data, setData] = useState(null);
  const [watchState, setWatchState] = useState(null);
  const timerRef = useRef(null);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => { setData(loadData()); }, []);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  if (!data) return null;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/platforms-views" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem' }}>&larr; Back to Platforms Views</Link>
        </div>
        <div className="section-header">
          <span className="section-badge">🔄 Viral Exchange</span>
          <h1 className="section-title">Earn Credits, Get Views</h1>
          <p className="section-subtitle">Watch videos from fellow creators to earn credits. Spend credits to promote your own content.</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 140 }}><div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Credits</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{data.credits}</div></div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 140 }}><div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Campaigns</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.campaigns.length}</div></div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 140 }}><div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Watched</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.watchHistory.length}</div></div>
        </div>

        <div className="blog-categories" style={{ marginBottom: 24 }}>
          {['earn', 'promote', 'dashboard', 'leaderboard'].map(t => (
            <span key={t} className={`blog-category ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'earn' ? '💰 Earn Credits' : t === 'promote' ? '📢 Promote' : t === 'dashboard' ? '📊 Dashboard' : '🏆 Leaderboard'}
            </span>
          ))}
        </div>

        {tab === 'earn' && <EarnCredits data={data} setData={setData} watchState={watchState} setWatchState={setWatchState} timerRef={timerRef} sessionValid={sessionValid} setSessionValid={setSessionValid} />}
        {tab === 'promote' && <PromoteVideo data={data} setData={setData} />}
        {tab === 'dashboard' && <CampaignDashboard data={data} />}
        {tab === 'leaderboard' && <Leaderboard data={data} />}
      </div>
    </section>
  );
}

function EarnCredits({ data, setData, watchState, setWatchState, timerRef, sessionValid, setSessionValid }) {
  const [countdown, setCountdown] = useState(0);
  const [currentVideo, setCurrentVideo] = useState('');
  const [verifyChallenge, setVerifyChallenge] = useState(null);
  const [earning, setEarning] = useState(0);

  const available = data.campaigns.filter(c => c.status === 'active' && c.url);

  useEffect(() => {
    if (countdown > 0 && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setVerifyChallenge({ question: 'What color appears most in the video?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: ['Blue', 'Green'][Math.floor(Math.random() * 2)] });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [countdown]);

  const startWatching = (url, duration) => {
    setCurrentVideo(url);
    setCountdown(duration);
    setEarning(duration >= 90 ? 3 : duration >= 60 ? 2 : 1);
    setWatchState('watching');
    setSessionValid(true);
  };

  const handleVerify = (selected) => {
    if (selected === verifyChallenge.answer) {
      const newData = { ...data, credits: data.credits + earning, watchHistory: [...data.watchHistory, { url: currentVideo, earned: earning, timestamp: Date.now() }] };
      setData(newData);
      setWatchState(null);
      setCurrentVideo('');
      setVerifyChallenge(null);
      setEarning(0);
    } else {
      setSessionValid(false);
      setWatchState(null);
      setCurrentVideo('');
      setVerifyChallenge(null);
      setEarning(0);
    }
  };

  if (watchState === 'watching') {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏱️</div>
        <h3 style={{ marginBottom: 12 }}>Watching Video</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8, wordBreak: 'break-all' }}>{currentVideo}</p>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--neon-cyan)', margin: '20px 0' }}>{countdown}s</div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Earning: {earning} credit{earning > 1 ? 's' : ''}</p>
        <div style={{ width: '100%', height: 4, background: 'rgba(99,102,241,0.2)', borderRadius: 2, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ width: `${(1 - countdown / (earning === 3 ? 90 : earning === 2 ? 60 : 30)) * 100}%`, height: '100%', background: 'var(--neon-cyan)', transition: 'width 1s linear' }} />
        </div>
      </div>
    );
  }

  if (verifyChallenge) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>✅</div>
        <h3 style={{ marginBottom: 12 }}>Quick Verification</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{verifyChallenge.question}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {verifyChallenge.options.map(o => (
            <button key={o} className="btn btn-outline" onClick={() => handleVerify(o)}>{o}</button>
          ))}
        </div>
      </div>
    );
  }

  if (available.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No videos available to watch. Check back soon or promote your own video to get the exchange started!</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>Watch videos from creators to earn credits. 30s = 1 credit, 60s = 2 credits, 90s = 3 credits.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {available.map((camp, i) => (
          <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{camp.category} · {camp.language}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-all' }}>{camp.url}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>ID: {camp.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => startWatching(camp.url, 30)}>30s · 1cr</button>
              <button className="btn btn-outline btn-sm" onClick={() => startWatching(camp.url, 60)}>60s · 2cr</button>
              <button className="btn btn-primary btn-sm" onClick={() => startWatching(camp.url, 90)}>90s · 3cr</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoteVideo({ data, setData }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [lang, setLang] = useState('English');
  const [spend, setSpend] = useState(10);
  const [campaignId, setCampaignId] = useState(null);
  const [error, setError] = useState('');

  const handlePromote = () => {
    setError('');
    if (!url) { setError('Enter a video URL'); return; }
    if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('tiktok.com')) { setError('Enter a valid YouTube or TikTok URL'); return; }
    if (spend < 5) { setError('Minimum 5 credits'); return; }
    if (spend > data.credits) { setError('Not enough credits'); return; }

    const id = generateCampaignId();
    const campaign = { id, url, category, language: lang, spend, spent: 0, views: 0, completed: 0, status: 'active', createdAt: Date.now() };
    const newData = { ...data, credits: data.credits - spend, campaigns: [...data.campaigns, campaign] };
    setData(newData);
    setCampaignId(id);
    setUrl('');
  };

  return (
    <div>
      {campaignId ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ marginBottom: 12 }}>Campaign Created!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your campaign ID:</p>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 16, fontFamily: 'monospace' }}>{campaignId}</div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 20 }}>Your video is now in the exchange. Other creators will watch it and earn credits.</p>
          <button className="btn btn-secondary" onClick={() => setCampaignId(null)}>Create Another</button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Promote Your Video</h3>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Video URL (YouTube or TikTok)</label>
            <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-input" value={lang} onChange={e => setLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Credits to spend (min 5 · balance: {data.credits})</label>
            <input className="form-input" type="number" min={5} max={data.credits} value={spend} onChange={e => setSpend(parseInt(e.target.value) || 5)} />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePromote}>Promote Video ({spend} credits)</button>
        </div>
      )}
    </div>
  );
}

function CampaignDashboard({ data }) {
  if (data.campaigns.length === 0) return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No campaigns yet. Promote your first video!</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.campaigns.map((camp, i) => {
        const rate = camp.spent > 0 ? Math.round((camp.completed / camp.spent) * 100) : 0;
        return (
          <div key={i} className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{camp.category} · {camp.language}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>{camp.url}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{camp.id}</div>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 999, background: camp.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: camp.status === 'active' ? 'var(--neon-green)' : '#ef4444' }}>{camp.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Spent</div><div style={{ fontWeight: 600 }}>{camp.spent} / {camp.spend} cr</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Views</div><div style={{ fontWeight: 600 }}>{camp.views}</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Completion</div><div style={{ fontWeight: 600 }}>{rate}%</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Watch Time</div><div style={{ fontWeight: 600 }}>{camp.completed * 30}s</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Leaderboard({ data }) {
  const topCreators = [...data.campaigns].sort((a, b) => b.views - a.views).slice(0, 10);
  const topWatched = [...data.campaigns].sort((a, b) => b.completed - a.completed).slice(0, 10);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🏆 Top Campaigns</h3>
        {topCreators.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No campaigns yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCreators.map((c, i) => (
              <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span style={{ fontWeight: 700, marginRight: 8 }}>#{i + 1}</span><span style={{ fontSize: '0.85rem' }}>{c.url?.substring(0, 30)}...</span></div>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{c.views} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>📈 Trending</h3>
        {topWatched.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topWatched.map((c, i) => (
              <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span style={{ fontWeight: 700, marginRight: 8 }}>#{i + 1}</span><span style={{ fontSize: '0.85rem' }}>{c.url?.substring(0, 30)}...</span></div>
                <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>{c.completed} completions</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
