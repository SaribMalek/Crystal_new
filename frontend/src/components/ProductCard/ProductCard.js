import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const image = images[0] || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&q=80';
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  const formatPrice = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    const result = addToCart(product);
    if (result?.added) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Please login to manage your wishlist.');
      return;
    }
    setLoading(true);
    try {
      const res = await userAPI.toggleWishlist(product.id);
      setWishlisted(res.action === 'added');
      toast.success(res.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < Math.floor(rating) ? 'star' : 'star-empty'} fill={i < Math.floor(rating) ? '#fbbf24' : 'none'} />
    ));
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      {hasDiscount && <div className="discount-badge">-{discount}%</div>}
      {product.is_featured && <div className="featured-badge"><Zap size={10} /> Featured</div>}

      <div className="product-image-wrap">
        <img src={image} alt={product.name} className="product-img" loading="lazy" />
        <div className="product-overlay">
          <button className={`overlay-btn wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} disabled={loading}>
            <Heart size={16} fill={wishlisted ? '#f87171' : 'none'} />
          </button>
          <button className="overlay-btn view-btn">
            <Eye size={16} />
          </button>
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>

      <div className="product-info">
        {product.category_name && <span className="product-category">{product.category_name}</span>}
        <h3 className="product-name">{product.name}</h3>
        {product.chakra && <p className="product-chakra">{product.chakra} Chakra</p>}

        <div className="product-rating">
          <div className="stars">{renderStars(product.rating || 0)}</div>
          <span className="rating-count">({product.review_count || 0})</span>
        </div>

        <div className="product-price-row">
          <div className="price-group">
            <span className="price-current">{formatPrice(price)}</span>
            {hasDiscount && <span className="price-original">{formatPrice(product.price)}</span>}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="stock-warning">Only {product.stock} left!</span>
          )}
          {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
