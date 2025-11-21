# Registration Form vs Database Field Comparison

## ✅ Fields Currently Being Saved:

### Basic Info
- ✅ organization_id
- ✅ guardian_name
- ✅ guardian_email  
- ✅ guardian_phone
- ✅ guardian_id_number
- ✅ guardian_address
- ✅ guardian_occupation
- ✅ guardian_employer

### Student Info
- ✅ student_first_name
- ✅ student_last_name
- ✅ student_dob
- ✅ student_gender
- ✅ student_id_number

### Registration Details
- ✅ preferred_class (auto-assigned)
- ✅ preferred_start_date
- ✅ special_requests
- ✅ how_did_you_hear
- ✅ sibling_enrolled
- ✅ sibling_student_id
- ✅ academic_year
- ✅ status
- ✅ priority_points
- ✅ campaign_applied
- ✅ discount_amount

### Stored in JSON (documents field)
All other form fields are stored in the `documents` JSONB column:
- guardianWorkPhone
- secondaryGuardian* (all fields)
- studentNationality
- studentHomeLanguage
- studentMedicalConditions
- studentAllergies
- studentMedication
- studentDietaryRequirements
- doctorName
- doctorPhone
- previousSchool
- reasonForTransfer
- emergencyContact* (all fields)
- consent* (all fields)
- Preschool-specific fields (birthCertificate, immunization, parents, habits, etc.)

## ❌ Missing Database Columns (Need to Add):

### Guardian/Parent Fields
- ❌ guardian_work_phone
- ❌ secondary_guardian_name
- ❌ secondary_guardian_email
- ❌ secondary_guardian_phone
- ❌ secondary_guardian_relationship
- ❌ mother_name
- ❌ mother_phone
- ❌ mother_email
- ❌ mother_occupation
- ❌ mother_employer
- ❌ father_name
- ❌ father_phone
- ❌ father_email
- ❌ father_occupation
- ❌ father_employer

### Student Medical/Health Fields
- ❌ student_nationality
- ❌ student_home_language
- ❌ student_medical_conditions
- ❌ student_allergies
- ❌ student_medication
- ❌ student_dietary_requirements
- ❌ doctor_name
- ❌ doctor_phone
- ❌ birth_certificate_number
- ❌ immunization_record

### Emergency Contact
- ❌ emergency_contact_name
- ❌ emergency_contact_phone
- ❌ emergency_contact_relationship

### Previous School
- ❌ previous_school
- ❌ reason_for_transfer

### Preschool-Specific
- ❌ sleeping_habits
- ❌ feeding_habits
- ❌ toilet_trained
- ❌ favourite_activities
- ❌ behavioral_concerns
- ❌ developmental_delays
- ❌ special_needs

### Transport & Logistics
- ❌ transport_required
- ❌ transport_pickup_address
- ❌ transport_dropoff_address
- ❌ preferred_meal_plan
- ❌ authorized_pickup_persons

### Cultural/Religious
- ❌ religious_considerations
- ❌ cultural_considerations

### Consent Fields
- ❌ consent_photography
- ❌ consent_marketing
- ❌ terms_accepted
- ❌ photo_id_required

### Marketing
- ❌ coupon_code

## 📊 Current Storage Strategy:

**Pros:**
- Flexible - new fields don't require migrations
- All data is captured in `documents` JSONB

**Cons:**
- Cannot query/filter by specific fields (e.g., "all students with allergies")
- Cannot enforce data types on JSONB fields
- Harder to generate reports

## 🎯 Recommendation:

**Option 1: Keep Current Approach (JSONB)**
- Good for rapid iteration
- Easy to add fields per tenant
- Use for rarely-queried fields

**Option 2: Add Critical Columns**
Add columns for fields that need to be:
- Queried frequently (medical conditions, allergies, transport)
- Used in reports
- Required for operations

**Hybrid Approach (Recommended):**
1. Core fields → Columns (currently done ✅)
2. Medical/safety → Add columns (allergies, medical conditions, emergency contact)
3. Nice-to-have → Keep in JSONB (habits, preferences, cultural)

This allows efficient querying while maintaining flexibility.
