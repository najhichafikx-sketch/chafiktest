import { getSql } from '@/lib/db';

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 });

  const sql = getSql();
  if (!sql) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true });

  try {
    const existing = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (existing.length === 0) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 });
    const u = existing[0];
    return Response.json({ lab_points: u.lab_points, lab_sessions: u.lab_sessions, lab_earned: u.lab_earned, lab_spent: u.lab_spent });
  } catch {
    return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true });
  }
}
