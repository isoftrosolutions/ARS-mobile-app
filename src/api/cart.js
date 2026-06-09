import { api, extractData } from './client';

export async function fetchCart() {
  const res = await api.get('/cart');
  return extractData(res) || [];
}

export async function addToCart({ productId, quantity = 1 }) {
  const res = await api.post('/cart', { product_id: productId, quantity });
  return extractData(res);
}

export async function removeCartItem(cartItemId) {
  const res = await api.delete(`/cart/${cartItemId}`);
  return extractData(res);
}

export async function syncCart(items) {
  const res = await api.post('/cart/sync', { items });
  return extractData(res);
}
