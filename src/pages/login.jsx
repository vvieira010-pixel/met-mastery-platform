import { useState, useEffect } from 'react';
import {
  signInWithPassword,
  storeSupabaseSession, getSupabaseConfig,
  resetPasswordForEmail,
} from '../lib/supabase-storage.js';
import { Icon } from '../components/shared.jsx';

export default function LoginScreen({ onSignIn, onBack, "data-testid": testId }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const supabaseReady = getSupabaseConfig().isConfigured;
  const isReset = mode === 'reset';

  useEffect(() => {
    try {
      const notice = localStorage.getItem('vv:auth_notice');
      if (notice) { setError(notice); localStorage.removeItem('vv:auth_notice'); }
    } catch { }
  }, []);

  const switchMode = (next) => {
    if (loading) return;
    setError('');
    setEmailError('');
    setPasswordError('');
    setResetSent(false);
    setMode(next);
  };

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError('Enter your email address.');
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (!password.trim()) {
      setPasswordError('Enter your password.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (isReset) {
      if (!email.trim()) {
        setEmailError('Enter your email address.');
        setError('Enter your email address.');
        return;
      }
      setEmailError('');
      if (!supabaseReady) { setError("Access isn't set up yet. Contact your teacher to get started."); return; }
      setLoading(true);
      try {
        await resetPasswordForEmail(email.trim(), window.location.origin + window.location.pathname);
        setResetSent(true);
      } catch (err) {
        setError(err.message || 'Could not send reset link. Try again or contact your teacher.');
      }
      setLoading(false);
      return;
    }

    const missingEmail = !email.trim();
    const missingPassword = !password.trim();
    if (missingEmail || missingPassword) {
      setEmailError(missingEmail ? 'Enter your email address.' : '');
      setPasswordError(missingPassword ? 'Enter your password.' : '');
      setError('Please enter your email and password.');
      return;
    }
    if (!supabaseReady) {
      setError("Access isn't set up yet. Contact your teacher to get started.");
      return;
    }
    setLoading(true);
    try {
      const session = await signInWithPassword(email.trim(), password);
      storeSupabaseSession(session);
      if (onSignIn) onSignIn(session);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else if (msg.toLowerCase().includes('not configured')) {
        setError('System configuration error. Please contact your teacher or support.');
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('incorrect')) {
        setError('Incorrect email or password. Try again or contact your teacher.');
      } else {
        setError(msg || 'An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const renderSignInPanel = () => {
    if (isReset && resetSent) {
      return (
        <div className="form-section" data-testid={testId}>
          <header className="section-header">
            <h2>Check your inbox</h2>
            <div className="label" style={{ marginTop: '4px' }}>Password Reset Link Sent</div>
          </header>
          <p style={{ lineHeight: 1.6, opacity: 0.8, marginBottom: '24px', color: 'var(--ink-muted)' }}>
            We sent a sign-in link to <strong>{email}</strong>. Open it to access your account. The link expires in 1 hour.
          </p>
          <div className="lp-toggle">
            <button
              type="button"
              className="lp-submit"
              style={{ width: 'auto', display: 'inline-block', padding: '12px 24px' }}
              onPointerDown={(event) => { event.preventDefault(); switchMode('signin'); }}
              onClick={() => switchMode('signin')}
              disabled={loading}
            >
              Back to sign in
            </button>
          </div>
          <footer className="footer-bar">
            MET Mastery © 2024 · Secure Portal
          </footer>
        </div>
      );
    }

    return (
      <div className="form-section" data-testid={testId}>
        <header className="section-header">
          <h2>{isReset ? 'Reset Password' : 'Sign In'}</h2>
          <div className="label" style={{ marginTop: '4px' }}>
            {isReset ? 'Enter your email to receive a reset link' : 'Welcome back'}
          </div>
        </header>

        {!isReset && (
          <div
            className="lp-demo-preview"
            data-testid="login-demo-preview"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-muted, rgba(255, 255, 255, 0.6))',
            }}>
              <span>Preview without login</span>
              <span style={{
                background: 'rgba(1, 121, 111, 0.2)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'none',
              }}>
                Instant Access
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                data-testid="login-as-teacher-btn"
                onClick={() => onSignIn?.({
                  mockDirect: true,
                  role: 'teacher',
                  email: 'vvieira010@gmail.com',
                  displayName: 'Vinícius (Teacher)',
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              >
                <Icon.teacher size={15} />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                data-testid="login-as-student-btn"
                onClick={() => onSignIn?.({
                  mockDirect: true,
                  role: 'student',
                  studentId: 'st_1',
                  email: 'ana.silva@example.com',
                  displayName: 'Ana Silva',
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              >
                <Icon.student size={15} />
                <span>Student</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="lp-signin-form">
          <div className="field">
            <label htmlFor="lp-email">Email Address</label>
            <input
              id="lp-email"
              className={`lp-input${emailError ? ' lp-input--error' : ''}`}
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={handleEmailBlur}
              disabled={loading}
              autoFocus
            />
            {emailError && (
              <span className="lp-field-error" role="alert">{emailError}</span>
            )}
          </div>

          {!isReset && (
            <div className="field">
              <label htmlFor="lp-password">Password</label>
              <div className="secret-input">
                <input
                  id="lp-password"
                  className={`lp-input${passwordError ? ' lp-input--error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                  onBlur={handlePasswordBlur}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="secret-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon.eye size={18} />
                </button>
              </div>
              {passwordError && (
                <span className="lp-field-error" role="alert">{passwordError}</span>
              )}
            </div>
          )}

          {!isReset && (
            <div className="controls">
              <label className="lp-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <div className="lp-forgot">
                <button
                  type="button"
                  onPointerDown={(event) => { event.preventDefault(); switchMode('reset'); }}
                  onClick={() => switchMode('reset')}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="lp-error" role="alert" aria-live="polite" style={{ marginBottom: '16px' }}>{error}</div>
          )}

          <button
            type="submit"
            className={`lp-submit${loading ? ' lp-submit--loading' : ''}`}
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              void handleSubmit(event);
            }}
          >
            {loading ? (
              <><span className="lp-spinner" />{isReset ? 'Sending…' : 'Accessing…'}</>
            ) : (
              isReset ? 'Send Reset Link' : 'Access Workspace'
            )}
          </button>
        </form>

        {!isReset && (
          <div className="signup-hint">
            Need access? Contact your teacher or administrator.
          </div>
        )}

        {isReset && (
          <div className="signup-hint" style={{ marginTop: '20px' }}>
            Remember your password?{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              onPointerDown={(event) => { event.preventDefault(); switchMode('signin'); }}
              onClick={() => switchMode('signin')}
              disabled={loading}
            >
              Back to sign in
            </button>
          </div>
        )}

        {onBack && (
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Back to homepage
            </button>
          </div>
        )}

        <footer className="footer-bar">
          MET Mastery © 2024 · Secure Portal
        </footer>
      </div>
    );
  };

  return (
    <div className="lp-root">
      <div className="bg-texture" />
      <main className="main-wrapper">
        <div className="brand-section">
          <div className="lp-wordmark">MET Mastery</div>
          <h1 className="headline">Know what to<br /><em>practise next.</em></h1>
          <p className="sub-brand">Your personalized path to mastering the Michigan English Test with AI-powered feedback.</p>
          <div className="lp-workflow-steps">
            <div className="lp-workflow-step"><span>01</span>Class</div>
            <div className="lp-workflow-step"><span>02</span>Feedback</div>
            <div className="lp-workflow-step"><span>03</span>Exercise</div>
            <div className="lp-workflow-step"><span>04</span>Repeat</div>
          </div>
        </div>
        {renderSignInPanel()}
      </main>
    </div>
  );
}
