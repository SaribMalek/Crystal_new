import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProducts({ page, limit: 15, search });
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const f = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontFamily: 'Inter' }}>({total})</span></h1>
        <Link to="/admin/products/new" className="btn btn-primary"><Plus size={16} /> Add Product</Link>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-search">
            <Search size={14} />
            <input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{total} products</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Featured</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No products found</td></tr>
              ) : products.map((p) => {
                const images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={images[0] || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=100'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{p.category_name || '-'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f(p.sale_price || p.price)}</div>
                      {p.sale_price && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{f(p.price)}</div>}
                    </td>
                    <td><span style={{ color: p.stock < 5 ? '#f87171' : p.stock < 20 ? '#fbbf24' : '#86efac' }}>{p.stock}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} fill="#fbbf24" color="#fbbf24" /><span style={{ fontSize: 13 }}>{Number(p.rating || 0).toFixed(1)}</span></div></td>
                    <td>{p.is_featured ? <span className="status-pill active">Yes</span> : <span className="status-pill inactive">No</span>}</td>
                    <td><span className={`status-pill ${p.is_active ? 'active' : 'inactive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/admin/products/edit/${p.id}`} className="action-btn"><Edit size={14} /></Link>
                        <button className="action-btn danger" onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20, gap: 8 }}>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} style={{ width: 36, height: 36, borderRadius: 6, background: page === i + 1 ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${page === i + 1 ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`, color: page === i + 1 ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13 }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
