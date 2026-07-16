import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PRIORITY_STYLE = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Urgent: '#dc2626' };
const STATUS_STYLE = {
  Open:        { bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
  'In Progress': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Resolved:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  Closed:      { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ subject: '', category: 'General', priority: 'Medium', message: '' });

  const fetchTickets = () => {
    api.get('client/support/')
      .then((res) => { setTickets(res.data.results || res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { setError('Subject and message are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('client/support/', form);
      setSuccess('Ticket submitted successfully. We will respond within 24 hours.');
      setForm({ subject: '', category: 'General', priority: 'Medium', message: '' });
      fetchTickets();
      setTimeout(() => setSuccess(''), 5000);
    } catch {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 8, color: 'var(--input-text)', fontSize: '0.875rem', outline: 'none' };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Support</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Raise tickets and track their resolution.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* New Ticket Form */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-plus-circle" style={{ color: 'var(--accent-color)' }}></i> New Ticket
          </h3>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.7rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.825rem' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '0.7rem', color: '#10b981', marginBottom: '1rem', fontSize: '0.825rem' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Subject *</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {['General', 'Technical', 'Billing', 'Project', 'Other'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                  {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5} placeholder="Describe your issue in detail…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '0.7rem', background: 'var(--accent-gradient)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
            }}>
              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Submitting…</> : <><i className="fas fa-paper-plane"></i> Submit Ticket</>}
            </button>
          </form>
        </div>

        {/* Ticket List */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-list" style={{ color: 'var(--accent-color)' }}></i> Your Tickets
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin"></i></div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
              <i className="fas fa-headset" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', opacity: 0.3 }}></i>
              No tickets yet. Submit one to get help.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {tickets.map((t) => {
                const s = STATUS_STYLE[t.status] || STATUS_STYLE.Open;
                return (
                  <div key={t.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.subject}</p>
                        <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          #{t.ticket_number} · {t.category} · Priority:{' '}
                          <span style={{ color: PRIORITY_STYLE[t.priority], fontWeight: 700 }}>{t.priority}</span>
                        </p>
                      </div>
                      <span style={{ padding: '0.2rem 0.65rem', borderRadius: 50, fontSize: '0.725rem', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
