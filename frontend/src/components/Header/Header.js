import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  Gem,
  ChevronDown,
  LogOut,
  Settings,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMenus } from '../../context/MenuContext';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdown, setShopDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, openAuthModal } = useAuth();
  const { menus } = useMenus();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-topbar">
        <div className="container header-topbar-inner">
          <div className="topbar-copy">
            <Sparkles size={14} />
            <span>Free shipping across India, premium gifting, and intentional crystal collections.</span>
          </div>
          <div className="topbar-contact">
            <Phone size={13} />
            <span>Support: +91 98765 43210</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="header-inner">
          <Link to="/" className="logo">
            <Gem size={28} className="logo-icon" />
            <div>
              <span className="logo-text">AS Crystal</span>
              <span className="logo-tagline">Healing crystals, jewellery and gifting</span>
            </div>
          </Link>

          <nav className="nav desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <div className="nav-dropdown" onMouseEnter={() => setShopDropdown(true)} onMouseLeave={() => setShopDropdown(false)}>
              <button className="nav-link nav-link-button" type="button">
                Shop <ChevronDown size={14} />
              </button>
              {shopDropdown && (
                <div className="dropdown-menu mega-menu">
                  <div className="dropdown-grid mega-grid">
                    {menus.shop.map((group) => (
                      <div key={group.title}>
                        <span className="dropdown-label">{group.title}</span>
                        {group.items.map((item) => (
                          <Link key={`${group.title}-${item.title}`} to={item.link} className="dropdown-item">{item.title}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {menus.quick.map((item) => (
              <Link key={item.title} to={item.link} className="nav-link">{item.title}</Link>
            ))}
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} title="Search">
              <Search size={20} />
            </button>

            {user && (
              <Link to="/wishlist" className="icon-btn" title="Wishlist">
                <Heart size={20} />
              </Link>
            )}

            <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {user ? (
              <div className="user-dropdown-wrap" onMouseEnter={() => setUserDropdown(true)} onMouseLeave={() => setUserDropdown(false)}>
                <button className="user-btn" type="button">
                  <div className="user-avatar">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="user-avatar-img" /> : user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                </button>
                {userDropdown && (
                  <div className="dropdown-menu user-menu">
                    <div className="dropdown-user-info">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item"><User size={15} /> My Profile</Link>
                    <Link to="/orders" className="dropdown-item"><ShoppingBag size={15} /> My Orders</Link>
                    <Link to="/wishlist" className="dropdown-item"><Heart size={15} /> Wishlist</Link>
                    {user.role === 'admin' && (
                      <>
                        <div className="dropdown-divider" />
                        <Link to="/admin" className="dropdown-item admin-link"><Settings size={15} /> Admin Panel</Link>
                      </>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={logout}><LogOut size={15} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth-links">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => openAuthModal('login')}>
                  Login
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => openAuthModal('register')}>
                  Register
                </button>
              </div>
            )}

            <button className="icon-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search crystals, bracelets, decor or gift sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary search-submit">Search</button>
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          {menus.quick.map((item) => (
            <Link key={item.title} to={item.link} className="mobile-link">{item.title}</Link>
          ))}
          {menus.shop.map((group) => (
            <div key={group.title}>
              <div className="mobile-menu-label">{group.title}</div>
              {group.items.map((item) => (
                <Link key={`${group.title}-${item.title}`} to={item.link} className="mobile-link sub">{item.title}</Link>
              ))}
            </div>
          ))}
          {user ? (
            <>
              <Link to="/profile" className="mobile-link">My Profile</Link>
              <Link to="/orders" className="mobile-link">My Orders</Link>
              {user.role === 'admin' && <Link to="/admin" className="mobile-link">Admin Panel</Link>}
              <button className="mobile-link logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
