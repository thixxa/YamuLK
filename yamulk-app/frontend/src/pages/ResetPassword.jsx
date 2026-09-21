import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';
import logo from '../assets/YamuLK_logo.png';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [status, setStatus]                 = useState({ type: '', text: '' }); // 'success' | 'error'
  const [done, setDone]                     = useState(false);

  // If no token in URL, redirect to login
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const passwordsMatch  = confirmPassword.length === 0 || newPassword === confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await resetPassword(token, newPassword);
      setStatus({ type: 'success', text: res.message || 'Password reset successfully!' });
      setDone(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Reset failed. The link may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      {/* Background blobs */}
      <div className="rp-blob rp-blob-1" />
      <div className="rp-blob rp-blob-2" />

      <div className="rp-card">
        {/* Logo */}
        <div className="rp-logo-wrap">
          <div className="rp-logo">
            <img src={logo} alt="YamuLK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="rp-brand">YamuLK</div>
        </div>

        {done ? (
          /* ── Success state ── */
          <div className="rp-success">
            <div className="rp-success-icon">✅</div>
            <h2 className="rp-title">Password Reset!</h2>
            <p className="rp-sub">
              Your password has been updated successfully.<br />
              Redirecting to login in 3 seconds…
            </p>
            <button
              className="rp-btn"
              onClick={() => navigate('/login')}
            >
              Go to Login Now
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="rp-title">Set New Password</h2>
            <p className="rp-sub">
              Choose a strong password for your YamuLK account.
            </p>

            {/* Status banner */}
            {status.text && (
              <div className={`rp-status rp-status--${status.type}`} role="alert">
                {status.type === 'error' ? '❌' : '✅'} {status.text}
              </div>
            )}

            {/* New Password */}
            <div className="rp-field">
              <label htmlFor="rp-new-password">New Password</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">🔒</span>
                <input
                  id="rp-new-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="rp-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordTooShort && (
                <span className="rp-hint rp-hint--error">Must be at least 6 characters</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="rp-field">
              <label htmlFor="rp-confirm-password">Confirm Password</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">🔒</span>
                <input
                  id="rp-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="rp-pw-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <span className={`rp-hint ${passwordsMatch ? 'rp-hint--ok' : 'rp-hint--error'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="rp-btn"
              id="btn-reset-password-submit"
              disabled={loading || passwordTooShort || (!passwordsMatch && confirmPassword.length > 0)}
            >
              {loading ? (
                <><span className="rp-spinner" /> Resetting…</>
              ) : (
                '🔑 Reset Password'
              )}
            </button>

            <button
              type="button"
              className="rp-back-link"
              onClick={() => navigate('/login')}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
