import api from './client';
import { StudySpot } from '../types';

function unwrapList<T>(r: { data: unknown }): T[] {
  const d = r.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && 'results' in d && Array.isArray((d as Record<string, unknown>).results))
    return (d as { results: T[] }).results;
  return [];
}

export const getSpots = () => api.get('/api/campus/spots/').then(r => unwrapList<StudySpot>(r));
