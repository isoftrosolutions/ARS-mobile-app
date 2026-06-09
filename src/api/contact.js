import { api, extractData } from './client';

export async function submitContact({ subject, message }) {
  const res = await api.post('/contact', { subject, message });
  return extractData(res);
}
