'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import type { FocusRoomState } from '../../hooks/useFocusRoom';

interface SyncTimerProps {
  focusState: FocusRoomState;
  isHost: boolean;
  onStart: (duration: number) => void;
  onStop: () => void;
}

function useElapsed(startedAt: string | null): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setElapsed(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function SyncTimer({ focusState, isHost, onStart, onStop }: SyncTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const elapsed = useElapsed(focusState.active ? focusState.startedAt : null);
  const totalSeconds = focusState.duration * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = focusState.active ? elapsed / totalSeconds : 0;

  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular progress */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-surface-elevated)" strokeWidth="8" />
          <motion.circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-text-primary tabular-nums font-mono">
            {focusState.active ? fmt(remaining) : fmt(selectedDuration * 60)}
          </span>
          <span className="text-xs text-text-muted mt-1">
            {focusState.active ? (remaining === 0 ? 'Time\'s up!' : 'focusing') : 'ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {!focusState.active ? (
        <div className="flex flex-col items-center gap-4">
          {isHost && (
            <div className="flex items-center gap-2">
              {[15, 25, 45, 60].map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSelectedDuration(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedDuration === d
                      ? 'bg-brand text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-surface-border'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          )}
          {isHost && (
            <button
              type="button"
              onClick={() => onStart(selectedDuration)}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Start focus session
            </button>
          )}
          {!isHost && (
            <p className="text-sm text-text-muted">Waiting for the host to start…</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-text-muted">
            {focusState.duration}-minute focus session
          </p>
          {isHost && (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-border text-text-secondary rounded-lg text-sm transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              End session
            </button>
          )}
          {!isHost && (
            <p className="text-xs text-text-muted">Only the host can end the session</p>
          )}
        </div>
      )}
    </div>
  );
}
