'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Brain, Hash, Flame, Users, ChevronDown, Sparkles, Timer, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';

const STATS = [
  { value: 10000, suffix: '+', label: 'Students', decimal: false },
  { value: 500, suffix: '+', label: 'Study Groups', decimal: false },
  { value: 4.9, suffix: '★', label: 'Rating', decimal: true },
];

function CountUp({ to, suffix, decimal = false, inView }: { to: number; suffix: string; decimal?: boolean; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const steps = 50;
    const increment = to / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.min(increment * step, to));
      if (step >= steps) clearInterval(timer);
    }, 1400 / steps);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <>{decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}</>;
}

const MESSAGES = [
  { from: 'Maya', text: 'Can anyone explain dynamic programming?', mine: false },
  { from: 'You', text: 'Think of it as recursion + caching. Start brute force, then memoize.', mine: true },
  { from: 'Alex', text: 'That clicked for me finally 🔥', mine: false },
];

export function HeroSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(statsRef, { once: true });

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full hero-blob-1"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full hero-blob-2"
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full hero-blob-3"
          animate={{ x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none hero-grid-overlay" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/25 bg-brand/6 text-xs font-medium text-brand">
            <Sparkles className="w-3 h-3" />
            AI-Powered Study Platform
          </span>
        </motion.div>

        {/* Animated headline — word-by-word stagger */}
        <div className="mb-6 text-center overflow-hidden">
          <h1 className="hero-headline font-bold tracking-tight leading-[1.05] text-text-primary">
            {['Study', 'smarter,'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-brand"
            >
              together.
            </motion.span>
          </h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.48 }}
          className="text-text-secondary text-lg text-center max-w-md leading-relaxed mb-10"
        >
          Real-time study groups, AI tools that actually teach, and a community that shows up.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.56 }}
          className="flex flex-col sm:flex-row gap-3 mb-14"
        >
          <Link href="/signup">
            <Button size="lg" className="shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_0_28px_-4px_rgba(16,185,129,0.65)] transition-shadow">
              Start for free →
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">Sign in</Button>
          </Link>
        </motion.div>

        {/* Stat counters */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.64 }}
          className="flex items-center gap-10 mb-16 flex-wrap justify-center"
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-text-primary tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} decimal={s.decimal} inView={inView} />
              </div>
              <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl"
        >
          <div className="rounded-lg overflow-hidden border border-surface-border shadow-[0_0_80px_-16px_rgba(16,185,129,0.12),0_32px_80px_rgba(0,0,0,0.5)]">
            {/* Browser chrome */}
            <div className="bg-surface-elevated border-b border-surface-border px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-surface-border" />
                <div className="w-3 h-3 rounded-full bg-surface-border" />
                <div className="w-3 h-3 rounded-full bg-surface-border" />
              </div>
              <div className="flex-1 bg-surface rounded border border-surface-border px-3 py-1 text-[11px] text-text-muted text-center max-w-xs mx-auto">
                app.studysync.io/groups/cs401/chat
              </div>
            </div>

            {/* App shell */}
            <div className="bg-surface-card flex h-[340px]">
              {/* Mini sidebar */}
              <div className="w-12 bg-surface border-r border-surface-border flex flex-col items-center py-4 gap-3 flex-shrink-0">
                <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center mb-2">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                {[Brain, Users, Flame, BarChart3].map((Icon, i) => (
                  <div key={i} className={`w-7 h-7 rounded-md flex items-center justify-center ${i === 1 ? 'bg-brand/10' : ''}`}>
                    <Icon className={`w-3.5 h-3.5 ${i === 1 ? 'text-brand' : 'text-text-muted'}`} />
                  </div>
                ))}
              </div>

              {/* Channel list */}
              <div className="w-44 bg-surface border-r border-surface-border py-4 flex-shrink-0">
                <p className="text-[10px] text-text-muted uppercase tracking-widest px-4 mb-2 font-semibold">My Groups</p>
                {['CS401 Study Group', 'ML Research', 'Math Squad'].map((name, i) => (
                  <div key={i} className={`px-3 py-1.5 mx-2 rounded-md flex items-center gap-2 mb-0.5 ${i === 0 ? 'bg-brand/10' : ''}`}>
                    <Hash className={`w-3 h-3 flex-shrink-0 ${i === 0 ? 'text-brand' : 'text-text-muted'}`} />
                    <span className={`text-xs truncate ${i === 0 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{name}</span>
                    {i === 0 && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />}
                  </div>
                ))}
                <div className="mt-4 px-4">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-semibold">Tools</p>
                  <div className="flex items-center gap-2 py-1.5">
                    <Brain className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted">AI Chat</span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5">
                    <Timer className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted">Pomodoro</span>
                  </div>
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-4 py-2.5 border-b border-surface-border flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">CS401 Study Group</span>
                  <span className="ml-auto text-xs text-brand flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                    8 online
                  </span>
                </div>
                <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                  {MESSAGES.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.mine ? 'flex-row-reverse' : ''}`}>
                      {!msg.mine && (
                        <div className="w-6 h-6 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand">
                          {msg.from[0]}
                        </div>
                      )}
                      <div className="max-w-[72%]">
                        {!msg.mine && <p className="text-[10px] text-text-muted mb-0.5 font-medium">{msg.from}</p>}
                        <div className={`rounded-md px-3 py-1.5 text-xs leading-relaxed ${msg.mine ? 'bg-brand text-white' : 'bg-surface-elevated text-text-secondary'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <div className="bg-surface border border-surface-border rounded-md px-3 py-2 text-xs text-text-muted flex items-center gap-2">
                    <span className="flex-1">Message #cs401-study-group</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      <span className="text-[10px] text-brand">Maya is typing…</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-14 flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] text-text-muted uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
