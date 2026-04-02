import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Sparkles,
  ChevronDown,
  MoonStar,
  Gift,
  Flower2,
  Gem,
  HeartHandshake,
  SunMedium,
} from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const categoryIcons = {
  'tumbled-stones': Gem,
  'raw-crystals': Sparkles,
  'crystal-pendants': Gift,
  'crystal-clusters': SunMedium,
  'crystal-spheres': MoonStar,
  'gift-sets': HeartHandshake,
  'sage-cleansing': Flower2,
  'chakra-sets': Star,
};

const intentionCollections = [
  {
    title: 'Protection and grounding',
    description: 'Black tourmaline, smoky quartz, and raw stones for calm, energetic boundaries.',
    link: '/shop?search=protection',
  },
  {
    title: 'Love and emotional healing',
    description: 'Rose quartz gifting pieces, heart shapes, and soft ritual companions.',
    link: '/shop?search=rose',
  },
  {
    title: 'Abundance and confidence',
    description: 'Golden citrine, pyrite, and solar plexus selections for uplifted spaces.',
    link: '/shop?search=citrine',
  },
];

const ritualSteps = [
  {
    title: 'Choose with intention',
    text: 'Shop by chakra, gifting moment, or emotional goal instead of guessing.',
  },
  {
    title: 'Create a daily ritual',
    text: 'Pair crystals with journaling, meditation, or desk styling for everyday use.',
  },
  {
    title: 'Gift beautifully',
    text: 'Turn collections into meaningful presents with premium packaging and bundle ideas.',
  },
];

const crystalHighlights = [
  { name: 'Amethyst', description: 'Calm, intuition, and restful atmosphere.' },
  { name: 'Rose Quartz', description: 'Gentle emotional balance and heart-led rituals.' },
  { name: 'Citrine', description: 'Warmth, optimism, and abundance-focused spaces.' },
  { name: 'Black Tourmaline', description: 'Grounding support for home and work environments.' },
];

