import api from './client';
import { Notification } from '../types';

function unwrapList<T>(r: { data: unknown }): T[] {
  const d = r.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && 'results' in d && Array.isArray((d as Record<string, unknown>).results))
    return (d as { results: T[] }).results;
  return [];
}

export const getNotifications = () => api.get('/api/notifications/').then(r => unwrapList<Notification>(r));
export const markRead = (id: number) => api.patch(`/api/notifications/${id}/read/`).then(r => r.data);
export const markAllRead = () => api.post('/api/notifications/read-all/').then(r => r.data);
export const deleteNotification = (id: number) => api.delete(`/api/notifications/${id}/delete/`);
export const clearNotifications = () => api.delete('/api/notifications/clear/');
