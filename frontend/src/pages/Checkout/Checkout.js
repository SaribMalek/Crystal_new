import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, couponAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const paymentOptions = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'COD', desc: 'Pay when your order arrives' },
  { id: 'stripe', label: 'Stripe Checkout', icon: 'STR', desc: 'Secure card payments with Stripe' },
  { id: 'upi', label: 'UPI Payment', icon: 'UPI', desc: 'Manual UPI collection flow' },
  { id: 'netbanking', label: 'Net Banking', icon: 'BNK', desc: 'Manual bank transfer flow' },
];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [address, setAddress] = useState({
    full_name: user?.name || '',
    phone: '',
    email: user?.email || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [payment, setPayment] = useState('cod');

  const formatPrice = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;
  const shipping = cartTotal > 999 ? 0 : 99;
  const discount = couponData?.discount || 0;
  const tax = parseFloat(((cartTotal - discount) * 0.18).toFixed(2));
  const total = parseFloat((cartTotal - discount + shipping + tax).toFixed(2));

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponAPI.validateCoupon({ code: couponCode, order_amount: cartTotal });
      setCouponData(res);
      toast.success(`Coupon applied! You save ${formatPrice(res.discount)}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const validateAddress = () => {
    if (!address.full_name || !address.phone || !address.email || !address.address_line1 || !address.city || !address.state || !address.postal_code) {
      toast.error('Please fill all required address fields');
      return false;
    }
    return true;
  };

  const orderPayload = {
    items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
    shipping_address: address,
    payment_method: payment,
    coupon_code: couponCode || undefined,
    email: address.email,
    name: address.full_name,
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setLoading(true);
    try {
      if (payment === 'stripe') {
        const res = await orderAPI.createStripeCheckoutSession(orderPayload);
        window.location.href = res.url;
        return;
      }

      const res = await orderAPI.createOrder(orderPayload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${res.order_id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <ShoppingBag size={64} style={{ color: 'rgba(185,138,60,0.35)' }} />
          <h2>Your cart is empty</h2>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-steps">
          {['Address', 'Review & Pay'].map((label, index) => (
            <div key={label} className={`step ${step > index + 1 ? 'done' : ''} ${step === index + 1 ? 'active' : ''}`}>
              <div className="step-num">{step > index + 1 ? <CheckCircle size={16} /> : index + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 1 && (
              <div className="checkout-section">
                <h3><Truck size={20} /> Shipping Address</h3>
                <div className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} placeholder="name@example.com" />
                  </div>

                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} placeholder="House/Flat no, Street name" />
                  </div>

                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} placeholder="Area, Landmark" />
                  </div>

                  <div className="form-row triple">
                    <div className="form-group">
                      <label>City *</label>
                      <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" />
                    </div>
                    <div className="form-group">
                      <label>PIN Code *</label>
                      <input value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} placeholder="PIN Code" />
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary next-btn" onClick={() => setStep(2)}>Continue to Review</button>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="checkout-section">
                  <h3><ShoppingBag size={20} /> Order Items ({cartItems.length})</h3>
                  <div className="order-items">
                    {cartItems.map((item) => {
                      const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
                      return (
                        <div className="order-item" key={item.id}>
                          <div className="order-item-img"><img src={images[0] || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=100'} alt={item.name} /></div>
                          <div className="order-item-info">
                            <h5>{item.name}</h5>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="checkout-section">
                  <h3><CreditCard size={20} /> Payment Method</h3>
                  <div className="payment-options">
                    {paymentOptions.map((option) => (
                      <label key={option.id} className={`payment-option ${payment === option.id ? 'active' : ''}`}>
                        <input type="radio" name="payment" value={option.id} checked={payment === option.id} onChange={() => setPayment(option.id)} />
                        <span className="payment-icon">{option.icon}</span>
                        <div>
                          <strong>{option.label}</strong>
                          <p>{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="checkout-section address-summary">
                  <h3>Delivering to</h3>
                  <p><strong>{address.full_name}</strong> · {address.phone}</p>
                  <p>{address.email}</p>
                  <p>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                  <p>{address.city}, {address.state} - {address.postal_code}</p>
                  <button className="btn btn-secondary change-addr-btn" onClick={() => setStep(1)}>Change Address</button>
                </div>

                <button className="btn btn-primary place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Processing...' : payment === 'stripe' ? `Pay with Stripe · ${formatPrice(total)}` : `Place Order · ${formatPrice(total)}`}
                </button>
              </>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary glass-card">
              <h3>Order Summary</h3>

              <div className="coupon-section">
                <div className="coupon-input">
                  <Tag size={16} />
                  <input placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button className="apply-coupon" onClick={handleCoupon} disabled={validatingCoupon}>
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponData && <p className="coupon-success">Coupon applied! -{formatPrice(discount)}</p>}
              </div>

              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span className="free-tag">FREE</span> : formatPrice(shipping)}</span></div>
                <div className="summary-row"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
                <div className="summary-row total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              {cartTotal <= 999 && (
                <p className="shipping-note">
                  <Truck size={14} /> Add {formatPrice(999 - cartTotal)} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
