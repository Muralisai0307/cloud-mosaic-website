import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/portal/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Client Login - CloudMosaic</title>
        <meta name="description" content="Log in to the CloudMosaic Client Portal to manage your projects, invoices, and more." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />

      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 20px 60px',
        background: 'var(--bg-body)',
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          {/* Card */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            boxShadow: 'var(--card-shadow)',
            backdropFilter: 'blur(12px)',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '64px', height: '64px',
                background: 'var(--accent-gradient)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.6rem', color: '#fff',
              }}>
                <i className="fas fa-cloud"></i>
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '0.4rem',
              }}>
                Client Portal
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Sign in to access your dashboard
              </p>
            </div>

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
              {/* Username */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block', marginBottom: '0.5rem',
                  fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)',
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                  }}></i>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    style={{
                      width: '100%', padding: '0.8rem 1rem 0.8rem 2.6rem',
                      background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
                      borderRadius: '10px', color: 'var(--input-text)', fontSize: '0.95rem',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block', marginBottom: '0.5rem',
                  fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-lock" style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem',
                  }}></i>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '0.8rem 2.6rem 0.8rem 2.6rem',
                      background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
                      borderRadius: '10px', color: 'var(--input-text)', fontSize: '0.95rem',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '4px',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                  <Link to="/forgot-password" style={{
                    fontSize: '0.85rem', color: 'var(--accent-color)', textDecoration: 'none',
                  }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: loading ? 'rgba(37,99,235,0.5)' : 'var(--accent-gradient)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> Sign In</>
                )}
              </button>
            </form>

            {/* Footer */}
            <p style={{
              textAlign: 'center', marginTop: '1.75rem',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{
                color: 'var(--accent-color)', fontWeight: '600', textDecoration: 'none',
              }}>
                Register here
              </Link>
            </p>
          </div>

          {/* Back to site */}
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

export default Login;
