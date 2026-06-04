'use client';

import { useState } from 'react';

const TOOLS = [
  { id:'ranking', name:'Website Ranking Checker', icon:'📊', desc:'Check estimated ranking potential for any keyword on any website',
    color:'linear-gradient(135deg,#dbeafe,#bfdbfe)',
    howTo:['Enter the full website URL and keyword','Click Check Ranking for AI analysis','Review difficulty assessment','Follow the recommendations'],
    fields:[{key:'url',label:'Website URL',type:'url',placeholder:'https://example.com'},{key:'keyword',label:'Target Keyword',type:'text',placeholder:'e.g. best SEO tools'}],
    btnLabel:'Check Ranking' },
  { id:'keywords', name:'Keywords Suggestion Tool', icon:'🔑', desc:'Generate 20 related keywords with search intent and competition analysis',
    color:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    howTo:['Enter a seed keyword or topic','Click Generate Keywords','Review the structured keyword list','Use results for content planning'],
    fields:[{key:'keyword',label:'Seed Keyword or Topic',type:'text',placeholder:'e.g. digital marketing'}],
    btnLabel:'Generate Keywords' },
  { id:'density', name:'Keyword Density Checker', icon:'📏', desc:'Analyze keyword frequency and density in any text content',
    color:'linear-gradient(135deg,#fed7aa,#fdba74)',
    howTo:['Paste your article content','Click Analyze Density','Review the keyword density table','Follow suggestions to optimize balance'],
    fields:[{key:'text',label:'Paste your content',type:'textarea',placeholder:'Paste article text here...'}],
    btnLabel:'Analyze Density' },
  { id:'cache', name:'Google Cache Checker', icon:'💾', desc:'Analyze cache status and crawl frequency estimates for any URL',
    color:'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    howTo:['Enter the URL to check','Click Check Cache','Review cache analysis','Follow tips to improve caching'],
    fields:[{key:'url',label:'Website URL',type:'url',placeholder:'https://example.com/page'}],
    btnLabel:'Check Cache' },
  { id:'index', name:'Google Index Checker', icon:'🔍', desc:'Check if your page is likely indexed and get indexing improvement tips',
    color:'linear-gradient(135deg,#e9d5ff,#d8b4fe)',
    howTo:['Enter the URL to check','Click Check Index','Review indexability assessment','Use methods to verify index status'],
    fields:[{key:'url',label:'Website URL',type:'url',placeholder:'https://example.com/page'}],
    btnLabel:'Check Index' },
  { id:'metaGen', name:'Meta Tag Generator', icon:'🏷️', desc:'Generate complete HTML meta tags including SEO and social media tags',
    color:'linear-gradient(135deg,#ccfbf1,#a7f3d0)',
    howTo:['Enter page title, description, keywords, and URL','Click Generate Meta Tags','Copy the generated HTML','Paste into your page <head>'],
    fields:[{key:'title',label:'Page Title',type:'text',placeholder:'My Awesome Page Title'},{key:'description',label:'Meta Description',type:'text',placeholder:'A brief description of the page...'},{key:'keywords',label:'Target Keywords (comma separated)',type:'text',placeholder:'keyword1, keyword2, keyword3'},{key:'url',label:'Page URL',type:'url',placeholder:'https://example.com/page'}],
    btnLabel:'Generate Meta Tags' },
  { id:'metaAnalyze', name:'Meta Tag Analyzer', icon:'✅', desc:'Analyze existing meta tags and get a quality score with fix suggestions',
    color:'linear-gradient(135deg,#fecaca,#fca5a5)',
    howTo:['Paste URL or HTML meta tags','Click Analyze Meta Tags','Review the 0-100 score','Implement suggested fixes'],
    fields:[{key:'input',label:'URL or HTML Meta Tags',type:'textarea',placeholder:'Paste URL or the <head> HTML section containing meta tags...'}],
    btnLabel:'Analyze Meta Tags' },
  { id:'ogCheck', name:'Open Graph Checker', icon:'📋', desc:'Check Open Graph tags and identify missing or broken social media tags',
    color:'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
    howTo:['Enter URL or paste OG HTML','Click Check OG Tags','Review tag status for each og: property','Get corrected code for missing tags'],
    fields:[{key:'input',label:'URL or OG HTML',type:'textarea',placeholder:'Paste URL or HTML containing og: meta tags...'}],
    btnLabel:'Check OG Tags' },
  { id:'ogGen', name:'Open Graph Generator', icon:'🖼️', desc:'Generate complete Open Graph HTML meta tags for social sharing',
    color:'linear-gradient(135deg,#fef08a,#fde047)',
    howTo:['Enter title, description, image URL, and page URL','Click Generate OG Tags','Copy the generated meta tags','Paste into your page <head>'],
    fields:[{key:'title',label:'OG Title',type:'text',placeholder:'Title for social sharing'},{key:'description',label:'OG Description',type:'text',placeholder:'Description for social sharing'},{key:'image',label:'Image URL',type:'url',placeholder:'https://example.com/image.jpg'},{key:'url',label:'Page URL',type:'url',placeholder:'https://example.com/page'}],
    btnLabel:'Generate OG Tags' },
  { id:'twitterCard', name:'Twitter Card Generator', icon:'🐦', desc:'Generate Twitter Card meta tags for rich tweet previews',
    color:'linear-gradient(135deg,#cffafe,#a5f3fc)',
    howTo:['Select card type and enter title, description, image URL, and Twitter handle','Click Generate Card','Copy the generated HTML','Preview how your card will appear on Twitter'],
    fields:[{key:'cardType',label:'Card Type',type:'select',options:['summary','summary_large_image','app','player']},{key:'title',label:'Card Title',type:'text',placeholder:'Title for Twitter card'},{key:'description',label:'Card Description',type:'text',placeholder:'Description for Twitter card'},{key:'image',label:'Image URL',type:'url',placeholder:'https://example.com/image.jpg'},{key:'site',label:'Twitter Handle',type:'text',placeholder:'@username'}],
    btnLabel:'Generate Card' },
  { id:'utm', name:'UTM Builder', icon:'🔗', desc:'Build complete UTM tracking URLs for campaign measurement',
    color:'linear-gradient(135deg,#ecfccb,#d9f99d)',
    howTo:['Enter base URL and UTM parameters','Click Build URL','Get the complete tagged URL','Copy and use in your campaigns'],
    fields:[{key:'url',label:'Base URL',type:'url',placeholder:'https://example.com/landing-page'},{key:'source',label:'Source',type:'text',placeholder:'google'},{key:'medium',label:'Medium',type:'text',placeholder:'cpc'},{key:'campaign',label:'Campaign Name',type:'text',placeholder:'spring_sale'},{key:'term',label:'Term (optional)',type:'text',placeholder:'seo+tools'},{key:'content',label:'Content (optional)',type:'text',placeholder:'hero_button'}],
    btnLabel:'Build URL' }
];

