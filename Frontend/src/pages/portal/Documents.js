import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  const fetchDocs = () => {
    setLoading(true);
    api.get('client/documents/')
      .then((res) => { setDocs(res.data.results || res.data); setLoading(false); })
      .catch(() => { setError('Failed to load documents.'); setLoading(false); });
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    const title = e.target.title.value.trim();
    const docType = e.target.doc_type.value;
    if (!file || !title) { setError('Please select a file and enter a title.'); return; }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('document_type', docType);

    setUploading(true);
    setError('');
    try {
      await api.post('client/documents/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Document uploaded successfully.');
      setTimeout(() => setSuccess(''), 3000);
      e.target.reset();
      fetchDocs();
    } catch {
      setError('Upload failed. Ensure file is under 10MB and is a supported format.');
    } finally {
      setUploading(false);
    }
  };

  const DOC_ICON = { Contract: 'fa-file-contract', Proposal: 'fa-file', Invoice: 'fa-file-invoice-dollar', Report: 'fa-chart-bar', 'Requirement Document': 'fa-clipboard-list', Other: 'fa-file-alt' };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Documents</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Shared files and document repository.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#ef4444', marginBottom: '1.25rem' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.85rem 1rem', color: '#10b981', marginBottom: '1.25rem' }}><i className="fas fa-check-circle"></i> {success}</div>}

      {/* Upload form */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-upload" style={{ color: 'var(--accent-color)' }}></i> Upload Document
        </h3>
        <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title *</label>
            <input name="title" placeholder="Document title" style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 8, color: 'var(--input-text)', fontSize: '0.875rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Type</label>
            <select name="doc_type" style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 8, color: 'var(--input-text)', fontSize: '0.875rem', outline: 'none' }}>
              {['Contract', 'Proposal', 'Requirement Document', 'Invoice', 'Report', 'Other'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>File *</label>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }} />
          </div>
          <button type="submit" disabled={uploading} style={{ padding: '0.65rem 1.25rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {uploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading…</> : <><i className="fas fa-upload"></i> Upload</>}
          </button>
        </form>
      </div>

      {/* Document list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
          No documents found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {docs.map((doc) => (
            <div key={doc.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i className={`fas ${DOC_ICON[doc.document_type] || 'fa-file-alt'}`} style={{ fontSize: '1.5rem', color: 'var(--accent-color)', width: 28, textAlign: 'center', flexShrink: 0 }}></i>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{doc.title}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{doc.document_type} · Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
              </div>
              {doc.file && (
                <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className="fas fa-download"></i> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
