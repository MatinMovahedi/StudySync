'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Brain, User, Settings, BarChart3, Timer,
  Zap, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useUIStore } from '../../lib/store/uiStore';
import { useAuthStore } from '../../lib/store/authStore';
import { Avatar } from '../ui/avatar';
import { GradientText } from '../shared/GradientText';
import { cn } from '../../lib/utils/cn';
import { logout } from '../../lib/api/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/groups', icon: Users, label: 'Study Groups' },
  { href: '/ai', icon: Brain, label: 'AI Assistant' },
  { href: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
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
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex-shrink-0 h-full glass border-r border-white/5 flex flex-col z-20"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-base font-bold whitespace-nowrap overflow-hidden"
              >
                <GradientText>StudySync</GradientText>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-hidden">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-brand/15 text-brand-light border border-brand/20'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                )}
                whileHover={{ x: 2 }}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-brand-light')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-light flex-shrink-0" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        {user && (
          <div className={cn('flex items-center gap-3 px-2 py-2 rounded-xl', sidebarCollapsed && 'justify-center')}>
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
              <button onClick={handleLogout} className="text-text-muted hover:text-accent-rose transition-colors p-1 rounded-lg hover:bg-accent-rose/10">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shadow-card z-30"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
