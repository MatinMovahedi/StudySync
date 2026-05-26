import { cn } from '../../lib/utils/cn';

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('text-text-primary', className)}>{children}</span>;
}
