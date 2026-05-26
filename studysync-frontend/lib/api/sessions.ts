import api from './client';

export interface StudySession {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  is_online: boolean;
  join_link: string;
  max_participants: number;
  group: number;
  group_name: string;
  created_by: { id: number; first_name: string; username: string } | null;
  created_at: string;
}

export interface PomodoroSession {
  id: number;
  duration_minutes: number;
  subject: string;
  completed_at: string | null;
}

function unwrapList<T>(r: { data: unknown }): T[] {
  const d = r.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && 'results' in d && Array.isArray((d as Record<string, unknown>).results))
    return (d as { results: T[] }).results;
  return [];
}

export const getSessions = (from?: string, to?: string) =>
  api.get('/api/sessions/', { params: from && to ? { from, to } : undefined }).then(r => unwrapList<StudySession>(r));

export const createSession = (data: Record<string, unknown>) =>
  api.post('/api/sessions/', data).then(r => r.data as StudySession);

export const deleteSession = (id: number) =>
  api.delete(`/api/sessions/${id}/`);

export const startPomodoro = (duration_minutes: number, subject: string) =>
  api.post('/api/sessions/pomodoro/start/', { duration_minutes, subject }).then(r => r.data as PomodoroSession);

export const completePomodoro = (id: number) =>
  api.post(`/api/sessions/pomodoro/${id}/complete/`).then(r => r.data);

export const getPomodoroHistory = () =>
  api.get('/api/sessions/pomodoro/history/').then(r => unwrapList<PomodoroSession>(r));
