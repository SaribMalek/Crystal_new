import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI } from '../../services/api';
import { useMenus } from '../../context/MenuContext';

const MENU_OPTIONS = [
  { value: 'shop', label: 'Shop Mega Menu' },
  { value: 'quick', label: 'Header Quick Links' },
  { value: 'help', label: 'Footer Help Links' },
];

const emptyForm = {
  menu_key: 'shop',
  title: '',
  link: '',
  parent_id: '',
  sort_order: 0,
  is_active: true,
};

const AdminMenus = () => {
  const [items, setItems] = useState([]);
  const [activeMenu, setActiveMenu] = useState('shop');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { refreshMenus } = useMenus();

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await menuAPI.getAdminMenus();
      setItems(res.items || []);
    } catch (err) {
      setItems([]);
      setLoadError(err.message || 'Unable to load menu items right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const currentItems = useMemo(
    () => items.filter((item) => item.menu_key === activeMenu),
    [items, activeMenu]
  );

  const parentOptions = useMemo(
    () => items.filter((item) => item.menu_key === form.menu_key && !item.parent_id && (!editing || item.id !== editing.id)),
    [items, form.menu_key, editing]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, menu_key: activeMenu });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      menu_key: item.menu_key,
      title: item.title,
      link: item.link || '',
      parent_id: item.parent_id || '',
      sort_order: item.sort_order || 0,
      is_active: Boolean(item.is_active),
    });
    setModal(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        parent_id: form.parent_id || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active),
      };
      if (editing) {
        await menuAPI.updateMenuItem(editing.id, payload);
        toast.success('Menu item updated!');
      } else {
        await menuAPI.createMenuItem(payload);
        toast.success('Menu item created!');
      }
      setModal(false);
      await Promise.all([load(), refreshMenus()]);
    } catch (err) {
      toast.error(err.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?${!item.parent_id ? ' Its submenus will also be deleted.' : ''}`)) return;
    try {
      await menuAPI.deleteMenuItem(item.id);
      toast.success('Menu item deleted');
      await Promise.all([load(), refreshMenus()]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete menu item');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Menus</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Menu Item</button>
      </div>

      <div className="admin-table-wrap" style={{ marginBottom: 24 }}>
        <div className="admin-table-header">
          <h3>Menu Sections</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {MENU_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`btn ${activeMenu === option.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMenu(option.value)}
                style={{ padding: '8px 14px', fontSize: 13 }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Link</th>
                <th>Level</th>
                <th>Parent</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    Loading menu items...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#d74d4d' }}>
                    {loadError}
                    <div style={{ marginTop: 10, color: 'var(--color-text-muted)' }}>
                      If you just added this feature, run `npm run setup` once to create the menu table.
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !loadError && currentItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.link || 'Column heading only'}</td>
                  <td>{item.parent_id ? 'Submenu' : 'Top level'}</td>
                  <td>{item.parent_title || '-'}</td>
                  <td>{item.sort_order}</td>
                  <td><span className={`status-pill ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" onClick={() => openEdit(item)}><Edit size={14} /></button>
                      <button className="action-btn danger" onClick={() => handleDelete(item)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !loadError && !currentItems.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No menu items found in this section yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-form-card" style={{ width: 620, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 22 }}>{editing ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-form-grid">
              <div className="form-group">
                <label>Menu Section</label>
                <select value={form.menu_key} onChange={(e) => setForm((current) => ({ ...current, menu_key: e.target.value, parent_id: '' }))}>
                  {MENU_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Parent Menu</label>
                <select value={form.parent_id} onChange={(e) => setForm((current) => ({ ...current, parent_id: e.target.value }))}>
                  <option value="">None (Top level)</option>
                  {parentOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm((current) => ({ ...current, sort_order: e.target.value }))} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Link</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((current) => ({ ...current, link: e.target.value }))}
                  placeholder={form.parent_id ? '/shop/raw-crystals or /contact' : 'Optional for top-level shop menu headings'}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))}
                    style={{ width: 'auto' }}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Menu Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenus;
