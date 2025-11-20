'use client';

import { useEffect,useState } from 'react';

interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
}

interface PageSelectorProps {
  centreId: string | null;
  selectedPageId: string | null;
  onSelectPage: (pageId: string | null) => void;
  onCreatePage: () => void;
  refreshTrigger?: number; // Prop to trigger refresh
}

export default function PageSelector({
  centreId,
  selectedPageId,
  onSelectPage,
  onCreatePage,
  refreshTrigger,
}: PageSelectorProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (centreId) {
      fetchPages(centreId);
    }
  }, [centreId, refreshTrigger]);

  const fetchPages = async (cid: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages?centre_id=${encodeURIComponent(cid)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      const data = await response.json();
      setPages(data.pages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      // Refresh the list
      fetchPages(centreId!);

      // Deselect if the deleted page was selected
      if (selectedPageId === pageId) {
        onSelectPage(null);
      }
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  if (!centreId) {
    return (
      <div className="p-4 text-center text-sm text-stone-500">
        Select a centre to manage pages
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-center text-sm text-stone-500">Loading pages...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-sm text-red-600">Error: {error}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stone-200 p-4">
        <button
          onClick={onCreatePage}
          className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          + New Page
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {pages.length === 0 ? (
          <div className="p-4 text-center text-sm text-stone-500">
            No pages yet. Create your first page!
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={`group cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedPageId === page.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-900">{page.title}</div>
                    <div className="truncate text-xs text-stone-500">/{page.slug}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          page.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeletePage(page.id, e)}
                    className="rounded p-1 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                    title="Delete page"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
