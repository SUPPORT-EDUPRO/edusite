/**
 * Authentication Helper Functions
 * Server-side utilities for role-based access control
 */

import { type CookieOptions,createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Check if the current user is a SuperAdmin
 * Returns user profile if authorized, null otherwise
 */
export async function verifySuperAdmin() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // No-op in API routes
        },
        remove(name: string, options: CookieOptions) {
          // No-op in API routes
        },
      },
    }
  );

  // Get session using SSR client
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log('[verifySuperAdmin] No session found');
    return null;
  }

  console.log('[verifySuperAdmin] Session found for user:', session.user.email);

  // Check user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    console.log('[verifySuperAdmin] Profile fetch failed:', profileError);
    return null;
  }

  if (profile.role !== 'superadmin') {
    console.log('[verifySuperAdmin] Not a superadmin. Role:', profile.role);
    return null;
  }

  console.log('[verifySuperAdmin] Access granted:', profile.email);
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    organization_id: profile.organization_id,
  };
}

/**
 * Check if the current user is an Admin (SuperAdmin or Platform Admin)
 * Returns user profile if authorized, null otherwise
 */
export async function verifyAdmin() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // No-op in API routes
        },
        remove(name: string, options: CookieOptions) {
          // No-op in API routes
        },
      },
    }
  );

  // Get session using SSR client
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log('[verifyAdmin] No session found');
    return null;
  }

  console.log('[verifyAdmin] Session found for user:', session.user.email);

  // Check user role - allow both superadmin and admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    console.log('[verifyAdmin] Profile fetch failed:', profileError);
    return null;
  }

  if (profile.role !== 'superadmin' && profile.role !== 'admin') {
    console.log('[verifyAdmin] User is not admin. Role:', profile.role);
    return null;
  }

  console.log('[verifyAdmin] Admin access granted:', profile.email, 'Role:', profile.role);
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    organization_id: profile.organization_id,
  };
}

/**
 * Create an unauthorized response with proper headers
 */
export function unauthorizedResponse(message: string = 'Unauthorized access') {
  return Response.json(
    { error: message },
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Create a forbidden response with proper headers
 */
export function forbiddenResponse(message: string = 'Insufficient permissions') {
  return Response.json(
    { error: message },
    { 
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}
