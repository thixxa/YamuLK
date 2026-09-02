import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/YamuLK_logo.png';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', regUsername: '', regPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ name: form.username, password: form.password });
        navigate('/home');
      } else {
        await register({ name: form.regUsername, email: form.email, password: form.regPassword });
        // After successful register, switch to login tab
        setMode('login');
        setForm({ ...form, username: form.regUsername, password: '' });
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

            {mode === 'register' && (
              <div className="ng-row-2">
                <div className={`ng-field ${focused === 'name' ? 'ng-field-focus' : ''}`}>
                  <label>Full Name</label>
                  <input
                    type="text" id="register-name" placeholder="Kasun Perera"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                    required
                  />
                </div>
                <div className={`ng-field ${focused === 'email' ? 'ng-field-focus' : ''}`}>
                  <label>Email</label>
                  <input
                    type="email" id="register-email" placeholder="kasun@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    required
                  />
                </div>
              </div>
            )}

            <div className={`ng-field ${focused === 'username' ? 'ng-field-focus' : ''}`}>
              <label>Username</label>
              <div className="ng-input-wrap">
                <span className="ng-input-icon">@</span>
                <input
                  type="text"
                  id={mode === 'login' ? 'login-username' : 'register-username'}
                  placeholder="your_username"
                  value={mode === 'login' ? form.username : form.regUsername}
                  onChange={e => setForm(mode === 'login'
                    ? { ...form, username: e.target.value }
                    : { ...form, regUsername: e.target.value }
                  )}
                  onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <div className={`ng-field ${focused === 'password' ? 'ng-field-focus' : ''}`}>
              <div className="ng-field-header">
                <label>Password</label>
                {mode === 'login' && <span className="ng-forgot">Forgot?</span>}
              </div>
              <div className="ng-input-wrap">
                <span className="ng-input-icon">🔒</span>
                <input
                  type="password"
                  id={mode === 'login' ? 'login-password' : 'register-password'}
                  placeholder={mode === 'login' ? '••••••••' : 'Min. 8 characters'}
                  value={mode === 'login' ? form.password : form.regPassword}
                  onChange={e => setForm(mode === 'login'
                    ? { ...form, password: e.target.value }
                    : { ...form, regPassword: e.target.value }
                  )}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

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

            {/* API error / success message */}
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
