'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Download, Trash2, Snowflake, Ban } from 'lucide-react';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, newToday: 0, newThisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  const perPage = 20;

  function loadUsers() {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setUsers(d.users || []); setStats(d.stats || {}); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, [router]);

  async function handleAction(userId, action) {
    const token = localStorage.getItem('admin_token');
    const labels = { freeze: 'frozen', suspend: 'suspended', activate: 'active' };
    if (action === 'delete') {
      if (!confirm('Delete this user?')) return;
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      setUsers(users.filter(u => u.id !== userId));
      setMsg('User deleted');
    } else if (action === 'freeze') {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: 'frozen' })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'frozen' } : u));
      setMsg('Membership frozen');
    } else if (action === 'suspend') {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: 'suspended' })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
      setMsg('Membership suspended');
    } else if (action === 'activate') {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: 'active' })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
      setMsg('User activated');
    }
    setTimeout(() => setMsg(''), 3000);
  }

  function exportCsv() {
    const headers = ['ID', 'Email', 'Name', 'Status', 'Generations', 'Last Login', 'Created'];
    const rows = filtered.map(u => [u.id, u.email, u.name, u.status, u.total_generations || 0, u.last_login || '', u.created_at || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q);
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const statusColor = (s) => {
    if (s === 'active') return '#10b981';
    if (s === 'frozen') return '#6366f1';
    if (s === 'suspended') return '#f59e0b';
    return '#9ca3af';
  };

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px', background: '#f0f2f8', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>User Management</h1>
          <button onClick={exportCsv} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 13, background: '#fff', border: '1px solid #d0d4dc', borderRadius: 6, cursor: 'pointer', color: '#555' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {msg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 16px', marginBottom: 16, color: '#16a34a', fontSize: 13 }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Active Users', value: stats.active },
            { label: 'Today', value: stats.newToday },
            { label: 'This Week', value: stats.newThisWeek },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #e0e4e8', padding: '14px 18px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e4e8', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              placeholder="Search by email or name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #d0d4dc', borderRadius: 6, outline: 'none' }}
            />
            <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} users</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e4e8', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e4e8' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Registered</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb', width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 14 }}>No users found.</td></tr>
              ) : paged.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < paged.length - 1 ? '1px solid #e8eaed' : 'none' }}>
                  <td style={{ padding: '16px', color: '#1a1a2e', fontWeight: 600, fontSize: 14 }}>{u.name || '-'}</td>
                  <td style={{ padding: '16px', color: '#666', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '16px', color: '#888', fontSize: 13 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-block', background: statusColor(u.status), color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 12, textTransform: 'capitalize' }}>{u.status || 'active'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {u.status !== 'active' && (
                        <button onClick={() => handleAction(u.id, 'activate')} style={btnStyle.success}>
                          Activate
                        </button>
                      )}
                      {u.status !== 'frozen' && (
                        <button onClick={() => handleAction(u.id, 'freeze')} style={btnStyle.warning}>
                          <Snowflake size={12} style={{ marginRight: 4 }} /> Freeze
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button onClick={() => handleAction(u.id, 'suspend')} style={btnStyle.orange}>
                          <Ban size={12} style={{ marginRight: 4 }} /> Suspend
                        </button>
                      )}
                      <button onClick={() => handleAction(u.id, 'delete')} style={btnStyle.danger}>
                        <Trash2 size={12} style={{ marginRight: 4 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 20 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={pageBtn(page === 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ ...pageBtn(false), ...(page === p ? { background: '#534AB7', color: '#fff', borderColor: '#534AB7' } : {}) }}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={pageBtn(page >= totalPages)}>Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const btnStyle = {
  success: { padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#10b981', textAlign: 'left' },
  warning: { padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#6366f1', textAlign: 'left' },
  orange: { padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#f59e0b', textAlign: 'left' },
  danger: { padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#dc2626', textAlign: 'left' },
};

function pageBtn(disabled) {
  return {
    padding: '6px 12px',
    fontSize: 13,
    border: '1px solid #d0d4dc',
    borderRadius: 4,
    background: '#fff',
    color: disabled ? '#ccc' : '#333',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}