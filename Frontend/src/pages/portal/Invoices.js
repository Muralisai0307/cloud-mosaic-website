import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const INV_STATUS = {
  Draft:     { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  Sent:      { bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
  Paid:      { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  Partial:   { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  Overdue:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('client/invoices/')
      .then((res) => { setInvoices(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load invoices.'); setLoading(false); });
  }, []);

  const total = invoices.reduce((acc, i) => acc + Number(i.total_amount || 0), 0);
  const pending = invoices.filter((i) => ['Sent', 'Partial', 'Overdue'].includes(i.status)).reduce((acc, i) => acc + Number(i.balance_due || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Invoices</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Billing history and outstanding amounts.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.25rem' }}>{error}</div>}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Invoices', value: invoices.length, icon: 'fa-file-invoice-dollar', color: '#2563eb' },
          { label: 'Total Value', value: `₹${total.toLocaleString()}`, icon: 'fa-rupee-sign', color: '#7c3aed' },
          { label: 'Balance Due', value: `₹${pending.toLocaleString()}`, icon: 'fa-exclamation-circle', color: '#ef4444' },
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

      {invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-file-invoice-dollar" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No invoices found.
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(37,99,235,0.04)' }}>
                {['Invoice #', 'Project', 'Amount', 'Balance Due', 'Due Date', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const s = INV_STATUS[inv.status] || INV_STATUS.Draft;
                return (
                  <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-color)', fontWeight: 600 }}>{inv.invoice_number}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)' }}>{inv.project_name || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>₹{Number(inv.total_amount).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#ef4444', fontWeight: 700 }}>₹{Number(inv.balance_due || 0).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{inv.due_date || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>{inv.status}</span>
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
