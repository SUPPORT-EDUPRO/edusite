import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { sendPasswordResetEmail } from '@/lib/email/service';

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
    // The action_link from generateLink already includes the code and redirects correctly
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (resetError) {
      console.error('[Forgot Password] Error generating reset link:', resetError);
      return NextResponse.json(
        { error: 'Failed to send reset link. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Forgot Password] Reset link generated for:', email);
    
    // Extract the action link (this is the actual magic link that includes the token)
    const resetLink = resetData?.properties?.action_link;
    
    if (!resetLink) {
      console.error('[Forgot Password] No action link in response');
      return NextResponse.json(
        { error: 'Failed to generate reset link. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Forgot Password] Action link generated successfully');

    // Send the password reset email
    try {
      const emailResult = await sendPasswordResetEmail({
        to: email,
        resetLink: resetLink,
      });
      
      console.log('[Forgot Password] Email sent via:', emailResult.provider);
      if (emailResult.id) {
        console.log('[Forgot Password] Email ID:', emailResult.id);
      }
    } catch (emailError: any) {
      console.error('[Forgot Password] Failed to send email:', emailError);
      // Continue even if email fails - the link was generated
      // In production, you might want to return an error here
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again or contact support.' },
        { status: 500 }
      );
    }
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
