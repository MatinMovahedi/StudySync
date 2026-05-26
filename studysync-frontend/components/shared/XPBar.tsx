'use client';
import { motion } from 'framer-motion';
import { useGamificationStore } from '../../lib/store/gamificationStore';

const XP_PER_LEVEL = 500;

interface XPBarProps {
  collapsed?: boolean;
}

export function XPBar({ collapsed = false }: XPBarProps) {
  const { profile } = useGamificationStore();

  if (!profile) return null;

  const xpIntoLevel = profile.xp % XP_PER_LEVEL;
  const progress = xpIntoLevel / XP_PER_LEVEL;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-brand">{profile.level}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-secondary">Level {profile.level}</span>
        <span className="text-[10px] text-text-muted">{profile.xp.toLocaleString()} XP</span>
      </div>
      <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-text-muted mt-1">{profile.next_level_xp} XP to next level</p>
    </div>
  );
}
