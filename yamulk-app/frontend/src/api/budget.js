import { api } from './api.js';

// GET /budget/:tripId
export async function getBudgetByTrip(tripId) {
  return api.get(`/budget/${tripId}`);
}

// POST /budget/:tripId
export async function updateBudget(tripId, updates) {
  return api.post(`/budget/${tripId}`, updates);
}
