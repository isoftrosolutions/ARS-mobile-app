import { api, extractData } from './client';

export async function fetchOrders(params = {}) {
  const res = await api.get('/orders', { params });
  const payload = res?.data || {};
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  };
}

export async function fetchOrderDetail(orderId) {
  const res = await api.get(`/orders/${orderId}`);
  return extractData(res);
}

export async function fetchInvoice(orderId) {
  const res = await api.get(`/orders/${orderId}/invoice`);
  return extractData(res);
}

export async function placeOrder({ items, paymentMethod, addressId, notes, couponCode }) {
  const body = {
    items,
    payment_method: paymentMethod,
  };
  if (addressId) body.address_id = addressId;
  if (notes) body.notes = notes;
  if (couponCode) body.coupon_code = couponCode;
  const res = await api.post('/orders', body);
  return extractData(res);
}

export async function cancelOrder(orderId) {
  const res = await api.post(`/orders/${orderId}/cancel`);
  return extractData(res);
}

export async function returnOrder(orderId) {
  const res = await api.post(`/orders/${orderId}/return`);
  return extractData(res);
}

export async function uploadPaymentProof(orderId, imageUri) {
  const formData = new FormData();
  formData.append('proof', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'proof.jpg',
  });
  const res = await api.post(`/orders/${orderId}/payment-proof`, formData);
  return extractData(res);
}
