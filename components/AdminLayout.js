'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    fetch('/api/admin/status', { headers: { 'Authorization': `Bearer ${t}` } })
      .then(r => { if (r.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); } else setAuthed(true); })
      .catch(() => setAuthed(true));
  }, [router]);

  if (!authed) return <div className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh' }}>
      <aside style={{
        background: 'var(--bg-glass)',
        borderRight: '1px solid var(--bg-glass-border)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingLeft: 8 }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <SidebarLink href="/admin">Dashboard</SidebarLink>
          <SidebarLink href="/admin/tools">Tools</SidebarLink>
          <SidebarLink href="/admin/ads">Ads</SidebarLink>
          <SidebarLink href="/admin/revenue-dashboard">Revenue</SidebarLink>
          <SidebarLink href="/admin/analytics">Analytics</SidebarLink>
          <SidebarLink href="/admin/settings">Settings</SidebarLink>
          <SidebarLink href="/admin/api-settings">API Keys</SidebarLink>
          <SidebarLink href="/admin/platforms-views">Platforms</SidebarLink>
          <SidebarLink href="/admin/ad-diagnostics">Ad Diag</SidebarLink>
          <hr style={{ borderColor: 'var(--bg-glass-border)', margin: '12px 0' }} />
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '4px 8px', marginBottom: 4 }}>Content</div>
          <SidebarLink href="/admin/blog">Blog Articles</SidebarLink>
          <SidebarLink href="/admin/prompts">Prompt Articles</SidebarLink>
          <hr style={{ borderColor: 'var(--bg-glass-border)', margin: '12px 0' }} />
          <SidebarLink href="/admin/users">Users</SidebarLink>
        </nav>
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--bg-glass-border)' }}>
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin-login'); }}>Logout</button>
        </div>
      </aside>
      <main style={{ padding: '32px', maxWidth: 1100 }}>
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, children }) {
  return (
    <Link
      href={href}
      className="btn btn-secondary btn-sm"
      style={{
        justifyContent: 'flex-start',
        textAlign: 'left',
        padding: '8px 12px',
        fontSize: 14
      }}
    >
      {children}
    </Link>
  );
}
