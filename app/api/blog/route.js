import { getBlogPosts } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getBlogPosts('published');
    const cleaned = (posts || []).map(p => {
      const updated = p.updated_at || p.published_at || p.created_at || '';
      const ver = typeof updated === 'string' ? updated.replace(/[^0-9]/g, '').slice(0, 14) : String(Date.now());
      return { ...p, featured_image: '', image_version: ver };
    });
    return Response.json({ success: true, posts: cleaned });
  } catch (err) {
    console.error('Public blog GET error:', err);
    return Response.json({ success: false, posts: [], message: err.message || 'Failed to load posts' }, { status: 500 });
  }
}
