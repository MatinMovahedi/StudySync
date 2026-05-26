'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Brain, User, MoreHorizontal, X,
  CalendarCheck, BarChart2, BookOpen, Library, GraduationCap,
  Hash, Timer, MapPin, Trophy, CalendarDays, Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const primary = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Home'     },
  { href: '/schedule',     icon: CalendarCheck,   label: 'Schedule' },
  { href: '/groups',       icon: Users,           label: 'Groups'   },
  { href: '/ai',           icon: Brain,           label: 'AI'       },
];

const more = [
  { href: '/communities',  icon: Hash,            label: 'Community'    },
  { href: '/planner',      icon: CalendarDays,    label: 'Planner'      },
  { href: '/pomodoro',     icon: Timer,           label: 'Pomodoro'     },
  { href: '/analytics',    icon: BarChart2,       label: 'Analytics'    },
  { href: '/grades',       icon: BookOpen,        label: 'Grades'       },
  { href: '/resources',    icon: Library,         label: 'Resources'    },
  { href: '/tutoring',     icon: GraduationCap,   label: 'Tutoring'     },
  { href: '/spots',        icon: MapPin,          label: 'Study Spots'  },
  { href: '/leaderboard',  icon: Trophy,          label: 'Leaderboard'  },
  { href: '/profile',      icon: User,            label: 'Profile'      },
  { href: '/settings',     icon: Settings,        label: 'Settings'     },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isMoreActive = more.some(t => pathname === t.href || pathname.startsWith(t.href + '/'));

  return (
    <>
      {/* Drawer backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* More drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-surface-card border-t border-surface-border rounded-t-2xl pb-4 pt-3"
          >
            <div className="flex items-center justify-between px-5 mb-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">More</p>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 px-3">
              {more.map(tab => {
                const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-surface-elevated transition-colors"
                  >
                    <tab.icon className={cn('w-5 h-5', active ? 'text-brand' : 'text-text-muted')} />
                    <span className={cn('text-[10px] text-center leading-tight', active ? 'text-brand font-medium' : 'text-text-muted')}>
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-surface-border flex items-center z-30">
        {primary.map(tab => {
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

        {/* More button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
        >
          <MoreHorizontal className={cn('w-5 h-5', (open || isMoreActive) ? 'text-brand' : 'text-text-muted')} />
          <span className={cn('text-[10px]', (open || isMoreActive) ? 'text-brand font-medium' : 'text-text-muted')}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
