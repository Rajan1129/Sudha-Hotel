import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi, fetchMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sudha_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setAdmin(data.admin))
      .catch(() => {
        localStorage.removeItem('sudha_admin_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginApi(username, password);
    localStorage.setItem('sudha_admin_token', data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sudha_admin_token');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
