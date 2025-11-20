'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaItem {
  name: string; // filename from Storage
  url: string; // public URL
  path: string; // full path in storage
  created_at: string;
  metadata: {
    size: number; // file size
    mimetype: string; // mime type
  };
  id?: string; // optional, for compatibility
}

interface MediaLibraryProps {
  onSelect?: (media: MediaItem) => void;
  selectedId?: string;
  allowMultiple?: boolean;
}

export default function MediaLibrary({
  onSelect,
  selectedId,
  allowMultiple = false,
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(selectedId ? [selectedId] : []),
  );
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        // API returns { files: [...] }, extract the files array
        setMedia(data.files || data || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      await fetchMedia();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (response.ok) {
        setMedia(media.filter((item) => item.path !== filePath));
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(item.path)) {
          newSet.delete(item.path);
        } else {
          newSet.add(item.path);
        }
        return newSet;
      });
    } else {
      setSelectedItems(new Set([item.path]));
      if (onSelect) {
        onSelect(item);
      }
    }
  };

  const filteredMedia = media.filter((item) => {
    const mimeType = item.metadata?.mimetype || '';

    // Filter by type
    if (filter === 'images' && !mimeType.startsWith('image/')) return false;
    if (filter === 'videos' && !mimeType.startsWith('video/')) return false;
    if ((filter === 'documents' && mimeType.startsWith('image/')) || mimeType.startsWith('video/'))
      return false;

    // Filter by search query
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">Media Library</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Files
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
          <div className="flex gap-2">
            {(['all', 'images', 'videos', 'documents'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  filter === filterType
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-auto bg-stone-50 p-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-stone-500">Loading media...</div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <svg
              className="mb-3 h-12 w-12 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-stone-600">
              {searchQuery || filter !== 'all' ? 'No files found' : 'No files uploaded yet'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700"
            >
              Upload your first file
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMedia.map((item) => (
              <div
                key={item.path}
                onClick={() => handleSelect(item)}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all ${
                  selectedItems.has(item.path)
                    ? 'border-amber-500 shadow-lg'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {/* Preview */}
                <div className="aspect-square bg-stone-100">
                  {item.metadata?.mimetype?.startsWith('image/') ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <svg
                        className="h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    {formatFileSize(item.metadata?.size || 0)}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.path);
                    }}
                    className="rounded bg-red-600 p-1.5 text-white shadow-lg transition-colors hover:bg-red-700"
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

                {/* Selected indicator */}
                {selectedItems.has(item.path) && (
                  <div className="absolute top-2 left-2 rounded-full bg-amber-600 p-1">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
