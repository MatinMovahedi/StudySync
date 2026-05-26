'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Bookmark, BookmarkCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from './GlassCard';
import { VoteButton } from './VoteButton';
import { PostTypeTag } from './PostTypeTag';
import { savePost, type Post } from '../../lib/api/communities';
import { formatRelativeTime } from '../../lib/utils/format';
import { staggerItem } from '../../lib/utils/animations';

interface PostCardProps {
  post: Post;
  showCommunity?: boolean;
}

export function PostCard({ post, showCommunity = true }: PostCardProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => savePost(post.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const authorName = post.author.id === null
    ? 'Anonymous Student'
    : `${post.author.first_name} ${post.author.last_name}`.trim() || post.author.username;

  return (
    <motion.div variants={staggerItem}>
      <GlassCard className="p-4 flex gap-3" hover={false}>
        {/* Vote column */}
        <div className="flex-shrink-0 pt-0.5">
          <VoteButton
            id={post.id}
            score={post.score}
            userVote={post.user_vote}
            type="post"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <PostTypeTag type={post.post_type} />
            {post.is_pinned && (
              <span className="text-[10px] theme-emerald border px-2 py-0.5 rounded font-medium">Pinned</span>
            )}
            {showCommunity && (
              <button
                onClick={() => router.push(`/communities/${post.community.slug}`)}
                className="text-[11px] text-brand hover:underline font-medium"
              >
                {post.community.icon} {post.community.name}
              </button>
            )}
          </div>

          <button
            onClick={() => router.push(`/communities/${post.community.slug}/post/${post.id}`)}
            className="text-left block w-full"
          >
            <h3 className="font-semibold text-text-primary text-sm leading-snug hover:text-brand transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.body && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{post.body}</p>
            )}
          </button>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
            <span>{authorName}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.created_at)}</span>
            <button
              onClick={() => router.push(`/communities/${post.community.slug}/post/${post.id}`)}
              className="flex items-center gap-1 hover:text-text-secondary transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {post.comment_count}
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              className={`flex items-center gap-1 transition-colors ml-auto ${post.is_saved ? 'text-brand' : 'hover:text-text-secondary'}`}
            >
              {post.is_saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
