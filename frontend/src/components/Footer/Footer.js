import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gem,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { useMenus } from '../../context/MenuContext';
import './Footer.css';

const Footer = () => {
  const { menus } = useMenus();
  const firstShopColumn = menus.shop[0];
  const secondShopColumn = menus.shop[2] || menus.shop[1];

  return (
  <footer className="footer">
    <div className="footer-glow" />
    <div className="container">
      <div className="footer-cta-band">
        <div>
          <span className="footer-band-label">Need help choosing?</span>
          <h3>Shop crystals by bracelets, jewellery, decor, gifting, self care, and guided services.</h3>
        </div>
        <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
      </div>

      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Gem size={30} className="footer-logo-icon" />
            <div>
              <span className="footer-logo-text">AS Crystal</span>
              <span className="footer-logo-sub">Light-first crystal storefront</span>
            </div>
          </Link>
          <p className="footer-desc">
            AS Crystal is a premium crystal boutique for healing stones, jewellery, decor, smudging essentials,
            self-care products, and gift-ready collections inspired by leading crystal stores.
          </p>
          <div className="footer-highlights">
            <span><ShieldCheck size={14} /> Authentic sourcing</span>
            <span><Clock3 size={14} /> Guided support</span>
          </div>
          <div className="footer-social">
            <a href="#!" className="social-btn"><Instagram size={18} /></a>
            <a href="#!" className="social-btn"><Facebook size={18} /></a>
            <a href="#!" className="social-btn"><Twitter size={18} /></a>
            <a href="#!" className="social-btn"><Youtube size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>{firstShopColumn?.title || 'Shop'}</h4>
          {(firstShopColumn?.items || []).map((item) => (
            <Link key={item.title} to={item.link}>{item.title}</Link>
          ))}
        </div>

        <div className="footer-links">
          <h4>{secondShopColumn?.title || 'Collections'}</h4>
          {(secondShopColumn?.items || []).map((item) => (
            <Link key={item.title} to={item.link}>{item.title}</Link>
          ))}
        </div>

        <div className="footer-links">
          <h4>Need Help?</h4>
          {menus.help.map((item) => (
            <Link key={item.title} to={item.link}>{item.title}</Link>
          ))}
        </div>

        <div className="footer-contact">
          <h4>Reach Us</h4>
          <div className="contact-item"><Clock3 size={16} /> <span>Working Hours: 10am to 6pm, Sunday closed</span></div>
          <div className="contact-item"><Mail size={16} /> <span>support@crystalaura.com</span></div>
          <div className="contact-item"><Phone size={16} /> <span>+91 98765 43210</span></div>
          <div className="contact-item"><MapPin size={16} /> <span>Mumbai, Maharashtra, India</span></div>
          <div className="footer-newsletter">
            <p>Get crystal guides, launch updates, and premium gifting inspiration.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright 2026 AS Crystal. Made with <Heart size={14} className="heart-icon" /> in India.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
