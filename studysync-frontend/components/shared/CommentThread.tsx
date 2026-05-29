'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VoteButton } from './VoteButton';
import { createComment, deleteComment, type Comment } from '../../lib/api/communities';
import { useAuthStore } from '../../lib/store/authStore';
import { formatRelativeTime } from '../../lib/utils/format';
import { fadeInUp } from '../../lib/utils/animations';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  depth?: number;
}

function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const replyMutation = useMutation({
    mutationFn: () => createComment(postId, { body, parent: comment.id, is_anonymous: anon }),
    onSuccess: () => {
      setBody('');
      setShowReply(false);
      qc.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post-comments', postId] }),
  });

  const isOwn = user?.id === comment.author.id;

  const authorName = comment.author.id === null
    ? 'Anonymous Student'
    : `${comment.author.first_name} ${comment.author.last_name}`.trim() || comment.author.username;

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center text-[10px] text-text-muted font-medium">
          {authorName[0]?.toUpperCase()}
        </div>
        {(comment.replies?.length > 0 || depth === 0) && (
          <div className="w-px flex-1 bg-surface-border mt-1" />
        )}
      </div>

      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-text-primary">{authorName}</span>
          <span className="text-[11px] text-text-muted">{formatRelativeTime(comment.created_at)}</span>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{comment.body}</p>

        <div className="flex items-center gap-3 mt-2">
          <VoteButton id={comment.id} score={comment.score} userVote={comment.user_vote} type="comment" />
          {depth < 2 && (
            <button
              type="button"
              onClick={() => setShowReply(r => !r)}
              className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              aria-label="Delete comment"
              className="text-text-muted hover:text-rose-400 transition-colors disabled:opacity-50 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand/50"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anon}
                    onChange={e => setAnon(e.target.checked)}
                    className="accent-brand"
                  />
                  Post anonymously
                </label>
                <button
                  onClick={() => replyMutation.mutate()}
                  disabled={!body.trim() || replyMutation.isPending}
                  className="text-xs px-3 py-1.5 bg-brand text-white rounded-md hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {replyMutation.isPending ? 'Posting…' : 'Reply'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies?.map(reply => (
          <div key={reply.id} className="ml-4 mt-3 border-l border-surface-border pl-4">
            <CommentItem comment={reply} postId={postId} depth={depth + 1} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
  postId: number;
}

export function CommentThread({ comments, postId }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-text-muted">
        No comments yet — be the first to reply.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
