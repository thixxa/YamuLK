import { api } from './api.js';

// POST /user/ — Login (by email)
export async function loginUser({ email, password }) {
  return api.post('/user/', { email, password });
}

// POST /user/register — Register
export async function registerUser({ name, email, password }) {
  return api.post('/user/register', { name, email, password });
}
