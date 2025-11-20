'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

interface MDXRendererProps {
  slug: string;
}

// Explicit mapping of slugs to MDX imports for proper code-splitting
const templateComponents: Record<string, () => Promise<{ default: ComponentType }>> = {
  'welcome-play': () => import('../../../content/templates/welcome-play.mdx'),
  'bright-start': () => import('../../../content/templates/bright-start.mdx'),
  storytime: () => import('../../../content/templates/storytime.mdx'),
  'coding-blocks': () => import('../../../content/templates/coding-blocks.mdx'),
  'little-engineers': () => import('../../../content/templates/little-engineers.mdx'),
  'digital-storytellers': () => import('../../../content/templates/digital-storytellers.mdx'),
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading template...</p>
    </div>
  </div>
);

export function MDXRenderer({ slug }: MDXRendererProps) {
  const importFn = templateComponents[slug];

  if (!importFn) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Template not found: {slug}</p>
      </div>
    );
  }

  const MDXContent = dynamic(importFn, {
    loading: LoadingSpinner,
  });

  return <MDXContent />;
}
