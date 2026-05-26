'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Brain, Hash, User, Library, CalendarCheck } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/schedule', icon: CalendarCheck, label: 'Schedule' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/ai', icon: Brain, label: 'AI' },
  { href: '/communities', icon: Hash, label: 'Community' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-surface-border flex items-center z-30">
      {tabs.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full">
            <tab.icon className={cn('w-5 h-5', active ? 'text-brand' : 'text-text-muted')} />
            <span className={cn('text-[10px]', active ? 'text-brand font-medium' : 'text-text-muted')}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
