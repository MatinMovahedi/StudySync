'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { generateStudyPlan, getStudyPlans, StudyBlock, StudyPlan } from '../../../lib/api/planner';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SUBJECT_COLORS = [
  'bg-brand/20 text-brand border-brand/30',
  'bg-cyan-400/20 text-cyan-400 border-cyan-400/30',
  'bg-purple-400/20 text-purple-400 border-purple-400/30',
  'bg-amber-400/20 text-amber-400 border-amber-400/30',
  'bg-rose-400/20 text-rose-400 border-rose-400/30',
  'bg-indigo-400/20 text-indigo-400 border-indigo-400/30',
];

const PRIORITY_DOTS = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-brand',
};

function PlanGrid({ plan }: { plan: StudyBlock[] }) {
  const subjectMap = new Map<string, number>();
  plan.forEach(b => {
    if (!subjectMap.has(b.subject)) subjectMap.set(b.subject, subjectMap.size);
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {DAYS.map(day => {
        const block = plan.find(b => b.day === day);
        return (
          <div key={day} className="flex flex-col gap-1.5">
            <div className="text-center text-xs font-medium text-text-muted pb-1 border-b border-surface-border">
              {day.slice(0, 3)}
            </div>
            {block ? (
              <div className={`rounded-lg border p-2 text-xs ${SUBJECT_COLORS[subjectMap.get(block.subject) ?? 0]}`}>
                <div className="flex items-center gap-1 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[block.priority]}`} />
                  <span className="font-semibold truncate">{block.subject}</span>
                </div>
                <div className="flex items-center gap-1 text-current opacity-70">
                  <Clock className="w-3 h-3" />
                  <span>{block.duration_min}m</span>
                </div>
                <p className="mt-1 text-[10px] leading-tight opacity-80 line-clamp-3">{block.task}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-surface-border p-2 text-xs text-text-muted text-center">
                Rest
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PastPlanAccordion({ plan }: { plan: StudyPlan }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard className="overflow-hidden" hover={false}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <p className="text-text-primary font-medium text-sm">Week of {plan.week_start}</p>
          {plan.goal && <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{plan.goal}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              <PlanGrid plan={plan.plan_data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function PlannerPage() {
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState(3);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);

  const { data: pastPlans } = useQuery({ queryKey: ['study-plans'], queryFn: getStudyPlans });

  const mutation = useMutation({
    mutationFn: () => generateStudyPlan({
      goal,
      hours_per_day: hours,
      week_start: new Date().toISOString().split('T')[0],
    }),
    onSuccess: (plan) => setCurrentPlan(plan),
  });

  const plans = Array.isArray(pastPlans) ? pastPlans : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-brand/10">
            <CalendarDays className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">AI Study Planner</h1>
            <p className="text-text-muted text-sm">Generate a personalized weekly study schedule</p>
          </div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <GlassCard className="p-6 mb-8" hover={false}>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Weekly goal</label>
                <textarea
                  className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-none"
                  placeholder="e.g. Prepare for CS401 final exam, finish MATH201 assignment, review ML concepts"
                  rows={2}
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Hours per day: <span className="text-brand font-semibold">{hours}h</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={hours}
                  onChange={e => setHours(Number(e.target.value))}
                  className="w-full accent-brand"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>1h</span><span>8h</span>
                </div>
              </div>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 disabled:opacity-60 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {mutation.isPending ? 'Generating plan...' : 'Generate Weekly Plan'}
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {mutation.isPending && (
          <motion.div variants={staggerItem} className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {DAYS.map(d => (
                <div key={d} className="space-y-1.5">
                  <Skeleton className="h-4 rounded" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentPlan && !mutation.isPending && (
          <motion.div variants={staggerItem} className="mb-8">
            <GlassCard className="p-6" hover={false}>
              <h2 className="text-text-primary font-semibold mb-4">Your Plan — Week of {currentPlan.week_start}</h2>
              <PlanGrid plan={currentPlan.plan_data} />
              <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400" /> High priority</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> Medium priority</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand" /> Low priority</div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {plans.length > 0 && (
          <motion.div variants={staggerItem}>
            <h2 className="text-text-primary font-semibold mb-4">Past Plans</h2>
            <div className="space-y-3">
              {plans.map(p => <PastPlanAccordion key={p.id} plan={p} />)}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
