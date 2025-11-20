# 🎓 How Schools Setup Their Organization - Complete Guide

## Overview

Schools access **EduSitePro Admin Dashboard** to configure their entire operation. No SQL knowledge needed - everything is done through a beautiful web interface.

---

## 🚪 Access Methods

### Method 1: School Admin Login
```
URL: https://edusitepro.edudashpro.org.za/admin
Login: principal@youngeagles.org.za
Dashboard: Auto-loads their organization
```

### Method 2: Direct Organization Dashboard
```
URL: https://edusitepro.edudashpro.org.za/dashboard/young-eagles
```

---

## 📋 What Admins Can Configure

### 1. **Organization Settings** 
`/dashboard/settings`

**Basic Information:**
- ✏️ Organization Name (e.g., "Young Eagles Preschool")
- 🏫 Organization Type (Preschool, K-12, FET, University, etc.)
- 📅 Student Age Range (Min: 2, Max: 6 years)
- 📍 Location/Address

**Branding:**
- 🎨 Upload Logo
- 🌈 Primary Color (hex picker)
- 🌈 Secondary Color (hex picker)
- Preview: See how it looks on landing page

**Registration Control:**
- ✅ Accept New Registrations (Toggle ON/OFF)
- 📝 Registration Message (e.g., "Now enrolling for 2026!")
- 🌐 Custom Domain (e.g., youngeagles.co.za)

**Example Screenshot (What Admin Sees):**
```
┌────────────────────────────────────────────────────────┐
│ Organization Settings                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Basic Information                                      │
│ ┌──────────────────────────────────────────────┐     │
│ │ Organization Name:                            │     │
│ │ [Young Eagles Preschool              ]       │     │
│ │                                               │     │
│ │ Organization Type:                            │     │
│ │ [Preschool ▼]                                │     │
│ │                                               │     │
│ │ Age Range: [2] to [6] years                  │     │
│ └──────────────────────────────────────────────┘     │
│                                                        │
│ Branding                                               │
│ ┌──────────────────────────────────────────────┐     │
│ │ Logo: [🦅 young-eagles-logo.png]             │     │
│ │ Primary Color: [🎨 #3B82F6] Blue             │     │
│ │ Secondary Color: [🎨 #10B981] Green          │     │
│ └──────────────────────────────────────────────┘     │
│                                                        │
│ Registration Settings                                  │
│ ┌──────────────────────────────────────────────┐     │
│ │ ☑ Accept New Registrations                   │     │
│ │                                               │     │
│ │ Message:                                      │     │
│ │ [Now enrolling for 2026! Limited spots]      │     │
│ └──────────────────────────────────────────────┘     │
│                                                        │
│              [Save All Settings]                       │
└────────────────────────────────────────────────────────┘
```

---

### 2. **Fee Structure** 
`/dashboard/settings#fees`

**What Admin Configures:**
- Fee Type (Registration, Tuition Monthly, Tuition Annual, etc.)
- Amount (R500, R2500, etc.)
- Description (what parents see)
- Payment Frequency (once, monthly, quarterly, annual)
- Active status

**Example Interface:**
```
┌────────────────────────────────────────────────────────┐
│ Fee Structure (2026)                    [+ Add Fee]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [Registration Fee ▼] R[500] [One-time fee]      │ │
│ │ Active: ☑                           [Delete]     │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [Tuition Monthly ▼] R[2500] [Monthly tuition]   │ │
│ │ Active: ☑                           [Delete]     │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [Uniform ▼] R[850] [School uniform set]         │ │
│ │ Active: ☑                           [Delete]     │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│                     [Save Fees]                        │
└────────────────────────────────────────────────────────┘
```

**Admin Simply:**
1. Clicks "+ Add Fee"
2. Selects fee type from dropdown
3. Enters amount
4. Adds description
5. Clicks Save

**No SQL required!**

---

### 3. **Marketing Campaigns** 
`/dashboard/campaigns`

