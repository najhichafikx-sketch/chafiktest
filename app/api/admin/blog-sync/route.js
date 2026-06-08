import { query } from '@/lib/db';
import { TOOL_BLOG_ARTICLES } from '@/lib/tool-blog-articles';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_PASSWORD) {
    return new Response(
      `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>غير مصرح</title><style>body{background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:1rem}code{background:#1a1a2e;padding:0.5rem 1rem;border-radius:8px;color:#ffd700}</style></head><body>
        <h1>🔒 غير مصرح</h1>
        <p>الرجاء إضافة ?secret=ADMIN_PASSWORD إلى الرابط</p>
        <code>${request.url}?secret=YOUR_PASSWORD</code>
      </body></html>`,
      { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  let result;
  try {
    // 1. Delete all existing blog posts
    await query('DELETE FROM blog_posts');

    // 2. Ensure columns
    for (const col of ['seo_title', 'keywords', 'external_link', 'external_link_label']) {
      try { await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ${col} TEXT DEFAULT ''`); } catch {}
    }

    // 3. Insert 42 articles
    let inserted = 0, errors = [];
    for (let i = 0; i < TOOL_BLOG_ARTICLES.length; i++) {
      const a = TOOL_BLOG_ARTICLES[i];
      const now = new Date(Date.now() - i * 60000).toISOString();
      try {
        await query(
          `INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, external_link, external_link_label, published_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (slug) DO UPDATE SET
             title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content,
             category=EXCLUDED.category, tags=EXCLUDED.tags, author=EXCLUDED.author,
             meta_description=EXCLUDED.meta_description, seo_title=EXCLUDED.seo_title,
             keywords=EXCLUDED.keywords, reading_time=EXCLUDED.reading_time,
             external_link=EXCLUDED.external_link, external_link_label=EXCLUDED.external_link_label,
             published_at=EXCLUDED.published_at, updated_at=NOW()`,
          [a.slug, a.title, a.excerpt, a.content, a.category, a.tags,
           'Chafiktech Ai', '', a.excerpt, a.title, a.keywords,
           2, 'published', `/tools/${a.tool}`, `Try ${a.toolName}`, now, now, now]
        );
        inserted++;
      } catch (e) {
        errors.push(`${a.slug}: ${e.message}`);
      }
    }

    // 4. Reset sequence
    try { await query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM blog_posts))`); } catch {}

    result = `✅ تم بنجاح!\n\n• تم مسح جميع المقالات القديمة\n• تم إدراج ${inserted}/${TOOL_BLOG_ARTICLES.length} مقال جديد\n${errors.length ? `\nأخطاء: ${errors.length}\n${errors.slice(0,5).join('\n')}` : ''}`;
  } catch (err) {
    result = `❌ خطأ: ${err.message}`;
  }

  return new Response(
    `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>مزامنة المدونة</title><style>
      body{background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:1rem;text-align:center;padding:2rem;direction:rtl}
      pre{background:#13131a;color:#0f0;padding:1.5rem;border-radius:12px;border:1px solid #333;max-width:600px;white-space:pre-wrap;text-align:left;direction:ltr}
      .btn{background:#ffd700;color:#000;padding:1rem 2rem;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:1rem;display:inline-block}
    </style></head><body>
      <pre>${result}</pre>
      <a class="btn" href="https://www.chafiktech.com/blog">← الذهاب إلى المدونة</a>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
