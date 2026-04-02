import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus, Gem } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const initialLogin = { email: '', password: '' };
const initialRegister = { name: '', email: '', phone: '', password: '', confirm: '' };

const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    authModalMessage,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
  } = useAuth();
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authModalOpen) {
      setLoginForm(initialLogin);
      setRegisterForm(initialRegister);
      setShowLoginPassword(false);
      setShowRegisterPassword(false);
      setLoading(false);
    }
  }, [authModalOpen]);

  useEffect(() => {
    if (!authModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${res.user.name}!`);
      closeAuthModal();
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.phone);
      toast.success('Account created successfully!');
      closeAuthModal();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-root">
      <div className="auth-modal-overlay" onClick={closeAuthModal} />
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button type="button" className="auth-modal-close" onClick={closeAuthModal} aria-label="Close">
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-brand">
            <Gem size={22} />
            <span>AS Crystal</span>
          </div>
          <h2 id="auth-modal-title">{authModalMode === 'login' ? 'Login to your account' : 'Create your account'}</h2>
          <p>
            {authModalMessage || 'Use your account to manage your cart, orders, wishlist, and checkout experience.'}
          </p>
        </div>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-modal-tab ${authModalMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthModalMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-modal-tab ${authModalMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthModalMode('register')}
          >
            Register
          </button>
        </div>

        {authModalMode === 'login' ? (
          <form className="auth-modal-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((current) => ({ ...current, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((current) => ({ ...current, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowLoginPassword((value) => !value)}>
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-modal-submit" disabled={loading}>
              {loading ? <span className="loading-spinner small" /> : <><LogIn size={16} /> Login</>}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm((current) => ({ ...current, name: e.target.value }))}
                required
              />
            </div>
            <div className="auth-modal-grid">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm((current) => ({ ...current, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowRegisterPassword((value) => !value)}>
                  {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={registerForm.confirm}
                onChange={(e) => setRegisterForm((current) => ({ ...current, confirm: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-modal-submit" disabled={loading}>
              {loading ? <span className="loading-spinner small" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
