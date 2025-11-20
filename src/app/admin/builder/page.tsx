'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import BlockPropsEditor from '@/components/admin/BlockPropsEditor';
import BlockSelector from '@/components/admin/BlockSelector';
import CentreSelector from '@/components/admin/CentreSelector';
import PageSelector from '@/components/admin/PageSelector';
import SaveStatus from '@/components/admin/SaveStatus';
import { getBlock, validateBlockProps } from '@/lib/blocks';

interface BlockInstance {
  id: string;
  blockKey: string;
  props: Record<string, any>;
}

interface SortableBlockProps {
  block: BlockInstance;
  index: number;
  blockDef: any;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableBlock({
  block,
  index: _index,
  blockDef,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const BlockComponent = blockDef?.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border-2 transition-all ${
        isSelected ? 'border-amber-500 shadow-lg' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Block Controls Overlay */}
      <div className="absolute -top-3 left-4 z-10 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1 shadow-sm">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>
        <div className="h-4 w-px bg-stone-200" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="rounded p-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move up"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="rounded p-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move down"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        <div className="h-4 w-px bg-stone-200" />
        <span className="text-xs font-medium text-stone-600">{blockDef?.displayName}</span>
        <div className="h-4 w-px bg-stone-200" />
          <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSelect}
            className="rounded px-2 py-0.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Live Block Preview */}
      <div className={`overflow-hidden rounded-lg ${blockDef ? '' : 'opacity-50'}`} onClick={onSelect}>
        {BlockComponent ? (
          <BlockComponent {...block.props} />
        ) : (
          <div className="p-8 text-center text-stone-500">Block component not found</div>
        )}
      </div>
    </div>
  );
}

