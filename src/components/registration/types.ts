export interface OrganizationBranding {
  id: string;
  name: string;
  slug: string;
  school_code?: string;
  organization_type: 'preschool' | 'primary_school' | 'high_school' | 'k12_school' | 'fet_college' | 'training_center' | 'university' | 'other';
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  website_url?: string;
  registration_open: boolean;
  registration_message?: string;
  min_age?: number;
  max_age?: number;
  grade_levels?: string[];
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  terms_and_conditions_url?: string;
  terms_and_conditions_text?: string;
  form_config?: {
    showDetailedParentInfo?: boolean;
    showSecondaryGuardian?: boolean;
    showTransport?: boolean;
    showMealPlan?: boolean;
    showDoctorInfo?: boolean;
    showEmergencyContact?: boolean;
  } | null;
}

export interface PublicRegistrationFormProps {
  organizationId: string;
  schoolCode: string;
  schoolName?: string;
  slug?: string;
  initialBranding?: OrganizationBranding | null;
}
