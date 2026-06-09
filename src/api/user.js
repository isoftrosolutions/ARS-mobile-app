import { api, extractData } from './client';

export async function fetchMe() {
  const res = await api.get('/user/me');
  const data = extractData(res);
  return data?.user || data;
}

export async function updateMe(payload) {
  const res = await api.patch('/user/me', payload);
  const data = extractData(res);
  return data?.user || data;
}
