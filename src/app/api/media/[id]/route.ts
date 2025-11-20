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

    const { data: media, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;
    const body = await request.json();

    const { altText, caption } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (altText !== undefined) updateData.alt_text = altText;
    if (caption !== undefined) updateData.caption = caption;

    const { data: media, error } = await supabase
      .from('media_library')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Error updating media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = srClient();
    const { id } = params;

    // Get media record to find storage path
    const { data: media, error: fetchError } = await supabase
      .from('media_library')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([media.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase.from('media_library').delete().eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
