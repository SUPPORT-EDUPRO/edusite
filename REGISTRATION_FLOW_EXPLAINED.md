# EduSitePro Registration Flow & Terms Configuration

## ✅ Young Eagles Terms & Conditions Status

### Terms URL Configured
- **File Location**: `public/terms-young-eagles.html`
- **Live URL**: https://edusitepro.edudashpro.org.za/terms-young-eagles.html
- **Status**: ✅ **LIVE AND ACCESSIBLE**
- **Content**: Bank details (Branch 250655), late payment cycles (7th & 20th), credit bureau explanation

### Database Configuration
To link the terms to Young Eagles organization, run this SQL in Supabase:

```sql
UPDATE organizations
SET 
  terms_and_conditions_url = 'https://edusitepro.edudashpro.org.za/terms-young-eagles.html',
  updated_at = NOW()
WHERE slug = 'young-eagles-preschool'
   OR name ILIKE '%young eagles%';
```

**SQL File**: `/home/king/Desktop/edusitepro/update-young-eagles-terms.sql`

---

## 📋 Registration Form Configuration

### How the Form Works

#### 1. **Entry Point** - `/app/register/page.tsx`
- **Server-side page** that handles routing and organization lookup
- **Tenant Resolution**: Uses middleware to identify which school's form to load
- **Process**:
  ```
  1. Get tenant ID from middleware header (x-tenant-id)
  2. Fallback to NEXT_PUBLIC_DEV_TENANT_ID for localhost
  3. Query Supabase organizations table
  4. Check if registration_open = true
  5. Pass organization data to form component
  ```

#### 2. **Organization Data Fetched**
From `organizations` table, the form gets:
```typescript
{
  id,                           // Organization UUID
  name,                         // "Young Eagles Preschool"
  slug,                         // "young-eagles-preschool"
  school_code,                  // Used in payment references
  organization_type,            // "preschool"
  logo_url,                     // School logo
  primary_color,                // Brand colors
  secondary_color,
  registration_open,            // Boolean - controls if form is accessible
  registration_message,         // Custom message when closed
  min_age,                      // Age restrictions
  max_age,
  terms_and_conditions_url,     // ⭐ THIS IS THE KEY FIELD
  terms_and_conditions_text,    // Alternative: inline text
  form_config,                  // Custom field configurations
  contact_email,
  contact_phone,
  address
}
```

#### 3. **Form Component** - `PublicRegistrationForm.tsx`
- **Client-side component** for interactivity
- **Location**: `src/components/registration/PublicRegistrationForm.tsx`
- **Line 2127** - Terms checkbox implementation:

```tsx
<input
  type="checkbox"
  id="termsAccepted"
  name="termsAccepted"
  checked={formData.termsAccepted}
  onChange={handleChange}
  required
  className="..."
/>
<label htmlFor="termsAccepted">
  I accept the{' '}
  {organizationBranding?.terms_and_conditions_url ? (
    <a
      href={organizationBranding.terms_and_conditions_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-600 underline hover:text-teal-700"
    >
      terms and conditions
    </a>
  ) : organizationBranding?.terms_and_conditions_text ? (
    <button
      type="button"
      onClick={() => showModal(organizationBranding.terms_and_conditions_text)}
      className="text-teal-600 underline hover:text-teal-700"
    >
      terms and conditions
    </button>
  ) : (
    <span className="text-teal-600 underline">terms and conditions</span>
  )}
</label>
```

**Logic**:
- ✅ If `terms_and_conditions_url` exists → **Clickable link** (opens in new tab)
- ✅ Else if `terms_and_conditions_text` exists → **Modal popup** with inline text
- ❌ Else → **Plain text** (not clickable)

---

