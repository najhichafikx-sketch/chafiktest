'use client';

import { useState } from 'react';
import Link from 'next/link';
import { YOUTUBE_BLOG_POSTS } from '@/lib/blog-content';

const BLOG_CATEGORIES = ['All', 'YouTube', 'SEO', 'AI Tools', 'Social Media', 'Marketing', 'E-commerce', 'Business', 'Content', 'Customer Service'];

const EXISTING_POSTS = [
  { slug: 'ai-seo-article-generator', title: 'How to Generate SEO Articles with AI – Complete Guide 2026', category: 'SEO', excerpt: 'Learn how to generate SEO-optimized articles with AI.', reading_time: 8 },
  { slug: 'image-to-prompt-ai', title: 'Image to Prompt AI – How to Generate Perfect Prompts', category: 'AI Tools', excerpt: 'Transform images into detailed AI prompts.', reading_time: 7 },
  { slug: 'video-to-prompt-ai', title: 'Video to Prompt AI Explained – Turn Videos Into Prompts', category: 'AI Tools', excerpt: 'Convert videos into detailed AI generation prompts.', reading_time: 8 },
  { slug: 'tiktok-ai-tools', title: 'Best AI Tools for TikTok Content Creation in 2026', category: 'Social Media', excerpt: 'Discover the best AI tools for TikTok growth.', reading_time: 9 },
  { slug: 'youtube-ai-suite', title: 'YouTube SEO with AI Suite – Rank Higher in 2026', category: 'YouTube', excerpt: 'Complete YouTube SEO optimization with AI tools.', reading_time: 10 },
  { slug: 'viral-exchange', title: 'Viral Exchange Tool – Grow Your YouTube and TikTok Audience', category: 'Social Media', excerpt: 'Earn credits and grow your audience through community video exchange.', reading_time: 9 },
  { slug: 'feedback-exchange', title: 'Feedback Exchange Tool – Improve Your Content with Real Feedback', category: 'Social Media', excerpt: 'Get real creator feedback with structured scores across five dimensions.', reading_time: 8 },
  { slug: 'audience-test-lab', title: 'Audience Test Lab – Predict Your Video Performance Before Publishing', category: 'Social Media', excerpt: 'Test your videos before publishing with simulated audience sessions.', reading_time: 10 },
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
}))].sort((a, b) => b.reading_time - a.reading_time);

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ALL_POSTS.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
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
            {filtered.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-image" style={{ background: `linear-gradient(135deg, var(--neon-${['purple','blue','cyan','pink'][Math.floor(Math.random()*4)]}), rgba(99,102,241,0.5))` }}>
                  <span className="blog-card-tag">{post.category}</span>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{post.reading_time} min read</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                </div>
              </Link>
            ))}
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
