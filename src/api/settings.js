import { api, extractData } from './client';

export async function fetchShippingSettings() {
  const res = await api.get('/settings/shipping');
  return extractData(res) || { free_shipping_threshold: 5000, shipping_cost: 100 };
}
