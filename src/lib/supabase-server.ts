import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side operations with tenant context
 * Uses the anon key with RLS policies
 */
export async function createServerSupabaseClient() {
  const headersList = await headers();

  const tenantId = headersList.get('x-tenant-id');

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  // Set tenant context if available
  if (tenantId) {
    await client.rpc('set_config', {
      name: 'app.current_tenant_id',
      value: tenantId,
    });
  }

  return client;
}

/**
 * Get Supabase client from API route request with tenant context
 * This is synchronous but the RLS context must be set before queries
 */
export function getSupabaseClient(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        // Pass tenant ID to be set in RLS context
        'X-Tenant-Context': tenantId || '',
      },
    },
  });

  return client;
}

/**
 * Initialize tenant context for RLS policies
 * Must be called before any queries that depend on RLS
 */
export async function initTenantContext(client: any, tenantId: string) {
  if (!tenantId || tenantId.trim() === '') {
    throw new Error('Tenant ID is required for RLS context');
  }

  // Set the tenant context for RLS policies using PostgreSQL's set_config
  // This sets a session variable that RLS policies can read
  // PostgreSQL set_config signature: set_config(setting text, value text, is_local boolean)
  try {
    // Use raw SQL to call set_config properly
    const { error } = await client.rpc('exec_sql', {
      sql: `SELECT set_config('app.current_tenant_id', '${tenantId}', false);`,
    });

    if (error) {
      console.error('Failed to set tenant context via exec_sql:', error);
      // Fallback: try direct query
      const { error: queryError } = await client
        .from('_query')
        .select(`set_config('app.current_tenant_id', '${tenantId}', false)`);

      if (queryError) {
        console.error('Failed to set tenant context via query:', queryError);
        throw queryError;
      }
    }
  } catch (error) {
    console.error('Failed to set tenant context:', error);
    throw error;
  }
}
