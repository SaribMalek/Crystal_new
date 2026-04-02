import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays } from 'lucide-react';
import { blogAPI } from '../../services/api';
import './Blog.css';

const fallbackBlogs = [
  {
    id: 'fallback-1',
    slug: 'how-to-choose-your-first-healing-crystal',
    title: 'How to Choose Your First Healing Crystal',
    excerpt: 'A beginner-friendly starting point for choosing crystals by intention, energy, and everyday use.',
    cover_image: 'https://images.unsplash.com/photo-1518301181949-fd2a09558d2b?w=1200&q=80',
    author_name: 'AS Crystal',
    published_at: '2026-03-10 09:00:00',
    is_featured: true,
  },
];

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const res = await blogAPI.getBlogs();
        setBlogs(res.blogs?.length ? res.blogs : fallbackBlogs);
        setError('');
      } catch (err) {
        setBlogs(fallbackBlogs);
        setError(err.message || 'Blog service is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const featuredBlog = useMemo(
    () => blogs.find((blog) => blog.is_featured) || blogs[0],
    [blogs]
  );
  const otherBlogs = useMemo(
    () => blogs.filter((blog) => blog.id !== featuredBlog?.id),
    [blogs, featuredBlog]
  );

  return (
    <div className="blog-page">
      <section className="blog-hero container reveal-up">
        <span className="blog-eyebrow">Crystal Journal</span>
        <h1 className="blog-title">Stories, guides, and rituals to support your crystal journey.</h1>
        <p className="blog-intro">
          Keep your storefront blog active with crystal education, gifting ideas, cleansing rituals, and beginner-friendly buying guides.
        </p>
      </section>

      {error && (
        <div className="container">
          <div className="blog-notice">{error} Showing starter content for now.</div>
        </div>
      )}

      <section className="container blog-section">
        {loading ? (
          <div className="blog-loading glass-card">Loading blog posts...</div>
        ) : (
          <>
            {featuredBlog && (
              <Link to={`/blog/${featuredBlog.slug}`} className="blog-featured glass-card reveal-scale">
                <div className="blog-featured-media">
                  {featuredBlog.cover_image ? (
                    <img src={featuredBlog.cover_image} alt={featuredBlog.title} />
                  ) : (
                    <div className="blog-image-fallback"><BookOpen size={32} /></div>
                  )}
                </div>
                <div className="blog-featured-content">
                  <span className="blog-chip">Featured Post</span>
                  <h2>{featuredBlog.title}</h2>
                  <p>{featuredBlog.excerpt}</p>
                  <div className="blog-meta">
                    <span><CalendarDays size={14} /> {new Date(featuredBlog.published_at || Date.now()).toLocaleDateString()}</span>
                    <span>{featuredBlog.author_name || 'AS Crystal'}</span>
                  </div>
                  <span className="blog-read-link">Read article <ArrowRight size={16} /></span>
                </div>
              </Link>
            )}

            <div className="blog-grid">
              {otherBlogs.map((blog) => (
                <Link to={`/blog/${blog.slug}`} key={blog.id} className="blog-card glass-card reveal-up">
                  <div className="blog-card-media">
                    {blog.cover_image ? (
                      <img src={blog.cover_image} alt={blog.title} />
                    ) : (
                      <div className="blog-image-fallback"><BookOpen size={26} /></div>
                    )}
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-meta">
                      <span><CalendarDays size={14} /> {new Date(blog.published_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt || 'Explore this article on crystals, gifting, and mindful rituals.'}</p>
                    <span className="blog-read-link">Read more <ArrowRight size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Blog;
