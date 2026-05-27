'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX } from 'lucide-react';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { GlassCard } from '../../../components/shared/GlassCard';
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
      <circle cx={size/2} cy={size/2} r={r} stroke="#2a2a2a" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }} />
    </svg>
  );
}

function playTone(freq: number, duration: number, gain = 0.3) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playSessionEnd() {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.15), 160);
  setTimeout(() => playTone(784, 0.4), 320);
}

function playBreakEnd() {
  playTone(784, 0.15);
  setTimeout(() => playTone(659, 0.15), 160);
  setTimeout(() => playTone(523, 0.4), 320);
}

export default function PomodoroPage() {
  const { phase, secondsLeft, isRunning, sessionCount, workDuration, subject, start, pause, resume, reset, progress, setSubject, setPhase } = usePomodoro();
  const [subjectInput, setSubjectInput] = useState(subject);
  const [muted, setMuted] = useState(false);

  useEffect(() => { document.title = `${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,'0')} — ${PHASE_LABELS[phase as keyof typeof PHASE_LABELS]} · StudySynch`; }, [secondsLeft, phase]);

  // Play sound + browser notification when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      if (!muted) {
        if (phase === 'work') playSessionEnd();
        else playBreakEnd();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('StudySynch', {
          body: phase === 'work' ? '✅ Focus session complete! Time for a break.' : '🎯 Break over — back to work!',
          icon: '/logo-icon.png',
        });
      }
    }
  }, [secondsLeft, isRunning, phase, muted]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const color = PHASE_COLORS[phase as keyof typeof PHASE_COLORS];

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setSubject(subjectInput);
    start(subjectInput);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Pomodoro Timer</h1>
          <p className="text-text-muted text-xs mt-1">Stay focused, take breaks, repeat.</p>
        </motion.div>

        {/* Phase selector */}
        <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-2 mb-8">
          {(['work', 'short_break', 'long_break'] as const).map(p => (
            <button type="button" key={p}
              onClick={() => { if (!isRunning) setPhase(p); }}
              className={`h-8 px-4 rounded-md text-sm font-medium border transition-colors ${
                phase === p ? 'text-white border-transparent' : 'bg-surface-card border-surface-border text-text-secondary hover:bg-surface-elevated'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={phase === p ? { background: PHASE_COLORS[p] } : {}}>
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
              className="w-full bg-surface-card border border-surface-border rounded-md px-4 h-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors text-center"
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div variants={staggerItem} className="flex justify-center items-center gap-3 mb-8">
          <button
            type="button"
            onClick={reset}
            className="w-12 h-12 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={isRunning ? pause : (sessionCount === 0 && !secondsLeft ? handleStart : resume)}
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-colors font-bold"
            style={{ background: color }}
          >
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            type="button"
            aria-label={muted ? 'Unmute' : 'Mute'}
            onClick={() => setMuted(m => !m)}
            className="w-12 h-12 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </motion.div>

        {/* Tips */}
        <motion.div variants={staggerItem}>
          <GlassCard className="grid grid-cols-3 gap-4 text-center p-5" hover={false}>
            {[
              { icon: <Zap className="w-4 h-4 text-brand" />, label: 'Focus', value: `${workDuration}m` },
              { icon: <Coffee className="w-4 h-4 text-emerald-500" />, label: 'Short break', value: '5m' },
              { icon: <Coffee className="w-4 h-4 text-text-muted" />, label: 'Long break', value: '15m' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
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
