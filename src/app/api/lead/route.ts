import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { getServiceRoleClient } from '@/lib/supabase';
import { leadFormSchema } from '@/lib/validation';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Verify hCaptcha token
 */
async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;

  if (!secret) {
    console.error('HCAPTCHA_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${token}&secret=${secret}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification failed:', error);
    return false;
  }
}

/**
 * POST /api/lead - Submit lead/quote request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = leadFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Verify hCaptcha
    const captchaValid = await verifyHCaptcha(data.captchaToken);

    if (!captchaValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Captcha verification failed. Please try again.',
        },
        { status: 400 },
      );
    }

    // Calculate estimated value
    const estimatedValue = calculateEstimatedValue(data.centreCount);

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;

    // Store lead in database
    let leadId: string | null = null;
    try {
      const supabase = getServiceRoleClient();

      const { data: leadData, error: dbError } = await supabase
        .from('leads')
        .insert({
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone || null,
          centre_count: data.centreCount,
          provinces: data.provinces,
          preferred_languages: data.preferredLanguages,
          message: data.message || null,
          interested_in_edudash_pro: data.interestedInEduDashPro || false,
          estimated_value: estimatedValue,
          status: 'new',
          ip_address: ip,
          user_agent: userAgent,
          referrer: referrer,
          // UTM parameters if available (can be added to form)
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue anyway - don't block email sending
      } else if (leadData) {
        leadId = leadData.id;
        console.log('Lead stored in database:', leadId);
      }
    } catch (dbError) {
      console.error('Failed to store lead in database:', dbError);
      // Continue anyway - don't block email sending
    }

    // Fallback lead ID if database insert failed
    const displayLeadId =
      leadId || `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Send email via Resend
    if (resend) {
      const emailTo = process.env.MARKETING_LEADS_EMAIL_TO || 'leads@edusitepro.co.za';

      try {
        await resend.emails.send({
          from: 'EduSitePro Leads <leads@edusitepro.co.za>',
          to: emailTo,
          replyTo: data.email,
          subject: `New Lead: ${data.centreCount} Centre${data.centreCount > 1 ? 's' : ''} - ${data.contactName}`,
          html: generateEmailHTML(data, displayLeadId, estimatedValue),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue anyway - we still want to return success
      }
    } else {
      console.warn('Resend API key not configured - email not sent');
    }

    // Log to PostHog if configured (optional)
    // This would be done client-side in production

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request received! We&apos;ll contact you within 24 hours.',
        leadId: displayLeadId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again or contact us directly.',
      },
      { status: 500 },
    );
  }
}

/**
 * Calculate estimated value based on centre count
 */
function calculateEstimatedValue(centreCount: number): number {
  if (centreCount === 1) return 2999 + 199 * 12; // Solo
  if (centreCount <= 5) return 11995 + 179 * 12 * centreCount; // 5-pack
  if (centreCount <= 10) return 19990 + 159 * 12 * centreCount; // 10-pack
  return centreCount * (1999 + 149 * 12); // Custom pricing for 10+
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(
  data: {
    contactName: string;
    email: string;
    phone?: string | undefined;
    centreCount: number;
    provinces: string[];
    preferredLanguages: string[];
    templates?: string[] | undefined;
    interestedInEduDashPro?: boolean | undefined;
    message?: string | undefined;
  },
  leadId: string,
  estimatedValue: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #059669; }
        .value { margin-top: 5px; }
        .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 New Lead Submission</h1>
          <p style="margin: 5px 0 0 0;">EduSitePro Bulk Quote Request</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>Lead ID:</strong> ${leadId}<br>
            <strong>Estimated Value:</strong> R ${estimatedValue.toLocaleString('en-ZA')}<br>
            <strong>Centre Count:</strong> ${data.centreCount}
          </div>

          <div class="field">
            <div class="label">Contact Name</div>
            <div class="value">${data.contactName}</div>
          </div>

          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>

          ${
            data.phone
              ? `
          <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="label">Number of Centres</div>
            <div class="value">${data.centreCount}</div>
          </div>

          <div class="field">
            <div class="label">Provinces</div>
            <div class="value">${data.provinces.map((p) => p.replace('-', ' ').toUpperCase()).join(', ')}</div>
          </div>

          <div class="field">
            <div class="label">Preferred Languages</div>
            <div class="value">${data.preferredLanguages.map((l) => l.toUpperCase()).join(', ')}</div>
          </div>

          ${
            data.templates && data.templates.length > 0
              ? `
          <div class="field">
            <div class="label">Template Preferences</div>
            <div class="value">${data.templates.join(', ')}</div>
          </div>
          `
              : ''
          }

          ${
            data.interestedInEduDashPro
              ? `
          <div class="field">
            <div class="label">🚀 EduDash Pro Interest</div>
            <div class="value" style="color: #059669; font-weight: bold;">YES - Cross-sell opportunity!</div>
          </div>
          `
              : ''
          }

          ${
            data.message
              ? `
          <div class="field">
            <div class="label">Message</div>
            <div class="value" style="white-space: pre-wrap;">${data.message}</div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="label">Submitted</div>
            <div class="value">${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST</div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">EduSitePro Lead Management System</p>
          <p style="margin: 5px 0 0 0;">🇿🇦 Proudly South African</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
