'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGroupByInviteCode, joinGroupByInviteCode } from '../../../../../lib/api/groups';
import { GlassCard } from '../../../../../components/shared/GlassCard';
import { Button } from '../../../../../components/ui/button';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { useAuthStore } from '../../../../../lib/store/authStore';
import { fadeInUp } from '../../../../../lib/utils/animations';

export default function JoinByInvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['group-invite', inviteCode],
    queryFn: () => getGroupByInviteCode(inviteCode),
    enabled: !!inviteCode,
    retry: false,
  });

  const joinMut = useMutation({
    mutationFn: () => joinGroupByInviteCode(inviteCode),
    onSuccess: (data) => {
      toast.success(`Joined ${group?.name}!`);
      router.push(`/groups/${data.group_id}`);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error ?? 'Failed to join group');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Invalid invite link</h1>
          <p className="text-text-muted text-sm mb-6">This invite link is no longer valid or doesn't exist.</p>
          <Button onClick={() => router.push('/groups')}>Browse groups</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-md">
        <GlassCard className="p-8 text-center" hover={false}>
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: group.avatar_color + '22', border: `2px solid ${group.avatar_color}44` }}
          >
            <Users className="w-8 h-8" style={{ color: group.avatar_color }} />
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">{group.name}</h1>
          <p className="text-sm text-text-muted capitalize mb-4">{group.category.replace(/_/g, ' ')}</p>

          {group.description && (
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">{group.description}</p>
          )}

          <div className="flex items-center justify-center gap-6 py-4 mb-6 border-t border-b border-surface-border">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{group.member_count}</div>
              <div className="text-xs text-text-muted">Members</div>
            </div>
            <div className="w-px h-8 bg-surface-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{group.max_members}</div>
              <div className="text-xs text-text-muted">Max size</div>
            </div>
          </div>

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-text-muted">Sign in to join this study group</p>
              <Button className="w-full" onClick={() => router.push(`/login?next=/groups/join/${inviteCode}`)}>
                <Lock className="w-4 h-4" />
                Sign in to join
              </Button>
            </div>
          ) : group.member_count >= group.max_members ? (
            <div>
              <p className="text-sm text-rose-400 mb-4">This group is full ({group.member_count}/{group.max_members} members)</p>
              <Button variant="secondary" className="w-full" onClick={() => router.push('/groups')}>
                Browse other groups
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => joinMut.mutate()}
              loading={joinMut.isPending}
            >
              Join {group.name}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
