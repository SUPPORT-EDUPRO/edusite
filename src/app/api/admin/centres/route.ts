import { NextRequest, NextResponse } from 'next/server';

import { getServiceRoleClient } from '@/lib/supabase';

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');
  if (!adminToken || adminToken !== process.env.INTERNAL_ADMIN_TOKEN) return unauthorized();

  try {
    const body = await request.json();
    const {
      slug,
      name,
      primaryDomain,
      contactEmail,
      contactPhone,
      vercelProjectName,
      vercelDeployHookUrl,
      branding,
    } = body as {
      slug: string;
      name: string;
      primaryDomain?: string;
      contactEmail?: string;
      contactPhone?: string;
      vercelProjectName?: string;
      vercelDeployHookUrl?: string;
      branding?: Record<string, unknown>;
    };

    if (!slug || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: slug, name' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const { data: centre, error } = await supabase
      .from('centres')
      .upsert(
        [
          {
            slug,
            name,
            primary_domain: primaryDomain ?? null,
            contact_email: contactEmail ?? null,
            contact_phone: contactPhone ?? null,
            vercel_project_name: vercelProjectName ?? null,
            vercel_deploy_hook_url: vercelDeployHookUrl ?? null,
            branding: branding ?? {},
          },
        ],
        { onConflict: 'slug' },
      )
      .select('id, slug, name, primary_domain')
      .single();

    if (error) {
      console.error('centres upsert error:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    if (primaryDomain) {
      const { error: domErr } = await supabase.from('centre_domains').upsert(
        [
          {
            centre_id: centre.id,
            domain: primaryDomain,
            is_primary: true,
            verification_status: 'pending',
          },
        ],
        { onConflict: 'domain' },
      );
      if (domErr) console.error('centre_domains upsert error:', domErr);
    }

    return NextResponse.json({ success: true, centre });
  } catch (e) {
    console.error('centres POST error:', e);
    return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');
  if (!adminToken || adminToken !== process.env.INTERNAL_ADMIN_TOKEN) return unauthorized();

  try {
    const body = await request.json();
    const { id, slug, updates } = body as {
      id?: string;
      slug?: string;
      updates: Partial<{
        name: string;
        primaryDomain: string;
        contactEmail: string;
        contactPhone: string;
        vercelProjectName: string;
        vercelDeployHookUrl: string;
        branding: Record<string, unknown>;
        status: 'active' | 'suspended' | 'archived';
      }>;
    };

    if (!id && !slug) {
      return NextResponse.json({ success: false, message: 'Provide id or slug' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();

    // Build update payload
    const payload: Record<string, unknown> = {};
    if (updates?.name) payload.name = updates.name;
    if (updates?.primaryDomain) payload.primary_domain = updates.primaryDomain;
    if (updates?.contactEmail) payload.contact_email = updates.contactEmail;
    if (updates?.contactPhone) payload.contact_phone = updates.contactPhone;
    if (updates?.vercelProjectName) payload.vercel_project_name = updates.vercelProjectName;
    if (updates?.vercelDeployHookUrl) payload.vercel_deploy_hook_url = updates.vercelDeployHookUrl;
    if (updates?.branding) payload.branding = updates.branding;
    if (updates?.status) payload.status = updates.status;

    let query = supabase.from('centres').update(payload).select('id, slug').limit(1);
    query = id ? query.eq('id', id) : query.eq('slug', slug as string);

    const { data: updated, error } = await query;
    if (error) {
      console.error('centres update error:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    const centre = updated?.[0];
    if (!centre)
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    if (updates?.primaryDomain) {
      const { error: domErr } = await supabase.from('centre_domains').upsert(
        [
          {
            centre_id: centre.id,
            domain: updates.primaryDomain,
            is_primary: true,
            verification_status: 'pending',
          },
        ],
        { onConflict: 'domain' },
      );
      if (domErr) console.error('centre_domains upsert error:', domErr);
    }

    return NextResponse.json({ success: true, centre });
  } catch (e) {
    console.error('centres PATCH error:', e);
    return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
  }
}
