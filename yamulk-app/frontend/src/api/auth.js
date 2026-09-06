import { api } from './api.js';

// POST /user/ — Login (by email)
export async function loginUser({ email, password }) {
  return api.post('/user/', { email, password });
}

// POST /user/register — Register
export async function registerUser({ name, email, password }) {
  return api.post('/user/register', { name, email, password });
}

// PATCH /user/updateProfile — Update name / password
export async function updateUserProfile(payload) {
  return api.patch('/user/updateProfile', payload);
}
