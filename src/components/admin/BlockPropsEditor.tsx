'use client';

import { useEffect, useState } from 'react';

import { getBlock } from '@/lib/blocks';

import ArrayFieldEditor from './ArrayFieldEditor';
import { CheckboxField, ImageField, NumberField, TextAreaField, TextField } from './FormFields';

interface BlockPropsEditorProps {
  blockKey: string;
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
  hasError?: boolean;
}

export default function BlockPropsEditor({ blockKey, props, onChange, hasError }: BlockPropsEditorProps) {
  const [localProps, setLocalProps] = useState(props);
  const blockDef = getBlock(blockKey as any);

  useEffect(() => {
    setLocalProps(props);
  }, [props, blockKey]);

  const handleChange = (field: string, value: any) => {
    const newProps = { ...localProps, [field]: value };
    setLocalProps(newProps);
    onChange(newProps);
  };

  if (!blockDef) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">Block definition not found for: {blockKey}</p>
      </div>
    );
  }

  // Simplified prop rendering - can be enhanced with schema parsing
  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-3">
        <h3 className="text-sm font-semibold text-stone-900">{blockDef.displayName}</h3>
        {blockDef.description && (
          <p className="mt-1 text-xs text-stone-600">{blockDef.description}</p>
        )}
      </div>

      {hasError && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          This block has invalid data. Please review the fields below.
        </div>
      )}
      <div className="space-y-4">
        {/* Hero Block Props */}
        {blockKey === 'hero' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <ImageField
              label="Background Image"
              name="backgroundImage"
              value={localProps.backgroundImage || ''}
              onChange={(v) => handleChange('backgroundImage', v)}
            />
          </>
        )}

        {/* RichText Block Props */}
        {blockKey === 'richText' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              maxLength={100}
            />
            <TextAreaField
              label="Content"
              name="content"
              value={localProps.content || ''}
              onChange={(v) => handleChange('content', v)}
              rows={10}
              helpText="HTML content is supported"
            />
          </>
        )}

        {/* Stats Block Props */}
        {blockKey === 'stats' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <NumberField
              label="Columns"
              name="columns"
              value={localProps.columns || 4}
              onChange={(v) => handleChange('columns', v)}
              min={2}
              max={4}
            />
          </>
        )}

        {/* Gallery Block Props */}
        {blockKey === 'gallery' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <NumberField
              label="Columns"
              name="columns"
              value={localProps.columns || 3}
              onChange={(v) => handleChange('columns', v)}
              min={2}
              max={5}
            />
            <CheckboxField
              label="Show Captions"
              name="showCaptions"
              value={localProps.showCaptions ?? true}
              onChange={(v) => handleChange('showCaptions', v)}
            />
            <ArrayFieldEditor
              label="Gallery Items"
              value={localProps.items || []}
              onChange={(v) => handleChange('items', v)}
              itemSchema="galleryItem"
              maxItems={50}
              minItems={1}
            />
          </>
        )}

        {/* ContactCTA Block Props */}
        {blockKey === 'contactCTA' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Description"
              name="description"
              value={localProps.description || ''}
              onChange={(v) => handleChange('description', v)}
              rows={3}
            />
            <TextField
              label="Phone"
              name="phone"
              value={localProps.phone || ''}
              onChange={(v) => handleChange('phone', v)}
            />
            <TextField
              label="Email"
              name="email"
              value={localProps.email || ''}
              onChange={(v) => handleChange('email', v)}
            />
            <TextAreaField
              label="Address"
              name="address"
              value={localProps.address || ''}
              onChange={(v) => handleChange('address', v)}
              rows={3}
            />
          </>
        )}

        {/* Features Block Props */}
        {blockKey === 'features' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <NumberField
              label="Columns"
              name="columns"
              value={localProps.columns || 3}
              onChange={(v) => handleChange('columns', v)}
              min={2}
              max={4}
            />
            <ArrayFieldEditor
              label="Features"
              value={localProps.features || []}
              onChange={(v) => handleChange('features', v)}
              itemSchema="feature"
              maxItems={12}
              minItems={2}
            />
          </>
        )}

        {/* Testimonials Block Props */}
        {blockKey === 'testimonials' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <CheckboxField
              label="Show Ratings"
              name="showRatings"
              value={localProps.showRatings ?? true}
              onChange={(v) => handleChange('showRatings', v)}
            />
            <ArrayFieldEditor
              label="Testimonials"
              value={localProps.testimonials || []}
              onChange={(v) => handleChange('testimonials', v)}
              itemSchema="testimonial"
              maxItems={12}
              minItems={1}
            />
          </>
        )}

        {/* Program Grid Block Props */}
        {blockKey === 'programGrid' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-900">Columns</label>
              <select
                value={localProps.columns || '3'}
                onChange={(e) => handleChange('columns', e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="2">2 columns</option>
                <option value="3">3 columns</option>
                <option value="4">4 columns</option>
              </select>
            </div>
            <ArrayFieldEditor
              label="Programs"
              value={localProps.programs || []}
              onChange={(v) => handleChange('programs', v)}
              itemSchema="program"
              maxItems={12}
              minItems={1}
            />
          </>
        )}

        {/* Staff Cards Block Props */}
        {blockKey === 'staffCards' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-900">Columns</label>
              <select
                value={localProps.columns || '3'}
                onChange={(e) => handleChange('columns', e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="2">2 columns</option>
                <option value="3">3 columns</option>
                <option value="4">4 columns</option>
              </select>
            </div>
            <CheckboxField
              label="Show Qualifications"
              name="showQualifications"
              value={localProps.showQualifications ?? true}
              onChange={(v) => handleChange('showQualifications', v)}
            />
            <ArrayFieldEditor
              label="Staff Members"
              value={localProps.staff || []}
              onChange={(v) => handleChange('staff', v)}
              itemSchema="staff"
              maxItems={20}
              minItems={1}
            />
          </>
        )}

        {/* Fees Table Block Props */}
        {blockKey === 'feesTable' && (
          <>
            <TextField
              label="Title"
              name="title"
              value={localProps.title || ''}
              onChange={(v) => handleChange('title', v)}
              required
              maxLength={100}
            />
            <TextAreaField
              label="Subtitle"
              name="subtitle"
              value={localProps.subtitle || ''}
              onChange={(v) => handleChange('subtitle', v)}
              rows={2}
              maxLength={200}
            />
            <CheckboxField
              label="Show Descriptions"
              name="showDescriptions"
              value={localProps.showDescriptions ?? true}
              onChange={(v) => handleChange('showDescriptions', v)}
            />
            <CheckboxField
              label="Show Frequency"
              name="showFrequency"
              value={localProps.showFrequency ?? true}
              onChange={(v) => handleChange('showFrequency', v)}
            />
            <TextAreaField
              label="Note"
              name="note"
              value={localProps.note || ''}
              onChange={(v) => handleChange('note', v)}
              rows={3}
              maxLength={500}
              helpText="Optional disclaimer or additional information"
            />
            <ArrayFieldEditor
              label="Fee Categories"
              value={localProps.categories || []}
              onChange={(v) => handleChange('categories', v)}
              itemSchema="feeCategory"
              maxItems={10}
              minItems={1}
            />
          </>
        )}

        {/* Default/Fallback */}
        {![
          'hero',
          'richText',
          'stats',
          'gallery',
          'contactCTA',
          'features',
          'testimonials',
          'programGrid',
          'staffCards',
          'feesTable',
        ].includes(blockKey) && (
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Props editor for <strong>{blockKey}</strong> coming soon.
            </p>
            <p className="mt-2 text-xs text-amber-700">
              Current props: {JSON.stringify(localProps, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
