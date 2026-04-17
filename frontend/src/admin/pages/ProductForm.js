import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '', description: '', short_description: '', price: '', sale_price: '',
  stock: '', sku: '', category_id: '', weight: '', dimensions: '',
  chakra: '', zodiac: '', element: '', healing_properties: '', origin: '',
  is_featured: false, is_active: true,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    categoryAPI.getCategories().then((res) => setCategories(res.categories || []));
    if (id) {
      setFetching(true);
      productAPI.getProducts({ page: 1, limit: 200 }).then((res) => {
        const p = res.products?.find((item) => item.id === parseInt(id, 10));
        if (p) {
          setForm({
            name: p.name || '', description: p.description || '', short_description: p.short_description || '',
            price: p.price || '', sale_price: p.sale_price || '', stock: p.stock || '',
            sku: p.sku || '', category_id: p.category_id || '', weight: p.weight || '',
            dimensions: p.dimensions || '', chakra: p.chakra || '', zodiac: p.zodiac || '',
            element: p.element || '', healing_properties: p.healing_properties || '',
            origin: p.origin || '', is_featured: !!p.is_featured, is_active: !!p.is_active,
          });
        }
      }).finally(() => setFetching(false));
    }
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      if (id) await productAPI.updateProduct(id, fd);
      else await productAPI.createProduct(fd);
      toast.success(id ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: 40, color: 'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-inline-heading">
          <button className="admin-back-btn" onClick={() => navigate('/admin/products')}><ArrowLeft size={16} /></button>
          <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}><Save size={16} />{loading ? 'Saving...' : 'Save Product'}</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-layout">
          <div className="admin-form-main">
            <div className="admin-form-card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Basic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Amethyst Tumbled Stone" />
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <input value={form.short_description} onChange={(e) => set('short_description', e.target.value)} placeholder="Brief product description" />
                </div>
                <div className="form-group">
                  <label>Full Description</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="Detailed product description..." />
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Pricing & Inventory</h3>
              <div className="admin-form-grid">
                {[['Price (Rs.) *', 'price', 'number'], ['Sale Price (Rs.)', 'sale_price', 'number'], ['Stock Quantity', 'stock', 'number'], ['SKU', 'sku', 'text']].map(([label, key, type]) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} required={key === 'price'} placeholder={label} />
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-form-card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Crystal Properties</h3>
              <div className="admin-form-grid">
                {[['Chakra', 'chakra'], ['Zodiac', 'zodiac'], ['Element', 'element'], ['Origin', 'origin'], ['Weight', 'weight'], ['Dimensions', 'dimensions']].map(([label, key]) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={label} />
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Healing Properties</label>
                <textarea value={form.healing_properties} onChange={(e) => set('healing_properties', e.target.value)} rows={3} placeholder="Describe healing and metaphysical properties..." />
              </div>
            </div>
          </div>

          <div className="admin-form-side">
            <div className="admin-form-card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Organization</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} style={{ accent: 'var(--color-primary)', width: 15, height: 15 }} />
                  Mark as Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} style={{ accent: 'var(--color-primary)', width: 15, height: 15 }} />
                  Active (visible in store)
                </label>
              </div>
            </div>

            <div className="admin-form-card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Product Images</h3>
              <label style={{ display: 'block', border: '2px dashed rgba(201,168,76,0.3)', borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => setFiles(Array.from(e.target.files))} />
                <Upload size={28} style={{ color: 'rgba(201,168,76,0.4)', marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Click to upload images<br /><small>Max 5 images, 5MB each</small></p>
              </label>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
