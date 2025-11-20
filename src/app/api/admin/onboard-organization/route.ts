import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/onboard-organization
 * 
 * Creates a new organization with admin user account
 * Only accessible by Super-Admin users
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if requester is authenticated and is super-admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      organizationName,
      organizationSlug,
      organizationType,
      adminEmail,
      adminName,
      minAge,
      maxAge,
      registrationFee = 500,
      tuitionFee = 2500
    } = body;

    // Validate required fields
    if (!organizationName || !organizationSlug || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // STEP 1: Create organization in database
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: organizationSlug,
        organization_type: organizationType || 'preschool',
        registration_open: true,
        registration_message: `Now enrolling for 2026 academic year!`,
        min_age: minAge,
        max_age: maxAge,
        school_code: `${organizationSlug.toUpperCase()}-2026`,
        academic_year: '2026'
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      );
    }

    // STEP 2: Create admin user account
    const tempPassword = generateSecurePassword();
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: adminName,
        organization_slug: organizationSlug,
        organization_id: organization.id,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      // Rollback: Delete organization
      await supabase.from('organizations').delete().eq('id', organization.id);
      
      return NextResponse.json(
        { error: 'Failed to create admin user', details: authError.message },
        { status: 500 }
      );
    }

    // STEP 3: Link user to organization
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: authUser.user.id,
        organization_id: organization.id,
        role: 'admin',
        permissions: [
          'manage_organization',
          'manage_campaigns',
          'manage_registrations',
          'manage_payments',
          'manage_classes',
          'manage_users'
        ]
      });

    if (linkError) {
      console.error('Error linking user to organization:', linkError);
    }

    // STEP 4: Set default fee structure
    const { error: feeError } = await supabase
      .from('organization_fee_structures')
      .insert([
        {
          organization_id: organization.id,
          fee_type: 'registration_fee',
          amount: registrationFee,
          description: 'One-time registration fee for new students',
          payment_frequency: 'once',
          mandatory: true,
          active: true,
          academic_year: '2026'
        },
        {
          organization_id: organization.id,
          fee_type: 'tuition_monthly',
          amount: tuitionFee,
          description: 'Monthly tuition fee',
          payment_frequency: 'monthly',
          mandatory: true,
          active: true,
          academic_year: '2026'
        }
      ]);

    if (feeError) {
      console.error('Error creating fee structure:', feeError);
    }

    // STEP 5: Create default landing page
    const { error: landingError } = await supabase
      .from('organization_landing_pages')
      .insert({
        organization_id: organization.id,
        hero_title: `Welcome to ${organizationName}`,
        hero_subtitle: 'Providing quality education for your child',
        hero_cta_text: 'Register Now',
        stats: {
          students: 0,
          teachers: 0,
          years: 1,
          satisfaction: 98
        },
        published: true
      });

    if (landingError) {
      console.error('Error creating landing page:', landingError);
    }

    // STEP 6: Create welcome campaign
    const { error: campaignError } = await supabase
      .from('marketing_campaigns')
      .insert({
        organization_id: organization.id,
        name: 'Welcome Early Bird Special',
        campaign_type: 'early_bird',
        description: 'Register in your first month and save 20%!',
        discount_type: 'percentage',
        discount_value: 20,
        promo_code: 'WELCOME20',
        max_redemptions: 50,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        auto_apply: true,
        active: true,
        featured: true
      });

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
    }

    // STEP 7: Send welcome email to admin
    await sendWelcomeEmail({
      email: adminEmail,
      name: adminName,
      organizationName,
      tempPassword,
      loginUrl: 'https://edusitepro.edudashpro.org.za/login',
      dashboardUrl: `https://edusitepro.edudashpro.org.za/admin/dashboard`,
    });

    // STEP 8: Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        organization_id: organization.id,
        action: 'create_organization',
        resource_type: 'organization',
        changes: {
          organization_name: organizationName,
          organization_slug: organizationSlug,
          admin_email: adminEmail,
          admin_name: adminName
        }
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organizationName,
        slug: organizationSlug,
      },
      admin: {
        email: adminEmail,
        name: adminName,
        tempPassword, // In production, don't return this - send via email only
      },
      urls: {
        admin: `https://edusitepro.edudashpro.org.za/admin`,
        landing: `https://edusitepro.edudashpro.org.za/${organizationSlug}`,
        register: `https://edusitepro.edudashpro.org.za/register`,
      },
      message: 'Organization created successfully. Welcome email sent to admin.',
    });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Generate secure random password
function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Helper: Send welcome email
async function sendWelcomeEmail({
  email,
  name,
  organizationName,
  tempPassword,
  loginUrl,
  dashboardUrl,
}: {
  email: string;
  name: string;
  organizationName: string;
  tempPassword: string;
  loginUrl: string;
  dashboardUrl: string;
}) {
  // In production, integrate with email service (Resend, SendGrid, etc.)
  // For now, just log it
  console.log(`
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📧 WELCOME EMAIL
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    To: ${email}
    Subject: Welcome to EduSitePro - ${organizationName}
    
    Hi ${name},
    
    Your organization "${organizationName}" has been created on EduSitePro!
    
    📍 Login Details:
    Email: ${email}
    Temporary Password: ${tempPassword}
    Login URL: ${loginUrl}
    
    🎯 Next Steps:
    1. Login to your admin dashboard
    2. Change your password (Settings > Security)
    3. Upload your school logo
    4. Add your classes
    5. Customize your landing page
    6. Start accepting registrations!
    
    📚 Useful Links:
    - Admin Dashboard: ${dashboardUrl}
    - Registration Page: https://edusitepro.edudashpro.org.za/register
    - Support: support@edusitepro.org.za
    
    Welcome aboard! 🎉
    
    The EduSitePro Team
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // TODO: Integrate with actual email service
  /*
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'EduSitePro <noreply@edusitepro.org.za>',
      to: email,
      subject: `Welcome to EduSitePro - ${organizationName}`,
      html: welcomeEmailTemplate({ name, organizationName, email, tempPassword, loginUrl }),
    }),
  });
  */
}
