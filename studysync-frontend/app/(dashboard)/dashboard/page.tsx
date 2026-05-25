'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Brain, Users, Flame, Clock, ArrowRight, Zap, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/store/authStore';
import { getMyGroups } from '../../../lib/api/groups';
import { getStreak } from '../../../lib/api/analytics';
import { getSessions } from '../../../lib/api/sessions';
import { GradientText } from '../../../components/shared/GradientText';
import { Avatar } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { formatDateTime } from '../../../lib/utils/format';

const CATEGORY_COLORS: Record<string, 'default' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'muted'> = {
  exam_prep: 'default', assignment_help: 'cyan', coding_session: 'purple',
  quiet_studying: 'emerald', project_collab: 'amber', general: 'muted',
};

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: groups, isLoading: groupsLoading } = useQuery({ queryKey: ['my-groups'], queryFn: getMyGroups });
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: getStreak });
  const { data: sessions } = useQuery({ queryKey: ['sessions'], queryFn: getSessions });

  const hour = new Date().getHours();
  const greeting = GREETINGS[hour < 12 ? 0 : hour < 17 ? 1 : 2];
  const streakVal = streak?.current_streak ?? 0;
  const groupList = (groups as unknown[]) ?? [];
  const sessionList = (sessions as unknown[]) ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-10">
        <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-2">{greeting}</p>
            <h1 className="text-4xl font-black text-text-primary leading-tight">
              <GradientText>{user?.first_name || 'Student'}</GradientText>
            </h1>
            {user?.profile?.university && (
              <p className="text-text-muted text-sm mt-1.5">
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
            className="flex-shrink-0 ring-2 ring-brand/20 ring-offset-2 ring-offset-surface"
          />
        </motion.div>
      </motion.div>

      {/* Streak hero card */}
      {streakVal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-accent-amber/25 bg-gradient-to-r from-accent-amber/8 via-accent-amber/4 to-transparent p-5 flex items-center gap-5">
            <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-accent-amber/5 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-accent-amber/15 border border-accent-amber/25 flex items-center justify-center flex-shrink-0">
              <Flame className="w-7 h-7 text-accent-amber" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-black text-text-primary">
                {streakVal} <span className="text-lg font-semibold text-accent-amber">day{streakVal !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                Study streak — keep it going, don't break the chain
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
              <p className="text-xs text-text-muted">Best streak</p>
              <p className="text-2xl font-bold text-text-primary">{streak?.longest_streak ?? 0}d</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Study hours', value: user?.profile?.total_study_hours ?? 0, unit: 'hrs total', icon: Clock, color: 'text-brand-light', bg: 'bg-brand/10', border: 'border-brand/15' },
          { label: 'Groups', value: groupList.length, unit: 'active', icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/15' },
          { label: 'Sessions', value: user?.profile?.total_sessions ?? 0, unit: 'completed', icon: Zap, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/15' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <div className={`rounded-xl border ${stat.border} p-4 bg-surface-card`}>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* My Groups — wider */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">My Groups</h2>
            <Link href="/groups">
              <button type="button" className="text-xs text-text-muted hover:text-brand-light transition-colors flex items-center gap-1">
                Browse all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          <div className="space-y-2">
            {groupsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : groupList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                <Users className="w-7 h-7 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No groups yet</p>
                <Link href="/groups">
                  <Button size="sm" variant="glass" className="mt-3">Find a study group</Button>
                </Link>
              </div>
            ) : (
              (groupList as { id: number; name: string; category: string; member_count: number; course_code: string; avatar_color: string }[]).slice(0, 5).map((group) => (
                <Link key={group.id} href={`/groups/${group.id}/chat`}>
                  <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-200">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-avatar-icon"
                      style={{ '--gc': group.avatar_color } as React.CSSProperties}
                    >
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{group.name}</div>
                      <div className="text-xs text-text-muted">{group.course_code || group.category.replace('_', ' ')}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={CATEGORY_COLORS[group.category] ?? 'muted'} className="text-[10px] hidden sm:inline-flex">
                        {group.category.replace('_', ' ')}
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* AI Quick access */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/10 to-accent-purple/5 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/25 flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-brand-light" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary">AI Study Assistant</div>
                  <div className="text-xs text-text-muted">Quiz · Summarize · Flashcards</div>
                </div>
              </div>
              <Link href="/ai">
                <Button size="sm" className="w-full gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Open AI Assistant
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Upcoming sessions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3">Upcoming</h2>
            <div className="space-y-2">
              {sessionList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                  <p className="text-xs text-text-muted">No upcoming sessions</p>
                </div>
              ) : (
                (sessionList as { id: number; title: string; scheduled_at: string; is_online: boolean; join_link: string }[]).slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/5 bg-surface-card">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{session.title}</div>
                      <div className="text-xs text-text-muted mt-0.5">{formatDateTime(session.scheduled_at)}</div>
                      {session.is_online && session.join_link && (
                        <a href={session.join_link} target="_blank" rel="noopener noreferrer"
                           className="text-xs text-brand-light hover:underline mt-1 inline-block">
                          Join link →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
