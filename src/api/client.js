import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const configuredBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl;

export const baseURL = configuredBaseUrl || 'https://easyshoppingars.com/api/v1';

export const TOKEN_KEY = 'ars.auth.token';
export const USER_KEY = 'ars.auth.user';

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

let cachedToken = null;
export async function setStoredToken(token) {
  cachedToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
export async function getStoredToken() {
  if (cachedToken !== null) return cachedToken;
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  cachedToken = t || null;
  return cachedToken;
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await setStoredToken(null);
      await AsyncStorage.removeItem(USER_KEY);
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(err);
  },
);

export const extractData = (response) => response?.data?.data;

export function extractError(err, fallback = 'Something went wrong') {
  const resp = err?.response?.data;
  if (resp?.errors && typeof resp.errors === 'object') {
    const msgs = [];
    Object.values(resp.errors).forEach((v) => {
      if (Array.isArray(v)) msgs.push(...v);
      else if (v) msgs.push(String(v));
    });
    if (msgs.length) return msgs.join('\n');
  }
  if (resp?.message) return resp.message;
  if (err?.message) return err.message;
  return fallback;
}
