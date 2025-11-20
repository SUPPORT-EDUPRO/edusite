'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';

interface CentreFormProps {
  createCentre: (
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
        {pending ? 'Creating...' : 'Create Centre'}
      </button>
      <Link
        href="/admin/centres"
        className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        Cancel
      </Link>
    </div>
  );
}

export function CentreForm({ createCentre }: CentreFormProps) {
  const [state, formAction] = useFormState(createCentre, undefined);

  return (
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
          placeholder="little-stars"
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
          placeholder="Little Stars Early Learning Centre"
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
          placeholder="www.littlestars.co.za"
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
          placeholder="principal@littlestars.co.za"
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
          placeholder="+27 82 000 0000"
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
          className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <SubmitButton />
    </form>
  );
}
