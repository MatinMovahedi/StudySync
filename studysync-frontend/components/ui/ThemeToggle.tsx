'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

function getTheme(): 'dark' | 'light' {
  return (document.documentElement.dataset.theme as 'dark' | 'light') ?? 'dark';
}

function persistTheme(theme: 'dark' | 'light') {
  try {
    const raw = localStorage.getItem('studysynch-theme');
    const stored = raw ? JSON.parse(raw) : {};
    stored.state = { ...(stored.state ?? {}), theme };
    localStorage.setItem('studysynch-theme', JSON.stringify(stored));
  } catch {}
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setTheme(getTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    persistTheme(next);
    setTheme(next);
  };

  // Render a same-size placeholder during SSR to avoid layout shift
  if (!mounted) {
    return <div className="w-8 h-8 rounded-md border border-surface-border" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-md border border-surface-border flex items-center justify-center text-text-muted hover:bg-surface-elevated hover:text-text-secondary transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
