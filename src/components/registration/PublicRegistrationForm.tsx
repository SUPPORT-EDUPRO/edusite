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

interface ClassOption {
  id: string;
  name: string;
  grade_level: string;
  max_students: number;
  current_students: number;
  class_type?: string;
  age_range?: string;
  duration?: string;
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
  studentIdNumber: '',
  studentNationality: '',
  studentHomeLanguage: '',
  studentMedicalConditions: '',
  studentAllergies: '',
  studentMedication: '',
  studentDietaryRequirements: '',
  doctorName: '',
  doctorPhone: '',
  preferredClass: '',
  preferredStartDate: '',
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
  birthCertificateNumber: '',
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
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(initialBranding);
  const [formData, setFormData] = useState(getInitialFormState());
  const [nearbySchools, setNearbySchools] = useState<NearbySchool[]>([]);
  const [showNearbySchools, setShowNearbySchools] = useState(false);

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
    const required = [
      formData.guardianName,
      formData.guardianEmail,
      formData.guardianPhone,
      formData.guardianAddress,
      formData.studentFirstName,
      formData.studentLastName,
      formData.studentDob,
      formData.studentGender,
      formData.termsAccepted,
    ];

    // Add conditional required fields
    if (formConfig.showEmergencyContact) {
      required.push(
        formData.emergencyContactName,
        formData.emergencyContactPhone,
        formData.emergencyContactRelationship
      );
    }

