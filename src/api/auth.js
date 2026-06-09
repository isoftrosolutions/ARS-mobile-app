import { api, extractData } from './client';

export async function login({ loginId, password }) {
  const res = await api.post('/auth/login', { login_id: loginId, password });
  return extractData(res);
}

export async function register({ name, phone, email, password, address, province, district, municipality, ward, street }) {
  const res = await api.post('/auth/register', { name, phone, email, password, address, province, district, municipality, ward, street });
  return extractData(res);
}

export async function forgotPassword({ email }) {
  const res = await api.post('/auth/forgot-password', { email });
  return extractData(res);
}

export async function resetPassword({ email, otp, newPassword }) {
  const res = await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
  return extractData(res);
}

export async function changePassword({ currentPassword, newPassword }) {
  const res = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return extractData(res);
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (_) {
    // stateless JWT — local clear is the source of truth
  }
}

export async function me() {
  const res = await api.get('/user/me');
  return extractData(res);
}


