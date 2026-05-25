'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Edit3, Save, X, GraduationCap, Book, Clock, Flame, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/store/authStore';
import { getStreak } from '../../../lib/api/analytics';
import { GlassCard } from '../../../components/shared/GlassCard';
import { GradientText } from '../../../components/shared/GradientText';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { formatStudyHours } from '../../../lib/utils/format';

const STUDY_STYLES: Record<string, string> = {
  early_bird: 'Early Bird 🌅', night_owl: 'Night Owl 🦉', pomodoro: 'Pomodoro 🍅',
  group_learner: 'Group Learner 👥', solo_studier: 'Solo Studier 🎧', visual: 'Visual 🎨',
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: user?.profile?.bio || '',
    university: user?.profile?.university || '',
    program: user?.profile?.program || '',
  });

  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: getStreak });

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/api/users/profile/', form);
      const { data: updated } = await api.get('/api/users/me/');
      setUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-6">
          <h1 className="text-3xl font-bold"><GradientText>My Profile</GradientText></h1>
        </motion.div>

        {/* Profile header card */}
        <motion.div variants={staggerItem}>
          <GlassCard className="mb-6 overflow-hidden p-0" hover={false}>
            <div className="h-24 bg-gradient-to-r from-brand/30 via-accent-purple/20 to-accent-cyan/20" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <Avatar name={`${user.first_name} ${user.last_name}`} src={user.profile?.avatar} size="xl"
                  className="border-4 border-surface-card" />
                {!editing ? (
                  <Button variant="glass" size="sm" onClick={() => setEditing(true)} className="gap-2">
                    <Edit3 className="w-3.5 h-3.5" />Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" onClick={save} loading={saving} className="gap-2"><Save className="w-3.5 h-3.5" />Save</Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <>
                  <h2 className="text-2xl font-bold text-text-primary">{user.first_name} {user.last_name}</h2>
                  <p className="text-text-muted text-sm">{user.email}</p>
                  {user.profile?.bio && <p className="text-text-secondary text-sm mt-3 leading-relaxed">{user.profile.bio}</p>}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {user.profile?.university && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <GraduationCap className="w-3.5 h-3.5" />{user.profile.university}
                      </div>
                    )}
                    {user.profile?.program && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Book className="w-3.5 h-3.5" />{user.profile.program}
                        {user.profile.year_of_study && ` · Year ${user.profile.year_of_study}`}
                      </div>
                    )}
                    {user.profile?.availability && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock className="w-3.5 h-3.5" />{user.profile.availability.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="University" value={form.university} onChange={e => setForm(f => ({...f, university: e.target.value}))} />
                    <Input label="Program" value={form.program} onChange={e => setForm(f => ({...f, program: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-1.5 block">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={3}
                      className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 resize-none transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false}>
              <h3 className="text-base font-semibold text-text-primary mb-4">Study Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Study Streak', value: `${streak?.current_streak || 0} days`, icon: <Flame className="w-4 h-4" />, color: '#f59e0b' },
                  { label: 'Best Streak', value: `${streak?.longest_streak || 0} days`, icon: <Trophy className="w-4 h-4" />, color: '#6366f1' },
                  { label: 'Total Hours', value: formatStudyHours(user.profile?.total_study_hours || 0), icon: <Clock className="w-4 h-4" />, color: '#06b6d4' },
                  { label: 'Sessions', value: `${user.profile?.total_sessions || 0}`, icon: <GraduationCap className="w-4 h-4" />, color: '#10b981' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                    <span className="text-sm text-text-secondary flex-1">{s.label}</span>
                    <span className="text-sm font-semibold text-text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Courses & Tags */}
          <motion.div variants={staggerItem} className="space-y-4">
            {user.profile?.courses && user.profile.courses.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="text-base font-semibold text-text-primary mb-3">Courses</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.courses.map((c: string) => <Badge key={c} variant="muted" className="text-xs">{c}</Badge>)}
                </div>
              </GlassCard>
            )}
            {user.profile?.study_style_tags && user.profile.study_style_tags.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="text-base font-semibold text-text-primary mb-3">Study Style</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.study_style_tags.map((t: string) => (
                    <Badge key={t} variant="purple" className="text-xs">{STUDY_STYLES[t] || t}</Badge>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
