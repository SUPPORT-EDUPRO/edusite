# 🎯 Marketing & Payment System - Complete Guide

## Overview
EduSitePro now offers a complete marketing and payment infrastructure for educational organizations to:
1. **Create promotional campaigns** (early bird, sibling discounts, referral bonuses)
2. **Build marketing landing pages** for each organization
3. **Accept multiple payment methods** (cards, EFT, Ozow, SnapScan)
4. **Track payment status** and verification workflows
5. **Automate discount application** and campaign tracking

---

## 🎨 Marketing Features

### 1. Organization Landing Pages

**URL Structure:**
- `edusitepro.com/young-eagles` → Marketing landing page
- `edusitepro.com/register` → Registration form (with tenant context)

**What's Included:**
- Hero section with organization branding
- Stats showcase (students, teachers, years, satisfaction)
- Active campaigns/promotions display
- Transparent pricing section
- Call-to-action buttons

**Example Access:**
```
https://edusitepro.edudashpro.org.za/young-eagles
```

### 2. Promotional Campaigns

**Campaign Types:**
- `early_bird` - Register before deadline
- `sibling_discount` - Multiple children discount
- `referral_bonus` - Refer-a-friend rewards
- `seasonal_promo` - Holiday/seasonal offers
- `bundle_offer` - Combined services
- `scholarship` - Merit-based reductions

**Discount Types:**
- `percentage` - e.g., 20% off
- `fixed_amount` - e.g., R200 off
- `waive_registration` - Free registration
- `first_month_free` - Waive first tuition payment

**Example: Young Eagles Early Bird Campaign**
```sql
-- Already created in migration!
Campaign: "Early Bird Registration 2026"
Discount: 20% off registration fee
Code: EARLYBIRD2026
Valid: Nov 16, 2025 → Jan 31, 2026
Limit: First 100 registrations
Auto-apply: YES (if registered before Jan 31)
```

---

## 💳 Payment System

### 1. Payment Methods Supported

| Method | Processing Time | Status | South African? |
|--------|----------------|--------|----------------|
| Credit/Debit Card | Instant | ✅ Active | Yes (via PayFast) |
| EFT (Manual) | 1-3 days | ✅ Active | Yes |
| Bank Transfer | 1-3 days | ✅ Active | Yes |
| Ozow Instant EFT | Instant | ✅ Active | Yes |
| SnapScan | Instant | 🔜 Coming Soon | Yes |
| Zapper | Instant | 🔜 Coming Soon | Yes |
| PayPal | Instant | 🌍 International | No |

### 2. Payment Flow by Method

#### A. **Credit/Debit Card** (Recommended)
```
User fills registration → Selects "Credit Card" → Redirects to PayFast gateway 
→ User pays → Webhook updates status → Instant approval
```

**Advantages:**
- Instant payment confirmation
- No manual verification needed
- Best user experience

**Setup Required:**
- PayFast merchant account
- API integration (see `/api/payment/card`)

---

#### B. **EFT / Bank Transfer** (Most Common in SA)
```
User fills registration → Selects "EFT" → System shows banking details 
→ User makes transfer at their bank → Uploads proof of payment 
→ Admin verifies → Approves payment manually
```

**Workflow:**
1. User sees banking details:
   ```
   Bank: FNB
   Account: Young Eagles Preschool
   Account Number: 1234567890
   Branch Code: 250655
   Reference: YE-2026-0001
   ```
2. User uploads proof (PDF/image)
3. Payment status: `awaiting_proof`
4. Admin dashboard shows pending payments
5. Admin verifies bank statement
6. Updates status to `completed`

**Advantages:**
- No gateway fees
- Familiar to SA parents
- Bank security

**Disadvantages:**
- Manual verification required
- 1-3 day processing time
- Admin workload

---

#### C. **Ozow Instant EFT**
```
User fills registration → Selects "Ozow" → Redirects to Ozow 
→ User logs into their bank → Instant transfer → Webhook confirms → Approved
```

