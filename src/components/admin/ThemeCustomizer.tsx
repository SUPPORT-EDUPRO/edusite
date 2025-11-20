'use client';

import { useEffect, useState } from 'react';

interface Theme {
  id: string;
  name: string;
  is_active: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textMuted: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  layout: {
    containerWidth: string;
    borderRadius: string;
    spacing: string;
  };
  custom_css?: string;
}

export default function ThemeCustomizer() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
        const active = data.find((t: Theme) => t.is_active);
        if (active) setSelectedTheme(active);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    if (!selectedTheme) return;
    setSelectedTheme({
      ...selectedTheme,
      colors: {
        ...selectedTheme.colors,
        [colorKey]: value,
      },
    });
  };

  const handleTypographyChange = (key: keyof Theme['typography'], value: string) => {
    if (!selectedTheme) return;
    setSelectedTheme({
      ...selectedTheme,
      typography: {
        ...selectedTheme.typography,
        [key]: value,
      },
    });
  };

  const handleLayoutChange = (key: keyof Theme['layout'], value: string) => {
    if (!selectedTheme) return;
    setSelectedTheme({
      ...selectedTheme,
      layout: {
        ...selectedTheme.layout,
        [key]: value,
      },
    });
  };

  const handleCreateTheme = async () => {
    const name = prompt('Enter theme name:', `Theme ${themes.length + 1}`);
    if (!name) return;

    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create theme');
      await fetchThemes();
      setMessage({ type: 'success', text: 'Theme created!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to create theme' });
    }
  };

  const handleSave = async () => {
    if (!selectedTheme) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/themes/${selectedTheme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors: selectedTheme.colors,
          typography: selectedTheme.typography,
          layout: selectedTheme.layout,
        }),
      });

      if (!response.ok) throw new Error('Failed to save theme');

      setMessage({ type: 'success', text: 'Theme saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      fetchThemes();
    } catch (error) {
      console.error('Error saving theme:', error);
      setMessage({ type: 'error', text: 'Failed to save theme' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (themeId: string) => {
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) throw new Error('Failed to activate theme');

      setMessage({ type: 'success', text: 'Theme activated!' });
      setTimeout(() => setMessage(null), 3000);
      fetchThemes();
    } catch (error) {
      console.error('Error activating theme:', error);
      setMessage({ type: 'error', text: 'Failed to activate theme' });
    }
  };

  const handleDuplicate = async () => {
    if (!selectedTheme) return;

    const name = prompt('Enter name for duplicated theme:', `${selectedTheme.name} (Copy)`);
    if (!name) return;

    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          colors: selectedTheme.colors,
          typography: selectedTheme.typography,
          layout: selectedTheme.layout,
        }),
      });
      if (!res.ok) throw new Error('Failed to duplicate theme');
      await fetchThemes();
      setMessage({ type: 'success', text: 'Theme duplicated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to duplicate theme' });
    }
  };

  if (!selectedTheme) {
    return <div className="p-8 text-center text-stone-600">Loading themes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Select Theme</label>
          <button
            onClick={handleCreateTheme}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            + New Theme
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedTheme.id === theme.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-stone-900">{theme.name}</span>
                {theme.is_active && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {Object.entries(theme.colors)
                  .slice(0, 4)
                  .map(([key, color]) => (
                    <div
                      key={key}
                      className="h-6 w-6 rounded border border-stone-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
              </div>
              {!theme.is_active && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivate(theme.id);
                  }}
                  className="mt-3 w-full rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                >
                  Activate
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Color Scheme</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(selectedTheme.colors).map(([key, value]) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium text-stone-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-stone-300"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Typography</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Font Family</label>
            <input
              type="text"
              value={selectedTheme.typography.fontFamily}
              onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Heading Font</label>
            <input
              type="text"
              value={selectedTheme.typography.headingFontFamily}
              onChange={(e) => handleTypographyChange('headingFontFamily', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Layout</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Container Width</label>
            <input
              type="text"
              value={selectedTheme.layout.containerWidth}
              onChange={(e) => handleLayoutChange('containerWidth', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Border Radius</label>
            <input
              type="text"
              value={selectedTheme.layout.borderRadius}
              onChange={(e) => handleLayoutChange('borderRadius', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Spacing</label>
            <input
              type="text"
              value={selectedTheme.layout.spacing}
              onChange={(e) => handleLayoutChange('spacing', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Preview</h3>
        <div
          className="space-y-4 rounded-lg border-2 border-dashed border-stone-300 p-6"
          style={{
            backgroundColor: selectedTheme.colors.background,
            color: selectedTheme.colors.text,
          }}
        >
          <h1 className="text-3xl font-bold" style={{ color: selectedTheme.colors.primary }}>
            Heading Example
          </h1>
          <p style={{ color: selectedTheme.colors.textMuted }}>
            This is sample body text showing how your theme will look on pages.
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-lg px-4 py-2 font-medium text-white"
              style={{ backgroundColor: selectedTheme.colors.primary }}
            >
              Primary Button
            </button>
            <button
              className="rounded-lg px-4 py-2 font-medium text-white"
              style={{ backgroundColor: selectedTheme.colors.accent }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>

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
            onClick={handleDuplicate}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Duplicate
          </button>
          <button
            onClick={() => fetchThemes()}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
