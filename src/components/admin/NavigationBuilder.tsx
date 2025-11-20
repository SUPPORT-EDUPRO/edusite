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

interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page';
  order: number;
  pageId?: string;
}

interface NavigationMenu {
  id: string;
  name: string;
  is_active: boolean;
  items: MenuItem[];
}

export default function NavigationBuilder() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [pages, setPages] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchMenus();
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      setItems(selectedMenu.items || []);
    }
  }, [selectedMenu]);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/navigation');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
        const active = data.find((m: NavigationMenu) => m.is_active);
        if (active) setSelectedMenu(active);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      if (response.ok) {
        const payload = await response.json();
        const list = Array.isArray(payload) ? payload : payload.pages || [];
        setPages(list.filter((p: any) => p.is_published));
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'New Link',
      url: '/',
      type: 'internal',
      order: items.length,
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
  };

  const handleUpdateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    if (editingItem?.id === id) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
  };

  const handleSave = async () => {
    if (!selectedMenu) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/navigation/${selectedMenu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) throw new Error('Failed to save menu');

      setMessage({ type: 'success', text: 'Navigation menu saved!' });
      setTimeout(() => setMessage(null), 3000);
      fetchMenus();
    } catch (error) {
      console.error('Error saving menu:', error);
      setMessage({ type: 'error', text: 'Failed to save menu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (menuId: string) => {
    try {
      const response = await fetch(`/api/navigation/${menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) throw new Error('Failed to activate menu');

      setMessage({ type: 'success', text: 'Menu activated!' });
      setTimeout(() => setMessage(null), 3000);
      fetchMenus();
    } catch (error) {
      console.error('Error activating menu:', error);
      setMessage({ type: 'error', text: 'Failed to activate menu' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Menu Selector */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Select Menu</label>
          <button
            onClick={async () => {
              try {
                const name = `Menu ${menus.length + 1}`;
                const res = await fetch('/api/navigation', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, items: [] }),
                });
                if (!res.ok) throw new Error('Failed to create menu');
                const { menu } = await res.json();
                await fetchMenus();
                setSelectedMenu(menu);
              } catch (e) {
                console.error(e);
              }
            }}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            + New Menu
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              onClick={() => setSelectedMenu(menu)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedMenu?.id === menu.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900">{menu.name}</span>
                  {selectedMenu?.id === menu.id && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const newName = prompt('Rename menu', menu.name) || menu.name;
                        if (newName && newName !== menu.name) {
                          await fetch(`/api/navigation/${menu.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newName }),
                          });
                          fetchMenus();
                        }
                      }}
                      className="rounded px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100"
                    >
                      Rename
                    </button>
                  )}
                </div>
                {menu.is_active && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600">{menu.items?.length || 0} items</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {!menu.is_active && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivate(menu.id);
                    }}
                    className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    Activate
                  </button>
                )}
                {!menu.is_active && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm('Delete this menu?')) return;
                      const res = await fetch(`/api/navigation/${menu.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        if (selectedMenu?.id === menu.id) setSelectedMenu(null);
                        fetchMenus();
                      }
                    }}
                    className="rounded border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMenu && (
        <>
          {/* Menu Items */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Menu Items</h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-12 text-center">
                <p className="text-stone-600">
                  No menu items yet. Click &quot;Add Item&quot; to get started.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {items.map((item) => (
                      <SortableMenuItem
                        key={item.id}
                        item={item}
                        isEditing={editingItem?.id === item.id}
                        onEdit={() => setEditingItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Edit Panel */}
          {editingItem && (
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-stone-900">Edit Menu Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Label</label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => handleUpdateItem(editingItem.id, { label: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Link Type</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) =>
                      handleUpdateItem(editingItem.id, {
                        type: e.target.value as 'internal' | 'external' | 'page',
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="internal">Internal Link</option>
                    <option value="page">Page</option>
                    <option value="external">External Link</option>
                  </select>
                </div>

                {editingItem.type === 'page' ? (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      Select Page
                    </label>
                    <select
                      value={editingItem.pageId || ''}
                      onChange={(e) => {
                        const page = pages.find((p) => p.id === e.target.value);
                        handleUpdateItem(editingItem.id, {
                          pageId: e.target.value,
                          url: page ? `/${page.slug}` : '/',
                        });
                      }}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">Select a page...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">URL</label>
                    <input
                      type="text"
                      value={editingItem.url}
                      onChange={(e) => handleUpdateItem(editingItem.id, { url: e.target.value })}
                      placeholder={
                        editingItem.type === 'external' ? 'https://example.com' : '/about'
                      }
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={() => setEditingItem(null)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            {message && (
              <div
                className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message.text}
              </div>
            )}
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => fetchMenus()}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Menu'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SortableMenuItemProps {
  item: MenuItem;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableMenuItem({ item, isEditing, onEdit, onDelete }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
        isEditing ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 active:cursor-grabbing"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1">
        <div className="font-medium text-stone-900">{item.label}</div>
        <div className="text-xs text-stone-500">
          {item.type === 'page' ? 'Page' : item.type === 'external' ? 'External' : 'Internal'} →{' '}
          {item.url}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          title="Edit"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
          title="Delete"
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
  );
}
