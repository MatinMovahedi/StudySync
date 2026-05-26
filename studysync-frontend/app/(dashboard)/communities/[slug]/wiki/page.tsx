'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Clock, X } from 'lucide-react';
import { getWikiPages, createWikiPage, WikiPage } from '../../../../../lib/api/communities';
import { GlassCard } from '../../../../../components/shared/GlassCard';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { staggerContainer, staggerItem, popIn } from '../../../../../lib/utils/animations';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function WikiListPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['wiki-pages', params.slug],
    queryFn: () => getWikiPages(params.slug),
  });

  const createMutation = useMutation({
    mutationFn: () => createWikiPage(params.slug, {
      title: newPage.title,
      slug: newPage.slug || slugify(newPage.title),
      content: '',
    }),
    onSuccess: (page: WikiPage) => {
      qc.invalidateQueries({ queryKey: ['wiki-pages', params.slug] });
      router.push(`/communities/${params.slug}/wiki/${page.slug}`);
    },
  });

  const pages: WikiPage[] = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10">
              <BookOpen className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Community Wiki</h1>
              <p className="text-text-muted text-sm">Collaborative knowledge base</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
        </motion.div>

        {showCreate && (
          <motion.div variants={popIn} initial="hidden" animate="visible" className="mb-6">
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-medium">Create Wiki Page</h3>
                <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                  placeholder="Page title *"
                  value={newPage.title}
                  onChange={e => setNewPage(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
                />
                <input
                  className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand font-mono"
                  placeholder="URL slug (auto-generated)"
                  value={newPage.slug}
                  onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))}
                />
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!newPage.title || createMutation.isPending}
                  className="w-full px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create & Edit'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
        ) : pages.length === 0 ? (
          <motion.div variants={staggerItem} className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-text-primary font-medium text-lg mb-2">No wiki pages yet</h3>
            <p className="text-text-muted text-sm">Start building the community knowledge base</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {pages.map(page => (
              <motion.div key={page.id} variants={staggerItem}>
                <GlassCard
                  className="p-4"
                  onClick={() => router.push(`/communities/${params.slug}/wiki/${page.slug}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="text-text-primary font-medium">{page.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(page.updated_at)}</span>
                      {page.updated_by_name && <span>by {page.updated_by_name}</span>}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
