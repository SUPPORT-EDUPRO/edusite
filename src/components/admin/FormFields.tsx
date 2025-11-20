'use client';

import { useState } from 'react';

import MediaPicker from './MediaPicker';

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

// Text Input Field
interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
  required,
  placeholder,
  maxLength,
}: TextFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-amber-500 focus:ring-amber-200'
        }`}
      />
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {maxLength && (
        <p className="mt-1 text-xs text-stone-600">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

// TextArea Field
interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
  required,
  placeholder,
  rows = 4,
  maxLength,
}: TextAreaFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-amber-500 focus:ring-amber-200'
        }`}
      />
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {maxLength && (
        <p className="mt-1 text-xs text-stone-600">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

// Number Field
interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
  required,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-amber-500 focus:ring-amber-200'
        }`}
      />
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Checkbox/Toggle Field
interface CheckboxFieldProps extends BaseFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function CheckboxField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
}: CheckboxFieldProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-200"
        />
        <label htmlFor={name} className="ml-2 block text-sm text-stone-700">
          {label}
        </label>
      </div>
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Select/Dropdown Field
interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
  required,
  options,
}: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-amber-500 focus:ring-amber-200'
        }`}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Image URL Field (with preview and media picker)
interface ImageFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
  required,
}: ImageFieldProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const isValidUrl = value && value.startsWith('http');

  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={`flex-1 rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:outline-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowMediaPicker(true)}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          title="Choose from media library"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
      {helpText && !error && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Image Preview */}
      {isValidUrl && (
        <div className="mt-2 rounded-lg border border-stone-200 p-2">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full rounded object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3EInvalid%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}
