import { cn } from '../../lib/utils/cn';

const variants: Record<string, string> = {
  default: 'bg-brand/10 text-brand-light border-brand/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  emerald: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
  amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  rose: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
  muted: 'bg-white/5 text-text-secondary border-white/10',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
