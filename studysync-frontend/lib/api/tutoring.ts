import api from './client';

export interface TutorListing {
  id: number;
  tutor_name: string;
  tutor_avatar: string | null;
  subjects: string[];
  bio: string;
  availability: string;
  is_active: boolean;
  created_at: string;
}

export interface TutoringRequest {
  id: number;
  listing_id: number;
  requester_name: string;
  tutor_name: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export const getTutorListings = (subject?: string): Promise<{ results: TutorListing[] }> =>
  api.get('/api/tutoring/listings/', { params: subject ? { subject } : undefined }).then(r => r.data);

export const createTutorListing = (data: { subjects: string[]; bio: string; availability: string }): Promise<TutorListing> =>
  api.post('/api/tutoring/listings/', data).then(r => r.data);

export const updateTutorListing = (id: number, data: Partial<TutorListing>): Promise<TutorListing> =>
  api.put(`/api/tutoring/listings/${id}/`, data).then(r => r.data);

export const deleteTutorListing = (id: number): Promise<void> =>
  api.delete(`/api/tutoring/listings/${id}/`).then(r => r.data);

export const requestTutoring = (listingId: number, message: string): Promise<TutoringRequest> =>
  api.post(`/api/tutoring/listings/${listingId}/request/`, { message }).then(r => r.data);

export const getIncomingRequests = (): Promise<{ results: TutoringRequest[] }> =>
  api.get('/api/tutoring/requests/incoming/').then(r => r.data);

export const getOutgoingRequests = (): Promise<{ results: TutoringRequest[] }> =>
  api.get('/api/tutoring/requests/outgoing/').then(r => r.data);

export const respondToRequest = (id: number, status: 'accepted' | 'declined'): Promise<TutoringRequest> =>
  api.post(`/api/tutoring/requests/${id}/respond/`, { status }).then(r => r.data);
