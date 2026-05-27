'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, Sparkles, Link2, Globe, ExternalLink, Code2, UserPlus, UserCheck } from 'lucide-react';
import { getUserById, followUser, getFollowStats } from '../../../../lib/api/auth';
import { Avatar } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../../lib/utils/animations';
import { User } from '../../../../lib/types';
import { useAuthStore } from '../../../../lib/store/authStore';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuthStore();
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => getUserById(Number(userId)),
  });

  const { data: followStats } = useQuery({
    queryKey: ['follow-stats', userId],
    queryFn: () => getFollowStats(Number(userId)),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(Number(userId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follow-stats', userId] }),
  });

  const isOwnProfile = me?.id === Number(userId);

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-20 rounded-md" />
        <Skeleton className="h-32 rounded-md" />
        <Skeleton className="h-24 rounded-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-16">
        <p className="text-text-muted text-sm">User not found</p>
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">

        {/* Header card */}
        <motion.div variants={staggerItem} className="border border-surface-border rounded-md overflow-hidden bg-surface-card">
          <div className="h-12 bg-surface-elevated" />
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-6 mb-4">
              <Avatar
                name={`${user.first_name} ${user.last_name}`}
                src={profile?.avatar}
                size="xl"
                className="border-4 border-surface-card"
              />
              <div className="flex gap-2 pb-1">
                {profile?.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                    aria-label={`${user.first_name}'s GitHub profile`}
                    className="w-8 h-8 rounded-md border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors">
                    <Link2 className="w-4 h-4" />
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                    aria-label={`${user.first_name}'s LinkedIn profile`}
                    className="w-8 h-8 rounded-md border border-surface-border flex items-center justify-center text-text-muted hover:text-brand hover:bg-surface-elevated transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    aria-label={`${user.first_name}'s website`}
                    className="w-8 h-8 rounded-md border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-md border text-sm font-medium transition-colors disabled:opacity-50 ${
                      followStats?.is_following
                        ? 'border-brand/40 bg-brand/10 text-brand hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/40'
                        : 'border-surface-border text-text-secondary hover:bg-surface-elevated'
                    }`}
                  >
                    {followStats?.is_following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {followStats?.is_following ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-xl font-semibold text-text-primary">
              {user.first_name} {user.last_name}
            </h1>
            {(profile?.university || profile?.program) && (
              <p className="text-sm text-text-muted mt-0.5">
                {profile.program}
                {profile.university && profile.program && <span className="mx-1.5 text-text-muted/40">·</span>}
                {profile.university}
              </p>
            )}
            {profile?.bio && (
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        {profile && (
          <motion.div variants={staggerItem}
            className="flex border border-surface-border rounded-md divide-x divide-surface-border bg-surface-card overflow-hidden">
            <div className="flex-1 px-4 py-3 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-text-primary tabular-nums">{profile.total_study_hours ?? 0}
                  <span className="text-xs font-normal text-text-muted ml-0.5">hrs</span>
                </div>
                <div className="text-xs text-text-muted">Study time</div>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-text-primary tabular-nums">{profile.total_sessions ?? 0}</div>
                <div className="text-xs text-text-muted">Sessions</div>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 text-center">
              <div className="text-base font-bold text-text-primary tabular-nums">{followStats?.followers ?? 0}</div>
              <div className="text-xs text-text-muted">Followers</div>
            </div>
            <div className="flex-1 px-4 py-3 text-center">
              <div className="text-base font-bold text-text-primary tabular-nums">{followStats?.following ?? 0}</div>
              <div className="text-xs text-text-muted">Following</div>
            </div>
          </motion.div>
        )}

        {/* Courses */}
        {profile?.courses && profile.courses.length > 0 && (
          <motion.div variants={staggerItem} className="border border-surface-border rounded-md bg-surface-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-text-muted" />
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Courses</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.courses.map(course => (
                <Badge key={course} variant="muted" className="text-xs">{course}</Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Study style tags */}
        {profile?.study_style_tags && profile.study_style_tags.length > 0 && (
          <motion.div variants={staggerItem} className="border border-surface-border rounded-md bg-surface-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-text-muted" />
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Study style</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.study_style_tags.map(tag => (
                <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <motion.div variants={staggerItem} className="border border-surface-border rounded-md bg-surface-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-text-muted" />
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">{skill}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects */}
        {profile?.projects && profile.projects.length > 0 && (
          <motion.div variants={staggerItem} className="border border-surface-border rounded-md bg-surface-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-text-muted" />
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Projects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.projects.map((p: { title: string; description: string; url: string; tech_stack: string[] }, i: number) => (
                <div key={i} className="p-3 bg-surface-elevated rounded-md border border-surface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-text-primary font-medium text-sm">{p.title}</p>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.title}`}
                        className="text-text-muted hover:text-brand transition-colors flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {p.description && <p className="text-text-muted text-xs line-clamp-2">{p.description}</p>}
                  {p.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tech_stack.map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-text-muted">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
