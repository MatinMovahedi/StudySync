import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  apply: (t: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        set({ theme: next });
      },
      apply: (t: Theme) => {
        document.documentElement.dataset.theme = t;
        set({ theme: t });
      },
    }),
    { name: 'studysync-theme' }
  )
);
