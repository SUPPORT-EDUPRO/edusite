import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function srClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;

    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const { data: theme, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .eq('centre_id', centreId)
      .single();

    if (error) throw error;

    return NextResponse.json(theme);
  } catch (error: any) {
    console.error('Error fetching theme:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;
    const body = await request.json();

    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const { name, colors, typography, layout, customCss, isActive } = body;

    // If activating this theme, deactivate all others for this centre first
    if (isActive) {
      await supabase
        .from('themes')
        .update({ is_active: false })
        .eq('centre_id', centreId)
        .neq('id', id);
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (colors !== undefined) updateData.colors = colors;
    if (typography !== undefined) updateData.typography = typography;
    if (layout !== undefined) updateData.layout = layout;
    if (customCss !== undefined) updateData.custom_css = customCss;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: theme, error } = await supabase
      .from('themes')
      .update(updateData)
      .eq('id', id)
      .eq('centre_id', centreId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ theme });
  } catch (error: any) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;

    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    // Don't allow deleting active theme
    const { data: theme } = await supabase
      .from('themes')
      .select('is_active')
      .eq('id', id)
      .eq('centre_id', centreId)
      .single();

    if (theme?.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active theme. Please activate another theme first.' },
        { status: 400 },
      );
    }

    const { error } = await supabase.from('themes').delete().eq('id', id).eq('centre_id', centreId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting theme:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
