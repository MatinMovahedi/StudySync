'use client';
import { motion } from 'framer-motion';
import { Users, Brain, MessageSquare, BarChart3, Timer, Zap } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../lib/utils/animations';

const features = [
  {
    icon: Brain,
    title: 'AI that teaches, not just answers',
    description: 'Generate quizzes from your notes, get concept breakdowns, flip through AI-made flashcards, and summarize any reading in seconds.',
    colorClass: 'text-brand',
    bgClass: 'bg-brand/10',
    badge: 'Quiz · Flashcards · Explain',
  },
  {
    icon: Users,
    title: 'Study groups that actually match',
    description: 'Join or create groups by course, study style, and schedule. Shared goals lead to better outcomes — every time.',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-400/10',
    badge: '3× better outcomes',
  },
  {
    icon: MessageSquare,
    title: 'Real-time chat built for focus',
    description: 'Channels per group, typing indicators, and zero noise. Everything stays on topic because your time matters.',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-400/10',
    badge: 'WebSocket · <50ms',
  },
  {
    icon: BarChart3,
    title: 'See exactly where your time goes',
    description: 'Daily study hours, streak calendars, subject breakdowns. Know which habits move the needle.',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    badge: 'Streaks · Analytics',
  },
  {
    icon: Timer,
    title: 'Built-in Pomodoro that logs itself',
    description: 'Start a focus session, work through breaks, and watch your stats update automatically. No manual tracking.',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    badge: '25/5 min cycles',
  },
  {
    icon: Zap,
    title: 'One platform. No tab switching.',
    description: 'Groups, chat, AI, timers, analytics — all in the same interface. Stay in flow and get more done.',
    colorClass: 'text-brand',
    bgClass: 'bg-brand/10',
    badge: 'All-in-one',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-surface border-t border-surface-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-mono text-brand uppercase tracking-[0.18em] mb-3">What you get</p>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
            Built for how students actually study.
          </h2>
          <p className="text-text-secondary mt-4 max-w-md mx-auto">
            Every feature earns its place. No bloat, no learning curve.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              className="group bg-surface-card border border-surface-border rounded-lg p-6 hover:border-brand/30 transition-all duration-300 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.15)]"
            >
              <div className={`w-10 h-10 rounded-md ${f.bgClass} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.colorClass}`} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{f.description}</p>
              <span className="inline-block text-[11px] font-medium text-text-muted bg-surface-elevated px-2 py-0.5 rounded-md">
                {f.badge}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
