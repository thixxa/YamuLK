import { api } from './api.js';

// POST /review/:destinationId/addReview
export async function addReview(destinationId, rating, comment) {
  return api.post(`/review/${destinationId}/addReview`, { rating, comment });
}

// GET /review/:destinationId/allReviews
export async function getAllReviews(destinationId) {
  return api.get(`/review/${destinationId}/allReviews`);
}
