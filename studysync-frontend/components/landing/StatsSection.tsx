'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 10000, suffix: '+', label: 'Active students', decimal: false },
  { value: 500, suffix: '+', label: 'Study groups', decimal: false },
  { value: 4.9, suffix: '★', label: 'Average rating', decimal: true },
  { value: 98, suffix: '%', label: 'Would recommend', decimal: false },
];

function CountUp({ to, suffix, decimal, inView }: { to: number; suffix: string; decimal: boolean; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const steps = 50;
    const increment = to / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.min(increment * step, to));
      if (step >= steps) clearInterval(timer);
    }, 1400 / steps);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <>{decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}</>;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 bg-surface-card border-t border-surface-border">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-text-primary tabular-nums mb-1.5">
                <CountUp to={s.value} suffix={s.suffix} decimal={s.decimal} inView={inView} />
              </div>
              <div className="text-sm text-text-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
