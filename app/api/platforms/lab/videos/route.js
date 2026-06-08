import { getSql } from '@/lib/db';

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('userId');

  const sql = getSql();
  if (!sql) return Response.json({ videos: [] });

  try {
    const result = await sql`
      SELECT id, user_id, url, title, duration_minutes, created_at
      FROM platform_videos
      WHERE source = 'lab' AND status = 'pending' AND user_id != ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    const videos = result.map(r => ({
      id: r.id, userId: r.user_id, video_url: r.url,
      video_title: r.title, duration: r.duration_minutes, created_at: r.created_at
    }));
    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] });
  }
}
