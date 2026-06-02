'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPlatformsViewsPage() {
  const [token, setToken] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    setToken(t);
  }, []);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {['campaigns', 'reviews', 'sessions'].map(t => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Viral Exchange Campaigns</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Campaign moderation is available. In production, this section would display all Viral Exchange campaigns with options to approve, flag, or remove them. Reports would include credit usage, view counts, and user activity.
          </p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Feedback Exchange Reviews</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Review moderation panel. In production, this section would display all submitted reviews with abuse report flags, review quality scores, and options to approve or remove reviews.
          </p>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Audience Test Lab Sessions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Session monitoring dashboard. In production, this section would display all test sessions with user activity logs, device/browser distribution, and geographic data.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
