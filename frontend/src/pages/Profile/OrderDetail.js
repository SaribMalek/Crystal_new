import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { orderAPI } from '../../services/api';
import './Profile.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrder(id).then((res) => setOrder(res.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '120px 0', textAlign: 'center' }}>Loading...</div>;
  if (!order) return <div style={{ padding: '120px 0', textAlign: 'center' }}>Order not found</div>;

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
  const f = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <div className="orders-page">
      <div className="container">
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Order #{order.order_number}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`order-status ${order.status}`}>{order.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20 }}><Package size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Order Items</h3>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.product_image && <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.product_name}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Qty: {item.quantity} × {f(item.price)}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{f(item.total)}</span>
                </div>
              ))}
            </div>

            {addr && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 16 }}>Delivery Address</h3>
                <p style={{ fontWeight: 600 }}>{addr.full_name}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{addr.city}, {addr.state} - {addr.postal_code}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Phone: {addr.phone}</p>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20 }}>Order Summary</h3>
            {[
              ['Subtotal', f(order.subtotal)],
              ['Discount', order.discount > 0 ? `-${f(order.discount)}` : f(0)],
              ['Shipping', order.shipping_cost > 0 ? f(order.shipping_cost) : 'FREE'],
              ['Tax', f(order.tax)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14, color: 'var(--color-text-muted)' }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>{f(order.total)}</span>
            </div>
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Payment: <strong style={{ color: 'var(--color-text)' }}>{order.payment_method?.toUpperCase()}</strong><br />
              Status: <strong style={{ color: 'var(--color-primary)', textTransform: 'capitalize' }}>{order.payment_status}</strong>
              {order.tracking_number && <><br />Tracking: <strong>{order.tracking_number}</strong></>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
