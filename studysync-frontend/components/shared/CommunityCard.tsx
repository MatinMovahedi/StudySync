'use client';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from './GlassCard';
import { joinCommunity, type Community } from '../../lib/api/communities';
import { useCommunityStore } from '../../lib/store/communityStore';
import { staggerItem } from '../../lib/utils/animations';

interface CommunityCardProps {
  community: Community;
  onNavigate?: (slug: string) => void;
}

export function CommunityCard({ community, onNavigate }: CommunityCardProps) {
  const { setJoined } = useCommunityStore();
  const qc = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => joinCommunity(community.slug),
    onSuccess: (data) => {
      setJoined(community.slug, data.joined);
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  return (
    <motion.div variants={staggerItem}>
      <GlassCard className="p-4 flex flex-col gap-3" hover={false}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md theme-emerald border flex items-center justify-center text-xl flex-shrink-0">
            {community.icon}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onNavigate?.(community.slug)}
              className="font-semibold text-text-primary text-sm hover:text-brand transition-colors text-left"
            >
              {community.name}
            </button>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{community.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Users className="w-3 h-3" />
            <span>{community.member_count.toLocaleString()} members</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); joinMutation.mutate(); }}
            disabled={joinMutation.isPending}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              community.is_member
                ? 'border-surface-border text-text-muted hover:border-rose-500/50 hover:text-rose-400'
                : 'border-brand/50 text-brand hover:bg-brand/10'
            }`}
          >
            {community.is_member ? 'Leave' : 'Join'}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
