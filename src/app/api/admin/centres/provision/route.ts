import { NextRequest, NextResponse } from 'next/server';

import { getRequestId, logError, requireAdminToken } from '@/lib/api/auth-guard';
import { TENANT_BASE_DOMAIN } from '@/lib/config';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * POST /api/admin/centres/provision
 * Body: { name, slug, plan_tier, template_key? }
 * Creates a centre, default subdomain, seeds basic pages/blocks, and default navigation.
 */
export async function POST(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);

  try {
    const body = await request.json();
    const { name, slug, plan_tier, template_key, organization_id, primary_domain } = body as {
      name: string;
      slug: string;
      plan_tier?: 'solo' | 'group_5' | 'group_10' | 'enterprise';
      template_key?: string;
      organization_id?: string;
      primary_domain?: string;
    };

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();

    // Ensure centre slug unique
    const { data: existing } = await supabase.from('centres').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    // Resolve or create organization
    let orgId = organization_id as string | undefined;
    if (!orgId) {
      const orgName = `${name} Organization`;
      const baseOrgSlug = `${slug}-org`;
      let desiredSlug = baseOrgSlug;
      // Try to avoid unique conflicts by appending numeric suffix if needed
      for (let i = 0; i < 3; i++) {
        const { data: orgExisting } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', desiredSlug)
          .maybeSingle();
        if (!orgExisting) break;
        desiredSlug = `${baseOrgSlug}-${Math.floor(Math.random() * 1000)}`;
      }
      const maxCentres = plan_tier === 'group_5' ? 5 : plan_tier === 'group_10' ? 10 : plan_tier === 'enterprise' ? 0 : 1;
      const { data: org, error: oErr } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: desiredSlug,
          plan_tier: plan_tier || 'solo',
          max_centres: maxCentres,
          status: 'active',
          subscription_status: 'trialing',
        })
        .select('id')
        .single();
      if (oErr || !org) {
        logError(requestId, 'organizations insert', oErr);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
      }
      orgId = org.id as string;
    }

    // Resolve primary domain (required, with default fallback)
    const defaultDomain = `${slug}.${TENANT_BASE_DOMAIN}`;
    const primaryDomain = (primary_domain || '').trim().toLowerCase() || defaultDomain;

    // 1) Create centre
    const { data: centre, error: cErr } = await supabase
      .from('centres')
      .insert({ name, slug, status: 'active', plan_tier: plan_tier || 'solo', organization_id: orgId, primary_domain: primaryDomain })
      .select('id, slug, name, primary_domain')
      .single();
    if (cErr || !centre) {
      logError(requestId, 'centres insert', cErr);
      const message = (cErr as any)?.message || 'Failed to create centre';
      const status = message.toLowerCase().includes('limit') ? 422 : 500;
      return NextResponse.json({ error: message }, { status });
    }

    // 2) Domains: ensure primary + fallback preview subdomain
    const domainRows = [
      {
        centre_id: centre.id,
        domain: primaryDomain,
        is_primary: true,
        verification_status: primaryDomain === defaultDomain ? 'verified' : 'pending',
      },
    ];
    if (primaryDomain !== defaultDomain) {
      domainRows.push({
        centre_id: centre.id,
        domain: defaultDomain,
        is_primary: false,
        verification_status: 'verified',
      });
    }
    const { error: dErr } = await supabase.from('centre_domains').insert(domainRows);
    if (dErr) logError(requestId, 'centre_domains insert', dErr);

    // 3) Seed basic pages
    const pagesSeed = [
      { slug: '', title: 'Home', is_published: true },
      { slug: 'about', title: 'About Us', is_published: false },
      { slug: 'programs', title: 'Programs', is_published: false },
      { slug: 'contact', title: 'Contact', is_published: false },
    ];

    const { data: pages, error: pErr } = await supabase
      .from('pages')
      .insert(
        pagesSeed.map((p) => ({
          centre_id: centre.id,
          slug: p.slug || 'index',
          title: p.title,
          is_published: p.is_published,
        })),
      )
      .select('id, slug, title')
      .order('created_at');

    if (pErr) logError(requestId, 'pages seed', pErr);

    // 4) Seed blocks for home
    const home = pages?.find((p) => p.slug === 'index');
    if (home) {
      const { error: bErr } = await supabase.from('page_blocks').insert([
        {
          page_id: home.id,
          block_key: 'hero',
          props: {
            title: name,
            subtitle: 'NCF-aligned website powered by EduSitePro',
            backgroundImage: '',
          },
          block_order: 0,
        },
        {
          page_id: home.id,
          block_key: 'features',
          props: {
            title: 'Why choose us',
            subtitle: 'Trusted by ECD centres',
            columns: 3,
            features: [
              { title: 'NCF-Aligned', description: 'Structured for SA curriculum', icon: 'book' },
              { title: 'Responsive', description: 'Works on any device', icon: 'phone' },
              { title: 'Fast & Secure', description: 'Hosted on Vercel', icon: 'bolt' },
            ],
          },
          block_order: 1,
        },
      ]);
      if (bErr) logError(requestId, 'page_blocks seed', bErr);
    }

    // 5) Seed navigation (basic)
    const navItems = [
      { label: 'Home', url: '/', sort_order: 0 },
      { label: 'About', url: '/about', sort_order: 1 },
      { label: 'Programs', url: '/programs', sort_order: 2 },
      { label: 'Contact', url: '/contact', sort_order: 3 },
    ];
    const { error: nErr } = await supabase
      .from('navigation_items')
      .insert(navItems.map((n) => ({ ...n, centre_id: centre.id })));
    if (nErr) logError(requestId, 'navigation_items seed', nErr);

    return NextResponse.json({
      success: true,
      centre,
      preview_url: `https://${defaultDomain}`,
      primary_domain: primaryDomain,
      template_key: template_key || null,
    });
  } catch (error) {
    logError(requestId, 'provision POST', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
