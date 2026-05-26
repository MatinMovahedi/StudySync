'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, TrendingUp, Clock, ChevronUp, PenSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getCommunity, getCommunityPosts, joinCommunity, type Post } from '../../../../lib/api/communities';
import { GlassCard } from '../../../../components/shared/GlassCard';
import { PostCard } from '../../../../components/shared/PostCard';
import { CreatePostModal } from '../../../../components/shared/CreatePostModal';
import { Skeleton } from '../../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../../lib/utils/animations';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'new', label: 'New', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'top', label: 'Top', icon: <ChevronUp className="w-3.5 h-3.5" /> },
];

const POST_TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'question', label: 'Questions' },
  { value: 'discussion', label: 'Discussions' },
  { value: 'resource', label: 'Resources' },
  { value: 'announcement', label: 'Announcements' },
];

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState('hot');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const qc = useQueryClient();

  const { data: community, isLoading: cLoad } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => getCommunity(slug),
  });

  const { data: postsData, isLoading: pLoad } = useQuery({
    queryKey: ['community-posts', slug, sort, typeFilter],
    queryFn: () => getCommunityPosts(slug, { sort, type: typeFilter || undefined }),
    enabled: !!slug,
  });

  const joinMutation = useMutation({
    mutationFn: () => joinCommunity(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', slug] });
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const posts: Post[] = postsData?.results ?? postsData ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Community header */}
        <motion.div variants={staggerItem}>
          <GlassCard className="p-6 mb-6" hover={false}>
            {cLoad ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : community ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg theme-emerald border flex items-center justify-center text-3xl flex-shrink-0">
                    {community.icon}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-text-primary">{community.name}</h1>
                    {community.description && (
                      <p className="text-sm text-text-muted mt-1 max-w-lg">{community.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {community.member_count.toLocaleString()} members
                      </span>
                      <span className="capitalize theme-muted border px-2 py-0.5 rounded text-[10px]">
                        {community.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/communities/${slug}/wiki`}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-surface-border text-text-muted rounded-md hover:bg-surface-elevated hover:text-text-primary transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Wiki
                  </Link>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
                  >
                    <PenSquare className="w-3.5 h-3.5" /> Post
                  </button>
                  <button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      community.is_member
                        ? 'border-surface-border text-text-muted hover:border-rose-500/50 hover:text-rose-400'
                        : 'border-brand/50 text-brand hover:bg-brand/10'
                    }`}
                  >
                    {community.is_member ? 'Leave' : 'Join'}
                  </button>
                </div>
              </div>
            ) : null}
          </GlassCard>
        </motion.div>

        {/* Sort + type filters */}
        <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-md">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${
                  sort === opt.value ? 'bg-surface-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
            {POST_TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  typeFilter === f.value
                    ? 'border-brand/50 text-brand bg-brand/5'
                    : 'border-surface-border text-text-muted hover:text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        {pLoad ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : posts.length === 0 ? (
          <GlassCard className="p-12 text-center" hover={false}>
            <PenSquare className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">No posts yet. Be the first to share!</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-xs px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              Create Post
            </button>
          </GlassCard>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {posts.map((post: Post) => (
              <PostCard key={post.id} post={post} showCommunity={false} />
            ))}
          </motion.div>
        )}
      </motion.div>

      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} communitySlug={slug} />
    </div>
  );
}
