import { getBlogPostBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);
    if (!post || !post.featured_image) {
      return new Response(null, { status: 404 });
    }
    const img = post.featured_image;
    if (typeof img !== 'string' || !img.startsWith('data:')) {
      return new Response(null, { status: 404 });
    }
    const comma = img.indexOf(',');
    const mime = img.slice(5, comma).split(';')[0] || 'image/jpeg';
    const base64 = img.slice(comma + 1);
    const buf = Buffer.from(base64, 'base64');
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buf.length)
      }
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
