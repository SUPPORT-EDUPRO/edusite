-- Align the structured infant tuition band with the operator-confirmed group:
-- 6 months through 11 months (the child's first birthday starts the next band).
-- The R950 structure was activated by 20261015090000. Existing student fees,
-- invoices and payments are intentionally untouched.

UPDATE public.fee_structures
SET age_min_months = 6,
    age_max_months = 11
WHERE id = '17ae2f8e-41c4-443d-bcf7-9a0badb3c9f6'
  AND preschool_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND fee_type = 'tuition'
  AND amount = 950
  AND is_active = true
  AND (age_min_months IS DISTINCT FROM 6 OR age_max_months IS DISTINCT FROM 11);
