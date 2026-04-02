import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { orderAPI } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getDashboardStats().then((res) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header"><h1>Dashboard</h1></div>
        <div className="stats-grid">{Array.from({ length: 4 }, (_, i) => <div key={i} className="stat-card shimmer" style={{ height: 100 }} />)}</div>
      </div>
    );
  }

  const { stats, recentOrders, topProducts, monthlySales } = data || {};
  const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Welcome back, Admin</span>
      </div>

      <div className="stats-grid">
        {[
          { icon: <DollarSign size={24} />, color: 'gold', label: 'Total Revenue', value: formatPrice(stats?.totalRevenue) },
          { icon: <ShoppingBag size={24} />, color: 'purple', label: 'Total Orders', value: stats?.totalOrders || 0 },
          { icon: <Package size={24} />, color: 'green', label: 'Active Products', value: stats?.totalProducts || 0 },
          { icon: <Users size={24} />, color: 'blue', label: 'Customers', value: stats?.totalUsers || 0 },
        ].map((item) => (
          <div className="stat-card" key={item.label}>
            <div className={`stat-icon ${item.color}`}>{item.icon}</div>
            <div className="stat-info">
              <h3>{item.label}</h3>
              <p>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3><TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Monthly Sales</h3>
          </div>
          <div style={{ padding: 24 }}>
            {monthlySales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySales} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" />
                  <XAxis dataKey="month" tick={{ fill: '#72675d', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#72675d', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(110,88,58,0.14)', borderRadius: 8, color: '#2e251d' }} />
                  <Bar dataKey="revenue" fill="url(#gold)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dfc189" />
                      <stop offset="100%" stopColor="#b98a3c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>No sales data yet</p>
            )}
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header"><h3>Top Products</h3></div>
          <div style={{ padding: '8px 0' }}>
            {topProducts?.length > 0 ? topProducts.map((product, index) => (
              <div key={product.name || index} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(185,138,60,0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{product.sold} sold</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(product.revenue)}</span>
              </div>
            )) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>View All <Eye size={14} /></Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentOrders?.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><Link to={`/admin/orders/${order.id}`} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>#{order.order_number}</Link></td>
                  <td>{order.user_name || 'Guest'}</td>
                  <td style={{ fontWeight: 700 }}>{formatPrice(order.total)}</td>
                  <td><span className={`status-pill ${order.status}`}>{order.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
