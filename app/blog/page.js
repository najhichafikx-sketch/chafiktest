'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { SEED_POSTS } from '@/lib/seed-blog';

const BLOG_CATEGORIES = ['All', 'YouTube', 'SEO', 'AI Tools', 'Social Media', 'Marketing', 'E-commerce', 'Business', 'Content', 'Customer Service', 'Image AI', 'Digital Products'];

function fallbackImage(slug) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`;
}

const STATIC_POSTS = SEED_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category || 'General',
  excerpt: p.excerpt || '',
  reading_time: p.reading_time || 2,
  featured_image: p.featured_image || ''
}));

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/blog', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.posts)) {
            const published = data.posts.filter(p => p.status === 'published');
            setDbPosts(published);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const allPosts = useMemo(() => {
    const staticBySlug = {};
    for (const p of STATIC_POSTS) staticBySlug[p.slug] = p;

    const dbBySlug = {};
    for (const p of dbPosts) {
      if (p?.slug) dbBySlug[p.slug] = p;
    }

    const allSlugs = new Set([...Object.keys(staticBySlug), ...Object.keys(dbBySlug)]);
    const merged = [];

    for (const slug of allSlugs) {
      const db = dbBySlug[slug];
      const st = staticBySlug[slug];
      if (db) {
        const rVer = db.updated_at || db.published_at || db.created_at || '';
        const rImgVer = rVer ? '?v=' + (typeof rVer === 'string' ? rVer.replace(/[^0-9]/g, '').slice(0, 14) : '0') : '';
        merged.push({
          slug: db.slug,
          title: db.title,
          category: db.category || st?.category || 'General',
          excerpt: db.excerpt || db.meta_description || st?.excerpt || '',
          reading_time: db.reading_time || st?.reading_time || 2,
          featured_image: db.featured_image || st?.featured_image || '',
          has_image: db.has_image || false,
          image_version: db.image_version || '',
          imgVer: rImgVer,
          _order: 1
        });
      } else {
        merged.push({ ...st, _order: 0 });
      }
    }

    return merged.sort((a, b) => {
      if (a._order !== b._order) return b._order - a._order;
      return a.title.localeCompare(b.title);
    });
  }, [dbPosts]);

  const filtered = allPosts.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Blog</h1>
          <p className="section-subtitle">Expert guides, tutorials, and strategies for AI-powered content creation.</p>
        </div>

        <div className="blog-search">
          <span className="blog-search-icon">🔍</span>
          <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="blog-categories">
          {BLOG_CATEGORIES.map(cat => (
            <span key={cat} className={`blog-category ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16 }}>
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="blog-grid">
            {filtered.map(post => {
              const img = `/api/blog/${post.slug}/image.png${post.imgVer || ''}`;
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={post.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={e => { e.currentTarget.src = fallbackImage(post.slug); }}
                    />
                    <span className="blog-card-tag" style={{ position: 'absolute', top: 12, left: 12 }}>{post.category}</span>
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span>{post.reading_time} min read</span>
                    </div>
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div style={{ marginTop: 12 }}>
                      <span className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                        Read More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <p>No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
