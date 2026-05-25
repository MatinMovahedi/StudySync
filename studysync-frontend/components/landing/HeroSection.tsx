'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Brain, Hash, Flame, Users } from 'lucide-react';
import { Button } from '../ui/button';

const UNIVERSITIES = [
  'MIT', 'Stanford', 'UC Berkeley', 'Carnegie Mellon', 'Harvard', 'Yale',
  'Georgia Tech', 'Caltech', 'UMich', 'Cornell', 'UCLA', 'Princeton',
  'MIT', 'Stanford', 'UC Berkeley', 'Carnegie Mellon', 'Harvard', 'Yale',
  'Georgia Tech', 'Caltech', 'UMich', 'Cornell', 'UCLA', 'Princeton',
];

const MESSAGES = [
  { from: 'Maya', text: 'Can anyone explain dynamic programming?', mine: false, time: '2m ago' },
  { from: 'You', text: 'Think of it as recursion + caching. Start with the brute force solution, then memoize.', mine: true, time: '1m ago' },
  { from: 'Alex', text: 'That clicked for me finally 🔥', mine: false, time: 'just now' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-100" />
      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-brand/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-12 flex flex-col items-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/25 bg-brand/8 text-xs text-brand-light font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-light active-dot" />
            Now with AI flashcard generation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-center font-black tracking-tight leading-[0.92] mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
        >
          <span className="text-text-primary block">Where serious</span>
          <span className="text-text-primary block">students actually</span>
          <span className="block gradient-text">get things done.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-text-secondary text-lg md:text-xl text-center max-w-xl leading-relaxed mb-10"
        >
          Real-time study groups, AI tools that actually teach, and a community that actually shows up.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <Link href="/signup">
            <Button size="lg" className="group gap-2 px-8">
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="glass" size="lg" className="px-8">
              Sign in
            </Button>
          </Link>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="w-full max-w-4xl relative"
        >
          {/* Glow beneath */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-brand/15 blur-3xl pointer-events-none" />

          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Tab bar */}
            <div className="bg-[#12121f] border-b border-white/5 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/50" />
                <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
              </div>
              <div className="flex-1 mx-6 bg-surface-card rounded-md px-3 py-1 text-[11px] text-text-muted text-center max-w-xs mx-auto">
                app.studysync.io/groups/cs401/chat
              </div>
            </div>

            {/* App shell */}
            <div className="bg-surface flex h-[340px]">
              {/* Mini sidebar */}
              <div className="w-14 bg-[#0c0c18] border-r border-white/5 flex flex-col items-center py-4 gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center mb-2">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                {[Brain, Users, Flame].map((Icon, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-brand/20' : ''}`}>
                    <Icon className={`w-4 h-4 ${i === 1 ? 'text-brand-light' : 'text-text-muted'}`} />
                  </div>
                ))}
              </div>

              {/* Channel list */}
              <div className="w-44 bg-[#0e0e1c] border-r border-white/5 py-4 flex-shrink-0">
                <p className="text-[10px] text-text-muted uppercase tracking-widest px-4 mb-2 font-semibold">Channels</p>
                {['CS401 Study Group', 'ML Research', 'Math Squad'].map((name, i) => (
                  <div key={i} className={`px-3 py-2 mx-2 rounded-lg flex items-center gap-2 mb-0.5 ${i === 0 ? 'bg-brand/15' : ''}`}>
                    <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${i === 0 ? 'text-brand-light' : 'text-text-muted'}`} />
                    <span className={`text-xs truncate ${i === 0 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{name}</span>
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-semibold text-text-primary">CS401 Study Group</span>
                  <span className="ml-auto text-xs text-text-muted">8 online</span>
                </div>
                <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
                  {MESSAGES.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.mine ? 'flex-row-reverse' : ''}`}>
                      {!msg.mine && (
                        <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-light">
                          {msg.from[0]}
                        </div>
                      )}
                      <div className="max-w-[70%]">
                        {!msg.mine && <p className="text-[10px] text-text-muted mb-1 font-medium">{msg.from}</p>}
                        <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          msg.mine
                            ? 'bg-brand text-white rounded-tr-sm'
                            : 'bg-surface-elevated text-text-secondary border border-white/5 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-4">
                  <div className="bg-surface-elevated border border-white/8 rounded-xl px-4 py-2.5 text-xs text-text-muted flex items-center gap-2">
                    <span className="flex-1">Message #cs401-study-group</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
                      <span className="text-[10px]">Maya is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* University marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 w-full py-12 border-t border-white/5 mt-8"
      >
        <p className="text-center text-[11px] text-text-muted uppercase tracking-[0.15em] mb-5 font-medium">
          Trusted by students at
        </p>
        <div className="overflow-hidden mask-gradient-x">
          <div className="animate-marquee">
            {UNIVERSITIES.map((name, i) => (
              <span key={i} className="text-text-muted font-medium text-sm mx-8 flex-shrink-0">
                {name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
