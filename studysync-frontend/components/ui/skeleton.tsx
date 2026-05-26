import { cn } from '../../lib/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface-elevated rounded-md animate-pulse', className)} />
  );
}