**Advantages:**
- Instant like cards
- Direct bank-to-bank
- Lower fees than cards

**Setup Required:**
- Ozow merchant account
- API integration

---

#### D. **SnapScan / Zapper** (QR Code)
```
User fills registration → Selects "SnapScan" → QR code displayed 
→ User scans with mobile app → Pays → Webhook confirms → Approved
```

**Advantages:**
- Mobile-first
- Popular in SA
- Instant confirmation

---

### 3. Payment Status Workflow

```
pending → awaiting_proof → verifying → completed
                                    ↓
                                  failed
                                    ↓
                                refunded
```

**Status Definitions:**
- `pending` - Payment initiated, waiting for action
- `awaiting_proof` - EFT selected, waiting for proof upload
- `verifying` - Admin reviewing uploaded proof
- `completed` - Payment confirmed and verified
- `failed` - Payment declined or invalid
- `refunded` - Money returned to parent
- `cancelled` - User cancelled before payment

---

## 📊 Database Schema

### Key Tables

#### 1. `marketing_campaigns`
Stores all promotional offers.

```sql
SELECT * FROM marketing_campaigns WHERE organization_id = 'young-eagles-id';
```

**Important Columns:**
- `promo_code` - Unique code like "EARLYBIRD2026"
- `discount_value` - Percentage (20) or amount (200)
- `max_redemptions` - Limit number of uses
- `auto_apply` - Automatically apply if conditions met
- `start_date` / `end_date` - Validity period

#### 2. `payment_transactions`
Tracks every payment attempt.

```sql
SELECT * FROM payment_transactions 
WHERE registration_request_id = 'reg-id';
```

**Important Columns:**
- `payment_method` - eft, credit_card, ozow, etc.
- `payment_status` - pending, completed, etc.
- `proof_of_payment_url` - Uploaded proof for EFT
- `gateway_transaction_id` - PayFast/Ozow reference
- `verified_by` - Staff member who approved

#### 3. `organization_fee_structures`
Defines fees per organization.

```sql
SELECT * FROM organization_fee_structures 
WHERE organization_id = 'young-eagles-id' 
AND academic_year = '2026';
```

**Fee Types:**
- `registration_fee` - One-time (R500)
- `tuition_monthly` - Monthly fee (R2500)
- `tuition_annual` - Annual payment
- `deposit` - Refundable security deposit
- `uniform`, `books`, `activities`, `transport`, `meals`

#### 4. `campaign_redemptions`
Tracks who used which promo code.

```sql
SELECT * FROM campaign_redemptions 
WHERE campaign_id = 'early-bird-campaign-id';
```

---

## 🔧 Integration Examples

### Example 1: Young Eagles Landing Page Setup

**Step 1: Create Landing Page Content**
```sql
INSERT INTO organization_landing_pages (
  organization_id,
  hero_title,
  hero_subtitle,
  hero_cta_text,
  stats,
  published
)
SELECT 
  id,
  'Welcome to Young Eagles Preschool',
  'Where little minds take flight 🦅 Enrolling for 2026!',
  'Register Your Child',
  '{"students": 150, "teachers": 12, "years": 15, "satisfaction": 98}',
  true
FROM organizations WHERE slug = 'young-eagles';
```

**Step 2: Access Landing Page**
```
Visit: https://edusitepro.edudashpro.org.za/young-eagles
```

**Step 3: Add Classes**
```sql
INSERT INTO classes (name, grade_level, class_type, age_range, max_students, organization_id, academic_year)
VALUES 
  ('Pre-Primary A', 'Pre-Primary A', 'grade', '2-3 years', 20, 'young-eagles-id', '2026'),
  ('Pre-Primary B', 'Pre-Primary B', 'grade', '3-4 years', 20, 'young-eagles-id', '2026'),
  ('Reception', 'Reception', 'grade', '4-5 years', 25, 'young-eagles-id', '2026'),
  ('Grade R', 'Grade R', 'grade', '5-6 years', 25, 'young-eagles-id', '2026');
```

