'use client';
import { useEffect, useRef, useCallback } from 'react';

type WsMessage = { type: string; data: Record<string, unknown> };

interface Options {
  onMessage: (msg: WsMessage) => void;
  enabled?: boolean;
}

export function useWebSocket(url: string | null, { onMessage, enabled = true }: Options) {
  const ws = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!url || !enabled) return;
    const token = localStorage.getItem('access_token');
    const wsUrl = `${url}?token=${token}`;
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onmessage = (e) => {
      try { onMessageRef.current(JSON.parse(e.data)); } catch {}
    };
    socket.onclose = (e) => {
      if (!e.wasClean) setTimeout(connect, 3000);
    };
    socket.onerror = () => {};
  }, [url, enabled]);

  useEffect(() => {
    connect();
    return () => { ws.current?.close(); };
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
