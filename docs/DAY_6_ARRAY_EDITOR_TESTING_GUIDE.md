# Array Field Editor - UI/UX Verification Guide

**Purpose**: Manual testing checklist for the new Array Field Editor in the Page Builder  
**Component**: `ArrayFieldEditor.tsx` + `BlockPropsEditor.tsx` updates  
**Date**: 2025-10-26

---

## 🚀 Getting Started

### Prerequisites

```bash
# Start development server
npm run dev

# Navigate to admin builder
http://localhost:3000/admin/builder
```

### Test Environment Setup

1. Create a test page in the admin
2. Open the page builder
3. Have the browser console open (F12) to check for errors

---

## ✅ Test Cases

### Test 1: Testimonials Block - Add/Edit/Remove

#### Steps

1. **Add Block**
   - Click "Add Block" in page builder
   - Select "Testimonials" block
   - Verify block appears in preview

2. **Add Testimonial**
   - In right sidebar, locate "Testimonials" section
   - Click "+ Add Testimonial"
   - Verify new testimonial item appears collapsed

3. **Edit Testimonial**
   - Click on testimonial item to expand
   - Fill in fields:
     - Quote: "This daycare is amazing!"
     - Author Name: "Sarah Johnson"
     - Role/Title: "Parent"
     - Rating: 5
   - Verify fields accept input

4. **Add Photo**
   - Click on Photo field
   - Enter image URL: `https://via.placeholder.com/150`
   - Verify URL is accepted

5. **Add Multiple Testimonials**
   - Click "+ Add Testimonial" again
   - Add 2 more testimonials with different data
   - Verify all 3 appear in list

6. **Reorder Testimonials**
   - Click up arrow (↑) on 3rd testimonial
   - Verify it moves to 2nd position
   - Click down arrow (↓) on 1st testimonial
   - Verify it moves to 2nd position

7. **Delete Testimonial**
   - Click trash icon (🗑️) on 2nd testimonial
   - Verify it's removed from list
   - Verify remaining testimonials are still intact

8. **Save & Verify**
   - Click "Save" in page builder
   - Wait for success message
   - Reload page
   - Verify testimonials persist

9. **View on Site**
   - Navigate to centre site page
   - Verify testimonials block renders correctly
   - Verify rating stars display (if enabled)
   - Verify author photos display

**Expected Results**: ✅ All operations work smoothly, data persists, renders correctly

---

### Test 2: Program Grid Block - NCF Pillars (Tags)

#### Steps

1. **Add Block**
   - Add "Program Grid" block

2. **Add Program**
   - Click "+ Add Program"
   - Fill in:
     - Title: "Babies (0-2 years)"
     - Description: "Nurturing care for infants"
     - Icon: "👶"
     - Age Range: "0-2 years"

3. **Add NCF Pillars (Tags)**
   - In "NCF Pillars" field, type: `Well-being`
   - Press **Enter**
   - Verify tag appears with × button
   - Add more pillars: `Identity & Belonging`, `Communication`
   - Verify all tags display

4. **Remove Tag**
   - Click × on "Communication" tag
   - Verify it's removed
   - Verify other tags remain

5. **Select Columns**
   - Change "Columns" dropdown to "4 columns"
   - Verify change is reflected

6. **Add Multiple Programs**
   - Add 3 more programs with different data
   - Verify all display in list

7. **Save & View**
   - Save page
   - View on centre site
   - Verify programs render in selected column layout
   - Verify NCF pillar tags display

**Expected Results**: ✅ Tags input works, Enter key adds tags, × removes tags, all data persists

---

### Test 3: Staff Cards Block - Qualifications (Tags)

#### Steps

1. **Add Block**
   - Add "Staff Cards" block

2. **Add Staff Member**
   - Click "+ Add Staff Member"
   - Fill in:
     - Name: "Mrs. Thembi Ndlovu"
     - Role: "Lead Teacher"
     - Bio: "10 years of ECD experience"
     - Photo: `https://via.placeholder.com/150`

3. **Add Qualifications**
   - In "Qualifications" field, type: `B.Ed (ECD)`
   - Press Enter
   - Add more: `ECD Level 5 Certificate`, `First Aid Certified`
   - Verify all tags display

