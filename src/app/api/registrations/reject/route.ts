import { NextRequest, NextResponse } from 'next/server';

import {
  assertCanManageSchool,
  registrationAuthErrorResponse,
  requireRegistrationStaff,
} from '@/lib/registration-staff-auth';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { registrationId, reason } = await request.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const staff = await requireRegistrationStaff();

    // Use service role client for database operations
    const supabase = getServiceRoleClient();

    // Get the registration
    const { data: registration, error: fetchError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    assertCanManageSchool(staff, registration.organization_id);

    if (registration.status === 'approved') {
      return NextResponse.json(
        { error: 'An approved registration cannot be rejected.' },
        { status: 409 },
      );
    }

    // Update registration status to rejected
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        rejection_reason:
          typeof reason === 'string' && reason.trim()
            ? reason.trim().slice(0, 500)
            : 'Not specified',
        reviewed_by: staff.userId,
        reviewed_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (updateError) {
      throw updateError;
    }

    // TODO: Send rejection email to parent
    // You can implement this using the send-email Edge Function

    return NextResponse.json({
      success: true,
      message: 'Registration rejected successfully',
    });
  } catch (error: any) {
    const authResponse = registrationAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Rejection error:', error);
    return NextResponse.json({ error: 'Failed to reject registration' }, { status: 500 });
  }
}
