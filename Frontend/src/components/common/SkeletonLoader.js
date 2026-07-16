import React from 'react';

function SkeletonLoader({ variant = 'card', count = 1 }) {
  const getLoaderStyle = () => {
    return {
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '15px',
      padding: '2rem',
      boxShadow: 'var(--card-shadow)',
      marginBottom: '1.5rem',
      animation: 'pulse 1.5s infinite ease-in-out',
    };
  };

  const getLineStyle = (width, height = '15px') => {
    return {
      height,
      width,
      backgroundColor: 'var(--glass-border)',
      borderRadius: '4px',
      marginBottom: '10px',
    };
  };

  const renderSkeleton = (key) => {
    if (variant === 'text') {
      return (
        <div key={key} style={{ animation: 'pulse 1.5s infinite ease-in-out', margin: '1rem 0' }}>
          <div style={getLineStyle('100%', '20px')} />
          <div style={getLineStyle('90%')} />
          <div style={getLineStyle('75%')} />
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div key={key} style={getLoaderStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--glass-border)' }} />
            <div style={{ flex: 1 }}>
              <div style={getLineStyle('60%', '18px')} />
              <div style={getLineStyle('40%', '12px')} />
            </div>
          </div>
          <div style={getLineStyle('100%')} />
          <div style={getLineStyle('95%')} />
          <div style={getLineStyle('70%')} />
        </div>
      );
    }

    if (variant === 'list') {
      return (
        <div key={key} style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid var(--glass-border)', gap: '15px', animation: 'pulse 1.5s infinite ease-in-out' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--glass-border)' }} />
          <div style={{ flex: 1 }}>
            <div style={getLineStyle('40%', '14px')} />
            <div style={getLineStyle('80%', '12px')} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
}

export default SkeletonLoader;
