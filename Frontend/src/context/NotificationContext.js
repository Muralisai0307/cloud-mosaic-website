import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

const NotificationContext = createContext(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  // Helper methods
  const success = useCallback((msg, dur) => showNotification(msg, 'success', dur), [showNotification]);
  const error = useCallback((msg, dur) => showNotification(msg, 'error', dur), [showNotification]);
  const warning = useCallback((msg, dur) => showNotification(msg, 'warning', dur), [showNotification]);
  const info = useCallback((msg, dur) => showNotification(msg, 'info', dur), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      {ReactDOM.createPortal(
        <div className="notification-container" style={containerStyle} aria-live="assertive">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`notification notification-${n.type}`} 
              style={{ ...notificationStyle, ...typeStyles[n.type] }}
            >
              <i className={`fas ${iconMap[n.type] || 'fa-info-circle'}`} style={{ marginRight: '10px' }} aria-hidden="true"></i>
              <span>{n.message}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
}

// Inline styles for toast system (so it works out-of-the-box and handles light/dark transitions via CSS variables)
const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 10000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '350px',
  width: 'calc(100% - 40px)',
  pointerEvents: 'none',
};

const notificationStyle = {
  padding: '1rem 1.25rem',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  color: 'var(--text-primary)',
  boxShadow: 'var(--card-shadow)',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.95rem',
  pointerEvents: 'auto',
  animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const typeStyles = {
  success: {
    borderLeft: '4px solid var(--success-color)',
  },
  error: {
    borderLeft: '4px solid var(--error-color)',
  },
  warning: {
    borderLeft: '4px solid var(--warning-color)',
  },
  info: {
    borderLeft: '4px solid var(--accent-color)',
  },
};

const iconMap = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle',
};

// Add slideIn animation style
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(100%) translateY(-20px); opacity: 0; }
      to { transform: translateX(0) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
}
