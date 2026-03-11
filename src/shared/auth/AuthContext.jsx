import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiMe, apiSignup } from '../../features/auth/api/authApi';
import {
  getCurrentMockUser,
  initAuthStore,
  loginMockUser,
  logoutMockUser,
  registerMockUser,
} from '../mock/authStore';
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenStore';

const AuthContext = createContext(null);

const IS_DEV = import.meta.env.DEV;

export function AuthProvider({ children }) {
  if (IS_DEV) initAuthStore();

  // In dev: restore from localStorage mock. In prod: always start null and restore from JWT.
  const [user, setUser] = useState(IS_DEV ? getCurrentMockUser() : null);

  useEffect(() => {
    if (IS_DEV) return;
    const token = getAuthToken();
    if (!token) return;
    apiMe()
      .then(setUser)
      .catch(() => clearAuthToken());
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login: async (payload) => {
      try {
        const response = await apiLogin(payload);
        if (response?.token) {
          setAuthToken(response.token);
        }
        const me = response?.user || (await apiMe());
        setUser(me);
        return me;
      } catch (err) {
        if (!IS_DEV) throw err;
        const loggedIn = loginMockUser(payload);
        setUser(loggedIn);
        return loggedIn;
      }
    },
    signup: async (payload) => {
      try {
        const response = await apiSignup(payload);
        if (response?.token) {
          setAuthToken(response.token);
        }
        const me = response?.user || (await apiMe());
        setUser(me);
        return me;
      } catch (err) {
        if (!IS_DEV) throw err;
        const signedUp = registerMockUser(payload);
        setUser(signedUp);
        return signedUp;
      }
    },
    logout: () => {
      if (IS_DEV) logoutMockUser();
      clearAuthToken();
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
