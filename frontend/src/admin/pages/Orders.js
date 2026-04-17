import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { orderAPI } from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    orderAPI.getOrders(params).then((res) => {
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    }).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const f = (p) => `₹${Number(p).toLocaleString('en-IN')}`;
  const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>({total})</span></h1>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="admin-filter-select">
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{total} total orders</span>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/orders/${o.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>#{o.order_number}</Link></td>
                  <td>
                    <div style={{ fontSize: 14 }}>{o.user_name || 'Guest'}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{o.user_email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{o.item_count}</td>
                  <td style={{ fontWeight: 600 }}>{f(o.total)}</td>
                  <td><span className={`status-pill ${o.payment_status === 'paid' ? 'active' : o.payment_status === 'failed' ? 'inactive' : 'pending'}`}>{o.payment_status}</span></td>
                  <td><span className={`status-pill ${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><Link to={`/admin/orders/${o.id}`} className="action-btn"><Eye size={14} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
