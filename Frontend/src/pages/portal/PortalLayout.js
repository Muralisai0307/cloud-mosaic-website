import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/portal/dashboard',  icon: 'fa-th-large',       label: 'Dashboard'  },
  { to: '/portal/profile',    icon: 'fa-building',        label: 'Profile'    },
  { to: '/portal/projects',   icon: 'fa-project-diagram', label: 'Projects'   },
  { to: '/portal/documents',  icon: 'fa-file-alt',        label: 'Documents'  },
  { to: '/portal/contracts',  icon: 'fa-file-contract',   label: 'Contracts'  },
  { to: '/portal/invoices',   icon: 'fa-file-invoice-dollar', label: 'Invoices' },
  { to: '/portal/payments',   icon: 'fa-credit-card',     label: 'Payments'   },
  { to: '/portal/meetings',   icon: 'fa-calendar-alt',    label: 'Meetings'   },
  { to: '/portal/support',    icon: 'fa-headset',         label: 'Support'    },
  { to: '/portal/settings',   icon: 'fa-cog',             label: 'Settings'   },
];

const SIDEBAR_W = 250;

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebar = (
    <aside style={{
      width: SIDEBAR_W,
      minHeight: '100vh',
      background: 'var(--card-bg)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: sidebarOpen ? 0 : -SIDEBAR_W,
      zIndex: 200,
      transition: 'left 0.28s ease',
      boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
    }}>
      {/* Sidebar brand */}
      <div style={{
        padding: '1.5rem 1.25rem 1rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 40, height: 40,
          background: 'var(--accent-gradient)',
          borderRadius: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontSize: '1.1rem', flexShrink: 0,
        }}>
          <i className="fas fa-cloud"></i>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>
            CloudMosaic
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Client Portal
          </p>
        </div>
      </div>

      {/* User info */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase() || 'C'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.username}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.65rem 1.25rem',
              textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
              borderRight: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
              transition: 'all 0.18s',
            })}
          >
            <i className={`fas ${icon}`} style={{ width: 18, textAlign: 'center' }}></i>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '0.65rem', background: 'transparent',
          border: '1.5px solid var(--glass-border)', borderRadius: 8,
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem',
          fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Sidebar */}
      {sidebar}

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199,
        }} />
      )}

      {/* Main content area pushed right of sidebar (desktop) */}
      <div style={{ flex: 1, marginLeft: SIDEBAR_W, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          height: 60,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.5rem', gap: '1rem',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '1.1rem', padding: 4,
            }}
          >
            <i className="fas fa-bars"></i>
          </button>

          <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', flex: 1 }}>
            Client Portal
          </span>

          <a href="/" style={{
            fontSize: '0.825rem', color: 'var(--text-secondary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <i className="fas fa-external-link-alt"></i> Back to site
          </a>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem 1.75rem', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
