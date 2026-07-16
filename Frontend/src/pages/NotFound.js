import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function NotFound() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const containerStyle = {
    padding: '120px 20px',
    textAlign: 'center',
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-body)',
  };

  const cardStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '4rem 2rem',
    boxShadow: 'var(--card-shadow)',
    maxWidth: '600px',
    width: '100%',
    backdropFilter: 'blur(10px)',
  };

  const codeStyle = {
    fontSize: '6rem',
    fontWeight: '800',
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
    marginBottom: '1rem',
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found - CloudMosaic</title>
        <meta name="description" content="The page you are looking for does not exist on CloudMosaic." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />
      
      <div style={containerStyle}>
        <div style={cardStyle} data-aos="zoom-in">
          <div style={codeStyle}>404</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            We're sorry, but the page you are looking for doesn't exist or has been moved to another URL.
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2.5rem', textDecoration: 'none', display: 'inline-block' }}>
            <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default NotFound;
