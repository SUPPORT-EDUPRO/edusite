import { NextRequest, NextResponse } from 'next/server';

import { CURRENT_ACADEMIC_YEAR } from '@/lib/academic-year';
import { createClient } from '@/lib/auth';
import { generateParentWelcomeEmail } from '@/lib/email-templates/parent-welcome';
import {
  formatStudentId,
  generateSecurePassword,
  getHighestStudentSequence,
  getStudentIdPrefix,
  requiresVerifiedPayment,
  resolveEnrollmentDate,
  STUDENT_ID_MAX_ATTEMPTS,
} from '@/lib/registration-approval';
import { buildStartupTuitionFees, type FeeStructureRow } from '@/lib/registration-fees';
import {
  assertCanManageSchool,
  registrationAuthErrorResponse,
  requireRegistrationStaff,
} from '@/lib/registration-staff-auth';
import { getServiceRoleClient } from '@/lib/supabase';

const PWA_URL = 'https://edudashpro.org.za';

/**
 * POST /api/registrations/approve
 *
 * Approves a registration for the signed-in principal's school (or any school for a super
 * admin): finds or creates the parent account, creates the learner the same way the
 * EduDash Pro app does (students.preschool_id, parent_id/guardian_id, status 'active'),
 * redeems the campaign and marks the registration approved. Safe to retry.
 */
