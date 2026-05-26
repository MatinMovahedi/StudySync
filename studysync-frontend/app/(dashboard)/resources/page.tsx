'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, ChevronUp, ExternalLink, X, Search } from 'lucide-react';
import { getResources, createResource, voteResource, Resource, ResourceCategory } from '../../../lib/api/resources';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem, popIn } from '../../../lib/utils/animations';

const CATEGORIES: { value: ResourceCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'cheatsheet', label: 'Cheat Sheet' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tool', label: 'Tool' },
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_COLORS: Record<string, string> = {
  notes: 'theme-muted',
  cheatsheet: 'theme-amber',
  tutorial: 'theme-emerald',
  tool: 'theme-cyan',
  video: 'theme-purple',
  article: 'theme-rose',
  other: 'theme-muted',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const qc = useQueryClient();
  const voteMutation = useMutation({
    mutationFn: () => voteResource(resource.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <button
            onClick={() => voteMutation.mutate()}
            className={`p-1.5 rounded-md transition-colors ${resource.user_voted ? 'text-brand bg-brand/10' : 'text-text-muted hover:text-brand hover:bg-brand/10'}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-text-secondary">{resource.upvotes}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-text-primary font-semibold">{resource.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[resource.category] ?? 'theme-muted'}`} style={{ backgroundColor: 'var(--theme-color, #6b7280)', opacity: 0.9 }}>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-surface-elevated text-text-secondary border border-surface-border`}>
                {resource.category}
              </span>
            </span>
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand/80 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-text-muted text-sm mt-1 line-clamp-2">{resource.description}</p>
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {resource.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-text-muted text-xs mt-2">by {resource.created_by_name ?? 'Anonymous'}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', url: '', content: '',
    category: 'other' as ResourceCategory, tags: '',
  });

  const mutation = useMutation({
    mutationFn: () => createResource({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div variants={popIn} initial="hidden" animate="visible" className="w-full max-w-lg">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-text-primary font-semibold text-lg">Share Resource</h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-elevated text-text-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-none"
              placeholder="Description *"
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
            <input
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
              placeholder="URL (optional)"
              value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            />
            <input
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
              placeholder="Tags (comma-separated, e.g. python, cs401, graphs)"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            />
            <select
              className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value as ResourceCategory }))}
            >
              {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md border border-surface-border text-text-muted text-sm hover:bg-surface-elevated transition-colors">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!form.title || !form.description || mutation.isPending}
              className="flex-1 px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ResourceCategory | ''>('');
  const [sort, setSort] = useState<'top' | 'new'>('top');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['resources', search, category, sort],
    queryFn: () => getResources({ search: search || undefined, category: category || undefined, sort }),
  });

  const resources: Resource[] = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10">
              <Library className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Resource Library</h1>
              <p className="text-text-muted text-sm">Community-curated study resources</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Share
          </button>
        </motion.div>

        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-surface-card border border-surface-border rounded-md text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort('top')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${sort === 'top' ? 'bg-brand text-white' : 'bg-surface-card border border-surface-border text-text-muted hover:text-text-primary'}`}
            >
              Top
            </button>
            <button
              onClick={() => setSort('new')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${sort === 'new' ? 'bg-brand text-white' : 'bg-surface-card border border-surface-border text-text-muted hover:text-text-primary'}`}
            >
              New
            </button>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value as ResourceCategory | '')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c.value ? 'bg-brand text-white' : 'bg-surface-card border border-surface-border text-text-muted hover:text-text-primary'}`}
            >
              {c.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-md" />)}
          </div>
        ) : resources.length === 0 ? (
          <motion.div variants={staggerItem} className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-text-primary font-medium text-lg mb-2">No resources found</h3>
            <p className="text-text-muted text-sm">Be the first to share something helpful</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {resources.map(r => (
              <motion.div key={r.id} variants={staggerItem}>
                <ResourceCard resource={r} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
