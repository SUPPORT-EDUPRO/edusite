/**
 * Registration Confirmation Email Template
 * 
 * Sent immediately after a parent submits a registration.
 * Provides next steps and important information about the approval process.
 */

interface RegistrationConfirmationData {
  parentName: string;
  parentEmail: string;
  studentName: string;
  schoolName: string;
  registrationId: string;
  registrationFee?: number;
  discountApplied?: boolean;
  originalFee?: number;
  paymentReference?: string;
}

export function generateRegistrationConfirmation(data: RegistrationConfirmationData): { subject: string; html: string; text: string } {
  const {
    parentName,
    parentEmail,
    studentName,
    schoolName,
    registrationId,
    registrationFee = 300,
    discountApplied = false,
    originalFee = 300,
    paymentReference,
  } = data;

  // Shorten payment reference to last 12 characters for display
  const shortReference = paymentReference ? paymentReference.slice(-12) : registrationId.slice(-12);

  const subject = `✅ Registration Received - Next Steps Required`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Registration Received!</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Thank you for choosing ${schoolName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear ${parentName},
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                We've successfully received your registration for <strong>${studentName}</strong>. Your application is now under review.
              </p>

              <!-- Registration Fee -->
              <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #555555; font-size: 14px;">
                      <strong>Registration Reference:</strong><br>
                      <span style="color: #667eea; font-size: 18px; font-family: 'Courier New', monospace; font-weight: bold;">${shortReference}</span>
                    </p>
                    <p style="margin: 15px 0 0; color: #555555; font-size: 14px;">
                      <strong>Registration Fee:</strong><br>
                      ${discountApplied 
                        ? `<span style="text-decoration: line-through; color: #999; font-size: 14px;">R${originalFee.toFixed(2)}</span> <span style="color: #28a745; font-size: 20px; font-weight: bold;">R${registrationFee.toFixed(2)}</span> <span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">50% OFF</span>`
                        : `<span style="color: #333; font-size: 20px; font-weight: bold;">R${registrationFee.toFixed(2)}</span>`
                      }
                    </p>
                  </td>
                </tr>
              </table>

              <!-- IMPORTANT: Proof of Payment Required -->
              <table role="presentation" style="width: 100%; background-color: #fff3cd; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #ffc107;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px; color: #856404; font-size: 20px; font-weight: 700;">⚠️ IMPORTANT: Action Required</h2>
                    <p style="margin: 0 0 15px; color: #555555; font-size: 15px; line-height: 1.7; font-weight: 600;">
                      Your registration <strong>CANNOT be approved</strong> without proof of payment.
                    </p>
                    <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                      Please upload your proof of payment as soon as possible to avoid delays in processing your application. Your child's enrollment will only be confirmed once payment has been verified.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h2 style="margin: 30px 0 20px; color: #333333; font-size: 20px; font-weight: 600;">📋 Next Steps</h2>
              
              <ol style="margin: 0 0 30px; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 15px;">
                  <strong>Make Your Payment</strong><br>
                  <span style="font-size: 14px; color: #666;">Transfer the registration fee to the school's bank account (details provided separately)</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Upload Proof of Payment</strong><br>
                  <span style="font-size: 14px; color: #666;">Log in to your registration dashboard and upload your bank transfer receipt or proof of payment</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Wait for Verification</strong><br>
                  <span style="font-size: 14px; color: #666;">Our admin team will verify your payment (usually within 1-2 business days)</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Receive Approval</strong><br>
                  <span style="font-size: 14px; color: #666;">Once verified, we'll approve your registration and send you login credentials for the EduDash Pro app</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Download the App</strong><br>
                  <span style="font-size: 14px; color: #666;">Use your credentials to access homework, attendance tracking, and communicate with teachers</span>
                </li>
              </ol>

              <!-- Monthly Pricing Information -->
              <table role="presentation" style="width: 100%; background-color: #f3e5f5; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #9c27b0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px; color: #6a1b9a; font-size: 16px; font-weight: 600;">💰 Monthly Fee Structure</h3>
                    <table role="presentation" style="width: 100%; background-color: #ffffff; border-radius: 6px; padding: 15px; margin: 10px 0;">
                      <tr>
                        <td>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 2px solid #f5f5f5;">
                              <td style="padding: 12px 8px; color: #6a1b9a; font-size: 13px; font-weight: 600;">Age Group</td>
                              <td style="padding: 12px 8px; color: #6a1b9a; font-size: 13px; font-weight: 600; text-align: right;">Monthly Fee</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f5f5f5;">
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px;">6 months - 1 year</td>
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">R850.00</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f5f5f5;">
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px;">1 - 3 years</td>
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">R720.00</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px;">4 - 6 years</td>
                              <td style="padding: 10px 8px; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">R680.00</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0; color: #555555; font-size: 12px; font-style: italic;">
                      💡 Monthly fees are charged in addition to the one-time registration fee.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Payment Banking Details Box -->
              <table role="presentation" style="width: 100%; background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #4caf50;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px; color: #2e7d32; font-size: 16px; font-weight: 600;">💳 Payment Instructions</h3>
                    <p style="margin: 0 0 15px; color: #555555; font-size: 14px; line-height: 1.6;">
                      Please make your payment using the following banking details:
                    </p>
                    <table role="presentation" style="width: 100%; background-color: #ffffff; border-radius: 6px; padding: 15px; margin: 10px 0;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px; color: #2e7d32; font-size: 13px; font-weight: 600;">Bank:</p>
                          <p style="margin: 0 0 12px; color: #333333; font-size: 15px; font-family: 'Courier New', monospace;">FNB</p>
                          
                          <p style="margin: 0 0 8px; color: #2e7d32; font-size: 13px; font-weight: 600;">Account Number:</p>
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <p style="margin: 0; color: #333333; font-size: 15px; font-family: 'Courier New', monospace; flex: 1;">62777403181</p>
                            <button onclick="navigator.clipboard.writeText('62777403181'); this.innerHTML='✓ Copied!'; setTimeout(() => this.innerHTML='📋 Copy', 2000);" style="background: #2e7d32; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; white-space: nowrap;">📋 Copy</button>
                          </div>
                          
                          <p style="margin: 0 0 8px; color: #2e7d32; font-size: 13px; font-weight: 600;">Account Name:</p>
                          <p style="margin: 0 0 12px; color: #333333; font-size: 15px; font-family: 'Courier New', monospace;">Young Eagles Home Care Centre</p>
                          
                          <p style="margin: 0 0 8px; color: #2e7d32; font-size: 13px; font-weight: 600;">Payment Reference (IMPORTANT):</p>
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
                            <p style="margin: 0; color: #d32f2f; font-size: 15px; font-family: 'Courier New', monospace; font-weight: 700; flex: 1;">${registrationId}</p>
                            <button onclick="navigator.clipboard.writeText('${registrationId}'); this.innerHTML='✓ Copied!'; setTimeout(() => this.innerHTML='📋 Copy', 2000);" style="background: #d32f2f; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; white-space: nowrap;">📋 Copy</button>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; margin: 15px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 13px; font-weight: 600;">
                        ⚠️ CRITICAL: Use <span style="font-family: 'Courier New', monospace;">${registrationId}</span> as your payment reference. This links your payment to your registration.
                      </p>
                    </div>
                    <div style="background-color: #e3f2fd; border-left: 3px solid #2196f3; padding: 12px; margin: 15px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px; color: #0d47a1; font-size: 13px; font-weight: 600;">💳 Payment Method Fees:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #1565c0; font-size: 12px; line-height: 1.8;">
                        <li><strong>Bank Transfer (EFT):</strong> FREE ✅</li>
                        <li><strong>ATM Deposit:</strong> +R20.00 processing fee</li>
                        <li><strong>Cash Payment:</strong> +R20.00 handling fee</li>
                      </ul>
                    </div>
                    <p style="margin: 15px 0 0; color: #555555; font-size: 13px; font-style: italic;">
                      📧 Keep your proof of payment ready to upload after making the transfer.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Timeline -->
              <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">⏱️ Expected Timeline</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                      <li>Payment verification: 1-2 business days after upload</li>
                      <li>Approval & account creation: Within 24 hours of verification</li>
                      <li>Welcome email with login details: Immediately after approval</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <table role="presentation" style="width: 100%; background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #2196f3;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px; color: #0d47a1; font-size: 16px; font-weight: 600;">💬 Need Help?</h3>
                    <p style="margin: 0 0 15px; color: #555555; font-size: 14px; line-height: 1.6;">
                      If you have questions about payment, the registration process, or need assistance uploading your proof of payment, please contact:
                    </p>
                    <div style="margin: 15px 0;">
                      <p style="margin: 0 0 8px; color: #555555; font-size: 14px;">
                        📧 <a href="mailto:admin@youngeagles.org.za" style="color: #667eea; text-decoration: none;">admin@youngeagles.org.za</a>
                      </p>
                      <p style="margin: 0 0 8px; color: #555555; font-size: 14px;">
                        📞 <a href="tel:+27604828855" style="color: #667eea; text-decoration: none;">+27 60 482 8855</a> / <a href="tel:+27820673133" style="color: #667eea; text-decoration: none;">+27 82 067 3133</a>
                      </p>
                      <a href="https://wa.me/27604828855?text=Hi%2C%20I%20have%20a%20question%20about%20my%20registration%20(${registrationId})" style="display: inline-block; margin-top: 12px; background-color: #25D366; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        💬 Chat on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for choosing ${schoolName}. We look forward to welcoming ${studentName} to our learning community!
              </p>

              <p style="margin: 20px 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>${schoolName} Admin Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px;">
                © ${new Date().getFullYear()} ${schoolName} powered by EduDash Pro
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                This is an automated confirmation email for registration reference: ${registrationId}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
REGISTRATION RECEIVED - ACTION REQUIRED

Dear ${parentName},

We've successfully received your registration for ${studentName} at ${schoolName}.

Registration Reference: ${registrationId}

⚠️ IMPORTANT: PROOF OF PAYMENT REQUIRED
---------------------------------------
Your registration CANNOT be approved without proof of payment. Please upload your proof of payment as soon as possible to avoid delays.

NEXT STEPS
----------
1. Make Your Payment
   - Transfer the registration fee to the school's bank account

2. Upload Proof of Payment
   - Log in to your registration dashboard
   - Upload your bank transfer receipt

3. Wait for Verification
   - Our admin team will verify your payment (1-2 business days)

4. Receive Approval
   - Once verified, we'll send you login credentials for EduDash Pro

5. Download the App
   - Access homework, attendance, and teacher communication

MONTHLY FEE STRUCTURE
--------------------
6 months - 1 year: R850.00/month
1 - 3 years: R720.00/month
4 - 6 years: R680.00/month

Note: Monthly fees are charged in addition to the one-time registration fee.

PAYMENT INSTRUCTIONS
-------------------
Please make your payment using the following banking details:

Bank: FNB
Account Number: 62777403181
Account Name: Young Eagles Home Care Centre

⚠️ IMPORTANT: Use ${registrationId} as your payment reference!
This links your payment to your registration.

PAYMENT METHOD FEES:
- Bank Transfer (EFT): FREE ✅
- ATM Deposit: +R20.00 processing fee
- Cash Payment: +R20.00 handling fee

EXPECTED TIMELINE
----------------
- Payment verification: 1-2 business days after upload
- Approval & account creation: Within 24 hours of verification
- Welcome email with login details: Immediately after approval

NEED HELP?
----------
Contact: admin@youngeagles.org.za
Phone: +27 60 482 8855 / +27 82 067 3133
WhatsApp: https://wa.me/27604828855

Thank you for choosing ${schoolName}. We look forward to welcoming ${studentName}!

Best regards,
${schoolName} Admin Team

© ${new Date().getFullYear()} ${schoolName} powered by EduDash Pro
Registration Reference: ${registrationId}
  `.trim();

  return { subject, html, text };
}
