import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  RegistrationInputError,
  submitYoungEagles2027Application,
} from '@/lib/submit-public-registration';
import { getServiceRoleClient } from '@/lib/supabase';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 6;
const recentSubmissions = new Map<string, number[]>();

/** Best-effort per-instance throttle; the duplicate-child check is the durable guard. */
function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (recentSubmissions.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  recentSubmissions.set(key, recent);
  if (recentSubmissions.size > 500) {
    for (const [mapKey, times] of recentSubmissions) {
      if (times.every((time) => now - time >= WINDOW_MS)) recentSubmissions.delete(mapKey);
    }
  }
  return recent.length > MAX_SUBMISSIONS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please wait a few minutes and try again.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The registration form was empty.' }, { status: 400 });
  }

  try {
    // The tenant, fee and campaign are decided on the server; only `values` is read from the body.
    const values = (body as { values?: unknown } | null)?.values;
    const supabase = getServiceRoleClient();
    const registration = await submitYoungEagles2027Application(supabase, values);

    // Staff notification is best effort: a delivery problem must never lose a saved application.
    try {
      const { error: notificationError } = await supabase.functions.invoke(
        'notifications-dispatcher',
        {
          body: {
            event_type: 'child_registration_submitted',
            preschool_id: YOUNG_EAGLES_ORGANIZATION_ID,
            registration_id: registration.id,
            child_name: registration.childName,
            parent_name: registration.guardianName,
            send_immediately: true,
          },
        },
      );
      if (notificationError) {
        console.error('[Registration notification]', notificationError.message);
      }
    } catch (notificationError) {
      console.error('[Registration notification]', notificationError);
    }
    return NextResponse.json({ success: true, registration }, { status: 200 });
  } catch (error) {
    if (error instanceof RegistrationInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : '';
    console.error('[Registration Submit API]', error);
    if (message.startsWith('A registration for ')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'We could not save your registration. Please try again or contact the school.' },
      { status: 500 },
    );
  }
}
