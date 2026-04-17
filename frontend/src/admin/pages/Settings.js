import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutTemplate,
  CreditCard,
  Truck,
  ShieldCheck,
  Heart,
  Mail,
  Upload,
  Search,
  Boxes,
} from 'lucide-react';

const cards = [
  {
    title: 'CMS & Content',
    description: 'Manage home banners, about page, blog structure, FAQs, and storefront menu content.',
    icon: <LayoutTemplate size={22} />,
    action: 'Open Menus',
    to: '/admin/menus',
    status: 'Active',
  },
  {
    title: 'Payments',
    description: 'Stripe checkout support is built into the codebase, and this area is the right place to connect Stripe keys or add Razorpay and other payment settings next.',
    icon: <CreditCard size={22} />,
    action: 'Configure',
    to: '/admin/settings',
    status: 'Foundation Ready',
  },
  {
    title: 'Shipping & Tax',
    description: 'Set shipping charges, free-shipping rules, tax slabs, dispatch defaults, and invoice preferences.',
    icon: <Truck size={22} />,
    action: 'Review',
    to: '/admin/orders',
    status: 'Needs Expansion',
  },
  {
    title: 'Inventory',
    description: 'Track stock, featured products, low-stock alerts, and catalog health from one place.',
    icon: <Boxes size={22} />,
    action: 'Manage Products',
    to: '/admin/products',
    status: 'Active',
  },
  {
    title: 'Roles & Permissions',
    description: 'Super admin and sub-admin support can be added here with role-based access controls.',
    icon: <ShieldCheck size={22} />,
    action: 'Plan Access',
    to: '/admin/users',
    status: 'Planned',
  },
  {
    title: 'Wishlist & Reviews',
    description: 'Customer wishlist behavior and review moderation are tied into your catalog and trust flow.',
    icon: <Heart size={22} />,
    action: 'Open Reviews',
    to: '/admin/reviews',
    status: 'Partially Active',
  },
  {
    title: 'Newsletter & Email',
    description: 'Order emails are already connected. Marketing email and newsletter tools can be added here next.',
    icon: <Mail size={22} />,
    action: 'Open Reports',
    to: '/admin/reports',
    status: 'Needs Expansion',
  },
  {
    title: 'Bulk Upload & SEO',
    description: 'CSV upload, meta tags, image optimization, and search visibility controls belong in this module.',
    icon: <Upload size={22} />,
    action: 'Open Catalog',
    to: '/admin/products',
    status: 'Planned',
  },
];

const Settings = () => {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Settings Hub</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 6, maxWidth: 760 }}>
            This admin structure now follows your requested layout more closely: Dashboard, Products, Categories,
            Orders, Users, Reviews, Coupons, Menus, Reports, and a central Settings area for the advanced modules.
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {cards.map((card) => (
          <div key={card.title} className="stat-card" style={{ alignItems: 'flex-start' }}>
            <div className="stat-icon gold">{card.icon}</div>
            <div className="stat-info" style={{ width: '100%' }}>
              <h3 style={{ fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>{card.title}</h3>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
                {card.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span className="status-pill pending">{card.status}</span>
                <Link to={card.to} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                  {card.action}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <div className="admin-table-header">
          <h3>Recommended Admin Tabs</h3>
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 14 }}>
          {[
            'Dashboard: totals, sales overview, recent orders, analytics summary.',
            'Products: add, edit, delete, images, pricing, stock, featured, healing properties.',
            'Categories: main categories, subcategories, product counts, category structure.',
            'Orders: statuses, payment state, invoices, dispatch flow, fulfillment monitoring.',
            'Users: customers, activation control, order history, future permissions support.',
            'Reviews & Coupons: moderation, ratings, discounts, offer controls.',
            'Settings: CMS, payments, shipping, taxes, roles, newsletter, SEO, bulk tools.',
          ].map((line) => (
            <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)' }}>
              <Search size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
