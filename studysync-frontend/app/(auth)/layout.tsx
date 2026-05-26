'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Brain, Users, TrendingUp, BookOpen } from 'lucide-react';

const features = [
  { icon: Brain,       label: 'AI Study Planner',  desc: 'Generate personalized 7-day study schedules' },
  { icon: TrendingUp,  label: 'Grade Tracker',      desc: 'Monitor weighted averages across all courses' },
  { icon: Users,       label: 'Study Groups',       desc: 'Collaborate in real-time with classmates' },
  { icon: BookOpen,    label: 'Resource Library',   desc: 'Find and share notes, guides, and tools' },
];

const stats = [
  { value: '12k+', label: 'Students' },
  { value: '94%',  label: 'Satisfaction' },
  { value: '3.2M', label: 'Study minutes' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative overflow-hidden flex-col bg-[#0a0a0a]">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-brand/[0.18] blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-violet-600/[0.13] blur-[110px]" />
        <div className="pointer-events-none absolute top-1/2 left-2/3 w-[260px] h-[260px] rounded-full bg-emerald-300/[0.07] blur-[80px]" />

        {/* Dot-grid texture */}
        <div className="auth-dot-grid pointer-events-none absolute inset-0 opacity-[0.04]" />

        {/* Panel content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/40">
              <Zap className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">StudySync</span>
          </Link>

          {/* Headline + features */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="max-w-sm mb-10"
            >
              <h2 className="text-[2.5rem] font-bold leading-[1.15] tracking-tight text-white mb-4">
                Study smarter.<br />
                <span className="text-brand">Graduate stronger.</span>
              </h2>
              <p className="text-white/40 text-[15px] leading-relaxed">
                The all-in-one academic platform built for students who take their future seriously.
              </p>
            </motion.div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.08, duration: 0.45, ease: 'easeOut' }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-white/80 text-[13px] font-semibold">{label}</p>
                    <p className="text-white/32 text-[12px] mt-0.5">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-8 pt-7 border-t border-white/[0.07]"
          >
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-[11px] text-white/30 mt-0.5 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-surface min-h-screen p-6 sm:p-10 overflow-y-auto">
        {/* Mobile-only logo */}
        <div className="lg:hidden w-full max-w-[380px] mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center shadow-md shadow-brand/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-primary">StudySync</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
}
