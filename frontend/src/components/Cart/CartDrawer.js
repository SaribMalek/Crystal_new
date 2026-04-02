import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user, openAuthModal } = useAuth();

  const formatPrice = (price) => `Rs. ${Number(price).toLocaleString('en-IN')}`;

  const handleCheckout = (event) => {
    if (!user) {
      event.preventDefault();
      openAuthModal('login', 'Please login to continue to checkout.');
      return;
    }

    setIsCartOpen(false);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <div>
            <h3>Shopping Cart</h3>
            <span className="cart-count-badge">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}><X size={22} /></button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={64} className="empty-icon" />
              <h4>Your cart is empty</h4>
              <p>Discover our beautiful crystal collection</p>
              <Link to="/shop" className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
                Explore Products
              </Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
              const image = images[0] || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200';
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <img src={image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h5>{item.name}</h5>
                    {item.category_name && <span className="cart-item-cat">{item.category_name}</span>}
                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={12} /></button>
                      </div>
                      <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="summary-row muted">
                <span>Shipping</span>
                <span>{cartTotal > 999 ? 'FREE' : formatPrice(99)}</span>
              </div>
              {cartTotal <= 999 && (
                <p className="free-shipping-hint">Add {formatPrice(999 - cartTotal)} more for free shipping!</p>
              )}
            </div>
            <div className="cart-actions">
              <Link to="/cart" className="btn btn-secondary" onClick={() => setIsCartOpen(false)}>View Cart</Link>
              <Link to="/checkout" className="btn btn-primary" onClick={handleCheckout}>Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
