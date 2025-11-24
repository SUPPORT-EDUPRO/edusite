-- Comprehensive User Deletion Function
-- This function handles cascading deletes across all related tables
-- It gracefully handles cases where tables might not exist

CREATE OR REPLACE FUNCTION delete_user_and_related_records(
  target_user_id UUID,
  target_user_email TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  deletion_log JSONB := '[]'::JSONB;
  error_log JSONB := '[]'::JSONB;
  user_email TEXT;
  user_name TEXT;
  affected_rows INT;
BEGIN
  -- Step 1: Get user details for logging
  BEGIN
    SELECT email, full_name 
    INTO user_email, user_name
    FROM profiles 
    WHERE id = target_user_id;
    
    IF user_email IS NULL AND target_user_email IS NOT NULL THEN
      user_email := target_user_email;
    END IF;
    
    deletion_log := deletion_log || jsonb_build_object(
      'step', 'user_lookup',
      'message', format('Found user: %s (%s)', user_name, user_email)
    );
  EXCEPTION WHEN OTHERS THEN
    error_log := error_log || jsonb_build_object(
      'step', 'user_lookup',
      'error', SQLERRM
    );
  END;

  -- Step 2: Delete from registration_requests by email
  IF user_email IS NOT NULL THEN
    BEGIN
      DELETE FROM registration_requests 
      WHERE guardian_email = user_email;
      GET DIAGNOSTICS affected_rows = ROW_COUNT;
      
      IF affected_rows > 0 THEN
        deletion_log := deletion_log || jsonb_build_object(
          'step', 'registration_requests_by_email',
          'message', format('Deleted %s registration request(s) by email', affected_rows)
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      error_log := error_log || jsonb_build_object(
        'step', 'registration_requests_by_email',
        'error', SQLERRM
      );
    END;
  END IF;

  -- Step 3: Delete from registration_requests by user_id (if column exists)
  BEGIN
    DELETE FROM registration_requests 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'registration_requests_by_user_id',
        'message', format('Deleted %s registration request(s) by user_id', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Column might not exist, that's ok
    NULL;
  END;

  -- Step 4: Delete from user_organizations (if table exists)
  BEGIN
    DELETE FROM user_organizations 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'user_organizations',
        'message', format('Deleted %s user_organizations record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;

  -- Step 5: Delete from user_profiles (if table exists)
  BEGIN
    DELETE FROM user_profiles 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'user_profiles',
        'message', format('Deleted %s user_profiles record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Step 6: Delete from user_preferences (if table exists)
  BEGIN
    DELETE FROM user_preferences 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'user_preferences',
        'message', format('Deleted %s user_preferences record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Step 7: Delete from student_parents (if table exists)
  BEGIN
    DELETE FROM student_parents 
    WHERE user_id = target_user_id OR parent_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'student_parents',
        'message', format('Deleted %s student_parents record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Step 8: Delete from class_enrollments (if table exists)
  BEGIN
    DELETE FROM class_enrollments 
    WHERE user_id = target_user_id OR student_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'class_enrollments',
        'message', format('Deleted %s class_enrollments record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Step 9: Delete from user_sessions (if table exists)
  BEGIN
    DELETE FROM user_sessions 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'user_sessions',
        'message', format('Deleted %s user_sessions record(s)', affected_rows)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Step 10: Delete from profiles
  BEGIN
    DELETE FROM profiles 
    WHERE id = target_user_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
      deletion_log := deletion_log || jsonb_build_object(
        'step', 'profiles',
        'message', 'Deleted user profile'
      );
    ELSE
      error_log := error_log || jsonb_build_object(
        'step', 'profiles',
        'error', 'Profile not found or already deleted'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_log := error_log || jsonb_build_object(
      'step', 'profiles',
      'error', SQLERRM
    );
    -- Re-raise error because profile deletion is critical
    RAISE;
  END;

  -- Step 11: Note about auth.users (requires service_role to delete)
  deletion_log := deletion_log || jsonb_build_object(
    'step', 'auth_users',
    'message', 'Auth user deletion requires service_role access (handled by API)'
  );

  -- Return summary
  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', target_user_id,
    'user_email', user_email,
    'user_name', user_name,
    'deletion_log', deletion_log,
    'errors', error_log,
    'timestamp', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  -- Critical error occurred
  RETURN jsonb_build_object(
    'success', FALSE,
    'user_id', target_user_id,
    'error', SQLERRM,
    'deletion_log', deletion_log,
    'errors', error_log,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_and_related_records(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_and_related_records(UUID, TEXT) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION delete_user_and_related_records IS 
'Comprehensive user deletion function that handles cascading deletes across all related tables. 
Gracefully handles missing tables/columns. Returns detailed deletion log.
Usage: SELECT delete_user_and_related_records(''user-uuid-here'', ''user@email.com'');';

-- Example usage:
-- SELECT delete_user_and_related_records('550e8400-e29b-41d4-a716-446655440000', 'user@example.com');
