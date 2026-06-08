import { getSql } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ success: false, error: 'Missing userId' }, { status: 400 });

    const sql = getSql();
    if (!sql) {
      return Response.json({ success: true, credits: 10, alreadyExists: false, notice: 'offline-mode' });
    }

    const existing = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
    if (existing.length > 0) {
      return Response.json({ success: true, credits: existing[0].credits, alreadyExists: true });
    }

    await sql`
      INSERT INTO platform_users (id, credits, total_earned, created_at, updated_at)
      VALUES (${userId}, 10, 10, NOW(), NOW())
    `;

    await sql`
      INSERT INTO platform_transactions (user_id, type, amount, balance_after, description)
      VALUES (${userId}, 'registration_bonus', 10, 10, 'Welcome! You received 10 free credits.')
    `;

    return Response.json({ success: true, credits: 10, alreadyExists: false, isNew: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
