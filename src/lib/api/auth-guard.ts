import { NextRequest, NextResponse } from 'next/server';

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

  if (token !== process.env.INTERNAL_ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Invalid authorization token' }, { status: 403 });
  }

  return null; // Authentication passed
}

/**
 * Generate a unique request ID for logging
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Log an error with request context
 */
export function logError(requestId: string, context: string, error: unknown): void {
  console.error(`[${requestId}] ${context}:`, error);
}
