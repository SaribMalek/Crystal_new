import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock3, SendHorizonal } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactAPI } from '../../services/api';
import './Contact.css';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await contactAPI.submit(form);
      toast.success('Your message has been sent successfully');
      setForm(initialForm);
    } catch (err) {
      toast.error(err.message || 'Failed to send your message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-glow left" />
        <div className="contact-hero-glow right" />
        <div className="container">
          <div className="contact-hero-content">
            <span className="section-label">Contact Us</span>
            <h1>Reach out for product guidance, gifting help, or order support.</h1>
            <p>
              Fill out the form below and our team will get back to you. You can contact us for crystal recommendations,
              order questions, wholesale enquiries, or general support.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-details">
              <div className="contact-card">
                <Mail size={18} />
                <div>
                  <h3>Email</h3>
                  <p>support@ascrystal.com</p>
                </div>
              </div>
              <div className="contact-card">
                <Phone size={18} />
                <div>
                  <h3>Phone</h3>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-card">
                <MapPin size={18} />
                <div>
                  <h3>Location</h3>
                  <p>Mumbai, Maharashtra, India</p>
                </div>
              </div>
              <div className="contact-card">
                <Clock3 size={18} />
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday to Saturday, 10:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrap glass-card">
              <h2>Send Us a Message</h2>
              <p className="contact-form-copy">We usually respond within one business day.</p>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="contact-form-grid">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Order help, consultation, gifting..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary contact-submit" disabled={sending}>
                  <SendHorizonal size={16} /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
