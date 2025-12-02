import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { verifySuperAdmin, forbiddenResponse } from '@/lib/auth-helpers';

// GET - Fetch all admin users
export async function GET(req: NextRequest) {
  const superAdmin = await verifySuperAdmin();
  if (!superAdmin) {
    return forbiddenResponse('SuperAdmin access required');
  }

  try {
    const supabase = getServiceRoleClient();

    // Fetch all admin/superadmin users with their permissions
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch permissions for each admin
    const userIds = profiles?.map((p) => p.id) || [];
    const { data: permissions, error: permissionsError } = await supabase
      .from('admin_permissions')
      .select('*')
      .in('user_id', userIds);

    if (permissionsError) console.error('Permissions fetch error:', permissionsError);

    // Merge data
    const users = profiles?.map((profile) => {
      const userPermissions = permissions?.find((p) => p.user_id === profile.id);
      return {
        ...profile,
        permissions: userPermissions || null,
      };
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new admin user
export async function POST(req: NextRequest) {
  const superAdmin = await verifySuperAdmin();
  if (!superAdmin) {
    return forbiddenResponse('SuperAdmin access required');
  }

  try {
    const body = await req.json();
    const { email, permissions } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // User must verify email
      user_metadata: {
        invited_by: superAdmin.email,
        invited_at: new Date().toISOString(),
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData?.user) {
      throw new Error('User creation returned no data');
    }

    // Create profile with admin role
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: email,
      role: 'admin',
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Create permissions (trigger should handle this, but we'll do it manually for reliability)
    const { error: permissionsError } = await supabase.from('admin_permissions').insert({
      user_id: authData.user.id,
      ...permissions,
      created_by: superAdmin.id,
    });

    if (permissionsError) {
      console.error('Permissions creation error:', permissionsError);
      // Non-fatal, permissions can be set later
    }

    // Send invitation email
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) {
      console.error('Invite email error:', inviteError);
      // Non-fatal, user is created
    }

    return NextResponse.json({
      success: true,
      data: {
        id: authData.user.id,
        email: email,
        message: 'Admin created successfully. Invitation email sent.',
      },
    });
  } catch (error: any) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
