'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

interface Centre {
  id: string;
  slug: string;
  name: string;
  primary_domain: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  plan_tier: string | null;
  status: string;
}

interface EditCentreFormProps {
  centre: Centre;
  updateCentre: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
  deleteCentre: () => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
        <Link
          href="/admin/centres"
          className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

export function EditCentreForm({ centre, updateCentre, deleteCentre }: EditCentreFormProps) {
  const [state, formAction] = useFormState(updateCentre, undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCentre();
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {state.error}
          </div>
        )}

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium text-stone-700">
            Slug <span className="text-red-600">*</span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9-]+"
            defaultValue={centre.slug}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-stone-500">
            Lowercase letters, numbers, and hyphens only. Used in URLs.
          </p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700">
            Centre Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={centre.name}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Primary Domain */}
        <div>
          <label htmlFor="primary_domain" className="mb-2 block text-sm font-medium text-stone-700">
            Primary Domain
          </label>
          <input
            id="primary_domain"
            name="primary_domain"
            type="text"
            defaultValue={centre.primary_domain || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-stone-500">Optional. Custom domain for this centre.</p>
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contact_email" className="mb-2 block text-sm font-medium text-stone-700">
            Contact Email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={centre.contact_email || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contact_phone" className="mb-2 block text-sm font-medium text-stone-700">
            Contact Phone
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            defaultValue={centre.contact_phone || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Plan Tier */}
        <div>
          <label htmlFor="plan_tier" className="mb-2 block text-sm font-medium text-stone-700">
            Plan Tier
          </label>
          <select
            id="plan_tier"
            name="plan_tier"
            defaultValue={centre.plan_tier || 'solo'}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          >
            <option value="solo">Solo</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-medium text-stone-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={centre.status}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <SubmitButton />
      </form>

      {/* Delete Section */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="mb-2 text-sm font-semibold text-stone-900">Danger Zone</h3>
        <p className="mb-4 text-sm text-stone-600">
          Deleting this centre will permanently remove all associated pages, sections, and data.
          This action cannot be undone.
        </p>
        {showDeleteConfirm ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-sm font-semibold text-red-900">
              Are you sure you want to delete &quot;{centre.name}&quot;?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            Delete Centre
          </button>
        )}
      </div>
    </div>
  );
}
