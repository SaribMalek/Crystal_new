import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gem, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <Gem size={32} />
              <span>AS Crystal</span>
            </Link>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input type={showPass ? 'text' : 'password'} placeholder="Your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="loading-spinner small" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
