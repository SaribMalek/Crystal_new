import React, { useState, useEffect } from 'react';
import { CheckCircle, Trash2, Star } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    reviewAPI.getPendingReviews().then((res) => setReviews(res.reviews || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await reviewAPI.approveReview(id); toast.success('Review approved!'); load(); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await reviewAPI.deleteReview(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Pending Reviews <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>({reviews.length})</span></h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', padding: 40 }}>Loading...</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <CheckCircle size={64} style={{ color: 'rgba(134,239,172,0.3)', marginBottom: 20 }} />
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>No pending reviews to approve</p>
        </div>
      ) : (
        <div className="admin-panel-stack">
          {reviews.map((r) => (
            <div key={r.id} className="admin-form-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{r.user_name?.[0]?.toUpperCase()}</div>
                    <div>
                      <strong style={{ fontSize: 14 }}>{r.user_name}</strong>
                      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} size={12} fill={i < r.rating ? '#fbbf24' : 'none'} color={i < r.rating ? '#fbbf24' : '#374151'} />)}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-accent-light)', background: 'rgba(155,89,217,0.1)', padding: '3px 10px', borderRadius: 20 }}>
                      {r.product_name}
                    </span>
                  </div>
                  {r.title && <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.title}</p>}
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{r.body}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => approve(r.id)}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="action-btn danger" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
