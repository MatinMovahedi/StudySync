import api from './client';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface GamificationProfile {
  xp: number;
  level: number;
  achievements: string[];
  achievements_detail: Achievement[];
  all_achievements: Achievement[];
  next_level_xp: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  xp: number;
  level: number;
  achievement_count: number;
}

export interface LeaderboardResponse {
  results: LeaderboardEntry[];
  current_user_id: number;
}

export async function getGamificationProfile(): Promise<GamificationProfile> {
  const { data } = await api.get('/api/gamification/profile/');
  return data;
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const { data } = await api.get('/api/gamification/leaderboard/');
  return data;
}
