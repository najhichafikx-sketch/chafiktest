import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'ad_events.json');

async function readEvents() {
  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function aggregate(events) {
  const now = Date.now();
  const last24h = events.filter(e => now - (e.ts || 0) < 86400000);
  const last7d = events.filter(e => now - (e.ts || 0) < 7 * 86400000);

  const impressions = last24h.filter(e => e.type === 'impression');
  const clicks = last24h.filter(e => e.type === 'click');
  const pageEnters = last24h.filter(e => e.type === 'page_enter');
  const conversions = last24h.filter(e => e.type === 'conversion');
  const blocked = last24h.filter(e => e.type === 'blocked');

  const uniqueVisitors = new Set(last24h.map(e => e.visitorId).filter(Boolean));
  const uniqueSessions = new Set(last24h.map(e => e.sessionId).filter(Boolean));

  const networkCPM = { monetag: 2.5, adsterra: 1.8 };
  const revenue = impressions.reduce((sum, imp) => {
    const cpm = networkCPM[imp.network] || 1.0;
    return sum + (cpm / 1000);
  }, 0);
  const rpm = pageEnters.length > 0 ? (revenue / pageEnters.length) * 1000 : 0;

  const byNetwork = {};
  for (const imp of impressions) {
    const n = imp.network || 'unknown';
    if (!byNetwork[n]) byNetwork[n] = { impressions: 0, clicks: 0, revenue: 0 };
    byNetwork[n].impressions++;
    byNetwork[n].revenue += (networkCPM[n] || 1) / 1000;
  }
  for (const c of clicks) {
    const n = c.network || 'unknown';
    if (!byNetwork[n]) byNetwork[n] = { impressions: 0, clicks: 0, revenue: 0 };
    byNetwork[n].clicks++;
  }

  const byDevice = {};
  for (const imp of impressions) {
    const d = imp.device || 'unknown';
    if (!byDevice[d]) byDevice[d] = { impressions: 0, clicks: 0 };
    byDevice[d].impressions++;
  }
  for (const c of clicks) {
    const d = c.device || 'unknown';
    if (!byDevice[d]) byDevice[d] = { impressions: 0, clicks: 0 };
    byDevice[d].clicks++;
  }

  const byPageType = {};
  for (const imp of impressions) {
    const p = imp.pageType || 'unknown';
    if (!byPageType[p]) byPageType[p] = { impressions: 0, clicks: 0 };
    byPageType[p].impressions++;
  }

  const byAdType = {};
  for (const imp of impressions) {
    const t = imp.adType || 'unknown';
    if (!byAdType[t]) byAdType[t] = { impressions: 0, clicks: 0 };
    byAdType[t].impressions++;
  }
  for (const c of clicks) {
    const t = c.adType || 'unknown';
    if (!byAdType[t]) byAdType[t] = { impressions: 0, clicks: 0 };
    byAdType[t].clicks++;
  }

  const blockReasons = {};
  for (const b of blocked) {
    const r = b.reason || 'unknown';
    blockReasons[r] = (blockReasons[r] || 0) + 1;
  }

  const timeseries = {};
  for (const e of last24h) {
    const hour = new Date(e.ts).toISOString().slice(0, 13) + ':00';
    if (!timeseries[hour]) timeseries[hour] = { impressions: 0, clicks: 0, revenue: 0 };
    if (e.type === 'impression') {
      timeseries[hour].impressions++;
      const cpm = networkCPM[e.network] || 1;
      timeseries[hour].revenue += cpm / 1000;
    }
    if (e.type === 'click') timeseries[hour].clicks++;
  }

  return {
    last24h: {
      impressions: impressions.length,
      clicks: clicks.length,
      pageViews: pageEnters.length,
      conversions: conversions.length,
      blocked: blocked.length,
      revenue: Number(revenue.toFixed(2)),
      rpm: Number(rpm.toFixed(2)),
      ctr: impressions.length > 0 ? Number((clicks.length / impressions.length * 100).toFixed(2)) : 0,
      uniqueVisitors: uniqueVisitors.size,
      uniqueSessions: uniqueSessions.size
    },
    last7d: {
      events: last7d.length
    },
    byNetwork,
    byDevice,
    byPageType,
    byAdType,
    blockReasons,
    timeseries
  };
}

export async function GET(request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const events = await readEvents();
    const stats = aggregate(events);
    return NextResponse.json({ ok: true, stats, eventCount: events.length });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
