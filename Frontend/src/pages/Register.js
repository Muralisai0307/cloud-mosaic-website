import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Education',
    'Manufacturing', 'Consulting', 'Real Estate', 'Logistics', 'Other',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, companyName, industry } = form;

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Username, email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(username, email, password, companyName, industry);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem 0.8rem 2.6rem',
    background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
    borderRadius: '10px', color: 'var(--input-text)', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.5rem',
    fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)',
  };

  const iconStyle = {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem',
  };

  return (
    <>
      <Helmet>
        <title>Client Registration - CloudMosaic</title>
        <meta name="description" content="Create your CloudMosaic Client Portal account to manage your projects, invoices, and more." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />

      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 20px 60px', background: 'var(--bg-body)',
      }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '24px', padding: '3rem 2.5rem',
            boxShadow: 'var(--card-shadow)', backdropFilter: 'blur(12px)',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '64px', height: '64px', background: 'var(--accent-gradient)',
                borderRadius: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1.25rem',
                fontSize: '1.6rem', color: '#fff',
              }}>
                <i className="fas fa-user-plus"></i>
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '0.4rem',
              }}>
                Create Account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Register to access the Client Portal
              </p>
            </div>

            {/* Success message */}
            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '10px', padding: '0.85rem 1rem',
                color: '#10b981', fontSize: '0.9rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <i className="fas fa-check-circle"></i>
                Registration successful! Redirecting to login...
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '0.85rem 1rem',
                color: '#ef4444', fontSize: '0.9rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row: Username + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Username *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-user" style={iconStyle}></i>
                    <input id="reg-username" name="username" type="text" value={form.username}
                      onChange={handleChange} placeholder="username" autoComplete="username"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-envelope" style={iconStyle}></i>
                    <input id="reg-email" name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="you@company.com" autoComplete="email"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
                  </div>
                </div>
              </div>

              {/* Row: Password + Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-lock" style={iconStyle}></i>
                    <input id="reg-password" name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={handleChange}
                      placeholder="Min. 8 characters" autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: '2.4rem' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px',
                      }}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-lock" style={iconStyle}></i>
                    <input id="reg-confirm-password" name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword} onChange={handleChange}
                      placeholder="Repeat password" autoComplete="new-password"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
                  </div>
                </div>
              </div>

              {/* Row: Company Name + Industry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={labelStyle}>Company Name</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-building" style={iconStyle}></i>
                    <input id="reg-company" name="companyName" type="text" value={form.companyName}
                      onChange={handleChange} placeholder="Your Company Ltd"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-industry" style={iconStyle}></i>
                    <select id="reg-industry" name="industry" value={form.industry}
                      onChange={handleChange}
                      style={{
                        ...inputStyle, paddingLeft: '2.6rem',
                        appearance: 'none', cursor: 'pointer',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}>
                      <option value="">Select industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button id="reg-submit" type="submit" disabled={loading || success}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: (loading || success) ? 'rgba(37,99,235,0.5)' : 'var(--accent-gradient)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '1rem', fontWeight: '700',
                  cursor: (loading || success) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
                ) : (
                  <><i className="fas fa-user-plus"></i> Create Client Account</>
                )}
              </button>
            </form>

            <p style={{
              textAlign: 'center', marginTop: '1.75rem',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link to="/" style={{
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <i className="fas fa-arrow-left"></i> Back to CloudMosaic website
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Register;
