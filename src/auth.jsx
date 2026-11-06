import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem('hp_token');
      const u = localStorage.getItem('hp_user');
      if (t && u) {
        api.setToken(t);
        return JSON.parse(u);
      }
    } catch {}
    return null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('hp_token');
    localStorage.removeItem('hp_user');
    api.setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    api.onAuthError(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('hp_token', token);
    localStorage.setItem('hp_user', JSON.stringify(user));
    api.setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user } = await api.register(name, email, password);
    localStorage.setItem('hp_token', token);
    localStorage.setItem('hp_user', JSON.stringify(user));
    api.setToken(token);
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
