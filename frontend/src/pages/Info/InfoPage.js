import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './InfoPage.css';

const InfoPage = ({ eyebrow, title, intro, sections = [] }) => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="info-hero-glow info-hero-glow-left" />
        <div className="info-hero-glow info-hero-glow-right" />
        <div className="container">
          <div className="info-hero-content">
            <span className="section-label">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="info-hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Shop Collection <ArrowRight size={16} />
              </Link>
              <Link to="/faq" className="btn btn-secondary">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="info-sections">
        <div className="container">
          <div className="info-grid">
            {sections.map((section) => (
              <article className="info-card" key={section.title}>
                <div className="info-card-icon">
                  <Sparkles size={18} />
                </div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
