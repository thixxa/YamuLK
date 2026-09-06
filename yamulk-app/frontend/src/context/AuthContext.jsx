import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('yamulk_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('yamulk_token') || null);

  // ── Real Login — calls POST /user/ ────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error('Please fill in all fields');
    const data = await loginUser({ email, password });
    // data = { message, token, user: { name, email } }
    const userData = data.user || { email };
    localStorage.setItem('yamulk_token', data.token);
    localStorage.setItem('yamulk_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
  }, []);

  // ── Real Register — calls POST /user/register ──────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error('Please fill in all fields');
    return await registerUser({ name, email, password });
  }, []);

  // ── Google Login ───────────────────────────────────────────────────────────
  // Note: Google OAuth requires a matching backend endpoint to exchange the
  // access_token for a real JWT. Until that is implemented, Google login
  // will show an informative error to the user.
  const loginWithGoogle = useCallback(async (tokenResponse) => {
    // Fetch profile info from Google using the access token
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch Google profile');

    const profile = await res.json();

    // TODO: Exchange Google profile for a real JWT from your backend
    // e.g.: const data = await api.post('/user/google', { googleToken: tokenResponse.access_token });
    // For now, throw a clear error so the UI can show a helpful message.
    throw new Error(
      'Google Sign-In requires a backend integration. Please use email/password login.'
    );

    // When backend is ready, replace the throw above with:
    // localStorage.setItem('yamulk_token', data.token);
    // localStorage.setItem('yamulk_user', JSON.stringify(data.user));
    // setToken(data.token);
    // setUser(data.user);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('yamulk_token');
    localStorage.removeItem('yamulk_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, loginWithGoogle, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
