import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState({ status: '', payment_status: '', tracking_number: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orderAPI.getOrder(id).then((res) => {
      setOrder(res.order);
      setUpdate({ status: res.order.status, payment_status: res.order.payment_status, tracking_number: res.order.tracking_number || '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await orderAPI.updateOrderStatus(id, update);
      toast.success('Order updated!');
      setOrder((o) => ({ ...o, ...update }));
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Loading...</div>;
  if (!order) return <div style={{ padding: 40, color: '#f87171' }}>Order not found</div>;

  const f = (p) => `Rs. ${Number(p || 0).toLocaleString('en-IN')}`;
  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-inline-heading">
          <button className="admin-back-btn" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1>Order #{order.order_number}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Update Order'}</button>
      </div>

      <div className="admin-detail-layout">
        <div className="admin-detail-main">
          <div className="admin-form-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Order Items</h3>
            {order.items?.map((item) => (
              <div key={item.id} className="admin-list-item" style={{ paddingLeft: 0, paddingRight: 0 }}>
                {item.product_image && (
                  <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500 }}>{item.product_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.quantity} x {f(item.price)}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{f(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="admin-form-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Customer & Shipping</h3>
            <div className="admin-grid-equal" style={{ marginBottom: 0 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Customer</p>
                <p style={{ fontWeight: 600 }}>{order.user_name || 'Guest'}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{order.user_email}</p>
              </div>
              {addr && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Shipping Address</p>
                  <p style={{ fontWeight: 600 }}>{addr.full_name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{addr.address_line1}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{addr.city}, {addr.state} {addr.postal_code}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Phone: {addr.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-detail-side">
          <div className="admin-form-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Update Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Order Status</label>
                <select value={update.status} onChange={(e) => setUpdate({ ...update, status: e.target.value })}>
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select value={update.payment_status} onChange={(e) => setUpdate({ ...update, payment_status: e.target.value })}>
                  {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tracking Number</label>
                <input value={update.tracking_number} onChange={(e) => setUpdate({ ...update, tracking_number: e.target.value })} placeholder="Enter tracking number" />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Payment Summary</h3>
            {[['Subtotal', f(order.subtotal)], ['Discount', `-${f(order.discount)}`], ['Shipping', order.shipping_cost > 0 ? f(order.shipping_cost) : 'FREE'], ['Tax', f(order.tax)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14, color: 'var(--color-text-muted)' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>{f(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
