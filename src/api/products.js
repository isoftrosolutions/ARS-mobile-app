import { api, extractData } from './client';

export async function fetchCategories() {
  const response = await api.get('/categories');
  return extractData(response) || [];
}

export async function fetchFeaturedProducts() {
  const response = await api.get('/products/featured');
  return extractData(response) || [];
}

export async function fetchNewArrivals() {
  const response = await api.get('/products/new-arrivals');
  return extractData(response) || [];
}

export async function fetchProducts(params = {}) {
  const response = await api.get('/products', { params });
  const payload = response?.data || {};
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  };
}

export async function fetchProductDetails(productId) {
  const response = await api.get(`/products/${productId}`);
  return extractData(response);
}
