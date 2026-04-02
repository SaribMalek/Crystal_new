import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home, Package } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('Thank you for your purchase. Your crystal order is being processed.');

  useEffect(() => {
    if (sessionId) {
      orderAPI.confirmStripeCheckoutSession(sessionId)
        .then((res) => {
          clearCart();
          setMessage('Your Stripe payment was confirmed successfully.');
          if (res.order_id) {
            return orderAPI.getOrder(res.order_id).then((response) => setOrder(response.order)).catch(() => {});
          }
          return null;
        })
        .catch(() => {
          setMessage('Payment was completed, but the order details are still being synchronized.');
        });
      return;
    }

    if (id) {
      orderAPI.getOrder(id).then((res) => setOrder(res.order)).catch(() => {});
    }
  }, [id, sessionId, clearCart]);

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-card glass-card">
          <div className="success-icon-wrap">
            <div className="success-icon"><CheckCircle size={60} /></div>
            <div className="success-ring" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-subtitle">{message}</p>

          {order && (
            <div className="order-info-card">
              <div className="order-info-row">
                <span>Order Number</span>
                <strong>#{order.order_number}</strong>
              </div>
              <div className="order-info-row">
                <span>Total Amount</span>
                <strong>Rs. {Number(order.total).toLocaleString('en-IN')}</strong>
              </div>
              <div className="order-info-row">
                <span>Payment Method</span>
                <strong>{order.payment_method?.toUpperCase() || 'COD'}</strong>
              </div>
              <div className="order-info-row">
                <span>Status</span>
                <span className="status-badge">{order.status}</span>
              </div>
            </div>
          )}

          <div className="success-message">
            <Package size={18} />
            <p>You will receive order emails for purchase confirmation, dispatch, and delivery updates.</p>
          </div>

          <div className="success-actions">
            <Link to="/orders" className="btn btn-secondary"><ShoppingBag size={16} /> View Orders</Link>
            <Link to="/" className="btn btn-primary"><Home size={16} /> Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
