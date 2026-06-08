import { getBlogPosts } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getBlogPosts('published');
    const cleaned = (posts || []).map(p => {
      const hasBase64 = typeof p.featured_image === 'string' && p.featured_image.startsWith('data:');
      return { ...p, featured_image: hasBase64 ? '' : (p.featured_image || ''), has_image: hasBase64 };
    });
    return Response.json({ success: true, posts: cleaned });
  } catch (err) {
    console.error('Public blog GET error:', err);
    return Response.json({ success: false, posts: [], message: err.message || 'Failed to load posts' }, { status: 500 });
  }
}
