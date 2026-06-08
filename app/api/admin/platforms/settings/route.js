import { getSql } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    const rows = await sql`SELECT key, value FROM platform_settings ORDER BY key`;
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;

    const stats = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM platform_users) AS total_users,
        (SELECT COUNT(*)::int FROM platform_videos WHERE status = 'active') AS active_videos,
        (SELECT COALESCE(SUM(credits), 0)::int FROM platform_users) AS total_credits,
        (SELECT COUNT(*)::int FROM platform_transactions WHERE created_at >= CURRENT_DATE) AS today_transactions,
        (SELECT COALESCE(SUM(credits_earned), 0)::int FROM platform_watch_sessions WHERE created_at >= CURRENT_DATE) AS today_credits_earned,
        (SELECT COALESCE(SUM(amount), 0)::int FROM platform_transactions WHERE type = 'spend' AND created_at >= CURRENT_DATE) AS today_credits_spent
    `;

    return Response.json({ success: true, settings, stats: stats[0] });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key || value === undefined) return Response.json({ success: false, error: 'Missing key/value' }, { status: 400 });

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    await sql`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;

    return Response.json({ success: true, message: 'Setting saved' });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
