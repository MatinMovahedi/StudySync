'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Lock, ArrowRight, Hash, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getGroups, joinGroup, createGroup } from '../../../lib/api/groups';
import { GradientText } from '../../../components/shared/GradientText';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { StudyGroup } from '../../../lib/types';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'exam_prep', label: 'Exam Prep' },
  { id: 'coding_session', label: 'Coding' },
  { id: 'assignment_help', label: 'Assignments' },
  { id: 'quiet_studying', label: 'Quiet Study' },
  { id: 'project_collab', label: 'Projects' },
];

const CATEGORY_COLORS: Record<string, 'default' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'muted'> = {
  exam_prep: 'default', assignment_help: 'cyan', coding_session: 'purple',
  quiet_studying: 'emerald', project_collab: 'amber', general: 'muted',
};

// Maps avatar_color hex → Tailwind classes for strip + icon (covers the seeded palette)
const COLOR_CLASSES: Record<string, { strip: string; iconBg: string; iconText: string }> = {
  '#6366f1': { strip: 'bg-brand',          iconBg: 'bg-brand/15',          iconText: 'text-brand-light' },
  '#a855f7': { strip: 'bg-accent-purple',  iconBg: 'bg-accent-purple/15',  iconText: 'text-accent-purple' },
  '#06b6d4': { strip: 'bg-accent-cyan',    iconBg: 'bg-accent-cyan/15',    iconText: 'text-accent-cyan' },
  '#10b981': { strip: 'bg-accent-emerald', iconBg: 'bg-accent-emerald/15', iconText: 'text-accent-emerald' },
  '#f59e0b': { strip: 'bg-accent-amber',   iconBg: 'bg-accent-amber/15',   iconText: 'text-accent-amber' },
  '#ef4444': { strip: 'bg-accent-rose',    iconBg: 'bg-accent-rose/15',    iconText: 'text-accent-rose' },
  '#ec4899': { strip: 'bg-accent-rose',    iconBg: 'bg-accent-rose/15',    iconText: 'text-accent-rose' },
};
const DEFAULT_COLOR = COLOR_CLASSES['#6366f1'];
function colorClasses(hex: string | undefined) {
  return COLOR_CLASSES[hex ?? ''] ?? DEFAULT_COLOR;
}

export default function GroupsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '', description: '', course_code: '', category: 'general', is_private: false,
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', search, category],
    queryFn: () => getGroups({ search, ...(category && { category }) }),
  });

  const joinMut = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      toast.success('Joined!');
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['my-groups'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Could not join');
    },
  });

  const createMut = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success('Group created!');
      setShowCreate(false);
      setNewGroup({ name: '', description: '', course_code: '', category: 'general', is_private: false });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const list: StudyGroup[] = (groups as StudyGroup[] | undefined) ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={staggerItem} className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-2">Discover</p>
            <h1 className="text-4xl font-black text-text-primary">
              <GradientText>Study Groups</GradientText>
            </h1>
            <p className="text-text-muted text-sm mt-1.5">Find your people. Start studying better.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            New group
          </Button>
        </motion.div>

        {/* Search + filters */}
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or course code..."
              className="w-full bg-surface-card border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  category === c.id
                    ? 'bg-brand text-white border-brand shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : 'bg-surface-card border-white/8 text-text-muted hover:text-text-secondary hover:border-white/15'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-surface-card border border-white/8 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-text-secondary font-medium mb-1">No groups found</p>
          <p className="text-text-muted text-sm mb-5">Try a different filter or create your own</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create a group
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {list.map((group) => (
            <motion.div key={group.id} variants={staggerItem} className="h-full">
              <div className="group h-full flex flex-col rounded-2xl border border-white/6 bg-surface-card overflow-hidden hover:border-white/12 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">

                {/* Top accent strip */}
                <div className={`h-0.5 w-full ${colorClasses(group.avatar_color).strip}`} />

                <div className="flex-1 p-5 flex flex-col">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses(group.avatar_color).iconBg} ${colorClasses(group.avatar_color).iconText}`}>
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-text-primary truncate">{group.name}</h3>
                        {group.course_code && (
                          <p className="text-[11px] text-text-muted font-mono">{group.course_code}</p>
                        )}
                      </div>
                    </div>
                    {group.is_private && <Lock className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-0.5" />}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 flex-1 mb-4">
                    {group.description || 'No description provided.'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Badge variant={CATEGORY_COLORS[group.category] ?? 'muted'} className="text-[10px]">
                        {group.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] text-text-muted tabular-nums">
                        {group.member_count}/{group.max_members}
                      </span>
                    </div>

                    {group.is_member ? (
                      <Link href={`/groups/${group.id}/chat`}>
                        <button type="button" className="flex items-center gap-1 text-xs font-semibold text-brand-light hover:text-brand transition-colors">
                          Open <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => joinMut.mutate(group.id)}
                        loading={joinMut.isPending && joinMut.variables === group.id}
                        className="text-xs h-7 px-3"
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="glass gradient-border rounded-2xl p-8 w-full max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          >
            <h2 className="text-xl font-black text-text-primary mb-1">Create a group</h2>
            <p className="text-sm text-text-muted mb-6">Set up your study space in seconds</p>

            <div className="flex flex-col gap-4">
              <Input label="Group name" placeholder="CS401 Study Squad" value={newGroup.name}
                onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} />
              <Input label="Course code (optional)" placeholder="CS401" value={newGroup.course_code}
                onChange={e => setNewGroup(g => ({ ...g, course_code: e.target.value }))} />
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Category</label>
                <select
                  aria-label="Group category"
                  value={newGroup.category}
                  onChange={e => setNewGroup(g => ({ ...g, category: e.target.value }))}
                  className="w-full bg-surface-elevated border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/40 transition-colors"
                >
                  <option value="general">General Study</option>
                  <option value="exam_prep">Exam Prep</option>
                  <option value="assignment_help">Assignment Help</option>
                  <option value="coding_session">Coding Session</option>
                  <option value="quiet_studying">Quiet Studying</option>
                  <option value="project_collab">Project Collaboration</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))}
                  rows={3}
                  placeholder="What will you study together?"
                  className="w-full bg-surface-elevated border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 resize-none transition-colors"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={newGroup.is_private}
                  onChange={e => setNewGroup(g => ({ ...g, is_private: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand" />
                <span className="text-sm text-text-secondary">Private group (invite only)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="glass" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
              <Button
                type="button"
                onClick={() => createMut.mutate(newGroup)}
                loading={createMut.isPending}
                disabled={!newGroup.name.trim()}
                className="flex-1"
              >
                Create group
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
