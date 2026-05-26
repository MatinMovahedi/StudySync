'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Lock, ArrowRight, UserMinus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getGroup, getGroupMembers, joinGroup, leaveGroup } from '../../../../lib/api/groups';
import { getSessions } from '../../../../lib/api/sessions';
import { GlassCard } from '../../../../components/shared/GlassCard';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Avatar } from '../../../../components/ui/avatar';
import { Skeleton } from '../../../../components/ui/skeleton';
import { formatDateTime } from '../../../../lib/utils/format';
import { staggerContainer, staggerItem } from '../../../../lib/utils/animations';
import { useAuthStore } from '../../../../lib/store/authStore';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const id = Number(groupId);
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { data: group, isLoading } = useQuery({ queryKey: ['group', id], queryFn: () => getGroup(id) });
  const { data: members } = useQuery({ queryKey: ['group-members', id], queryFn: () => getGroupMembers(id) });
  const { data: allSessions } = useQuery<import('../../../../lib/api/sessions').StudySession[]>({ queryKey: ['sessions'], queryFn: () => getSessions() });
  const sessions = allSessions?.filter(s => s.group === id) || [];

  const joinMut = useMutation({ mutationFn: () => joinGroup(id), onSuccess: () => { toast.success('Joined!'); qc.invalidateQueries({ queryKey: ['group', id] }); } });
  const leaveMut = useMutation({ mutationFn: () => leaveGroup(id), onSuccess: () => { toast.success('Left group'); router.push('/groups'); } });

  if (isLoading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  );
  if (!group) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <GlassCard className="mb-6 overflow-hidden p-0">
            <div className="h-2 w-full" style={{ background: group.avatar_color }} />
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-text-muted" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold text-text-primary">{group.name}</h1>
                  {group.is_private && <Lock className="w-4 h-4 text-text-muted" />}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="default">{group.category.replace('_', ' ')}</Badge>
                  {group.course_code && <Badge variant="muted">{group.course_code}</Badge>}
                  <span className="text-xs text-text-muted">{group.member_count}/{group.max_members} members</span>
                </div>
                {group.description && <p className="text-sm text-text-secondary mt-2">{group.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {group.is_member ? (
                  <>
                    <Link href={`/groups/${group.id}/chat`}>
                      <Button className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Open chat
                      </Button>
                    </Link>
                    {group.user_role !== 'admin' && (
                      confirmLeave ? (
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setConfirmLeave(false)}>Cancel</Button>
                          <Button variant="danger" size="sm" onClick={() => leaveMut.mutate()} loading={leaveMut.isPending}>
                            Confirm leave
                          </Button>
                        </div>
                      ) : (
                        <Button variant="danger" size="sm" onClick={() => setConfirmLeave(true)}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )
                    )}
                  </>
                ) : (
                  <Button onClick={() => joinMut.mutate()} loading={joinMut.isPending}>Join group</Button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members */}
          <motion.div variants={staggerItem}>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Members ({members?.length || 0})
            </h2>
            <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
              {members?.slice(0, 8).map((m: { id: number; user: { id: number; first_name: string; last_name: string; avatar: string | null; email: string }; role: string; joined_at: string }) => (
                <Link key={m.id} href={m.user.id === user?.id ? '/profile' : `/profile/${m.user.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-surface-card hover:bg-surface-elevated transition-colors cursor-pointer">
                    <Avatar name={`${m.user.first_name} ${m.user.last_name}`} src={m.user.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">{m.user.first_name} {m.user.last_name}</div>
                      <div className="text-xs text-text-muted">{m.user.email}</div>
                    </div>
                    {m.role === 'admin' && <Badge variant="muted" className="text-[10px]">Admin</Badge>}
                    {m.user.id === user?.id && <span className="text-[10px] text-text-muted">You</span>}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Sessions */}
          <motion.div variants={staggerItem}>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming Sessions
            </h2>
            {sessions.length === 0 ? (
              <div className="border border-surface-border rounded-md p-6 text-center bg-surface-card">
                <Calendar className="w-6 h-6 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No sessions scheduled</p>
              </div>
            ) : (
              <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
                {sessions.map((s: { id: number; title: string; scheduled_at: string; duration_minutes: number; is_online: boolean; join_link: string }) => (
                  <div key={s.id} className="px-4 py-3 bg-surface-card hover:bg-surface-elevated transition-colors">
                    <div className="text-sm font-medium text-text-primary">{s.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{formatDateTime(s.scheduled_at)} · {s.duration_minutes}min</div>
                    {s.is_online && s.join_link && (
                      <a href={s.join_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary" className="mt-2 text-xs gap-1">
                          Join <ArrowRight className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
