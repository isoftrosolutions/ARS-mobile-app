import { api, extractData } from './client';

export async function fetchAddresses() {
  const res = await api.get('/user/addresses');
  return extractData(res) || [];
}

export async function createAddress(payload) {
  const res = await api.post('/user/addresses', payload);
  return extractData(res);
}

export async function updateAddress(id, payload) {
  const res = await api.patch(`/user/addresses/${id}`, payload);
  return extractData(res);
}

export async function setDefaultAddress(id) {
  const res = await api.patch(`/user/addresses/${id}/set-default`);
  return extractData(res);
}

export async function deleteAddress(id) {
  const res = await api.delete(`/user/addresses/${id}`);
  return extractData(res);
}
