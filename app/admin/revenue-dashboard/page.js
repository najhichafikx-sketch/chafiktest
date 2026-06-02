'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TOOL_NAMES } from '@/lib/tool-content';
import { TOOL_MONETIZATION, AD_SLOT_WEIGHTS, getToolCategoryGroup } from '@/lib/monetization';

const MOCK_DATA = (() => {
  const tools = Object.keys(TOOL_MONETIZATION);
  const slots = ['header', 'sidebar', 'footer', 'content_top', 'content_bottom', 'popup', 'in_tool', 'mid_result'];
  const adData = {};

  for (const slot of slots) {
    const impressions = Math.floor(500 + Math.random() * 9500);
    const clicks = Math.floor(impressions * (0.005 + Math.random() * 0.025));
    adData[slot] = { impressions, clicks, ctr: (clicks / impressions * 100).toFixed(2), estimatedRevenue: (clicks * (0.05 + Math.random() * 0.15)).toFixed(2) };
  }

  const toolData = {};
  for (const toolId of tools) {
    const profile = TOOL_MONETIZATION[toolId];
    const views = Math.floor(200 + Math.random() * 4800);
    const adViews = Math.floor(views * (0.3 + Math.random() * 0.5));
    const adClicks = Math.floor(adViews * (0.01 + Math.random() * 0.03));
    const density = profile.density;
    const multiplier = density === 3 ? 2.5 : density === 2 ? 1.5 : 1;
    toolData[toolId] = {
      views, adViews, adClicks,
      ctr: (adClicks / (adViews || 1) * 100).toFixed(2),
      estimatedRevenue: (adClicks * 0.08 * multiplier).toFixed(2),
      weight: profile.weight,
      density: profile.density,
      category: profile.category
    };
  }

  const totalImpressions = slots.reduce((s, k) => s + adData[k].impressions, 0);
  const totalClicks = slots.reduce((s, k) => s + adData[k].clicks, 0);
  const totalRevenue = slots.reduce((s, k) => s + parseFloat(adData[k].estimatedRevenue), 0);
  const totalCtr = totalClicks / totalImpressions * 100;

  const daily = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayImpressions = Math.floor(800 + Math.random() * 4200);
    const dayClicks = Math.floor(dayImpressions * (0.008 + Math.random() * 0.022));
    daily.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      impressions: dayImpressions,
      clicks: dayClicks,
      revenue: (dayClicks * (0.06 + Math.random() * 0.12)).toFixed(2),
      ctr: (dayClicks / dayImpressions * 100).toFixed(2)
    });
  }

  return { adData, toolData, totalImpressions, totalClicks, totalRevenue: totalRevenue.toFixed(2), totalCtr: totalCtr.toFixed(2), daily };
})();

