import { createContext, useContext, useMemo, useState } from 'react';
import { apiLogin, apiMe, apiSignup } from '../../features/auth/api/authApi';
import {
  getCurrentMockUser,
  initAuthStore,
  loginMockUser,
  logoutMockUser,
  registerMockUser,
} from '../mock/authStore';
import { clearAuthToken, setAuthToken } from './tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  initAuthStore();

  const [user, setUser] = useState(getCurrentMockUser());

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
      } catch {
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
      } catch {
        const signedUp = registerMockUser(payload);
        setUser(signedUp);
        return signedUp;
      }
    },
    logout: () => {
      logoutMockUser();
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
