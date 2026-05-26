'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../lib/api/communities';
import { popIn } from '../../lib/utils/animations';

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion' },
  { value: 'question',   label: 'Question' },
  { value: 'resource',   label: 'Resource' },
  { value: 'announcement', label: 'Announcement' },
] as const;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  communitySlug: string;
}

export function CreatePostModal({ open, onClose, communitySlug }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'resource' | 'announcement'>('discussion');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: () => createPost(communitySlug, { title, body, post_type: postType, is_anonymous: isAnonymous }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-posts', communitySlug] });
      qc.invalidateQueries({ queryKey: ['global-feed'] });
      setTitle(''); setBody(''); setIsAnonymous(false); setPostType('discussion');
      onClose();
    },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative bg-surface-card border border-surface-border rounded-lg p-6 w-full max-w-lg shadow-card z-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-text-primary">Create Post</h2>
              <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post type tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-surface-elevated rounded-md">
              {POST_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setPostType(t.value)}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                    postType === t.value
                      ? 'bg-surface-card text-text-primary shadow-card'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 mb-3"
            />

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Body (optional)"
              rows={4}
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand/50 mb-4"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="accent-brand"
                />
                Post anonymously
              </label>
              <button
                onClick={() => mutation.mutate()}
                disabled={!title.trim() || mutation.isPending}
                className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {mutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>

            {mutation.isError && (
              <p className="text-xs text-rose-400 mt-2">Failed to create post. Please try again.</p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
