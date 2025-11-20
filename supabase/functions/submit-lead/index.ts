// Supabase Edge Function: Submit Lead
// Handles bulk quote form submissions with hCaptcha validation and email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LeadFormData {
  contactName: string;
  email: string;
  phone?: string;
  centreCount: number;
  provinces: string[];
  preferredLanguages: string[];
  message?: string;
  interestedInEduDashPro?: boolean;
  captchaToken: string;
}

// Verify hCaptcha token
async function verifyHCaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${token}&secret=${secretKey}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification failed:', error);
    return false;
  }
}

// Calculate estimated value
function calculateEstimatedValue(centreCount: number): number {
  if (centreCount === 1) return 2999 + 199 * 12;
  if (centreCount <= 5) return 11995 + 179 * 12 * centreCount;
  if (centreCount <= 10) return 19990 + 159 * 12 * centreCount;
  return centreCount * (1999 + 149 * 12);
}

// Send email via Resend
async function sendEmail(
  data: LeadFormData,
  leadId: string,
  estimatedValue: number,
  resendApiKey: string,
) {
  const emailTo = Deno.env.get('MARKETING_LEADS_EMAIL_TO') || 'leads@edudashpro.org.za';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EduSitePro Leads <leads@edudashpro.org.za>',
        to: emailTo,
        reply_to: data.email,
        subject: `New Lead: ${data.centreCount} Centre${data.centreCount > 1 ? 's' : ''} - ${data.contactName}`,
        html: generateEmailHTML(data, leadId, estimatedValue),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Generate HTML email
function generateEmailHTML(data: LeadFormData, leadId: string, estimatedValue: number): string {
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
            <div>${data.contactName}</div>
          </div>

          <div class="field">
            <div class="label">Email</div>
            <div><a href="mailto:${data.email}">${data.email}</a></div>
          </div>

          ${
            data.phone
              ? `
          <div class="field">
            <div class="label">Phone</div>
            <div><a href="tel:${data.phone}">${data.phone}</a></div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="label">Provinces</div>
            <div>${data.provinces.map((p) => p.replace('-', ' ').toUpperCase()).join(', ')}</div>
          </div>

          <div class="field">
            <div class="label">Preferred Languages</div>
            <div>${data.preferredLanguages.map((l) => l.toUpperCase()).join(', ')}</div>
          </div>

          ${
            data.interestedInEduDashPro
              ? `
          <div class="field">
            <div class="label">🚀 EduDash Pro Interest</div>
            <div style="color: #059669; font-weight: bold;">YES - Cross-sell opportunity!</div>
          </div>
          `
              : ''
          }

          ${
            data.message
              ? `
          <div class="field">
            <div class="label">Message</div>
            <div style="white-space: pre-wrap;">${data.message}</div>
          </div>
          `
              : ''
          }
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get secrets from Supabase Edge Function environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hcaptchaSecretKey = Deno.env.get('HCAPTCHA_SECRET_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const data: LeadFormData = await req.json();

    // Validate required fields
    if (!data.contactName || !data.email || !data.centreCount || !data.captchaToken) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify hCaptcha
    const captchaValid = await verifyHCaptcha(data.captchaToken, hcaptchaSecretKey);
    if (!captchaValid) {
      return new Response(
        JSON.stringify({ success: false, message: 'Captcha verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Calculate estimated value
    const estimatedValue = calculateEstimatedValue(data.centreCount);

    // Get client info from headers
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');
    const referrer = req.headers.get('referer');

    // Store lead in database
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
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store lead in database');
    }

    const leadId = leadData.id;

    // Send email notification
    await sendEmail(data, leadId, estimatedValue, resendApiKey);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request received! We'll contact you within 24 hours.",
        leadId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
