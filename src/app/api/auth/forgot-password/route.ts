import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      // Don't reveal if user exists or not for security
      console.log('[Forgot Password] User not found:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate password reset link
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`;
    
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (resetError) {
      console.error('[Forgot Password] Error generating reset link:', resetError);
      return NextResponse.json(
        { error: 'Failed to send reset link. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Forgot Password] Reset link generated for:', email);
    console.log('[Forgot Password] Redirect URL:', redirectUrl);
    console.log('[Forgot Password] Reset link:', resetData?.properties?.action_link);

    // Supabase will automatically send the email
    return NextResponse.json({
      success: true,
      message: 'Password reset link sent successfully.',
    });

  } catch (error: any) {
    console.error('[Forgot Password] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
