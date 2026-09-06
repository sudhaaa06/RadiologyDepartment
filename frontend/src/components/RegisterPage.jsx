import React, { useState } from 'react';
import { Activity, ShieldCheck, UserCheck, Lock, AlertCircle, UserPlus, AtSign, BadgeCheck } from 'lucide-react';
import HospitalLogoStrip from './HospitalLogoStrip.jsx';

const ROLES = [
  { value: 'Radiologist', label: 'Radiologist', badge: 'Full Access', badgeClass: 'badge-cyan' },
  { value: 'Technician', label: 'Radiology Technician', badge: 'Restricted', badgeClass: 'badge-amber' },
];

const SCAN_THUMBNAILS = [
  { src: '/images/mri_brain.png', label: 'MRI Brain', mod: 'MRI' },
  { src: '/images/chest_xray.png', label: 'Chest X-Ray', mod: 'XR' },
  { src: '/images/ct_abdomen.png', label: 'CT Abdomen', mod: 'CT' },
];

export default function RegisterPage({ onLoginSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
    role: 'Radiologist',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim()))
      errs.username = 'Username must be 3–30 characters (letters, numbers, underscores only).';
    if (!form.display_name.trim()) errs.display_name = 'Display name is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your password.';
    else if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim().toLowerCase(),
        display_name: form.display_name.trim(),
        email: form.email.trim() || null,
        role: form.role,
        password: form.password,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed. Please try again.');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    paddingLeft: '2.2rem',
    borderColor: fieldErrors[field] ? 'rgba(244,63,94,0.6)' : undefined,
  });

  const fieldErr = (field) =>
    fieldErrors[field] ? (
      <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.2rem', display: 'block' }}>
        {fieldErrors[field]}
      </span>
    ) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>

      {/* ── LEFT HERO PANEL ── */}
      <div
        className="login-hero-panel"
        style={{
          flex: '1 1 50%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: '100vh',
        }}
      >
        <img
          src="/images/radiology_hero.png"
          alt="Radiology workstation"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,19,34,0.3) 0%, rgba(13,19,34,0.7) 55%, rgba(13,19,34,0.98) 100%)',
        }} />
        <div style={{ position: 'relative', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', borderRadius: '0.4rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', color: 'var(--accent-cyan)' }}>
                <Activity size={18} />
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>PROTOTYPE ACTIVE</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: 0 }}>
              Create Your<br />Account
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem' }}>
              Join the Prior Study Matching Assistant system
            </p>
          </div>

          {/* Scan thumbnails */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {SCAN_THUMBNAILS.map(({ src, label, mod }) => (
              <div key={mod} style={{ flex: 1, borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.25)', position: 'relative', background: '#000', aspectRatio: '1 / 1', maxWidth: 130 }}>
                <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>{mod}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Hospitals strip */}
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

      {/* ── RIGHT REGISTER PANEL ── */}
      <div style={{
        flex: '0 0 460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--bg-dark)',
        borderLeft: '1px solid var(--border-color)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', width: 48, height: 48, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Activity size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Create Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Prior Study Matching Assistant — Prototype
            </p>
          </div>

          {/* Global Error */}
          {error && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={inputStyle('username')} placeholder="e.g. dr_sarah" value={form.username} onChange={(e) => update('username', e.target.value)} autoComplete="username" />
              </div>
              {fieldErr('username')}
            </div>

            {/* Display Name */}
            <div className="form-group">
              <label className="form-label">Display Name <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <BadgeCheck size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={inputStyle('display_name')} placeholder="e.g. Dr. Sarah Connor" value={form.display_name} onChange={(e) => update('display_name', e.target.value)} />
              </div>
              {fieldErr('display_name')}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <AtSign size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input type="email" className="form-input" style={inputStyle('email')} placeholder="e.g. sarah@hospital.org" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
              </div>
              {fieldErr('email')}
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Role <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update('role', r.value)}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.6rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${form.role === r.value ? 'rgba(6,182,212,0.6)' : 'var(--border-color)'}`,
                      background: form.role === r.value ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                      color: form.role === r.value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{r.label}</span>
                    <span className={`badge ${r.badgeClass}`} style={{ fontSize: '0.6rem' }}>{r.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input type="password" className="form-input" style={inputStyle('password')} placeholder="Min. 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" />
              </div>
              {fieldErr('password')}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input type="password" className="form-input" style={inputStyle('confirm_password')} placeholder="Re-enter password" value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} autoComplete="new-password" />
              </div>
              {fieldErr('confirm_password')}
            </div>

            <button
              type="submit"
              className="btn btn-green"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.95rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              disabled={loading}
            >
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              Sign In
            </button>
          </div>

          {/* Safety footer */}
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={12} style={{ color: 'var(--accent-cyan)', verticalAlign: 'middle', marginRight: '0.25rem' }} />
            Prototype system — synthetic/de-identified data only
          </div>

        </div>
      </div>
    </div>
  );
}
