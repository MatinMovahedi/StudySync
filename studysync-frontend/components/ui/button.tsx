'use client';
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-brand hover:bg-brand-dark text-white transition-colors',
  secondary: 'bg-transparent border border-surface-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors',
  ghost: 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors',
  glass: 'bg-transparent border border-surface-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white transition-colors',
};

const sizes = {
  sm: 'h-7 px-3 text-sm rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-10 px-5 text-sm rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