function Bar({ value, maxValue, color, height = 6 }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={{ width: '100%', height, background: 'rgba(99,102,241,0.1)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || 'var(--gradient-primary)', borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function MiniChart({ data, color, height = 40 }) {
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  return (
    <svg width="100%" height={height} style={{ display: 'block' }}>
      {data.map((v, i) => (
        <rect key={i} x={`${i * w}%`} y={height - (v / max) * height} width={`${w - 1}%`} height={(v / max) * height} fill={color || '#6366f1'} rx={2} />
      ))}
    </svg>
  );
}

function FilterBar({ tools, selectedTool, onToolChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Filter by tool:</span>
      <select className="form-input" style={{ width: 260 }} value={selectedTool} onChange={e => onToolChange(e.target.value)}>
        <option value="">All Tools</option>
        {tools.map(t => <option key={t} value={t}>{TOOL_NAMES[t]?.name || t}</option>)}
      </select>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Last 30 days · Simulated data</span>
    </div>
  );
}

export default function RevenueDashboardPage() {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); }
  }, [router]);

  const toolIds = useMemo(() => Object.keys(TOOL_MONETIZATION), []);

  const filteredTools = useMemo(() => {
    if (!selectedTool) return Object.entries(MOCK_DATA.toolData);
    return Object.entries(MOCK_DATA.toolData).filter(([id]) => id === selectedTool);
  }, [selectedTool]);

  const slotRanking = useMemo(() => {
    return Object.entries(MOCK_DATA.adData)
      .sort((a, b) => parseFloat(b[1].ctr) - parseFloat(a[1].ctr))
      .map(([slot, data]) => ({ slot, ...data }));
  }, []);

  const toolRevenueRanking = useMemo(() => {
    return filteredTools
      .sort((a, b) => parseFloat(b[1].estimatedRevenue) - parseFloat(a[1].estimatedRevenue))
      .slice(0, 10)
      .map(([id, data]) => ({ id, name: TOOL_NAMES[id]?.name || id, ...data }));
  }, [filteredTools]);

  const toolCtrRanking = useMemo(() => {
    return filteredTools
      .sort((a, b) => parseFloat(b[1].ctr) - parseFloat(a[1].ctr))
      .slice(0, 10)
      .map(([id, data]) => ({ id, name: TOOL_NAMES[id]?.name || id, ...data }));
  }, [filteredTools]);

  const totalImpressions = MOCK_DATA.totalImpressions;
  const totalClicks = MOCK_DATA.totalClicks;
  const totalCtr = MOCK_DATA.totalCtr;
  const totalRevenue = MOCK_DATA.totalRevenue;

  const maxRevenue = toolRevenueRanking.length > 0 ? Math.max(...toolRevenueRanking.map(t => parseFloat(t.estimatedRevenue))) : 1;
  const maxCtr = toolCtrRanking.length > 0 ? Math.max(...toolCtrRanking.map(t => parseFloat(t.ctr))) : 1;
  const maxSlotCtr = slotRanking.length > 0 ? Math.max(...slotRanking.map(s => parseFloat(s.ctr))) : 1;

  return (
    <section className="section" style={{ paddingTop: 100 }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ marginBottom: 4 }}>Revenue Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ad monetization analytics · CTR optimization · Tool-level revenue intelligence</p>
        </div>

        <div className="dashboard-stats" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-header"><div className="stat-card-icon purple">👁️</div></div>
            <div className="stat-card-value">{totalImpressions.toLocaleString()}</div>
            <div className="stat-card-label">Total Ad Impressions</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-header"><div className="stat-card-icon green">👆</div></div>
            <div className="stat-card-value">{totalClicks.toLocaleString()}</div>
            <div className="stat-card-label">Total Ad Clicks</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-header"><div className="stat-card-icon cyan">📊</div></div>
            <div className="stat-card-value">{totalCtr}%</div>
            <div className="stat-card-label">Overall CTR</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-header"><div className="stat-card-icon gold">💰</div></div>
            <div className="stat-card-value">${totalRevenue}</div>
            <div className="stat-card-label">Est. Revenue (30d)</div>
          </div>
        </div>

        <FilterBar tools={toolIds} selectedTool={selectedTool} onToolChange={setSelectedTool} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h3>💰 Top Earning Tools</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {toolRevenueRanking.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.weight} · {t.density} ads</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <Bar value={parseFloat(t.estimatedRevenue)} maxValue={maxRevenue} color="#f59e0b" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neon-cyan)', minWidth: 60, textAlign: 'right' }}>${t.estimatedRevenue}</span>
                </div>
              ))}
              {toolRevenueRanking.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No data for selected tool</p>}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header"><h3>📈 Highest CTR Pages</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {toolCtrRanking.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.adViews} ad views</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <Bar value={parseFloat(t.ctr)} maxValue={maxCtr} color="#22c55e" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neon-green)', minWidth: 50, textAlign: 'right' }}>{t.ctr}%</span>
                </div>
              ))}
              {toolCtrRanking.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No data for selected tool</p>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h3>📊 Ad Slot Performance</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slotRanking.map((s, i) => (
                <div key={s.slot} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.slot.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.impressions.toLocaleString()} impressions</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <Bar value={parseFloat(s.ctr)} maxValue={maxSlotCtr} color="#8b5cf6" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neon-purple)', minWidth: 50, textAlign: 'right' }}>{s.ctr}%</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', minWidth: 50, textAlign: 'right' }}>${s.estimatedRevenue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header"><h3>📅 Daily Trend (30 days)</h3></div>
            <div style={{ marginBottom: 16 }}>
              <MiniChart data={MOCK_DATA.daily.map(d => d.impressions)} color="#6366f1" height={50} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>{MOCK_DATA.daily[0]?.date}</span>
                <span>Daily Impressions</span>
                <span>{MOCK_DATA.daily[MOCK_DATA.daily.length - 1]?.date}</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <MiniChart data={MOCK_DATA.daily.map(d => d.clicks)} color="#22c55e" height={50} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>{MOCK_DATA.daily[0]?.date}</span>
                <span>Daily Clicks</span>
                <span>{MOCK_DATA.daily[MOCK_DATA.daily.length - 1]?.date}</span>
              </div>
            </div>
            <div>
              <MiniChart data={MOCK_DATA.daily.map(d => parseFloat(d.revenue))} color="#f59e0b" height={50} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>{MOCK_DATA.daily[0]?.date}</span>
                <span>Daily Revenue ($)</span>
                <span>{MOCK_DATA.daily[MOCK_DATA.daily.length - 1]?.date}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ marginBottom: 24 }}>
          <div className="dashboard-card-header"><h3>⚙️ Monetization Settings by Tool Category</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[['high', 'Premium Tools', 3], ['medium', 'Standard Tools', 2], ['low', 'Basic Tools', 1]].map(([weight, label, density]) => (
              <div key={weight} className="stat-card" style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{weight === 'high' ? '🔥' : weight === 'medium' ? '⭐' : '📘'}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{density} ad slot{density > 1 ? 's' : ''} · {weight} CTR</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>📋 All Tools Revenue Breakdown</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Tool</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Ad Views</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Clicks</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>CTR</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Weight</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Est. Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MOCK_DATA.toolData).sort((a, b) => parseFloat(b[1].estimatedRevenue) - parseFloat(a[1].estimatedRevenue)).map(([id, data]) => (
                  <tr key={id} style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{TOOL_NAMES[id]?.name || id}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{data.views}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{data.adViews}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{data.adClicks}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neon-green)' }}>{data.ctr}%</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem',
                        background: data.weight === 'high' ? 'rgba(239,68,68,0.15)' : data.weight === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                        color: data.weight === 'high' ? '#ef4444' : data.weight === 'medium' ? '#f59e0b' : '#6366f1'
                      }}>{data.weight}</span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neon-cyan)', fontWeight: 700 }}>${data.estimatedRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
