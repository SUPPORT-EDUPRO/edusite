-- Young Eagles infant (under 1 year) tuition is R950 per month (operator-confirmed 2026-10-14).
-- Two overlapping infant structures existed: "Ages 0-1" (R950, no structured age range) and the older
-- "Infants (8m-1yr)" (R850, ages 6-11 months). Fee selection prefers a structured age range, so new
-- learners were being billed R850. Give the R950 structure the infant age range and retire the R850 one.
-- Existing invoices keep their structure and amounts: nothing already billed is changed here.

UPDATE public.fee_structures
SET age_min_months = 0,
    age_max_months = 11
WHERE id = '17ae2f8e-41c4-443d-bcf7-9a0badb3c9f6'
  AND preschool_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND fee_type = 'tuition'
  AND amount = 950;

UPDATE public.fee_structures
SET is_active = false
WHERE id = 'ad892710-7afb-46a4-b5be-1cb60d689233'
  AND preschool_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND fee_type = 'tuition'
  AND amount = 850;