export default function PageBuilderPage() {
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('Untitled Page');
  const [pageSlug, setPageSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Panel visibility states
  const [showPageSelector, setShowPageSelector] = useState(true);
  const [showBlockLibrary, setShowBlockLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  // Auto-save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pageListRefresh, setPageListRefresh] = useState(0); // Trigger for page list refresh

  // Validation state: map blockId -> error string
  const [blockErrors, setBlockErrors] = useState<Record<string, string>>({});

  const handleAddBlock = (blockKey: string) => {
    const newBlock: BlockInstance = {
      id: `block-${Date.now()}`,
      blockKey,
      props: {}, // Default props
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    setHasUnsavedChanges(true);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index - 1]!;
    newBlocks[index - 1] = newBlocks[index]!;
    newBlocks[index] = temp;
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index]!;
    newBlocks[index] = newBlocks[index + 1]!;
    newBlocks[index + 1] = temp;
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasUnsavedChanges(true);
    }
  };

  const handlePropsChange = (blockId: string, newProps: Record<string, any>) => {
    const updated = blocks.map((b) => (b.id === blockId ? { ...b, props: newProps } : b));
    setBlocks(updated);
    setHasUnsavedChanges(true);
    runLocalValidation(updated);
  };

  // Load last selected centre & last edited page on mount
  useEffect(() => {
    const lastCentreId = localStorage.getItem('edusitepro_last_centre_id');
    if (lastCentreId) setSelectedCentreId(lastCentreId);
    const lastPageId = localStorage.getItem('edusitepro_last_page_id');
    if (lastPageId) setCurrentPageId(lastPageId);
  }, []);

  useEffect(() => {
    if (currentPageId) {
      loadPage(currentPageId);
      // Remember this page for next session
      localStorage.setItem('edusitepro_last_page_id', currentPageId);
    }
  }, [currentPageId]);

  // Run validation whenever blocks array changes (debounced via autosave as well)
  useEffect(() => {
    runLocalValidation(blocks);
  }, [blocks]);

  // Auto-save effect - saves 2 seconds after last change
  useEffect(() => {
    if (!hasUnsavedChanges || !currentPageId) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/pages/${currentPageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: blocks.map((block, index) => ({
              blockKey: block.blockKey,
              props: block.props,
              order: index,
            })),
          }),
        });

        if (response.ok) {
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(autoSaveTimer);
  }, [blocks, currentPageId, hasUnsavedChanges]);

  const runLocalValidation = (b: BlockInstance[]) => {
    const errs: Record<string, string> = {};
    b.forEach((blk) => {
      const res = validateBlockProps(blk.blockKey as any, blk.props);
      if (!res.success) {
        errs[blk.id] = 'Invalid block props';
      }
    });
    setBlockErrors(errs);
  };

  const loadPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`);
      if (!response.ok) throw new Error('Failed to load page');

      const { page } = await response.json();
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setIsPublished(page.is_published || false);

      // Convert page_blocks to BlockInstance format
      const loadedBlocks: BlockInstance[] = (page.blocks || []).map((block: any) => ({
        id: `block-${block.id}`,
        blockKey: block.block_key,
        props: block.props,
      }));
      setBlocks(loadedBlocks);
      setSelectedBlockId(null);
      runLocalValidation(loadedBlocks);
    } catch (error) {
      console.error('Error loading page:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load page' });
    }
  };

  const handleCreatePage = async () => {
    const title = prompt('Enter page title:', 'New Page');
    if (!title) return;

    // Sanitize slug: lowercase, replace spaces/special chars with hyphens, remove consecutive hyphens
    const suggestedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = prompt('Enter page slug (URL path):', suggestedSlug);
    if (!slug) return;

    // Validate and sanitize user input
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!sanitizedSlug) {
      alert('Invalid slug. Please use only lowercase letters, numbers, and hyphens.');
      return;
    }

    try {
      if (!selectedCentreId) {
        alert('Select a centre first');
        return;
      }
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: sanitizedSlug,
          centre_id: selectedCentreId,
          is_published: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create page');
      }

      const { page } = await response.json();
      setCurrentPageId(page.id);
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setIsPublished(page.is_published || false);
      setBlocks([]);
      setPageListRefresh((prev) => prev + 1); // Trigger page list refresh
      setSaveMessage({ type: 'success', text: 'Page created!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error creating page:', error);
      alert('Failed to create page: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!currentPageId) {
      setSaveMessage({ type: 'error', text: 'No page selected' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/pages/${currentPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: blocks.map((block, index) => ({
            blockKey: block.blockKey,
            props: block.props,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          // Map server blockErrors (index->msg) to blockIds
          const errs: Record<string, string> = {};
          if (data.blockErrors) {
            Object.entries(data.blockErrors as Record<string, string>).forEach(([idx, msg]) => {
              const i = Number(idx);
              const blk = blocks[i];
              if (blk) errs[blk.id] = String(msg);
            });
            setBlockErrors(errs);
          }
        }
        throw new Error('Failed to save page');
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveMessage({ type: 'success', text: 'Page saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save page' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!currentPageId) return;

    if (Object.keys(blockErrors).length > 0 && !isPublished) {
      alert('Fix validation errors before publishing.');
      return;
    }

    try {
      const newPublishState = !isPublished;
      const response = await fetch(`/api/pages/${currentPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: newPublishState,
        }),
      });

      if (!response.ok) throw new Error('Failed to update publish status');

      setIsPublished(newPublishState);
      setSaveMessage({
        type: 'success',
        text: newPublishState ? 'Page published!' : 'Page unpublished',
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error toggling publish:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update publish status' });
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const handlePreviewSite = () => {
    if (currentPageId && pageSlug) {
      window.open(`/${pageSlug}`, '_blank');
    } else {
      alert('Please select or create a page first');
    }
  };

  const handleSeedDemo = async () => {
    if (
      !confirm(
        'This will create/overwrite a "showcase" page with all blocks and sample content. Continue?',
      )
    )
      return;
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed demo content');
      const { slug } = await res.json();
      setPageListRefresh((p) => p + 1);
      setSaveMessage({ type: 'success', text: `Demo page created: /${slug}` });
      setTimeout(() => setSaveMessage(null), 5000);
      // Open page in new tab
      window.open(`/${slug}`, '_blank');
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Seed failed' });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-stone-700">Page Builder</div>
        <SaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} lastSaved={lastSaved} />
      </div>
      {/* Validation summary */}
      {Object.keys(blockErrors).length > 0 && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-semibold">Please fix {Object.keys(blockErrors).length} block validation issue(s):</div>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {blocks.map((b, i) => (
              blockErrors[b.id] ? (
                <li key={b.id}>
                  Block {i + 1} ({b.blockKey}) has invalid data
                </li>
              ) : null
            ))}
          </ul>
        </div>
      )}

      <div className="flex h-full gap-4">
        {/* Page Selector - Left Panel */}
        {showPageSelector ? (
          <div className="w-72 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-600">Pages</span>
              </div>
              <button
                onClick={() => setShowPageSelector(false)}
                className="rounded p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                title="Hide panel"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <CentreSelector value={selectedCentreId} onChange={setSelectedCentreId} />
            <PageSelector
              centreId={selectedCentreId}
              selectedPageId={currentPageId}
              onSelectPage={setCurrentPageId}
              onCreatePage={handleCreatePage}
              refreshTrigger={pageListRefresh}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowPageSelector(true)}
            className="w-10 flex-shrink-0 rounded-lg border border-stone-200 bg-white hover:bg-stone-50"
            title="Show pages panel"
          >
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-4 w-4 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Block Library - Second Panel */}
        {showBlockLibrary ? (
          <div className="w-64 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-2">
              <span className="text-xs font-medium text-stone-600">Blocks</span>
              <button
                onClick={() => setShowBlockLibrary(false)}
                className="rounded p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                title="Hide panel"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <BlockSelector onSelect={handleAddBlock} />
          </div>
        ) : (
          <button
            onClick={() => setShowBlockLibrary(true)}
            className="w-10 flex-shrink-0 rounded-lg border border-stone-200 bg-white hover:bg-stone-50"
            title="Show blocks panel"
          >
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-4 w-4 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Canvas - Center */}
        <div className="flex-1 overflow-auto rounded-lg border border-stone-200 bg-white">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-stone-900">{pageTitle}</h2>
                  {currentPageId && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isPublished ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600">
                  {currentPageId ? `/${pageSlug}` : 'No page selected'} • {blocks.length} block
                  {blocks.length !== 1 && 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Seed Demo Content Button */}
                <button
                  onClick={handleSeedDemo}
                  className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100"
                  title="Create demo page with all blocks and array content"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <span>Seed Demo</span>
                </button>
                {/* Preview Site Button */}
                <button
                  onClick={handlePreviewSite}
                  disabled={!currentPageId}
                  className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title={currentPageId ? `Preview ${pageSlug}` : 'No page selected'}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span>Preview</span>
                </button>
                {/* Auto-save indicator */}
                {lastSaved && !hasUnsavedChanges && (
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                  </div>
                )}
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Unsaved changes...</span>
                  </div>
                )}
                {saveMessage && (
                  <div
                    className={`text-sm font-medium ${
                      saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  disabled={!currentPageId}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isPublished
                      ? 'bg-stone-600 hover:bg-stone-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isPublished ? '👁️ Unpublish' : '🚀 Publish'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !currentPageId}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Now'}
                </button>
              </div>
            </div>

            {/* Block List with Live Preview */}
            {!currentPageId ? (
              <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-16 text-center">
                <div className="mb-4 text-4xl">📄</div>
                <h3 className="mb-2 text-lg font-medium text-stone-900">No Page Selected</h3>
                <p className="text-sm text-stone-600">
                  Select a page from the left panel or create a new one
                </p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-16 text-center">
                <div className="mb-4 text-4xl">🎨</div>
                <h3 className="mb-2 text-lg font-medium text-stone-900">Start Building</h3>
                <p className="text-sm text-stone-600">
                  Select a block from the library to add it to your page
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {blocks.map((block, _index) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={_index}
                        blockDef={getBlock(block.blockKey as any)}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onMoveUp={() => handleMoveUp(_index)}
                        onMoveDown={() => handleMoveDown(_index)}
                        onRemove={() => handleRemoveBlock(block.id)}
                        isFirst={_index === 0}
                        isLast={_index === blocks.length - 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Properties Panel - Right */}
        {showProperties ? (
          <div className="w-96 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-2">
              <span className="text-xs font-medium text-stone-600">Properties</span>
              <button
                onClick={() => setShowProperties(false)}
                className="rounded p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                title="Hide panel"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3">
              {selectedBlock ? (
                <BlockPropsEditor
                  blockKey={selectedBlock.blockKey}
                  props={selectedBlock.props}
                  hasError={!!blockErrors[selectedBlock.id]}
                  onChange={(newProps) => handlePropsChange(selectedBlock.id, newProps)}
                />
              ) : (
                <div className="p-8 text-center text-sm text-stone-500">Select a block to edit its properties</div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowProperties(true)}
            className="w-10 flex-shrink-0 rounded-lg border border-stone-200 bg-white hover:bg-stone-50"
            title="Show properties panel"
          >
            <div className="flex h-full items-center justify-center">
              <svg className="h-4 w-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </AdminLayout>
  );
}
