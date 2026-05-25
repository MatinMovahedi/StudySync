'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { Avatar } from '../ui/avatar';
import { useAuthStore } from '../../lib/store/authStore';
import { Badge } from '../ui/badge';
import { formatRelativeTime } from '../../lib/utils/format';
import { markRead, markAllRead } from '../../lib/api/notifications';

export function Topbar() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markRead: markReadStore, markAllRead: markAllStore } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');

  const handleMarkRead = async (id: number) => {
    markReadStore(id);
    try { await markRead(id); } catch {}
  };

  const handleMarkAll = async () => {
    markAllStore();
    try { await markAllRead(); } catch {}
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-white/5 glass flex-shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search groups, courses, people..."
          className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all"
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
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 glass rounded-2xl border border-white/10 shadow-card overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAll} className="text-xs text-brand-light hover:text-brand transition-colors">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)}>
                      <X className="w-4 h-4 text-text-muted hover:text-text-secondary" />
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
                        className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${!n.is_read ? 'bg-brand/5' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-text-primary">{n.title}</p>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                          {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1" />}
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

        {/* User */}
        {user && (
          <Avatar
            name={`${user.first_name} ${user.last_name}`}
            src={user.profile?.avatar}
            size="sm"
          />
        )}
      </div>
    </header>
  );
}
