import { api } from './client';

export async function fetchReviews(productId, params = {}) {
  const res = await api.get(`/products/${productId}/reviews`, { params });
  const payload = res?.data || {};
  const data = payload.data || {};
  return {
    reviews: data.reviews || [],
    average: data.average_rating || 0,
    total: data.total_reviews || (payload.pagination?.total ?? 0),
    pagination: payload.pagination || null,
  };
}

export async function submitReview(productId, { rating, comment }) {
  const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
  return res.data;
}
