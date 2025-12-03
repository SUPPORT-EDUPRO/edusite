import { type CookieOptions, createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  console.log('[Middleware] Request:', path, '| Host:', hostname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for auth and tenant lookup
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Detect tenant from domain
  let tenantId: string | null = null;
  let tenantSlug: string | null = null;

  // For localhost development - detect tenant from user's organization
  if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (profile?.organization_id) {
        tenantId = profile.organization_id;
        
        // Get the org slug for the header
        const { data: org } = await supabase
          .from('organizations')
          .select('slug')
          .eq('id', tenantId)
          .single();
        
        tenantSlug = org?.slug || null;
        console.log('[Middleware] Localhost - Tenant mode from user profile:', tenantId);
      } else {
        console.log('[Middleware] Localhost - Platform Admin mode (no organization)');
      }
    } else {
      console.log('[Middleware] Localhost - No session (unauthenticated)');
    }
  } 
  // Check for custom domain in organizations table
  else if (!hostname.includes('edusitepro')) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, slug, name')
      .eq('custom_domain', hostname)
      .eq('domain_verified', true)
      .single();

    if (org) {
      tenantId = org.id;
      tenantSlug = org.slug;
      console.log('[Middleware] Set tenant ID:', tenantId, `(${org.name} - custom domain)`);
    }
  }
  // Check for subdomain pattern (slug.edusitepro.org.za OR slug.edusitepro.edudashpro.org.za)
  // BUT: bare edusitepro.edudashpro.org.za is the PLATFORM ADMIN domain, not a tenant!
  else if ((hostname.includes('.edusitepro.org.za') || hostname.includes('.edusitepro.edudashpro.org.za')) 
           && hostname !== 'edusitepro.edudashpro.org.za' 
           && !hostname.startsWith('edusitepro.')) {
    const slug = hostname.split('.')[0];
    
    const { data: org } = await supabase
      .from('organizations')
      .select('id, slug, name')
      .eq('slug', slug)
      .single();

    if (org) {
      tenantId = org.id;
      tenantSlug = org.slug;
      console.log('[Middleware] Set tenant ID:', tenantId, `(${org.name} - subdomain: ${slug})`);
    } else {
      console.log('[Middleware] No organization found for slug:', slug);
    }
  }
  // Platform admin domain - NO tenant for /admin, but detect from user for /dashboard
  else if (hostname === 'edusitepro.edudashpro.org.za' || hostname === 'edusitepro.vercel.app') {
    // Platform admins accessing /admin should have no tenant context
    if (path.startsWith('/admin')) {
      console.log('[Middleware] Platform Admin domain (/admin) - NO tenant context');
      // tenantId remains null for platform admin access
    }
    // Tenant admins accessing /dashboard should have their org detected from profile
    else if (path.startsWith('/dashboard')) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.organization_id) {
          tenantId = profile.organization_id;
          
          // Get the org slug for the header
          const { data: org } = await supabase
            .from('organizations')
            .select('slug')
            .eq('id', tenantId)
            .single();
          
          tenantSlug = org?.slug || null;
          console.log('[Middleware] Platform domain (/dashboard) - Tenant from user profile:', tenantId);
        }
      }
    }
  }

  // Set tenant headers if found
  if (tenantId) {
    response.headers.set('x-tenant-id', tenantId);
    response.headers.set('x-organization-slug', tenantSlug || '');
  }

  // Check authentication for admin routes
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect to login if not authenticated
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      console.log('[Middleware] No profile found for user:', session.user.id);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Platform admin (superadmin) should use /admin
    // Tenant admin (principal_admin, organization_admin, etc.) should use /dashboard
    const isPlatformAdmin = profile.role === 'superadmin';
    const isTenantAdmin = ['principal_admin', 'principal', 'admin', 'organization_admin'].includes(profile.role) && profile.organization_id;

    // Block non-superadmins from accessing /admin routes
    if (path.startsWith('/admin')) {
      if (!isPlatformAdmin) {
        console.log('[Middleware] Access denied to /admin - User role:', profile.role);
        // If they're a tenant admin, redirect to their dashboard
        if (isTenantAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Otherwise, show unauthorized error
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }
      console.log('[Middleware] SuperAdmin access granted to /admin');
    }

    // Redirect platform admins from /dashboard to /admin
    if (path.startsWith('/dashboard') && isPlatformAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Block users without proper role from accessing /dashboard
    if (path.startsWith('/dashboard') && !isTenantAdmin && !isPlatformAdmin) {
      console.log('[Middleware] Access denied to /dashboard - User role:', profile.role);
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Include API routes for tenant context
    '/api/:path*',
    // Include all other routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
