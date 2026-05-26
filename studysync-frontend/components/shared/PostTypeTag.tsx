'use client';

type PostType = 'question' | 'discussion' | 'resource' | 'announcement';

const TYPE_CONFIG: Record<PostType, { label: string; className: string }> = {
  question:     { label: 'Question',     className: 'theme-amber' },
  discussion:   { label: 'Discussion',   className: 'theme-purple' },
  resource:     { label: 'Resource',     className: 'theme-cyan' },
  announcement: { label: 'Announcement', className: 'theme-emerald' },
};

export function PostTypeTag({ type }: { type: PostType }) {
  const { label, className } = TYPE_CONFIG[type] ?? TYPE_CONFIG.discussion;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${className}`}>
      {label}
    </span>
  );
}
