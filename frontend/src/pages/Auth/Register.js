import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gem, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
            <Link to="/" className="auth-logo"><Gem size={32} /><span>AS Crystal</span></Link>
            <h2>Create Account</h2>
            <p>Join thousands of crystal enthusiasts</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone (Optional)</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="loading-spinner small" /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
