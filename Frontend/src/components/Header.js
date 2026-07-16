import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('cloudmosaic-theme');
    if (stored === 'dark' || stored === 'light') return stored === 'dark';
    return document.body.classList.contains('dark-theme') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('cloudmosaic-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-left">
        <Link to="/">
          <img src={process.env.PUBLIC_URL + "/images/logo.png"} alt="CloudMosaic Logo" className="logo" />
        </Link>
      </div>

      <nav className="nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
        <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>Services</Link>
        <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>Products</Link>
        <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>Projects</Link>
        <Link to="/testimonials" className={`nav-link ${location.pathname === '/testimonials' ? 'active' : ''}`}>Testimonials</Link>
        <Link to="/team" className={`nav-link ${location.pathname === '/team' ? 'active' : ''}`}>Team</Link>
        <Link to="/careers" className={`nav-link ${location.pathname === '/careers' ? 'active' : ''}`}>Careers</Link>
        <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>

        {/* Client Portal auth controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/portal/dashboard"
              id="header-portal-link"
              style={{
                padding: '0.45rem 1rem',
                background: 'var(--accent-gradient)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
              }}
            >
              <i className="fas fa-th-large"></i> Dashboard
            </Link>
            <button
              id="header-logout-btn"
              onClick={handleLogout}
              title={`Logout (${user.username})`}
              style={{
                padding: '0.45rem 0.8rem',
                background: 'transparent',
                border: '1.5px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.color = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            id="header-login-link"
            style={{
              padding: '0.45rem 1.1rem',
              background: 'var(--accent-gradient)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
            }}
          >
            <i className="fas fa-sign-in-alt"></i> Client Login
          </Link>
        )}

        <button 
          className="theme-toggle" 
          onClick={() => setIsDark(!isDark)}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          aria-pressed={isDark}
        >
          <div className="toggle-track">
            <div className="toggle-thumb" aria-hidden="true"></div>
            <i className="fas fa-sun toggle-sun" aria-hidden="true"></i>
            <i className="fas fa-moon toggle-moon" aria-hidden="true"></i>
          </div>
          <span className="toggle-text">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </nav>

      <div className="logo-right">
        <img src={process.env.PUBLIC_URL + "/images/wmb-logo.png"} alt="WMB Logo" className="logo" />
      </div>
    </header>
  );
}

export default Header;