const fallbackCategories = [
  { id: 'gift-sets', slug: 'gift-sets', name: 'Gift Sets', product_count: 0 },
  { id: 'raw-crystals', slug: 'raw-crystals', name: 'Raw Crystals', product_count: 0 },
  { id: 'tumbled-stones', slug: 'tumbled-stones', name: 'Tumbled Stones', product_count: 0 },
  { id: 'chakra-sets', slug: 'chakra-sets', name: 'Chakra Sets', product_count: 0 },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const [productResult, categoryResult] = await Promise.allSettled([
        productAPI.getFeatured(),
        categoryAPI.getCategories(),
      ]);

      if (productResult.status === 'fulfilled') {
        setFeatured(productResult.value.products || []);
      } else {
        setFeatured([]);
      }

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.categories || fallbackCategories);
      } else {
        setCategories(fallbackCategories);
      }

      setBackendUnavailable(
        productResult.status === 'rejected' || categoryResult.status === 'rejected'
      );
      setLoading(false);
    };

    loadHomeData();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Curated crystals, ritual tools, and elevated gifting</span>
            </div>
            <h1 className="hero-title">
              Build a crystal store experience that feels
              <span className="hero-highlight"> calm, premium, and trustworthy.</span>
            </h1>
            <p className="hero-desc">
              Discover ethically curated healing crystals, premium gemstone decor, and thoughtful gift-ready pieces.
              AS Crystal is designed to help shoppers browse by category, intention, and energy with confidence.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary hero-cta">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn Our Story
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">200+</span><span className="stat-label">Crystal varieties</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">4.9</span><span className="stat-label">Average rating</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">Gift-ready</span><span className="stat-label">Premium packaging feel</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-panel hero-main-panel">
              <div className="hero-panel-copy">
                <span className="hero-panel-label">Featured focus</span>
                <h3>Premium crystals for rituals, decor, and meaningful gifting</h3>
              </div>
              <img
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=900&q=80"
                alt="Premium crystal collection"
              />
            </div>
            <div className="hero-mini-cards">
              <div className="hero-panel mini-card">
                <MoonStar size={18} />
                <div>
                  <strong>By intention</strong>
                  <span>Love, clarity, grounding, abundance</span>
                </div>
              </div>
              <div className="hero-panel mini-card">
                <Gift size={18} />
                <div>
                  <strong>By gifting</strong>
                  <span>Bundles, chakra sets, premium keepsakes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="#categories" className="scroll-indicator">
          <ChevronDown size={20} />
        </a>
      </section>

      <section className="trust-section">
        <div className="container">
          {backendUnavailable && (
            <div className="status-banner">
              The frontend is running. Live products will appear automatically once the backend and database are connected.
            </div>
          )}
          <div className="trust-grid">
            {[
              { icon: <Truck size={24} />, title: 'Fast shipping', desc: 'Clear dispatch and delivery expectations' },
              { icon: <Shield size={24} />, title: 'Authentic selection', desc: 'Thoughtfully curated crystal inventory' },
              { icon: <RefreshCw size={24} />, title: 'Simple returns', desc: 'A cleaner, more trustworthy shopping flow' },
              { icon: <Star size={24} />, title: 'Gift-worthy design', desc: 'Premium look across every touchpoint' },
            ].map((item) => (
              <div className="trust-item" key={item.title}>
                <div className="trust-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Shop by Type</span>
            <h2 className="section-title">A clearer category experience</h2>
            <p className="section-subtitle">Inspired by strong crystal storefronts, but designed to feel cleaner and more premium.</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Gem;
              return (
                <Link key={cat.id} to={`/shop/${cat.slug}`} className="category-card">
                  <div className="category-icon"><Icon size={28} /></div>
                  <h4>{cat.name}</h4>
                  <p>{cat.product_count || 0} products</p>
                  <div className="category-arrow"><ArrowRight size={16} /></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section intention-section">
        <div className="container">
          <div className="section-header align-left">
            <span className="section-label">Shop by Intention</span>
            <h2 className="section-title">Help customers discover crystals by feeling, not only by name.</h2>
          </div>
          <div className="intention-grid">
            {intentionCollections.map((item) => (
              <Link key={item.title} to={item.link} className="intention-card">
                <span className="intention-label">Collection</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="intention-link">Explore <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hand-picked for You</span>
            <h2 className="section-title">Featured Crystals</h2>
            <p className="section-subtitle">Our strongest products should look polished, giftable, and easy to buy.</p>
          </div>
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="product-skeleton shimmer" />)}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
          <div className="section-footer">
            <Link to="/shop" className="btn btn-secondary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container">
          <div className="benefits-inner">
            <div className="benefits-text">
              <span className="section-label">Ritual Flow</span>
              <h2>Guide shoppers from discovery to ritual in a simple, elegant way.</h2>
              <p>
                A professional crystal site should educate gently. This section helps explain how products fit into
                gifting, home styling, spiritual routines, and first-time crystal buying.
              </p>
              <Link to="/faq" className="btn btn-primary">Read FAQ</Link>
            </div>
            <div className="ritual-steps">
              {ritualSteps.map((step, index) => (
                <div className="ritual-card" key={step.title}>
                  <span className="ritual-number">0{index + 1}</span>
                  <div>
                    <h5>{step.title}</h5>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section crystal-library-section">
        <div className="container crystal-library">
          <div className="section-header align-left">
            <span className="section-label">Popular Stones</span>
            <h2 className="section-title">Build trust with clear crystal guidance.</h2>
          </div>
          <div className="crystal-library-grid">
            {crystalHighlights.map((item) => (
              <div className="crystal-library-card" key={item.name}>
                <div className="crystal-library-icon"><Sparkles size={18} /></div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Customer Stories</span>
            <h2 className="section-title">What shoppers want from a crystal brand</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                name: 'Priya S.',
                text: 'The collection feels carefully curated, not overwhelming. It is easy to find products for gifting and personal use.',
                product: 'Gift-ready crystal set',
              },
              {
                name: 'Rahul M.',
                text: 'The site feels more premium when the navigation is clear and the product cards look this polished.',
                product: 'Raw crystal cluster',
              },
              {
                name: 'Anita K.',
                text: 'I like being able to browse by intention and chakra. That makes the shopping journey much easier for beginners.',
                product: 'Chakra set',
              },
            ].map((testimonial) => (
              <div className="testimonial-card" key={testimonial.name}>
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.name[0]}</div>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>Interested in: {testimonial.product}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-glow" />
        <div className="container">
          <div className="cta-content">
            <Sparkles size={40} className="cta-icon" />
            <h2>Start your upgraded crystal storefront experience today.</h2>
            <p>Explore categories, featured pieces, gifting ideas, and brand pages that now feel much closer to a professional launch.</p>
            <Link to="/shop" className="btn btn-primary cta-btn">Shop Now <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
