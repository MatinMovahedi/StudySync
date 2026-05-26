import api from './client';

export interface StudyBlock {
  day: string;
  subject: string;
  duration_min: number;
  task: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudyPlan {
  id: number;
  week_start: string;
  goal: string;
  plan_data: StudyBlock[];
  created_at: string;
}

export const generateStudyPlan = (data: {
  goal: string;
  hours_per_day: number;
  week_start: string;
}): Promise<StudyPlan> =>
  api.post('/api/ai/planner/', data).then(r => r.data);

export const getStudyPlans = (): Promise<StudyPlan[]> =>
  api.get('/api/ai/planner/').then(r => r.data);
