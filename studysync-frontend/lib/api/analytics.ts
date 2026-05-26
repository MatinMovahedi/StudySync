import api from './client';

export const getStreak = () => api.get('/api/analytics/streak/').then(r => r.data);
export const getStudyHours = (range: string) => api.get('/api/analytics/study-hours/', { params: { range } }).then(r => r.data);
export const getSubjectBreakdown = () => api.get('/api/analytics/subjects/').then(r => r.data);
export const getHeatmap = (): Promise<{ data: { date: string; minutes: number; intensity: number }[] }> =>
  api.get('/api/analytics/heatmap/').then(r => r.data);
