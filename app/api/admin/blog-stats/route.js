import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!SB_URL || !SB_KEY) return NextResponse.json({ error: 'not configured' }, { status: 503 });

    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

    const { data: dailyViews } = await sb
      .from('blog_views')
      .select('date, slug')
      .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const today = new Date().toISOString().split('T')[0];

    const dailyMap = {};
    const slugCount = {};
    let todayTotal = 0;

    for (const v of dailyViews || []) {
      dailyMap[v.date] = (dailyMap[v.date] || 0) + 1;
      slugCount[v.slug] = (slugCount[v.slug] || 0) + 1;
      if (v.date === today) todayTotal++;
    }

    const sortedDays = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const topArticles = Object.entries(slugCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([slug, views]) => ({ slug, views }));

    const { count: allTime } = await sb
      .from('blog_views')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      today: todayTotal,
      allTime: allTime || 0,
      dailyViews: sortedDays,
      topArticles
    });
  } catch (err) {
    console.error('Blog stats error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
