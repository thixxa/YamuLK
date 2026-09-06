import { api } from './api.js';

// GET /destinations?search=...
export async function searchDestinations(searchQuery) {
  const url = searchQuery ? `/destinations?search=${encodeURIComponent(searchQuery)}` : '/destinations';
  return api.get(url);
}

// GET /destinations/:id
export async function getDestinationById(id) {
  return api.get(`/destinations/${id}`);
}