---

### Example 2: Setting Up Payment Methods

**Option A: Card Payments (PayFast)**
1. Create PayFast merchant account
2. Get merchant ID and key
3. Add to environment variables:
   ```env
   PAYFAST_MERCHANT_ID=10000100
   PAYFAST_MERCHANT_KEY=xxxxxx
   PAYFAST_PASSPHRASE=xxxxxx
   ```
4. Create API route: `/api/payment/card`

**Option B: EFT (Manual Process)**
1. Add banking details to organization:
   ```sql
   UPDATE organizations 
   SET banking_details = '{
     "bank": "FNB",
     "account_name": "Young Eagles Preschool",
     "account_number": "1234567890",
     "branch_code": "250655"
   }'
   WHERE slug = 'young-eagles';
   ```
2. Enable proof upload in payment flow
3. Train admin staff to verify payments

**Option C: Ozow**
1. Sign up at ozow.com
2. Get API credentials
3. Add to environment variables
4. Create API route: `/api/payment/ozow`

---

## 🎯 User Journey

### Scenario 1: Parent with Early Bird Promo

**Timeline:**
1. **Nov 16, 2025** - Parent visits `youngeagles.org.za`
2. Clicks "Register for 2026" button
3. Redirected to `edusitepro.edudashpro.org.za/register`
4. Sees banner: "🎉 Early Bird Special - Save 20%!"
5. Fills registration form (38 fields)
6. At payment step:
   - **Original Fee:** R500
   - **Discount Applied:** -R100 (20%)
   - **Final Amount:** R400
7. Selects payment method: **Credit Card**
8. Redirected to PayFast
9. Pays R400
10. Redirected back with success
11. Receives confirmation email
12. Registration status: `approved`

**Database Records Created:**
- `registration_requests` - 1 record
- `payment_transactions` - 1 record (status: completed)
- `campaign_redemptions` - 1 record (EARLYBIRD2026 used)
- Campaign `current_redemptions` count incremented

---

### Scenario 2: Parent with EFT Payment

**Timeline:**
1. **Dec 1, 2025** - Parent registers
2. Sees Early Bird promo still active
3. Fills form
4. At payment step, selects **EFT**
5. System displays banking details:
   ```
   Account: Young Eagles Preschool
   Number: 1234567890
   Reference: YE-2026-0023
   Amount: R400
   ```
6. Parent goes to their bank
7. Makes transfer with reference `YE-2026-0023`
8. Returns to form
9. Uploads proof of payment (bank receipt PDF)
10. Clicks "Submit Payment Details"
11. Receives email: "Payment being verified"
12. **Status:** `awaiting_proof`

**Admin Side:**
1. Admin logs into dashboard
2. Sees notification: "3 pending payments"
3. Opens payment verification queue
4. Downloads proof from parent
5. Checks bank statement
6. Confirms R400 received
7. Clicks "Approve Payment"
8. **Status:** `completed`
9. Parent receives: "Payment confirmed! Welcome to Young Eagles"
10. Registration auto-approved

---

### Scenario 3: Late Registration (Promo Expired)

**Timeline:**
1. **Feb 5, 2026** - Parent tries to register
2. Early Bird campaign ended Jan 31
3. No promo banner shown
4. At payment step:
   - **Fee:** R500 (full price)
   - **No discount**
5. Proceeds with payment

---

## 📈 Admin Dashboard Features

### Payment Verification Queue

**Location:** `/dashboard/payments/pending`

**Features:**
- List all `awaiting_proof` payments
- Filter by date, organization, amount
- View uploaded proof images/PDFs
- Quick approve/reject actions
- Add verification notes
- Bulk approve feature

