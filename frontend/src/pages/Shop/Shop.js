import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, X, Search, Sparkles } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Shop.css';

const CHAKRAS = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];

const Shop = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page'), 10) || 1,
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'DESC',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    featured: searchParams.get('featured') || '',
    chakra: searchParams.get('chakra') || '',
    category: category || searchParams.get('category') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });
      const res = await productAPI.getProducts(params);
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryAPI.getCategories().then((res) => setCategories(res.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (category) {
      setFilters((current) => ({ ...current, category, page: 1 }));
    }
  }, [category]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: key !== 'page' ? 1 : value }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      sort: 'created_at',
      order: 'DESC',
      min_price: '',
      max_price: '',
      featured: '',
      chakra: '',
      category: '',
    });
  };

  const currentCategory = categories.find((item) => item.slug === (category || filters.category));

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-header-bg" />
        <div className="container">
          <div className="shop-header-content">
            <nav className="breadcrumb">
              <Link to="/">Home</Link> <span>/</span>
              <Link to="/shop">Shop</Link>
              {currentCategory && <><span>/</span><span>{currentCategory.name}</span></>}
            </nav>
            <h1 className="page-title">{currentCategory ? currentCategory.name : 'All Crystals'}</h1>
            <p className="shop-subtitle">
              {currentCategory ? currentCategory.description : 'Discover our complete collection of healing crystals and spiritual tools'}
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shop-layout">
          <aside className={`shop-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="clear-filters" onClick={clearFilters}>Clear All</button>
            </div>

            <div className="filter-group">
              <h4>Categories</h4>
              <Link to="/shop" className={`filter-option ${!filters.category ? 'active' : ''}`} onClick={() => updateFilter('category', '')}>
                All Products <span>{total}</span>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/shop/${cat.slug}`} className={`filter-option ${filters.category === cat.slug ? 'active' : ''}`}>
                  {cat.name} <span>{cat.product_count || 0}</span>
                </Link>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min Rs." value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)} />
                <span>to</span>
                <input type="number" placeholder="Max Rs." value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)} />
              </div>
              <div className="quick-price-btns">
                {[['0-500', 0, 500], ['500-1000', 500, 1000], ['1000-2000', 1000, 2000], ['2000+', 2000, '']].map(([label, min, max]) => (
                  <button
                    key={label}
                    className="quick-price"
                    onClick={() => {
                      updateFilter('min_price', min);
                      updateFilter('max_price', max);
                    }}
                  >
                    Rs. {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Chakra</h4>
              {CHAKRAS.map((chakraName) => (
                <label key={chakraName} className="filter-checkbox">
                  <input
                    type="radio"
                    name="chakra"
                    checked={filters.chakra === chakraName}
                    onChange={() => updateFilter('chakra', filters.chakra === chakraName ? '' : chakraName)}
                  />
                  <span>{chakraName}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Special</h4>
              <label className="filter-checkbox">
                <input type="checkbox" checked={filters.featured === 'true'} onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')} />
                <span>Featured Only</span>
              </label>
            </div>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <div className="toolbar-left">
                <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal size={16} /> Filters
                  {showFilters && <X size={14} />}
                </button>
                <span className="results-count">
                  {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
                </span>
              </div>
              <div className="toolbar-right">
                <select
                  className="sort-select"
                  value={`${filters.sort}_${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('_');
                    updateFilter('sort', sort);
                    updateFilter('order', order);
                  }}
                >
                  <option value="created_at_DESC">Newest First</option>
                  <option value="created_at_ASC">Oldest First</option>
                  <option value="price_ASC">Price: Low to High</option>
                  <option value="price_DESC">Price: High to Low</option>
                  <option value="rating_DESC">Highest Rated</option>
                  <option value="name_ASC">Name: A-Z</option>
                </select>
                <div className="view-toggle">
                  <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid size={16} /></button>
                  <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={16} /></button>
                </div>
              </div>
            </div>

            <div className="shop-search-bar">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search within collection..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
              {filters.search && <button onClick={() => updateFilter('search', '')}><X size={14} /></button>}
            </div>

            {loading ? (
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {Array.from({ length: 8 }, (_, i) => <div key={i} className="product-skeleton shimmer" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon"><Sparkles size={26} /></div>
                <h3>No crystals found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1)}>{'<'} Prev</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  let page = i + 1;
                  if (pages > 7) {
                    if (filters.page <= 4) {
                      page = i + 1;
                    } else if (filters.page >= pages - 3) {
                      page = pages - 6 + i;
                    } else {
                      page = filters.page - 3 + i;
                    }
                  }
                  return (
                    <button key={page} className={`page-btn ${filters.page === page ? 'active' : ''}`} onClick={() => updateFilter('page', page)}>{page}</button>
                  );
                })}
                <button className="page-btn" disabled={filters.page >= pages} onClick={() => updateFilter('page', filters.page + 1)}>Next {'>'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
