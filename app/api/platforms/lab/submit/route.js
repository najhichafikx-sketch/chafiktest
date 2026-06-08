import { getSql } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId, videoUrl, title, duration } = await request.json();
    if (!userId || !videoUrl) return Response.json({ error: 'userId and videoUrl required' });

    const sql = getSql();
    if (!sql) return Response.json({ id: 'offline_' + Date.now(), offline: true });

    const id = 'lab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const mins = Math.max(1, Math.floor(duration || 1));
    await sql`
      INSERT INTO platform_videos (id, user_id, url, title, duration_minutes, source, status)
      VALUES (${id}, ${userId}, ${videoUrl}, ${title || 'Untitled'}, ${mins}, 'lab', 'pending')
    `;
    return Response.json({ id });
  } catch (e) {
    return Response.json({ error: e.message });
  }
}
