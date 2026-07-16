import React from 'react';

function Loading({ fullPage = false, size = 'medium' }) {
  const spinnerSize = size === 'small' ? '24px' : size === 'large' ? '64px' : '40px';
  const borderSize = size === 'small' ? '3px' : size === 'large' ? '6px' : '4px';

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `${borderSize} solid var(--glass-border)`,
    borderTop: `${borderSize} solid var(--accent-color)`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-body)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        width: '100%',
      };

  return (
    <div style={containerStyle} className="loading-container">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} aria-label="Loading content" role="status"></div>
    </div>
  );
}

export default Loading;
