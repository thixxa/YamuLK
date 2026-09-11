import { api } from './api.js';

// POST /user/ — Login (by email)
export async function loginUser({ email, password }) {
  return api.post('/user/', { email, password });
}

// POST /user/register — Register
export async function registerUser({ name, email, password }) {
  return api.post('/user/register', { name, email, password });
}

// POST /user/google — Google OAuth (exchange access_token for JWT)
export async function googleAuth({ access_token }) {
  return api.post('/user/google', { access_token });
}

// PATCH /user/updateProfile — Update name / password
export async function updateUserProfile(payload) {
  return api.patch('/user/updateProfile', payload);
}
