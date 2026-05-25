import api from './client';
import { User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await api.post('/api/auth/login/', { email, password });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
}

export async function register(payload: {
  email: string; username: string; first_name: string; last_name: string; password: string; password_confirm: string;
}) {
  const { data } = await api.post('/api/users/register/', payload);
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/api/users/me/');
  return data;
}

export async function completeOnboarding(payload: Record<string, unknown>) {
  const { data } = await api.post('/api/users/onboarding/', payload);
  return data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
