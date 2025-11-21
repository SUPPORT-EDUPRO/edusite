// Helper functions for organization-type-specific registration forms

export type OrganizationType =
  | 'preschool'
  | 'primary_school'
  | 'high_school'
  | 'k12_school'
  | 'fet_college'
  | 'training_center'
  | 'university'
  | 'other';

interface FormSection {
  id: string;
  title: string;
  description?: string;
  visible: boolean;
}

export function getFormSections(orgType: OrganizationType): Record<string, FormSection> {
  const basePreschool = orgType === 'preschool';
  const isTrainingCenter = orgType === 'training_center';
  const isFetCollege = orgType === 'fet_college';
  const isK12 = ['primary_school', 'high_school', 'k12_school'].includes(orgType);

  return {
    guardian: {
      id: 'guardian',
      title: basePreschool
        ? 'Parent/Guardian Information'
        : isTrainingCenter
          ? 'Contact Information'
          : 'Parent/Guardian Information',
      visible: true,
    },
    student: {
      id: 'student',
      title: basePreschool
        ? 'Child Information'
        : isTrainingCenter
          ? 'Participant Information'
          : 'Student Information',
      visible: true,
    },
    preschoolSpecific: {
      id: 'preschoolSpecific',
      title: 'Preschool-Specific Details',
      description: 'Additional information for early childhood care',
      visible: basePreschool,
    },
    medicalInfo: {
      id: 'medicalInfo',
      title: 'Medical & Health Information',
      visible: basePreschool || isK12,
    },
    academic: {
      id: 'academic',
      title: 'Academic History',
      visible: isK12 || isFetCollege || orgType === 'university',
    },
    courseSelection: {
      id: 'courseSelection',
      title: 'Course/Program Selection',
      visible: isTrainingCenter || isFetCollege || orgType === 'university',
    },
    classSelection: {
      id: 'classSelection',
      title: basePreschool ? 'Class Preference' : 'Grade/Class Preference',
      visible: basePreschool || isK12,
    },
    transport: {
      id: 'transport',
      title: 'Transport Requirements',
      visible: basePreschool || isK12,
    },
    emergency: {
      id: 'emergency',
      title: 'Emergency Contact',
      visible: true,
    },
    additionalNotes: {
      id: 'additionalNotes',
      title: 'Additional Information',
      visible: true,
    },
    consent: {
      id: 'consent',
      title: 'Consent & Terms',
      visible: true,
    },
  };
}

export function getFieldLabels(orgType: OrganizationType) {
  const isTrainingCenter = orgType === 'training_center';
  const basePreschool = orgType === 'preschool';

  return {
    studentLabel: basePreschool ? 'Child' : isTrainingCenter ? 'Participant' : 'Student',
    guardianLabel: isTrainingCenter ? 'Contact Person' : 'Parent/Guardian',
    dobLabel: basePreschool ? 'Date of Birth' : 'Date of Birth',
    classLabel: basePreschool
      ? 'Preferred Class'
      : isTrainingCenter
        ? 'Course/Program'
        : 'Grade/Class',
    startDateLabel: isTrainingCenter ? 'Preferred Start Date' : 'Academic Year Start',
  };
}

export function shouldShowField(fieldName: string, orgType: OrganizationType): boolean {
  const preschoolOnly = [
    'birthCertificateNumber',
    'immunizationRecord',
    'motherName',
    'motherPhone',
    'motherEmail',
    'motherOccupation',
    'motherEmployer',
    'fatherName',
    'fatherPhone',
    'fatherEmail',
    'fatherOccupation',
    'fatherEmployer',
    'sleepingHabits',
    'feedingHabits',
    'toiletTrained',
    'favouriteActivities',
    'behavioralConcerns',
    'developmentalDelays',
  ];

  const trainingOnly = [
    'employmentStatus',
    'currentEmployer',
    'yearsExperience',
    'educationLevel',
    'previousQualifications',
  ];

  if (orgType === 'preschool' && preschoolOnly.includes(fieldName)) {
    return true;
  }

  if (orgType === 'training_center' && trainingOnly.includes(fieldName)) {
    return true;
  }

  if (preschoolOnly.includes(fieldName) && orgType !== 'preschool') {
    return false;
  }

  if (trainingOnly.includes(fieldName) && orgType !== 'training_center') {
    return false;
  }

  return true;
}

export function getEmptyStateMessage(section: string, orgType: OrganizationType): string {
  const isTrainingCenter = orgType === 'training_center';
  const basePreschool = orgType === 'preschool';

  if (section === 'classes') {
    if (basePreschool) {
      return 'No classes are currently available. Please contact the school directly.';
    }
    if (isTrainingCenter) {
      return 'No courses are currently open for registration. Please check back later or contact us.';
    }
    return 'No grade levels are available at this time. Please contact admissions.';
  }

  return 'Information not available at this time.';
}
