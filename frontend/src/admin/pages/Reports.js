import React, { useEffect, useState } from 'react';
import { Download, BarChart3, Users, Package2, ShoppingCart } from 'lucide-react';
import { reportAPI } from '../../services/api';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getOverview().then((res) => setReport(res)).finally(() => setLoading(false));
  }, []);

  const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

  const downloadOrdersCsv = () => {
    const token = localStorage.getItem('token');
    fetch('/api/reports/orders-csv', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'orders-report.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      });
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header"><h1>Reports</h1></div>
        <div className="stats-grid">{Array.from({ length: 4 }, (_, i) => <div key={i} className="stat-card shimmer" style={{ height: 100 }} />)}</div>
      </div>
    );
  }

  const { summary, salesByStatus = [], topCategories = [], topCustomers = [], salesByMonth = [] } = report || {};

  return (
    <div>
      <div className="admin-page-header">
        <h1>Reports</h1>
        <button className="btn btn-primary" onClick={downloadOrdersCsv}>
          <Download size={16} /> Download Orders CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <h3>Gross Revenue</h3>
            <p>{formatPrice(summary?.gross_revenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{summary?.total_orders || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Package2 size={24} /></div>
          <div className="stat-info">
            <h3>Delivered Orders</h3>
            <p>{summary?.delivered_orders || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Paid Revenue</h3>
            <p>{formatPrice(summary?.paid_revenue)}</p>
          </div>
        </div>
      </div>

      <div className="admin-grid-equal">
        <div className="admin-table-wrap">
          <div className="admin-table-header"><h3>Sales by Status</h3></div>
          <div style={{ padding: '12px 0' }}>
            {salesByStatus.map((item) => (
              <div key={item.status} className="admin-list-item">
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{item.status}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.count} orders</div>
                </div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatPrice(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header"><h3>Sales by Month</h3></div>
          <div style={{ padding: '12px 0' }}>
            {salesByMonth.map((item) => (
              <div key={item.month} className="admin-list-item">
                <div>
                  <div style={{ fontWeight: 700 }}>{item.month}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.orders} orders</div>
                </div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatPrice(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-grid-equal" style={{ marginBottom: 0 }}>
        <div className="admin-table-wrap">
          <div className="admin-table-header"><h3>Top Categories</h3></div>
          <div style={{ padding: '12px 0' }}>
            {topCategories.map((item, index) => (
              <div key={`${item.name}-${index}`} className="admin-list-item">
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name || 'Uncategorized'}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.items_sold} items sold</div>
                </div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatPrice(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header"><h3>Top Customers</h3></div>
          <div style={{ padding: '12px 0' }}>
            {topCustomers.map((item) => (
              <div key={item.email} className="admin-list-item">
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatPrice(item.spent)}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
