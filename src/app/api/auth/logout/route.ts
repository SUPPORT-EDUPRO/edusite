import { NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';

export async function POST() {
  try {
    const supabase = createClient();

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
