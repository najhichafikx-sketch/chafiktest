import { getSql } from '@/lib/db';

function generateId() {
  return 'VID-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function calculatePriority(creditsSpent, views, reviews) {
  return Math.max(0, 1.0 + (creditsSpent * 0.1) - (views * 0.05) + (reviews * 0.2));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const videoId = searchParams.get('videoId');

    const sql = getSql();
    if (!sql) return Response.json({ videos: [] });

    if (videoId) {
      const videos = await sql`SELECT * FROM platform_videos WHERE id = ${videoId}`;
      return Response.json({ video: videos[0] || null });
    }

    if (userId) {
      const videos = await sql`
        SELECT * FROM platform_videos WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50
      `;
      return Response.json({ videos });
    }

    const videos = await sql`
      SELECT * FROM platform_videos WHERE status = 'active' ORDER BY priority DESC, created_at DESC LIMIT 100
    `;
    return Response.json({ videos });
  } catch (err) {
    return Response.json({ videos: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, url, title, description, category, language, durationMinutes, creditsSpent, feedbackType } = body;

    if (!userId || !url) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    const user = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
    if (user.length === 0) return Response.json({ success: false, error: 'User not found' }, { status: 404 });

    const cost = creditsSpent || (durationMinutes || 1) * 2;
    if (user[0].credits < cost) {
      return Response.json({ success: false, error: 'Insufficient credits', credits: user[0].credits }, { status: 400 });
    }

    const id = generateId();
    const priority = calculatePriority(cost, 0, 0);

    await sql`
      INSERT INTO platform_videos (id, user_id, url, title, description, category, language, duration_minutes, credits_spent, feedback_type, priority, created_at)
      VALUES (${id}, ${userId}, ${url}, ${title || ''}, ${description || ''}, ${category || 'Other'}, ${language || 'English'}, ${durationMinutes || 1}, ${cost}, ${feedbackType || 'general'}, ${priority}, NOW())
    `;

    await sql`
      UPDATE platform_users SET credits = credits - ${cost}, total_spent = total_spent + ${cost}, videos_submitted = videos_submitted + 1, updated_at = NOW()
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO platform_transactions (user_id, type, amount, balance_after, description, reference_id)
      VALUES (${userId}, 'spend', ${-cost}, (SELECT credits FROM platform_users WHERE id = ${userId}), ${`Video submission (${title || url.substring(0, 40)})`}, ${id})
    `;

    return Response.json({ success: true, videoId: id, cost, credits: user[0].credits - cost });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { videoId, field, value } = body;
    if (!videoId || !field) return Response.json({ success: false }, { status: 400 });

    const sql = getSql();
    if (!sql) return Response.json({ success: false }, { status: 500 });

    const allowedFields = ['views', 'reviews', 'status', 'avg_score'];
    if (!allowedFields.includes(field)) return Response.json({ success: false, error: 'Invalid field' }, { status: 400 });

    await sql.query(
      `UPDATE platform_videos SET ${field} = $1, priority = GREATEST(0, 1.0 + (credits_spent * 0.1) - (views * 0.05) + (reviews * 0.2)) WHERE id = $2`,
      [value, videoId]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
