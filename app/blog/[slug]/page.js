import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdManager from '@/components/AdManager';
import { TOOL_NAMES, TOOL_ARTICLES, RELATED_TOOLS } from '@/lib/tool-content';
import { YOUTUBE_BLOG_POSTS } from '@/lib/blog-content';

const EXISTING_POSTS = [
  { slug: 'ai-seo-article-generator', title: 'How to Generate SEO Articles with AI – Complete Guide 2026', category: 'SEO', excerpt: 'Learn how to generate SEO-optimized articles with AI.', reading_time: 8 },
  { slug: 'image-to-prompt-ai', title: 'Image to Prompt AI – How to Generate Perfect Prompts', category: 'AI Tools', excerpt: 'Transform images into detailed AI prompts.', reading_time: 7 },
  { slug: 'video-to-prompt-ai', title: 'Video to Prompt AI Explained – Turn Videos Into Prompts', category: 'AI Tools', excerpt: 'Convert videos into detailed AI generation prompts.', reading_time: 8 },
  { slug: 'tiktok-ai-tools', title: 'Best AI Tools for TikTok Content Creation in 2026', category: 'Social Media', excerpt: 'Discover the best AI tools for TikTok growth.', reading_time: 9 },
  { slug: 'youtube-ai-suite', title: 'YouTube SEO with AI Suite – Rank Higher in 2026', category: 'YouTube', excerpt: 'Complete YouTube SEO optimization with AI tools.', reading_time: 10 },
  { slug: 'ai-humanizer-guide', title: 'AI Humanizer – Make AI Text Undetectable in 2026', category: 'AI Tools', excerpt: 'Humanize AI-generated text to bypass detectors.', reading_time: 7 },
  { slug: 'ai-ad-copy-generator', title: 'How to Write Viral Ad Copy Using AI – Step by Step', category: 'Marketing', excerpt: 'Create high-converting ad copy with AI.', reading_time: 8 },
  { slug: 'amazon-ai-listing', title: 'Amazon Listing Optimization with AI – Boost Sales', category: 'E-commerce', excerpt: 'Optimize Amazon listings with AI for more sales.', reading_time: 8 },
  { slug: 'ai-product-descriptions', title: 'AI Product Description Generator – Complete Guide', category: 'E-commerce', excerpt: 'Generate compelling product descriptions with AI.', reading_time: 7 },
  { slug: 'etsy-ai-listing', title: 'Etsy SEO with AI Listing Generator – Sell More', category: 'E-commerce', excerpt: 'Optimize Etsy listings with AI for better rankings.', reading_time: 8 },
  { slug: 'ai-landing-page-generator', title: 'Landing Page Copy with AI – Conversion Focused', category: 'Marketing', excerpt: 'Create high-converting landing pages with AI.', reading_time: 7 },
  { slug: 'ai-sales-copy', title: 'AI Sales Copy That Converts – Proven Templates', category: 'Marketing', excerpt: 'Write persuasive sales copy using AI.', reading_time: 8 },
  { slug: 'shopify-ai-seo', title: 'Shopify SEO with AI Tools – Rank Your Store', category: 'E-commerce', excerpt: 'Optimize your Shopify store for Google with AI.', reading_time: 8 },
  { slug: 'ai-product-titles', title: 'AI Product Title Generator – Click Worthy Titles', category: 'E-commerce', excerpt: 'Generate SEO-optimized product titles with AI.', reading_time: 7 },
  { slug: 'ai-review-responses', title: 'Automate Review Responses with AI – Save Time', category: 'Customer Service', excerpt: 'Generate professional review replies with AI.', reading_time: 6 },
  { slug: 'ai-pricing-optimization', title: 'AI Pricing Optimization Strategy – Maximize Profit', category: 'Business', excerpt: 'Optimize your pricing strategy with AI insights.', reading_time: 8 },
  { slug: 'ai-product-ideas', title: 'Find Profitable Product Ideas with AI – 2026 Guide', category: 'E-commerce', excerpt: 'Discover winning product ideas using AI research.', reading_time: 9 },
  { slug: 'ai-product-images', title: 'Enhance Product Images with AI – Ecommerce Guide', category: 'E-commerce', excerpt: 'Improve product images with AI enhancement tools.', reading_time: 7 },
  { slug: 'ai-digital-products', title: 'Create Digital Products with AI – Complete Guide', category: 'Business', excerpt: 'Build and sell digital products using AI.', reading_time: 9 },
  { slug: 'ai-product-names', title: 'AI Digital Product Name Generator – Creative Names', category: 'Business', excerpt: 'Generate catchy names for digital products.', reading_time: 6 },
  { slug: 'ai-email-marketing', title: 'AI Email Marketing Copy Guide – Higher Open Rates', category: 'Marketing', excerpt: 'Write high-converting email copy with AI.', reading_time: 8 },
  { slug: 'ai-dropshipping-research', title: 'AI Dropshipping Product Research – Find Winners', category: 'E-commerce', excerpt: 'Research winning dropshipping products with AI.', reading_time: 9 },
  { slug: 'ai-writing-prompts', title: 'Best AI Writing Prompts for Content Creation', category: 'Content', excerpt: 'Create better content with powerful AI prompts.', reading_time: 7 },
  { slug: 'viral-content-prompts', title: 'Viral Content Prompts with AI – Go Viral on Social', category: 'Social Media', excerpt: 'Generate viral-worthy content prompts with AI.', reading_time: 8 }
];

const ALL_POSTS = [...EXISTING_POSTS, ...YOUTUBE_BLOG_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}))];

const BLOG_CONTENT_MAP = {};
for (const post of EXISTING_POSTS) BLOG_CONTENT_MAP[post.slug] = 'LOAD_FROM_DB';
for (const post of YOUTUBE_BLOG_POSTS) BLOG_CONTENT_MAP[post.slug] = post.content;

const BLOG_CATEGORIES = ['All', 'YouTube', 'SEO', 'AI Tools', 'Social Media', 'Marketing', 'E-commerce', 'Business', 'Content', 'Customer Service'];

const TOOL_SLUG_TO_ID = {};
for (const [id, data] of Object.entries(TOOL_ARTICLES)) {
  TOOL_SLUG_TO_ID[data.slug] = id;
}

export function generateStaticParams() {
  return ALL_POSTS.map(post => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = ALL_POSTS.find(p => p.slug === params.slug);
  if (!post) return { title: 'Article Not Found | Chafiktech Ai' };
  return {
    title: `${post.title} | Chafiktech Ai`,
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
  const post = ALL_POSTS.find(p => p.slug === params.slug);
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

          {content && content !== 'LOAD_FROM_DB' ? (
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
