import React from 'react';

function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading content. Please try again.', 
  onRetry 
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    textAlign: 'center',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '15px',
    boxShadow: 'var(--card-shadow)',
    margin: '2rem auto',
    maxWidth: '500px',
  };

  const iconStyle = {
    fontSize: '3rem',
    color: 'var(--error-color)',
    marginBottom: '1.5rem',
  };

  const buttonStyle = {
    marginTop: '1.5rem',
    padding: '0.6rem 1.5rem',
    backgroundColor: 'var(--accent-color)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  };

  return (
    <div style={containerStyle} className="error-state">
      <i className="fas fa-exclamation-triangle" style={iconStyle} aria-hidden="true"></i>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{message}</p>
      {onRetry && (
        <button 
          style={buttonStyle} 
          onClick={onRetry} 
          onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <i className="fas fa-redo"></i> Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
