'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, Flame, ArrowRight, Calendar, Hash, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/store/authStore';
import { useNotificationStore } from '../../../lib/store/notificationStore';
import { useGamificationStore } from '../../../lib/store/gamificationStore';
import { useChatStore } from '../../../lib/store/chatStore';
import { getMyGroups } from '../../../lib/api/groups';
import { getStreak } from '../../../lib/api/analytics';
import { getSessions } from '../../../lib/api/sessions';
import { Avatar } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { AICopilotCard } from '../../../components/shared/AICopilotCard';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { formatDateTime, formatRelativeTime } from '../../../lib/utils/format';

const CATEGORY_BADGE: Record<string, 'default' | 'muted'> = {
  exam_prep: 'default', general: 'muted',
};

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];

const XP_PER_LEVEL = 500;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const { profile: gamification } = useGamificationStore();
  const { onlineUsers } = useChatStore();
  const { data: groups, isLoading: groupsLoading } = useQuery({ queryKey: ['my-groups'], queryFn: getMyGroups });
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: getStreak });
  const { data: sessions } = useQuery<import('../../../lib/api/sessions').StudySession[]>({ queryKey: ['sessions'], queryFn: () => getSessions() });

  const hour = new Date().getHours();
  const greeting = GREETINGS[hour < 12 ? 0 : hour < 17 ? 1 : 2];
  const streakVal = streak?.current_streak ?? 0;
  const groupList = (groups as unknown[]) ?? [];
  const sessionList = (sessions as unknown[]) ?? [];
  const recentActivity = notifications.slice(0, 5);
  const xpProgress = gamification ? ((gamification.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={staggerItem} className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-text-muted mb-1.5">{greeting}</p>
            <h1 className="text-3xl font-semibold text-text-primary leading-tight">
              {user?.first_name || 'Student'}
            </h1>
            {user?.profile?.university && (
              <p className="text-text-muted text-sm mt-1">
                {user.profile.university}
                {user.profile.program && <span className="text-text-muted/50 mx-2">·</span>}
                {user.profile.program}
              </p>
            )}
          </div>
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            src={user?.profile?.avatar}
            size="lg"
            className="flex-shrink-0"
          />
        </motion.div>

        {streakVal > 0 && (
          <motion.div variants={staggerItem} className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-text-primary">{streakVal}</span>
            <span className="text-sm text-text-muted">day streak</span>
            {streak?.longest_streak && (
              <>
                <span className="text-text-muted/30 mx-1">·</span>
                <span className="text-xs text-text-muted">best {streak.longest_streak}d</span>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center border border-surface-border rounded-md divide-x divide-surface-border mb-7 overflow-x-auto"
      >
        {[
          { label: 'Study hours', value: `${user?.profile?.total_study_hours ?? 0}`, unit: 'hrs' },
          { label: 'Groups', value: `${groupList.length}`, unit: 'active' },
          { label: 'Sessions', value: `${user?.profile?.total_sessions ?? 0}`, unit: 'done' },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 min-w-[80px] px-3 sm:px-4 py-3">
            <div className="text-xl font-bold text-text-primary tabular-nums">{stat.value}
              <span className="text-sm font-normal text-text-muted ml-1">{stat.unit}</span>
            </div>
            <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
        {/* XP widget */}
        {gamification && (
          <Link href="/leaderboard" className="flex-1 min-w-[80px] px-3 sm:px-4 py-3 hover:bg-surface-elevated transition-colors group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-brand" />
                <span className="text-xl font-bold text-text-primary tabular-nums">{gamification.level}</span>
                <span className="text-sm font-normal text-text-muted">lvl</span>
              </div>
              <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="text-xs text-text-muted mt-0.5">XP progress</div>
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* My Groups */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">My Groups</h2>
            <Link href="/groups" className="text-xs text-text-muted hover:text-brand transition-colors flex items-center gap-1">
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
            {groupsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-none" />)
            ) : groupList.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="w-6 h-6 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted mb-3">No groups yet</p>
                <Link href="/groups">
                  <Button size="sm" variant="secondary">Find a study group</Button>
                </Link>
              </div>
            ) : (
              (groupList as { id: number; name: string; category: string; member_count: number; course_code: string; avatar_color: string }[]).slice(0, 5).map((group) => {
                const onlineCount = (onlineUsers[group.id] || []).length;
                return (
                  <Link key={group.id} href={`/groups/${group.id}/chat`}>
                    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors">
                      <div className="w-7 h-7 rounded-md bg-surface-elevated flex items-center justify-center flex-shrink-0">
                        <Hash className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">{group.name}</span>
                          {onlineCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-brand flex-shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                              {onlineCount} online
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted">{group.course_code || group.category.replace('_', ' ')}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={CATEGORY_BADGE[group.category] ?? 'muted'} className="text-[10px] hidden sm:inline-flex">
                          {group.category.replace('_', ' ')}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* AI Copilot */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AICopilotCard />
          </motion.div>

          {/* Activity feed */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Recent Activity</h2>
            <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
              {recentActivity.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-text-muted">No recent activity — start a session!</p>
                </div>
              ) : (
                recentActivity.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-brand' : 'bg-surface-elevated'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{formatRelativeTime(n.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming sessions */}
          {sessionList.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Upcoming</h2>
              <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
                {(sessionList as { id: number; title: string; scheduled_at: string; is_online: boolean; join_link: string }[]).slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-md bg-surface-elevated flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{session.title}</div>
                      <div className="text-xs text-text-muted mt-0.5">{formatDateTime(session.scheduled_at)}</div>
                      {session.is_online && session.join_link && (
                        <a href={session.join_link} target="_blank" rel="noopener noreferrer"
                           className="text-xs text-brand hover:underline mt-1 inline-block">
                          Join link →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
