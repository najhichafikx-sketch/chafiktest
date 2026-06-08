import { getSql } from '@/lib/db';

function generateId() {
  return 'FBK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, videoId, hookScore, editingScore, audioScore, thumbnailScore, retentionScore, ctaScore, whatWorked, whatImprove, wouldContinue } = body;

    if (!userId || !videoId) {
      return Response.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    const existing = await sql`
      SELECT COUNT(*)::int AS c FROM platform_feedback WHERE user_id = ${userId} AND video_id = ${videoId}
    `;
    if (existing[0]?.c > 0) {
      return Response.json({ success: false, error: 'Already reviewed this video' }, { status: 400 });
    }

    const scores = [hookScore || 0, editingScore || 0, audioScore || 0, thumbnailScore || 0, retentionScore || 0, ctaScore || 0];
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const id = generateId();

    await sql`
      INSERT INTO platform_feedback (id, user_id, video_id, hook_score, editing_score, audio_score, thumbnail_score, retention_score, cta_score, what_worked, what_improve, would_continue, quality_score, created_at)
      VALUES (${id}, ${userId}, ${videoId}, ${hookScore || 0}, ${editingScore || 0}, ${audioScore || 0}, ${thumbnailScore || 0}, ${retentionScore || 0}, ${ctaScore || 0}, ${whatWorked || ''}, ${whatImprove || ''}, ${wouldContinue || ''}, ${avgScore}, NOW())
    `;

    const videoRows = await sql`SELECT reviews, avg_score FROM platform_videos WHERE id = ${videoId}`;
    if (videoRows.length > 0) {
      const v = videoRows[0];
      const newCount = (v.reviews || 0) + 1;
      const newAvg = Math.round(((v.avg_score || 0) * (v.reviews || 0) + avgScore) / newCount * 10) / 10;
      await sql`
        UPDATE platform_videos SET reviews = reviews + 1, avg_score = ${newAvg}, priority = 1.0 + (credits_spent * 0.1) - (views * 0.05) + (${newCount} * 0.2)
        WHERE id = ${videoId}
      `;
    }

    const bonusCredits = avgScore >= 7 ? 2 : avgScore >= 4 ? 1 : 0;
    if (bonusCredits > 0) {
      await sql`
        UPDATE platform_users SET credits = credits + ${bonusCredits}, total_earned = total_earned + ${bonusCredits}, feedback_given = feedback_given + 1, updated_at = NOW()
        WHERE id = ${userId}
      `;
      const balance = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
      await sql`
        INSERT INTO platform_transactions (user_id, type, amount, balance_after, description, reference_id)
        VALUES (${userId}, 'earn', ${bonusCredits}, ${balance[0].credits}, ${`Quality feedback bonus`}, ${id})
      `;
    } else {
      await sql`
        UPDATE platform_users SET feedback_given = feedback_given + 1, updated_at = NOW() WHERE id = ${userId}
      `;
    }

    return Response.json({ success: true, feedbackId: id, qualityScore: avgScore, bonusCredits });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const userId = searchParams.get('userId');

    const sql = getSql();
    if (!sql) return Response.json({ feedback: [] });

    if (videoId) {
      const fbk = await sql`SELECT * FROM platform_feedback WHERE video_id = ${videoId} ORDER BY created_at DESC`;
      return Response.json({ feedback: fbk });
    }

    if (userId) {
      const fbk = await sql`SELECT * FROM platform_feedback WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;
      return Response.json({ feedback: fbk });
    }

    return Response.json({ feedback: [] });
  } catch (err) {
    return Response.json({ feedback: [] });
  }
}
