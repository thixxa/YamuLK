import { api } from './api.js';

// GET /saved
export async function getSavedItems() {
  return api.get('/saved');
}

// POST /saved
export async function saveItem(itemType, itemId) {
  return api.post('/saved', { itemType, itemId });
}

// DELETE /saved/:id
export async function removeSavedItem(id) {
  return api.delete(`/saved/${id}`);
}

// DELETE /saved/item/:itemId
export async function removeSavedItemByItemId(itemId) {
  return api.delete(`/saved/item/${itemId}`);
}
