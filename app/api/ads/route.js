import { getAdSettings } from '@/lib/db';

function stripScripts(code) {
  return (code || '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();
}

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

  return Response.json({ success: true, html: '' });
}
