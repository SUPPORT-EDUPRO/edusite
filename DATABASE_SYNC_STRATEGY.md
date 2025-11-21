# Database Sync Strategy

## Current Status ✅

### Unified Organization IDs:
- **Young Eagles**: `ba79097c-1b93-4b48-bcbe-df73878ab4d1` (same in both databases)

### Database Purposes:
1. **EduDashPro** (`lvvvjywrmpcqrpvuptdi`):
   - Main operational database
   - Manages students, teachers, classes, attendance, etc.
   - Mobile app backend
   
2. **EduSitePro** (`bppuzibjlxgfwrujzfsz`):
   - Registration/marketing database
   - Public-facing registration forms
   - Landing pages and lead capture

## Data Flow (One-Way):

```
Marketing Website (Young Eagles PWA)
          ↓
   EduSitePro Registration Form
          ↓
registration_requests table (EduSitePro)
          ↓
   [Manual Review/Approval]
          ↓
   EduDashPro (Operational System)
```

## What Gets Synced:

### Organizations ✅
- ID must be identical across both databases
- Name, logo_url, colors synchronized manually
- **Source of Truth**: EduDashPro (operational)

### Classes ✅
- Age groups and class names
- Displayed on registration forms
- **Source of Truth**: EduDashPro (operational)
- **Sync Direction**: EduDashPro → EduSitePro (one-way)

### Registrations ❌ (No Sync)
- Stored in EduSitePro only
- Admin manually imports approved registrations into EduDashPro
- Alternative: Build API endpoint for auto-import

## Migration Completed ✅

### EduSitePro (`bppuzibjlxgfwrujzfsz`):
- ✅ Added all 49 registration form fields
- ✅ Organization ID synced: `ba79097c-1b93-4b48-bcbe-df73878ab4d1`
- ✅ Classes created:
  - Little Explorers (6mo-1yr)
  - Curious Cubs (1-3yrs)
  - Panda (4-6yrs)
- ✅ Form updated to save all fields to proper columns

### EduDashPro (`lvvvjywrmpcqrpvuptdi`):
- ✅ Organization exists with unified ID
- ✅ Class "Panda" exists
- ✅ Columns added: organization_id, academic_year, age_range, etc.

## Automated Sync (Optional Future Enhancement):

### Option 1: Scheduled Job (Recommended)
- Supabase Edge Function runs daily
- Syncs: classes, organization metadata
- Direction: EduDashPro → EduSitePro

### Option 2: Webhooks
- Real-time sync when classes are created/updated in EduDashPro
- Immediately reflects on registration forms

### Option 3: Manual (Current)
- Admin updates both databases when making changes
- Simple, no automation required
- Risk of drift

## Current Approach: Manual with Scripts

Use the provided scripts when changes are made:

```bash
# Update classes from EduDashPro to EduSitePro
node sync-databases.js --direction=edudash-to-edusite

# Update both ways (rare)
node sync-databases.js --direction=both
```

## Recommendation:

**For MVP/Launch**: Manual sync is fine
**For Scale**: Implement Option 1 (scheduled job) when you have 5+ schools
