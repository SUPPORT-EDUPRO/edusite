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

    const { data: menu, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ menu });
  } catch (error: any) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;
    const body = await request.json();

    const { name, items, isActive } = body;

    // If activating this menu, deactivate all others for this tenant
    if (isActive) {
      const { data: currentMenu } = await supabase
        .from('navigation_menus')
        .select('tenant_id')
        .eq('id', id)
        .single();

      if (currentMenu) {
        await supabase
          .from('navigation_menus')
          .update({ is_active: false })
          .eq('tenant_id', currentMenu.tenant_id)
          .neq('id', id);
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (items !== undefined) updateData.items = items;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: menu, error } = await supabase
      .from('navigation_menus')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ menu });
  } catch (error: any) {
    console.error('Error updating navigation menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;

    // Don't allow deleting active menu
    const { data: menu } = await supabase
      .from('navigation_menus')
      .select('is_active')
      .eq('id', id)
      .single();

    if (menu?.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active menu. Please activate another menu first.' },
        { status: 400 },
      );
    }

    const { error } = await supabase.from('navigation_menus').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting navigation menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
