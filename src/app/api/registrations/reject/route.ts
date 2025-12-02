import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { registrationId, reason } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const authClient = createClient();
    const { data: { session } } = await authClient.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for database operations
    const supabase = getServiceRoleClient();

    // Get the registration
    const { data: registration, error: fetchError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update registration status to rejected
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Not specified',
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
    console.error('Rejection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject registration' },
      { status: 500 }
    );
  }
}
