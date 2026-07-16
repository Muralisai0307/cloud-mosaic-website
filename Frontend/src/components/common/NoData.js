import React from 'react';

function NoData({ message = 'No data available.' }) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    color: 'var(--text-secondary)',
    background: 'var(--glass-bg)',
    border: '1px dashed var(--glass-border)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    textAlign: 'center',
    width: '100%',
  };

  return (
    <div style={containerStyle} className="no-data-placeholder">
      <i className="fas fa-info-circle" style={{ marginRight: '8px' }} aria-hidden="true"></i>
      {message}
    </div>
  );
}

export default NoData;
