'use client';

import { useState } from 'react';

import MediaLibrary from './MediaLibrary';

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

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (!isOpen) return null;

  const handleSelect = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handleConfirm = () => {
    if (selectedMedia) {
      onSelect(selectedMedia.url);
      onClose();
      setSelectedMedia(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-stone-900">Select Media</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Media Library */}
        <div className="flex-1 overflow-hidden">
          <MediaLibrary onSelect={handleSelect} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-4">
          <div className="text-sm text-stone-600">
            {selectedMedia ? (
              <span>
                Selected: <strong>{selectedMedia.name}</strong>
              </span>
            ) : (
              <span>No media selected</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMedia}
              className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
