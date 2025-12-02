import { NextRequest, NextResponse } from 'next/server';

import { generateRegistrationConfirmation } from '@/lib/email-templates/registration-confirmation';

/**
 * POST /api/registrations/send-confirmation
 * 
 * Sends a confirmation email to parents after registration submission
 */
export async function POST(request: NextRequest) {
  try {
    const {
      parentEmail,
      parentName,
      studentName,
      schoolName,
      registrationFee,
      discountApplied,
      discountAmount,
      registrationId,
      paymentReference,
      organizationSlug,
    } = await request.json();

    if (!parentEmail || !parentName || !studentName || !registrationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine FROM email based on organization
    // Map organization slugs to their verified email domains
    const orgEmailMap: Record<string, string> = {
      // 'young-eagles': 'noreply@youngeagles.org.za', // Verify domain in Resend first
      // Add more organizations as they verify their domains in Resend
      // 'another-school': 'noreply@anotherschool.org.za',
    };

    const fromEmail = orgEmailMap[organizationSlug || ''] || 'noreply@edudashpro.org.za';

    // Generate unique payment reference if not provided
    const reference = paymentReference || `REG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const finalAmount = registrationFee || 300;

    // Generate confirmation email using template
    const { subject, html: emailHtml } = generateRegistrationConfirmation({
      parentName,
      parentEmail,
      studentName,
      schoolName,
      registrationId,
      registrationFee: finalAmount,
      discountApplied: discountApplied || false,
      originalFee: 400,
      paymentReference: reference,
    });

    // Call send-email Edge Function
    // Call send-email Edge Function
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to: parentEmail,
          from: fromEmail, // Dynamic sender based on organization
          subject,
          body: emailHtml,
          is_html: true,
          confirmed: true,
        }),
      }
    );

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error('Failed to send confirmation email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Confirmation email sent successfully to:', parentEmail);

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
