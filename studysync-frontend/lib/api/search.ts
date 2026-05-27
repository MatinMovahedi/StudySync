import api from './client';

export interface SearchResults {
  groups: { id: number; name: string; category: string; member_count: number }[];
  resources: { id: number; title: string; category: string }[];
  communities: { id: number; name: string; slug: string }[];
}

export async function globalSearch(q: string): Promise<SearchResults> {
  const { data } = await api.get('/api/search/', { params: { q } });
  return data;
}
