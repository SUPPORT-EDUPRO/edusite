/**
 * Supabase Edge Function: sync-registration-to-edudash
 * 
 * Triggered when a new registration is submitted in EduSitePro
 * Automatically creates the same record in EduDashPro for admin review
 * 
 * Deploy: supabase functions deploy sync-registration-to-edudash
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    // EduDashPro client
    const edudashClient = createClient(
      Deno.env.get('EDUDASH_SUPABASE_URL') ?? '',
      Deno.env.get('EDUDASH_SERVICE_ROLE_KEY') ?? ''
    );

    // Transform and sync to EduDashPro
    const { data, error } = await edudashClient
      .from('registration_requests')
      .upsert({
        id: record.id,
        organization_id: record.organization_id,
        
        // Guardian
        guardian_name: record.guardian_name,
        guardian_email: record.guardian_email,
        guardian_phone: record.guardian_phone,
        guardian_id_number: record.guardian_id_number,
        guardian_address: record.guardian_address,
        guardian_occupation: record.guardian_occupation,
        guardian_employer: record.guardian_employer,
        guardian_work_phone: record.guardian_work_phone,
        
        // Secondary Guardian
        secondary_guardian_name: record.secondary_guardian_name,
        secondary_guardian_email: record.secondary_guardian_email,
        secondary_guardian_phone: record.secondary_guardian_phone,
        secondary_guardian_relationship: record.secondary_guardian_relationship,
        
        // Parent Details
        mother_name: record.mother_name,
        mother_phone: record.mother_phone,
        mother_email: record.mother_email,
        father_name: record.father_name,
        father_phone: record.father_phone,
        father_email: record.father_email,
        
        // Student
        student_first_name: record.student_first_name,
        student_last_name: record.student_last_name,
        student_dob: record.student_dob,
        student_gender: record.student_gender,
        student_nationality: record.student_nationality,
        student_home_language: record.student_home_language,
        
        // Documents
        student_birth_certificate_url: record.student_birth_certificate_url,
        student_clinic_card_url: record.student_clinic_card_url,
        guardian_id_document_url: record.guardian_id_document_url,
        documents_uploaded: record.documents_uploaded,
        documents_deadline: record.documents_deadline,
        
        // Medical
        student_medical_conditions: record.student_medical_conditions,
        student_allergies: record.student_allergies,
        student_medication: record.student_medication,
        student_dietary_requirements: record.student_dietary_requirements,
        doctor_name: record.doctor_name,
        doctor_phone: record.doctor_phone,
        
        // Emergency
        emergency_contact_name: record.emergency_contact_name,
        emergency_contact_phone: record.emergency_contact_phone,
        emergency_contact_relationship: record.emergency_contact_relationship,
        
        // Registration
        preferred_class: record.preferred_class,
        preferred_start_date: record.preferred_start_date,
        academic_year: record.academic_year,
        status: 'pending', // Always pending initially
        special_requests: record.special_requests,
        how_did_you_hear: record.how_did_you_hear,
        sibling_enrolled: record.sibling_enrolled,
        
        // Payment
        payment_method: record.payment_method,
        payment_date: record.payment_date,
        proof_of_payment_url: record.proof_of_payment_url,
        registration_fee_amount: record.registration_fee_amount,
        registration_fee_paid: record.registration_fee_paid,
        registration_fee_payment_id: record.registration_fee_payment_id,
        
        // Campaign/Discount
        campaign_applied: record.campaign_applied,
        discount_amount: record.discount_amount,
        
        // Metadata
        created_at: record.created_at,
        source: 'edusitepro_web_form',
        
      }, { onConflict: 'id' });

    if (error) throw error;

    console.log(`✅ Registration ${record.id} synced to EduDashPro`);

    return new Response(
      JSON.stringify({ success: true, message: 'Registration synced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing registration:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
