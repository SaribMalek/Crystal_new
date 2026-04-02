import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const formatPrice = (price) => `Rs. ${Number(price).toLocaleString('en-IN')}`;
  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = parseFloat((cartTotal * 0.18).toFixed(2));
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-empty">
        <div className="container">
          <ShoppingBag size={80} style={{ color: 'rgba(201,168,76,0.2)', marginBottom: 24 }} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any crystals yet</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <button className="clear-cart-btn" onClick={clearCart}>Clear All</button>
        </div>

        <div className="cart-page-layout">
          <div className="cart-page-items">
            {cartItems.map((item) => {
              const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
              const img = images[0] || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300';
              return (
                <div className="cart-page-item glass-card" key={item.id}>
                  <div className="cpi-image">
                    <img src={img} alt={item.name} />
                  </div>
                  <div className="cpi-info">
                    <Link to={`/product/${item.slug}`} className="cpi-name">{item.name}</Link>
                    {item.category_name && <span className="cpi-cat">{item.category_name}</span>}
                    <div className="cpi-price">{formatPrice(item.price)}</div>
                  </div>
                  <div className="cpi-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={13} /></button>
                    </div>
                    <div className="cpi-subtotal">{formatPrice(item.price * item.quantity)}</div>
                    <button className="cpi-remove" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-page-summary glass-card">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: '#86efac' }}>FREE</span> : formatPrice(shipping)}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            {cartTotal <= 999 && (
              <div className="free-ship-banner">
                <Truck size={14} /> Add {formatPrice(999 - cartTotal)} more for free shipping!
              </div>
            )}
            <Link
              to={user ? '/checkout' : '#'}
              className="btn btn-primary checkout-btn"
              onClick={(event) => {
                if (!user) {
                  event.preventDefault();
                  openAuthModal('login', 'Please login or register before checkout.');
                }
              }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn btn-secondary continue-btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
