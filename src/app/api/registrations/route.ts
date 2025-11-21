import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

/**
 * Server-side registration endpoint.
 * Uses the anon key with RLS policies for secure public registration submissions.
 *
 * Security Model:
 * - Uses supabase client with anon key (not service role)
 * - RLS policies on registration_requests table allow public inserts
 * - Server-side validation before database insert
 * - No sensitive data exposure (service role key not needed)
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Minimal server validation
    const required = [
      'organization_id',
      'student_first_name',
      'student_last_name',
      'guardian_name',
      'guardian_email',
    ];
    for (const key of required) {
      if (!payload[key]) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    const insertPayload = {
      organization_id: payload.organization_id,
      student_first_name: payload.student_first_name,
      student_last_name: payload.student_last_name,
      student_dob: payload.student_dob || null,
      student_gender: payload.student_gender || null,
      guardian_name: payload.guardian_name,
      guardian_email: payload.guardian_email,
      guardian_phone: payload.guardian_phone || null,
      guardian_address: payload.guardian_address || null,
      preferred_class: payload.preferred_class || null,
      preferred_start_date: payload.preferred_start_date || null,
      referral_source: payload.referral_source || null,
      early_bird: payload.early_bird || false,
      message: payload.message || null,
      submission_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('registration_requests')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally fetch centre info for notifications (future enhancement)
    // For now, just return success

    return NextResponse.json({ success: true, registration: data }, { status: 200 });
  } catch (err) {
    console.error('Registration route error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
