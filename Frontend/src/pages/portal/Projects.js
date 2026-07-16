import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
  Active: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
  Planning: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'On Hold': { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  Completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' };
  return (
    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('client/projects/')
      .then((res) => { setProjects(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load projects.'); setLoading(false); });
  }, []);

  const statuses = ['all', 'Active', 'Planning', 'On Hold', 'Completed', 'Cancelled'];
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
      Loading projects…
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Projects</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>
          All projects associated with your account.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '1rem', color: '#ef4444', marginBottom: '1.5rem' }}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '0.4rem 1rem', borderRadius: 50, cursor: 'pointer',
            fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s',
            background: filter === s ? 'var(--accent-gradient)' : 'var(--card-bg)',
            color: filter === s ? '#fff' : 'var(--text-secondary)',
            border: filter === s ? 'none' : '1px solid var(--glass-border)',
          }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-project-diagram" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No projects found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map((project) => (
            <div key={project.id} style={{
              background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 14, padding: '1.25rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              gap: '1rem', flexWrap: 'wrap', transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--card-hover-shadow)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {project.project_name}
                  </h3>
                  <Badge status={project.status} />
                </div>
                {project.description && (
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <i className="fas fa-calendar-plus" style={{ color: 'var(--accent-color)' }}></i>
                    Start: {project.start_date || '—'}
                  </span>
                  {project.end_date && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fas fa-calendar-check" style={{ color: '#10b981' }}></i>
                      End: {project.end_date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
