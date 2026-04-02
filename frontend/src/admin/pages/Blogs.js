import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, BookOpen, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogAPI } from '../../services/api';

const initialForm = {
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  is_featured: false,
  is_published: true,
  published_at: '',
};

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await blogAPI.getAdminBlogs();
      setBlogs(res.blogs || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      cover_image: blog.cover_image || '',
      is_featured: !!blog.is_featured,
      is_published: !!blog.is_published,
      published_at: blog.published_at ? new Date(blog.published_at).toISOString().slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        published_at: form.published_at || null,
      };

      if (editing) {
        await blogAPI.updateBlog(editing.id, payload);
        toast.success('Blog updated successfully');
      } else {
        await blogAPI.createBlog(payload);
        toast.success('Blog created successfully');
      }

      setModalOpen(false);
      setEditing(null);
      setForm(initialForm);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;

    try {
      await blogAPI.deleteBlog(blog.id);
      toast.success('Blog deleted successfully');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete blog');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Blogs</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>
            Create, publish, and manage the blog posts shown on the user-side blog page.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Blog
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Blog</th>
              <th>Author</th>
              <th>Published</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && blogs.map((blog) => (
              <tr key={blog.id}>
                <td>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 280 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                      {blog.cover_image ? (
                        <img src={blog.cover_image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--color-primary)' }}>
                          <BookOpen size={22} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{blog.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        /blog/{blog.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{blog.author_name || 'Admin'}</td>
                <td>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Draft'}</td>
                <td>
                  <span className={`status-pill ${blog.is_featured ? 'active' : 'inactive'}`}>
                    {blog.is_featured ? 'Featured' : 'Standard'}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${blog.is_published ? 'active' : 'inactive'}`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {blog.is_published && (
                      <a
                        className="action-btn"
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View post"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                    <button className="action-btn" onClick={() => openEdit(blog)} title="Edit blog">
                      <Edit size={14} />
                    </button>
                    <button className="action-btn danger" onClick={() => handleDelete(blog)} title="Delete blog">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && blogs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                  No blogs yet. Create the first post from here.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                  Loading blogs...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div className="admin-form-card" style={{ width: 860, maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24 }}>
                {editing ? 'Edit Blog' : 'Create New Blog'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Title *</label>
                <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} required placeholder="Enter blog title" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Excerpt</label>
                <textarea rows={3} value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} placeholder="Short summary for blog cards and SEO snippets" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Content *</label>
                <textarea rows={14} value={form.content} onChange={(e) => handleChange('content', e.target.value)} required placeholder="Write blog content here. Simple HTML like <p> and <strong> is supported." />
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input value={form.cover_image} onChange={(e) => handleChange('cover_image', e.target.value)} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label>Publish Date</label>
                <input type="datetime-local" value={form.published_at} onChange={(e) => handleChange('published_at', e.target.value)} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_published} onChange={(e) => handleChange('is_published', e.target.checked)} />
                Publish on storefront
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
                Mark as featured
              </label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Blog' : 'Create Blog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
