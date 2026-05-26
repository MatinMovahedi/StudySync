'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Bookmark, BookmarkCheck, Send } from 'lucide-react';
import { getPost, getPostComments, createComment, savePost, type Post } from '../../../../../../lib/api/communities';
import { GlassCard } from '../../../../../../components/shared/GlassCard';
import { VoteButton } from '../../../../../../components/shared/VoteButton';
import { PostTypeTag } from '../../../../../../components/shared/PostTypeTag';
import { CommentThread } from '../../../../../../components/shared/CommentThread';
import { Skeleton } from '../../../../../../components/ui/skeleton';
import { formatRelativeTime } from '../../../../../../lib/utils/format';
import { staggerContainer, staggerItem } from '../../../../../../lib/utils/animations';

export default function PostDetailPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: post, isLoading: pLoad } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(Number(postId)),
  });

  const { data: comments, isLoading: cLoad } = useQuery({
    queryKey: ['post-comments', Number(postId)],
    queryFn: () => getPostComments(Number(postId)),
    enabled: !!postId,
  });

  const saveMutation = useMutation({
    mutationFn: () => savePost(Number(postId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', postId] }),
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(Number(postId), { body: commentBody, is_anonymous: isAnonymous }),
    onSuccess: () => {
      setCommentBody('');
      qc.invalidateQueries({ queryKey: ['post-comments', Number(postId)] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  const postData: Post | undefined = post;
  const authorName = postData?.author?.id === null
    ? 'Anonymous Student'
    : postData ? `${postData.author.first_name} ${postData.author.last_name}`.trim() || postData.author.username : '';

  const commentList = comments?.results ?? comments ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Back */}
        <motion.div variants={staggerItem} className="mb-6">
          <button
            onClick={() => router.push(`/communities/${slug}`)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to community
          </button>
        </motion.div>

        {/* Post */}
        <motion.div variants={staggerItem}>
          <GlassCard className="p-6 mb-6" hover={false}>
            {pLoad ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-32" />
              </div>
            ) : postData ? (
              <div className="flex gap-4">
                {/* Vote */}
                <div className="flex-shrink-0">
                  <VoteButton id={postData.id} score={postData.score} userVote={postData.user_vote} type="post" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <PostTypeTag type={postData.post_type} />
                    {postData.is_pinned && (
                      <span className="text-[10px] theme-emerald border px-2 py-0.5 rounded font-medium">Pinned</span>
                    )}
                  </div>

                  <h1 className="text-xl font-bold text-text-primary leading-snug mb-3">{postData.title}</h1>

                  {postData.body && (
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-4">{postData.body}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-text-muted pt-3 border-t border-surface-border">
                    <span>{authorName}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(postData.created_at)}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{postData.comment_count} comments</span>
                    </div>
                    <button
                      onClick={() => saveMutation.mutate()}
                      className={`transition-colors ${postData.is_saved ? 'text-brand' : 'hover:text-text-secondary'}`}
                    >
                      {postData.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </GlassCard>
        </motion.div>

        {/* Comment input */}
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 mb-6" hover={false}>
            <textarea
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand/50 mb-3"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="accent-brand"
                />
                Comment anonymously
              </label>
              <button
                onClick={() => commentMutation.mutate()}
                disabled={!commentBody.trim() || commentMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-medium rounded-md hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {commentMutation.isPending ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Comments */}
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-text-muted" />
            {commentList.length} Comments
          </h2>
          {cLoad ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : (
            <CommentThread comments={commentList} postId={Number(postId)} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
