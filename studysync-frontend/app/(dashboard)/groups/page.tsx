'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Lock, ArrowRight, Hash, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getGroups, joinGroup, createGroup } from '../../../lib/api/groups';
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

export default function GroupsPage() {
  return (
    <Suspense>
      <GroupsContent />
    </Suspense>
  );
}

function GroupsContent() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
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
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-7">
        <motion.div variants={staggerItem} className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs text-text-muted mb-1">Discover</p>
            <h1 className="text-2xl font-semibold text-text-primary">Study Groups</h1>
            <p className="text-text-muted text-xs mt-1">Find your people. Start studying better.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5 flex-shrink-0">
            <Plus className="w-4 h-4" />
            New group
          </Button>
        </motion.div>

        {/* Search + filters */}
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or course code..."
              className="w-full bg-surface-card border border-surface-border rounded-md pl-9 pr-4 h-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`h-7 px-3 rounded-md text-xs font-medium border transition-colors ${
                  category === c.id
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface-card border-surface-border text-text-muted hover:text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* List view */}
      {isLoading ? (
        <div className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-none" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border border-surface-border rounded-md">
          <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">No groups found</p>
          <p className="text-text-muted text-xs mb-4">Try a different filter or create your own</p>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create a group
          </Button>
        </div>
      ) : (
        <motion.div
          className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {list.map((group) => (
            <motion.div
              key={group.id}
              variants={staggerItem}
              className="group flex items-center gap-3 px-4 py-3 bg-surface-card hover:bg-surface-elevated transition-colors"
            >
              {/* Color dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: group.avatar_color }} />

              {/* Icon */}
              <div className="w-8 h-8 rounded-md bg-surface-elevated flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-text-muted" />
              </div>

              {/* Name + code */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-text-primary truncate">{group.name}</span>
                  {group.is_private && <Lock className="w-3 h-3 text-text-muted flex-shrink-0" />}
                </div>
                <div className="text-xs text-text-muted">{group.course_code || group.category.replace('_', ' ')}</div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-text-muted tabular-nums hidden sm:block">
                  {group.member_count}/{group.max_members}
                </span>
                <Badge variant="muted" className="text-[10px] hidden md:inline-flex">
                  {group.category.replace('_', ' ')}
                </Badge>
                {group.is_member ? (
                  <Link href={`/groups/${group.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 h-7 px-2">
                      Open <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => joinMut.mutate(group.id)}
                    loading={joinMut.isPending && joinMut.variables === group.id}
                  >
                    Join
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          onClick={() => setShowCreate(false)}>
          <motion.div onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-surface-card border border-surface-border rounded-md p-6 w-full max-w-md shadow-card"
          >
            <h2 className="text-base font-semibold text-text-primary mb-1">Create a group</h2>
            <p className="text-sm text-text-muted mb-5">Set up your study space in seconds</p>

            <div className="flex flex-col gap-3.5">
              <Input label="Group name" placeholder="CS401 Study Squad" value={newGroup.name}
                onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} />
              <Input label="Course code (optional)" placeholder="CS401" value={newGroup.course_code}
                onChange={e => setNewGroup(g => ({ ...g, course_code: e.target.value }))} />

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Category</label>
                <select
                  aria-label="Group category"
                  value={newGroup.category}
                  onChange={e => setNewGroup(g => ({ ...g, category: e.target.value }))}
                  className="w-full bg-surface-card border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
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
                <label className="text-xs font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))}
                  rows={3}
                  placeholder="What will you study together?"
                  className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 resize-none transition-colors"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={newGroup.is_private}
                  onChange={e => setNewGroup(g => ({ ...g, is_private: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand" />
                <span className="text-sm text-text-secondary">Private group (invite only)</span>
              </label>
            </div>

            <div className="flex gap-2.5 mt-5">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
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
