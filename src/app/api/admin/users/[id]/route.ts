import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * DELETE /api/admin/users/[id]
 * 
 * Comprehensive user deletion that handles all related records gracefully.
 * Checks and deletes from:
 * - registration_requests (parent or guardian records)
 * - profiles (user profile)
 * - auth.users (authentication record)
 * 
 * All operations are wrapped in error handling to continue even if some tables don't exist.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const deletionLog: string[] = [];
    const errors: string[] = [];

    console.log(`🗑️ Starting comprehensive deletion for user: ${userId}`);

    // Step 1: Fetch user details before deletion for logging
    let userEmail = 'unknown';
    let userName = 'unknown';
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      
      if (profile) {
        userEmail = profile.email || 'unknown';
        userName = profile.full_name || 'unknown';
        deletionLog.push(`Found user profile: ${userName} (${userEmail})`);
      }
    } catch (error) {
      console.warn('Could not fetch user profile:', error);
    }

    // Step 2: Delete from registration_requests where user is guardian
    // This handles cases where the user registered children
    try {
      const { data: registrations, error: fetchError } = await supabase
        .from('registration_requests')
        .select('id, student_first_name, student_last_name')
        .eq('guardian_email', userEmail);

      if (!fetchError && registrations && registrations.length > 0) {
        deletionLog.push(`Found ${registrations.length} registration request(s)`);
        
        for (const reg of registrations) {
          const { error: deleteError } = await supabase
            .from('registration_requests')
            .delete()
            .eq('id', reg.id);

          if (deleteError) {
            errors.push(`Failed to delete registration for ${reg.student_first_name} ${reg.student_last_name}: ${deleteError.message}`);
          } else {
            deletionLog.push(`✓ Deleted registration: ${reg.student_first_name} ${reg.student_last_name}`);
          }
        }
      } else if (!fetchError) {
        deletionLog.push('No registration requests found');
      }
    } catch (error: any) {
      errors.push(`Error checking registration_requests: ${error.message}`);
      console.warn('registration_requests check failed:', error);
    }

    // Step 3: Delete from registration_requests by user ID
    // This handles cases where registration_requests might reference user_id directly
    try {
      const { data: regsByUserId } = await supabase
        .from('registration_requests')
        .select('id, student_first_name, student_last_name')
        .eq('user_id', userId);

      if (regsByUserId && regsByUserId.length > 0) {
        for (const reg of regsByUserId) {
          const { error: deleteError } = await supabase
            .from('registration_requests')
            .delete()
            .eq('id', reg.id);

          if (!deleteError) {
            deletionLog.push(`✓ Deleted registration by user_id: ${reg.student_first_name} ${reg.student_last_name}`);
          }
        }
      }
    } catch (error: any) {
      // This is non-critical, may not have user_id column
      console.debug('registration_requests by user_id check (optional):', error);
    }

    // Step 4: Check for related records in other potential tables
    // user_organizations, user_profiles, etc.
    const potentialTables = [
      'user_organizations',
      'user_profiles',
      'user_preferences',
      'user_sessions',
      'student_parents',
      'class_enrollments'
    ];

    for (const tableName of potentialTables) {
      try {
        const { data, error: checkError } = await supabase
          .from(tableName)
          .select('id')
          .eq('user_id', userId);

        if (!checkError && data && data.length > 0) {
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('user_id', userId);

          if (deleteError) {
            errors.push(`Failed to delete from ${tableName}: ${deleteError.message}`);
          } else {
            deletionLog.push(`✓ Deleted ${data.length} record(s) from ${tableName}`);
          }
        }
      } catch (error) {
        // Table might not exist, that's ok
        console.debug(`Table ${tableName} not found or no records (this is ok)`);
      }
    }

    // Step 5: Delete from profiles table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        errors.push(`Failed to delete profile: ${profileError.message}`);
        throw new Error(`Profile deletion failed: ${profileError.message}`);
      } else {
        deletionLog.push(`✓ Deleted user profile`);
      }
    } catch (error: any) {
      errors.push(`Profile deletion error: ${error.message}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete user profile',
          details: error.message,
          deletionLog,
          errors
        },
        { status: 500 }
      );
    }

    // Step 6: Delete from auth.users (authentication record)
    // This requires service_role permissions
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        errors.push(`Failed to delete auth user: ${authError.message}`);
        // Don't fail the entire operation if this fails
        console.warn('Auth user deletion failed (non-critical):', authError);
        deletionLog.push(`⚠️ Could not delete auth record (may require manual cleanup)`);
      } else {
        deletionLog.push(`✓ Deleted authentication record`);
      }
    } catch (error: any) {
      errors.push(`Auth deletion error: ${error.message}`);
      console.warn('Auth user deletion error (non-critical):', error);
    }

    // Final summary
    const summary = {
      success: true,
      message: `User ${userName} (${userEmail}) successfully deleted`,
      userId,
      deletionLog,
      warnings: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Deletion completed:', summary);

    return NextResponse.json(summary, { status: 200 });

  } catch (error: any) {
    console.error('❌ Critical error during user deletion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during deletion',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/[id]
 * 
 * Get user details and related records count for preview before deletion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const relatedRecords: Record<string, number> = {};

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check registration_requests
    try {
      const { data: regs } = await supabase
        .from('registration_requests')
        .select('id')
        .or(`guardian_email.eq.${profile.email},user_id.eq.${userId}`);
      
      relatedRecords.registration_requests = regs?.length || 0;
    } catch (error) {
      relatedRecords.registration_requests = 0;
    }

    // Check other potential tables
    const checkTables = [
      'user_organizations',
      'user_profiles',
      'student_parents',
      'class_enrollments'
    ];

    for (const tableName of checkTables) {
      try {
        const { data } = await supabase
          .from(tableName)
          .select('id')
          .eq('user_id', userId);
        
        relatedRecords[tableName] = data?.length || 0;
      } catch (error) {
        // Table doesn't exist
      }
    }

    return NextResponse.json({
      user: profile,
      relatedRecords,
      canDelete: true,
      warnings: Object.values(relatedRecords).some(count => count > 0)
        ? 'This user has related records that will also be deleted'
        : undefined
    });

  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
