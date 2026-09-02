import { createContext, useContext, useState, useCallback } from 'react';

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

  // ── Mock Login (no backend needed) ───────────────────────────────────────────────
  // TODO: swap body with real API call when backend is connected
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error('Please fill in all fields');
    await new Promise(res => setTimeout(res, 600));
    const mockToken = 'mock_token_' + Date.now();
    // Derive a display name from the email (e.g. "kasun@gmail.com" → "Kasun")
    const displayName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    localStorage.setItem('yamulk_token', mockToken);
    localStorage.setItem('yamulk_user', JSON.stringify({ name: displayName, email }));
    setToken(mockToken);
    setUser({ name: displayName, email });
  }, []);

  // ── Mock Register ──────────────────────────────────────────────────────────
  // TODO: swap body with real API call when backend is connected
  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error('Please fill in all fields');
    await new Promise(res => setTimeout(res, 600));
    return { message: 'Account created (mock)' };
  }, []);

  // ── Google Login ───────────────────────────────────────────────────────────
  // Called with the tokenResponse from useGoogleLogin's onSuccess callback
  const loginWithGoogle = useCallback(async (tokenResponse) => {
    // Fetch profile info from Google using the access token
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch Google profile');

    const profile = await res.json();
    // profile = { sub, name, given_name, family_name, picture, email }

    const googleToken = 'google_token_' + Date.now();
    const userData = {
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      googleId: profile.sub,
    };

    localStorage.setItem('yamulk_token', googleToken);
    localStorage.setItem('yamulk_user', JSON.stringify(userData));
    setToken(googleToken);
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
