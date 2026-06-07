import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'ad_events.json');
const MAX_EVENTS = 20000;

async function ensureFile() {
  try {
    await fs.access(EVENTS_FILE);
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(EVENTS_FILE, '[]', 'utf-8');
    } catch {}
  }
}

async function readEvents() {
  await ensureFile();
  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeEvents(events) {
  await ensureFile();
  const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
  await fs.writeFile(EVENTS_FILE, JSON.stringify(trimmed), 'utf-8');
}

export async function POST(request) {
  try {
    let body = {};
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    const events = Array.isArray(body.events) ? body.events : [];
    if (events.length === 0) {
      return NextResponse.json({ ok: true, stored: 0 });
    }

    const sanitized = events
      .filter(e => e && e.type)
      .slice(0, 200)
      .map(e => ({
        type: String(e.type).slice(0, 30),
        ts: Number(e.ts) || Date.now(),
        adType: e.adType || null,
        slot: e.slot || null,
        network: e.network || null,
        pageType: e.pageType || null,
        device: e.device || null,
        visitorId: e.visitorId ? String(e.visitorId).slice(0, 50) : null,
        sessionId: e.sessionId ? String(e.sessionId).slice(0, 50) : null,
        country: e.country || e.geo || null,
        reason: e.reason || null,
        action: e.action || null,
        value: typeof e.value === 'number' ? e.value : null,
        path: e.path ? String(e.path).slice(0, 200) : null
      }));

    const existing = await readEvents();
    const merged = existing.concat(sanitized);
    await writeEvents(merged);

    return NextResponse.json({ ok: true, stored: sanitized.length });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to store events' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Use POST to submit ad tracking events' });
}
