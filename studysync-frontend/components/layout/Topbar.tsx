'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X, Users, BookOpen, Globe } from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { Avatar } from '../ui/avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../lib/store/authStore';
import { formatRelativeTime } from '../../lib/utils/format';
import { markRead, markAllRead } from '../../lib/api/notifications';
import { globalSearch, SearchResults } from '../../lib/api/search';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function Topbar() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markRead: markReadStore, markAllRead: markAllStore } = useNotificationStore();
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(search, 280);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length < 2) { setResults(null); setShowResults(false); return; }
    setSearching(true);
    globalSearch(debouncedSearch)
      .then(r => { setResults(r); setShowResults(true); })
      .catch(() => setResults(null))
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => { setSearch(''); setResults(null); setShowResults(false); }, []);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') clearSearch();
  };

  const handleMarkRead = async (id: number) => {
    markReadStore(id);
    try { await markRead(id); } catch {}
  };

  const handleMarkAll = async () => {
    markAllStore();
    try { await markAllRead(); } catch {}
  };

  const hasResults = results && (results.groups.length + results.resources.length + results.communities.length) > 0;

  return (
    <header className="h-12 flex items-center gap-4 px-5 border-b border-surface-border bg-surface flex-shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm relative" ref={searchRef}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          onFocus={() => results && setShowResults(true)}
          placeholder="Search groups, resources, communities…"
          className="w-full bg-surface-card border border-surface-border rounded-md pl-8 pr-7 h-8 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              className="absolute top-10 left-0 right-0 bg-surface-card border border-surface-border rounded-md shadow-card overflow-hidden z-50"
            >
              {searching ? (
                <div className="py-4 text-center text-xs text-text-muted">Searching…</div>
              ) : !hasResults ? (
                <div className="py-4 text-center text-xs text-text-muted">No results for "{debouncedSearch}"</div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {results!.groups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-border">
                        <Users className="w-3 h-3 text-text-muted" />
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Groups</span>
                      </div>
                      {results!.groups.map(g => (
                        <Link
                          key={g.id}
                          href={`/groups/${g.id}`}
                          onClick={clearSearch}
                          className="flex items-center justify-between px-3 py-2 hover:bg-surface-elevated transition-colors"
                        >
                          <span className="text-sm text-text-primary">{g.name}</span>
                          <span className="text-xs text-text-muted">{g.category}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results!.communities.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-t border-surface-border">
                        <Globe className="w-3 h-3 text-text-muted" />
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Communities</span>
                      </div>
                      {results!.communities.map(c => (
                        <Link
                          key={c.id}
                          href={`/communities/${c.slug}`}
                          onClick={clearSearch}
                          className="block px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {results!.resources.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-t border-surface-border">
                        <BookOpen className="w-3 h-3 text-text-muted" />
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Resources</span>
                      </div>
                      {results!.resources.map(r => (
                        <Link
                          key={r.id}
                          href={`/resources/${r.id}`}
                          onClick={clearSearch}
                          className="flex items-center justify-between px-3 py-2 hover:bg-surface-elevated transition-colors"
                        >
                          <span className="text-sm text-text-primary">{r.title}</span>
                          <span className="text-xs text-text-muted">{r.category}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
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
