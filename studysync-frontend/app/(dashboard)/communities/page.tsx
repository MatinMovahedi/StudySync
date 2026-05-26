'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Hash, TrendingUp, Sparkles, Clock, ChevronUp } from 'lucide-react';
import { getCommunities, getGlobalFeed, type Post } from '../../../lib/api/communities';
import { GlassCard } from '../../../components/shared/GlassCard';
import { CommunityCard } from '../../../components/shared/CommunityCard';
import { PostCard } from '../../../components/shared/PostCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

const SORT_OPTIONS = [
  { value: 'hot',  label: 'Hot',  icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'new',  label: 'New',  icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'top',  label: 'Top',  icon: <ChevronUp className="w-3.5 h-3.5" /> },
];

export default function CommunitiesPage() {
  const router = useRouter();
  const [sort, setSort] = useState('hot');

  const { data: communities, isLoading: commLoad } = useQuery({
    queryKey: ['communities'],
    queryFn: getCommunities,
  });

  const { data: feed, isLoading: feedLoad } = useQuery({
    queryKey: ['global-feed', sort],
    queryFn: () => getGlobalFeed({ sort }),
  });

  const joined = communities?.results ?? communities ?? [];
  const joinedCommunities = Array.isArray(joined) ? joined.filter((c: { is_member: boolean }) => c.is_member) : [];
  const trendingCommunities = Array.isArray(joined) ? [...joined].sort((a: { member_count: number }, b: { member_count: number }) => b.member_count - a.member_count).slice(0, 5) : [];
  const posts: Post[] = feed?.results ?? feed ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={staggerItem} className="mb-8">
          <p className="text-xs text-text-muted mb-1">Discuss · Share · Learn</p>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <Hash className="w-6 h-6 text-brand" /> Communities
          </h1>
          <p className="text-text-muted text-xs mt-1">University knowledge, organized by topic</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar — joined communities */}
          <motion.div variants={staggerItem} className="lg:col-span-1 space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Your Communities</p>
            {commLoad ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : joinedCommunities.length === 0 ? (
              <p className="text-xs text-text-muted">Join communities below to see them here.</p>
            ) : (
              joinedCommunities.map((c: { slug: string; icon: string; name: string; member_count: number }) => (
                <button
                  key={c.slug}
                  onClick={() => router.push(`/communities/${c.slug}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-surface-elevated transition-colors text-left"
                >
                  <span className="text-base">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{c.name}</p>
                    <p className="text-[10px] text-text-muted">{c.member_count} members</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>

          {/* Center — feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sort tabs */}
            <motion.div variants={staggerItem} className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-md">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded transition-colors ${
                    sort === opt.value
                      ? 'bg-surface-elevated text-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </motion.div>

            {feedLoad ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : posts.length === 0 ? (
              <GlassCard className="p-12 text-center" hover={false}>
                <Sparkles className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">Join communities to see posts in your feed.</p>
              </GlassCard>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                {posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} showCommunity />
                ))}
              </motion.div>
            )}
          </div>

          {/* Right sidebar — discover */}
          <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Discover</p>
              {commLoad ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                  {trendingCommunities.map((c: Parameters<typeof CommunityCard>[0]['community']) => (
                    <CommunityCard
                      key={c.slug}
                      community={c}
                      onNavigate={(slug) => router.push(`/communities/${slug}`)}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
