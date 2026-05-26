import { create } from 'zustand';
import type { GamificationProfile, Achievement } from '../api/gamification';

interface GamificationState {
  profile: GamificationProfile | null;
  pendingUnlock: Achievement | null;
  setProfile: (profile: GamificationProfile) => void;
  unlockAchievement: (achievement: Achievement) => void;
  dismissUnlock: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  profile: null,
  pendingUnlock: null,
  setProfile: (profile) => set({ profile }),
  unlockAchievement: (achievement) => set({ pendingUnlock: achievement }),
  dismissUnlock: () => set({ pendingUnlock: null }),
}));
