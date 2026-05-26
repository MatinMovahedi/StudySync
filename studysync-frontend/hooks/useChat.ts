'use client';
import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api/client';
import { useChatStore } from '../lib/store/chatStore';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '../lib/store/authStore';
import { Message } from '../lib/types';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function useChat(groupId: number) {
  const { addMessage, setMessages, setTyping, setOnline, messages, typingUsers } = useChatStore();
  const { user } = useAuthStore();

  // Initial message load
  const { data } = useQuery({
    queryKey: ['messages', groupId],
    queryFn: () => api.get(`/api/chat/${groupId}/messages/?ordering=-created_at&limit=50`).then(r =>
      (r.data.results || r.data).reverse()
    ),
    enabled: !!groupId,
  });

  useEffect(() => {
    if (data) setMessages(groupId, data);
  }, [data, groupId, setMessages]);

  const { send, isFallback } = useWebSocket(`${WS_BASE}/ws/chat/${groupId}/`, {
    onMessage: (msg) => {
      if (msg.type === 'message') addMessage(groupId, msg.data as unknown as Message);
      else if (msg.type === 'typing') {
        const d = msg.data as { user_id: number; username: string; is_typing: boolean };
        if (d.user_id !== user?.id) setTyping(groupId, { user_id: d.user_id, username: d.username }, d.is_typing);
      } else if (msg.type === 'presence') {
        const d = msg.data as { user_id: number; action: string };
        setOnline(groupId, d.user_id, d.action === 'joined');
      }
    },
    enabled: !!groupId,
    maxRetries: 3,
  });

  // Polling fallback: poll every 3 s when WebSocket is unavailable (e.g. Vercel serverless)
  useQuery({
    queryKey: ['messages-poll', groupId],
    queryFn: async () => {
      const r = await api.get(`/api/chat/${groupId}/messages/?ordering=-created_at&limit=50`);
      const msgs = (r.data.results || r.data).reverse();
      setMessages(groupId, msgs);
      return msgs;
    },
    enabled: !!groupId && isFallback,
    refetchInterval: 3000,
  });

  const sendMessage = useCallback(async (content: string) => {
    if (isFallback) {
      const r = await api.post(`/api/chat/${groupId}/messages/`, { content, message_type: 'text' });
      addMessage(groupId, r.data);
    } else {
      send({ type: 'message', content, message_type: 'text' });
    }
  }, [send, isFallback, groupId, addMessage]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!isFallback) send({ type: 'typing', is_typing: isTyping });
  }, [send, isFallback]);

  return {
    messages: messages[groupId] || [],
    typingUsers: typingUsers[groupId] || [],
    sendMessage,
    sendTyping,
    isFallback,
  };
}
