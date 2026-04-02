import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  if (!user) return <Navigate to="/" replace />;

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.user || profile);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPass(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
    finally { setChangingPass(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-grid">
          <div className="profile-card glass-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile.avatar ? <img src={profile.avatar} alt={profile.name} className="profile-avatar-img" /> : user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            </div>
          </div>

          <div className="profile-section glass-card">
            <h3><User size={18} /> Personal Information</h3>
            <form onSubmit={handleProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input value={user.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Profile Image URL</label>
                <input
                  value={profile.avatar}
                  onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  placeholder="https://your-image-link.com/photo.jpg"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="profile-section glass-card">
            <h3><Lock size={18} /> Change Password</h3>
            <form onSubmit={handlePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={changingPass}>
                <Lock size={16} /> {changingPass ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
