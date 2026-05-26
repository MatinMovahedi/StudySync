import { cn } from '../../lib/utils/cn';

const variants: Record<string, string> = {
  default:  'theme-emerald',
  emerald:  'theme-emerald',
  rose:     'theme-rose',
  amber:    'theme-amber',
  muted:    'theme-muted',
  purple:   'theme-purple',
  cyan:     'theme-cyan',
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
