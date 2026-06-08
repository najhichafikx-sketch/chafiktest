import { getSql } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const userId = searchParams.get('userId');

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    let videos;
    if (userId) {
      videos = await sql`SELECT v.*, u.credits AS user_credits FROM platform_videos v LEFT JOIN platform_users u ON v.user_id = u.id WHERE v.user_id = ${userId} ORDER BY v.created_at DESC LIMIT 100`;
    } else if (status === 'all') {
      videos = await sql`SELECT v.*, u.credits AS user_credits FROM platform_videos v LEFT JOIN platform_users u ON v.user_id = u.id ORDER BY v.created_at DESC LIMIT 200`;
    } else {
      videos = await sql`SELECT v.*, u.credits AS user_credits FROM platform_videos v LEFT JOIN platform_users u ON v.user_id = u.id WHERE v.status = ${status} ORDER BY v.created_at DESC LIMIT 200`;
    }

    const users = await sql`SELECT id, credits, total_earned, total_spent, videos_submitted, feedback_given, created_at FROM platform_users ORDER BY created_at DESC LIMIT 100`;

    return Response.json({ success: true, videos, users });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { videoId, action } = body;

    if (!videoId || !action) {
      return Response.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    if (action === 'delete') {
      await sql`DELETE FROM platform_feedback WHERE video_id = ${videoId}`;
      await sql`DELETE FROM platform_watch_sessions WHERE video_id = ${videoId}`;
      await sql`DELETE FROM platform_videos WHERE id = ${videoId}`;
      return Response.json({ success: true, message: 'Video deleted' });
    }

    if (action === 'flag' || action === 'approve') {
      const newStatus = action === 'flag' ? 'flagged' : 'active';
      await sql`UPDATE platform_videos SET status = ${newStatus} WHERE id = ${videoId}`;
      return Response.json({ success: true, message: `Video ${newStatus}` });
    }

    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
