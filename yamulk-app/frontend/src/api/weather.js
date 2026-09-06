import { api } from './api.js';

// GET /weather/:destinationId
export async function getWeather(destinationId) {
  return api.get(`/weather/${destinationId}`);
}
