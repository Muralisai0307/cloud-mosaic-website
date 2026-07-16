import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PAY_STATUS = {
  Pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  Completed: { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  Failed:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  Refunded:  { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('client/payments/')
      .then((res) => { setPayments(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load payments.'); setLoading(false); });
  }, []);

  const totalPaid = payments.filter((p) => p.status === 'Completed').reduce((a, p) => a + Number(p.amount), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Payment History</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>All transactions recorded for your account.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.25rem' }}>{error}</div>}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Transactions', value: payments.length, icon: 'fa-receipt', color: '#2563eb' },
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: 'fa-check-circle', color: '#10b981' },
        ].map((c) => (
          <div key={c.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className={`fas ${c.icon}`} style={{ fontSize: '1.5rem', color: c.color }}></i>
            <div>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-credit-card" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No payment records found.
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(37,99,235,0.04)' }}>
                {['Transaction ID', 'Invoice', 'Amount', 'Method', 'Date', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const s = PAY_STATUS[p.status] || PAY_STATUS.Pending;
                return (
                  <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-color)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.transaction_id || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)' }}>{p.invoice_number || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>₹{Number(p.amount).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{p.payment_method}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>{p.status}</span>
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
