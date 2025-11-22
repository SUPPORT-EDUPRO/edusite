// Supabase Edge Function: send-email
// Sends emails via Resend for registration confirmations
// Requires RESEND_API_KEY in Supabase secrets

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const DEFAULT_FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@edudashpro.org.za'

interface EmailRequest {
  to: string | string[]
  subject: string
  body: string
  from?: string // Optional: specify sender email for multi-tenant
  is_html?: boolean
  confirmed?: boolean
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const body: EmailRequest = await req.json()

    // Validate required fields
    if (!body.to || !body.subject || !body.body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Require explicit confirmation
    if (!body.confirmed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email sending requires explicit confirmation. Set confirmed: true' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('[send-email] RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please contact administrator.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Resend
    const emailPayload = {
      from: body.from || DEFAULT_FROM_EMAIL,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject: body.subject,
      ...(body.is_html !== false ? { html: body.body } : { text: body.body }),
    }

    console.log('[send-email] Sending email from:', body.from || DEFAULT_FROM_EMAIL, 'to:', body.to)

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('[send-email] Resend API error:', resendData)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: resendData.message || 'Failed to send email',
          details: resendData
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[send-email] Email sent successfully:', resendData.id)

    return new Response(
      JSON.stringify({
        success: true,
        message_id: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[send-email] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