    return required.every((field) => field !== '' && field !== false);
  };

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

  const fetchAvailableClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade_level, max_students, current_students, class_type, age_range, duration')
        .eq('organization_id', organizationId)
        .eq('academic_year', '2026')
        .eq('active', true)
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setAvailableClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  }, [organizationId]);

  // Fetch available classes for this organization
  useEffect(() => {
    fetchAvailableClasses();
  }, [fetchAvailableClasses]);

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
    
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }
    
    setLoading(true);

    try {
      // Validate and apply coupon code if provided
      let campaignId = null;
      let discountAmount = 0;
      
      if (formData.couponCode.trim()) {
        const { data: campaign, error: campaignError } = await supabase
          .from('marketing_campaigns')
          .select('id, discount_type, discount_percentage, discount_amount')
          .eq('organization_id', organizationId)
          .eq('coupon_code', formData.couponCode.trim().toUpperCase())
          .eq('active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .maybeSingle();

        if (campaignError) {
          console.error('Error validating coupon:', campaignError);
        } else if (campaign) {
          campaignId = campaign.id;
          // Calculate discount (assuming a base registration fee exists)
          if (campaign.discount_type === 'percentage' && campaign.discount_percentage) {
            discountAmount = campaign.discount_percentage;
          } else if (campaign.discount_type === 'fixed' && campaign.discount_amount) {
            discountAmount = campaign.discount_amount;
          }
        } else if (formData.couponCode.trim()) {
          alert('Invalid or expired coupon code. Registration will proceed without discount.');
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
            birth_certificate_number: formData.birthCertificateNumber,
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

      // Insert registration request with all fields
      const { error } = await supabase
        .from('registration_requests')
        .insert({
          organization_id: organizationId,
          guardian_name: formData.guardianName,
          guardian_email: formData.guardianEmail,
          guardian_phone: formData.guardianPhone,
          guardian_id_number: formData.guardianIdNumber,
          guardian_address: formData.guardianAddress,
          guardian_occupation: formData.guardianOccupation,
          guardian_employer: formData.guardianEmployer,
          student_first_name: formData.studentFirstName,
          student_last_name: formData.studentLastName,
          student_dob: formData.studentDob,
          student_gender: formData.studentGender,
          student_id_number: formData.studentIdNumber,
          preferred_class: formData.preferredClass,
          preferred_start_date: formData.preferredStartDate,
          special_requests: formData.specialRequests,
          how_did_you_hear: formData.howDidYouHear,
          sibling_enrolled: formData.siblingEnrolled,
          sibling_student_id: formData.siblingStudentId || null,
          campaign_applied: campaignId,
          discount_amount: discountAmount,
          academic_year: '2026',
          status: 'pending',
          priority_points: formData.siblingEnrolled ? 5 : 0,
          documents: additionalData,
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Send confirmation email via API route
      // await fetch('/api/notifications/send', { ... });

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
              What happens next?
            </h3>
            <ul className="space-y-2 text-left text-sm text-blue-800 dark:text-blue-300">
              <li>✓ Confirmation email sent to {formData.guardianEmail}</li>
              <li>✓ Application under review (2-3 business days)</li>
              <li>✓ You&apos;ll receive approval/rejection notification</li>
              <li>✓ If approved, complete enrollment and pay fees</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
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

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
    >
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="guardianEmail"
              value={formData.guardianEmail}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ID Number (Optional)
            </label>
            <input
              type="text"
              name="guardianIdNumber"
              value={formData.guardianIdNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="8901015800089"
            />
          </div>

          <div>
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

          <div>
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

          <div>
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
                      <div>
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

          <div>
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

          <div>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Student ID Number (Optional)
            </label>
            <input
              type="text"
              name="studentIdNumber"
              value={formData.studentIdNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Birth certificate or ID number"
            />
          </div>

          <div>
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

          <div>
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

          <div>
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

          <div>
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
          <div>
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

          <div>
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
          <div>
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

          <div>
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
                <div>
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
                <div>
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
                <div>
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
                <div>
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

            <div>
              <h3 className="mb-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Father&apos;s Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
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
                <div>
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
                <div>
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
                <div>
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
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Birth Certificate Number
                </label>
                <input
                  type="text"
                  name="birthCertificateNumber"
                  value={formData.birthCertificateNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Birth certificate number"
                />
              </div>

              <div>
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

              <div>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Class <span className="text-red-500">*</span>
            </label>
            <select
              name="preferredClass"
              value={formData.preferredClass}
              onChange={handleChange}
              required
              disabled={loadingClasses}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                {loadingClasses ? 'Loading classes...' : 'Select preferred class'}
              </option>
              {availableClasses.map((classOption) => (
                <option key={classOption.id} value={classOption.id}>
                  {classOption.name}
                  {classOption.duration ? ` - ${classOption.duration}` : ` - ${classOption.grade_level}`}
                  {classOption.age_range ? ` (${classOption.age_range})` : ''}
                  {classOption.current_students >= classOption.max_students 
                    ? ' [Full]' 
                    : ` [${classOption.max_students - classOption.current_students} spots]`}
                </option>
              ))}
            </select>
          </div>

          <div>
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

          <div>
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

          <div>
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
            <input
              type="text"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono uppercase focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="WELCOME2026"
              maxLength={20}
            />
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
                          <div class="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">${organizationBranding.terms_and_conditions_text}</div>
                        </div>
                      `;
                      document.body.appendChild(modal);
                      modal.addEventListener('click', (event) => {
                        if (event.target === modal) modal.remove();
                      });
                    }}
                    className="text-teal-600 underline hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    terms and conditions
                  </button>
                ) : (
                  <span className="text-teal-600 underline">terms and conditions</span>
                )}{' '}
                and confirm that all information provided is accurate <span className="text-red-500">*</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="mb-6 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
          <h3 className="mb-3 text-lg font-semibold text-purple-900 dark:text-purple-100">
            📱 Get the EduDash Pro App
          </h3>
          <p className="mb-4 text-sm text-purple-800 dark:text-purple-200">
            After your registration is approved, you'll receive login details to access our mobile app where you can:
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
              📲 Install as a web app for the best experience!
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                if ('standalone' in window.navigator && (window.navigator as any).standalone) {
                  alert('App is already installed!');
                } else if (window.matchMedia('(display-mode: standalone)').matches) {
                  alert('App is already installed!');
                } else {
                  alert('To install:\n\n📱 iOS: Tap Share → Add to Home Screen\n\n🤖 Android: Tap Menu (⋮) → Install App');
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install Web App
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Coming Soon
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              By submitting this form, you confirm that all information provided is accurate. You
              will receive a confirmation email within 24 hours. Our admissions team will review
              your application and contact you within 2-3 business days.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition duration-200 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting Registration...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Submit Registration
            </>
          )}
        </button>

        {!isFormValid() && !loading && (
          <p className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400">
            Please fill in all required fields marked with <span className="text-red-500">*</span>
          </p>
        )}
      </div>
    </form>
  );
}
