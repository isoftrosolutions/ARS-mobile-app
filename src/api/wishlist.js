import { api, extractData } from './client';

export async function fetchWishlist() {
  const res = await api.get('/wishlist');
  return extractData(res) || [];
}

export async function addToWishlist(productId) {
  const res = await api.post('/wishlist', { product_id: productId });
  return res.data;
}

export async function removeWishlist(wishlistId) {
  const res = await api.delete(`/wishlist/${wishlistId}`);
  return extractData(res);
}

export async function checkWishlist(productId) {
  try {
    const res = await api.get(`/wishlist/check/${productId}`);
    return extractData(res) || res.data;
  } catch (_) {
    return null;
  }
}
