'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';

interface OrganizationFormProps {
  createOrganization: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? 'Creating...' : 'Create Organization'}
      </button>
      <Link
        href="/admin/organizations"
        className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        Cancel
      </Link>
    </div>
  );
}

export function OrganizationForm({ createOrganization }: OrganizationFormProps) {
  const [state, formAction] = useFormState(createOrganization, undefined);

  return (
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
          placeholder="ABC Learning Group"
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
          placeholder="abc-learning-group"
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-stone-500">
          Lowercase letters, numbers, and hyphens only. Used in identifiers.
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
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
        >
          <option value="group_5">Group 5 - R799/month for up to 5 centres</option>
          <option value="group_10">Group 10 - R1,499/month for up to 10 centres</option>
          <option value="enterprise">Enterprise - Custom pricing (Unlimited centres)</option>
        </select>
        <p className="mt-1 text-xs text-stone-500">
          Group plans are flat-rate subscriptions, not per-centre charges.
        </p>
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
          placeholder="John Smith"
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
          placeholder="john@abclearning.co.za"
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
          placeholder="+27 82 000 0000"
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
          placeholder="billing@abclearning.co.za"
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-stone-500">
          If different from primary contact email. Invoices will be sent here.
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="mb-2 block text-sm font-medium text-stone-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Pricing Info Box */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="mb-2 font-semibold text-amber-900">💡 Multi-Centre Organizations</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          <li>
            • <strong>Group 5 (R799/mo):</strong> Up to 5 centres = R160/centre (20% discount)
          </li>
          <li>
            • <strong>Group 10 (R1,499/mo):</strong> Up to 10 centres = R150/centre (25% discount)
          </li>
          <li>
            • <strong>Enterprise:</strong> Unlimited centres + white-label + API access
          </li>
        </ul>
        <p className="mt-2 text-xs text-amber-700">
          💡 For single centres, use the{' '}
          <a href="/admin/centres/new" className="font-semibold underline">
            Centres
          </a>{' '}
          tab instead (R199/mo).
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
