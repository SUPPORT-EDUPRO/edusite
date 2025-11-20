import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use service role to bypass RLS for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    const { data: menus, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(menus);
  } catch (error: any) {
    console.error('Error fetching navigation menus:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
    const body = await request.json();

    const { name, items } = body;

    const { data: menu, error } = await supabase
      .from('navigation_menus')
      .insert({
        name: name || 'New Menu',
        items: items || [],
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating navigation menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
