import React from 'react';

function EmptyState({ title = 'No data found', message = 'There are no items to display at this time.', icon = 'fa-folder-open' }) {
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
    color: 'var(--text-secondary)',
    opacity: 0.7,
    marginBottom: '1.5rem',
  };

  return (
    <div style={containerStyle} className="empty-state">
      <i className={`fas ${icon}`} style={iconStyle} aria-hidden="true"></i>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

export default EmptyState;
