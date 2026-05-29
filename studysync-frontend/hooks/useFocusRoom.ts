'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../lib/api/client';

export interface FocusRoomState {
  active: boolean;
  startedAt: string | null;
  duration: number;
  startedBy: number | null;
}

const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_KEY ?? null;

export function useFocusRoom(groupId: number | null) {
  const [focusState, setFocusState] = useState<FocusRoomState>({
    active: false,
    startedAt: null,
    duration: 25,
    startedBy: null,
  });
  const ablyRef = useRef<import('ably').Realtime | null>(null);
  const channelRef = useRef<import('ably').RealtimeChannel | null>(null);

  // Load initial state from REST
  useEffect(() => {
    if (!groupId) return;
    api.get(`/api/chat/${groupId}/focus/`).then(r => {
      setFocusState({
        active: r.data.active,
        startedAt: r.data.started_at,
        duration: r.data.duration ?? 25,
        startedBy: r.data.started_by,
      });
    }).catch(() => {});
  }, [groupId]);

  // Ably subscription for real-time sync
  useEffect(() => {
    if (!ABLY_KEY || !groupId) return;
    let cancelled = false;

    (async () => {
      const Ably = await import('ably');
      if (cancelled) return;
      const client = new Ably.Realtime({ key: ABLY_KEY });
      ablyRef.current = client;
      const channel = client.channels.get(`chat-${groupId}`);
      channelRef.current = channel;

      channel.subscribe('focus_start', (msg) => {
        if (cancelled) return;
        const d = msg.data as { started_at: string; duration: number; started_by: number };
        setFocusState({ active: true, startedAt: d.started_at, duration: d.duration, startedBy: d.started_by });
      });

      channel.subscribe('focus_stop', (msg) => {
        if (cancelled) return;
        void msg;
        setFocusState({ active: false, startedAt: null, duration: 25, startedBy: null });
      });
    })();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      ablyRef.current?.close();
      ablyRef.current = null;
      channelRef.current = null;
    };
  }, [groupId]);

  const startFocus = useCallback(async (duration = 25) => {
    if (!groupId) return;
    const r = await api.post(`/api/chat/${groupId}/focus/`, { action: 'start', duration });
    setFocusState({ active: true, startedAt: r.data.started_at, duration: r.data.duration, startedBy: r.data.started_by });
  }, [groupId]);

  const stopFocus = useCallback(async () => {
    if (!groupId) return;
    await api.post(`/api/chat/${groupId}/focus/`, { action: 'stop' });
    setFocusState({ active: false, startedAt: null, duration: 25, startedBy: null });
  }, [groupId]);

  return { focusState, startFocus, stopFocus };
}
