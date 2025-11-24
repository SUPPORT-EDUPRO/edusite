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
      <td align="center" style="padding: 0;">
        <table role="presentation" style="max-width: 900px; width: 100%; background-color: #ffffff; border-radius: 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">Registration Received!</h1>
              <p style="margin: 15px 0 0; color: #ffffff; font-size: 20px; opacity: 0.95;">Thank you for choosing ${schoolName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              
              <p style="margin: 0 0 25px; color: #333333; font-size: 18px; line-height: 1.6;">
                Dear ${parentName},
              </p>

              <p style="margin: 0 0 25px; color: #333333; font-size: 18px; line-height: 1.6;">
                We've successfully received your registration for <strong>${studentName}</strong>. Your application is now under review.
              </p>

              <!-- To Complete Registration -->
              <div style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; margin: 40px 0; text-align: center;">
                <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 26px; font-weight: 700;">📋 To Complete Your Registration</h2>
                <p style="margin: 0; color: #ffffff; font-size: 18px; opacity: 0.95;">Follow the steps below to finalize your application</p>
              </div>

              <!-- Registration Fee -->
              <div style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 40px 0;">
                <p style="margin: 0 0 15px; color: #555555; font-size: 16px;">
                  <strong>Registration Reference:</strong><br>
                  <span style="color: #667eea; font-size: 24px; font-family: 'Courier New', monospace; font-weight: bold;">${paymentReference || shortReference}</span>
                </p>
                <p style="margin: 20px 0 0; color: #555555; font-size: 16px;">
                  <strong>Registration Fee:</strong><br>
                  ${discountApplied 
                    ? `<span style="text-decoration: line-through; color: #999; font-size: 18px;">R${originalFee.toFixed(2)}</span> <span style="color: #28a745; font-size: 28px; font-weight: bold;">R${registrationFee.toFixed(2)}</span> <span style="background-color: #d4edda; color: #155724; padding: 6px 12px; border-radius: 4px; font-size: 16px; font-weight: bold;">50% OFF</span>`
                    : `<span style="color: #333; font-size: 28px; font-weight: bold;">R${registrationFee.toFixed(2)}</span>`
                  }
                </p>
              </div>

              <!-- Step by Step Instructions -->
              <div style="width: 100%; margin: 40px 0;">
                <div style="background-color: #f8f9fa; border-left: 6px solid #667eea; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 50px; height: 50px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin-bottom: 15px;">1</div>
                  <h3 style="margin: 0 0 12px; color: #333333; font-size: 20px; font-weight: 600;">Make Your Payment</h3>
                  <p style="margin: 0; color: #555555; font-size: 17px; line-height: 1.6;">
                    Transfer <strong style="color: #28a745;">R${registrationFee.toFixed(2)}</strong> to the bank account below using the reference number <strong style="color: #667eea; font-family: 'Courier New', monospace;">${paymentReference || shortReference}</strong>
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-left: 6px solid #28a745; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; width: 50px; height: 50px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin-bottom: 15px;">2</div>
                  <h3 style="margin: 0 0 12px; color: #333333; font-size: 20px; font-weight: 600;">Save Your Proof of Payment</h3>
                  <p style="margin: 0; color: #555555; font-size: 17px; line-height: 1.6;">
                    After making the payment, take a screenshot or save the bank confirmation slip showing the transaction details
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-left: 6px solid #ff9800; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <div style="background: linear-gradient(135deg, #ff9800 0%, #ff6f00 100%); color: white; width: 50px; height: 50px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin-bottom: 15px;">3</div>
                  <h3 style="margin: 0 0 12px; color: #333333; font-size: 20px; font-weight: 600;">Upload Your Proof of Payment</h3>
                  <p style="margin: 0 0 20px; color: #555555; font-size: 17px; line-height: 1.6;">
                    Click the button below to upload your proof of payment. This step is required for approval.
                  </p>
                  <a href="https://edusitepro.edudashpro.org.za/upload-payment?ref=${paymentReference || registrationId}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                    📤 Upload Proof of Payment
                  </a>
                </div>

                <div style="background-color: #f8f9fa; border-left: 6px solid #9c27b0; padding: 30px; border-radius: 8px; text-align: center;">
                  <div style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); color: white; width: 50px; height: 50px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin-bottom: 15px;">4</div>
                  <h3 style="margin: 0 0 12px; color: #333333; font-size: 20px; font-weight: 600;">Wait for Approval</h3>
                  <p style="margin: 0; color: #555555; font-size: 17px; line-height: 1.6;">
                    Our team will verify your payment within <strong>1-2 business days</strong>. Once approved, you'll receive an email with your EduDash Pro login credentials to access your parent dashboard.
                  </p>
                </div>
              </div>

              <!-- Payment Banking Details Box -->
              <div style="width: 95%; max-width: 850px; background-color: #e8f5e9; border-radius: 8px; padding: 30px 10px; margin: 40px auto 40px 0; border-left: 6px solid #4caf50; text-align: center;">
                <h3 style="margin: 0 0 20px; color: #2e7d32; font-size: 22px; font-weight: 600;">💳 Banking Details</h3>
                <p style="margin: 0 0 20px; color: #555555; font-size: 17px; line-height: 1.6;">
                  Use these details to make your payment:
                </p>
                
                <p style="margin: 0 0 12px; color: #2e7d32; font-size: 16px; font-weight: 600;">Bank:</p>
                <p style="margin: 0 0 20px; color: #333333; font-size: 18px; font-family: 'Courier New', monospace;">FNB</p>
                
                <p style="margin: 0 0 12px; color: #2e7d32; font-size: 16px; font-weight: 600;">Account Number:</p>
                <p style="margin: 0 0 20px; color: #333333; font-size: 18px; font-family: 'Courier New', monospace;">62777403181</p>
                
                <p style="margin: 0 0 12px; color: #2e7d32; font-size: 16px; font-weight: 600;">Branch Code:</p>
                <p style="margin: 0 0 20px; color: #333333; font-size: 18px; font-family: 'Courier New', monospace;">250655</p>
                
                <p style="margin: 0 0 12px; color: #2e7d32; font-size: 16px; font-weight: 600;">Account Name:</p>
                <p style="margin: 0 0 20px; color: #333333; font-size: 18px; font-family: 'Courier New', monospace;">Young Eagles Home Care Centre</p>
                
                <p style="margin: 0 0 12px; color: #2e7d32; font-size: 16px; font-weight: 600;">Payment Reference:</p>
                <p style="margin: 0 0 20px; color: #d32f2f; font-size: 20px; font-family: 'Courier New', monospace; font-weight: 700;">${paymentReference || shortReference}</p>
                
                <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 18px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 12px; color: #0d47a1; font-size: 16px; font-weight: 600;">💳 Payment Method Fees:</p>
                  <ul style="margin: 0; padding-left: 24px; color: #1565c0; font-size: 15px; line-height: 2;">
                    <li><strong>Bank Transfer (EFT):</strong> FREE ✅</li>
                    <li><strong>ATM Deposit:</strong> +R20.00 processing fee</li>
                    <li><strong>Cash Payment:</strong> +R20.00 handling fee</li>
                  </ul>
                </div>
              </div>

              <!-- Monthly Pricing Information -->
              <div style="width: 95%; max-width: 850px; background-color: #f3e5f5; border-radius: 8px; padding: 30px 10px; margin: 40px auto 40px 0; border-left: 6px solid #9c27b0; text-align: center;">
                <h3 style="margin: 0 0 20px; color: #6a1b9a; font-size: 22px; font-weight: 600;">💰 Monthly Fee Structure</h3>
                
                <div style="border-bottom: 3px solid #e1bee7; padding-bottom: 12px; margin-bottom: 12px;">
                  <p style="margin: 0; color: #6a1b9a; font-size: 16px; font-weight: 600; display: inline-block; width: 60%;">Age Group</p>
                  <p style="margin: 0; color: #6a1b9a; font-size: 16px; font-weight: 600; display: inline-block; width: 38%; text-align: right;">Monthly Fee</p>
                </div>
                
                <div style="padding: 15px 0; border-bottom: 1px solid #e1bee7;">
                  <p style="margin: 0; color: #333333; font-size: 17px; display: inline-block; width: 60%;">6 months - 1 year</p>
                  <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600; display: inline-block; width: 38%; text-align: right;">R850.00</p>
                </div>
                
                <div style="padding: 15px 0; border-bottom: 1px solid #e1bee7;">
                  <p style="margin: 0; color: #333333; font-size: 17px; display: inline-block; width: 60%;">1 - 3 years</p>
                  <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600; display: inline-block; width: 38%; text-align: right;">R720.00</p>
                </div>
                
                <div style="padding: 15px 0;">
                  <p style="margin: 0; color: #333333; font-size: 17px; display: inline-block; width: 60%;">4 - 6 years</p>
                  <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600; display: inline-block; width: 38%; text-align: right;">R680.00</p>
                </div>
                
                <p style="margin: 20px 0 0; color: #555555; font-size: 15px; font-style: italic;">
                  💡 Monthly fees are charged in addition to the one-time registration fee.
                </p>
              </div>

              <!-- Support -->
              <div style="width: 95%; max-width: 850px; background-color: #e3f2fd; border-radius: 8px; padding: 30px 10px; margin: 40px auto 40px 0; border-left: 6px solid #2196f3; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #0d47a1; font-size: 22px; font-weight: 600;">💬 Need Help?</h3>
                <p style="margin: 0 0 20px; color: #555555; font-size: 17px; line-height: 1.6;">
                  If you have questions about payment, the registration process, or need assistance uploading your proof of payment, please contact:
                </p>
                <div style="margin: 20px 0;">
                  <p style="margin: 0 0 12px; color: #555555; font-size: 17px;">
                    📧 <a href="mailto:admin@youngeagles.org.za" style="color: #667eea; text-decoration: none; font-size: 17px;">admin@youngeagles.org.za</a>
                  </p>
                  <p style="margin: 0 0 12px; color: #555555; font-size: 17px;">
                    📞 <a href="tel:+27604828855" style="color: #667eea; text-decoration: none; font-size: 17px;">+27 60 482 8855</a> / <a href="tel:+27820673133" style="color: #667eea; text-decoration: none; font-size: 17px;">+27 82 067 3133</a>
                  </p>
                  <a href="https://wa.me/27604828855?text=Hi%2C%20I%20have%20a%20question%20about%20my%20registration%20(${registrationId})" style="display: inline-block; margin-top: 15px; background-color: #25D366; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 17px;">
                    💬 Chat on WhatsApp
                  </a>
                </div>
              </div>

              <p style="margin: 40px 0 0; color: #333333; font-size: 18px; line-height: 1.6; text-align: center;">
                Thank you for choosing ${schoolName}. We look forward to welcoming ${studentName} to our learning community!
              </p>

              <p style="margin: 25px 0 0; color: #333333; font-size: 18px; line-height: 1.6; text-align: center;">
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

⚠️ IMPORTANT: Use ${shortReference} as your payment reference!
This links your payment to your registration.

PAYMENT METHOD FEES:
- Bank Transfer (EFT): FREE ✅
- ATM Deposit: +R20.00 processing fee
- Cash Payment: +R20.00 handling fee

UPLOAD PROOF OF PAYMENT
-----------------------
After making payment, upload your proof here:
https://edusitepro.edudashpro.org.za/upload-payment?ref=${paymentReference || registrationId}

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
