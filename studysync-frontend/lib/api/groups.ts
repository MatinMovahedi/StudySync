import api from './client';
import { StudyGroup } from '../types';

function unwrapList<T>(r: { data: unknown }): T[] {
  const d = r.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && 'results' in d && Array.isArray((d as Record<string, unknown>).results))
    return (d as { results: T[] }).results;
  return [];
}

interface GroupMember {
  id: number;
  user: { id: number; first_name: string; last_name: string; avatar: string | null; email: string };
  role: string;
  joined_at: string;
}

export const getGroups = (params?: Record<string, string>) =>
  api.get('/api/groups/', { params }).then(r => unwrapList<StudyGroup>(r));

export const getMyGroups = () => api.get('/api/groups/my/').then(r => unwrapList<StudyGroup>(r));
export const getGroup = (id: number) => api.get(`/api/groups/${id}/`).then(r => r.data as StudyGroup);
export const createGroup = (data: Record<string, unknown>) => api.post('/api/groups/', data).then(r => r.data as StudyGroup);
export const joinGroup = (id: number) => api.post(`/api/groups/${id}/join/`).then(r => r.data);
export const leaveGroup = (id: number) => api.post(`/api/groups/${id}/leave/`).then(r => r.data);
export const getGroupMembers = (id: number) => api.get(`/api/groups/${id}/members/`).then(r => unwrapList<GroupMember>(r));

export interface WhiteboardData {
  state: Record<string, unknown>;
  updated_at: string;
  updated_by: { id: number; name: string } | null;
}

export const getWhiteboard = (id: number) => api.get(`/api/groups/${id}/whiteboard/`).then(r => r.data as WhiteboardData);
export const saveWhiteboard = (id: number, state: Record<string, unknown>) =>
  api.put(`/api/groups/${id}/whiteboard/`, { state }).then(r => r.data as { updated_at: string });
