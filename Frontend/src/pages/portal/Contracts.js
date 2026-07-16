import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_STYLE = {
  Draft:     { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  Sent:      { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  Signed:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  Expired:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
};

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('client/contracts/')
      .then((res) => { setContracts(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load contracts.'); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Contracts</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Formal agreements with CloudMosaic.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.25rem' }}>{error}</div>}

      {contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-file-contract" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No contracts found.
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(37,99,235,0.04)' }}>
                {['Contract #', 'Title', 'Value', 'Start Date', 'End Date', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => {
                const s = STATUS_STYLE[c.status] || STATUS_STYLE.Draft;
                return (
                  <tr key={c.id} style={{ borderBottom: i < contracts.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-color)', fontWeight: 600 }}>{c.contract_number}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>₹{Number(c.contract_value).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{c.start_date}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{c.end_date}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
