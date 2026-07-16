import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { validateEmail } from '../utils/helpers';
import '../styles/Footer.css';

function Footer() {
  const { success, error, warning } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      warning('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      warning('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.subscribeNewsletter(email);
      success(`Successfully subscribed! Tech insights will be sent to ${email}.`);
      setEmail('');
    } catch (err) {
      error(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <Link to="/">
            <img src={process.env.PUBLIC_URL + "/images/logo.png"} alt="CloudMosaic Logo" className="footer-logo" />
          </Link>
          <p>Transforming businesses through cloud innovation and human expertise.</p>
          <p style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
            <i className="fas fa-phone-alt" style={{ color: 'var(--accent-color)' }} aria-hidden="true"></i> +1 (720) 221-7062
          </p>
          <div className="social-links">
            <a href="https://www.linkedin.com/company/cloudmosaic" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a>
            <a href="https://twitter.com/cloudmosaic" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fab fa-twitter" aria-hidden="true"></i></a>
            <a href="https://github.com/cloudmosaic" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github" aria-hidden="true"></i></a>
            <a href="https://www.facebook.com/cloudmosaic" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/services">Services</Link>
          <Link to="/products">Products</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-section">
          <h4>Our Services</h4>
          <Link to="/services">Cloud Migration</Link>
          <Link to="/services">Security & Compliance</Link>
          <Link to="/services">HR Consulting</Link>
          <Link to="/services">Web Development</Link>
        </div>
        <div className="footer-section">
          <h4>Newsletter</h4>
          <p>Subscribe for tech insights</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Subscribe to newsletter email"
              required
            />
            <button type="submit" disabled={isSubmitting} aria-label="Subscribe">
              {isSubmitting ? (
                <i className="fas fa-spinner fa-pulse" aria-hidden="true"></i>
              ) : (
                <i className="fas fa-paper-plane" aria-hidden="true"></i>
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 CloudMosaic. All Rights Reserved. | <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link></p>
      </div>
    </footer>
  );
}

export default Footer;