export default function SeoToolsClient() {
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [vals, setVals] = useState({});

  const tool = open ? TOOLS.find(t => t.id === open) : null;

  const select = (id) => {
    if (open === id) { setOpen(null); return; }
    const t = TOOLS.find(x => x.id === id);
    setOpen(id);
    setResult(null);
    setErr(null);
    const d = {};
    t.fields.forEach(f => { d[f.key] = ''; });
    setVals(d);
  };

  const gen = async () => {
    if (!tool) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch('/api/seo-proxy', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({toolId:tool.id, inputs:vals})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error||'Request failed');
      setResult(d.result);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => { if (result) navigator.clipboard.writeText(result); };

  const inputStyle = {
    width:'100%', padding:'10px 14px', borderRadius:8,
    border:'1px solid var(--glass-border)', background:'var(--glass-bg)',
    color:'var(--text-primary)', fontSize:'0.9rem', outline:'none', boxSizing:'border-box'
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🔧 SEO Toolkit</span>
          <h1 className="section-title">Free AI SEO Tools</h1>
          <p className="section-subtitle">11 powerful AI-driven SEO tools powered by OpenRouter AI.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:24, maxWidth:1200, margin:'0 auto' }}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              style={{
                cursor:'pointer', background:'var(--bg-glass)', backdropFilter:'blur(20px)',
                border: open === t.id ? '2px solid var(--neon-cyan)' : '1px solid var(--bg-glass-border)',
                borderRadius:'var(--radius-xl)', padding:'28px 20px', textAlign:'center',
                transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center',
                fontFamily:'inherit', color:'inherit', width:'100%'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(99,102,241,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize:'2.2rem', marginBottom:12, background:t.color, width:64, height:64, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {t.icon}
              </div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:8, color:'var(--text-primary)' }}>{t.name}</h3>
              <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{t.desc}</p>
            </button>
          ))}
        </div>

        {tool && (
          <div key={open} style={{ marginTop:40 }} className="saas-result-fade">
            <div className="glass-card" style={{ padding:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <div style={{ fontSize:'2rem', background:tool.color, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12 }}>
                  {tool.icon}
                </div>
                <div>
                  <h2 style={{ margin:0, fontSize:'1.3rem' }}>{tool.name}</h2>
                  <p style={{ margin:'4px 0 0', color:'var(--text-secondary)', fontSize:'0.85rem' }}>{tool.desc}</p>
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <h4 style={{ fontSize:'0.95rem', marginBottom:12 }}>How to use:</h4>
                <ol style={{ margin:0, paddingLeft:20, color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:2 }}>
                  {tool.howTo.map((s,i) => <li key={i}>{s}</li>)}
                </ol>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
                {tool.fields.map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:6, display:'block' }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={vals[f.key]||''} onChange={e => setVals(p => ({...p, [f.key]: e.target.value}))} style={inputStyle}>
                        <option value="">Select...</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={vals[f.key]||''} onChange={e => setVals(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} rows={5} style={{...inputStyle, resize:'vertical', minHeight:100, fontFamily:'inherit'}} />
                    ) : (
                      <input type={f.type} value={vals[f.key]||''} onChange={e => setVals(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} style={inputStyle} />
                    )}
                  </div>
                ))}
              </div>

              <button onClick={gen} disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'12px 24px', fontSize:'1rem', opacity:loading?0.7:1 }}>
                {loading ? 'Analyzing...' : tool.btnLabel}
              </button>

              {loading && (
                <div style={{ textAlign:'center', padding:40 }}>
                  <div className="saas-spinner" style={{ margin:'0 auto 16px', width:40, height:40, borderWidth:3 }} />
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Analyzing with AI...</p>
                </div>
              )}

              {err && (
                <div className="glass-card" style={{ marginTop:20, padding:16, borderLeft:'4px solid #ef4444' }}>
                  <p style={{ color:'#ef4444', margin:0, fontSize:'0.9rem' }}>⚠ {err}</p>
                </div>
              )}

              {result && (
                <div className="results-section" style={{ marginTop:24 }}>
                  <div className="results-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h3 style={{ margin:0 }}>Result</h3>
                    <button onClick={copy} className="btn btn-sm btn-outline">📋 Copy</button>
                  </div>
                  <div className="glass-card" style={{ padding:24, whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'0.9rem', lineHeight:1.7, color:'var(--text-secondary)', maxHeight:600, overflowY:'auto' }}>{result}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
