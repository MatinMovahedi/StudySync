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
  active_viewers: { id: number; name: string }[];
}

export interface WhiteboardSnapshotSummary {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
}

export const getWhiteboard = (id: number) => api.get(`/api/groups/${id}/whiteboard/`).then(r => r.data as WhiteboardData);
export const saveWhiteboard = (id: number, state: Record<string, unknown>) =>
  api.put(`/api/groups/${id}/whiteboard/`, { state }).then(r => r.data as { updated_at: string });

export const getSnapshots = (id: number) =>
  api.get(`/api/groups/${id}/whiteboard/snapshots/`).then(r => r.data as WhiteboardSnapshotSummary[]);
export const saveSnapshot = (id: number, name: string, state: Record<string, unknown>) =>
  api.post(`/api/groups/${id}/whiteboard/snapshots/`, { name, state }).then(r => r.data as WhiteboardSnapshotSummary);
export const deleteSnapshot = (id: number, snapId: number) =>
  api.delete(`/api/groups/${id}/whiteboard/snapshots/${snapId}/`);
export const restoreSnapshot = (id: number, snapId: number) =>
  api.post(`/api/groups/${id}/whiteboard/snapshots/${snapId}/restore/`).then(r => r.data as { state: Record<string, unknown>; updated_at: string });

export interface GroupInviteInfo {
  id: number;
  name: string;
  description: string;
  category: string;
  member_count: number;
  max_members: number;
  avatar_color: string;
}

export const getGroupByInviteCode = (code: string) =>
  api.get(`/api/groups/invite/${code}/`).then(r => r.data as GroupInviteInfo);

export const joinGroupByInviteCode = (code: string) =>
  api.post(`/api/groups/invite/${code}/`).then(r => r.data as { message: string; group_id: number });
