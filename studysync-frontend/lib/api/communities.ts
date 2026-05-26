import api from './client';

export interface Community {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  member_count: number;
  post_count: number;
  is_member: boolean;
  created_at: string;
}

export interface PostAuthor {
  id: number | null;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  post_type: 'question' | 'discussion' | 'resource' | 'announcement';
  is_anonymous: boolean;
  is_pinned: boolean;
  score: number;
  hot_score: number;
  comment_count: number;
  author: PostAuthor;
  community: { slug: string; name: string; icon: string };
  created_at: string;
  user_vote: 1 | -1 | 0;
  is_saved: boolean;
}

export interface Comment {
  id: number;
  body: string;
  is_anonymous: boolean;
  score: number;
  author: PostAuthor;
  parent: number | null;
  replies: Comment[];
  created_at: string;
  user_vote: 1 | -1 | 0;
}

export const getCommunities = () => api.get('/api/communities/').then(r => r.data);
export const getCommunity = (slug: string) => api.get(`/api/communities/${slug}/`).then(r => r.data);
export const joinCommunity = (slug: string) => api.post(`/api/communities/${slug}/join/`).then(r => r.data);
export const getCommunityPosts = (slug: string, params?: { sort?: string; type?: string }) =>
  api.get(`/api/communities/${slug}/posts/`, { params }).then(r => r.data);
export const createPost = (slug: string, data: { title: string; body?: string; post_type?: string; is_anonymous?: boolean }) =>
  api.post(`/api/communities/${slug}/posts/`, data).then(r => r.data);
export const getGlobalFeed = (params?: { sort?: string }) =>
  api.get('/api/communities/feed/', { params }).then(r => r.data);
export const getPost = (id: number) => api.get(`/api/posts/${id}/`).then(r => r.data);
export const votePost = (id: number, value: 1 | -1 | 0) =>
  api.post(`/api/posts/${id}/vote/`, { value }).then(r => r.data);
export const savePost = (id: number) => api.post(`/api/posts/${id}/save/`).then(r => r.data);
export const getPostComments = (id: number) => api.get(`/api/posts/${id}/comments/`).then(r => r.data);
export const createComment = (postId: number, data: { body: string; parent?: number; is_anonymous?: boolean }) =>
  api.post(`/api/posts/${postId}/comments/`, data).then(r => r.data);
export const voteComment = (id: number, value: 1 | -1 | 0) =>
  api.post(`/api/comments/${id}/vote/`, { value }).then(r => r.data);
export const getSavedPosts = () => api.get('/api/communities/saved/').then(r => r.data);

export interface WikiPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  created_by_name: string | null;
  updated_by_name: string | null;
  updated_at: string;
  created_at: string;
}

export const getWikiPages = (communitySlug: string): Promise<{ results: WikiPage[] }> =>
  api.get(`/api/communities/${communitySlug}/wiki/`).then(r => r.data);

export const getWikiPage = (communitySlug: string, pageSlug: string): Promise<WikiPage> =>
  api.get(`/api/communities/${communitySlug}/wiki/${pageSlug}/`).then(r => r.data);

export const createWikiPage = (communitySlug: string, data: { slug: string; title: string; content: string }): Promise<WikiPage> =>
  api.post(`/api/communities/${communitySlug}/wiki/`, data).then(r => r.data);

export const updateWikiPage = (communitySlug: string, pageSlug: string, data: { title?: string; content?: string }): Promise<WikiPage> =>
  api.put(`/api/communities/${communitySlug}/wiki/${pageSlug}/`, data).then(r => r.data);
