-- Get the page ID for Young Eagles
DO $$
DECLARE
  v_page_id uuid;
BEGIN
  SELECT id INTO v_page_id FROM pages WHERE centre_id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef' AND slug = 'young-eagles';
  
  -- 1. Hero Block
  INSERT INTO page_blocks (page_id, block_key, block_order, props, created_at, updated_at)
  VALUES (
    v_page_id,
    'hero',
    1,
    jsonb_build_object(
      'title', 'Welcome to Young Eagles Day Care',
      'subtitle', 'Where learning meets love. We nurture little minds with big dreams through play, care, and creativity with cutting-edge Society 5.0 integration.',
      'ctaText', '📝 Register for 2026',
      'ctaLink', '/register',
      'ctaSecondaryText', 'View Programs',
      'ctaSecondaryLink', '/programs',
      'backgroundImage', 'https://img.freepik.com/free-photo/realistic-scene-with-young-children-with-autism-playing_23-2151241999.jpg',
      'backgroundOverlay', 'gradient',
      'textAlign', 'center',
      'height', 'tall'
    ),
    NOW(),
    NOW()
  );

  -- 2. Stats Block
  INSERT INTO page_blocks (page_id, block_key, block_order, props, created_at, updated_at)
  VALUES (
    v_page_id,
    'stats',
    2,
    jsonb_build_object(
      'title', 'Trusted by Families Everywhere',
      'stats', jsonb_build_array(
        jsonb_build_object('label', 'Happy Children', 'value', '200', 'icon', 'users'),
        jsonb_build_object('label', 'Years Experience', 'value', '15', 'icon', 'star'),
        jsonb_build_object('label', 'Expert Staff', 'value', '10', 'icon', 'graduationCap'),
        jsonb_build_object('label', 'Parent Satisfaction', 'value', '98%', 'icon', 'heart')
      ),
      'layout', 'grid',
      'columns', 4,
      'backgroundColor', 'white'
    ),
    NOW(),
    NOW()
  );

  -- 3. Features Block
  INSERT INTO page_blocks (page_id, block_key, block_order, props, created_at, updated_at)
  VALUES (
    v_page_id,
    'features',
    3,
    jsonb_build_object(
      'title', 'Why Choose Young Eagles?',
      'subtitle', 'We provide the best early childhood education with modern technology integration',
      'features', jsonb_build_array(
        jsonb_build_object(
          'title', 'Society 5.0 Learning',
          'description', 'Integrating AI, IoT, and digital tools for future-ready education',
          'icon', 'graduationCap',
          'color', 'blue'
        ),
        jsonb_build_object(
          'title', 'Expert Caregivers',
          'description', 'Certified educators with years of experience in child development',
          'icon', 'users',
          'color', 'green'
        ),
        jsonb_build_object(
          'title', 'Safe Environment',
          'description', 'Secure, clean, and nurturing spaces designed for children',
          'icon', 'shield',
          'color', 'purple'
        ),
        jsonb_build_object(
          'title', 'Loving Care',
          'description', 'Personalized attention and emotional support for every child',
          'icon', 'heart',
          'color', 'red'
        )
      ),
      'layout', 'grid',
      'columns', 2
    ),
    NOW(),
    NOW()
  );

  -- 4. Contact CTA Block
  INSERT INTO page_blocks (page_id, block_key, block_order, props, created_at, updated_at)
  VALUES (
    v_page_id,
    'contactCTA',
    4,
    jsonb_build_object(
      'title', 'Ready to Enroll Your Child?',
      'subtitle', 'Get in touch with us today to schedule a tour or learn more about our programs',
      'email', 'info@youngeagles.co.za',
      'phone', '+27 12 345 6789',
      'address', 'Pretoria, Gauteng, South Africa',
      'showContactForm', true,
      'backgroundColor', 'gradient'
    ),
    NOW(),
    NOW()
  );

END $$;
