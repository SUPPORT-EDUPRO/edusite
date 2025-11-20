'use client';

import { useState } from 'react';

import { type BlockDefinition,getAllBlocks } from '@/lib/blocks';

interface BlockSelectorProps {
  onSelect: (blockKey: string) => void;
}

const categoryLabels: Record<string, string> = {
  header: 'Header',
  content: 'Content',
  contact: 'Contact',
  feature: 'Features',
  media: 'Media',
  footer: 'Footer',
  team: 'Team',
  pricing: 'Pricing',
};

export default function BlockSelector({ onSelect }: BlockSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allBlocks = getAllBlocks();
  const categories = [...new Set(allBlocks.map((b) => b.category))];

  // Filter blocks
  const filteredBlocks = allBlocks.filter((block) => {
    const matchesSearch =
      searchQuery === '' ||
      block.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || block.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-stone-200 p-4">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Add Block</h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stone-300 py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
          />
          <svg
            className="absolute top-2.5 left-3 h-5 w-5 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {categoryLabels[category] || category}
            </button>
          ))}
        </div>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBlocks.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-500">
            No blocks found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBlocks.map((block) => (
              <BlockCard key={block.key} block={block} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockCard({
  block,
  onSelect,
}: {
  block: BlockDefinition;
  onSelect: (key: string) => void;
}) {
  const categoryColors: Record<string, string> = {
    header: 'bg-purple-100 text-purple-700',
    content: 'bg-blue-100 text-blue-700',
    contact: 'bg-green-100 text-green-700',
    feature: 'bg-amber-100 text-amber-700',
    media: 'bg-pink-100 text-pink-700',
    footer: 'bg-stone-100 text-stone-700',
    team: 'bg-cyan-100 text-cyan-700',
    pricing: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(block.key)}
      className="group flex w-full items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 text-left transition-all hover:border-amber-500 hover:shadow-md"
    >
      {/* Icon/Thumbnail */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-amber-50">
        <span className="text-xl">📦</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-medium text-stone-900 group-hover:text-amber-600">
            {block.displayName}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              categoryColors[block.category] || 'bg-stone-100 text-stone-700'
            }`}
          >
            {categoryLabels[block.category] || block.category}
          </span>
        </div>
        {block.description && (
          <p className="line-clamp-2 text-xs text-stone-600">{block.description}</p>
        )}
      </div>

      {/* Add Icon */}
      <svg
        className="h-5 w-5 flex-shrink-0 text-stone-400 transition-colors group-hover:text-amber-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  );
}
