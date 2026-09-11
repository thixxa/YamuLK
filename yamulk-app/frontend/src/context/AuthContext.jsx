import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser, googleAuth } from '../api/auth.js';

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

  // ── Google Login ────────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (tokenResponse) => {
    // Exchange the Google access_token for a YamuLK JWT via our backend
    const data = await googleAuth({ access_token: tokenResponse.access_token });
    // data = { message, token, user: { name, email } }
    const userData = data.user || {};
    localStorage.setItem('yamulk_token', data.token);
    localStorage.setItem('yamulk_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
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
