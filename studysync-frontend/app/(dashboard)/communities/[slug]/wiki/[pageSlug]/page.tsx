'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Edit3, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getWikiPage, updateWikiPage } from '../../../../../../lib/api/communities';
import { GlassCard } from '../../../../../../components/shared/GlassCard';
import { Skeleton } from '../../../../../../components/ui/skeleton';
import { fadeInUp } from '../../../../../../lib/utils/animations';

export default function WikiPageEditor() {
  const params = useParams<{ slug: string; pageSlug: string }>();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: page, isLoading } = useQuery({
    queryKey: ['wiki-page', params.slug, params.pageSlug],
    queryFn: () => getWikiPage(params.slug, params.pageSlug),
  });

  useEffect(() => {
    if (page) {
      setContent(page.content);
      setTitle(page.title);
    }
  }, [page]);

  const saveMutation = useMutation({
    mutationFn: () => updateWikiPage(params.slug, params.pageSlug, { title, content }),
    onSuccess: () => setDirty(false),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-96 rounded-md" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => router.push(`/communities/${params.slug}/wiki`)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Wiki
          </button>
          <div className="flex items-center gap-2">
            {dirty && <span className="text-text-muted text-xs">Unsaved changes</span>}
            <button
              onClick={() => setPreview(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${preview ? 'bg-brand/10 text-brand' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
            >
              {preview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!dirty || saveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <input
          className="w-full bg-transparent text-text-primary text-2xl font-bold outline-none border-b border-surface-border pb-4 mb-6 placeholder:text-text-muted"
          placeholder="Page title"
          value={title}
          onChange={e => { setTitle(e.target.value); setDirty(true); }}
        />

        {page && (
          <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
            <Clock className="w-3 h-3" />
            <span>Last updated {new Date(page.updated_at).toLocaleDateString()} {page.updated_by_name && `by ${page.updated_by_name}`}</span>
          </div>
        )}

        {preview ? (
          <GlassCard className="p-6 min-h-[400px]" hover={false}>
            {content ? (
              <div className="prose prose-invert prose-sm max-w-none text-text-primary [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-secondary [&_p]:text-text-secondary [&_code]:bg-surface-elevated [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-brand [&_pre]:bg-surface-elevated [&_pre]:rounded-md [&_a]:text-brand [&_ul]:text-text-secondary [&_ol]:text-text-secondary [&_li]:marker:text-brand">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-text-muted text-sm italic">Nothing to preview yet. Switch to edit mode and start writing.</p>
            )}
          </GlassCard>
        ) : (
          <textarea
            className="w-full min-h-[400px] bg-surface-card border border-surface-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-y font-mono"
            placeholder="Write in markdown... (e.g. # Heading, **bold**, `code`, - list item)"
            value={content}
            onChange={e => { setContent(e.target.value); setDirty(true); }}
          />
        )}

        {!preview && (
          <p className="text-text-muted text-xs mt-2">Supports Markdown: **bold**, *italic*, `code`, # headings, - lists</p>
        )}
      </motion.div>
    </div>
  );
}
