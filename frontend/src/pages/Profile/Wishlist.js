import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Profile.css';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWishlist().then((res) => setWishlist(res.wishlist || [])).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1 className="page-title">My Wishlist</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Heart size={64} style={{ color: 'rgba(248,113,113,0.2)', marginBottom: 20 }} />
            <h3>Your wishlist is empty</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Save your favorite crystals here</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
