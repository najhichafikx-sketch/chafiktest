import { getSql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const history = searchParams.get('history');

    if (!userId) return Response.json({ credits: 0, transactions: [] });

    const sql = getSql();
    if (!sql) return Response.json({ credits: 0, transactions: [] });

    const user = await sql`SELECT credits, total_earned, total_spent FROM platform_users WHERE id = ${userId}`;
    if (user.length === 0) return Response.json({ credits: 0, transactions: [] });

    const result = { credits: user[0].credits, totalEarned: user[0].total_earned, totalSpent: user[0].total_spent };

    if (history) {
      const txns = await sql`
        SELECT id, type, amount, balance_after, description, reference_id, created_at
        FROM platform_transactions WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 100
      `;
      result.transactions = txns;
    }

    return Response.json(result);
  } catch (err) {
    return Response.json({ credits: 0, transactions: [] });
  }
}

export async function POST(request) {
  try {
    const { userId, amount, description, referenceId } = await request.json();
    if (!userId || !amount) return Response.json({ success: false, error: 'Missing fields' }, { status: 400 });

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    const user = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
    if (user.length === 0) return Response.json({ success: false, error: 'User not found' }, { status: 404 });

    const currentCredits = user[0].credits;
    const newBalance = currentCredits + amount;

    if (newBalance < 0) {
      return Response.json({ success: false, error: 'Insufficient credits', credits: currentCredits }, { status: 400 });
    }

    const type = amount > 0 ? 'earn' : 'spend';
    const absAmount = Math.abs(amount);

    await sql`
      UPDATE platform_users SET
        credits = ${newBalance},
        total_earned = total_earned + ${amount > 0 ? absAmount : 0},
        total_spent = total_spent + ${amount < 0 ? absAmount : 0},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO platform_transactions (user_id, type, amount, balance_after, description, reference_id)
      VALUES (${userId}, ${type}, ${amount}, ${newBalance}, ${description || ''}, ${referenceId || ''})
    `;

    return Response.json({ success: true, credits: newBalance });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
