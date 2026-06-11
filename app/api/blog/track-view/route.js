import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    if (!SB_URL || !SB_KEY) return NextResponse.json({ error: 'not configured' }, { status: 503 });

    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
    await sb.from('blog_views').insert({ slug, date: new Date().toISOString().split('T')[0] });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Track view error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
