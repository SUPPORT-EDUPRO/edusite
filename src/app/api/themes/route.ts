import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function srClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET(request: Request) {
  try {
    const supabase = srClient();

    // Get centre_id from header (set by middleware)
    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const { data: themes, error } = await supabase
      .from('themes')
      .select('*')
      .eq('centre_id', centreId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(themes || []);
  } catch (error: any) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = srClient();
    const body = await request.json();

    // Get centre_id from header (set by middleware)
    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const { name, colors, typography, layout, customCss } = body;

    const { data: theme, error } = await supabase
      .from('themes')
      .insert({
        name,
        centre_id: centreId,
        colors: colors || undefined,
        typography: typography || undefined,
        layout: layout || undefined,
        custom_css: customCss || null,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(theme, { status: 201 });
  } catch (error: any) {
    console.error('Error creating theme:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
