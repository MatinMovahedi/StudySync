'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api/client';
import { useChatStore } from '../lib/store/chatStore';
import { useAuthStore } from '../lib/store/authStore';
import { Message } from '../lib/types';

const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_KEY ?? null;

export function useChat(groupId: number) {
  const { addMessage, setMessages, setTyping, updateMessageReactions, messages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const ablyRef = useRef<import('ably').Realtime | null>(null);
  const channelRef = useRef<import('ably').RealtimeChannel | null>(null);

  // Initial message load
  const { data } = useQuery({
    queryKey: ['messages', groupId],
    queryFn: () =>
      api
        .get(`/api/chat/${groupId}/messages/?ordering=-created_at&limit=50`)
        .then(r => (r.data.results || r.data).reverse()),
    enabled: !!groupId,
  });

  useEffect(() => {
    if (data) setMessages(groupId, data);
  }, [data, groupId, setMessages]);

  // Ably real-time subscription
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

      channel.subscribe('message', (msg) => {
        if (cancelled) return;
        addMessage(groupId, msg.data as Message);
      });

      channel.subscribe('typing', (msg) => {
        if (cancelled) return;
        const d = msg.data as { user_id: number; username: string; is_typing: boolean };
        if (d.user_id !== user?.id) {
          setTyping(groupId, { user_id: d.user_id, username: d.username }, d.is_typing);
        }
      });

      channel.subscribe('reaction', (msg) => {
        if (cancelled) return;
        const d = msg.data as { message_id: number; reactions: Record<string, string[]> };
        updateMessageReactions(groupId, d.message_id, d.reactions);
      });
    })();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      ablyRef.current?.close();
      ablyRef.current = null;
      channelRef.current = null;
    };
  }, [groupId, user?.id, addMessage, setTyping, updateMessageReactions]);

  const reactToMessage = useCallback(async (messageId: number, emoji: string) => {
    const r = await api.post(`/api/chat/messages/${messageId}/react/`, { emoji });
    updateMessageReactions(groupId, messageId, r.data.reactions);
  }, [groupId, updateMessageReactions]);

  const sendMessage = useCallback(async (content: string) => {
    const r = await api.post(`/api/chat/${groupId}/messages/`, {
      content,
      message_type: 'text',
    });
    // Optimistically add to local state; Ably broadcast will be ignored as duplicate
    // only if the message id already exists — safe to add here for instant feedback
    addMessage(groupId, r.data);
  }, [groupId, addMessage]);

  const sendTyping = useCallback((_isTyping: boolean) => {
    // Typing events require publish permission; skip on subscribe-only key
  }, []);

  return {
    messages: messages[groupId] || [],
    typingUsers: typingUsers[groupId] || [],
    sendMessage,
    sendTyping,
    reactToMessage,
    isFallback: false,
  };
}
