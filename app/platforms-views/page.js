import Link from 'next/link';
import { PLATFORM_TOOLS } from '@/lib/platforms-views-content';

export const metadata = {
  title: 'Platforms Views - Credit-Powered Creator Growth & Feedback Platform',
  description: 'Community-driven feedback platform with credit-based economy. Exchange views, get structured reviews, and test your content before publishing. Earn credits by watching, spend to promote.',
  openGraph: {
    title: 'Platforms Views - Chafiktech Ai',
    description: 'Self-sustaining credit economy for creators. Watch videos to earn credits, submit your content for exposure and feedback.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platforms Views - Chafiktech Ai',
    description: 'Self-sustaining credit economy for creators. Watch videos to earn credits, submit your content for exposure and feedback.'
  }
};

export default function PlatformsViewsPage() {
  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🌐 Platforms Views</span>
          <h1 className="section-title">Creator Growth Suite</h1>
          <p className="section-subtitle">Professional growth tools for YouTube and TikTok creators. Exchange views, get feedback, and test your content before publishing.</p>
        </div>

        <div className="tools-grid" style={{ marginTop: 32 }}>
          {Object.entries(PLATFORM_TOOLS).map(([id, tool]) => (
            <Link key={id} href={`/platforms-views/${id}`} className="tool-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div className="tool-icon" style={{ fontSize: '2.2rem', marginBottom: 12 }}>{tool.icon}</div>
                <h3 className="tool-name" style={{ fontSize: '1rem', marginBottom: 8 }}>{tool.name}</h3>
                <p className="tool-description" style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>{tool.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {tool.features.slice(0, 3).map(f => (
                    <span key={f} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', color: 'var(--neon-cyan)' }}>{f}</span>
                  ))}
                </div>
              </div>
              <span className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '8px 16px', fontSize: '0.85rem' }}>
                Open {tool.name} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
