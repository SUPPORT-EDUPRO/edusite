# Registration Form Enhancements - 2026 Student Intake

## Overview
The `PublicRegistrationForm` component has been significantly enhanced to support:
1. **Dynamic class loading** - Fetches available classes from database per organization
2. **Comprehensive data collection** - Expanded from 12 to 38 fields
3. **Multi-tenant support** - Works for any school in the platform
4. **Better UX** - Organized into logical sections with validation

## Key Features Added

### 1. Dynamic Class Selection
- Classes are now loaded from the database based on `organization_id` and `academic_year`
- Shows real-time availability (e.g., "Grade R - 5 spots left" or "Full")
- Automatically filters to active classes only
- Loading state while fetching data

```typescript
// Classes are fetched on component mount
useEffect(() => {
  fetchAvailableClasses();
}, []);

const fetchAvailableClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, grade_level, max_students, current_students')
    .eq('organization_id', organizationId)
    .eq('academic_year', '2026')
    .eq('active', true);
  // ...
};
```

### 2. New Form Sections

#### Section 1b: Secondary Guardian (Optional)
- Full name
- Email address
- Phone number
- Relationship to student

#### Section 2 (Enhanced): Student Information
**New fields added:**
- Nationality
- Home language
- Medical conditions (textarea)
- Allergies
- Current medication
- Dietary requirements

#### Section 2b: Doctor Information
- Doctor's name
- Doctor's phone number

#### Section 2c: Emergency Contact (Required)
- Contact name*
- Contact phone*
- Relationship to student*

#### Section 3 (Enhanced): Registration Details
**New fields added:**
- Previous school (if applicable)
- Reason for transfer

#### Section 4: Consents & Terms (New)
- Photography/video consent (optional)
- Marketing communications consent (optional)
- Terms and conditions acceptance (required)*

## Field Breakdown

### Total Fields: 38

#### Guardian Information (8 fields)
1. Guardian Name*
2. Guardian Email*
3. Guardian Phone*
4. Guardian ID Number
5. Guardian Address*
6. Guardian Occupation
7. Guardian Employer
8. Guardian Work Phone

#### Secondary Guardian (4 fields - all optional)
9. Secondary Guardian Name
10. Secondary Guardian Email
11. Secondary Guardian Phone
12. Secondary Guardian Relationship

#### Student Information (13 fields)
13. Student First Name*
14. Student Last Name*
15. Student Date of Birth*
16. Student Gender*
17. Student ID Number
18. Student Nationality
19. Student Home Language
20. Student Medical Conditions
21. Student Allergies
22. Student Medication
23. Student Dietary Requirements

#### Doctor Information (2 fields)
24. Doctor Name
25. Doctor Phone

#### Emergency Contact (3 fields)
26. Emergency Contact Name*
27. Emergency Contact Phone*
28. Emergency Contact Relationship*

#### Registration Details (7 fields)
29. Preferred Class* (dynamic from database)
30. Preferred Start Date*
31. Previous School
32. Reason for Transfer
33. How Did You Hear
34. Sibling Enrolled (checkbox)
35. Sibling Student ID

#### Additional Information (1 field)
36. Special Requests (textarea)

#### Consents (3 fields)
37. Photography Consent (checkbox)
38. Marketing Consent (checkbox)
39. Terms Accepted* (checkbox, required)

*Required fields marked with asterisk

## Database Storage

All new fields are stored in the `registration_requests` table:

### Direct Columns (original 12 fields)
- `guardian_name`, `guardian_email`, `guardian_phone`, `guardian_id_number`, `guardian_address`, `guardian_occupation`
- `student_first_name`, `student_last_name`, `student_dob`, `student_gender`, `student_id_number`
- `preferred_class`, `preferred_start_date`, `special_requests`, `how_did_you_hear`, `sibling_enrolled`, `sibling_student_id`
- `academic_year`, `status`, `priority_points`

### JSONB Column: `documents`
All 26 new fields are stored in the `documents` JSONB column with this structure:

```json
{
  "guardian_employer": "...",
  "guardian_work_phone": "...",
  "secondary_guardian": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "relationship": "..."
  },
  "student_details": {
    "nationality": "...",
    "home_language": "...",
    "medical_conditions": "...",
    "allergies": "...",
    "medication": "...",
    "dietary_requirements": "...",
    "doctor_name": "...",
    "doctor_phone": "...",
    "previous_school": "...",
    "reason_for_transfer": "..."
  },
  "emergency_contact": {
    "name": "...",
    "phone": "...",
    "relationship": "..."
  },
  "consents": {
    "photography": true/false,
    "marketing": true/false
  }
}
```

## Validation Rules

### Required Fields (11)
1. Guardian Name
2. Guardian Email
3. Guardian Phone
4. Guardian Address
5. Student First Name
6. Student Last Name
7. Student Date of Birth
8. Student Gender
9. Preferred Class
10. Preferred Start Date
11. Emergency Contact Name
12. Emergency Contact Phone
13. Emergency Contact Relationship
14. Terms Accepted (checkbox)

### Client-Side Validation
- Email format validation (HTML5)
- Date validation (student DOB must be in past, start date must be in future)
- Phone number format (accepts international format)
- Terms acceptance must be checked before submission

