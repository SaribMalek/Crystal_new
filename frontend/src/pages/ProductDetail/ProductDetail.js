import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, Sparkles } from 'lucide-react';
import { productAPI, userAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);

  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    setLoading(true);
    productAPI.getProduct(slug)
      .then((res) => setData(res))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  const product = data?.product;
  const images = product ? (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || [])) : [];
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600'];

  const price = product?.sale_price || product?.price;
  const hasDiscount = product?.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
  const formatPrice = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

  const handleAddToCart = () => {
    const result = addToCart({ ...product, quantity }, quantity);
    if (result?.added) {
      toast.success('Added to cart!');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      openAuthModal('login', 'Please login to save this product to your wishlist.');
      return;
    }

    try {
      const res = await userAPI.toggleWishlist(product.id);
      setWishlisted(res.action === 'added');
      toast.success(res.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      openAuthModal('login', 'Please login to submit a review.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewAPI.addReview(product.id, review);
      toast.success('Review submitted for approval!');
      setReview({ rating: 5, title: '', body: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 16, interactive = false) => (
    <div className="stars-row">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(rating) ? 'star' : 'star-empty'}
          fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
          onClick={interactive ? () => setReview((current) => ({ ...current, rating: i + 1 })) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="container">
          <div className="detail-skeleton">
            <div className="skeleton-images shimmer" />
            <div className="skeleton-info">
              {Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton-line shimmer" style={{ width: `${80 - index * 10}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-page">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/shop">Shop</Link>
          {product.category_name && <><span>/</span><Link to={`/shop/${product.category_slug}`}>{product.category_name}</Link></>}
          <span>/</span><span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-images">
            <div className="main-image-wrap">
              {hasDiscount && <div className="detail-discount-badge">-{discount}%</div>}
              <img src={displayImages[selectedImg]} alt={product.name} className="main-image" />
              {displayImages.length > 1 && (
                <>
                  <button className="img-nav prev" onClick={() => setSelectedImg((current) => (current - 1 + displayImages.length) % displayImages.length)}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="img-nav next" onClick={() => setSelectedImg((current) => (current + 1) % displayImages.length)}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="image-thumbnails">
                {displayImages.map((img, index) => (
                  <button key={index} className={`thumb ${selectedImg === index ? 'active' : ''}`} onClick={() => setSelectedImg(index)}>
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            {product.category_name && <Link to={`/shop/${product.category_slug}`} className="product-cat-link">{product.category_name}</Link>}
            <h1 className="product-title">{product.name}</h1>

            <div className="rating-row">
              {renderStars(product.rating || 0)}
              <span className="rating-value">{Number(product.rating || 0).toFixed(1)}</span>
              <span className="review-count">{product.review_count || 0} reviews</span>
            </div>

            <div className="price-section">
              <span className="detail-price">{formatPrice(price)}</span>
              {hasDiscount && <span className="detail-price-old">{formatPrice(product.price)}</span>}
              {hasDiscount && <span className="detail-discount-label">Save {formatPrice(product.price - product.sale_price)}</span>}
            </div>

            <p className="product-short-desc">{product.short_description}</p>

            <div className="crystal-props">
              {product.chakra && <div className="prop-item"><span className="prop-label">Chakra</span><span className="prop-value">{product.chakra}</span></div>}
              {product.zodiac && <div className="prop-item"><span className="prop-label">Zodiac</span><span className="prop-value">{product.zodiac}</span></div>}
              {product.element && <div className="prop-item"><span className="prop-label">Element</span><span className="prop-value">{product.element}</span></div>}
              {product.origin && <div className="prop-item"><span className="prop-label">Origin</span><span className="prop-value">{product.origin}</span></div>}
            </div>

            <div className="quantity-section">
              <label>Quantity</label>
              <div className="qty-row">
                <div className="qty-control large">
                  <button onClick={() => setQty((current) => Math.max(1, current - 1))}><Minus size={16} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => setQty((current) => current + 1)}><Plus size={16} /></button>
                </div>
                {product.stock > 0 ? (
                  <span className="stock-info">{product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}</span>
                ) : (
                  <span className="out-of-stock-info">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary add-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button className={`wishlist-btn-lg ${wishlisted ? 'active' : ''}`} onClick={handleWishlist}>
                <Heart size={20} fill={wishlisted ? '#f87171' : 'none'} />
              </button>
            </div>

            <div className="detail-trust">
              <div className="trust-badge"><Shield size={14} /> Authentic Crystal</div>
              <div className="trust-badge"><Truck size={14} /> Free Shipping Rs. 999+</div>
              <div className="trust-badge"><RotateCcw size={14} /> 7-Day Returns</div>
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="tabs-nav">
            {['description', 'healing', 'reviews'].map((tab) => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'description' ? 'Description' : tab === 'healing' ? 'Healing Properties' : `Reviews (${data?.reviews?.length || 0})`}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-panel">
                <p>{product.description}</p>
                {(product.weight || product.dimensions) && (
                  <div className="specs-grid">
                    {product.weight && <div className="spec"><strong>Weight:</strong> {product.weight}</div>}
                    {product.dimensions && <div className="spec"><strong>Dimensions:</strong> {product.dimensions}</div>}
                    {product.sku && <div className="spec"><strong>SKU:</strong> {product.sku}</div>}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'healing' && (
              <div className="tab-panel">
                <div className="healing-header">
                  <Sparkles size={20} className="healing-icon" />
                  <h3>Healing & Metaphysical Properties</h3>
                </div>
                <p>{product.healing_properties || 'Detailed healing properties coming soon.'}</p>
                <div className="props-full">
                  {product.chakra && <div className="prop-full"><strong>Chakra:</strong> {product.chakra}</div>}
                  {product.zodiac && <div className="prop-full"><strong>Zodiac:</strong> {product.zodiac}</div>}
                  {product.element && <div className="prop-full"><strong>Element:</strong> {product.element}</div>}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="tab-panel reviews-panel">
                {data?.reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {data.reviews.map((reviewItem) => (
                      <div className="review-item" key={reviewItem.id}>
                        <div className="review-header">
                          <div className="reviewer-avatar">{reviewItem.user_name?.[0]}</div>
                          <div>
                            <strong>{reviewItem.user_name}</strong>
                            {renderStars(reviewItem.rating, 14)}
                          </div>
                          <span className="review-date">{new Date(reviewItem.created_at).toLocaleDateString()}</span>
                        </div>
                        {reviewItem.title && <h5 className="review-title">{reviewItem.title}</h5>}
                        <p className="review-body">{reviewItem.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reviews">No reviews yet. Be the first to review!</p>
                )}

                {user && (
                  <form className="review-form" onSubmit={handleReviewSubmit}>
                    <h4>Write a Review</h4>
                    <div className="review-rating">
                      <label>Your Rating</label>
                      {renderStars(review.rating, 24, true)}
                    </div>
                    <input type="text" placeholder="Review Title" value={review.title} onChange={(e) => setReview((current) => ({ ...current, title: e.target.value }))} className="review-input" />
                    <textarea placeholder="Share your experience..." value={review.body} onChange={(e) => setReview((current) => ({ ...current, body: e.target.value }))} className="review-textarea" rows={4} />
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {data?.related?.length > 0 && (
          <div className="related-section">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-grid">
              {data.related.map((relatedProduct) => <ProductCard key={relatedProduct.id} product={relatedProduct} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
