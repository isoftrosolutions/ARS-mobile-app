import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setStoredToken,
  getStoredToken,
  setUnauthorizedHandler,
  USER_KEY,
} from '../api/client';
import * as AuthApi from '../api/auth';

const AuthContext = createContext(null);

const REMEMBER_KEY = '@ars_remember_me';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const remember = await AsyncStorage.getItem(REMEMBER_KEY);
        if (remember === 'true') {
          const storedToken = await getStoredToken();
          const storedUserJson = await AsyncStorage.getItem(USER_KEY);
          if (storedToken) setToken(storedToken);
          if (storedUserJson) setUser(JSON.parse(storedUserJson));
        }
      } finally {
        setBootstrapping(false);
      }
    })();

    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const persistAuth = useCallback(async (nextToken, nextUser) => {
    await setStoredToken(nextToken || null);
    if (nextUser) await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else await AsyncStorage.removeItem(USER_KEY);
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const signIn = useCallback(async ({ loginId, password, rememberMe = true }) => {
    const data = await AuthApi.login({ loginId, password });
    await persistAuth(data?.token, data?.user);
    await AsyncStorage.setItem(REMEMBER_KEY, rememberMe ? 'true' : 'false');
    return data;
  }, [persistAuth]);

  const signUp = useCallback(async (payload) => {
    const data = await AuthApi.register(payload);
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await AuthApi.logout();
    await persistAuth(null, null);
    await AsyncStorage.setItem(REMEMBER_KEY, 'false');
  }, [persistAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await AuthApi.me();
      if (fresh) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
        setUser(fresh);
      }
    } catch (_) {}
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      bootstrapping,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, bootstrapping, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
