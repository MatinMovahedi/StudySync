'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Headphones, Users, ChevronLeft, Hash } from 'lucide-react';
import { getMyGroups } from '../../../lib/api/groups';
import { useAuthStore } from '../../../lib/store/authStore';
import { useFocusRoom } from '../../../hooks/useFocusRoom';
import { SyncTimer } from '../../../components/shared/SyncTimer';
import { Skeleton } from '../../../components/ui/skeleton';
import { fadeInUp } from '../../../lib/utils/animations';

interface Group {
  id: number;
  name: string;
  course_code: string;
  category: string;
  member_count: number;
  created_by: { id: number };
}

function FocusRoom({ group, userId, onLeave }: { group: Group; userId: number; onLeave: () => void }) {
  const { focusState, startFocus, stopFocus } = useFocusRoom(group.id);
  const isHost = group.created_by?.id === userId;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-8 py-4"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Leave room"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-text-primary">{group.name}</h2>
          <p className="text-xs text-text-muted flex items-center justify-center gap-1.5 mt-0.5">
            <Hash className="w-3 h-3" />
            {group.course_code || group.category.replace('_', ' ')}
            {isHost && <span className="text-brand ml-1">(you are the host)</span>}
          </p>
        </div>
      </div>

      <SyncTimer
        focusState={focusState}
        isHost={isHost}
        onStart={startFocus}
        onStop={stopFocus}
      />

      <div className="text-center max-w-xs">
        <p className="text-xs text-text-muted leading-relaxed">
          {focusState.active
            ? 'All members in this room see the same timer. Stay focused.'
            : 'Start a focus session to sync everyone\'s timer in this group.'}
        </p>
      </div>
    </motion.div>
  );
}

export default function FocusPage() {
  const { user } = useAuthStore();
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const { data: groups, isLoading } = useQuery({ queryKey: ['my-groups'], queryFn: getMyGroups });

  const groupList = (groups as unknown as Group[]) ?? [];

  if (activeGroup) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <FocusRoom group={activeGroup} userId={user?.id ?? 0} onLeave={() => setActiveGroup(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3 mb-2">
          <Headphones className="w-5 h-5 text-brand" />
          <h1 className="text-xl font-bold text-text-primary">Focus Rooms</h1>
        </div>
        <p className="text-sm text-text-muted mb-6">
          Synchronized Pomodoro sessions — everyone in the room sees the same timer.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : groupList.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">Join a study group to access Focus Rooms.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {groupList.map((group, i) => (
              <motion.button
                type="button"
                key={group.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveGroup(group)}
                className="w-full flex items-center gap-4 px-4 py-4 bg-surface-card border border-surface-border rounded-lg hover:border-brand/30 hover:bg-surface-elevated transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{group.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {group.course_code || group.category.replace('_', ' ')} · {group.member_count} members
                  </div>
                </div>
                <div className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  Enter →
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
