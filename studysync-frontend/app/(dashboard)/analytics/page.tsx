'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Flame, Clock, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { getStreak, getStudyHours, getSubjectBreakdown } from '../../../lib/api/analytics';
import { GlassCard } from '../../../components/shared/GlassCard';
import { GradientText } from '../../../components/shared/GradientText';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { useAuthStore } from '../../../lib/store/authStore';
import { formatStudyHours } from '../../../lib/utils/format';

const COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs">
        <p className="text-text-muted mb-1">{label}</p>
        <p className="text-text-primary font-semibold">{Math.round((payload[0].value || 0) / 60 * 10) / 10}h studied</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { data: streak, isLoading: sLoad } = useQuery({ queryKey: ['streak'], queryFn: getStreak });
  const { data: hours7d } = useQuery({ queryKey: ['study-hours', '7d'], queryFn: () => getStudyHours('7d') });
  const { data: hours30d } = useQuery({ queryKey: ['study-hours', '30d'], queryFn: () => getStudyHours('30d') });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjectBreakdown });

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8">
          <h1 className="text-3xl font-bold"><GradientText>Study Analytics</GradientText></h1>
          <p className="text-text-secondary text-sm mt-1">Your learning journey at a glance</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Current Streak', value: streak ? `${streak.current_streak}d` : '—', icon: <Flame className="w-5 h-5" />, color: '#f59e0b', bg: 'bg-amber-500/10' },
            { label: 'Longest Streak', value: streak ? `${streak.longest_streak}d` : '—', icon: <Trophy className="w-5 h-5" />, color: '#6366f1', bg: 'bg-brand/10' },
            { label: 'Total Study Hours', value: user?.profile ? formatStudyHours(user.profile.total_study_hours) : '—', icon: <Clock className="w-5 h-5" />, color: '#06b6d4', bg: 'bg-cyan-500/10' },
            { label: 'Study Days', value: streak ? `${streak.total_study_days}` : '—', icon: <Calendar className="w-5 h-5" />, color: '#10b981', bg: 'bg-emerald-500/10' },
          ].map((s, i) => (
            <GlassCard key={i} className="p-5" hover>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`} style={{ color: s.color }}>{s.icon}</div>
              <div className="text-2xl font-bold text-text-primary">{sLoad ? <Skeleton className="h-7 w-12" /> : s.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Study hours area chart */}
          <GlassCard className="lg:col-span-2 p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-light" /> Study Hours
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Last 7 days</p>
              </div>
              <div className="text-sm font-semibold text-brand-light">
                {hours7d ? formatStudyHours(hours7d.total_hours) : '—'} total
              </div>
            </div>
            {hours7d ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hours7d.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} fill="url(#studyGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-48" />}
          </GlassCard>

          {/* Subject breakdown */}
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-purple" /> By Subject
            </h2>
            {subjects ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={subjects.breakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="minutes" stroke="none">
                      {subjects.breakdown.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {subjects.breakdown.slice(0, 4).map((s: { subject: string; minutes: number }, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-text-secondary flex-1 truncate">{s.subject}</span>
                      <span className="text-xs font-medium text-text-primary">{formatStudyHours(s.minutes / 60)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <Skeleton className="h-48" />}
          </GlassCard>
        </motion.div>

        {/* 30-day bar chart */}
        <motion.div variants={staggerItem}>
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-text-primary">30-Day Study Activity</h2>
                <p className="text-xs text-text-muted mt-0.5">Minutes studied per day</p>
              </div>
              {hours30d && <div className="text-sm font-semibold text-accent-emerald">{formatStudyHours(hours30d.total_hours)} this month</div>}
            </div>
            {hours30d ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={hours30d.data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="minutes" fill="#6366f1" opacity={0.7} radius={[3,3,0,0]}>
                    {hours30d.data.map((_: unknown, i: number) => (
                      <Cell key={i} fill={i === hours30d.data.length - 1 ? '#818cf8' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-28" />}
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
