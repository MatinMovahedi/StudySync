'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

type WsMessage = { type: string; data: Record<string, unknown> };

interface Options {
  onMessage: (msg: WsMessage) => void;
  enabled?: boolean;
  maxRetries?: number;
}

export function useWebSocket(url: string | null, { onMessage, enabled = true, maxRetries = 3 }: Options) {
  const ws = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const retriesRef = useRef(0);
  const [isFallback, setIsFallback] = useState(false);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!url || !enabled || isFallback) return;
    const token = localStorage.getItem('access_token');
    const socket = new WebSocket(`${url}?token=${token}`);
    ws.current = socket;

    socket.onopen = () => { retriesRef.current = 0; };

    socket.onmessage = (e) => {
      try { onMessageRef.current(JSON.parse(e.data)); } catch {}
    };

    socket.onclose = (e) => {
      if (!e.wasClean) {
        retriesRef.current += 1;
        if (retriesRef.current >= maxRetries) {
          setIsFallback(true);
        } else {
          setTimeout(connect, 3000);
        }
      }
    };

    socket.onerror = () => {};
  }, [url, enabled, isFallback, maxRetries]);

  useEffect(() => {
    connect();
    return () => { ws.current?.close(); };
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { send, isFallback };
}
