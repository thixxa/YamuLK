import { api } from './api.js';

// GET /trip/ — Get logged-in user's trips
export async function getUserTrips() {
  return api.get('/trip/');
}

// POST /trip/ — Create / generate a trip itinerary
export async function createTrip(tripData) {
  return api.post('/trip/', tripData);
}

// DELETE /trip/:id — Delete a trip
export async function deleteTrip(id) {
  return api.delete(`/trip/${id}`);
}

// PATCH /trip/:id — Update a trip
export async function updateTrip(id, updates) {
  return api.patch(`/trip/${id}`, updates);
}
