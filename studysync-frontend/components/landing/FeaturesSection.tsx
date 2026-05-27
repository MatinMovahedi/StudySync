'use client';
import { motion } from 'framer-motion';
import { Users, Brain, BookOpen, BarChart3, Timer, Map } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../lib/utils/animations';

const features = [
  {
    icon: Brain,
    title: 'AI that teaches, not just answers',
    description: 'Streaming AI chat, personalized 7-day study planners, quiz generation from your notes, concept breakdowns, and AI-made flashcards — all in one place.',
    colorClass: 'text-brand',
    bgClass: 'bg-brand/10',
    badge: 'Planner · Quiz · Flashcards',
  },
  {
    icon: Users,
    title: 'Groups, communities & real-time chat',
    description: 'Match with classmates by course and study style. Chat in dedicated group channels, follow peers, and engage in campus-wide communities.',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-400/10',
    badge: 'Groups · Communities · Chat',
  },
  {
    icon: BookOpen,
    title: 'Grade Tracker with GPA calculator',
    description: 'Add courses, log every assignment, quiz, midterm and final. Weighted averages update instantly and your cumulative 4.0 GPA is always visible.',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-400/10',
    badge: 'Weighted GPA · Color-coded',
  },
  {
    icon: BarChart3,
    title: 'Analytics, streaks & gamification',
    description: 'Daily study hours, streak calendars, subject breakdowns, XP points, and a leaderboard that makes consistency contagious.',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    badge: 'Streaks · XP · Leaderboard',
  },
  {
    icon: Timer,
    title: 'Pomodoro with sounds & notifications',
    description: 'Start a focus session with one tap. Audio cues at the end of every work block and break, browser push notifications, and automatic session logging.',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    badge: 'Focus · Sounds · PWA',
  },
  {
    icon: Map,
    title: 'Campus resources & smart search',
    description: 'Browse study spots on an interactive map, discover and share resources in the library, export your schedule as .ics, and search everything from the top bar.',
    colorClass: 'text-brand',
    bgClass: 'bg-brand/10',
    badge: 'Map · Library · .ics Export',
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
