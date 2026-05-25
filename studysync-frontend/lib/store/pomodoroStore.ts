import { create } from 'zustand';

type Phase = 'work' | 'short_break' | 'long_break';

interface PomodoroState {
  phase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  currentSessionId: number | null;
  subject: string;
  setRunning: (v: boolean) => void;
  setPhase: (p: Phase) => void;
  setSecondsLeft: (s: number) => void;
  tick: () => void;
  nextPhase: () => void;
  reset: () => void;
  setSessionId: (id: number | null) => void;
  setSubject: (s: string) => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  phase: 'work',
  secondsLeft: 25 * 60,
  isRunning: false,
  sessionCount: 0,
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  currentSessionId: null,
  subject: '',
  setRunning: (v) => set({ isRunning: v }),
  setPhase: (p) => {
    const durations: Record<Phase, number> = {
      work: get().workDuration * 60,
      short_break: get().shortBreakDuration * 60,
      long_break: get().longBreakDuration * 60,
    };
    set({ phase: p, secondsLeft: durations[p], isRunning: false });
  },
  setSecondsLeft: (s) => set({ secondsLeft: s }),
  tick: () => set((s) => ({ secondsLeft: Math.max(0, s.secondsLeft - 1) })),
  nextPhase: () => {
    const { phase, sessionCount } = get();
    if (phase === 'work') {
      const newCount = sessionCount + 1;
      const nextPhase = newCount % 4 === 0 ? 'long_break' : 'short_break';
      set({ sessionCount: newCount });
      get().setPhase(nextPhase);
    } else {
      get().setPhase('work');
    }
  },
  reset: () => set({ phase: 'work', secondsLeft: get().workDuration * 60, isRunning: false }),
  setSessionId: (id) => set({ currentSessionId: id }),
  setSubject: (s) => set({ subject: s }),
}));
