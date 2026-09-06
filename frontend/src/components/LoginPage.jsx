import React, { useState } from 'react';
import { Activity, ShieldCheck, UserCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';
import HospitalLogoStrip from './HospitalLogoStrip.jsx';

const SCAN_THUMBNAILS = [
  { src: '/images/mri_brain.png', label: 'MRI Brain', mod: 'MRI' },
  { src: '/images/chest_xray.png', label: 'Chest X-Ray', mod: 'XR' },
  { src: '/images/ct_abdomen.png', label: 'CT Abdomen', mod: 'CT' },
];

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e, customUser = null, customPass = null) => {
    if (e) e.preventDefault();
    setError('');

    const u = customUser || username;
    const p = customPass || password;

    if (!u.trim() || !p.trim()) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u.trim(), password: p.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid username or password.');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    handleLogin(null, user, pass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>

      {/* ── LEFT HERO PANEL ── */}
      <div
        className="login-hero-panel"
        style={{
          flex: '1 1 55%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: '100vh',
        }}
      >
        {/* Hero background image */}
        <img
          src="/images/radiology_hero.png"
          alt="Radiology workstation"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,19,34,0.3) 0%, rgba(13,19,34,0.7) 55%, rgba(13,19,34,0.98) 100%)',
        }} />

        {/* Content over image */}
        <div style={{ position: 'relative', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                background: 'rgba(6,182,212,0.2)',
                border: '1px solid rgba(6,182,212,0.4)',
                borderRadius: '0.4rem',
                padding: '0.3rem 0.5rem',
                display: 'flex', alignItems: 'center',
                color: 'var(--accent-cyan)',
              }}>
                <Activity size={18} />
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>PROTOTYPE ACTIVE</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: 0 }}>
              Prior Study<br />Matching Assistant
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem' }}>
              AI-powered retrieval decision support for radiology departments
            </p>
          </div>

          {/* Scan thumbnails strip */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {SCAN_THUMBNAILS.map(({ src, label, mod }) => (
              <div
                key={mod}
                style={{
                  flex: 1,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(6,182,212,0.25)',
                  position: 'relative',
                  background: '#000',
                  aspectRatio: '1 / 1',
                  maxWidth: 140,
                }}
              >
                <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  padding: '0.35rem 0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>{mod}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Hospitals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partner Hospitals</div>
            <HospitalLogoStrip variant="compact" />
          </div>

          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={12} style={{ color: 'var(--accent-cyan)' }} />
            Synthetic / de-identified data only — not for clinical use
          </div>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div style={{
        flex: '0 0 420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--bg-dark)',
        borderLeft: '1px solid var(--border-color)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Logo + title */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              width: 48, height: 48,
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <Activity size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sign In
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Radiology Retrieval Decision Support
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '0.75rem', borderRadius: '0.375rem',
              color: 'var(--accent-rose)', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username / Email</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                  placeholder="e.g. radiologist"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-green"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} /> Quick Demo Accounts:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-amber"
                style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                onClick={() => handleQuickDemo('radiologist', 'Demo@123')}
              >
                <span>Dr. Demo (Radiologist)</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Full Access</span>
              </button>

              <button
                type="button"
                className="btn"
                style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onClick={() => handleQuickDemo('technician', 'Demo@123')}
              >
                <span>Demo Technician</span>
                <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Restricted</span>
              </button>

              <button
                type="button"
                className="btn"
                style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onClick={() => handleQuickDemo('admin', 'Admin@123')}
              >
                <span>System Admin</span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Admin View</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          {onSwitchToRegister && (
            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              New to the system?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: '0.85rem',
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Safety Footer */}
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={12} style={{ color: 'var(--accent-cyan)', verticalAlign: 'middle', marginRight: 4 }} />
            Prototype system — synthetic/de-identified data only
          </div>

        </div>
      </div>
    </div>
  );
}
