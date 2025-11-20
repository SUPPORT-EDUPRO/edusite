import { type CookieOptions,createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getCentreByDomain } from '@/lib/tenancy';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  console.log('[Middleware] Request:', path, '| Host:', hostname);

  // Check authentication for admin routes
  if (path.startsWith('/admin')) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

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
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect to login if not authenticated
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // For localhost development, use Young Eagles as default tenant
  if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    const response = NextResponse.next();
    const tenantId = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef'; // Young Eagles
    response.headers.set('x-tenant-id', tenantId);
    console.log('[Middleware] Set tenant ID:', tenantId, '(Young Eagles)');
    return response;
  }

  // Marketing site (production)
  if (hostname === 'www.edusitepro.co.za' || hostname === 'edusitepro.co.za') {
    // Let the default app routes handle this
    return NextResponse.next();
  }

  // Admin portal (subdomain)
  if (hostname === 'admin.edusitepro.co.za') {
    // Route to admin pages
    return NextResponse.next();
  }

  // Client portal (subdomain)
  if (hostname === 'portal.edusitepro.co.za') {
    // Route to portal pages
    return NextResponse.next();
  }

  // Centre sites (*.sites.edusitepro.co.za or custom domains)
  try {
    const centre = await getCentreByDomain(hostname);

    if (centre) {
      // Store centre ID in header for use by pages
      const response = NextResponse.next();
      response.headers.set('x-tenant-id', centre.id);
      return response;
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // Default - let Next.js handle routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include API routes for tenant context
    '/api/:path*',
    // Include all other routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
