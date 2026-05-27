export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_onboarded: boolean;
  created_at: string;
  profile: UserProfile | null;
}

export interface UserProfile {
  bio: string;
  avatar: string | null;
  university: string;
  program: string;
  year_of_study: number | null;
  courses: string[];
  study_style_tags: string[];
  availability: string;
  website: string;
  github: string;
  linkedin: string;
  skills: string[];
  projects: { title: string; description: string; url: string; tech_stack: string[] }[];
  total_study_hours: number;
  total_sessions: number;
  email_digest_enabled: boolean;
  two_fa_enabled: boolean;
}

export interface StudyGroup {
  id: number;
  name: string;
  description: string;
  course_code: string;
  category: string;
  is_private: boolean;
  max_members: number;
  invite_code: string;
  created_by: UserMini;
  member_count: number;
  is_member: boolean;
  user_role: string | null;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface UserMini {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface Message {
  id: number;
  group: number;
  sender: UserMini;
  content: string;
  message_type: 'text' | 'file' | 'ai_response' | 'system';
  file_url: string;
  file_name: string;
  reactions: Record<string, string[]>;
  reply_to: number | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  timestamp?: string;
}

export interface StudySession {
  id: number;
  group: number;
  created_by: UserMini;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  is_online: boolean;
  join_link: string;
  max_participants: number;
  created_at: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  is_read: boolean;
  related_object_id: number | null;
  related_object_type: string;
  created_at: string;
}

export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  total_study_days: number;
}

export interface FlashCard {
  id: number;
  deck_name: string;
  front: string;
  back: string;
  ai_generated: boolean;
  review_count: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface StudySpot {
  id: number;
  name: string;
  description: string;
  location: string;
  capacity: number;
  amenities: string[];
  rating: number;
  image_url: string;
  is_open_24h: boolean;
  hours: string;
  noise_level: string;
  latitude: number | null;
  longitude: number | null;
}

export interface GroupMembership {
  id: number;
  user: UserMini;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}
