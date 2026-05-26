'use client';
import { motion } from 'framer-motion';
import { Avatar } from '../ui/avatar';

const testimonials = [
  { name: 'Alex Chen', role: 'CS Junior, UofT', text: 'StudySync completely changed how I prepare for exams. The AI quiz generator is insane — it generates harder questions than my professor!', rating: 5 },
  { name: 'Maya Patel', role: 'Data Science, UBC', text: 'Found my study group in 5 minutes. We meet 3x a week now and my grades went from B- to A. Not even kidding.', rating: 5 },
  { name: 'Jordan Kim', role: 'SE Senior, Waterloo', text: 'The Pomodoro timer + streak tracking keeps me accountable. I have hit 47 days straight and I am not stopping.', rating: 5 },
  { name: 'Priya Sharma', role: 'Mathematics, McGill', text: 'I uploaded my lecture notes and the summarizer extracted exactly what mattered. Hours of review compressed into minutes.', rating: 5 },
  { name: 'Luca Romano', role: 'CS Freshman, McMaster', text: 'As a first-year, I was lost. Found my people through StudySync in the first week. The onboarding is super smooth too.', rating: 5 },
  { name: 'Sarah Johnson', role: "Cog Sci, Queen's", text: 'The chat is actually beautiful — feels like Discord but smarter. The AI integrations inside group chats are next level.', rating: 5 },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-surface border-t border-surface-border overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-12 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Loved by students everywhere
        </motion.h2>
        <motion.p
          className="text-text-secondary text-base"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
        >
          Join thousands of students who already study smarter.
        </motion.p>
      </div>

      {/* Scrolling marquee */}
      <div className="relative">
        <motion.div
          className="flex gap-4 px-4"
          animate={{ x: [0, -1400] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="bg-surface-card border border-surface-border rounded-md p-5 w-72 flex-shrink-0 shadow-card">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={t.name} size="sm" />
                <div>
                  <div className="text-sm font-medium text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
