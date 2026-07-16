import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { validateEmail } from '../utils/helpers';
import '../styles/Contact.css';

function Contact() {
  const { success, error, warning } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!name.trim()) {
      warning('Please enter your name.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      warning('Please enter a valid email address.');
      return;
    }
    if (!service) {
      warning('Please select a service interest.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      warning('Please enter a message of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitContactForm({ name, email, service, message });
      success('Thank you for your message! We will get back to you soon.');
      
      // Reset form fields
      setName('');
      setEmail('');
      setService('');
      setMessage('');
    } catch (err) {
      error(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - CloudMosaic</title>
        <meta name="description" content="Reach out to our cloud support team or schedule a consultation with an integration specialist." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/contact" />
      </Helmet>
      <Header />
      
      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Contact Us</h1>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info" data-aos="fade-right">
              <h2 className="section-title">Get In Touch</h2>
              <p className="contact-lead">Have a question or need a consultation? Reach out to us anytime.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <i className="fas fa-phone-alt" aria-hidden="true"></i>
                  <div>
                    <h4>Call Us</h4>
                    <p>+1 (720) 221-7062</p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                  <div>
                    <h4>Email Us</h4>
                    <p>hr@cloudmosaic.ai</p>
                    <p>support@cloudmosaic.ai</p>
                  </div>
                </div>
              </div>

              <div className="business-hours">
                <h4>Business Hours</h4>
                <p><i className="far fa-clock" aria-hidden="true"></i> Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p><i className="far fa-clock" aria-hidden="true"></i> Saturday: 10:00 AM - 2:00 PM</p>
                <p><i className="far fa-clock" aria-hidden="true"></i> Sunday: Closed (Emergency support available)</p>
              </div>
              
              {/* ===== TRUST BADGES AS TEXT ===== */}
              <div className="trust-badges">
                <span className="trust-badge">🔒 SSL Secure</span>
                <span className="trust-badge">✅ GDPR Compliant</span>
                <span className="trust-badge">📜 ISO Certified</span>
              </div>
            </div>

            <form className="contact-form" data-aos="fade-left" data-aos-delay="200" onSubmit={handleSubmit}>
              <h3>Send us a Message</h3>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Your Name"
                />
                <i className="fas fa-user" aria-hidden="true"></i>
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Your Email"
                />
                <i className="fas fa-envelope" aria-hidden="true"></i>
              </div>
              <div className="form-group">
                <select 
                  required 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  aria-label="Select Service Interest"
                >
                  <option value="">Select Service Interest</option>
                  <option value="cloud">Cloud Services</option>
                  <option value="hr">HR Consulting</option>
                  <option value="web">Web Development</option>
                  <option value="security">Security</option>
                  <option value="products">Products</option>
                  <option value="careers">Careers</option>
                  <option value="other">Other</option>
                </select>
                <i className="fas fa-tag" aria-hidden="true"></i>
              </div>
              <div className="form-group">
                <textarea 
                  placeholder="Your Message" 
                  rows="5" 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-label="Your Message"
                ></textarea>
                <i className="fas fa-comment" aria-hidden="true"></i>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Sending... <i className="fas fa-spinner fa-pulse" aria-hidden="true"></i></>
                ) : (
                  <>Send Message <i className="fas fa-paper-plane" aria-hidden="true"></i></>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CONTACT SUPPORT CTA SECTION */}
      <section className="contact-support-section" style={{ paddingBottom: '80px' }}>
        <div className="container">
          <div className="contact-support-card"
            style={{
              padding: '3.5rem 2rem',
              background: 'var(--glass-bg)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-headset"
                style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '1rem' }} aria-hidden="true"></i>
              <h3>Direct Customer Support</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0', maxWidth: '600px', lineHeight: '1.6' }}>
                Have inquiries about our enterprise solutions? Reach out directly to our dedicated support representatives.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: '600', marginTop: '1rem' }}>
                <i className="fas fa-phone-alt" style={{ color: 'var(--accent-color)', marginRight: '8px' }} aria-hidden="true"></i> +1 (720) 221-7062
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;