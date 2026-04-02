import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { blogAPI } from '../../services/api';
import './Blog.css';

const fallbackBlog = {
  title: 'Blog post not available yet',
  excerpt: 'This article will appear here once the backend blog data is available.',
  content: '<p>The blog detail page is ready. After you run the setup and create posts from admin, each article will load here automatically.</p>',
  author_name: 'AS Crystal',
  published_at: new Date().toISOString(),
  cover_image: '',
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      try {
        const res = await blogAPI.getBlog(slug);
        setBlog(res.blog || fallbackBlog);
        setError('');
      } catch (err) {
        setBlog(fallbackBlog);
        setError(err.message || 'This blog could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="container blog-detail-wrap">
        <div className="blog-loading glass-card">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="container blog-detail-wrap">
      <Link to="/blog" className="blog-back-link"><ArrowLeft size={16} /> Back to Blog</Link>

      {error && <div className="blog-notice" style={{ marginBottom: 20 }}>{error}</div>}

      <article className="blog-article glass-card reveal-up">
        {blog.cover_image && (
          <div className="blog-article-cover">
            <img src={blog.cover_image} alt={blog.title} />
          </div>
        )}
        <div className="blog-article-body">
          <h1>{blog.title}</h1>
          <p className="blog-article-excerpt">{blog.excerpt}</p>
          <div className="blog-meta">
            <span><CalendarDays size={14} /> {new Date(blog.published_at || Date.now()).toLocaleDateString()}</span>
            <span><User size={14} /> {blog.author_name || 'AS Crystal'}</span>
          </div>
          <div
            className="blog-richtext"
            dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content available.</p>' }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
