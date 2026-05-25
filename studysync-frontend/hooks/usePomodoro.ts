'use client';
import { useEffect, useCallback } from 'react';
import { usePomodoroStore } from '../lib/store/pomodoroStore';
import { startPomodoro, completePomodoro } from '../lib/api/sessions';

export function usePomodoro() {
  const store = usePomodoroStore();

  useEffect(() => {
    if (!store.isRunning) return;
    const interval = setInterval(() => {
      store.tick();
      if (store.secondsLeft <= 1) {
        if (store.phase === 'work' && store.currentSessionId) {
          completePomodoro(store.currentSessionId).catch(() => {});
        }
        store.nextPhase();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [store]);

  const start = useCallback(async (subject: string) => {
    store.setSubject(subject);
    try {
      const session = await startPomodoro(store.workDuration, subject);
      store.setSessionId(session.id);
    } catch {}
    store.setRunning(true);
  }, [store]);

  const pause = useCallback(() => store.setRunning(false), [store]);
  const resume = useCallback(() => store.setRunning(true), [store]);
  const reset = useCallback(() => store.reset(), [store]);

  const progress = 1 - store.secondsLeft / (
    store.phase === 'work' ? store.workDuration * 60 :
    store.phase === 'short_break' ? store.shortBreakDuration * 60 :
    store.longBreakDuration * 60
  );

  return { ...store, start, pause, resume, reset, progress };
}