### Business Logic Validation
- Terms must be accepted or form won't submit (alert shown)
- If sibling enrolled is checked, sibling ID field becomes available
- Classes marked as "Full" can still be selected (waitlist feature)

## Component Props

```typescript
interface PublicRegistrationFormProps {
  organizationId: string;    // Required - identifies which school
  schoolCode: string;        // Required - for confirmation messages
  schoolName?: string;       // Optional - defaults to "Our School"
}
```

## State Management

### Form State Helper
```typescript
const getInitialFormState = () => ({
  // Returns object with all 38 fields initialized to empty strings/false
});

const [formData, setFormData] = useState(getInitialFormState());
```

### Dynamic Data State
```typescript
const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
const [loadingClasses, setLoadingClasses] = useState(true);
```

### Submission State
```typescript
const [loading, setLoading] = useState(false);
const [submitted, setSubmitted] = useState(false);
```

## UX Improvements

### Visual Organization
- 6 distinct sections with numbered badges and color-coding
- Section 1: Blue (Parent/Guardian)
- Section 1b: Indigo (Secondary Guardian)
- Section 2: Green (Student)
- Section 2b: Red (Doctor)
- Section 2c: Orange (Emergency Contact)
- Section 3: Purple (Registration)
- Section 4: Teal (Consents)

### Responsive Design
- All form sections use `grid grid-cols-1 md:grid-cols-2`
- Full-width fields use `md:col-span-2`
- Mobile-first approach with proper spacing

### Loading States
- Class dropdown shows "Loading classes..." while fetching
- Submit button shows spinner and "Submitting Registration..." during submission
- Form fields disabled while loading

### User Feedback
- Success screen shows checkmark and confirmation message
- Error handling with alert dialogs
- Clear field labels with asterisks for required fields
- Placeholder text provides examples

## Integration with Website Builder

### Future Integration Points

When integrating this form into the website builder:

1. **Organization Context**
   - Builder must pass `organizationId` from tenant context
   - Builder must pass `schoolCode` for branding
   - Builder can customize `schoolName` prop

2. **Styling Customization**
   - Form uses Tailwind classes for easy theme overrides
   - Section colors can be customized via CSS variables
   - Dark mode fully supported

3. **Field Configuration**
   - Schools can toggle optional sections on/off
   - Custom fields can be added to `documents` JSONB column
   - Terms and conditions link can point to school-specific page

4. **Workflow Customization**
   - Email notifications can be customized per school
   - Approval workflow configurable in database
   - Priority points algorithm can be adjusted

5. **Multi-Language Support**
   - All text is in English (default)
   - Ready for i18n integration with field labels as keys
   - Placeholder text can be translated

## Testing Checklist

### Functional Tests
- [ ] Form loads classes dynamically for different organizations
- [ ] Required field validation works
- [ ] Terms acceptance prevents submission if unchecked
- [ ] Sibling ID field appears when sibling checkbox is checked
- [ ] Form submits successfully with all fields
- [ ] Form submits successfully with only required fields
- [ ] Success screen shows and form resets correctly
- [ ] Error handling works for network failures

### Data Tests
- [ ] All 38 fields save correctly to database
- [ ] JSONB `documents` column structure is correct
- [ ] Class IDs are stored correctly (not class names)
- [ ] Empty optional fields don't cause errors

### UI/UX Tests
- [ ] Form is fully responsive on mobile, tablet, desktop
- [ ] Dark mode renders correctly
- [ ] Loading states show appropriately
- [ ] Form sections are clearly organized
- [ ] Field labels and placeholders are helpful

### Multi-Tenant Tests
- [ ] Different organizations see different classes
- [ ] Classes filtered to academic year 2026 only
- [ ] Inactive classes don't appear
- [ ] Full classes show availability correctly

## Next Steps

1. **Email Notifications**
   - Build API route for sending confirmation emails
   - Template for registration confirmation
   - Template for admin notification

2. **Dashboard Enhancement**
   - Update `RegistrationDashboard` to display all new fields
   - Add export functionality for complete data
   - Add filtering by new fields (e.g., medical conditions)

3. **Document Management**
   - Add file upload for birth certificate
   - Add file upload for medical documents
   - Store document URLs in `documents` JSONB

4. **Approval Workflow**
   - Email notifications on status change
   - Automated class assignment on approval
   - Waitlist management for full classes

5. **Reporting**
   - Registration statistics by date range
   - Medical conditions summary report
   - Dietary requirements for catering planning

## File Locations

- **Component**: `/src/components/registration/PublicRegistrationForm.tsx`
- **Dashboard**: `/src/components/registration/RegistrationDashboard.tsx`
- **Database Schema**: `/supabase/migrations/20251116_student_registration_2026_schema.sql`
- **Documentation**: `/REGISTRATION_IMPLEMENTATION_SUMMARY.md`
- **Integration Guide**: `/WEBSITE_BUILDER_REGISTRATION_INTEGRATION.md`

## Support

For questions or issues:
1. Check database schema for field availability
2. Verify RLS policies allow data insertion
3. Check Supabase logs for query errors
4. Verify `organization_id` is valid and exists

---

**Last Updated**: November 16, 2024  
**Version**: 2.0 (Enhanced with dynamic classes and comprehensive fields)  
**Status**: ✅ Ready for Testing
