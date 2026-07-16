import React from 'react';
import { Helmet } from 'react-helmet-async';

function ErrorPage({ error, onReset }) {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: 'var(--bg-body)',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
    textAlign: 'center',
  };

  const cardStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '3rem 2rem',
    boxShadow: 'var(--card-shadow)',
    maxWidth: '550px',
    width: '100%',
    backdropFilter: 'blur(10px)',
  };

  const iconStyle = {
    fontSize: '4rem',
    background: 'linear-gradient(135deg, #ef4444, #f97316)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1.5rem',
  };

  const buttonStyle = {
    padding: '0.8rem 2rem',
    background: 'var(--accent-gradient)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const handleReload = () => {
    if (onReset) {
      onReset();
    }
    window.location.href = '/';
  };

  return (
    <>
      <Helmet>
        <title>Error occurred - CloudMosaic</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <i className="fas fa-exclamation-triangle" style={iconStyle} aria-hidden="true"></i>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            We apologize for the inconvenience. An unexpected error has occurred in the application.
          </p>
          {error && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
              maxHeight: '150px',
            }}>
              {error.toString()}
            </div>
          )}
          <button 
            style={buttonStyle} 
            onClick={handleReload}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
            }}
          >
            <i className="fas fa-home"></i> Go to Homepage
          </button>
        </div>
      </div>
    </>
  );
}

export default ErrorPage;
