'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, ArrowLeft, Users, Hash } from 'lucide-react';
import Link from 'next/link';
import { useChat } from '../../../../../hooks/useChat';
import { getGroup, getGroupMembers } from '../../../../../lib/api/groups';
import { useAuthStore } from '../../../../../lib/store/authStore';
import { Avatar } from '../../../../../components/ui/avatar';
import { formatMessageTime } from '../../../../../lib/utils/format';
import { Message } from '../../../../../lib/types';

const REACTIONS = ['👍','❤️','😂','🔥','🎉','🤔','💡','✅'];

export default function ChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const id = Number(groupId);
  const { user } = useAuthStore();
  const { messages, typingUsers, sendMessage, sendTyping } = useChat(id);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: group } = useQuery({ queryKey: ['group', id], queryFn: () => getGroup(id) });
  const { data: members } = useQuery({ queryKey: ['group-members', id], queryFn: () => getGroupMembers(id), enabled: showMembers });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
    sendTyping(false);
  }, [input, sendMessage, sendTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTyping = (v: string) => {
    setInput(v);
    if (v) {
      sendTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => sendTyping(false), 2000);
    } else {
      sendTyping(false);
    }
  };

  const groupMessages = (msgs: Message[]) => {
    const grouped: Array<{ sender: Message['sender']; messages: Message[] }> = [];
    for (const msg of msgs) {
      const last = grouped[grouped.length - 1];
      if (last && last.sender?.id === msg.sender?.id) {
        last.messages.push(msg);
      } else {
        grouped.push({ sender: msg.sender, messages: [msg] });
      }
    }
    return grouped;
  };

  return (
    <div className="h-full flex">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 flex items-center gap-3 px-4 border-b border-surface-border bg-surface flex-shrink-0">
          <Link href={`/groups/${id}`} className="text-text-muted hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-7 h-7 rounded-md bg-surface-elevated flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">{group?.name || 'Loading...'}</div>
            <div className="text-xs text-text-muted">{group?.member_count} members</div>
          </div>
          <button
            type="button"
            onClick={() => setShowMembers(!showMembers)}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${showMembers ? 'bg-emerald-950/40 text-brand border border-brand/20' : 'text-text-muted hover:bg-surface-elevated hover:text-text-secondary'}`}
          >
            <Users className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 bg-surface-card">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center mb-4">
                <Hash className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-text-secondary text-sm font-medium">This is the beginning of #{group?.name}</p>
              <p className="text-text-muted text-xs mt-1">Be the first to say something!</p>
            </div>
          )}
          {groupMessages(messages).map((group_msg, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 group/msg"
            >
              <div className="w-8 flex-shrink-0 flex items-end">
                {group_msg.sender && (
                  <Avatar name={`${group_msg.sender.first_name} ${group_msg.sender.last_name}`} src={group_msg.sender.avatar} size="sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-semibold text-text-primary">
                    {group_msg.sender?.first_name} {group_msg.sender?.last_name}
                    {group_msg.sender?.id === user?.id && <span className="text-text-muted font-normal ml-1">(you)</span>}
                  </span>
                  <span className="text-[10px] text-text-muted">{formatMessageTime(group_msg.messages[0].created_at || group_msg.messages[0].timestamp || '')}</span>
                </div>
                {group_msg.messages.map((msg, mi) => (
                  <div key={msg.id || mi} className="relative">
                    <div className={`inline-block max-w-[80%] px-3 py-2 rounded-md text-sm mb-1 ${
                      msg.sender?.id === user?.id
                        ? 'bg-brand text-white'
                        : 'bg-surface-elevated text-text-primary'
                    }`}>
                      {msg.content}
                    </div>
                    {Object.keys(msg.reactions || {}).length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="bg-surface-elevated border border-surface-border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 cursor-pointer hover:bg-surface-elevated transition-colors">
                            {emoji} <span className="text-text-muted">{(users as string[]).length}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 px-4 py-1"
              >
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
                <span className="text-xs text-text-muted">{typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-surface-border bg-surface flex-shrink-0">
          <div className="flex items-end gap-2 bg-surface-card border border-surface-border rounded-md p-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20 transition-colors">
            <div className="relative">
              <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors rounded-md hover:bg-surface-elevated">
                <Smile className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute bottom-10 left-0 bg-surface-card border border-surface-border rounded-md p-2 flex gap-1 shadow-card z-10"
                  >
                    {REACTIONS.map(e => (
                      <button type="button" key={e} onClick={() => { setInput(v => v + e); setShowEmoji(false); }}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-elevated rounded-md transition-colors">
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <textarea
              value={input}
              onChange={e => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${group?.name || '...'}` }
              rows={1}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none py-1 max-h-32"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-dark flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Members sidebar */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface-card border-l border-surface-border overflow-hidden flex-shrink-0"
          >
            <div className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Members</h3>
              <div className="space-y-2">
                {members?.map((m: { id: number; user: { id: number; first_name: string; last_name: string; avatar: string | null }; role: string }) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Avatar name={`${m.user.first_name} ${m.user.last_name}`} src={m.user.avatar} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-text-primary truncate">{m.user.first_name}</div>
                      {m.role === 'admin' && <div className="text-[10px] text-amber-500">Admin</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
