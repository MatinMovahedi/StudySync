'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Brain, User, Settings, BarChart3, Timer,
  Zap, ChevronLeft, ChevronRight, LogOut, MapPin, Headphones, Trophy, Hash,
  CalendarDays, BookOpen, Library, GraduationCap, CalendarCheck
} from 'lucide-react';
import { useUIStore } from '../../lib/store/uiStore';
import { useAuthStore } from '../../lib/store/authStore';
import { Avatar } from '../ui/avatar';
import { XPBar } from '../shared/XPBar';
import { cn } from '../../lib/utils/cn';
import { logout } from '../../lib/api/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/communities', icon: Hash, label: 'Communities' },
  { href: '/groups', icon: Users, label: 'Study Groups' },
  { href: '/ai', icon: Brain, label: 'AI Assistant' },
  { href: '/schedule', icon: CalendarCheck, label: 'Schedule' },
  { href: '/planner', icon: CalendarDays, label: 'Study Planner' },
  { href: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { href: '/focus', icon: Headphones, label: 'Focus Rooms' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/grades', icon: BookOpen, label: 'Grade Tracker' },
  { href: '/resources', icon: Library, label: 'Resources' },
  { href: '/tutoring', icon: GraduationCap, label: 'Tutoring' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/spots', icon: MapPin, label: 'Study Spots' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout: logoutStore } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    logoutStore();
    router.push('/login');
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex-shrink-0 h-full bg-surface border-r border-surface-border flex flex-col z-20"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-surface-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden"
              >
                StudySync
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-hidden">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'relative flex items-center gap-3 px-3 h-8 rounded-md transition-colors',
                  active
                    ? 'text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-brand rounded-full" />
                )}
                <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-brand' : 'text-text-muted')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* XP Bar */}
      <div className="border-t border-surface-border">
        <AnimatePresence>
          {!sidebarCollapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <XPBar collapsed={false} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-2 flex justify-center">
              <XPBar collapsed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User section */}
      <div className="p-2 border-t border-surface-border">
        {user && (
          <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-md', sidebarCollapsed && 'justify-center')}>
            <Avatar name={`${user.first_name} ${user.last_name}`} src={user.profile?.avatar} size="sm" className="flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">{user.first_name} {user.last_name}</div>
                  <div className="text-xs text-text-muted truncate">{user.profile?.university || 'Student'}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-text-muted hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-surface-elevated"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shadow-sm z-30"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
