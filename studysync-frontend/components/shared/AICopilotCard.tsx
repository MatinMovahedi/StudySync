'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PROMPTS = [
  'What should I study today?',
  'Quiz me on my weakest subject',
  'Help me plan my week',
  'Explain a concept I struggled with',
  'Summarize my last reading',
];

export function AICopilotCard() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [input, setInput] = useState('');
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPromptIndex(i => (i + 1) % PROMPTS.length);
    }, 3200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim() || PROMPTS[promptIndex];
    router.push(`/ai?prompt=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <div className="rounded-lg border border-brand/20 bg-brand/4 p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-8 h-8 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-brand" />
        </motion.div>
        <div>
          <div className="text-sm font-semibold text-text-primary">AI Study Copilot</div>
          <div className="text-xs text-text-muted">Ask anything. Get real answers.</div>
        </div>
      </div>

      <div className="h-8 overflow-hidden mb-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={promptIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-text-muted italic"
          >
            &ldquo;{PROMPTS[promptIndex]}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something…"
          className="flex-1 h-8 bg-surface border border-surface-border rounded-md px-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
        />
        <button
          type="submit"
          className="h-8 w-8 bg-brand hover:bg-brand-dark text-white rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Ask AI"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
