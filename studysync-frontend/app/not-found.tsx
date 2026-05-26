import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center mb-6">
        <Zap className="w-5 h-5 text-white" />
      </div>
      <p className="text-7xl font-bold text-text-muted tabular-nums mb-4">404</p>
      <h1 className="text-xl font-semibold text-text-primary mb-2">Page not found</h1>
      <p className="text-text-muted text-sm mb-8 text-center max-w-xs">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="bg-brand hover:bg-brand-dark text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