export async function POST(request: NextRequest) {
  try {
    const staff = await requireRegistrationStaff();
    const supabase = getServiceRoleClient();

    const { registrationId } = await request.json();
    if (!registrationId || typeof registrationId !== 'string') {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const { data: registration, error: regError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    assertCanManageSchool(staff, registration.organization_id);

    if (registration.status === 'approved') {
      return NextResponse.json({ error: 'Registration already approved' }, { status: 400 });
    }
    if (registration.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending registrations can be approved' },
        { status: 400 },
      );
    }
    if (requiresVerifiedPayment(registration) && !registration.payment_verified) {
      return NextResponse.json(
        {
          error:
            'Payment must be verified before approval. Please verify the proof of payment first.',
        },
        { status: 400 },
      );
    }

    const schoolId: string = registration.organization_id;
    const guardianEmail = String(registration.guardian_email ?? '')
      .trim()
      .toLowerCase();
    if (!guardianEmail) {
      return NextResponse.json({ error: 'Registration has no guardian email' }, { status: 400 });
    }

    // 1. Parent: reuse an existing profile (the same email may already use EduDash Pro).
    let parentId: string | null = null;
    let tempPassword: string | null = null;
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role, preschool_id, organization_id')
      .ilike('email', guardianEmail)
      .maybeSingle();

    if (existingProfile?.id) {
      parentId = existingProfile.id;
      const needsLink =
        existingProfile.role === 'parent' &&
        (existingProfile.preschool_id !== schoolId || existingProfile.organization_id !== schoolId);
      if (needsLink) {
        // Runs as the signed-in staff member so the database checks they may link this school.
        const { error: linkError } = await createClient().rpc('link_profile_to_school', {
          p_target_profile_id: parentId,
          p_school_id: schoolId,
          p_role: 'parent',
        });
        if (linkError) console.error('[approve] Parent link warning:', linkError.message);
      }
    } else {
      tempPassword = generateSecurePassword();
      const { data: created, error: createAuthError } = await supabase.auth.admin.createUser({
        email: guardianEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: registration.guardian_name,
          phone: registration.guardian_phone,
          role: 'parent',
          organization_id: schoolId,
          onboarding_source: 'registration_approval',
        },
      });
      if (createAuthError || !created.user) {
        console.error('[approve] Create account failed:', createAuthError?.message);
        return NextResponse.json({ error: 'Failed to create the parent account' }, { status: 500 });
      }
      parentId = created.user.id;
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: parentId,
          auth_user_id: parentId,
          email: guardianEmail,
          full_name: registration.guardian_name,
          phone: registration.guardian_phone ?? null,
          role: 'parent',
          preschool_id: schoolId,
          organization_id: schoolId,
        },
        { onConflict: 'id' },
      );
      if (profileError) {
        console.error('[approve] Profile upsert failed:', profileError.message);
        return NextResponse.json({ error: 'Failed to create the parent profile' }, { status: 500 });
      }
    }

    // 2. Learner: reuse the linked or already-created learner so a retry never duplicates.
    let studentRow: {
      id: string;
      student_id: string | null;
      first_name: string;
      last_name: string;
    } | null = null;
    if (registration.edudash_student_id) {
      const { data } = await supabase
        .from('students')
        .select('id, student_id, first_name, last_name')
        .eq('id', registration.edudash_student_id)
        .maybeSingle();
      studentRow = data;
    }
    if (!studentRow) {
      const { data } = await supabase
        .from('students')
        .select('id, student_id, first_name, last_name')
        .eq('preschool_id', schoolId)
        .ilike('first_name', registration.student_first_name.trim())
        .ilike('last_name', registration.student_last_name.trim())
        .eq('date_of_birth', registration.student_dob)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle();
      studentRow = data;
    }

    let studentCreated = false;
    if (!studentRow) {
      const { data: school } = await supabase
        .from('preschools')
        .select('name')
        .eq('id', schoolId)
        .maybeSingle();
      const prefix = getStudentIdPrefix(school?.name);
      const { data: existingIds } = await supabase
        .from('students')
        .select('student_id')
        .like('student_id', `${prefix}%`);
      const lastSequence = getHighestStudentSequence(
        (existingIds ?? []).map((row) => row.student_id),
        prefix,
      );

      for (let attempt = 1; attempt <= STUDENT_ID_MAX_ATTEMPTS && !studentRow; attempt += 1) {
        const { data, error } = await supabase
          .from('students')
          .insert({
            student_id: formatStudentId(prefix, lastSequence + attempt),
            first_name: registration.student_first_name.trim(),
            last_name: registration.student_last_name.trim(),
            date_of_birth: registration.student_dob,
            gender: registration.student_gender ?? null,
            enrollment_date: resolveEnrollmentDate(registration.preferred_start_date),
            academic_year: registration.academic_year || CURRENT_ACADEMIC_YEAR,
            parent_id: parentId,
            guardian_id: parentId,
            preschool_id: schoolId,
            is_active: true,
            status: 'active',
            home_address: registration.guardian_address ?? null,
            home_phone: registration.guardian_phone ?? null,
            emergency_contact_name: registration.guardian_name,
            emergency_contact_phone: registration.guardian_phone,
          })
          .select('id, student_id, first_name, last_name')
          .single();

        if (!error) {
          studentRow = data;
          studentCreated = true;
        } else if (error.code !== '23505') {
          console.error('[approve] Student creation failed:', error.message);
          return NextResponse.json({ error: 'Failed to create the learner' }, { status: 500 });
        }
      }
      if (!studentRow) {
        return NextResponse.json(
          { error: 'Failed to allocate a student ID. Try again.' },
          { status: 500 },
        );
      }
    } else {
      await supabase
        .from('students')
        .update({ parent_id: parentId, guardian_id: parentId })
        .eq('id', studentRow.id);
    }

    // 2b. First two monthly tuition invoices, as the EduDash Pro app creates them. Skipped when the
    // learner already has fees (a retried approval) and never blocks the approval itself.
    try {
      const { count: existingFees } = await supabase
        .from('student_fees')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentRow.id);
      if (!existingFees) {
        const { data: structures } = await supabase
          .from('fee_structures')
          .select(
            'id, amount, fee_type, name, description, grade_levels, effective_from, created_at, age_min_months, age_max_months',
          )
          .eq('preschool_id', schoolId)
          .eq('is_active', true)
          .order('effective_from', { ascending: false })
          .order('created_at', { ascending: false });
        const fees = buildStartupTuitionFees({
          studentId: studentRow.id,
          structures: (structures ?? []) as FeeStructureRow[],
          dateOfBirth: registration.student_dob,
          enrollmentDate: resolveEnrollmentDate(registration.preferred_start_date),
        });
        if (fees.length) {
          const { error: feeError } = await supabase.from('student_fees').insert(fees);
          if (feeError) console.error('[approve] Fee assignment warning:', feeError.message);
        }
      }
    } catch (feeError) {
      console.error('[approve] Fee assignment warning:', feeError);
    }

    // 3. Mark approved. Only a still-pending row is updated, so a double click cannot redeem twice.
    const { data: approvedRows, error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        reviewed_by: staff.userId,
        reviewed_date: new Date().toISOString(),
        edudash_student_id: studentRow.id,
        edudash_parent_id: parentId,
      })
      .eq('id', registrationId)
      .eq('status', 'pending')
      .select('id');

    if (updateError) {
      console.error('[approve] Registration update failed:', updateError.message);
      return NextResponse.json(
        {
          error:
            'The learner was created but the registration could not be marked approved. Try again.',
        },
        { status: 500 },
      );
    }

    if (approvedRows?.length && registration.campaign_applied) {
      const { error: redeemError } = await supabase.rpc('increment_campaign_redemptions', {
        campaign_id: registration.campaign_applied,
      });
      if (redeemError) console.error('[approve] Campaign redemption warning:', redeemError.message);
    }

    // 4. Welcome email with the temporary password, only for a brand-new account.
    if (tempPassword && !registration.synced_from_edusite) {
      try {
        const { data: school } = await supabase
          .from('preschools')
          .select('name')
          .eq('id', schoolId)
          .maybeSingle();
        const emailContent = generateParentWelcomeEmail({
          parentName: registration.guardian_name,
          parentEmail: guardianEmail,
          tempPassword,
          studentName: `${studentRow.first_name} ${studentRow.last_name}`,
          studentId: studentRow.student_id ?? '',
          schoolName: school?.name || 'Young Eagles Education Centre',
          androidAppUrl: PWA_URL,
          iosAppUrl: PWA_URL,
        });
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: guardianEmail,
              subject: emailContent.subject,
              body: emailContent.html,
              is_html: true,
              confirmed: true,
            }),
          },
        );
        if (!emailResponse.ok)
          console.error('[approve] Welcome email failed:', emailResponse.status);
      } catch (emailError) {
        console.error('[approve] Welcome email error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration approved successfully',
      data: {
        parent: {
          email: guardianEmail,
          appDownloadLinks: { android: PWA_URL, ios: PWA_URL },
        },
        student: {
          id: studentRow.id,
          studentId: studentRow.student_id,
          name: `${studentRow.first_name} ${studentRow.last_name}`,
          created: studentCreated,
        },
      },
    });
  } catch (error) {
    const authResponse = registrationAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('[approve] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
