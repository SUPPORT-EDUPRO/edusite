import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAdmin } from '@/lib/auth-helpers';

/**
 * Temporary authentication guard using INTERNAL_ADMIN_TOKEN
 * This will be replaced with Supabase Auth + RBAC in Option 2
 */
export function requireAdminToken(request: NextRequest): NextResponse | null {
  // Prefer Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  // Fallback: x-admin-token header
  if (!token) {
    token = request.headers.get('x-admin-token') || undefined;
  }

  // Dev fallback: allow missing token in non-production to unblock local UI wiring
  if (!token && process.env.NODE_ENV !== 'production') {
    return null;
  }

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: 'Invalid authorization token' }, { status: 403 });
  }

  return null; // Authentication passed
}

/** Constant-time comparison; an unset INTERNAL_ADMIN_TOKEN never matches anything. */
function isValidAdminToken(token: string | undefined): boolean {
  const expected = process.env.INTERNAL_ADMIN_TOKEN;
  if (!token || !expected) return false;
  const given = Buffer.from(token);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/**
 * Guard for routes called both by server tools (INTERNAL_ADMIN_TOKEN) and by the signed-in
 * admin screens (a verified admin or super admin session). Unlike requireAdminToken it has no
 * development bypass, so a missing credential is always rejected.
 */
export async function requireAdminTokenOrSession(
  request: Pick<Request, 'headers'>,
): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  const token =
    authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-admin-token') || undefined;
  if (token && isValidAdminToken(token)) return null;

  const admin = await verifyAdmin();
  if (admin) return null;

  return NextResponse.json(
    { error: token ? 'Invalid authorization token' : 'Authentication required' },
    { status: token ? 403 : 401 },
  );
}

/**
 * Generate a unique request ID for logging
 */
export function getRequestId(request: NextRequest): string {
  return (
    request.headers.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

/**
 * Log an error with request context
 */
export function logError(requestId: string, context: string, error: unknown): void {
  console.error(`[${requestId}] ${context}:`, error);
}
