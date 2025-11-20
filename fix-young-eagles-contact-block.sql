-- Fix Young Eagles landing page UX: Change "Ready to Enroll" to "Get in Touch"
UPDATE page_blocks
SET props = jsonb_set(
  jsonb_set(
    props,
    '{title}',
    '"Get in Touch"'
  ),
  '{subtitle}',
  '"Have questions about our programs? We''re here to help. Contact us today to learn more or schedule a visit."'
)
WHERE page_id = (
  SELECT id FROM pages WHERE centre_id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef' AND slug = 'young-eagles'
)
AND block_key = 'contactCTA';