## 🔄 Complete Registration Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER VISITS REGISTRATION URL                                 │
│    https://youngeagles.org.za/register                          │
│    or https://edusitepro.edudashpro.org.za/register             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE IDENTIFIES TENANT                                  │
│    - Reads domain/subdomain                                      │
│    - Sets x-tenant-id header                                     │
│    - Maps to organization ID in database                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SERVER PAGE LOADS (/app/register/page.tsx)                   │
│    - Gets tenant ID from header                                  │
│    - Queries organizations table                                 │
│    - Checks registration_open status                             │
│    - Fetches branding & terms URL                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FORM RENDERS (PublicRegistrationForm.tsx)                    │
│    - Shows school logo & branding                                │
│    - Displays dynamic form sections based on form_config        │
│    - Terms checkbox with link if terms_and_conditions_url set   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. PARENT FILLS FORM                                             │
│    Sections:                                                     │
│    - Guardian Information (name, email, phone, ID, address)     │
│    - Student Information (name, DOB, gender, nationality)       │
│    - Medical Information (conditions, allergies, medication)    │
│    - Preschool Specific (toilet trained, feeding habits, etc)   │
│    - Emergency Contacts                                          │
│    - Consents (photography, marketing)                           │
│    - ⭐ Terms & Conditions acceptance (REQUIRED)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. PARENT CLICKS TERMS LINK                                      │
│    - Opens https://edusitepro.edudashpro.org.za/terms-young-    │
│      eagles.html in new tab                                      │
│    - Reads full contract with bank details and policies         │
│    - Returns to form                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. FORM VALIDATION                                               │
│    Client-side checks:                                           │
│    - All required fields filled                                  │
│    - Valid email format                                          │
│    - Valid phone number                                          │
│    - DOB within age range (min_age to max_age)                  │
│    - ⭐ termsAccepted checkbox MUST be checked                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. FORM SUBMISSION                                               │
│    POST → /api/registrations                                     │
│    Payload includes:                                             │
│    - organization_id                                             │
│    - All form data                                               │
│    - termsAccepted: true                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. API ROUTE PROCESSES (/api/registrations/route.ts)            │
│    - Validates required fields                                   │
│    - Generates unique payment reference (REG-2025-...)          │
│    - Inserts into registration_requests table                    │
│    - Status: 'pending'                                           │
│    - Sends confirmation email to parent                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. DATABASE RECORD CREATED                                      │
│     Table: registration_requests                                 │
│     Fields:                                                      │
│     - id (UUID)                                                  │
│     - organization_id                                            │
│     - student_first_name, student_last_name                     │
│     - guardian_name, guardian_email, guardian_phone             │
│     - payment_reference (e.g., REG-2025-1733159423789-A7F3B2)   │
│     - status: 'pending'                                          │
│     - submission_date                                            │
│     - All other form data                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. PARENT RECEIVES EMAIL                                        │
│     Subject: "Registration Received - Young Eagles Preschool"   │
│     Content:                                                     │
│     - Confirmation of submission                                 │
│     - Payment reference number                                   │
│     - Bank details for payment                                   │
│     - Next steps                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. ADMIN REVIEWS (/admin/registrations)                         │
│     Principal/Admin sees:                                        │
│     - List of all pending registrations                          │
│     - Student & parent details                                   │
│     - Payment reference                                          │
│     - Actions: Approve / Reject / View Details                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. ADMIN APPROVES                                               │
│     POST → /api/registrations/approve                            │
│     Process:                                                     │
│     - Creates parent account in EduDashPro database             │
│     - Links student to parent                                    │
│     - Sends welcome email with login credentials                │
│     - Updates status to 'approved'                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 14. PARENT CAN NOW LOGIN                                         │
│     - Download EduDash Pro mobile app                            │
│     - Login with email & temp password                           │
│     - Access student dashboard, homework, messages               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Integration Points

### 1. **Terms URL Configuration**
```sql
-- In organizations table
terms_and_conditions_url VARCHAR(500)  -- External link (recommended)
terms_and_conditions_text TEXT         -- Inline text (fallback)
```

**Young Eagles Setup**:
```sql
UPDATE organizations
SET terms_and_conditions_url = 'https://edusitepro.edudashpro.org.za/terms-young-eagles.html'
WHERE slug = 'young-eagles-preschool';
```

### 2. **Form Rendering Logic**
```typescript
// PublicRegistrationForm.tsx line ~2127
{organizationBranding?.terms_and_conditions_url ? (
  // OPTION 1: External link (Young Eagles uses this)
  <a href={url} target="_blank">terms and conditions</a>
) : organizationBranding?.terms_and_conditions_text ? (
  // OPTION 2: Modal with inline text
  <button onClick={showModal}>terms and conditions</button>
) : (
  // OPTION 3: No terms configured
  <span>terms and conditions</span>
)}
```

### 3. **Validation**
```typescript
// Form cannot be submitted unless:
formData.termsAccepted === true  // Checkbox must be checked
```

---

## 🔧 Configuration Options

### Per-School Customization

Each organization in the database can have:

1. **Custom Terms URL** (`terms_and_conditions_url`)
   - Points to unique contract/policy page
   - Example: Young Eagles bank details, late fees, etc.

2. **Custom Form Fields** (`form_config` JSON)
   - Show/hide sections
   - Required vs optional fields
   - Custom labels

3. **Branding** (`logo_url`, `primary_color`, `secondary_color`)
   - School colors applied to form
   - Logo displayed at top

4. **Age Restrictions** (`min_age`, `max_age`)
   - Form validates student DOB
   - Rejects if outside age range

5. **Registration Status** (`registration_open`)
   - Boolean toggle
   - When false, shows custom message

---

## 📊 Data Flow Summary

```
HTML Terms Page (public/terms-young-eagles.html)
              ↓
Organizations Table (terms_and_conditions_url column)
              ↓
Server Page (/app/register/page.tsx) - Fetches org data
              ↓
Form Component (PublicRegistrationForm.tsx) - Receives org data
              ↓
Terms Checkbox (line 2127) - Renders link if URL exists
              ↓
Parent Clicks Link → Opens terms in new tab
              ↓
Parent Checks Checkbox → Required for submission
              ↓
Form Submit → API Route (/api/registrations)
              ↓
Database Insert → registration_requests table
              ↓
Admin Review → /admin/registrations
              ↓
Approval → Parent account created in EduDashPro
```

---

## ✅ Next Steps for Young Eagles

1. **Run SQL Update** (Required)
   ```bash
   # Open Supabase SQL Editor
   # Copy & run: /home/king/Desktop/edusitepro/update-young-eagles-terms.sql
   ```

2. **Verify Terms Link**
   - Visit: https://youngeagles.org.za/register
   - Scroll to bottom
   - Click "terms and conditions" link
   - Should open contract in new tab

3. **Test Full Flow**
   - Fill out registration form
   - Check terms box
   - Submit
   - Verify email received
   - Check admin panel for new registration

---

## 🔐 Security Notes

- Terms acceptance is **stored** in `registration_requests.termsAccepted`
- Terms URL is **public** (no authentication needed)
- Admin approval required before parent account created
- RLS policies enforce tenant isolation
- Service role key only used server-side (API routes)

