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

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ name, password }) => {
    const data = await loginUser({ name, password });
    // Backend returns { message, token }
    localStorage.setItem('yamulk_token', data.token);
    localStorage.setItem('yamulk_user', JSON.stringify({ name }));
    setToken(data.token);
    setUser({ name });
    return data;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const data = await registerUser({ name, email, password });
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('yamulk_token');
    localStorage.removeItem('yamulk_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
