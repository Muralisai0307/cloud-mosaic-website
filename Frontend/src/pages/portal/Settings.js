import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) { setError('New passwords do not match.'); return; }
    if (passwords.new_password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setSuccess('Password changed successfully.');
      setPasswords({ old_password: '', new_password: '', confirm: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem',
    background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
    borderRadius: 8, color: 'var(--input-text)', fontSize: '0.9rem', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.825rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.4rem',
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Manage your login credentials.</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Account Info */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-user-circle" style={{ color: 'var(--accent-color)' }}></i> Account Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Username', value: user?.username },
              { label: 'Email', value: user?.email },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...labelStyle }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', padding: '0.5rem 0' }}>{value || '—'}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <i className="fas fa-info-circle"></i> To change your username or email, please contact support.
          </p>
        </div>

        {/* Change Password */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-lock" style={{ color: 'var(--accent-color)' }}></i> Change Password
          </h3>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '0.75rem', color: '#10b981', marginBottom: '1rem', fontSize: '0.85rem' }}><i className="fas fa-check-circle"></i> {success}</div>}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Current Password *</label>
              <input type="password" value={passwords.old_password} onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} placeholder="Current password" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>New Password *</label>
              <input type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="Min. 8 characters" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Confirm New Password *</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" style={inputStyle} />
            </div>
            <button type="submit" id="settings-change-password-btn" disabled={saving} style={{
              padding: '0.7rem 1.75rem', background: 'var(--accent-gradient)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-key"></i> Change Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
