import api from './client';

export interface Assessment {
  name: string;
  score: number;
  max_score: number;
  weight: number;
  type: 'assignment' | 'midterm' | 'final' | 'quiz' | 'project';
}

export interface CourseGrade {
  id: number;
  course_name: string;
  target_grade: string;
  assessments: Assessment[];
  weighted_average: number | null;
  created_at: string;
  updated_at: string;
}

export const getGrades = (): Promise<{ results: CourseGrade[] }> =>
  api.get('/api/analytics/grades/').then(r => r.data);

export const createGrade = (data: { course_name: string; target_grade?: string; assessments?: Assessment[] }): Promise<CourseGrade> =>
  api.post('/api/analytics/grades/', data).then(r => r.data);

export const updateGrade = (id: number, data: Partial<CourseGrade>): Promise<CourseGrade> =>
  api.put(`/api/analytics/grades/${id}/`, data).then(r => r.data);

export const deleteGrade = (id: number): Promise<void> =>
  api.delete(`/api/analytics/grades/${id}/`).then(r => r.data);
