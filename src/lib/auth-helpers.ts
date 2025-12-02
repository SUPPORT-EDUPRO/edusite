/**
 * Authentication Helper Functions
 * Server-side utilities for role-based access control
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Check if the current user is a SuperAdmin
 * Returns user profile if authorized, null otherwise
 */
export async function verifySuperAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get session from cookies - check all possible cookie names
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Find the access token cookie (Supabase SSR uses different naming)
  const authCookie = allCookies.find(cookie => 
    cookie.name.includes('auth-token') || 
    cookie.name.includes('access-token') ||
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );
  
  if (!authCookie) {
    console.log('[verifySuperAdmin] No auth cookie found. Available cookies:', allCookies.map(c => c.name));
    return null;
  }

  console.log('[verifySuperAdmin] Using cookie:', authCookie.name);

  // Verify the session
  const { data: { user }, error } = await supabase.auth.getUser(authCookie.value);
  
  if (error || !user) {
    console.log('[verifySuperAdmin] User verification failed:', error);
    return null;
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    console.log('[verifySuperAdmin] Not a superadmin. Role:', profile?.role);
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get session from cookies - check all possible cookie names
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Find the access token cookie (Supabase SSR uses different naming)
  const authCookie = allCookies.find(cookie => 
    cookie.name.includes('auth-token') || 
    cookie.name.includes('access-token') ||
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );
  
  if (!authCookie) {
    console.log('[verifyAdmin] No auth cookie found. Available cookies:', allCookies.map(c => c.name));
    return null;
  }

  console.log('[verifyAdmin] Using cookie:', authCookie.name);

  // Verify the session
  const { data: { user }, error } = await supabase.auth.getUser(authCookie.value);
  
  if (error || !user) {
    console.log('[verifyAdmin] User verification failed:', error);
    return null;
  }

  // Check user role - allow both superadmin and admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'superadmin' && profile.role !== 'admin')) {
    console.log('[verifyAdmin] User is not admin. Role:', profile?.role);
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
