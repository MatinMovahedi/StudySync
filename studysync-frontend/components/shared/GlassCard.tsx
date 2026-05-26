'use client';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

interface GlassCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, glow: _glow = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-surface-card border border-surface-border rounded-md shadow-card',
        hover && 'transition-colors hover:bg-surface-elevated cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
