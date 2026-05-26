'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { Avatar } from '../ui/avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../lib/store/authStore';
import { formatRelativeTime } from '../../lib/utils/format';
import { markRead, markAllRead } from '../../lib/api/notifications';

export function Topbar() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markRead: markReadStore, markAllRead: markAllStore } = useNotificationStore();
  const notifRef = useRef<HTMLDivElement>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);
  const router = useRouter();

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/groups?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
    if (e.key === 'Escape') setSearch('');
  };

  const handleMarkRead = async (id: number) => {
    markReadStore(id);
    try { await markRead(id); } catch {}
  };

  const handleMarkAll = async () => {
    markAllStore();
    try { await markAllRead(); } catch {}
  };

  return (
    <header className="h-12 flex items-center gap-4 px-5 border-b border-surface-border bg-surface flex-shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search groups, courses…"
          className="w-full bg-surface-card border border-surface-border rounded-md pl-8 pr-3 h-8 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Toggle notifications"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-8 h-8 rounded-md border border-surface-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-10 w-72 bg-surface-card rounded-md border border-surface-border shadow-card overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border">
                  <span className="text-sm font-medium text-text-primary">Notifications</span>
                  <div className="flex gap-3 items-center">
                    {unreadCount > 0 && (
                      <button type="button" onClick={handleMarkAll} className="text-xs text-brand hover:text-brand-dark transition-colors">
                        Mark all read
                      </button>
                    )}
                    <button type="button" aria-label="Close notifications" onClick={() => setShowNotifs(false)}>
                      <X className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary transition-colors" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-text-muted">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`px-4 py-3 hover:bg-surface-elevated transition-colors cursor-pointer border-b border-surface-border last:border-0 ${!n.is_read ? 'bg-brand/8' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-text-primary">{n.title}</p>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                          {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{formatRelativeTime(n.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar — links to own profile */}
        {user && (
          <Link href="/profile" aria-label="My profile">
            <Avatar
              name={`${user.first_name} ${user.last_name}`}
              src={user.profile?.avatar}
              size="sm"
              className="hover:ring-2 hover:ring-brand/40 transition-all cursor-pointer"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
