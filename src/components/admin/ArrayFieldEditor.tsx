'use client';

import { useState } from 'react';

import { ImageField, NumberField, TextAreaField, TextField } from './FormFields';

interface ArrayFieldEditorProps {
  label: string;
  value: any[];
  onChange: (value: any[]) => void;
  itemSchema: 'testimonial' | 'program' | 'staff' | 'feature' | 'galleryItem' | 'feeCategory';
  maxItems?: number;
  minItems?: number;
}

export default function ArrayFieldEditor({
  label,
  value = [],
  onChange,
  itemSchema,
  maxItems = 20,
  minItems = 1,
}: ArrayFieldEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleAddItem = () => {
    const newItem = getEmptyItem(itemSchema);
    onChange([...value, newItem]);
    setExpandedIndex(value.length);
  };

  const handleRemoveItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    if (expandedIndex === index) {
      setExpandedIndex(newValue.length > 0 ? 0 : null);
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newValue = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newValue[index], newValue[targetIndex]] = [newValue[targetIndex], newValue[index]];
    onChange(newValue);
    setExpandedIndex(targetIndex);
  };

  const handleItemChange = (index: number, field: string, fieldValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: fieldValue };
    onChange(newValue);
  };

  const handleNestedArrayChange = (index: number, field: string, arrayValue: any[]) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: arrayValue };
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-900">{label}</label>
        {value.length < maxItems && (
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            + Add {getItemLabel(itemSchema)}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-lg border border-stone-200 bg-white">
            {/* Item header */}
            <div
              className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-stone-50"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-stone-900">
                  {getItemTitle(item, itemSchema, index)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Move buttons */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveItem(index, 'up');
                    }}
                    className="text-stone-400 hover:text-stone-600"
                    aria-label="Move up"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveItem(index, 'down');
                    }}
                    className="text-stone-400 hover:text-stone-600"
                    aria-label="Move down"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                {/* Delete button */}
                {value.length > minItems && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                {/* Expand/collapse icon */}
                <svg
                  className={`h-5 w-5 text-stone-400 transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Item fields (expanded) */}
            {expandedIndex === index && (
              <div className="space-y-4 border-t border-stone-200 bg-stone-50 p-4">
                {renderItemFields(
                  item,
                  index,
                  itemSchema,
                  handleItemChange,
                  handleNestedArrayChange,
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {value.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-8 text-center">
          <p className="mb-3 text-sm text-stone-600">No {label.toLowerCase()} yet</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            + Add {getItemLabel(itemSchema)}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper: Get empty item based on schema type
function getEmptyItem(schema: string) {
  switch (schema) {
    case 'testimonial':
      return { quote: '', author: '', role: '', photo: '', rating: 5 };
    case 'program':
      return { title: '', description: '', icon: '', ageRange: '', ncfPillars: [] };
    case 'staff':
      return { name: '', role: '', bio: '', photo: '', qualifications: [] };
    case 'feature':
      return { title: '', description: '', icon: '', image: '' };
    case 'galleryItem':
      return { type: 'image', url: '', thumbnail: '', caption: '', alt: '' };
    case 'feeCategory':
      return { category: '', rows: [{ service: '', description: '', amount: '', frequency: '' }] };
    default:
      return {};
  }
}

// Helper: Get item label for "Add" button
function getItemLabel(schema: string) {
  switch (schema) {
    case 'testimonial':
      return 'Testimonial';
    case 'program':
      return 'Program';
    case 'staff':
      return 'Staff Member';
    case 'feature':
      return 'Feature';
    case 'galleryItem':
      return 'Item';
    case 'feeCategory':
      return 'Category';
    default:
      return 'Item';
  }
}

// Helper: Get item title for display
function getItemTitle(item: any, schema: string, index: number) {
  switch (schema) {
    case 'testimonial':
      return item.author || `Testimonial ${index + 1}`;
    case 'program':
      return item.title || `Program ${index + 1}`;
    case 'staff':
      return item.name || `Staff Member ${index + 1}`;
    case 'feature':
      return item.title || `Feature ${index + 1}`;
    case 'galleryItem':
      return item.caption || item.alt || `Item ${index + 1}`;
    case 'feeCategory':
      return item.category || `Category ${index + 1}`;
    default:
      return `Item ${index + 1}`;
  }
}

// Helper: Render item-specific fields
function renderItemFields(
  item: any,
  index: number,
  schema: string,
  onChange: (index: number, field: string, value: any) => void,
  onNestedArrayChange: (index: number, field: string, value: any[]) => void,
) {
  switch (schema) {
    case 'testimonial':
      return (
        <>
          <TextAreaField
            label="Quote"
            name={`testimonials.${index}.quote`}
            value={item.quote || ''}
            onChange={(v) => onChange(index, 'quote', v)}
            rows={3}
            required
          />
          <TextField
            label="Author Name"
            name={`testimonials.${index}.author`}
            value={item.author || ''}
            onChange={(v) => onChange(index, 'author', v)}
            required
          />
          <TextField
            label="Role/Title"
            name={`testimonials.${index}.role`}
            value={item.role || ''}
            onChange={(v) => onChange(index, 'role', v)}
          />
          <ImageField
            label="Photo"
            name={`testimonials.${index}.photo`}
            value={item.photo || ''}
            onChange={(v) => onChange(index, 'photo', v)}
          />
          <NumberField
            label="Rating"
            name={`testimonials.${index}.rating`}
            value={item.rating || 5}
            onChange={(v) => onChange(index, 'rating', v)}
            min={1}
            max={5}
          />
        </>
      );

    case 'program':
      return (
        <>
          <TextField
            label="Program Title"
            name={`programs.${index}.title`}
            value={item.title || ''}
            onChange={(v) => onChange(index, 'title', v)}
            required
          />
          <TextAreaField
            label="Description"
            name={`programs.${index}.description`}
            value={item.description || ''}
            onChange={(v) => onChange(index, 'description', v)}
            rows={3}
          />
          <TextField
            label="Icon/Emoji"
            name={`programs.${index}.icon`}
            value={item.icon || ''}
            onChange={(v) => onChange(index, 'icon', v)}
            helpText="e.g., 🎨 or 📚"
          />
          <TextField
            label="Age Range"
            name={`programs.${index}.ageRange`}
            value={item.ageRange || ''}
            onChange={(v) => onChange(index, 'ageRange', v)}
            helpText="e.g., 3-4 years"
          />
          <TagsField
            label="NCF Pillars"
            name={`programs.${index}.ncfPillars`}
            value={item.ncfPillars || []}
            onChange={(v) => onChange(index, 'ncfPillars', v)}
            helpText="Press Enter to add"
          />
        </>
      );

    case 'staff':
      return (
        <>
          <TextField
            label="Name"
            name={`staff.${index}.name`}
            value={item.name || ''}
            onChange={(v) => onChange(index, 'name', v)}
            required
          />
          <TextField
            label="Role/Position"
            name={`staff.${index}.role`}
            value={item.role || ''}
            onChange={(v) => onChange(index, 'role', v)}
            required
          />
          <TextAreaField
            label="Bio"
            name={`staff.${index}.bio`}
            value={item.bio || ''}
            onChange={(v) => onChange(index, 'bio', v)}
            rows={3}
          />
          <ImageField
            label="Photo"
            name={`staff.${index}.photo`}
            value={item.photo || ''}
            onChange={(v) => onChange(index, 'photo', v)}
          />
          <TagsField
            label="Qualifications"
            name={`staff.${index}.qualifications`}
            value={item.qualifications || []}
            onChange={(v) => onChange(index, 'qualifications', v)}
            helpText="Press Enter to add"
          />
        </>
      );

    case 'feature':
      return (
        <>
          <TextField
            label="Feature Title"
            name={`features.${index}.title`}
            value={item.title || ''}
            onChange={(v) => onChange(index, 'title', v)}
            required
            maxLength={100}
          />
          <TextAreaField
            label="Description"
            name={`features.${index}.description`}
            value={item.description || ''}
            onChange={(v) => onChange(index, 'description', v)}
            rows={3}
            required
            maxLength={300}
          />
          <TextField
            label="Icon/Emoji"
            name={`features.${index}.icon`}
            value={item.icon || ''}
            onChange={(v) => onChange(index, 'icon', v)}
            helpText="e.g., ✨ or 🎯"
          />
          <ImageField
            label="Image"
            name={`features.${index}.image`}
            value={item.image || ''}
            onChange={(v) => onChange(index, 'image', v)}
            helpText="Optional image instead of icon"
          />
        </>
      );

    case 'galleryItem':
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-900">Media Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`items.${index}.type`}
                  value="image"
                  checked={item.type === 'image'}
                  onChange={() => onChange(index, 'type', 'image')}
                  className="text-amber-600"
                />
                <span className="text-sm text-stone-700">Image</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`items.${index}.type`}
                  value="video"
                  checked={item.type === 'video'}
                  onChange={() => onChange(index, 'type', 'video')}
                  className="text-amber-600"
                />
                <span className="text-sm text-stone-700">Video</span>
              </label>
            </div>
          </div>
          <ImageField
            label={item.type === 'video' ? 'Video URL' : 'Image URL'}
            name={`items.${index}.url`}
            value={item.url || ''}
            onChange={(v) => onChange(index, 'url', v)}
            required
          />
          {item.type === 'video' && (
            <ImageField
              label="Thumbnail URL"
              name={`items.${index}.thumbnail`}
              value={item.thumbnail || ''}
              onChange={(v) => onChange(index, 'thumbnail', v)}
            />
          )}
          <TextField
            label="Caption"
            name={`items.${index}.caption`}
            value={item.caption || ''}
            onChange={(v) => onChange(index, 'caption', v)}
            maxLength={200}
          />
          <TextField
            label="Alt Text"
            name={`items.${index}.alt`}
            value={item.alt || ''}
            onChange={(v) => onChange(index, 'alt', v)}
            required
            helpText="Accessibility description"
          />
        </>
      );

    case 'feeCategory':
      return (
        <>
          <TextField
            label="Category Name"
            name={`categories.${index}.category`}
            value={item.category || ''}
            onChange={(v) => onChange(index, 'category', v)}
            required
            maxLength={100}
          />
          <FeeRowsEditor
            value={item.rows || []}
            onChange={(rows) => onNestedArrayChange(index, 'rows', rows)}
          />
        </>
      );

    default:
      return null;
  }
}

// Tags field component
function TagsField({
  label,
  name,
  value = [],
  onChange,
  helpText,
}: {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  helpText?: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-900">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-amber-600 hover:text-amber-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        name={name}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        placeholder="Type and press Enter"
      />
      {helpText && <p className="text-xs text-stone-500">{helpText}</p>}
    </div>
  );
}

// Fee rows editor (nested array for FeesTable)
function FeeRowsEditor({
  value = [],
  onChange,
}: {
  value: any[];
  onChange: (value: any[]) => void;
}) {
  const handleAddRow = () => {
    onChange([...value, { service: '', description: '', amount: '', frequency: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, fieldValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: fieldValue };
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-900">Fee Rows</label>
        <button
          type="button"
          onClick={handleAddRow}
          className="text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          + Add Row
        </button>
      </div>

      {value.map((row, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-stone-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-700">Row {index + 1}</span>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <TextField
            label="Service"
            name={`row.${index}.service`}
            value={row.service || ''}
            onChange={(v) => handleRowChange(index, 'service', v)}
            required
          />
          <TextAreaField
            label="Description"
            name={`row.${index}.description`}
            value={row.description || ''}
            onChange={(v) => handleRowChange(index, 'description', v)}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Amount"
              name={`row.${index}.amount`}
              value={row.amount || ''}
              onChange={(v) => handleRowChange(index, 'amount', v)}
              required
              helpText="e.g., R1,500"
            />
            <TextField
              label="Frequency"
              name={`row.${index}.frequency`}
              value={row.frequency || ''}
              onChange={(v) => handleRowChange(index, 'frequency', v)}
              helpText="e.g., per month"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
