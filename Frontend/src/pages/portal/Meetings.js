import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.get('client/meetings/')
      .then((res) => { setMeetings(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load meetings.'); setLoading(false); });
  }, []);

  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.meeting_date) >= now);
  const past = meetings.filter((m) => new Date(m.meeting_date) < now);
  const list = tab === 'upcoming' ? upcoming : past;

  const MeetingCard = ({ m }) => (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
      borderRadius: 14, padding: '1.25rem 1.5rem',
      display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--card-hover-shadow)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Date block */}
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: tab === 'upcoming' ? 'var(--accent-gradient)' : 'rgba(107,114,128,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: tab === 'upcoming' ? '#fff' : 'var(--text-secondary)', lineHeight: 1, textTransform: 'uppercase' }}>
          {new Date(m.meeting_date).toLocaleString('default', { month: 'short' })}
        </span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: tab === 'upcoming' ? '#fff' : 'var(--text-secondary)', lineHeight: 1 }}>
          {new Date(m.meeting_date).getDate()}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</h3>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <i className="fas fa-clock"></i> {m.meeting_time}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <i className={`fas ${m.meeting_type === 'Online' ? 'fa-video' : 'fa-map-marker-alt'}`}></i>
            {m.meeting_type}
          </span>
        </div>
        {m.description && <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{m.description}</p>}
        {m.meeting_link && (
          <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
            <i className="fas fa-video"></i> Join Meeting
          </a>
        )}
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Meetings</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Scheduled consultations and reviews.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.25rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ key: 'upcoming', label: `Upcoming (${upcoming.length})` }, { key: 'past', label: `Past (${past.length})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.4rem 1.2rem', borderRadius: 50, cursor: 'pointer',
            fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s',
            background: tab === key ? 'var(--accent-gradient)' : 'var(--card-bg)',
            color: tab === key ? '#fff' : 'var(--text-secondary)',
            border: tab === key ? 'none' : '1px solid var(--glass-border)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-calendar-times" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No {tab} meetings.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {list.map((m) => <MeetingCard key={m.id} m={m} />)}
        </div>
      )}
    </div>
  );
}
