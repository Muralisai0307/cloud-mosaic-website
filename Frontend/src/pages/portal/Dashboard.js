import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
      borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center',
      gap: '1.25rem', transition: 'all 0.25s', cursor: 'pointer',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--card-hover-shadow)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', color: '#fff', flexShrink: 0,
      }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{label}</p>
      </div>
    </div>
  </Link>
);

const SectionCard = ({ title, icon, children }) => (
  <div style={{
    background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
  }}>
    <h3 style={{
      fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
      margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
    }}>
      <i className={`fas ${icon}`} style={{ color: 'var(--accent-color)' }}></i>
      {title}
    </h3>
    {children}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('client/dashboard/')
      .then((res) => { setData(res.data.data); setLoading(false); })
      .catch(() => { setError('Failed to load dashboard. Please try again.'); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
      Loading dashboard…
    </div>
  );

  if (error) return (
    <div style={{
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 12, padding: '1.5rem', color: '#ef4444', textAlign: 'center',
    }}>
      <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i>
      {error}
    </div>
  );

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Welcome back, <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {data?.company_name || 'Client'}
          </span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0', fontSize: '0.95rem' }}>
          Here's a summary of your account activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard icon="fa-project-diagram" label="Active Projects" value={data?.active_projects_count} color="linear-gradient(135deg,#2563eb,#7c3aed)" to="/portal/projects" />
        <StatCard icon="fa-file-invoice-dollar" label="Pending Invoices" value={data?.pending_invoices_count} color="linear-gradient(135deg,#f59e0b,#ef4444)" to="/portal/invoices" />
        <StatCard icon="fa-headset" label="Open Tickets" value={data?.open_support_tickets_count} color="linear-gradient(135deg,#10b981,#059669)" to="/portal/support" />
        <StatCard icon="fa-calendar-check" label="Upcoming Meetings" value={data?.upcoming_meetings?.length ?? 0} color="linear-gradient(135deg,#8b5cf6,#6d28d9)" to="/portal/meetings" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Documents */}
        <SectionCard title="Recent Documents" icon="fa-file-alt">
          {data?.recent_documents?.length ? data.recent_documents.map((doc, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0', borderBottom: i < data.recent_documents.length - 1 ? '1px solid var(--glass-border)' : 'none',
            }}>
              <i className="fas fa-file-pdf" style={{ color: 'var(--accent-color)', width: 18 }}></i>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doc.document_type}</p>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>No recent documents.</p>
          )}
          <Link to="/portal/documents" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.825rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
            View all documents →
          </Link>
        </SectionCard>

        {/* Upcoming Meetings */}
        <SectionCard title="Upcoming Meetings" icon="fa-calendar-alt">
          {data?.upcoming_meetings?.length ? data.upcoming_meetings.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0', borderBottom: i < data.upcoming_meetings.length - 1 ? '1px solid var(--glass-border)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(37,99,235,0.1)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 700, lineHeight: 1 }}>
                  {new Date(m.meeting_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-color)', lineHeight: 1 }}>
                  {new Date(m.meeting_date).getDate()}
                </span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.meeting_time}</p>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>No upcoming meetings.</p>
          )}
          <Link to="/portal/meetings" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.825rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
            View all meetings →
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
