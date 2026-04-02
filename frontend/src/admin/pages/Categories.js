import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => categoryAPI.getCategories().then((res) => setCategories(res.categories || []));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', sort_order: 0 }); setModal(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order || 0 }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (editing) await categoryAPI.updateCategory(editing.id, fd);
      else await categoryAPI.createCategory(fd);
      toast.success(editing ? 'Category updated!' : 'Category created!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await categoryAPI.deleteCategory(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Sort Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{cat.slug}</td>
                  <td>{cat.product_count || 0}</td>
                  <td>{cat.sort_order}</td>
                  <td><span className={`status-pill ${cat.is_active ? 'active' : 'inactive'}`}>{cat.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" onClick={() => openEdit(cat)}><Edit size={14} /></button>
                      <button className="action-btn danger" onClick={() => handleDelete(cat.id, cat.name)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-form-card" style={{ width: 480, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20 }}>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="form-group"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
