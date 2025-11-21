# Age Group Configuration for Multi-Tenant Platform

## Current Implementation (Young Eagles)

### Age Groups:
1. **Little Explorers**: 6 months - 1 year (0-11 months)
2. **Curious Cubs**: 1-3 years (12-35 months)
3. **Panda**: 4-6 years (36-71 months)

### Database Structure:
```sql
classes table:
- organization_id: ba79097c-1b93-4b48-bcbe-df73878ab4d1
- name: "Little Explorers" | "Curious Cubs" | "Panda"
- age_range: "6 months - 1 year" | "1-3 years" | "4-6 years"
- grade_level: "Infant" | "Toddler" | "PreK"
```

## Future Admin Panel Requirements

### Class Creation UI:
When admins create classes, they should:

1. **Select Age Group Template** (optional):
   - Standard Infant/Toddler/PreK
   - Montessori groupings
   - Custom

2. **Define Age Range**:
   - Min age (months/years)
   - Max age (months/years)
   - Auto-calculated from DOB

3. **Customize Class Name**:
   - Use template name or custom
   - Examples: "Pandas", "Little Explorers", "Grade R"

4. **Set Capacity & Details**:
   - Max students
   - Class type (full_day, half_day, etc.)
   - Duration/schedule

### Registration Form Behavior:
- **Auto-assignment**: System suggests class based on child's age
- **Display only**: Parents see suggested class (not dropdown)
- **Admin review**: Final placement confirmed by admin after submission

### Multi-Tenant Flexibility:
Each organization can define their own:
- Age group ranges (flexible boundaries)
- Class naming conventions
- Number of age groups (2-6 typical)
- Enrollment capacity per group

## Implementation Notes:
- Age groups are **soft boundaries** - admins can override
- Registration form uses organization's defined age groups
- No hard-coded age limits (configurable per tenant)
- System stores both age_range (text) and can calculate from DOB
