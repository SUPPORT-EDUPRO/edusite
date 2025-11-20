import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function srClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// GET: List media files for centre
export async function GET(request: Request) {
  try {
    const supabase = srClient();

    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const url = new URL(request.url);
    const bucket = url.searchParams.get('bucket') || 'media';

    // List files in centre's folder
    const { data: files, error } = await supabase.storage.from(bucket).list(centreId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      console.error('List files error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add public URLs to each file
    const filesWithUrls = files.map((file) => {
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(`${centreId}/${file.name}`);

      return {
        ...file,
        url: publicUrl,
        path: `${centreId}/${file.name}`,
      };
    });

    return NextResponse.json({ files: filesWithUrls });
  } catch (error: any) {
    console.error('Error listing media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a media file
export async function DELETE(request: Request) {
  try {
    const supabase = srClient();

    const centreId = request.headers.get('x-tenant-id');
    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { filePath, bucket = 'media' } = body;

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Ensure file belongs to this centre
    if (!filePath.startsWith(centreId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Delete file error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