**What Admin Sees:**
```
┌────────────────────────────────────────────────────────┐
│ Marketing Campaigns                 [Create Campaign]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Quick Stats:                                           │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│ │   3   │ │   2   │ │  47   │ │  15%  │            │
│ │ Total │ │Active │ │ Used  │ │ Conv  │            │
│ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                        │
│ Active Campaigns:                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 🎉 Early Bird Registration 2026                  │ │
│ │ Save 20% when you register before Jan 31        │ │
│ │                                                  │ │
│ │ Code: EARLYBIRD2026                    [Copy]   │ │
│ │ Discount: 20%                                    │ │
│ │ Redemptions: 47 / 100                            │ │
│ │ Valid Until: Jan 31, 2026                        │ │
│ │                                                  │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 47%        │ │
│ │                                                  │ │
│ │ [👁 Active] [✏ Edit] [🗑 Delete]               │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Creating a New Campaign:**

Admin clicks **"Create Campaign"** and fills simple form:

```
┌────────────────────────────────────────────────────────┐
│ Create New Campaign                              [✕]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Campaign Name: *                                       │
│ [50% Back to School Special                    ]      │
│                                                        │
│ Campaign Type: *          Promo Code: *               │
│ [Early Bird ▼]           [BACKTOSCHOOL50      ]      │
│                                                        │
│ Description: *                                         │
│ [Register now and get 50% off your registration  ]   │
│ [fee! Limited time offer.                        ]   │
│                                                        │
│ Discount Type: *          Discount Value: *           │
│ [Percentage % ▼]         [50] %                      │
│                                                        │
│ Start Date: *             End Date: *                 │
│ [2025-11-16]             [2026-02-28]                │
│                                                        │
│ Max Redemptions: (optional)                            │
│ [200] registrations                                   │
│                                                        │
│ ☑ Show on landing page                                │
│ ☐ Auto-apply discount                                 │
│                                                        │
│          [Cancel]    [Create Campaign]                 │
└────────────────────────────────────────────────────────┘
```

**Admin Actions:**
1. Fills the form (takes 2 minutes)
2. Clicks "Create Campaign"
3. **Done!** Campaign is live immediately
4. Share code `BACKTOSCHOOL50` with parents

**Campaign automatically:**
- ✅ Shows on landing page
- ✅ Applies discount at checkout
- ✅ Tracks redemptions
- ✅ Stops at 200 uses
- ✅ Expires on end date

---

### 4. **Classes Management** 
`/dashboard/classes`

**Interface:**
```
┌────────────────────────────────────────────────────────┐
│ Classes (2026)                          [+ Add Class]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Pre-Primary A                                    │ │
│ │ Age: 2-3 years | Capacity: 20 | Enrolled: 15    │ │
│ │ [Edit] [Delete]                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Pre-Primary B                                    │ │
│ │ Age: 3-4 years | Capacity: 20 | Enrolled: 18    │ │
│ │ [Edit] [Delete]                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Reception                                        │ │
│ │ Age: 4-5 years | Capacity: 25 | Enrolled: 12    │ │
│ │ [Edit] [Delete]                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Grade R                                          │ │
│ │ Age: 5-6 years | Capacity: 25 | Enrolled: 10    │ │
│ │ [Edit] [Delete]                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Adding a Class:**
```
Class Name: [Pre-Primary A        ]
Grade Level: [Pre-Primary A       ]
Age Range: [2-3 years             ]
Max Students: [20]
Academic Year: [2026]

[Save Class]
```

---

### 5. **Landing Page Builder** 
`/dashboard/landing-page`

**What Admin Configures:**
```
┌────────────────────────────────────────────────────────┐
│ Landing Page Editor                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Hero Section:                                          │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Title:                                            │ │
│ │ [Welcome to Young Eagles Preschool        ]      │ │
│ │                                                   │ │
│ │ Subtitle:                                         │ │
│ │ [Where little minds take flight 🦅        ]      │ │
│ │                                                   │ │
│ │ Hero Image:                                       │ │
│ │ [📸 Upload]  [hero-image.jpg]                   │ │
│ │                                                   │ │
│ │ CTA Button Text:                                  │ │
│ │ [Register Your Child]                            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ Quick Stats:                                           │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Students: [150]    Teachers: [12]                │ │
│ │ Years: [15]        Satisfaction: [98]%           │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ Testimonials: [+ Add Testimonial]                     │
│ Gallery: [+ Upload Images]                            │
│ Programs: [+ Add Program]                             │
│                                                        │
│ SEO Settings:                                          │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Meta Title: [Young Eagles Preschool - Enroll] │ │
│ │ Meta Description: [...]                          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ☑ Published (visible to public)                       │
│                                                        │
│          [Preview]    [Save & Publish]                 │
└────────────────────────────────────────────────────────┘
```

---

### 6. **Payment Verification Queue** 
`/dashboard/payments/pending`

**For EFT Payments:**

