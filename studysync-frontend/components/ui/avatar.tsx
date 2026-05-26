import Image from 'next/image';
import { cn } from '../../lib/utils/cn';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colors = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];

function getColor(name: string) {
  return colors[name.charCodeAt(0) % colors.length];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const color = getColor(name);
  const sizeClass = sizes[size];
  return (
    <div
      className={cn('relative rounded-full flex-shrink-0 overflow-hidden ring-1 ring-surface-border', sizeClass, className)}
      style={!src ? { background: `${color}18`, border: `1.5px solid ${color}30` } : {}}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-semibold" style={{ color }}>
          {initials}
        </span>
      )}
    </div>
  );
}
