/**
 * Organization Welcome Email Template
 * 
 * Branded email template for new organization approvals
 */

interface OrganizationWelcomeEmailProps {
  organizationName: string;
  recipientName: string;
  eduSiteProLink: string;
  eduDashProLink?: string;
}

export function OrganizationWelcomeEmail({
  organizationName,
  recipientName,
  eduSiteProLink,
  eduDashProLink,
}: OrganizationWelcomeEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EduPro Platform</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🎉 Welcome to EduPro!
              </h1>
              <p style="margin: 12px 0 0 0; color: #fef3c7; font-size: 16px;">
                Your organization has been approved
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #1c1917; font-size: 18px; line-height: 1.6;">
                Hi <strong>${recipientName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #44403c; font-size: 16px; line-height: 1.6;">
                Congratulations! Your organization <strong style="color: #d97706;">${organizationName}</strong> has been successfully approved on the EduPro platform.
              </p>

              <p style="margin: 0 0 32px 0; color: #44403c; font-size: 16px; line-height: 1.6;">
                <strong>Next Step:</strong> Click the buttons below to set your password and log in. Each platform requires its own password setup.
              </p>

              <!-- Platform Cards -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 12px 0; color: #78350f; font-size: 18px; font-weight: 600;">
                      📊 EduSitePro
                    </h3>
                    <p style="margin: 0 0 20px 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                      Manage your website, registrations, and public-facing content
                    </p>
                    <a href="${eduSiteProLink}" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);">
                      Set Password & Access Admin →
                    </a>
                  </td>
                </tr>
              </table>

              ${eduDashProLink ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px; font-weight: 600;">
                      👨‍👩‍👧‍👦 EduDashPro
                    </h3>
                    <p style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 14px; line-height: 1.5;">
                      Communicate with parents, manage classes, and track student progress
                    </p>
                    <a href="${eduDashProLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                      Set Password & Access Portal →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Getting Started Section -->
              <div style="background-color: #f5f5f4; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
                  🚀 Getting Started
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #44403c; font-size: 14px; line-height: 1.8;">
                  <li>Click the buttons above to set your password</li>
                  <li>Complete your organization profile</li>
                  <li>Add your campus information and staff members</li>
                  <li>Customize your registration forms</li>
                  <li>Start accepting student applications</li>
                </ul>
              </div>

              <!-- Support Section -->
              <div style="border-top: 2px solid #e7e5e4; padding-top: 24px;">
                <p style="margin: 0 0 12px 0; color: #44403c; font-size: 14px; line-height: 1.6;">
                  <strong>Need help?</strong> Our support team is here to assist you:
                </p>
                <p style="margin: 0; color: #78716c; font-size: 14px;">
                  📧 Email: <a href="mailto:support@edudashpro.org.za" style="color: #d97706; text-decoration: none;">support@edudashpro.org.za</a><br>
                  📱 WhatsApp: <a href="https://wa.me/27674770975" style="color: #d97706; text-decoration: none;">+27 67 477 0975</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; padding: 32px 40px; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0 0 8px 0; color: #78716c; font-size: 13px;">
                You're receiving this email because your organization was approved on EduPro.
              </p>
              <p style="margin: 0 0 16px 0; color: #a8a29e; font-size: 12px;">
                © 2025 EduPro Platform | Empowering Early Childhood Development
              </p>
              <div style="margin-top: 16px;">
                <a href="https://edudashpro.org.za" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #d6d3d1;">|</span>
                <a href="https://edusitepro.edudashpro.org.za/help" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #d6d3d1;">|</span>
                <a href="https://edusitepro.edudashpro.org.za/terms" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default OrganizationWelcomeEmail;