```
┌────────────────────────────────────────────────────────┐
│ Pending Payments (Awaiting Verification)               │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Dec 1, 2025 | John Doe                           │ │
│ │ Amount: R400 | Reference: YE-2026-0023           │ │
│ │                                                   │ │
│ │ Proof of Payment:                                 │ │
│ │ [📄 bank-receipt.pdf] [View]                    │ │
│ │                                                   │ │
│ │ [✅ Approve Payment] [❌ Reject]                 │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Dec 2, 2025 | Jane Smith                        │ │
│ │ Amount: R400 | Reference: YE-2026-0024           │ │
│ │                                                   │ │
│ │ Proof of Payment:                                 │ │
│ │ [📷 proof-of-payment.jpg] [View]                │ │
│ │                                                   │ │
│ │ [✅ Approve Payment] [❌ Reject]                 │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Admin Workflow:**
1. Sees notification: "3 payments awaiting verification"
2. Clicks payment to review
3. Views uploaded proof of payment
4. Checks bank statement
5. Clicks "✅ Approve Payment"
6. **Done!** Parent receives confirmation email automatically

---

## 🎯 Complete Setup Flow for New School

### Step 1: School Gets Account
```
EduSitePro Team creates organization:
- Organization name
- Admin email
- Initial password
```

### Step 2: Admin First Login
```
1. Admin logs in: https://edusitepro.edudashpro.org.za/admin
2. Sets new password
3. Sees setup wizard
```

### Step 3: Setup Wizard (10 minutes)
```
Page 1: Basic Info
- Upload logo
- Choose colors
- Set organization type

Page 2: Fee Structure
- Add registration fee
- Add tuition fees
- Add other fees

Page 3: Classes
- Create grade levels
- Set capacities
- Define age ranges

Page 4: Campaigns
- Create early bird promo (optional)
- Set discount amount
- Set expiry date

Page 5: Landing Page
- Write welcome message
- Upload hero image
- Add testimonials

Page 6: Go Live!
- ☑ Enable registrations
- Get registration URL
- Share with parents
```

### Step 4: Marketing
```
Admin gets:
- Landing page URL: edusitepro.com/young-eagles
- Registration URL: edusitepro.com/register
- Promo codes to share

Admin shares:
- Social media posts
- WhatsApp groups
- Email newsletters
- Physical flyers with QR code
```

### Step 5: Manage Registrations
```
Daily routine:
1. Check dashboard for new registrations
2. Review uploaded documents
3. Verify payments (if EFT)
4. Approve/reject registrations
5. Assign students to classes
```

---

## 💡 Real Example: Young Eagles Sets 50% Discount

**Scenario:** Principal wants 50% off for first 30 registrations

**Steps:**
1. Login to dashboard
2. Click "Campaigns" in sidebar
3. Click "Create Campaign"
4. Fill form:
   - Name: "First 30 Get 50% OFF!"
   - Type: Early Bird
   - Code: FIRST30
   - Discount Type: Percentage
   - Value: 50
   - Max Redemptions: 30
   - Start: Today
   - End: Dec 31, 2025
5. Click "Create Campaign"
6. **Done!**

**What happens automatically:**
- Campaign shows on landing page
- Parents see: "R500 → R250 (50% OFF!)"
- Code FIRST30 shared on WhatsApp
- System tracks: "12 / 30 used"
- Automatically stops at 30 redemptions

**No developer needed. No SQL. Just the dashboard.**

---

## 🚀 Summary

### Schools Do NOT Need:
- ❌ SQL knowledge
- ❌ Coding skills
- ❌ Technical team
- ❌ Developer access

### Schools Only Need:
- ✅ Web browser
- ✅ Admin login credentials
- ✅ 10 minutes for initial setup
- ✅ Basic computer skills

### Everything is Managed Through:
- 🖥️ **Admin Dashboard** - Beautiful web interface
- 🎯 **Visual Forms** - Click, type, save
- 📊 **Real-time Analytics** - See results immediately
- 🔔 **Notifications** - Get alerts for new registrations/payments

### EduSitePro Provides:
1. **Complete admin dashboard** (already built)
2. **Campaign management UI** (created today)
3. **Settings page** (created today)
4. **Payment verification queue** (created today)
5. **Classes management** (exists)
6. **Landing page builder** (created today)

**Schools simply log in and click buttons. That's it!** 🎉

---

**Last Updated:** November 16, 2025  
**For:** School Administrators (Non-Technical)
