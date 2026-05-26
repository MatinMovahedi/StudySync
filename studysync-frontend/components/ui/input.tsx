'use client';
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface-card border border-surface-border rounded-md px-3 h-9 text-text-primary placeholder:text-text-muted text-sm',
            'focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors',
            icon && 'pl-9',
            error && 'border-accent-rose/60 focus:border-accent-rose focus:ring-accent-rose/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-rose">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
