'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useGamificationStore } from '../../lib/store/gamificationStore';
import { popIn } from '../../lib/utils/animations';

const TIER_COLORS = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-amber-400',
};

const TIER_BG = {
  bronze: 'bg-amber-600/10 border-amber-600/20',
  silver: 'bg-gray-400/10 border-gray-400/20',
  gold: 'bg-amber-400/10 border-amber-400/20',
};

export function AchievementToast() {
  const { pendingUnlock, dismissUnlock } = useGamificationStore();

  useEffect(() => {
    if (!pendingUnlock) return;
    const timer = setTimeout(dismissUnlock, 5000);
    return () => clearTimeout(timer);
  }, [pendingUnlock, dismissUnlock]);

  return (
    <AnimatePresence>
      {pendingUnlock && (
        <motion.div
          key={pendingUnlock.id}
          variants={popIn}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
          className="fixed bottom-20 right-5 z-50 w-72 bg-surface-card border border-surface-border rounded-lg shadow-card p-4"
        >
          <button
            type="button"
            onClick={dismissUnlock}
            className="absolute top-2.5 right-2.5 text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-md border flex items-center justify-center flex-shrink-0 ${TIER_BG[pendingUnlock.tier]}`}>
              <Trophy className={`w-5 h-5 ${TIER_COLORS[pendingUnlock.tier]}`} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-brand uppercase tracking-widest mb-0.5">Achievement unlocked</p>
              <p className="text-sm font-semibold text-text-primary">{pendingUnlock.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{pendingUnlock.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
