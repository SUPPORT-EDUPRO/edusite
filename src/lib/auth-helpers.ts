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

  // Get session from cookies
  const cookieStore = cookies();
  const authCookie = cookieStore.get('sb-access-token') || cookieStore.get('supabase-auth-token');
  
  if (!authCookie) {
    return null;
  }

  // Verify the session
  const { data: { user }, error } = await supabase.auth.getUser(authCookie.value);
  
  if (error || !user) {
    return null;
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    return null;
  }

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
