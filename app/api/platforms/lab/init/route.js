import { getSql } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, error: 'userId required' });

    const sql = getSql();
    if (!sql) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true });

    const existing = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (existing.length > 0) {
      const u = existing[0];
      return Response.json({ lab_points: u.lab_points, lab_sessions: u.lab_sessions, lab_earned: u.lab_earned, lab_spent: u.lab_spent });
    }

    return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 });
  } catch (e) {
    return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true, error: e.message });
  }
}