4. **Column Selection**
   - Change columns to "3 columns"
   - Verify change

5. **Toggle Show Qualifications**
   - Uncheck "Show Qualifications"
   - Check it again
   - Verify checkbox works

6. **Add Multiple Staff**
   - Add 2 more staff members
   - Verify all display

7. **Reorder Staff**
   - Move 3rd staff to 1st position
   - Verify order changes

8. **Save & View**
   - Save and view on site
   - Verify staff cards render correctly
   - Verify qualifications display as list items

**Expected Results**: ✅ Staff management works, qualifications display, photos render

---

### Test 4: Features Block - Icon vs Image

#### Steps

1. **Add Block**
   - Add "Features" block

2. **Add Feature with Icon**
   - Click "+ Add Feature"
   - Fill in:
     - Title: "Safe Environment"
     - Description: "Secure premises with 24/7 monitoring"
     - Icon: "🛡️"

3. **Add Feature with Image**
   - Add another feature
   - Fill in:
     - Title: "Outdoor Play Area"
     - Description: "Spacious playground with age-appropriate equipment"
     - Image: `https://via.placeholder.com/300x200`
   - Leave Icon empty

4. **Column Selection**
   - Change columns to "4"
   - Verify

5. **Add More Features**
   - Add 2 more features (min is 2)
   - Verify minimum is enforced

6. **Delete Feature**
   - Try to delete when only 2 remain
   - Verify delete is disabled (min validation)
   - Add 3rd feature, then delete one
   - Verify delete works when > min

7. **Save & View**
   - Save and view on site
   - Verify icons render as emoji
   - Verify images render as `<img>`
   - Verify 4-column layout works

**Expected Results**: ✅ Icon and image fields work independently, min validation enforced

---

### Test 5: Gallery Block - Image vs Video

#### Steps

1. **Add Block**
   - Add "Gallery" block

2. **Add Image Item**
   - Click "+ Add Item"
   - Select radio: **Image**
   - Fill in:
     - Image URL: `https://via.placeholder.com/600x400`
     - Caption: "Our classroom"
     - Alt Text: "Bright classroom with learning materials"

3. **Add Video Item**
   - Add another item
   - Select radio: **Video**
   - Fill in:
     - Video URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - Thumbnail URL: `https://via.placeholder.com/600x400`
     - Caption: "Virtual tour"
     - Alt Text: "Centre virtual tour video"
   - Verify thumbnail field appears when Video is selected

4. **Add Multiple Items**
   - Add 5 more gallery items (mix of images and videos)
   - Verify all display in list

5. **Reorder Items**
   - Move items up and down
   - Verify order changes in list

6. **Column Selection**
   - Change columns to "5"
   - Verify change

7. **Toggle Show Captions**
   - Uncheck "Show Captions"
   - Check again
   - Verify checkbox works

8. **Save & View**
   - Save and view on site
   - Verify images render with captions
   - Verify videos show play icon overlay
   - Verify 5-column grid layout

**Expected Results**: ✅ Image/video toggle works, thumbnail field conditional on video type

---

### Test 6: Fees Table Block - Nested Arrays

#### Steps

1. **Add Block**
   - Add "Fees Table" block

2. **Add Fee Category**
   - Click "+ Add Category"
   - Fill in:
     - Category Name: "Monthly Fees"

3. **Add Fee Row**
   - In "Fee Rows" section, click "+ Add Row"
   - Fill in:
     - Service: "Full-day care (0-2 years)"
     - Description: "Includes meals and snacks"
     - Amount: "R3,500"
     - Frequency: "per month"

4. **Add Multiple Rows**
   - Click "+ Add Row" again
   - Add 2 more rows with different services
   - Verify all rows display in nested list

5. **Delete Row**
   - Click trash icon on 2nd row
   - Verify it's removed
   - Verify other rows remain

6. **Add Another Category**
   - Click "+ Add Category" (at top level)
   - Fill in:
     - Category Name: "Registration Fees"
   - Add 2 rows to this category

7. **Reorder Categories**
   - Move "Registration Fees" above "Monthly Fees"
   - Verify categories reorder

8. **Toggle Options**
   - Uncheck "Show Descriptions"
   - Check "Show Frequency"
   - Verify checkboxes work

