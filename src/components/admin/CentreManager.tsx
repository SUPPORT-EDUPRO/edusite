'use client';

import { useState } from 'react';

export default function CentreManager() {
  const [adminToken, setAdminToken] = useState('');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [vercelDeployHookUrl, setVercelDeployHookUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function call(url: string, body: unknown) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Request failed');
      setMessage('Success');
      return data;
    } catch (e: any) {
      setMessage(e.message || 'Error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createOrUpdate() {
    await call('/api/admin/centres', {
      slug,
      name,
      primaryDomain: primaryDomain || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      vercelDeployHookUrl: vercelDeployHookUrl || undefined,
    });
  }

  async function redeploy() {
    await call('/api/redeploy', { slug });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Centre Manager (Internal)
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Admin Token
        </label>
        <input
          type="password"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          placeholder="Enter INTERNAL_ADMIN_TOKEN"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Slug *
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="e.g. little-stars"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="ECD Centre Name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Primary Domain
          </label>
          <input
            value={primaryDomain}
            onChange={(e) => setPrimaryDomain(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="centre.co.za"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Contact Email
          </label>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="principal@centre.co.za"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Contact Phone
          </label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="+27 82 000 0000"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Vercel Deploy Hook URL
          </label>
          <input
            value={vercelDeployHookUrl}
            onChange={(e) => setVercelDeployHookUrl(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../hook_..."
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={createOrUpdate}
          disabled={loading}
          className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Create / Update Centre'}
        </button>
        <button
          onClick={redeploy}
          disabled={loading}
          className="rounded border border-emerald-600 px-4 py-2 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          {loading ? 'Triggering...' : 'Trigger Redeploy'}
        </button>
      </div>

      {message && (
        <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
          {message}
        </div>
      )}

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Note: This page is for internal use. Provide the centre&apos;s custom domain to upsert a
        domain record (verification stays pending until configured on Vercel & DNS is correct).
      </p>
    </div>
  );
}
