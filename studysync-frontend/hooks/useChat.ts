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

  const { send } = useWebSocket(`${WS_BASE}/ws/chat/${groupId}/`, {
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
  });

  const sendMessage = useCallback((content: string) => {
    send({ type: 'message', content, message_type: 'text' });
  }, [send]);

  const sendTyping = useCallback((isTyping: boolean) => {
    send({ type: 'typing', is_typing: isTyping });
  }, [send]);

  return {
    messages: messages[groupId] || [],
    typingUsers: typingUsers[groupId] || [],
    sendMessage,
    sendTyping,
  };
}
