import { query } from '../lib/db.js';
import { TOOL_BLOG_ARTICLES } from '../lib/tool-blog-articles.js';

async function main() {
  console.log('=== Blog DB Sync ===');
  console.log(`Target: ${TOOL_BLOG_ARTICLES.length} articles`);

  // 1. Delete all existing blog posts
  console.log('\n[1/4] Deleting old posts...');
  try {
    await query('DELETE FROM blog_posts');
    console.log('  ✓ All old posts deleted');
  } catch (e) {
    console.error('  ✗ Delete failed:', e.message);
    process.exit(1);
  }

  // 2. Ensure columns exist
  console.log('[2/4] Ensuring columns...');
  const columns = ['seo_title', 'keywords', 'external_link', 'external_link_label'];
  for (const col of columns) {
    try {
      await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ${col} TEXT DEFAULT ''`);
    } catch {}
  }
  console.log('  ✓ Columns OK');

  // 3. Insert new articles
  console.log(`[3/4] Inserting ${TOOL_BLOG_ARTICLES.length} new articles...`);
  let inserted = 0;
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
        [
          a.slug, a.title, a.excerpt, a.content, a.category, a.tags,
          'Chafiktech Ai', '', a.excerpt, a.title, a.keywords,
          2, 'published', `/tools/${a.tool}`,
          `Try ${a.toolName}`, now, now, now
        ]
      );
      inserted++;
    } catch (e) {
      console.error(`  ✗ Failed [${a.slug}]: ${e.message}`);
    }
  }
  console.log(`  ✓ ${inserted}/${TOOL_BLOG_ARTICLES.length} inserted`);

  // 4. Reset sequence
  console.log('[4/4] Resetting sequence...');
  try {
    await query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM blog_posts))`);
    console.log('  ✓ Sequence OK');
  } catch {}

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
