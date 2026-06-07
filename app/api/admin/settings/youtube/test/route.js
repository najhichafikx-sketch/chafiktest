import { verifyAdmin } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 10 });

async function testYouTubeKey(apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  return res.ok;
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const { apiKey } = body;

  if (!apiKey) {
    return Response.json({ success: false, message: 'No API key provided' }, { status: 400 });
  }

  try {
    const ok = await testYouTubeKey(apiKey);
    if (ok) {
      await writeLog('INFO', 'YouTube API test successful');
      return Response.json({ success: true, message: '✅ الاتصال ناجح!' });
    }
    return Response.json({ success: false, message: 'مفتاح غير صالح أو منتهي' }, { status: 400 });
  } catch (e) {
    return Response.json({ success: false, message: e.message || 'فشل الاتصال' }, { status: 500 });
  }
}
