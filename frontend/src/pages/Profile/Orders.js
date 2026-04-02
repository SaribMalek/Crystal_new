import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import './Profile.css';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrders().then((res) => setOrders(res.orders || [])).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Package size={64} style={{ color: 'rgba(201,168,76,0.2)', marginBottom: 20 }} />
            <h3>No orders yet</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 24px' }}>Start shopping to see your orders here</p>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link to={`/orders/${order.id}`} key={order.id} className="order-card glass-card">
                <div className="order-meta">
                  <span className="order-number">#{order.order_number}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="order-items-count">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                </div>
                <span className={`order-status ${order.status}`}>{order.status}</span>
                <span className="order-total">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
