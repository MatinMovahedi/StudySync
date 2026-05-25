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

export function GlassCard({ children, className, hover = true, glow = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-2xl p-6',
        hover && 'glass-hover cursor-pointer',
        glow && 'glow-sm',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
