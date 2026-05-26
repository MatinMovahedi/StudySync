'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal } from 'lucide-react';
import { getLeaderboard } from '../../../lib/api/gamification';
import { Avatar } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

const XP_PER_LEVEL = 500;

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-amber-400" />;
  if (rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="text-xs font-mono text-text-muted w-4 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    staleTime: 60000,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-xl font-bold text-text-primary mb-1">Leaderboard</h1>
        <p className="text-sm text-text-muted mb-6">Top 20 students by XP this week</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {data?.results.map((entry) => {
            const isMe = entry.user_id === data.current_user_id;
            const xpIntoLevel = entry.xp % XP_PER_LEVEL;
            const progress = xpIntoLevel / XP_PER_LEVEL;

            return (
              <motion.div
                key={entry.user_id}
                variants={staggerItem}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors ${
                  isMe
                    ? 'bg-brand/5 border-brand/20'
                    : 'bg-surface-card border-surface-border hover:bg-surface-elevated'
                }`}
              >
                <div className="w-6 flex items-center justify-center flex-shrink-0">
                  <RankIcon rank={entry.rank} />
                </div>

                <Avatar
                  name={`${entry.first_name} ${entry.last_name}`}
                  src={entry.avatar}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isMe ? 'text-brand' : 'text-text-primary'}`}>
                      {entry.first_name} {entry.last_name}
                      {isMe && <span className="text-xs text-brand ml-1">(you)</span>}
                    </span>
                    <span className="text-[10px] text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded-md flex-shrink-0">
                      Lv {entry.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted tabular-nums">
                      {entry.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-text-muted">{entry.achievement_count} badges</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
