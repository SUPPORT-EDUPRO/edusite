"use client";

interface SaveStatusProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

export default function SaveStatus({ isSaving, hasUnsavedChanges, lastSaved }: SaveStatusProps) {
  const label = isSaving
    ? "Saving…"
    : hasUnsavedChanges
      ? "Unsaved changes"
      : lastSaved
        ? `Saved ${lastSaved.toLocaleTimeString()}`
        : "All changes saved";

  const color = isSaving
    ? "text-amber-700"
    : hasUnsavedChanges
      ? "text-red-700"
      : "text-stone-600";

  return <div className={`text-xs ${color}`} aria-live="polite">{label}</div>;
}
