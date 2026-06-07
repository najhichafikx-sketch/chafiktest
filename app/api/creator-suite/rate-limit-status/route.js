import { getRateLimitLastUsed } from '@/lib/db';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;

function getUserId(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function GET(request) {
  const userId = getUserId(request);
  const rateKey = `creator-suite:ai-generate:${userId}`;

  try {
    const lastUsed = await getRateLimitLastUsed(rateKey);
    const now = Date.now();
    if (lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000);
      return Response.json({ allowed: false, retry_after_seconds: retryAfterSeconds, last_used: new Date(lastUsed).toISOString() });
    }
    return Response.json({ allowed: true, retry_after_seconds: 0, last_used: lastUsed ? new Date(lastUsed).toISOString() : null });
  } catch (e) {
    return Response.json({ allowed: true, retry_after_seconds: 0, last_used: null });
  }
}
