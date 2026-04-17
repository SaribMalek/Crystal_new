import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await userAPI.getUsers({ search }); setUsers(res.users || []); setTotal(res.total || 0); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const toggleStatus = async (id, isActive, name) => {
    try {
      await userAPI.toggleUserStatus(id);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const deleteUser = async (id, isActive, name) => {
    if (isActive) {
      toast.error('Deactivate the customer first before deleting');
      return;
    }
    if (!window.confirm(`Delete "${name}" permanently? This action cannot be undone.`)) return;
    try {
      await userAPI.deleteUser(id);
      toast.success(`${name} deleted successfully`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Customers <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>({total})</span></h1>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Deactivate a customer first, then delete if needed.
        </span>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-search"><Search size={14} /><input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No customers found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 500 }}>{u.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{u.phone || '-'}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><span className={`status-pill ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className={`action-btn ${u.is_active ? 'danger' : ''}`} onClick={() => toggleStatus(u.id, u.is_active, u.name)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button className="action-btn danger" onClick={() => deleteUser(u.id, u.is_active, u.name)} title="Delete user">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
