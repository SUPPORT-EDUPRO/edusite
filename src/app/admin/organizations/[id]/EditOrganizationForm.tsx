'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  billing_email: string | null;
  status: string;
  centres?: any[];
}

interface EditOrganizationFormProps {
  organization: Organization;
  updateOrganization: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
  deleteOrganization: () => Promise<void>;
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
          href="/admin/organizations"
          className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

export function EditOrganizationForm({
  organization,
  updateOrganization,
  deleteOrganization,
}: EditOrganizationFormProps) {
  const [state, formAction] = useFormState(updateOrganization, undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const centreCount = organization.centres?.length || 0;

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrganization();
    } catch (error: any) {
      alert(error.message || 'Delete failed');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

        {/* Organization Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700">
            Organization Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={organization.name}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

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
            defaultValue={organization.slug}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-stone-500">
            Lowercase letters, numbers, and hyphens only.
          </p>
        </div>

        {/* Plan Tier */}
        <div>
          <label htmlFor="plan_tier" className="mb-2 block text-sm font-medium text-stone-700">
            Plan Tier <span className="text-red-600">*</span>
          </label>
          <select
            id="plan_tier"
            name="plan_tier"
            required
            defaultValue={organization.plan_tier}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          >
            <option value="solo">Solo - R199/month for 1 centre</option>
            <option value="group_5">Group 5 - R799/month for up to 5 centres</option>
            <option value="group_10">Group 10 - R1,499/month for up to 10 centres</option>
            <option value="enterprise">Enterprise - Custom pricing (Unlimited)</option>
          </select>
          {centreCount > 0 && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ Organization currently has {centreCount} centre{centreCount !== 1 ? 's' : ''}.
              Cannot downgrade below this limit.
            </p>
          )}
        </div>

        {/* Primary Contact Name */}
        <div>
          <label
            htmlFor="primary_contact_name"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Primary Contact Name
          </label>
          <input
            id="primary_contact_name"
            name="primary_contact_name"
            type="text"
            defaultValue={organization.primary_contact_name || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Primary Contact Email */}
        <div>
          <label
            htmlFor="primary_contact_email"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Primary Contact Email
          </label>
          <input
            id="primary_contact_email"
            name="primary_contact_email"
            type="email"
            defaultValue={organization.primary_contact_email || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Primary Contact Phone */}
        <div>
          <label
            htmlFor="primary_contact_phone"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Primary Contact Phone
          </label>
          <input
            id="primary_contact_phone"
            name="primary_contact_phone"
            type="tel"
            defaultValue={organization.primary_contact_phone || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Billing Email */}
        <div>
          <label htmlFor="billing_email" className="mb-2 block text-sm font-medium text-stone-700">
            Billing Email
          </label>
          <input
            id="billing_email"
            name="billing_email"
            type="email"
            defaultValue={organization.billing_email || ''}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-stone-500">Invoices will be sent here.</p>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-medium text-stone-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={organization.status}
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
          Deleting this organization will permanently remove all data. This action cannot be undone.
        </p>
        {centreCount > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              ❌ Cannot delete organization with {centreCount} centre{centreCount !== 1 ? 's' : ''}.
              Please delete or move centres first.
            </p>
          </div>
        ) : showDeleteConfirm ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-sm font-semibold text-red-900">
              Are you sure you want to delete &quot;{organization.name}&quot;?
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
            Delete Organization
          </button>
        )}
      </div>
    </div>
  );
}
