import { getSql } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, videoId, durationSeconds, videoDurationSeconds, completionPct, feedbackQuality, watchEvents } = body;

    if (!userId || !videoId) {
      return Response.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    const settingsRows = await sql`
      SELECT key, value FROM platform_settings
      WHERE key IN ('min_watch_seconds', 'anti_abuse_min_seconds', 'watch_reward_per_minute', 'watch_bonus_completion', 'max_daily_watch_earnings')
    `;
    const settings = {};
    for (const r of settingsRows) settings[r.key] = r.value;
    const minWatch = settings.min_watch_seconds || 5;
    const antiAbuseMin = settings.anti_abuse_min_seconds || 5;
    const rewardPerMin = settings.watch_reward_per_minute || 1;
    const bonusCompletion = settings.watch_bonus_completion || 2;
    const maxDaily = settings.max_daily_watch_earnings || 50;

    if (durationSeconds < antiAbuseMin) {
      return Response.json({ success: false, error: 'Watch duration too short', creditsEarned: 0 });
    }

    const existing = await sql`
      SELECT COUNT(*)::int AS c FROM platform_watch_sessions
      WHERE user_id = ${userId} AND video_id = ${videoId} AND is_completed = true
    `;
    if (existing[0]?.c > 0) {
      return Response.json({ success: false, error: 'Already earned credits for this video', creditsEarned: 0 });
    }

    const dailyTotal = await sql`
      SELECT COALESCE(SUM(credits_earned), 0)::int AS total FROM platform_watch_sessions
      WHERE user_id = ${userId} AND created_at >= CURRENT_DATE
    `;
    if ((dailyTotal[0]?.total || 0) >= maxDaily) {
      return Response.json({ success: false, error: 'Daily earning limit reached', creditsEarned: 0 });
    }

    let skipDetected = false;
    if (watchEvents && Array.isArray(watchEvents) && watchEvents.length > 2) {
      for (let i = 2; i < watchEvents.length; i++) {
        if (watchEvents[i].currentTime - watchEvents[i - 1].currentTime < 0.5 &&
            watchEvents[i].currentTime - watchEvents[i - 2].currentTime > 10) {
          skipDetected = true;
          break;
        }
      }
    }

    const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
    let creditsEarned = Math.min(minutes * rewardPerMin, maxDaily - (dailyTotal[0]?.total || 0));
    if (completionPct >= 90) creditsEarned += bonusCompletion;
    else if (completionPct >= 75) creditsEarned += 1;
    creditsEarned = Math.max(0, Math.round(creditsEarned));
    const remainingDaily = maxDaily - (dailyTotal[0]?.total || 0);
    creditsEarned = Math.min(creditsEarned, remainingDaily);

    await sql`
      INSERT INTO platform_watch_sessions (user_id, video_id, duration_seconds, video_duration_seconds, completion_pct, credits_earned, feedback_quality, is_completed, skip_detected, created_at)
      VALUES (${userId}, ${videoId}, ${durationSeconds}, ${videoDurationSeconds || 0}, ${completionPct || 0}, ${creditsEarned}, ${feedbackQuality || 0}, ${!skipDetected}, ${skipDetected}, NOW())
    `;

    if (creditsEarned > 0 && !skipDetected) {
      await sql`
        UPDATE platform_users SET credits = credits + ${creditsEarned}, total_earned = total_earned + ${creditsEarned}, updated_at = NOW()
        WHERE id = ${userId}
      `;

      const balance = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
      await sql`
        INSERT INTO platform_transactions (user_id, type, amount, balance_after, description, reference_id)
        VALUES (${userId}, 'earn', ${creditsEarned}, ${balance[0].credits}, ${`Watched video (${durationSeconds}s)`}, ${videoId})
      `;

      await sql`
        UPDATE platform_videos SET views = views + 1, completions = completions + ${completionPct >= 90 ? 1 : 0}
        WHERE id = ${videoId}
      `;
    }

    return Response.json({
      success: true,
      creditsEarned: skipDetected ? 0 : creditsEarned,
      skipDetected,
      dailyEarned: (dailyTotal[0]?.total || 0) + (skipDetected ? 0 : creditsEarned)
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
