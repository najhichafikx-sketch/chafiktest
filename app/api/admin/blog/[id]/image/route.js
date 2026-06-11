import { verifyAdmin } from '@/lib/auth';
import { updateBlogPost, getBlogPostById } from '@/lib/db';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog');
const JSON_FILE = path.join(process.cwd(), 'data', 'blog.json');
const TMP_JSON = path.join('/tmp', 'data', 'blog.json');

async function updateJson(id, data) {
  for (const file of [JSON_FILE, TMP_JSON]) {
    try {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let posts;
      if (fs.existsSync(file)) {
        posts = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (!Array.isArray(posts)) posts = posts.posts || [];
      } else {
        posts = [];
      }
      const idx = posts.findIndex(p => Number(p.id) === Number(id) || p.id === id);
      if (idx >= 0) {
        posts[idx] = { ...posts[idx], ...data };
      } else {
        posts.push({ id: Number(id), ...data });
      }
      fs.writeFileSync(file, JSON.stringify(posts, null, 2), 'utf-8');
    } catch {}
  }
}

function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, comma);
  const extMatch = header.match(/image\/(\w+)/);
  const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'jpg';
  const base64 = dataUrl.slice(comma + 1);
  const buf = Buffer.from(base64, 'base64');
  return { buf, ext };
}

export async function POST(request, { params }) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = (await params).id;
    const numId = Number(id);
    const data = await request.json();
    const image = data.image;

    if (typeof image !== 'string') {
      return Response.json({ success: false, message: 'image must be a string' }, { status: 400 });
    }
    if (image.length > 5 * 1024 * 1024) {
      return Response.json({ success: false, message: 'image too large (max 5MB base64)' }, { status: 413 });
    }

    const post = await getBlogPostById(numId);
    if (!post) {
      return Response.json({ success: false, message: `Post ${id} not found` }, { status: 404 });
    }

    const { buf, ext } = dataUrlToBuffer(image);
    const filename = `${numId}_${Date.now()}.${ext}`;
    let finalImage = image;

    // 1) Upload to Vercel Blob (persistent across deploys)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`blog/${filename}`, buf, {
          access: 'public',
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });
        finalImage = blob.url;
      } catch (e) {
        console.warn('Blob upload failed, falling back to file:', e.message);
      }
    }

    // 2) Save as file cache
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, buf);
    } catch {}

    // 3) Store in Supabase
    try {
      await updateBlogPost(numId, { featured_image: finalImage, has_image: true });
    } catch (e) {
      console.warn('Failed to update Supabase blog_post:', e.message);
    }

    // 4) Store in JSON (/tmp + data/)
    await updateJson(numId, { featured_image: finalImage, has_image: true });

    return Response.json({
      success: true,
      message: 'Image saved',
      post_id: numId,
      url: finalImage,
      size: buf.length
    });
  } catch (err) {
    return Response.json({ success: false, message: err.message || 'Failed to save image' }, { status: 500 });
  }
}
