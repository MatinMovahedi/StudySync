'use client';
import { Trophy, Timer, Flame, Users, Brain, Zap, Moon } from 'lucide-react';
import type { Achievement } from '../../lib/api/gamification';

const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  timer: Timer,
  flame: Flame,
  users: Users,
  brain: Brain,
  zap: Zap,
  moon: Moon,
};

const TIER_STYLES = {
  bronze: { icon: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/20' },
  silver: { icon: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20' },
  gold: { icon: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
};

interface BadgeGridProps {
  earned: string[];
  all: Achievement[];
}

export function BadgeGrid({ earned, all }: BadgeGridProps) {
  const earnedSet = new Set(earned);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {all.map((a) => {
        const isEarned = earnedSet.has(a.id);
        const Icon = ICON_MAP[a.icon] ?? Trophy;
        const tier = TIER_STYLES[a.tier];
        return (
          <div
            key={a.id}
            title={a.description}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-opacity ${
              isEarned ? tier.bg : 'bg-surface-elevated border-surface-border opacity-35'
            }`}
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isEarned ? '' : 'opacity-50'}`}>
              <Icon className={`w-4 h-4 ${isEarned ? tier.icon : 'text-text-muted'}`} />
            </div>
            <span className="text-[10px] font-medium text-center leading-tight text-text-secondary line-clamp-2">
              {a.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
