import { getSql } from '@/lib/db';

export async function getLabUser(userId) {
  if (!userId) return null;
  const sql = getSql();
  if (!sql) return { error: 'Database not available' };
  try {
    const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (rows.length > 0) return rows[0];
    return null;
  } catch { return { error: 'Database query failed' }; }
}

export async function ensureLabUser(userId) {
  if (!userId) return { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
  const existing = await getLabUser(userId);
  if (existing && !existing.error) return existing;
  const sql = getSql();
  if (!sql) return { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
  try {
    await sql`INSERT INTO platform_users (id, lab_points, lab_sessions, lab_earned, lab_spent) VALUES (${userId}, 0, 0, 0, 0) ON CONFLICT (id) DO NOTHING`;
  } catch {}
  return { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
}

export async function earnPoints(userId, amount) {
  const pts = Math.max(1, Math.floor(amount || 1));
  const sql = getSql();
  if (!sql) return { error: 'Database not available' };
  try {
    await sql`UPDATE platform_users SET lab_points = lab_points + ${pts}, lab_earned = lab_earned + ${pts} WHERE id = ${userId}`;
    const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (rows.length > 0) return rows[0];
    return { error: 'User not found' };
  } catch { return { error: 'Database query failed' }; }
}

export async function purchaseScreens(userId, screens) {
  const packages = { 4: 10, 6: 14, 10: 20 };
  const cost = packages[screens];
  if (!cost) return { error: 'Invalid package. Choose 4, 6, or 10 screens.' };

  const sql = getSql();
  if (!sql) return { error: 'Database not available' };
  try {
    const existing = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (existing.length === 0) return { error: 'User not found' };
    const u = existing[0];
    if (u.lab_points < cost) return { error: 'Not enough lab points' };
    await sql`UPDATE platform_users SET lab_points = lab_points - ${cost}, lab_sessions = lab_sessions + ${screens}, lab_spent = lab_spent + ${cost} WHERE id = ${userId}`;
    const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
    if (rows.length > 0) return rows[0];
    return { error: 'Update failed' };
  } catch (e) { return { error: e.message }; }
}

export async function consumeScreens(userId, count) {
  const sql = getSql();
  if (!sql) return { error: 'Database not available' };
  try {
    const existing = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
    if (existing.length === 0) return { error: 'User not found' };
    if (existing[0].lab_sessions < count) return { error: 'Not enough screens' };
    await sql`UPDATE platform_users SET lab_sessions = lab_sessions - ${count} WHERE id = ${userId}`;
    const rows = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
    if (rows.length > 0) return { lab_sessions: rows[0].lab_sessions };
    return { error: 'Update failed' };
  } catch (e) { return { error: e.message }; }
}

export async function runTest(userId) {
  const sql = getSql();
  if (!sql) return { error: 'Database not available' };
  try {
    const existing = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
    if (existing.length === 0) return { error: 'User not found' };
    if (existing[0].lab_sessions < 1) return { error: 'No lab sessions remaining' };
    await sql`UPDATE platform_users SET lab_sessions = lab_sessions - 1, tests_completed = tests_completed + 1 WHERE id = ${userId}`;
    const rows = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
    if (rows.length > 0) return { lab_sessions: rows[0].lab_sessions };
    return { error: 'Update failed' };
  } catch (e) { return { error: e.message }; }
}
