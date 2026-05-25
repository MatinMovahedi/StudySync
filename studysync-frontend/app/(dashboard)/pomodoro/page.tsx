'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings } from 'lucide-react';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { GlassCard } from '../../../components/shared/GlassCard';
import { GradientText } from '../../../components/shared/GradientText';
import { Button } from '../../../components/ui/button';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

const PHASE_LABELS = { work: 'Focus', short_break: 'Short Break', long_break: 'Long Break' };
const PHASE_COLORS = { work: '#6366f1', short_break: '#10b981', long_break: '#06b6d4' };

function CircularTimer({ progress, phase }: { progress: number; phase: string }) {
  const size = 260;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  const color = PHASE_COLORS[phase as keyof typeof PHASE_COLORS];

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color}80)` }} />
    </svg>
  );
}

export default function PomodoroPage() {
  const { phase, secondsLeft, isRunning, sessionCount, workDuration, subject, start, pause, resume, reset, progress, setSubject } = usePomodoro();
  const [subjectInput, setSubjectInput] = useState(subject);

  useEffect(() => { document.title = `${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,'0')} — ${PHASE_LABELS[phase as keyof typeof PHASE_LABELS]} · StudySync`; }, [secondsLeft, phase]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const color = PHASE_COLORS[phase as keyof typeof PHASE_COLORS];

  const handleStart = () => {
    setSubject(subjectInput);
    start(subjectInput);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <h1 className="text-3xl font-bold"><GradientText>Pomodoro Timer</GradientText></h1>
          <p className="text-text-secondary text-sm mt-1">Stay focused, take breaks, repeat.</p>
        </motion.div>

        {/* Phase selector */}
        <motion.div variants={staggerItem} className="flex justify-center gap-2 mb-8">
          {(['work', 'short_break', 'long_break'] as const).map(p => (
            <button key={p} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              phase === p ? 'text-white border-transparent' : 'glass border-surface-border text-text-secondary hover:border-white/20'
            }`} style={phase === p ? { background: color, boxShadow: `0 0 15px ${color}50` } : {}}>
              {PHASE_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {/* Timer circle */}
        <motion.div variants={staggerItem} className="flex justify-center mb-8 relative">
          <div className="relative">
            <CircularTimer progress={progress} phase={phase} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${minutes}:${seconds}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold text-text-primary font-mono tabular-nums"
                >
                  {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
                </motion.div>
              </AnimatePresence>
              <div className="text-sm text-text-muted mt-2">{PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}</div>
              {sessionCount > 0 && (
                <div className="flex gap-1 mt-3">
                  {Array.from({length: Math.min(sessionCount, 8)}).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: color }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subject input */}
        {!isRunning && (
          <motion.div variants={staggerItem} className="mb-6">
            <input
              value={subjectInput}
              onChange={e => setSubjectInput(e.target.value)}
              placeholder="What are you studying? (optional)"
              className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors text-center"
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div variants={staggerItem} className="flex justify-center gap-3 mb-8">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-xl glass border border-surface-border flex items-center justify-center text-text-muted hover:text-text-secondary transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={isRunning ? pause : (sessionCount === 0 && !secondsLeft ? handleStart : resume)}
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-all active:scale-95 font-bold"
            style={{ background: color, boxShadow: `0 0 30px ${color}50` }}
          >
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            className="w-12 h-12 rounded-xl glass border border-surface-border flex items-center justify-center text-text-muted hover:text-text-secondary transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Tips */}
        <motion.div variants={staggerItem}>
          <GlassCard className="grid grid-cols-3 gap-4 text-center p-5" hover={false}>
            {[
              { icon: <Zap className="w-4 h-4" />, label: 'Focus', value: `${workDuration}m`, color: '#6366f1' },
              { icon: <Coffee className="w-4 h-4" />, label: 'Short break', value: '5m', color: '#10b981' },
              { icon: <Coffee className="w-4 h-4" />, label: 'Long break', value: '15m', color: '#06b6d4' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: item.color }}>
                  {item.icon}
                  <span className="text-base font-bold text-text-primary">{item.value}</span>
                </div>
                <div className="text-xs text-text-muted">{item.label}</div>
              </div>
            ))}
          </GlassCard>
          <p className="text-center text-xs text-text-muted mt-3">
            Sessions completed today: <span className="text-text-secondary font-medium">{sessionCount}</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
