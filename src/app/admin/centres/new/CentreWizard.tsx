"use client";

import * as React from 'react';

import { TENANT_BASE_DOMAIN } from '@/lib/config';

type PlanTier = 'solo' | 'group_5' | 'group_10' | 'enterprise';

type ProvisionInput = {
  name: string;
  slug: string;
  plan_tier: PlanTier;
  primary_domain?: string | null;
};

type ProvisionResult =
  | { ok: true; preview_url?: string }
  | { ok: false; error: string };

type Organization = {
  id: string;
  name: string;
  slug: string;
  plan_tier: PlanTier;
  max_centres: number;
  status: string;
  centre_count: number;
};

export default function CentreWizard({
  provisionCentre,
  organizations = [],
}: {
  provisionCentre: (input: ProvisionInput & { organization_id?: string | null }) => Promise<ProvisionResult>;
  organizations?: Organization[];
}) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [plan, setPlan] = React.useState<PlanTier>('solo');
  const [orgMode, setOrgMode] = React.useState<'new' | 'existing'>('new');
  const [orgId, setOrgId] = React.useState<string | null>(null);
  const [domain, setDomain] = React.useState('');
  const [domainTouched, setDomainTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const normalizedSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  const subdomain = normalizedSlug ? `${normalizedSlug}.${TENANT_BASE_DOMAIN}` : '';

  React.useEffect(() => {
    if (!domainTouched) setDomain(subdomain);
  }, [subdomain, domainTouched]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const domainOk = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);
  const canNext1 =
    name.trim().length > 1 &&
    normalizedSlug.length > 1 &&
    /^[a-z0-9-]+$/.test(normalizedSlug) &&
    domainOk;

  const provision = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await provisionCentre({
        name: name.trim(),
        slug: normalizedSlug,
        plan_tier: plan,
        organization_id: orgMode === 'existing' ? orgId : undefined,
        primary_domain: domain.trim() || subdomain,
      });
      if (!res.ok) {
        setError(res.error || 'Provisioning failed');
        return;
      }
      setPreviewUrl(res.preview_url || null);
      setStep(3);
    } catch (e: any) {
      setError(e?.message || 'Provisioning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${
              step === i ? 'font-medium text-stone-900' : 'text-stone-600'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                step >= i ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {i}
            </div>
            <span>{i === 1 ? 'Details' : i === 2 ? 'Plan' : 'Complete'}</span>
            {i < 3 && <div className="h-px w-8 bg-stone-300" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-800">Centre Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sunny Days ECD"
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-800">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sunnydays"
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <div className="mt-1 text-xs text-stone-700">Default subdomain: {subdomain || '—'}</div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-800">Primary Domain</label>
            <input
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value.toLowerCase());
                setDomainTouched(true);
              }}
              placeholder={subdomain || 'centre.sites.edusitepro.co.za'}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                domainOk
                  ? 'border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200'
                  : 'border-red-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-red-500 focus:ring-red-200'
              }`}
            />
            <div className="mt-1 text-xs text-stone-700">
              Required. Used as the primary domain. If unchanged, the default will be used: <code>{subdomain || '—'}</code>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div />
            <button
              disabled={!canNext1}
              onClick={next}
              className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Organization selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-800">Organization</div>
            <div className="flex items-center gap-6 text-sm text-stone-800">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgMode"
                  value="new"
                  checked={orgMode === 'new'}
                  onChange={() => setOrgMode('new')}
                />
                <span>Create new automatically</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgMode"
                  value="existing"
                  checked={orgMode === 'existing'}
                  onChange={() => setOrgMode('existing')}
                />
                <span>Add to existing</span>
              </label>
            </div>

            {orgMode === 'existing' && (
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={orgId ?? ''}
                onChange={(e) => setOrgId(e.target.value || null)}
              >
                <option value="">Select organization…</option>
                {organizations.map((o) => {
                  const atLimit = o.max_centres > 0 && o.centre_count >= o.max_centres;
                  const usage = o.max_centres === 0 ? '∞' : `${o.centre_count}/${o.max_centres}`;
                  return (
                    <option key={o.id} value={atLimit ? '' : o.id} disabled={atLimit}>
                      {o.name} ({o.plan_tier}) — {usage} used{atLimit ? ' — Limit reached' : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Plan selection */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-stone-800">Plan Tier</legend>
            {[
              { key: 'solo', label: 'Solo (1 centre)' },
              { key: 'group_5', label: 'Group 5 (5 centres)' },
              { key: 'group_10', label: 'Group 10 (10 centres)' },
              { key: 'enterprise', label: 'Enterprise' },
            ].map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm text-stone-800">
                <input
                  type="radio"
                  name="plan"
                  value={p.key}
                  checked={plan === (p.key as PlanTier)}
                  onChange={() => setPlan(p.key as PlanTier)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
            >
              Back
            </button>
            <button
              onClick={provision}
              disabled={loading || (orgMode === 'existing' && !orgId)}
              className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
            >
              {loading ? 'Provisioning…' : 'Provision Centre'}
            </button>
          </div>

          {orgMode === 'existing' && (
            <p className="text-xs text-stone-600">
              Organizations at capacity are disabled. To add more centres, upgrade plan or free up capacity.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-900">
            <div className="text-sm font-semibold">Centre provisioned successfully!</div>
            {previewUrl && (
              <div className="mt-1 text-sm">
                Preview: <a className="text-amber-700 underline hover:text-amber-800" href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href="/admin/centres" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Go to Centres</a>
            <a href="/admin/builder" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300">Open Page Builder</a>
          </div>
        </div>
      )}
    </div>
  );
}
