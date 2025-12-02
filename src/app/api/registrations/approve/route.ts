import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';
import { generateParentWelcomeEmail } from '@/lib/email-templates/parent-welcome';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * POST /api/registrations/approve
 * 
 * Approves a registration and auto-creates parent account in EduDash Pro app
 * 
 * Flow:
 * 1. Verify admin authentication
 * 2. Get registration details
 * 3. Create parent account in Supabase Auth
 * 4. Create profile in profiles table
 * 5. Create student in students table
 * 6. Link student to organization (Young Eagles)
 * 7. Link parent to student
 * 8. Grant 7-day trial tier
 * 9. Update registration status to 'approved'
 * 10. Send welcome email with PWA download link
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication with user client
    const authSupabase = createClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations
    const supabase = getServiceRoleClient();

    // Get request body
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // 2. Get registration details
    const { data: registration, error: regError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (registration.status === 'approved') {
      return NextResponse.json(
        { error: 'Registration already approved' },
        { status: 400 }
      );
    }

    // Check payment verification
    if (!registration.payment_verified) {
      return NextResponse.json(
        { error: 'Payment must be verified before approval. Please verify the proof of payment first.' },
        { status: 400 }
      );
    }

    // 3. Create parent account in Supabase Auth (or get existing)
    const tempPassword = generateSecurePassword();
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === registration.guardian_email);
    
    let authData;
    if (existingUser) {
      // User already exists, use existing account
      authData = { user: existingUser };
      console.log('Using existing user account:', registration.guardian_email);
    } else {
      // Create new user
      const { data: newUserData, error: createAuthError } = await supabase.auth.admin.createUser({
        email: registration.guardian_email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: registration.guardian_name,
          phone: registration.guardian_phone,
          role: 'parent',
          organization_id: registration.organization_id,
          onboarding_source: 'registration_approval',
        }
      });

      if (createAuthError || !newUserData.user) {
        return NextResponse.json(
          { error: `Failed to create account: ${createAuthError?.message}` },
          { status: 500 }
        );
      }
      
      authData = newUserData;
    }

    // 4. Create or update profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: registration.guardian_email,
        full_name: registration.guardian_name,
        role: 'parent',
        preschool_id: null, // Set to null if no preschool record
        organization_id: registration.organization_id, // Link to organization
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - profile might already exist
    }

    // 5. Create student in students table
    // Generate student ID: YE-YEAR-RANDOM (Young Eagles format)
    const studentId = `YE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        organization_id: registration.organization_id, // Young Eagles org ID from registration
        preschool_id: null, // Set to null if no preschool record exists
        student_id: studentId,
        first_name: registration.student_first_name,
        last_name: registration.student_last_name,
        date_of_birth: registration.student_dob,
        status: 'enrolled',
        academic_year: '2026',
        home_address: registration.guardian_address,
        home_phone: registration.guardian_phone,
      })
      .select()
      .single();

    if (studentError) {
      console.error('Student creation error:', studentError);
      return NextResponse.json(
        { error: `Failed to create student: ${studentError.message}` },
        { status: 500 }
      );
    }

    // 6. Link parent to student via student_guardians table
    const { error: guardianLinkError } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentData.id,
        guardian_id: authData.user.id,
        relationship: 'guardian',
        primary_contact: true,
        can_pickup: true,
      });

    if (guardianLinkError) {
      console.error('Guardian link error:', guardianLinkError);
      // Continue anyway - link can be created later
    }

    // 7. Increment promo code redemption counter if campaign was applied
    if (registration.campaign_applied) {
      // Atomic increment using SQL function
      const { error: campaignUpdateError } = await supabase.rpc('increment_campaign_redemptions', {
        campaign_id: registration.campaign_applied
      });

      if (campaignUpdateError) {
        console.error('Campaign redemption counter update error:', campaignUpdateError);
        // Try fallback: manual fetch-increment-update (not atomic but better than nothing)
        try {
          const { data: campaign } = await supabase
            .from('marketing_campaigns')
            .select('current_redemptions')
            .eq('id', registration.campaign_applied)
            .single();
          
          if (campaign) {
            await supabase
              .from('marketing_campaigns')
              .update({ current_redemptions: (campaign.current_redemptions || 0) + 1 })
              .eq('id', registration.campaign_applied);
            
            console.log('✅ Promo code redemption counter incremented (fallback method)');
          }
        } catch (fallbackError) {
          console.error('Fallback campaign update also failed:', fallbackError);
        }
      } else {
        console.log('✅ Promo code redemption counter incremented for campaign:', registration.campaign_applied);
      }
    }

    // 9. Update registration status
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        reviewed_date: new Date().toISOString(),
        reviewed_by: session.user.id,
        approved_from_edusite: true, // Flag to indicate approval came from EduSitePro (not EduDashPro)
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error('Registration update error:', updateError);
    }

    // Define PWA URL for response - use edudashpro.org.za as the main app domain
    const pwaUrl = 'https://edudashpro.org.za';

    // 10. Send welcome email ONLY if this approval is from EduSitePro (not synced from EduDashPro)
    // If synced_from_edusite is true, EduDashPro already sent the email
    if (registration.synced_from_edusite || registration.edudash_parent_id) {
      console.log('[approve] Skipping email - already handled by EduDashPro');
    } else {
    try {
      // Get organization details for school name
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', registration.organization_id)
        .single();

      const schoolName = orgData?.name || 'Young Eagles Education Centre';

      // Generate email content with PWA link and 7-day trial
      const emailContent = generateParentWelcomeEmail({
        parentName: registration.guardian_name,
        parentEmail: registration.guardian_email,
        tempPassword: tempPassword,
        studentName: `${studentData.first_name} ${studentData.last_name}`,
        studentId: studentId,
        schoolName: schoolName,
        androidAppUrl: pwaUrl, // Use PWA URL for now (no native app yet)
        iosAppUrl: pwaUrl, // Same PWA works for iOS
      });

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
            to: registration.guardian_email,
            subject: emailContent.subject,
            body: emailContent.html, // Edge Function expects 'body' not 'html'
            is_html: true,
            confirmed: true, // Explicit confirmation required by Edge Function
          }),
        }
      );

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the approval if email fails - parent can still access app
      } else {
        console.log('Welcome email sent successfully to:', registration.guardian_email);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the approval if email fails
    }
    } // End of email sending block

    return NextResponse.json({
      success: true,
      message: 'Registration approved successfully',
      data: {
        parent: {
          email: registration.guardian_email,
          appDownloadLinks: {
            android: pwaUrl,
            ios: pwaUrl,
          }
        },
        student: {
          id: studentData.id,
          studentId: studentId,
          name: `${studentData.first_name} ${studentData.last_name}`,
        }
      }
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure temporary password
 */
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}
