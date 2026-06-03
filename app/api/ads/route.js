import { getAdSettings } from '@/lib/db';

function stripScripts(code) {
  return (code || '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();
}

const FALLBACKS = {
  header: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Header Ad</div>',
  sidebar: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;min-height:250px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Sidebar Ad</div>',
  content_top: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:120px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Content Ad</div>',
  content_bottom: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:120px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Content Footer Ad</div>',
  footer: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Footer Ad</div>',
  in_tool: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:60px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">In-Tool Ad</div>',
  loading_state: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:60px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Loading Ad</div>',
  mid_result: '<div style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:8px;height:120px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Mid-Result Ad</div>',
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');

  try {
    const dbAds = await getAdSettings();
    if (dbAds && dbAds.length > 0) {
      for (const a of dbAds) {
        if (a.location === location && a.enabled && a.code) {
          const html = stripScripts(a.code);
          if (html) return Response.json({ success: true, html });
        }
      }
    }
  } catch {}

  const fallback = FALLBACKS[location] || FALLBACKS.content_top;
  return Response.json({ success: true, html: fallback });
}
