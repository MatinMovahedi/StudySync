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
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm',
            'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200',
            icon && 'pl-10',
            error && 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20',
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
