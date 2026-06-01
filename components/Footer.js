import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <div className="nav-logo-icon">⚡</div>
              Chafiktech Ai
            </Link>
            <p>Empowering creators with next-generation AI tools for content creation, optimization, and growth.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="GitHub">⌨</a>
              <a href="#" aria-label="Discord">💬</a>
            </div>
          </div>
          <div className="footer-column">
            <h4>Products</h4>
            <Link href="/tools/seo-article-generator">SEO Article Generator</Link>
            <Link href="/tools/image-to-prompt">Image to Prompt Generator</Link>
            <Link href="/tools/video-to-prompt">Video to Prompt</Link>
            <Link href="/tools/youtube-suite">AI Youtube Creator Suite</Link>
            <Link href="/tools/ai-humanizer">AI Humanizer</Link>
            <Link href="/tools/tiktok-tools">TikTok Tools</Link>
            <Link href="/tools/prompt-viral">Prompt Viral</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="footer-column">
            <h4>Legal & Support</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Chafiktech Ai. All rights reserved.</p>
          <p style={{ marginTop: 5, fontSize: '0.8em', color: 'var(--text-tertiary)' }}>
            Contact: tools@chafiktech.com | Website: www.chafiktech.com
          </p>
        </div>
      </div>
      <QuickToolsSidebar />
    </footer>
  );
}

function QuickToolsSidebar() {
  return (
    <div className="global-floating-sidebar">
      <div className="gfs-toggle">
        <span>🧰</span>
        <span className="gfs-text">Quick Tools</span>
      </div>
      <Link href="/tools/seo-article-generator" className="gfs-link">
        <span>📝</span><span className="gfs-text">SEO Generator</span>
      </Link>
      <Link href="/tools/image-to-prompt" className="gfs-link">
        <span>📸</span><span className="gfs-text">Img to Prompt</span>
      </Link>
      <Link href="/tools/video-to-prompt" className="gfs-link">
        <span>🎥</span><span className="gfs-text">Video to Prompt</span>
      </Link>
      <Link href="/tools/tiktok-tools" className="gfs-link">
        <span>🎵</span><span className="gfs-text">TikTok Suite</span>
      </Link>
      <Link href="/tools/prompt-viral" className="gfs-link">
        <span>🚀</span><span className="gfs-text">Prompt Viral</span>
      </Link>
      <Link href="/ecommerce" className="gfs-link">
        <span>🛒</span><span className="gfs-text">Digital Product</span>
      </Link>
      <Link href="/tools/youtube-suite" className="gfs-link">
        <span>🎬</span><span className="gfs-text">YouTube Suite</span>
      </Link>
      <Link href="/tools/ai-humanizer" className="gfs-link">
        <span>🧠</span><span className="gfs-text">AI Humanizer</span>
      </Link>
    </div>
  );
}
