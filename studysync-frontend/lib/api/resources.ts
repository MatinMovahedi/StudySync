import api from './client';

export type ResourceCategory = 'notes' | 'cheatsheet' | 'tutorial' | 'tool' | 'video' | 'article' | 'other';

export interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  content: string;
  category: ResourceCategory;
  tags: string[];
  community: number | null;
  upvotes: number;
  created_by_name: string | null;
  user_voted: boolean;
  created_at: string;
}

export const getResources = (params?: {
  search?: string;
  category?: ResourceCategory;
  tag?: string;
  sort?: 'top' | 'new';
}): Promise<{ results: Resource[] }> =>
  api.get('/api/resources/', { params }).then(r => r.data);

export const createResource = (data: {
  title: string;
  description: string;
  url?: string;
  content?: string;
  category: ResourceCategory;
  tags: string[];
  community?: number | null;
}): Promise<Resource> =>
  api.post('/api/resources/', data).then(r => r.data);

export const voteResource = (id: number): Promise<{ voted: boolean; upvotes: number }> =>
  api.post(`/api/resources/${id}/vote/`).then(r => r.data);
