import { NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';

export async function POST() {
  const supabase = createClient();
  
  await supabase.auth.signOut();
  
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'));
}
