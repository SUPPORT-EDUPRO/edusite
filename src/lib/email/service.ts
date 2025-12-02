/**
 * Email Service using Resend API
 * 
 * Install: npm install resend
 * Get API key from: https://resend.com
 */

import { OrganizationWelcomeEmail } from './templates/organization-welcome';

interface SendOrganizationWelcomeParams {
  to: string;
  organizationName: string;
  recipientName: string;
  eduSiteProLink: string;
  eduDashProLink?: string;
}

export async function sendOrganizationWelcomeEmail(params: SendOrganizationWelcomeParams) {
  const { to, organizationName, recipientName, eduSiteProLink, eduDashProLink } = params;

  const html = OrganizationWelcomeEmail({
    organizationName,
    recipientName,
    eduSiteProLink,
    eduDashProLink,
  });

  // Option 1: Using Resend API (recommended)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EduPro Platform <noreply@edudashpro.org.za>',
          to: [to],
          subject: `🎉 Welcome to EduPro - ${organizationName} Approved!`,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[Email] Sent via Resend:', data.id);
      return { success: true, provider: 'resend', id: data.id };
    } catch (error) {
      console.error('[Email] Resend error:', error);
      throw error;
    }
  }

  // Option 2: Using SendGrid (fallback)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@edudashpro.org.za', name: 'EduPro Platform' },
          subject: `🎉 Welcome to EduPro - ${organizationName} Approved!`,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      console.log('[Email] Sent via SendGrid');
      return { success: true, provider: 'sendgrid' };
    } catch (error) {
      console.error('[Email] SendGrid error:', error);
      throw error;
    }
  }

  // Option 3: Log to console (development fallback)
  console.log('[Email] No email provider configured, logging email:');
  console.log('To:', to);
  console.log('Subject:', `🎉 Welcome to EduPro - ${organizationName} Approved!`);
  console.log('EduSitePro Link:', eduSiteProLink);
  console.log('EduDashPro Link:', eduDashProLink);
  console.log('HTML Preview:', html.substring(0, 200) + '...');

  return { success: true, provider: 'console', warning: 'No email service configured' };
}
