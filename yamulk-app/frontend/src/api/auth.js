import { api } from './api.js';

// POST /user/ — Login
export async function loginUser({ name, password }) {
  return api.post('/user/', { name, password });
}

// POST /user/register — Register
export async function registerUser({ name, email, password }) {
  return api.post('/user/register', { name, email, password });
}
