import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.data.data.user);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const authUser = response.data.data.user;
    const authToken = response.data.token;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
    setToken(authToken);

    return authUser;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    const authUser = response.data.data.user;
    const authToken = response.data.token;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
    setToken(authToken);

    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}