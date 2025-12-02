import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrationId, verified } = await req.json();

    if (!registrationId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: registrationId, verified' },
        { status: 400 }
      );
    }

    // Update payment verification status
    const { data, error } = await supabase
      .from('registration_requests')
      .update({ 
        payment_verified: verified,
        payment_date: verified ? new Date().toISOString() : null
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error('Error verifying payment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: verified ? 'Payment verified successfully' : 'Payment verification removed'
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
