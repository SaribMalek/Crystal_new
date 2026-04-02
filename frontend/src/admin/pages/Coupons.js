import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);

  const load = () => couponAPI.getCoupons().then((res) => setCoupons(res.coupons || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await couponAPI.createCoupon(form);
      toast.success('Coupon created!');
      setModal(false);
      setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, is_active) => {
    try { await couponAPI.updateCoupon(id, { is_active: !is_active }); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try { await couponAPI.deleteCoupon(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Coupons</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Create Coupon</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td><span style={{ fontWeight: 700, letterSpacing: 1, color: 'var(--color-primary)' }}>{c.code}</span></td>
                <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{c.type}</td>
                <td style={{ fontWeight: 600 }}>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>₹{c.min_order_amount}</td>
                <td style={{ fontSize: 13 }}>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                <td><span className={`status-pill ${c.is_active ? 'active' : 'inactive'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => toggleActive(c.id, c.is_active)} title="Toggle">
                      {c.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                    <button className="action-btn danger" onClick={() => handleDelete(c.id, c.code)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-form-card" style={{ width: 500, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20 }}>Create Coupon</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Coupon Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. CRYSTAL20" /></div>
              <div className="form-group"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option></select></div>
              <div className="form-group"><label>Value *</label><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder={form.type === 'percentage' ? '20' : '100'} /></div>
              <div className="form-group"><label>Min Order Amount</label><input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="0" /></div>
              <div className="form-group"><label>Max Uses</label><input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Expires At</label><input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
