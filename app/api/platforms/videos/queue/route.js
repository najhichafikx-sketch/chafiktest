import { getSql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const excludeOwn = searchParams.get('excludeOwn') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 20;

    const sql = getSql();
    if (!sql) return Response.json({ videos: [], queuePosition: 0 });

    const settingsRows = await sql`SELECT key, value FROM platform_settings WHERE key IN ('queue_batch_size', 'new_user_visibility_boost', 'priority_base')`;
    const settings = {};
    for (const r of settingsRows) settings[r.key] = r.value;
    const batchSize = typeof settings.queue_batch_size === 'number' ? settings.queue_batch_size : 20;

    let whereClause = "v.status = 'active'";
    const params = [];
    let paramIdx = 1;

    if (excludeOwn && userId) {
      whereClause += ` AND v.user_id != $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    }

    const queryStr = `SELECT v.* FROM platform_videos v WHERE ${whereClause} ORDER BY v.priority DESC, v.created_at DESC LIMIT $${paramIdx}`;
    params.push(Math.min(limit, batchSize));

    const videos = await sql.query(queryStr, params);

    let queuePosition = 0;
    if (userId) {
      const aheadResult = await sql.query(
        `SELECT COUNT(*)::int AS c FROM platform_videos WHERE status = 'active' AND priority > COALESCE((SELECT MIN(priority) FROM platform_videos WHERE user_id = $1 AND status = 'active'), 0)`,
        [userId]
      );
      queuePosition = aheadResult[0]?.c || 0;
    }

    return Response.json({
      videos: videos || [],
      queuePosition,
      totalInQueue: (videos || []).length
    });
  } catch (err) {
    return Response.json({ videos: [], queuePosition: 0 });
  }
}