9. **Add Note**
   - In "Note" field, add: "Fees are subject to annual review"
   - Verify text area accepts input

10. **Save & View**
    - Save and view on site
    - Verify fees table renders with categories as headers
    - Verify rows display in table format
    - Verify note displays at bottom

**Expected Results**: ✅ Nested arrays work, categories contain rows, all data persists

---

## 🎨 UI/UX Checks

### Visual Design

- [ ] Accordion items have clear headers with item titles
- [ ] Expand/collapse chevron icon rotates on click
- [ ] Up/down/delete buttons have hover states
- [ ] Icons (arrows, trash, chevron) are visible and clear
- [ ] Empty state message is friendly and actionable
- [ ] Tags have × button that's clickable
- [ ] All form fields have proper labels

### Interaction Patterns

- [ ] Click anywhere on item header to expand/collapse
- [ ] Action buttons (up/down/delete) don't trigger expand/collapse
- [ ] Add button is always visible when under max items
- [ ] Delete button is disabled when at min items
- [ ] Up arrow is hidden on first item
- [ ] Down arrow is hidden on last item
- [ ] Input fields accept typing immediately
- [ ] Enter key adds tags (doesn't submit form)

### Accessibility

- [ ] All buttons have `aria-label` attributes
- [ ] Required fields are indicated (red asterisk)
- [ ] Help text is visible below fields
- [ ] Color contrast is sufficient (text readable)
- [ ] Keyboard navigation works (Tab key)

### Responsiveness

- [ ] Right sidebar scrolls when content overflows
- [ ] Form fields stack properly on narrow screens
- [ ] Buttons remain accessible on mobile viewport

---

## 🐛 Error Scenarios to Test

### Validation

- [ ] Try to delete last item when min=1 → Should be disabled
- [ ] Try to add 13th testimonial when max=12 → Button should hide
- [ ] Submit form without required fields → Should show validation errors
- [ ] Enter invalid URL in image field → Should validate

### Edge Cases

- [ ] Add 50 gallery items (max) → Should handle gracefully
- [ ] Add very long text in description → Should wrap or truncate
- [ ] Add emoji in text fields → Should accept
- [ ] Paste HTML in rich text field → Should sanitize or accept

### Performance

- [ ] Expand/collapse 10+ items rapidly → Should not lag
- [ ] Type in input field → Should update immediately (no delay)
- [ ] Save with 50+ array items → Should complete within 3 seconds

---

## 📊 Acceptance Criteria Checklist

### Functional

- [ ] All 6 block types with arrays can be edited
- [ ] Add, remove, reorder operations work
- [ ] Nested arrays (fees table) work correctly
- [ ] Tags input works with Enter key
- [ ] Min/max item counts are enforced
- [ ] All changes persist after save
- [ ] Changes render correctly on centre site

### Technical

- [ ] No console errors during any operation
- [ ] No TypeScript errors in browser dev tools
- [ ] Auto-save triggers after edits (if implemented)
- [ ] Network requests succeed (200 OK)
- [ ] Data saved matches data displayed

### User Experience

- [ ] Accordion UI is intuitive
- [ ] Visual feedback on hover/click
- [ ] Empty states guide user to add items
- [ ] Error messages are clear
- [ ] Loading states are shown during save
- [ ] Success confirmation after save

---

## 🎉 Final Verification

### Smoke Test (Quick Check)

1. Start dev server: `npm run dev`
2. Navigate to `/admin/builder`
3. Add each block type:
   - Testimonials ✅
   - Program Grid ✅
   - Staff Cards ✅
   - Features ✅
   - Gallery ✅
   - Fees Table ✅
4. Add/remove/reorder items in each
5. Save page
6. View on centre site
7. Verify all render correctly

### Production Readiness

- [ ] All test cases pass
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Build passes (`npm run build`)
- [ ] TypeScript passes (`npm run typecheck`)

---

## 📝 Notes

### Known Issues

- None identified during testing

### Improvements for Future

- Drag-and-drop reordering instead of up/down buttons
- Image upload instead of URL input
- Live preview of block while editing
- Undo/redo for array operations

---

**Testing Date**: ********\_********  
**Tested By**: ********\_********  
**Status**: ⬜ Pending / ✅ Passed / ❌ Failed  
**Notes**: ****************\_****************
