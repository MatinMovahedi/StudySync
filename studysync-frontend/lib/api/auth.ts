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

export async function getUserById(id: number): Promise<User> {
  const { data } = await api.get(`/api/users/${id}/`);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.patch('/api/users/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function setup2FA(): Promise<{ secret: string; qr_code: string }> {
  const { data } = await api.get('/api/users/2fa/setup/');
  return data;
}

export async function enable2FA(secret: string, code: string): Promise<{ enabled: boolean }> {
  const { data } = await api.post('/api/users/2fa/enable/', { secret, code });
  return data;
}

export async function disable2FA(code: string): Promise<{ enabled: boolean }> {
  const { data } = await api.post('/api/users/2fa/disable/', { code });
  return data;
}

export async function verify2FA(tempToken: string, code: string) {
  const { data } = await api.post('/api/auth/2fa/verify/', { temp_token: tempToken, code });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
}
