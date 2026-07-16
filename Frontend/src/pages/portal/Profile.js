import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Field = ({ label, value, editable, name, onChange, type = 'text' }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    {editable ? (
      <input
        type={type}
        name={name}
        defaultValue={value || ''}
        onChange={onChange}
        style={{
          width: '100%', padding: '0.7rem 1rem',
          background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
          borderRadius: 10, color: 'var(--input-text)', fontSize: '0.95rem', outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
      />
    ) : (
      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', padding: '0.7rem 0' }}>
        {value || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not set</span>}
      </p>
    )}
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edits, setEdits] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('client/profile/')
      .then((res) => { setProfile(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load profile.'); setLoading(false); });
  }, []);

  const handleChange = (e) => {
    setEdits((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put('client/profile/', edits);
      setProfile(res.data);
      setEditing(false);
      setEdits({});
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
      Loading profile…
    </div>
  );

  const p = profile || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Company Profile</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>View and manage your company details.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setEdits({}); setError(''); }} style={{
                padding: '0.6rem 1.25rem', background: 'transparent', border: '1.5px solid var(--glass-border)',
                borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              }}>
                Cancel
              </button>
              <button id="profile-save-btn" onClick={handleSave} disabled={saving} style={{
                padding: '0.6rem 1.5rem', background: 'var(--accent-gradient)', border: 'none',
                borderRadius: 8, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save Changes</>}
              </button>
            </>
          ) : (
            <button id="profile-edit-btn" onClick={() => setEditing(true)} style={{
              padding: '0.6rem 1.5rem', background: 'var(--accent-gradient)', border: 'none',
              borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          )}
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#10b981', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Company Info */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-building" style={{ color: 'var(--accent-color)' }}></i> Company Information
          </h3>
          <Field label="Company Name" name="company_name" value={p.company_name} editable={editing} onChange={handleChange} />
          <Field label="Company Email" name="company_email" value={p.company_email} editable={editing} onChange={handleChange} type="email" />
          <Field label="Phone" name="phone" value={p.phone} editable={editing} onChange={handleChange} />
          <Field label="Website" name="website" value={p.website} editable={editing} onChange={handleChange} />
          <Field label="Industry" name="industry" value={p.industry} editable={editing} onChange={handleChange} />
          <Field label="Company Size" name="company_size" value={p.company_size} editable={editing} onChange={handleChange} />
        </div>

        {/* Address & Contact */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-color)' }}></i> Address & Contact
          </h3>
          <Field label="Contact Person" name="contact_person" value={p.contact_person} editable={editing} onChange={handleChange} />
          <Field label="Address" name="address" value={p.address} editable={editing} onChange={handleChange} />
          <Field label="City" name="city" value={p.city} editable={editing} onChange={handleChange} />
          <Field label="State" name="state" value={p.state} editable={editing} onChange={handleChange} />
          <Field label="Country" name="country" value={p.country} editable={editing} onChange={handleChange} />
          <Field label="Postal Code" name="postal_code" value={p.postal_code} editable={editing} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
