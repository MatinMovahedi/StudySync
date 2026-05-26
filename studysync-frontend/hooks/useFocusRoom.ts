'use client';
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface FocusRoomState {
  active: boolean;
  startedAt: string | null;
  duration: number;
  startedBy: number | null;
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function useFocusRoom(groupId: number | null) {
  const [focusState, setFocusState] = useState<FocusRoomState>({
    active: false,
    startedAt: null,
    duration: 25,
    startedBy: null,
  });

  const wsUrl = groupId ? `${WS_BASE}/ws/chat/${groupId}/` : null;

  const { send } = useWebSocket(wsUrl, {
    onMessage: useCallback((msg: { type: string; data?: Record<string, unknown> }) => {
      if (msg.type === 'focus_start') {
        setFocusState({
          active: true,
          startedAt: msg.data?.started_at as string ?? new Date().toISOString(),
          duration: msg.data?.duration as number ?? 25,
          startedBy: msg.data?.started_by as number ?? null,
        });
      } else if (msg.type === 'focus_stop') {
        setFocusState({ active: false, startedAt: null, duration: 25, startedBy: null });
      } else if (msg.type === 'focus_sync') {
        const d = msg.data as { started_at: string; duration: number; started_by: number } | undefined;
        if (d) {
          setFocusState({ active: true, startedAt: d.started_at, duration: d.duration, startedBy: d.started_by });
        }
      }
    }, []),
  });

  const startFocus = useCallback((duration = 25) => {
    send({ type: 'focus_start', duration });
  }, [send]);

  const stopFocus = useCallback(() => {
    send({ type: 'focus_stop' });
  }, [send]);

  return { focusState, startFocus, stopFocus };
}
