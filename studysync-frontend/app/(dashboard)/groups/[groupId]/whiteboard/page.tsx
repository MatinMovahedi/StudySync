'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Save, Clock, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { getGroup, getWhiteboard, saveWhiteboard } from '../../../../../lib/api/groups';
import { Avatar } from '../../../../../components/ui/avatar';
import { useThemeStore } from '../../../../../lib/store/themeStore';

const WhiteboardCanvas = dynamic(
  () => import('../../../../../components/shared/WhiteboardCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading whiteboard…</p>
        </div>
      </div>
    ),
  }
);

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function WhiteboardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const id = Number(groupId);
  const { theme } = useThemeStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [remoteState, setRemoteState] = useState<Record<string, unknown>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastEditor, setLastEditor] = useState<{ id: number; name: string } | null>(null);
  const [online, setOnline] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRemoteAt = useRef<string>('');

  const { data: group } = useQuery({ queryKey: ['group', id], queryFn: () => getGroup(id) });

  // Initial load
  useEffect(() => {
    getWhiteboard(id)
      .then(data => {
        if (data.state && Object.keys(data.state).length > 0) {
          setRemoteState(data.state);
        }
        setLastUpdated(data.updated_at);
        setLastEditor(data.updated_by);
        lastRemoteAt.current = data.updated_at;
        setOnline(true);
      })
      .catch(() => setOnline(false));
  }, [id]);

  // Poll for remote changes every 5 seconds
  useEffect(() => {
    pollRef.current = setInterval(() => {
      getWhiteboard(id)
        .then(data => {
          setOnline(true);
          if (data.updated_at !== lastRemoteAt.current) {
            lastRemoteAt.current = data.updated_at;
            setLastUpdated(data.updated_at);
            setLastEditor(data.updated_by);
            if (data.state && Object.keys(data.state).length > 0) {
              setRemoteState({ ...data.state });
            }
          }
        })
        .catch(() => setOnline(false));
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  const handleSave = useCallback(async (state: Record<string, unknown>) => {
    setSaveStatus('saving');
    try {
      const result = await saveWhiteboard(id, state);
      lastRemoteAt.current = result.updated_at;
      setLastUpdated(result.updated_at);
      setSaveStatus('saved');
      setOnline(true);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setOnline(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [id]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 h-11 flex items-center gap-3 px-4 border-b border-surface-border bg-surface z-10">
        <Link
          href={`/groups/${id}`}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{group?.name ?? 'Group'}</span>
        </Link>

        <div className="w-px h-4 bg-surface-border mx-1" />

        <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          Whiteboard
        </span>

        <div className="ml-auto flex items-center gap-3">
          {/* Online indicator */}
          <span className="flex items-center gap-1 text-xs text-text-muted">
            {online
              ? <Wifi className="w-3 h-3 text-brand" />
              : <WifiOff className="w-3 h-3 text-rose-400" />}
          </span>

          {/* Save status */}
          <span className={`flex items-center gap-1 text-xs transition-colors ${
            saveStatus === 'saving' ? 'text-amber-400' :
            saveStatus === 'saved'  ? 'text-brand' :
            saveStatus === 'error'  ? 'text-rose-400' :
            'text-text-muted'
          }`}>
            <Save className="w-3 h-3" />
            {saveStatus === 'saving' ? 'Saving…' :
             saveStatus === 'saved'  ? 'Saved' :
             saveStatus === 'error'  ? 'Save failed' :
             'Auto-save on'}
          </span>

          {/* Last updated */}
          {lastUpdated && (
            <span className="hidden md:flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              {lastEditor ? `${lastEditor.name}, ` : ''}{timeAgo(lastUpdated)}
            </span>
          )}

          {/* Members pill */}
          {group && (
            <span className="flex items-center gap-1 text-xs text-text-muted border border-surface-border rounded-md px-2 py-1">
              <Users className="w-3 h-3" />
              {group.member_count}
            </span>
          )}
        </div>
      </div>

      {/* Collaboration notice */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-brand/5 border-b border-brand/10"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="text-xs text-brand/70">
          Live collaboration — changes sync every 5 seconds across all group members
        </span>
      </motion.div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <WhiteboardCanvas
          initialState={remoteState}
          onSave={handleSave}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}