**Example View:**
```
┌──────────────┬────────────┬──────────┬────────────┬──────────┐
│ Date         │ Parent     │ Amount   │ Reference  │ Actions  │
├──────────────┼────────────┼──────────┼────────────┼──────────┤
│ Dec 1, 2025  │ John Doe   │ R400     │ YE-2026-23 │ [View]   │
│ Dec 2, 2025  │ Jane Smith │ R400     │ YE-2026-24 │ [View]   │
└──────────────┴────────────┴──────────┴────────────┴──────────┘
```

### Campaign Analytics

**Location:** `/dashboard/campaigns`

**Metrics:**
- Total redemptions
- Revenue generated
- Conversion rate (views → registrations)
- Most effective campaigns
- Remaining campaign budget

**Example:**
```
Early Bird 2026
├─ Redemptions: 47 / 100
├─ Revenue Impact: R4,700 discounted
├─ Registrations: 47
├─ Avg Discount: R100
└─ Ends in: 56 days
```

---

## 🚀 Next Steps for Young Eagles

### Immediate (This Week)
1. ✅ Deploy migration: `20251116_add_marketing_and_payments.sql`
2. ✅ Early Bird campaign already created
3. ✅ Fee structure already set (R500 registration)
4. 🔜 Add Young Eagles classes (4 classes shown above)
5. 🔜 Create landing page content
6. 🔜 Test registration flow end-to-end

### Short Term (Next 2 Weeks)
1. Set up banking details
2. Train admin staff on payment verification
3. Configure email templates
4. Add terms & conditions
5. Test EFT payment flow

### Medium Term (Next Month)
1. Integrate PayFast for card payments
2. Add Ozow instant EFT
3. Build admin dashboard
4. Set up automated reminders
5. Create parent portal

### Long Term (Next Quarter)
1. Add sibling discount campaign
2. Referral program
3. Scholarship applications
4. Multiple payment plans (monthly installments)
5. WhatsApp payment reminders

---

## 💡 Best Practices

### For Organizations

**Campaign Strategy:**
1. **Early Bird** - Encourage early registrations (20-30% off)
2. **Last Chance** - Fill remaining spots (10-15% off)
3. **Sibling Discount** - Reward families (10% per additional child)
4. **Referral Bonus** - Word-of-mouth marketing (R200 credit)
5. **Seasonal** - Back-to-school specials

**Pricing Strategy:**
1. Set registration fee to cover admin costs
2. Make early bird attractive but sustainable
3. Offer payment plans for tuition
4. Be transparent about all fees
5. Provide receipts for tax purposes

**Payment Method Mix:**
1. Push for cards/Ozow (instant, no admin work)
2. Accept EFT (most common in SA, but manual)
3. Avoid cash (security, tracking issues)
4. Consider payment plans for tuition

### For Parents

**Save Money:**
1. Register early (Early Bird campaigns)
2. Use promo codes
3. Refer friends (if referral program active)
4. Pay annually vs monthly (if discount offered)

**Payment Security:**
1. Always use the reference number
2. Upload clear proof of payment
3. Keep email confirmations
4. Check payment status in parent portal

---

## 🔐 Security & Compliance

### PCI Compliance
- Never store card details directly
- Use certified payment gateways (PayFast, Ozow)
- Encrypt all sensitive data
- Use HTTPS everywhere

### POPIA Compliance (South Africa)
- Get consent for data processing
- Secure parent and student information
- Allow data access requests
- Honor deletion requests

### Financial Records
- Keep payment records for 7 years
- Generate tax receipts
- Audit trail for all transactions
- Reconcile daily

---

## 📞 Support

**For Organizations:**
- Email: support@edudashpro.org.za
- Dashboard: Help Center

**For Parents:**
- Email: parents@youngeagles.org.za
- Phone: +27 XX XXX XXXX
- WhatsApp support (coming soon)

---

**Last Updated:** November 16, 2025
**Version:** 1.0
