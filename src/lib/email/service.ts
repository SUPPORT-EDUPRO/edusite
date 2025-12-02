/**
 * Email Service using Resend API
 * 
 * Install: npm install resend
 * Get API key from: https://resend.com
 */

import { OrganizationWelcomeEmail } from './templates/organization-welcome';
import { PasswordResetEmail } from './templates/password-reset';

interface SendOrganizationWelcomeParams {
  to: string;
  organizationName: string;
  recipientName: string;
  eduSiteProLink: string;
  eduDashProLink?: string;
}

interface SendPasswordResetParams {
  to: string;
  resetLink: string;
}

export async function sendOrganizationWelcomeEmail(params: SendOrganizationWelcomeParams) {
  const { to, organizationName, recipientName, eduSiteProLink, eduDashProLink } = params;

  console.log('[Email Service] Starting email send to:', to);
  console.log('[Email Service] Organization:', organizationName);
  console.log('[Email Service] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

  const html = OrganizationWelcomeEmail({
    organizationName,
    recipientName,
    eduSiteProLink,
    eduDashProLink,
  });

  // Option 1: Using Resend API (recommended)
  if (process.env.RESEND_API_KEY) {
    console.log('[Email Service] Using Resend API');
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

      const responseText = await response.text();
      console.log('[Email Service] Resend API response status:', response.status);
      console.log('[Email Service] Resend API response:', responseText);

      if (!response.ok) {
        throw new Error(`Resend API error (${response.status}): ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('[Email Service] Email sent successfully via Resend:', data.id);
      return { success: true, provider: 'resend', id: data.id };
    } catch (error) {
      console.error('[Email Service] Resend error:', error);
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

export async function sendPasswordResetEmail(params: SendPasswordResetParams) {
  const { to, resetLink } = params;

  console.log('[Email Service] Starting password reset email send to:', to);
  console.log('[Email Service] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

  const html = PasswordResetEmail({
    recipientEmail: to,
    resetLink,
  });

  // Option 1: Using Resend API (recommended)
  if (process.env.RESEND_API_KEY) {
    console.log('[Email Service] Using Resend API');
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EduSitePro <noreply@edudashpro.org.za>',
          to: [to],
          subject: '🔑 Reset Your Password - EduSitePro',
          html,
        }),
      });

      const responseText = await response.text();
      console.log('[Email Service] Resend API response status:', response.status);
      console.log('[Email Service] Resend API response:', responseText);

      if (!response.ok) {
        throw new Error(`Resend API error (${response.status}): ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('[Email Service] Password reset email sent successfully via Resend:', data.id);
      return { success: true, provider: 'resend', id: data.id };
    } catch (error) {
      console.error('[Email Service] Resend error:', error);
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
          from: { email: 'noreply@edudashpro.org.za', name: 'EduSitePro' },
          subject: '🔑 Reset Your Password - EduSitePro',
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      console.log('[Email] Password reset email sent via SendGrid');
      return { success: true, provider: 'sendgrid' };
    } catch (error) {
      console.error('[Email] SendGrid error:', error);
      throw error;
    }
  }

  // Option 3: Log to console (development fallback)
  console.log('[Email] No email provider configured, logging password reset email:');
  console.log('To:', to);
  console.log('Subject:', '🔑 Reset Your Password - EduSitePro');
  console.log('Reset Link:', resetLink);
  console.log('HTML Preview:', html.substring(0, 200) + '...');

  return { success: true, provider: 'console', warning: 'No email service configured' };
}
