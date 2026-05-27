import { create } from 'zustand';
import { Message } from '../types';

interface TypingUser {
  user_id: number;
  username: string;
}

interface ChatState {
  messages: Record<number, Message[]>;
  typingUsers: Record<number, TypingUser[]>;
  onlineUsers: Record<number, number[]>;
  addMessage: (groupId: number, message: Message) => void;
  setMessages: (groupId: number, messages: Message[]) => void;
  setTyping: (groupId: number, user: TypingUser, isTyping: boolean) => void;
  setOnline: (groupId: number, userId: number, online: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  addMessage: (groupId, message) =>
    set((state) => {
      const existing = state.messages[groupId] || [];
      if (existing.some(m => m.id === message.id)) return state;
      return { messages: { ...state.messages, [groupId]: [...existing, message] } };
    }),
  setMessages: (groupId, messages) =>
    set((state) => ({ messages: { ...state.messages, [groupId]: messages } })),
  setTyping: (groupId, user, isTyping) =>
    set((state) => {
      const current = state.typingUsers[groupId] || [];
      const filtered = current.filter(u => u.user_id !== user.user_id);
      return { typingUsers: { ...state.typingUsers, [groupId]: isTyping ? [...filtered, user] : filtered } };
    }),
  setOnline: (groupId, userId, online) =>
    set((state) => {
      const current = state.onlineUsers[groupId] || [];
      const filtered = current.filter(id => id !== userId);
      return { onlineUsers: { ...state.onlineUsers, [groupId]: online ? [...filtered, userId] : filtered } };
    }),
}));
