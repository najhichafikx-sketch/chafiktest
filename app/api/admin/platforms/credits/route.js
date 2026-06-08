import { getSql } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { userId, action, amount, description } = body;

    if (!userId || !action) {
      return Response.json({ success: false, error: 'Missing userId or action' }, { status: 400 });
    }

    const sql = getSql();
    if (!sql) return Response.json({ success: false, error: 'Database unavailable' }, { status: 500 });

    if (action === 'reset') {
      await sql`UPDATE platform_users SET credits = 0, total_earned = 0, total_spent = 0, updated_at = NOW() WHERE id = ${userId}`;
      const balance = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
      await sql`
        INSERT INTO platform_transactions (user_id, type, amount, balance_after, description)
        VALUES (${userId}, 'admin', 0, ${balance[0].credits}, 'Credits reset by admin')
      `;
      return Response.json({ success: true, message: 'Credits reset', credits: balance[0].credits });
    }

    if (action === 'grant' || action === 'deduct') {
      const absAmount = Math.abs(amount || 0);
      if (absAmount === 0) return Response.json({ success: false, error: 'Amount required' }, { status: 400 });

      const finalAmount = action === 'grant' ? absAmount : -absAmount;
      const user = await sql`SELECT credits FROM platform_users WHERE id = ${userId}`;
      if (user.length === 0) return Response.json({ success: false, error: 'User not found' }, { status: 404 });

      const newBalance = user[0].credits + finalAmount;
      if (newBalance < 0) return Response.json({ success: false, error: 'Would go negative' }, { status: 400 });

      await sql`UPDATE platform_users SET credits = ${newBalance}, updated_at = NOW() WHERE id = ${userId}`;
      await sql`
        INSERT INTO platform_transactions (user_id, type, amount, balance_after, description)
        VALUES (${userId}, 'admin', ${finalAmount}, ${newBalance}, ${description || `Admin ${action}: ${absAmount} credits`})
      `;

      return Response.json({ success: true, message: `${action === 'grant' ? 'Granted' : 'Deducted'} ${absAmount} credits`, credits: newBalance });
    }

    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
