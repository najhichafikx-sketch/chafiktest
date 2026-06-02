import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdManager from '@/components/AdManager';
import { TOOL_NAMES, TOOL_ARTICLES } from '@/lib/tool-content';
import { YOUTUBE_BLOG_POSTS } from '@/lib/blog-content';
import { SEED_POSTS } from '@/lib/seed-blog';

const EXISTING_POSTS = SEED_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}));

const ALL_POSTS = [...EXISTING_POSTS, ...YOUTUBE_BLOG_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}))];

const BLOG_CONTENT_MAP = {};
for (const post of SEED_POSTS) BLOG_CONTENT_MAP[post.slug] = post.content;
for (const post of YOUTUBE_BLOG_POSTS) BLOG_CONTENT_MAP[post.slug] = post.content;

const TOOL_SLUG_TO_ID = {};
for (const [id, data] of Object.entries(TOOL_ARTICLES)) {
  TOOL_SLUG_TO_ID[data.slug] = id;
}

export function generateStaticParams() {
  return ALL_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = ALL_POSTS.find(p => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: '2026-01-01',
      authors: ['Chafiktech Ai']
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt
    },
    robots: { index: true, follow: true }
  };
}

export default async function BlogArticle({ params }) {
  const { slug } = await params;
  const post = ALL_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const toolId = TOOL_SLUG_TO_ID[post.slug];
  const toolName = toolId ? (TOOL_NAMES[toolId]?.name || null) : null;
  const content = BLOG_CONTENT_MAP[post.slug];
  const relatedPosts = ALL_POSTS.filter(p => p.slug !== post.slug).sort(() => 0.5 - Math.random()).slice(0, 4);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'Chafiktech Ai' },
    publisher: { '@type': 'Organization', name: 'Chafiktech Ai' },
    datePublished: '2026-01-01',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://chafiktest.vercel.app/blog/${post.slug}` }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <section className="section tool-page" style={{ paddingTop: 120 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <Link href="/blog" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem', marginBottom: 16, display: 'inline-block' }}>&larr; Back to Blog</Link>

          <div className="tool-page-header" style={{ textAlign: 'left' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: 999, fontSize: '0.8rem', color: 'var(--neon-cyan)', marginBottom: 12 }}>{post.category}</span>
            <h1 className="tool-page-title" style={{ fontSize: '2rem' }}>{post.title}</h1>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
              <span>Chafiktech Ai</span>
              <span>·</span>
              <span>{post.reading_time} min read</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 16 }}>{post.excerpt}</p>
          </div>

          <AdManager location="content_top" />

          {content ? (
            <div className="blog-article-content" style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <BlogContentFromDB slug={post.slug} />
          )}

          {toolName && (
            <div className="glass-card" style={{ marginTop: 32, padding: 24, textAlign: 'center' }}>
              <h3 style={{ marginBottom: 12 }}>Try Our {toolName}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
                Put these strategies into action. Use our AI-powered tool to generate results instantly.
              </p>
              <a href={`/tools/${toolId.replace('-', '-')}`} className="btn btn-primary">
                Open {toolName} →
              </a>
            </div>
          )}

          <AdManager location="content_bottom" />

          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="glass-card" style={{ padding: 16, textDecoration: 'none' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)' }}>{rp.category}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 8 }}>{rp.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 8 }}>{rp.reading_time} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function BlogContentFromDB({ slug }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://chafiktest.vercel.app'}/api/blog/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.post?.content) {
      return <div className="blog-article-content" style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: data.post.content }} />;
    }
  } catch {}
  return (
    <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Content loading from database...</p>
    </div>
  );
}
