'use client';
import { motion } from 'framer-motion';
import { UserPlus, Users, Brain, TrendingUp } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create your account',
    description:
      'Sign up in seconds. Tell us your courses and study preferences — no credit card, no friction.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Join or start a study group',
    description:
      'Browse groups by course or create your own. Invite classmates and get a real-time chat channel instantly.',
  },
  {
    num: '03',
    icon: Brain,
    title: 'Study with AI by your side',
    description:
      'Ask questions, generate quizzes from your notes, create flashcards, and set a Pomodoro timer — all in one place.',
  },
  {
    num: '04',
    icon: TrendingUp,
    title: 'Track your progress',
    description:
      "See your daily study hours, active streak, and subject breakdown. Know exactly what's working.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-surface border-t border-surface-border">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-mono text-brand uppercase tracking-[0.18em] mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight max-w-lg">
            From sign-up to study session in minutes.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-surface-border hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-5 group"
              >
                {/* Icon node */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full border border-surface-border bg-surface-card flex items-center justify-center group-hover:border-brand/40 group-hover:bg-brand/5 transition-colors duration-200">
                    <step.icon className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors duration-200" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono text-text-muted">{step.num}</span>
                    <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
