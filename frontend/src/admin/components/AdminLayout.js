import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  Gem,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Bell,
  Settings,
  Sun,
  Moon,
  BarChart3,
  User,
  Rows3,
  Boxes,
  WalletCards,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './AdminLayout.css';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
      { path: '/admin/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { path: '/admin/products', icon: <Package size={18} />, label: 'Products' },
      { path: '/admin/categories', icon: <Tag size={18} />, label: 'Categories' },
      { path: '/admin/menus', icon: <Rows3 size={18} />, label: 'Menus' },
      { path: '/admin/blogs', icon: <BookOpen size={18} />, label: 'Blogs' },
      { path: '/admin/settings', icon: <Boxes size={18} />, label: 'CMS & Content' },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { path: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
      { path: '/admin/coupons', icon: <Ticket size={18} />, label: 'Coupons' },
      { path: '/admin/reviews', icon: <Star size={18} />, label: 'Reviews' },
    ],
  },
  {
    title: 'Customers',
    items: [
      { path: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', icon: <Settings size={18} />, label: 'Settings Hub' },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
    setUserMenuOpen(false);
  }, [location.pathname]);

  if (!user) return <Navigate to="/admin/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-logo">
          <Gem size={24} className="logo-gem" />
          {sidebarOpen && <div><span>AS Crystal</span><small>Admin Panel</small></div>}
        </div>

        <nav className="admin-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="admin-nav-group">
              {sidebarOpen && <div className="admin-nav-group-title">{group.title}</div>}
              <div className="admin-subnav">
                {group.items.map((item) => (
                  <Link key={`${group.title}-${item.path}`} to={item.path} className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}>
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && isActive(item.path, item.exact) && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" style={{ fontSize: 13 }}>
            <FileText size={16} />
            {sidebarOpen && <span>View Store</span>}
          </Link>
          <button className="admin-nav-item logout-item" onClick={logout}>
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <button
        type="button"
        className="admin-sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-right">
            <div className="topbar-user-wrap" ref={userMenuRef}>
              <button className="topbar-user" type="button" onClick={() => setUserMenuOpen((open) => !open)}>
                <div className="topbar-avatar">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="topbar-avatar-img" /> : user.name?.[0]?.toUpperCase()}
                </div>
                <div className="topbar-user-info">
                  <span>{user.name}</span>
                  <small>{theme === 'light' ? 'Light mode' : 'Dark mode'}</small>
                </div>
              </button>

              {userMenuOpen && (
                <div className="admin-user-menu">
                  <Link to="/profile" className="admin-user-menu-item">
                    <User size={16} /> My Profile
                  </Link>
                  <button type="button" className="admin-user-menu-item" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                  </button>
                  <button type="button" className="admin-user-menu-item">
                    <Bell size={16} /> Notifications
                  </button>
                  <Link to="/admin/settings" className="admin-user-menu-item">
                    <WalletCards size={16} /> Settings Hub
                  </Link>
                  <div className="admin-user-divider" />
                  <button type="button" className="admin-user-menu-item logout-item" onClick={logout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
