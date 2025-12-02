/**
 * Password Reset Email Template
 * 
 * Branded email template for password reset requests
 */

interface PasswordResetEmailProps {
  recipientEmail: string;
  resetLink: string;
}

export function PasswordResetEmail({
  recipientEmail,
  resetLink,
}: PasswordResetEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
                🔑 Reset Your Password
              </h1>
              <p style="margin: 12px 0 0 0; color: #fef3c7; font-size: 16px;">
                EduSitePro Admin Portal
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #1c1917; font-size: 18px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #44403c; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your account associated with <strong style="color: #d97706;">${recipientEmail}</strong>.
              </p>

              <p style="margin: 0 0 32px 0; color: #44403c; font-size: 16px; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for security reasons.
              </p>

              <!-- Reset Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="text-align: center; padding: 24px; background-color: #fef3c7; border-radius: 8px;">
                    <a href="${resetLink}" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);">
                      Reset My Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                <p style="margin: 0 0 12px 0; color: #78350f; font-size: 15px; font-weight: 600;">
                  ⚠️ Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>

              <!-- Alternative Link -->
              <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #44403c; font-size: 13px; font-weight: 600;">
                  Button not working? Copy and paste this link:
                </p>
                <p style="margin: 0; color: #78716c; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                  ${resetLink}
                </p>
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
                You're receiving this email because a password reset was requested for your account.
              </p>
              <p style="margin: 0 0 16px 0; color: #a8a29e; font-size: 12px;">
                © 2025 EduSitePro | Powered by EduDashPro
              </p>
              <div style="margin-top: 16px;">
                <a href="https://edudashpro.org.za" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #d6d3d1;">|</span>
                <a href="https://edusitepro.edudashpro.org.za/help" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #d6d3d1;">|</span>
                <a href="https://wa.me/27674770975" style="color: #d97706; text-decoration: none; font-size: 12px; margin: 0 8px;">Support</a>
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

export default PasswordResetEmail;
