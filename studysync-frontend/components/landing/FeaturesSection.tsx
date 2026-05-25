'use client';
import { motion } from 'framer-motion';
import { Users, Brain, MessageSquare, BarChart3, Timer, Zap, LucideIcon } from 'lucide-react';

interface Feature {
  num: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  stat: string;
  bar: string;
  iconBg: string;
  iconColor: string;
  statBg: string;
  statColor: string;
}

const features: Feature[] = [
  {
    num: '01', icon: Users,
    title: 'Study groups that\nactually match.',
    description: 'AI pairs you with classmates who share your courses, schedule, and study style — not just whoever clicked "join" first.',
    tag: 'Smart Matching', stat: '3× better outcomes vs random groups',
    bar: 'bg-brand', iconBg: 'bg-brand/15', iconColor: 'text-brand-light',
    statBg: 'bg-brand/10', statColor: 'text-brand-light',
  },
  {
    num: '02', icon: Brain,
    title: 'AI that teaches,\nnot just answers.',
    description: 'Generate quizzes from your notes, get concept breakdowns at your level, flip through AI-made flashcards, and summarize any reading in seconds.',
    tag: 'AI Tools', stat: 'Quiz · Summarize · Flashcards · Explain',
    bar: 'bg-accent-purple', iconBg: 'bg-accent-purple/15', iconColor: 'text-accent-purple',
    statBg: 'bg-accent-purple/10', statColor: 'text-accent-purple',
  },
  {
    num: '03', icon: MessageSquare,
    title: 'Real-time chat\nbuilt for focus.',
    description: 'Channels per group, emoji reactions, typing indicators — and none of the noise. Everything stays on topic because your time matters.',
    tag: 'Live Collaboration', stat: 'WebSocket-powered, <50ms latency',
    bar: 'bg-accent-cyan', iconBg: 'bg-accent-cyan/15', iconColor: 'text-accent-cyan',
    statBg: 'bg-accent-cyan/10', statColor: 'text-accent-cyan',
  },
  {
    num: '04', icon: BarChart3,
    title: 'See exactly where\nyour time goes.',
    description: 'Daily study hours, streak calendars, subject breakdowns. Know which habits move the needle and which ones just feel productive.',
    tag: 'Analytics', stat: 'Streak · Hours · Subject breakdown',
    bar: 'bg-accent-emerald', iconBg: 'bg-accent-emerald/15', iconColor: 'text-accent-emerald',
    statBg: 'bg-accent-emerald/10', statColor: 'text-accent-emerald',
  },
  {
    num: '05', icon: Timer,
    title: 'Built-in Pomodoro\nthat logs itself.',
    description: 'Start a focus session, work through breaks, and watch your stats update automatically. No spreadsheet, no manual tracking.',
    tag: 'Pomodoro Timer', stat: '25-min work / 5-min break cycles',
    bar: 'bg-accent-amber', iconBg: 'bg-accent-amber/15', iconColor: 'text-accent-amber',
    statBg: 'bg-accent-amber/10', statColor: 'text-accent-amber',
  },
  {
    num: '06', icon: Zap,
    title: 'One platform.\nNo tab switching.',
    description: 'Groups, chat, AI tools, timers, analytics — all in the same interface. Stop losing your train of thought to another browser tab.',
    tag: 'All-in-one', stat: "Everything you need, nothing you don't",
    bar: 'bg-accent-rose', iconBg: 'bg-accent-rose/15', iconColor: 'text-accent-rose',
    statBg: 'bg-accent-rose/10', statColor: 'text-accent-rose',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative">
      <div className="absolute inset-0 line-grid" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold text-brand-light uppercase tracking-[0.2em] mb-4">What you get</p>
          <h2 className="text-4xl md:text-5xl font-black text-text-primary leading-tight max-w-2xl">
            Built for how students
            <span className="gradient-text"> actually study.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="group glass rounded-2xl border border-white/6 hover:border-white/12 transition-all duration-300 overflow-hidden">
                <div className="flex items-stretch">
                  <div className={`w-1 flex-shrink-0 rounded-l-2xl transition-all duration-300 group-hover:w-1.5 ${f.bar}`} />

                  <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-5">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs font-bold text-text-muted font-mono w-6">{f.num}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${f.iconBg} ${f.iconColor}`}>
                        <f.icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="sm:w-56 flex-shrink-0">
                      <h3 className="text-sm font-bold text-text-primary leading-snug whitespace-pre-line">{f.title}</h3>
                    </div>

                    <p className="flex-1 text-sm text-text-secondary leading-relaxed hidden md:block">
                      {f.description}
                    </p>

                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap hidden lg:block ${f.statBg} ${f.statColor}`}>
                      {f.stat}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
