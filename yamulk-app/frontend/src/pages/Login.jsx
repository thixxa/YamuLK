import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/YamuLK_logo.png';
import { useAuth } from '../context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import { forgotPassword } from '../api/auth.js';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Login fields
    loginEmail: '',
    loginPassword: '',
    // Register fields
    regName: '',
    regEmail: '',
    regPassword: '',
    regConfirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);  // legacy inline hint

  // ── Forgot Password inline form ─────────────────────────────────────────────
  const [showForgot, setShowForgot]       = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus]   = useState({ type: '', text: '' });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotStatus({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    setForgotLoading(true);
    setForgotStatus({ type: '', text: '' });
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotStatus({ type: 'success', text: res.message });
      setForgotEmail('');
    } catch (err) {
      setForgotStatus({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Google OAuth handler ────────────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        await loginWithGoogle(tokenResponse);
        navigate('/home');
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (form.regPassword !== form.regConfirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.regPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.loginEmail, password: form.loginPassword });
        navigate('/home');
      } else {
        await register({ name: form.regName, email: form.regEmail, password: form.regPassword });
        setMode('login');
        setForm((prev) => ({ ...prev, loginEmail: form.regEmail, loginPassword: '' }));
        setError('✅ Account created! Please sign in.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="ng-auth">
      {/* ── Background watermark logo ── */}
      <div className="ng-watermark">
        <img src={logo} alt="" aria-hidden="true" />
      </div>

      {/* ── Animated aurora background ── */}
      <div className="ng-aurora">
        <div className="ng-aurora-layer ng-a1" />
        <div className="ng-aurora-layer ng-a2" />
        <div className="ng-aurora-layer ng-a3" />
        <div className="ng-aurora-layer ng-a4" />
      </div>

      {/* ── Noise grain overlay ── */}
      <div className="ng-noise" />

      {/* ── Centered card ── */}
      <div className="ng-card-wrap">
        {/* Logo row */}
        <div className="ng-logo-row">
          <div className="ng-logo-badge">
            <img src={logo} alt="YamuLK" />
          </div>
          <span className="ng-logo-name">YamuLK</span>
        </div>

        {/* Headline */}
        <div className="ng-headline">
          <h1 className="ng-title">
            {mode === 'login' ? 'Welcome back' : 'Start exploring'}
          </h1>
          <p className="ng-sub">
            {mode === 'login'
              ? 'Sign in to your journey across Sri Lanka'
              : 'Create your account and discover hidden gems'}
          </p>
        </div>

        {/* Tab pill */}
        <div className="ng-tabs">
          <button
            className={`ng-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            id="tab-login"
          >Sign In</button>
          <button
            className={`ng-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
            id="tab-register"
          >Register</button>
          <div className={`ng-tab-pill ${mode === 'register' ? 'right' : ''}`} />
        </div>

        {/* Glass form card */}
        <div className="ng-glass-card">
          <form onSubmit={handleSubmit} id={mode === 'login' ? 'login-form' : 'register-form'}>

            {/* ── LOGIN FIELDS ── */}
            {mode === 'login' && (
              <>
                {/* Email */}
                <div className={`ng-field ${focused === 'loginEmail' ? 'ng-field-focus' : ''}`}>
                  <label>Email</label>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">📧</span>
                    <input
                      type="email"
                      id="login-email"
                      placeholder="kasun@example.com"
                      value={form.loginEmail}
                      onChange={set('loginEmail')}
                      onFocus={() => setFocused('loginEmail')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={`ng-field ${focused === 'loginPassword' ? 'ng-field-focus' : ''}`}>
                  <div className="ng-field-header">
                    <label>Password</label>
                    <button
                      type="button"
                      className="ng-forgot"
                      onClick={() => { setShowForgot(v => !v); setForgotStatus({ type: '', text: '' }); setForgotEmail(''); }}
                      aria-label="Open forgot password form"
                    >
                      {showForgot ? '× Cancel' : 'Forgot?'}
                    </button>
                  </div>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">🔒</span>
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      id="login-password"
                      placeholder="••••••••"
                      value={form.loginPassword}
                      onChange={set('loginPassword')}
                      onFocus={() => setFocused('loginPassword')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="ng-pw-toggle"
                      onClick={() => setShowLoginPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showLoginPw ? '👁️' : '👁'}
                    </button>
                  </div>
                </div>

                {/* ── Inline Forgot Password Panel ── */}
                {showForgot && (
                  <div className="ng-forgot-panel" id="forgot-password-panel">
                    <div className="ng-forgot-panel-title">🔑 Reset Password</div>
                    <p className="ng-forgot-panel-sub">
                      Enter your email address and we'll send you a reset link.
                    </p>

                    {forgotStatus.text && (
                      <div className={`ng-forgot-status ng-forgot-status--${forgotStatus.type}`} role="alert">
                        {forgotStatus.type === 'success' ? '✅' : '❌'} {forgotStatus.text}
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} style={{ marginTop: 10 }}>
                      <div className="ng-input-wrap" style={{ marginBottom: 10 }}>
                        <span className="ng-input-icon">✉️</span>
                        <input
                          type="email"
                          id="forgot-email"
                          placeholder="your@email.com"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          autoComplete="email"
                          required
                          style={{ paddingLeft: 40 }}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        id="btn-send-reset-email"
                        disabled={forgotLoading}
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-full)' }}
                      >
                        {forgotLoading ? '⏳ Sending…' : '📧 Send Reset Link'}
                      </button>
                    </form>
                  </div>
                )}

              </>
            )}

            {/* ── REGISTER FIELDS ── */}
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div className={`ng-field ${focused === 'regName' ? 'ng-field-focus' : ''}`}>
                  <label>Full Name</label>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">👤</span>
                    <input
                      type="text"
                      id="register-name"
                      placeholder="Kasun Perera"
                      value={form.regName}
                      onChange={set('regName')}
                      onFocus={() => setFocused('regName')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className={`ng-field ${focused === 'regEmail' ? 'ng-field-focus' : ''}`}>
                  <label>Email</label>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">📧</span>
                    <input
                      type="email"
                      id="register-email"
                      placeholder="kasun@example.com"
                      value={form.regEmail}
                      onChange={set('regEmail')}
                      onFocus={() => setFocused('regEmail')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={`ng-field ${focused === 'regPassword' ? 'ng-field-focus' : ''}`}>
                  <label>Password <span style={{ fontSize: 11, opacity: 0.55, fontWeight: 400 }}>(min. 6 chars)</span></label>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">🔒</span>
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      id="register-password"
                      placeholder="Create a strong password"
                      value={form.regPassword}
                      onChange={set('regPassword')}
                      onFocus={() => setFocused('regPassword')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="ng-pw-toggle"
                      onClick={() => setShowRegPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showRegPw ? '👁️' : '👁'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className={`ng-field ${
                  focused === 'regConfirm' ? 'ng-field-focus' : ''
                } ${
                  form.regConfirmPassword && form.regPassword !== form.regConfirmPassword
                    ? 'ng-field-error'
                    : ''
                }`}>
                  <div className="ng-field-header">
                    <label>Confirm Password</label>
                    {form.regConfirmPassword && form.regPassword !== form.regConfirmPassword && (
                      <span style={{ fontSize: 11, color: '#ff6464' }}>Passwords don’t match</span>
                    )}
                    {form.regConfirmPassword && form.regPassword === form.regConfirmPassword && (
                      <span style={{ fontSize: 11, color: '#00c864' }}>✓ Match</span>
                    )}
                  </div>
                  <div className="ng-input-wrap">
                    <span className="ng-input-icon">🔐</span>
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      id="register-confirm-password"
                      placeholder="Re-enter your password"
                      value={form.regConfirmPassword}
                      onChange={set('regConfirmPassword')}
                      onFocus={() => setFocused('regConfirm')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="ng-pw-toggle"
                      onClick={() => setShowConfirmPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirmPw ? '👁️' : '👁'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="ng-submit"
              id={mode === 'login' ? 'btn-login' : 'btn-register'}
              disabled={loading}
            >
              {loading
                ? <><div className="ng-spinner" /><span>Please wait...</span></>
                : <><span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span><span className="ng-arrow">↗</span></>
              }
            </button>

            {/* Message */}
            {error && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: error.startsWith('✅') ? 'rgba(0,200,100,0.12)' : 'rgba(255,80,80,0.12)',
                color: error.startsWith('✅') ? '#00c864' : '#ff6464',
                border: `1px solid ${error.startsWith('✅') ? 'rgba(0,200,100,0.25)' : 'rgba(255,80,80,0.25)'}`,
              }}>
                {error}
              </div>
            )}
          </form>

          {/* ── Divider ── */}
          <div className="ng-divider"><span>or continue with</span></div>

          {/* ── Google Sign-In Button ── */}
          <button
            className="ng-google-btn"
            id="btn-google-login"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading || loading}
            type="button"
          >
            {googleLoading ? (
              <><div className="ng-spinner" /><span>Signing in...</span></>
            ) : (
              <>
                {/* Google G SVG logo */}
                <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Stats strip */}
        <div className="ng-stats">
          {[['200+', 'Destinations'], ['50k+', 'Travellers'], ['9', 'Provinces']].map(([v, l]) => (
            <div key={l} className="ng-stat">
              <span className="ng-stat-val">{v}</span>
              <span className="ng-stat-lbl">{l}</span>
            </div>
          ))}
        </div>

        <p className="ng-terms">
          By continuing you agree to our <span>Terms</span> &amp; <span>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
