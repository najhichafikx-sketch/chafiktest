import { getSql } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId, action, amount } = await request.json();
    if (!userId || !action) return Response.json({ error: 'userId and action required' });

    const sql = getSql();
    if (!sql) return Response.json({ error: 'DB offline', offline: true });

    const existing = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (existing.length === 0) return Response.json({ error: 'User not found' });
    const u = existing[0];

    if (action === 'earn') {
      const pts = Math.max(1, Math.floor(amount || 1));
      await sql`UPDATE platform_users SET lab_points = lab_points + ${pts}, lab_earned = lab_earned + ${pts} WHERE id = ${userId}`;
      return Response.json({ lab_points: u.lab_points + pts, lab_sessions: u.lab_sessions, lab_earned: u.lab_earned + pts });
    }

    if (action === 'purchase') {
      const packages = { 4: 10, 6: 14, 10: 20 };
      const cost = packages[amount];
      if (!cost) return Response.json({ error: 'Invalid package. Choose 4, 6, or 10 screens.' });
      if (u.lab_points < cost) return Response.json({ error: 'Not enough lab points' });
      await sql`UPDATE platform_users SET lab_points = lab_points - ${cost}, lab_sessions = lab_sessions + ${amount}, lab_spent = lab_spent + ${cost} WHERE id = ${userId}`;
      return Response.json({ lab_points: u.lab_points - cost, lab_sessions: u.lab_sessions + amount, lab_spent: u.lab_spent + cost });
    }

    if (action === 'run') {
      if (u.lab_sessions < 1) return Response.json({ error: 'No lab sessions remaining' });
      await sql`UPDATE platform_users SET lab_sessions = lab_sessions - 1, tests_completed = tests_completed + 1 WHERE id = ${userId}`;
      return Response.json({ lab_sessions: u.lab_sessions - 1 });
    }

    return Response.json({ error: 'Unknown action' });
  } catch (e) {
    return Response.json({ error: e.message, offline: true });
  }
}
