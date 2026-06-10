import { getSql } from '@/lib/db';

const DEFAULT_VIDEO = {
  id: 'default_chafiktech',
  userId: 'system',
  video_url: 'https://www.youtube.com/watch?v=yXFjU-z3bUU',
  video_title: 'Chafiktech Pre-Launch Video — Earn Points While Watching!',
  duration: 10,
  created_at: new Date().toISOString(),
  isDefault: true
};

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('userId');

  let dbVideos = [];
  const sql = getSql();
  if (sql) {
    try {
      const result = await sql`
        SELECT id, user_id, url, title, duration_minutes, created_at
        FROM platform_videos
        WHERE source = 'lab' AND status = 'pending' AND user_id != ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      `;
      dbVideos = result.map(r => ({
        id: r.id, userId: r.user_id, video_url: r.url,
        video_title: r.title, duration: r.duration_minutes, created_at: r.created_at
      }));
    } catch {}
  }

  // Always include the default video first
  const videos = [DEFAULT_VIDEO, ...dbVideos];
  return Response.json({ videos });
}