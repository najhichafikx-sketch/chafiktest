-- ============================================================
-- Cleanup: Remove old -en suffixed articles + add clean URL support
-- Run this in Supabase Dashboard SQL Editor (ONE TIME)
-- ============================================================

-- 1. Delete old auto-publisher articles with -en/-ar/-fr suffix
DELETE FROM blog_posts
WHERE slug ~* '\-(en|ar|fr)$'
  AND (source = 'auto-publisher' OR created_at > NOW() - INTERVAL '7 days');

-- 2. Drop old single-column unique constraint on slug (if exists)
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_key;

-- 3. Add composite unique index on (slug, locale)
-- This allows the same slug to exist in 3 languages (en, ar, fr)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug_locale ON blog_posts (slug, locale);
