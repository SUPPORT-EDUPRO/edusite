'use client';

import { AlertCircle, Check, Loader2, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {getFieldLabels, getFormSections } from '@/lib/registration-helpers';
import { supabase } from '@/lib/supabase';

interface NearbySchool {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  distance?: number;
}

interface PublicRegistrationFormProps {
  organizationId: string;
  schoolCode: string;
  schoolName?: string;
  slug?: string;
  initialBranding?: OrganizationBranding | null;
}

export interface OrganizationBranding {
  id: string;
  name: string;
  slug: string;
  organization_type: 'preschool' | 'primary_school' | 'high_school' | 'k12_school' | 'fet_college' | 'training_center' | 'university' | 'other';
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  registration_open: boolean;
  registration_message?: string;
  min_age?: number;
  max_age?: number;
  terms_and_conditions_url?: string;
  terms_and_conditions_text?: string;
}

const getInitialFormState = () => ({
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  guardianIdNumber: '',
  guardianAddress: '',
  guardianOccupation: '',
  guardianEmployer: '',
  guardianWorkPhone: '',
  secondaryGuardianName: '',
  secondaryGuardianEmail: '',
  secondaryGuardianPhone: '',
  secondaryGuardianRelationship: '',
  studentFirstName: '',
  studentLastName: '',
  studentDob: '',
  studentGender: '',
  studentNationality: '',
  studentHomeLanguage: '',
  studentMedicalConditions: '',
  studentAllergies: '',
  studentMedication: '',
  studentDietaryRequirements: '',
  doctorName: '',
  doctorPhone: '',
  preferredStartDate: '2026-01-12',
  previousSchool: '',
  reasonForTransfer: '',
  specialRequests: '',
  howDidYouHear: '',
  couponCode: '',
  siblingEnrolled: false,
  siblingStudentId: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  consentPhotography: false,
  consentMarketing: false,
  termsAccepted: false,
  // Preschool-specific fields
  immunizationRecord: '',
  motherName: '',
  motherPhone: '',
  motherEmail: '',
  motherOccupation: '',
  motherEmployer: '',
  fatherName: '',
  fatherPhone: '',
  fatherEmail: '',
  fatherOccupation: '',
  fatherEmployer: '',
  sleepingHabits: '',
  feedingHabits: '',
  toiletTrained: '',
  favouriteActivities: '',
  behavioralConcerns: '',
  developmentalDelays: '',
  specialNeeds: '',
  transportRequired: false,
  transportPickupAddress: '',
  transportDropoffAddress: '',
  preferredMealPlan: '',
  religiousConsiderations: '',
  culturalConsiderations: '',
  authorizedPickupPersons: '',
  photoIDRequired: false,
});

export function PublicRegistrationForm({
  organizationId,
  schoolCode,
  schoolName = 'Our School',
  slug,
  initialBranding = null,
}: PublicRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(initialBranding);
  const [formData, setFormData] = useState(getInitialFormState());
  const [nearbySchools, setNearbySchools] = useState<NearbySchool[]>([]);
  const [showNearbySchools, setShowNearbySchools] = useState(false);
  const [campaignInfo, setCampaignInfo] = useState<{
    valid: boolean;
    discount: number;
    remaining: number;
    maxRedemptions: number;
    code: string;
  } | null>(null);
  const [submittedWithDiscount, setSubmittedWithDiscount] = useState<{
    valid: boolean;
    discount: number;
    remaining: number;
    maxRedemptions: number;
    code: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [liveSpots, setLiveSpots] = useState<number | null>(null);
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean;
    exists: boolean;
    message: string;
  }>({ checking: false, exists: false, message: '' });

  // Get organization type and derived helpers
  const orgType = organizationBranding?.organization_type || 'other';
  const sections = getFormSections(orgType);
  const labels = getFieldLabels(orgType);

  // Derive tenant-configurable flags with sensible defaults by org type
  const cfg = (organizationBranding as any)?.form_config ?? null;
  const formConfig = {
    showDetailedParentInfo: cfg?.showDetailedParentInfo ?? (orgType === 'preschool'),
    showSecondaryGuardian: cfg?.showSecondaryGuardian ?? (orgType !== 'preschool'),
    showTransport: cfg?.showTransport ?? (orgType === 'preschool'),
    showMealPlan: cfg?.showMealPlan ?? (orgType === 'preschool'),
    showDoctorInfo: cfg?.showDoctorInfo ?? true,
    showEmergencyContact: cfg?.showEmergencyContact ?? true,
  } as const;

  // Check if all required fields are filled
  const isFormValid = () => {
    // Check required text fields
    const requiredTextFields = [
      formData.guardianName,
      formData.guardianEmail,
      formData.guardianPhone,
      formData.guardianAddress,
      formData.studentFirstName,
      formData.studentLastName,
      formData.studentDob,
      formData.studentGender,
    ];

    // Add conditional required fields
    if (formConfig.showEmergencyContact) {
      requiredTextFields.push(
        formData.emergencyContactName,
        formData.emergencyContactPhone,
        formData.emergencyContactRelationship
      );
    }

    // All text fields must be non-empty AND terms must be accepted
    return requiredTextFields.every((field) => field && field.trim() !== '') && formData.termsAccepted === true;
  };

  // Fetch live spots remaining for Young Eagles promo
  useEffect(() => {
    const fetchLiveSpots = async () => {
      if (organizationId !== 'ba79097c-1b93-4b48-bcbe-df73878ab4d1') return;
      
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .select('current_redemptions, max_redemptions')
          .eq('coupon_code', 'WELCOME2026')
          .eq('active', true)
          .single();

        if (!error && data) {
          const remaining = data.max_redemptions - data.current_redemptions;
          setLiveSpots(remaining > 0 ? remaining : 0);
        } else if (error) {
          // Silently handle RLS/table access errors - use default value
          // This prevents 406 errors from flooding the console
          setLiveSpots(40); // Default fallback value
        }
      } catch (err) {
        // Silently use fallback value on any error
        setLiveSpots(40);
      }
    };

    fetchLiveSpots();
    
    // Only poll if initial fetch succeeded, otherwise keep fallback
    const interval = setInterval(fetchLiveSpots, 30000); // Reduced frequency to 30s
    return () => clearInterval(interval);
  }, [organizationId]);

  // Validate email for duplicates in real-time
  useEffect(() => {
    const validateEmail = async () => {
      const email = formData.guardianEmail.trim().toLowerCase();
      
      if (!email || !email.includes('@')) {
        setEmailValidation({ checking: false, exists: false, message: '' });
        return;
      }

      setEmailValidation({ checking: true, exists: false, message: 'Checking email...' });
      
      try {
        const { data: existingRegs, error } = await supabase
          .from('registration_requests')
          .select('id, status, guardian_email, created_at')
          .eq('organization_id', organizationId)
          .ilike('guardian_email', email)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (existingRegs && existingRegs.length > 0) {
          const existing = existingRegs[0];
          const status = existing?.status;
          
          if (status === 'approved') {
            setEmailValidation({
              checking: false,
              exists: true,
              message: '❌ This email already has an approved registration. Please contact the school if you need assistance.'
            });
          } else if (status === 'pending') {
            setEmailValidation({
              checking: false,
              exists: true,
              message: '⚠️ This email already has a pending registration. Please check your email for updates.'
            });
          } else {
            setEmailValidation({ checking: false, exists: false, message: '✅ Email available' });
          }
        } else {
          setEmailValidation({ checking: false, exists: false, message: '✅ Email available' });
        }
      } catch (err) {
        console.error('Error checking email:', err);
        setEmailValidation({ checking: false, exists: false, message: '' });
      }
    };

    const timer = setTimeout(validateEmail, 800); // Debounce 800ms
    return () => clearTimeout(timer);
  }, [formData.guardianEmail, organizationId]);

  // Validate coupon code in real-time
  useEffect(() => {
    const validateCoupon = async () => {
      const code = formData.couponCode.trim().toUpperCase();
      
      if (!code) {
        setCampaignInfo(null);
        return;
      }

      setValidatingCoupon(true);
      try {
        const { data: campaign, error } = await supabase
          .from('marketing_campaigns')
          .select('id, promo_code, discount_type, discount_percentage, discount_amount, current_redemptions, max_redemptions, active')
          .eq('organization_id', organizationId)
          .eq('coupon_code', code)
          .eq('active', true)
          .single();

        if (!error && campaign) {
          const remaining = campaign.max_redemptions - campaign.current_redemptions;
          const hasSlots = remaining > 0;
          
          setCampaignInfo({
            valid: hasSlots,
            discount: campaign.discount_type === 'percentage' ? campaign.discount_percentage : campaign.discount_amount,
            remaining,
            maxRedemptions: campaign.max_redemptions,
            code: campaign.promo_code
          });
        } else {
          setCampaignInfo(null);
        }
      } catch (err) {
        console.error('Error validating coupon:', err);
        setCampaignInfo(null);
      } finally {
        setValidatingCoupon(false);
      }
    };

    const timer = setTimeout(validateCoupon, 500);
    return () => clearTimeout(timer);
  }, [formData.couponCode, organizationId]);

  // Fetch nearby schools when address changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.guardianAddress.length > 20) {
        fetchNearbySchools(formData.guardianAddress);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formData.guardianAddress]);

  const fetchNearbySchools = async (address: string) => {
    try {
      // Extract city/province from address (simple heuristic)
      const addressLower = address.toLowerCase();
      let city = '';
      let province = '';

      // Common SA cities
      const cities = ['johannesburg', 'pretoria', 'cape town', 'durban', 'port elizabeth', 'bloemfontein'];
      const provinces = ['gauteng', 'western cape', 'kwazulu-natal', 'eastern cape', 'free state', 'limpopo', 'mpumalanga', 'northern cape', 'north west'];

      for (const c of cities) {
        if (addressLower.includes(c)) {
          city = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }

      for (const p of provinces) {
        if (addressLower.includes(p)) {
          province = p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }

      if (!city && !province) return;

      // Query nearby schools
      let query = supabase
        .from('organizations')
        .select('id, name, slug, city, province')
        .eq('is_public', true)
        .eq('directory_listing', true)
        .neq('id', organizationId)
        .limit(5);

      if (city) query = query.eq('city', city);
      if (province && !city) query = query.eq('province', province);

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        setNearbySchools(data);
        setShowNearbySchools(true);
      }
    } catch (error) {
      console.error('Error fetching nearby schools:', error);
    }
  };

  const fetchOrganizationBranding = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setOrganizationBranding(data);
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    }
  }, [organizationId]);

  // Auto-assign class based on child's age
  // This mapping is flexible and can be customized per organization
  const getAgeGroupFromDob = useCallback((dob: string) => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                        (today.getMonth() - birthDate.getMonth());
    
    // Age group mapping - schools can define their own groupings
    // Young Eagles example: 6mo-1yr, 1-3yrs, 4-6yrs
    if (ageInMonths < 12) return { name: 'Little Explorers', range: '6 months - 1 year' };
    if (ageInMonths < 36) return { name: 'Curious Cubs', range: '1-3 years' };
    if (ageInMonths < 72) return { name: 'Panda', range: '4-6 years' };
    return { name: 'Advanced', range: '6+ years' };
  }, []);

  const [autoAssignedClass, setAutoAssignedClass] = useState<{name: string, range: string} | null>(null);

  // Auto-assign class when student DOB changes
  useEffect(() => {
    if (formData.studentDob) {
      const ageGroup = getAgeGroupFromDob(formData.studentDob);
      setAutoAssignedClass(ageGroup);
    } else {
      setAutoAssignedClass(null);
    }
  }, [formData.studentDob, getAgeGroupFromDob]);

  useEffect(() => {
    if (initialBranding) {
      setOrganizationBranding(initialBranding);
      return;
    }
    fetchOrganizationBranding();
  }, [initialBranding, fetchOrganizationBranding]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block submission if email already exists
    if (emailValidation.exists) {
      alert('This email address is already registered. Please use a different email or contact the school for assistance.');
      return;
    }
    
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }
    
    setLoading(true);

    try {
      // Validate and apply coupon code if provided
      let campaignId = null;
      let discountAmount = 0;
      const baseRegistrationFee = 400; // R400 base fee for Young Eagles
      let finalAmount = baseRegistrationFee;
      
      if (formData.couponCode.trim()) {
        const { data: campaign, error: campaignError } = await supabase
          .from('marketing_campaigns')
          .select('id, discount_type, discount_percentage, discount_amount, current_redemptions, max_redemptions')
          .eq('organization_id', organizationId)
          .eq('coupon_code', formData.couponCode.trim().toUpperCase())
          .eq('active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .maybeSingle();

        if (campaignError) {
          console.error('Error validating coupon:', campaignError);
        } else if (campaign) {
          // Check if promo still has slots
          const remaining = campaign.max_redemptions - campaign.current_redemptions;
          if (remaining > 0) {
            campaignId = campaign.id;
            // Calculate discount
            if (campaign.discount_type === 'percentage' && campaign.discount_percentage) {
              discountAmount = campaign.discount_percentage;
              finalAmount = baseRegistrationFee * (1 - campaign.discount_percentage / 100);
            } else if (campaign.discount_type === 'fixed' && campaign.discount_amount) {
              discountAmount = campaign.discount_amount;
              finalAmount = Math.max(0, baseRegistrationFee - campaign.discount_amount);
            }
          } else {
            alert('Sorry, all discount slots have been claimed. Registration will proceed at full price (R400).');
          }
        } else if (formData.couponCode.trim()) {
          alert('Invalid or expired coupon code. Registration will proceed at full price (R400).');
        }
      }

      // Prepare additional data as JSONB
      const additionalData = {
        guardian_employer: formData.guardianEmployer,
        guardian_work_phone: formData.guardianWorkPhone,
        secondary_guardian: formData.secondaryGuardianName ? {
          name: formData.secondaryGuardianName,
          email: formData.secondaryGuardianEmail,
          phone: formData.secondaryGuardianPhone,
          relationship: formData.secondaryGuardianRelationship,
        } : null,
        student_details: {
          nationality: formData.studentNationality,
          home_language: formData.studentHomeLanguage,
          medical_conditions: formData.studentMedicalConditions,
          allergies: formData.studentAllergies,
          medication: formData.studentMedication,
          dietary_requirements: formData.studentDietaryRequirements,
          doctor_name: formData.doctorName,
          doctor_phone: formData.doctorPhone,
          previous_school: formData.previousSchool,
          reason_for_transfer: formData.reasonForTransfer,
        },
        emergency_contact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        consents: {
          photography: formData.consentPhotography,
          marketing: formData.consentMarketing,
        },
        // Preschool-specific data
        ...(organizationBranding?.organization_type === 'preschool' && {
          preschool_details: {
            immunization_record: formData.immunizationRecord,
            mother: {
              name: formData.motherName,
              phone: formData.motherPhone,
              email: formData.motherEmail,
              occupation: formData.motherOccupation,
              employer: formData.motherEmployer,
            },
            father: {
              name: formData.fatherName,
              phone: formData.fatherPhone,
              email: formData.fatherEmail,
              occupation: formData.fatherOccupation,
              employer: formData.fatherEmployer,
            },
            care_details: {
              sleeping_habits: formData.sleepingHabits,
              feeding_habits: formData.feedingHabits,
              toilet_trained: formData.toiletTrained,
              favourite_activities: formData.favouriteActivities,
              behavioral_concerns: formData.behavioralConcerns,
              developmental_delays: formData.developmentalDelays,
              special_needs: formData.specialNeeds,
            },
            services: {
              transport_required: formData.transportRequired,
              transport_pickup_address: formData.transportPickupAddress,
              transport_dropoff_address: formData.transportDropoffAddress,
              preferred_meal_plan: formData.preferredMealPlan,
              religious_considerations: formData.religiousConsiderations,
              cultural_considerations: formData.culturalConsiderations,
              authorized_pickup_persons: formData.authorizedPickupPersons,
              photo_id_required: formData.photoIDRequired,
            },
          },
        }),
      };

      // Check for duplicate registration (only if DOB is provided)
      if (formData.studentDob) {
        const { data: existingRegistration, error: duplicateCheckError } = await supabase
          .from('registration_requests')
          .select('id, status, created_at')
          .eq('organization_id', organizationId)
          .eq('student_first_name', formData.studentFirstName)
          .eq('student_last_name', formData.studentLastName)
          .eq('student_date_of_birth', formData.studentDob)
          .maybeSingle();

        if (existingRegistration && !duplicateCheckError) {
          const statusMessages: Record<string, string> = {
            'pending': 'A registration for this child is already pending review.',
            'approved': 'This child is already registered and approved.',
            'rejected': 'A previous registration for this child was rejected. Please contact the school.',
          };
          
          throw new Error(
            statusMessages[existingRegistration.status] || 
            `A registration for ${formData.studentFirstName} ${formData.studentLastName} already exists. Please contact the school if you need to update information.`
          );
        }
      }

      // Generate payment reference BEFORE insert
      const generatedPaymentReference = `REG-${new Date().getFullYear()}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      setPaymentReference(generatedPaymentReference);

      // Insert registration request with all fields
      const { data, error } = await supabase
        .from('registration_requests')
        .insert({
          organization_id: organizationId,
          // Guardian Information
          guardian_name: formData.guardianName,
          guardian_email: formData.guardianEmail,
          guardian_phone: formData.guardianPhone,
          guardian_id_number: formData.guardianIdNumber,
          guardian_address: formData.guardianAddress,
          guardian_occupation: formData.guardianOccupation,
          guardian_employer: formData.guardianEmployer,
          guardian_work_phone: formData.guardianWorkPhone,
          // Secondary Guardian
          secondary_guardian_name: formData.secondaryGuardianName,
          secondary_guardian_email: formData.secondaryGuardianEmail,
          secondary_guardian_phone: formData.secondaryGuardianPhone,
          secondary_guardian_relationship: formData.secondaryGuardianRelationship,
          // Parent Details
          mother_name: formData.motherName,
          mother_phone: formData.motherPhone,
          mother_email: formData.motherEmail,
          mother_occupation: formData.motherOccupation,
          mother_employer: formData.motherEmployer,
          father_name: formData.fatherName,
          father_phone: formData.fatherPhone,
          father_email: formData.fatherEmail,
          father_occupation: formData.fatherOccupation,
          father_employer: formData.fatherEmployer,
          // Student Information
          student_first_name: formData.studentFirstName,
          student_last_name: formData.studentLastName,
          student_dob: formData.studentDob,
          student_gender: formData.studentGender,
          student_nationality: formData.studentNationality,
          student_home_language: formData.studentHomeLanguage,
          // Medical/Health
          student_medical_conditions: formData.studentMedicalConditions,
          student_allergies: formData.studentAllergies,
          student_medication: formData.studentMedication,
          student_dietary_requirements: formData.studentDietaryRequirements,
          doctor_name: formData.doctorName,
          doctor_phone: formData.doctorPhone,
          immunization_record: formData.immunizationRecord,
          // Emergency Contact
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          emergency_contact_relationship: formData.emergencyContactRelationship,
          // Registration Details
          preferred_class: autoAssignedClass?.name || '',
          preferred_start_date: formData.preferredStartDate,
          previous_school: formData.previousSchool,
          reason_for_transfer: formData.reasonForTransfer,
          special_requests: formData.specialRequests,
          how_did_you_hear: formData.howDidYouHear,
          coupon_code: formData.couponCode,
          sibling_enrolled: formData.siblingEnrolled,
          sibling_student_id: formData.siblingStudentId || null,
          // Preschool-Specific
          sleeping_habits: formData.sleepingHabits,
          feeding_habits: formData.feedingHabits,
          toilet_trained: formData.toiletTrained,
          favourite_activities: formData.favouriteActivities,
          behavioral_concerns: formData.behavioralConcerns,
          developmental_delays: formData.developmentalDelays,
          special_needs: formData.specialNeeds,
          // Transport
          transport_required: formData.transportRequired,
          transport_pickup_address: formData.transportPickupAddress,
          transport_dropoff_address: formData.transportDropoffAddress,
          preferred_meal_plan: formData.preferredMealPlan,
          authorized_pickup_persons: formData.authorizedPickupPersons,
          // Cultural/Religious
          religious_considerations: formData.religiousConsiderations,
          cultural_considerations: formData.culturalConsiderations,
          // Consents
          consent_photography: formData.consentPhotography,
          consent_marketing: formData.consentMarketing,
          terms_accepted: formData.termsAccepted,
          photo_id_required: formData.photoIDRequired,
          // System Fields
          campaign_applied: campaignId || null,
          discount_amount: discountAmount,
          registration_fee_amount: finalAmount,
          registration_fee_paid: false,
          academic_year: '2026',
          status: 'pending',
          priority_points: formData.siblingEnrolled ? 5 : 0,
          documents: additionalData,
          payment_reference: generatedPaymentReference,
        })
        .select()
        .single();

      if (error) throw error;

      // Remove the old payment reference update - it's now in the insert above
      // Payment reference is already set in the initial insert

      // Store campaign info before resetting form
      if (campaignInfo && campaignInfo.valid) {
        setSubmittedWithDiscount(campaignInfo);
      }

      // Send confirmation email to parent
      try {
        const emailResponse = await fetch('/api/registrations/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parentEmail: formData.guardianEmail,
            parentName: formData.guardianName,
            studentName: `${formData.studentFirstName} ${formData.studentLastName}`,
            schoolName: schoolName || 'Young Eagles Preschool',
            registrationFee: finalAmount,
            discountApplied: discountAmount > 0,
            discountAmount: discountAmount,
            registrationId: data.id,
            paymentReference: generatedPaymentReference,
            organizationSlug: slug || 'young-eagles',
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the registration if email fails
      }

      setSubmitted(true);
      console.log('Registration submitted successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Registration Submitted!
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Thank you for registering {formData.studentFirstName} {formData.studentLastName} for the
            2026 academic year at {schoolName}.
          </p>
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
              💳 Payment Required
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium">
                Registration Fee: <span className="text-lg font-bold">R{submittedWithDiscount ? '200.00' : '400.00'}</span>
              </p>
              {submittedWithDiscount && (
                <p className="text-green-700 dark:text-green-400">
                  ✓ {submittedWithDiscount.discount}% discount applied with {submittedWithDiscount.code}!
                </p>
              )}
              <div className="mt-3 rounded-md bg-white/50 p-3 dark:bg-gray-800/50">
                <p className="font-semibold mb-2">Bank Transfer Details:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Bank:</strong> First National Bank (FNB)</p>
                  <p><strong>Account Name:</strong> Young Eagles Education Platform</p>
                  <p><strong>Account Number:</strong> 62777403181 </p>
                  <p><strong>Reference:</strong> {paymentReference.split('-').pop()}</p>
                </div>
              </div>
              <p className="mt-2 text-xs">
                📧 Payment details sent to {formData.guardianEmail}
              </p>
              <div className="mt-3 rounded-md bg-amber-50 p-3 border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Important Next Steps:</p>
                <ol className="text-xs text-amber-800 space-y-1 ml-4 list-decimal">
                  <li>Make payment using bank details above</li>
                  <li>Check your email for confirmation link</li>
                  <li><strong>Click "Upload Proof of Payment" button in email</strong></li>
                  <li>Upload your payment slip/screenshot</li>
                  <li>Wait for admin verification (1-2 business days)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
              What happens next?
            </h3>
            <ul className="space-y-2 text-left text-sm text-blue-800 dark:text-blue-300">
              <li>✓ Confirmation email sent to {formData.guardianEmail}</li>
              <li>✓ Make payment using the bank details above</li>
              <li>✓ Upload proof of payment (link in email)</li>
              <li>✓ Admin verifies payment (1-2 business days)</li>
              <li>✓ Application approved & student account created</li>
              <li>✓ You&apos;ll receive login details for the app</li>
            </ul>
          </div>

          {/* Download App Section */}
          <div className="mb-6 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="mb-3 text-lg font-semibold text-purple-900 dark:text-purple-100">
              📱 Get the EduDash Pro App
            </h3>
            <p className="mb-4 text-sm text-purple-800 dark:text-purple-200">
              Once approved, you'll receive login details to access our mobile app where you can:
            </p>
            <ul className="mb-4 space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                View homework and lessons
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Track your child&apos;s progress
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Chat with teachers
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Manage payments and fees
              </li>
            </ul>
            
            <div className="mb-4 rounded-lg bg-purple-100/50 p-3 dark:bg-purple-900/30">
              <p className="text-center text-sm font-medium text-purple-900 dark:text-purple-200">
                📲 Install the EduDash Pro app now for the best experience!
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${formData.guardianEmail}?subject=Registration%20Approved%20for%20${formData.studentFirstName}%20${formData.studentLastName}&body=Thank%20you%20for%20registering%20at%20${encodeURIComponent(schoolName)}.%0A%0APlease%20check%20your%20email%20for%20the%20approval%20notification%20and%20next%20steps.`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Go to Email
              </a>
              
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Click the button above to open your email app and check for your registration confirmation.
                <br />
                <strong>Important:</strong> You will receive login details via email once your registration is approved.
              </p>
              
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="mb-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  📱 Native apps coming soon to:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    Google Play
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                    </svg>
                    App Store
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setSubmittedWithDiscount(null);
              setFormData(getInitialFormState());
            }}
            className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Organization Branding Header */}
      {organizationBranding && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-4">
            {organizationBranding.logo_url && (
              <img 
                src={organizationBranding.logo_url} 
                alt={`${organizationBranding.name} logo`}
                className="h-16 w-16 rounded-lg object-contain"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {organizationBranding.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                edusitepro.vercel.app/{slug || organizationBranding.slug}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {organizationBranding.organization_type.replace(/_/g, ' ').toUpperCase()}
                </span>
                {organizationBranding.registration_open && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Registration Open
                  </span>
                )}
              </div>
            </div>
          </div>
          {organizationBranding.registration_message && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              {organizationBranding.registration_message}
            </p>
          )}
        </div>
      )}

      {/* Limited Time Offer Banner */}
      {organizationId === 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' && (
        <div className="mb-6 overflow-hidden rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-1 shadow-xl">
          <div className="rounded-md bg-white p-5 dark:bg-gray-800">
            <div className="w-full">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-2">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    🎉 Limited Time Offer!
                  </h3>
                </div>
                {liveSpots !== null && (
                  <span className={`animate-pulse rounded-full px-3 py-1 text-xs font-bold text-white ${
                    liveSpots <= 10 ? 'bg-red-600' : liveSpots <= 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {liveSpots > 0 ? `${liveSpots} SPOTS LEFT` : 'SOLD OUT'}
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="font-bold text-red-600">Was R400.00, now <span className="text-green-600">R200.00</span>!</span><br />
                Be one of the first 50 families to register and get <strong className="text-purple-600 dark:text-purple-400">50% OFF</strong> your registration fee!
              </p>
                <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-3 dark:from-purple-900/30 dark:to-pink-900/30">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="w-full">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Use code: <span className="font-mono text-base sm:text-lg text-purple-600 dark:text-purple-400">WELCOME2026</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Valid until January 30, 2026
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">50% OFF</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Registration Fee</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Fee Structure Banner */}
      <div className="mb-6 overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
              💰
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Monthly Fee Structure
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                6 months - 1 year
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R850<span className="text-sm font-normal text-gray-500">/month</span>
              </p>
            </div>
            
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                1 - 3 years
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R720<span className="text-sm font-normal text-gray-500">/month</span>
              </p>
            </div>
            
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                4 - 6 years
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R680<span className="text-sm font-normal text-gray-500">/month</span>
              </p>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <span className="text-blue-500">ℹ️</span>
            <span>Monthly fees are charged in addition to the one-time registration fee. Bank transfers are free. ATM deposits and cash payments incur a R20 processing fee.</span>
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {organizationBranding?.organization_type === 'preschool' ? 'Student Registration for 2026' :
           organizationBranding?.organization_type === 'fet_college' ? 'Student Application 2026' :
           organizationBranding?.organization_type === 'training_center' ? 'Course Registration 2026' :
           'Registration 2026'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {schoolName} - School Code: <span className="font-mono font-semibold">{schoolCode}</span>
        </p>
      </div>

      {/* Guardian Information */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            1
          </span>
          Parent/Guardian Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border px-4 py-2 pr-10 focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  emailValidation.exists
                    ? 'border-red-500 focus:ring-red-500'
                    : emailValidation.message === '✅ Email available'
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                }`}
                placeholder="john@example.com"
              />
              {emailValidation.checking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {emailValidation.message && (
              <p
                className={`mt-1 text-sm ${
                  emailValidation.exists
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {emailValidation.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+27 11 123 4567"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Occupation
            </label>
            <input
              type="text"
              name="guardianOccupation"
              value={formData.guardianOccupation}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Teacher, Engineer"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Employer
            </label>
            <input
              type="text"
              name="guardianEmployer"
              value={formData.guardianEmployer}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Company name"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Work Phone
            </label>
            <input
              type="tel"
              name="guardianWorkPhone"
              value={formData.guardianWorkPhone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+27 11 987 6543"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Home Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="guardianAddress"
              value={formData.guardianAddress}
              onChange={handleChange}
              required
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="123 Main Street, Johannesburg, Gauteng, 2001"
            />
            
            {/* Nearby Schools Suggestion */}
            {showNearbySchools && nearbySchools.length > 0 && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-300">
                  <MapPin className="h-4 w-4" />
                  Schools near you:
                </div>
                <div className="space-y-2">
                  {nearbySchools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between rounded bg-white p-2 text-sm dark:bg-gray-800">
                      <div className="w-full">
                        <div className="font-medium text-gray-900 dark:text-white">{school.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {school.city}, {school.province}
                        </div>
                      </div>
                      <a
                        href={`/${school.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNearbySchools(false)}
                  className="mt-2 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Secondary Guardian (Optional) - configurable */}
      {formConfig.showSecondaryGuardian && (
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            1b
          </span>
          Secondary Guardian (Optional)
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="secondaryGuardianName"
              value={formData.secondaryGuardianName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Jane Doe"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              name="secondaryGuardianEmail"
              value={formData.secondaryGuardianEmail}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="jane@example.com"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              name="secondaryGuardianPhone"
              value={formData.secondaryGuardianPhone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+27 82 123 4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Relationship to Student
            </label>
            <input
              type="text"
              name="secondaryGuardianRelationship"
              value={formData.secondaryGuardianRelationship}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Father, Mother, Grandmother"
            />
          </div>
        </div>
      </section>
      )}

      {/* Student Information */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
            2
          </span>
          Student Information
        </h2>

        {/* Document Requirements Notice */}
        <div className="mb-6 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                📱 Required Documents - Upload via EduDash Pro App
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                After registration approval, you <strong>must upload the following documents within 7 days</strong> using the <strong>EduDash Pro mobile app</strong>:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-300 ml-4">
                <li>• Student Birth Certificate</li>
                <li>• Student Clinic Card (Road to Health Card)</li>
                <li>• Parent/Guardian ID Document</li>
              </ul>
              <p className="mt-3 text-xs text-orange-700 dark:text-orange-400 font-semibold">
                ⚠️ Document upload is NOT available during registration. You will receive app login details after your application is approved.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentFirstName"
              value={formData.studentFirstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Sarah"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentLastName"
              value={formData.studentLastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Doe"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="studentDob"
              value={formData.studentDob}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="studentGender"
              value={formData.studentGender}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nationality
            </label>
            <input
              type="text"
              name="studentNationality"
              value={formData.studentNationality}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="South African"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Home Language
            </label>
            <input
              type="text"
              name="studentHomeLanguage"
              value={formData.studentHomeLanguage}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="English"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Medical Conditions
            </label>
            <textarea
              name="studentMedicalConditions"
              value={formData.studentMedicalConditions}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Any chronic conditions, asthma, epilepsy, etc."
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Allergies
            </label>
            <input
              type="text"
              name="studentAllergies"
              value={formData.studentAllergies}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Peanuts, Dairy"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Medication
            </label>
            <input
              type="text"
              name="studentMedication"
              value={formData.studentMedication}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Any daily medication"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dietary Requirements
            </label>
            <input
              type="text"
              name="studentDietaryRequirements"
              value={formData.studentDietaryRequirements}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Vegetarian, Halaal, etc."
            />
          </div>
        </div>
      </section>

      {/* Doctor Information (configurable) */}
      {formConfig.showDoctorInfo && (
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-900 dark:text-red-300">
            2b
          </span>
          Doctor Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Doctor's Name
            </label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Dr. Smith"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Doctor's Phone
            </label>
            <input
              type="tel"
              name="doctorPhone"
              value={formData.doctorPhone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+27 11 456 7890"
            />
          </div>
        </div>
      </section>
      )}

      {/* Emergency Contact (configurable) */}
      {formConfig.showEmergencyContact && (
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 dark:bg-orange-900 dark:text-orange-300">
            2c
          </span>
          Emergency Contact
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Emergency contact name"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+27 82 987 6543"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Relationship to Student <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Aunt, Uncle, Family Friend"
            />
          </div>
        </div>
      </section>
      )}

      {/* Preschool-Specific Sections */}
      {organizationBranding?.organization_type === 'preschool' && formConfig.showDetailedParentInfo && (
        <>
          {/* Parental Details */}
          <section className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                👨‍👩‍👧
              </span>
              Detailed Parental Information
            </h2>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Mother&apos;s Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mother&apos;s Full Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mother&apos;s Phone
                  </label>
                  <input
                    type="tel"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="+27 82 123 4567"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mother&apos;s Email
                  </label>
                  <input
                    type="email"
                    name="motherEmail"
                    value={formData.motherEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mother&apos;s Occupation
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Teacher"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mother&apos;s Employer
                  </label>
                  <input
                    type="text"
                    name="motherEmployer"
                    value={formData.motherEmployer}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Company name"
                  />
                </div>
              </div>
            </div>

            <div className="w-full">
              <h3 className="mb-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Father&apos;s Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father&apos;s Full Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father&apos;s Phone
                  </label>
                  <input
                    type="tel"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="+27 82 765 4321"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father&apos;s Email
                  </label>
                  <input
                    type="email"
                    name="fatherEmail"
                    value={formData.fatherEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father&apos;s Occupation
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Engineer"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father&apos;s Employer
                  </label>
                  <input
                    type="text"
                    name="fatherEmployer"
                    value={formData.fatherEmployer}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Company name"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Child Development & Care */}
          <section className="mb-8 bg-green-50 dark:bg-green-900/10 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
                👶
              </span>
              Child Development & Daily Care
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Toilet Trained?
                </label>
                <select
                  name="toiletTrained"
                  value={formData.toiletTrained}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Immunization Record Status
                </label>
                <select
                  name="immunizationRecord"
                  value={formData.immunizationRecord}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select</option>
                  <option value="up-to-date">Up to Date</option>
                  <option value="pending">Pending</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sleeping Habits & Nap Times
                </label>
                <textarea
                  name="sleepingHabits"
                  value={formData.sleepingHabits}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Naps from 1pm-3pm, sleeps with blanket"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Feeding Habits & Food Preferences
                </label>
                <textarea
                  name="feedingHabits"
                  value={formData.feedingHabits}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Eats most foods, dislikes vegetables, uses sippy cup"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Favourite Activities & Interests
                </label>
                <textarea
                  name="favouriteActivities"
                  value={formData.favouriteActivities}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Loves painting, building blocks, outdoor play"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Behavioral Concerns or Challenges
                </label>
                <textarea
                  name="behavioralConcerns"
                  value={formData.behavioralConcerns}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any behavioral issues we should be aware of"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Developmental Delays or Special Needs
                </label>
                <textarea
                  name="developmentalDelays"
                  value={formData.developmentalDelays}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any developmental concerns or diagnosed conditions"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Special Needs or Accommodations Required
                </label>
                <textarea
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any special accommodations needed"
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* Registration Details */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            3
          </span>
          Registration Details
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigned Class <span className="text-blue-500 text-xs">(Auto-assigned based on age)</span>
            </label>
            <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {autoAssignedClass ? (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {autoAssignedClass.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({autoAssignedClass.range})
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">
                  {formData.studentDob ? 'Calculating...' : 'Enter child\'s date of birth first'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Class assignment is based on your child's age. Our admin team will confirm placement.
            </p>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="preferredStartDate"
              value={formData.preferredStartDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Previous School (if applicable)
            </label>
            <input
              type="text"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Name of previous school"
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason for Transfer
            </label>
            <input
              type="text"
              name="reasonForTransfer"
              value={formData.reasonForTransfer}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Why transferring schools?"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              How did you hear about us?
            </label>
            <select
              name="howDidYouHear"
              value={formData.howDidYouHear}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select an option</option>
              <option value="Google Search">Google Search</option>
              <option value="Social Media">Social Media</option>
              <option value="Friend/Family Referral">Friend/Family Referral</option>
              <option value="Local Advertisement">Local Advertisement</option>
              <option value="School Website">School Website</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Promo/Coupon Code (Optional)
              <span className="ml-2 text-xs text-gray-500">Have a discount code? Enter it here</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono uppercase focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="WELCOME2026"
                maxLength={20}
              />
              {validatingCoupon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Promo Code Status Display */}
            {campaignInfo && (
              <div className={`mt-2 rounded-lg border p-3 ${
                campaignInfo.valid 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}>
                {campaignInfo.valid ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {campaignInfo.discount}% Discount Applied!
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        🎉 Only {campaignInfo.remaining} of {campaignInfo.maxRedemptions} spots remaining!
                      </span>
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                        {campaignInfo.remaining} LEFT
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      Sorry, all {campaignInfo.maxRedemptions} discount slots have been claimed.
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {formData.couponCode && !campaignInfo && !validatingCoupon && (
              <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Invalid or expired code. Registration will proceed without discount.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="siblingEnrolled"
                checked={formData.siblingEnrolled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I have another child already enrolled at this school
              </span>
            </label>
          </div>

          {formData.siblingEnrolled && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sibling&apos;s Student ID (if known)
              </label>
              <input
                type="text"
                name="siblingStudentId"
                value={formData.siblingStudentId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="YE-2024-0123"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Special Requests or Additional Information
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Any special requirements we should know about..."
            />
          </div>
        </div>
      </section>

      {/* Consents & Terms */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-600 dark:bg-teal-900 dark:text-teal-300">
            4
          </span>
          Consents & Terms
        </h2>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="consentPhotography"
              checked={formData.consentPhotography}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I consent to my child being photographed/videoed for school activities and promotional materials
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="consentMarketing"
              checked={formData.consentMarketing}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I agree to receive updates and newsletters from {schoolName} via email
            </span>
          </label>

          <div className="border-t border-gray-300 pt-4 dark:border-gray-600">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-900 dark:text-white">
                I accept the{' '}
                {organizationBranding?.terms_and_conditions_url ? (
                  <a
                    href={organizationBranding.terms_and_conditions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    terms and conditions
                  </a>
                ) : organizationBranding?.terms_and_conditions_text ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
                      modal.innerHTML = `
                        <div class="relative max-w-2xl max-h-[80vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                          <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onclick="this.closest('.fixed').remove()">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms and Conditions</h2>
                          <div class="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">${organizationBr