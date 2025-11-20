'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';

interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function PagesManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'delete' | ''>('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pages');
      if (!response.ok) throw new Error('Failed to fetch pages');

      const data = await response.json();
      setPages(data.pages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    router.push('/admin/builder');
  };

  const handleEditPage = (pageId: string) => {
    router.push(`/admin/builder?page=${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete page');

      fetchPages();
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  const handleTogglePublish = async (pageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update page');

      fetchPages();
    } catch (err: any) {
      alert('Error updating page: ' + err.message);
    }
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      // Fetch the page with blocks
      const response = await fetch(`/api/pages/${pageId}`);
      if (!response.ok) throw new Error('Failed to fetch page');

      const { page } = await response.json();

      // Create new page with copied content
      const newSlug = `${page.slug}-copy-${Date.now()}`;
      const createResponse = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${page.title} (Copy)`,
          slug: newSlug,
          metaDescription: page.meta_description,
          isPublished: false,
          blocks: page.blocks || [],
        }),
      });

      if (!createResponse.ok) throw new Error('Failed to duplicate page');

      fetchPages();
      alert('Page duplicated successfully!');
    } catch (err: any) {
      alert('Error duplicating page: ' + err.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.size === filteredPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(filteredPages.map((p) => p.id)));
    }
  };

  const handleSelectPage = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPages.size === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedPages.size} page(s)?`)) return;
    }

    try {
      for (const pageId of selectedPages) {
        if (bulkAction === 'delete') {
          await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
        } else {
          const isPublished = bulkAction === 'publish';
          await fetch(`/api/pages/${pageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished }),
          });
        }
      }

      setSelectedPages(new Set());
      setBulkAction('');
      fetchPages();
    } catch (err: any) {
      alert('Error performing bulk action: ' + err.message);
    }
  };

  // Filter and search pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'published' && page.is_published) ||
      (filterStatus === 'draft' && !page.is_published);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.is_published).length,
    draft: pages.filter((p) => !p.is_published).length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-amber-600"></div>
            <p className="text-stone-600">Loading pages...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Error: {error}</p>
            <button
              onClick={fetchPages}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex h-full flex-col p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Pages</h1>
            <p className="mt-1 text-sm text-stone-600">Manage your centre&apos;s website pages</p>
          </div>
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Page
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-sm font-medium text-stone-600">Total Pages</div>
            <div className="mt-1 text-2xl font-bold text-stone-900">{stats.total}</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-sm font-medium text-stone-600">Published</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{stats.published}</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-sm font-medium text-stone-600">Drafts</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">{stats.draft}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pages by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          >
            <option value="all">All Pages</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedPages.size > 0 && (
          <div className="mb-4 flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <span className="text-sm font-medium text-amber-900">
              {selectedPages.size} page(s) selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="rounded border border-amber-300 px-3 py-1 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            >
              <option value="">Choose Action</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="rounded-lg bg-amber-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedPages(new Set())}
              className="ml-auto text-sm text-amber-700 hover:text-amber-900"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Pages Table */}
        <div className="flex-1 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {filteredPages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-12">
              <div className="text-center">
                <div className="mb-4 inline-block rounded-full bg-stone-100 p-6">
                  <svg
                    className="h-12 w-12 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-900">No pages found</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first page to get started'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPages.size === filteredPages.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-stone-900">Title</th>
                    <th className="p-4 text-left text-sm font-semibold text-stone-900">Slug</th>
                    <th className="p-4 text-left text-sm font-semibold text-stone-900">Status</th>
                    <th className="p-4 text-left text-sm font-semibold text-stone-900">Updated</th>
                    <th className="p-4 text-right text-sm font-semibold text-stone-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="group hover:bg-stone-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedPages.has(page.id)}
                          onChange={() => handleSelectPage(page.id)}
                          className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-900">{page.title}</div>
                      </td>
                      <td className="p-4">
                        <code className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-700">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(page.id, page.is_published)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            page.is_published
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {page.is_published ? (
                            <>
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Published
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-stone-600">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="rounded p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                            title="Edit page"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDuplicatePage(page.id)}
                            className="rounded p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                            title="Duplicate page"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Delete page"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
