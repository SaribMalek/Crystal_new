import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/Cart/CartDrawer';
import AuthModal from './components/Auth/AuthModal';

import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import CartPage from './pages/Cart/CartPage';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/Checkout/OrderSuccess';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Profile/Orders';
import OrderDetail from './pages/Profile/OrderDetail';
import Wishlist from './pages/Profile/Wishlist';
import InfoPage from './pages/Info/InfoPage';
import Contact from './pages/Contact/Contact';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/Blog/BlogDetail';

import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import AdminProducts from './admin/pages/Products';
import AdminProductForm from './admin/pages/ProductForm';
import AdminCategories from './admin/pages/Categories';
import AdminMenus from './admin/pages/Menus';
import AdminOrders from './admin/pages/Orders';
import AdminOrderDetail from './admin/pages/OrderDetail';
import AdminUsers from './admin/pages/Users';
import AdminCoupons from './admin/pages/Coupons';
import AdminReviews from './admin/pages/Reviews';
import AdminBlogs from './admin/pages/Blogs';
import Reports from './admin/pages/Reports';
import SettingsPage from './admin/pages/Settings';
import { infoPages, servicePages } from './data/siteContent';

const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return <main style={{ minHeight: '100vh' }}>{children}</main>;
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <AuthModal />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'app-toast',
                duration: 3200,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-soft)',
                },
                success: {
                  className: 'app-toast toast-success',
                  iconTheme: {
                    primary: '#2f7f76',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  className: 'app-toast toast-error',
                  duration: 4200,
                  iconTheme: {
                    primary: '#d74d4d',
                    secondary: '#ffffff',
                  },
                },
                loading: {
                  className: 'app-toast toast-loading',
                },
              }}
            />
            <Routes>
            <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
            <Route path="/shop" element={<CustomerLayout><Shop /></CustomerLayout>} />
            <Route path="/shop/:category" element={<CustomerLayout><Shop /></CustomerLayout>} />
            <Route path="/product/:slug" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
            <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
            <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
            <Route path="/order-success" element={<CustomerLayout><OrderSuccess /></CustomerLayout>} />
            <Route path="/order-success/:id" element={<CustomerLayout><OrderSuccess /></CustomerLayout>} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<Login adminOnly />} />
            <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />
            <Route path="/profile" element={<CustomerLayout><Profile /></CustomerLayout>} />
            <Route path="/orders" element={<CustomerLayout><Orders /></CustomerLayout>} />
            <Route path="/orders/:id" element={<CustomerLayout><OrderDetail /></CustomerLayout>} />
            <Route path="/wishlist" element={<CustomerLayout><Wishlist /></CustomerLayout>} />

            <Route path="/about" element={<CustomerLayout><InfoPage {...infoPages.about} /></CustomerLayout>} />
            <Route path="/blog" element={<CustomerLayout><Blog /></CustomerLayout>} />
            <Route path="/blog/:slug" element={<CustomerLayout><BlogDetail /></CustomerLayout>} />
            <Route path="/faq" element={<CustomerLayout><InfoPage {...infoPages.faq} /></CustomerLayout>} />
            <Route path="/shipping" element={<CustomerLayout><InfoPage {...infoPages.shipping} /></CustomerLayout>} />
            <Route path="/returns" element={<CustomerLayout><InfoPage {...infoPages.returns} /></CustomerLayout>} />
            <Route path="/privacy" element={<CustomerLayout><InfoPage {...infoPages.privacy} /></CustomerLayout>} />
            <Route path="/terms" element={<CustomerLayout><InfoPage {...infoPages.terms} /></CustomerLayout>} />
            <Route path="/disclaimers" element={<CustomerLayout><InfoPage {...infoPages.disclaimers} /></CustomerLayout>} />
            <Route path="/sitemap" element={<CustomerLayout><InfoPage {...infoPages.sitemap} /></CustomerLayout>} />
            <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
            <Route path="/services/crystal-consultation" element={<CustomerLayout><InfoPage {...servicePages['crystal-consultation']} /></CustomerLayout>} />
            <Route path="/services/astro-consultation" element={<CustomerLayout><InfoPage {...servicePages['astro-consultation']} /></CustomerLayout>} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="menus" element={<AdminMenus />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            </Routes>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
