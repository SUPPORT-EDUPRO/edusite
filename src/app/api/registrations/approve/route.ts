import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

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
 * 8. Grant 14-day trial tier
 * 9. Update registration status to 'approved'
 * 10. Send welcome email with app download links
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // 3. Create parent account in Supabase Auth
    const tempPassword = generateSecurePassword();
    
    const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
      email: registration.parent_email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: registration.parent_name,
        phone: registration.parent_phone,
        role: 'parent',
        organization_id: registration.organization_id,
        onboarding_source: 'registration_approval',
      }
    });

    if (createAuthError || !authData.user) {
      return NextResponse.json(
        { error: `Failed to create account: ${createAuthError?.message}` },
        { status: 500 }
      );
    }

    // 4. Create profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: registration.parent_email,
        full_name: registration.parent_name,
        phone: registration.parent_phone,
        role: 'parent',
        preschool_id: registration.organization_id, // Link to Young Eagles
        tier: 'free', // Start with free tier (14-day trial)
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - profile might already exist
    }

    // 5. Create student in students table
    const studentId = `${registration.school_code}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        organization_id: registration.organization_id,
        preschool_id: registration.organization_id, // Same for solo orgs
        student_id: studentId,
        first_name: registration.child_first_name || registration.child_name?.split(' ')[0] || '',
        last_name: registration.child_last_name || registration.child_name?.split(' ').slice(1).join(' ') || '',
        date_of_birth: registration.child_dob,
        status: 'enrolled',
        academic_year: '2026',
        parent_id: authData.user.id, // Link to parent
        home_address: registration.parent_address,
        home_phone: registration.parent_phone,
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

    // 9. Update registration status
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error('Registration update error:', updateError);
    }

    // 10. Send welcome email (TODO: Implement email service)
    // For now, return the credentials in the response
    // In production, send via email service (SendGrid, Resend, etc.)

    return NextResponse.json({
      success: true,
      message: 'Registration approved successfully',
      data: {
        parent: {
          email: registration.parent_email,
          temporaryPassword: tempPassword, // Remove this in production - send via email only
          appDownloadLinks: {
            android: process.env.NEXT_PUBLIC_ANDROID_STORE_URL,
            ios: process.env.NEXT_PUBLIC_IOS_STORE_URL,
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
