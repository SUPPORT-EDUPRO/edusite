-- =====================================================
-- MARKETING & PAYMENT SYSTEM FOR EDUSITEPRO
-- Multi-tenant promotional campaigns, landing pages, payment tracking
-- =====================================================

-- 1. MARKETING CAMPAIGNS & PROMOTIONS
-- =====================================================

CREATE TYPE campaign_type AS ENUM (
  'early_bird',
  'sibling_discount',
  'referral_bonus',
  'seasonal_promo',
  'bundle_offer',
  'scholarship'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'waive_registration',
  'first_month_free'
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Campaign Details
  name VARCHAR(200) NOT NULL,
  campaign_type campaign_type NOT NULL,
  description TEXT,
  terms_conditions TEXT,
  
  -- Targeting
  target_audience TEXT[], -- e.g., ['new_students', 'returning_students', 'siblings']
  target_classes TEXT[], -- Specific grade levels
  
  -- Discount Configuration
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10,2), -- percentage (e.g., 20 for 20%) or fixed amount
  max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts
  
  -- Redemption Rules
  promo_code VARCHAR(50) UNIQUE,
  max_redemptions INTEGER, -- NULL = unlimited
  current_redemptions INTEGER DEFAULT 0,
  min_purchase_amount DECIMAL(10,2),
  
  -- Validity Period
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  
  -- Auto-apply rules
  auto_apply BOOLEAN DEFAULT false, -- Apply automatically if conditions met
  auto_apply_conditions JSONB, -- e.g., {"registered_before": "2026-01-31"}
  
  -- Status
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false, -- Show on marketing landing page
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_campaigns_org ON marketing_campaigns(organization_id) WHERE active = true;
CREATE INDEX idx_campaigns_promo_code ON marketing_campaigns(promo_code) WHERE promo_code IS NOT NULL;
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date) WHERE active = true;

-- 2. ORGANIZATION LANDING PAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Page Content
  hero_title TEXT DEFAULT 'Welcome to Our School',
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_cta_text VARCHAR(100) DEFAULT 'Register Now',
  hero_cta_link VARCHAR(255) DEFAULT '/register',
  
  -- Featured Sections
  show_programs BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_gallery BOOLEAN DEFAULT true,
  show_stats BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  
  -- Quick Stats
  stats JSONB DEFAULT '{"students": 0, "teachers": 0, "years": 0, "satisfaction": 98}',
  
  -- Testimonials
  testimonials JSONB DEFAULT '[]',
  
  -- Gallery Images
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Programs Offered
  programs JSONB DEFAULT '[]',
  
  -- SEO
  meta_title VARCHAR(100),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Tracking
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Status
  published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- 3. PAYMENT TRACKING & METHODS
-- =====================================================

CREATE TYPE payment_method AS ENUM (
  'credit_card',
  'debit_card',
  'eft',
  'bank_transfer',
  'cash',
  'cheque',
  'paypal',
  'ozow',
  'payfast',
  'snapscan',
  'zapper'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'awaiting_proof',
  'verifying',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

CREATE TYPE fee_type AS ENUM (
  'registration_fee',
  'application_fee',
  'tuition_monthly',
  'tuition_annual',
  'deposit',
  'uniform',
  'books',
  'activities',
  'transport',
  'meals',
  'late_payment_penalty'
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  registration_request_id UUID REFERENCES registration_requests(id) ON DELETE SET NULL,
  
  -- Payer Information
  payer_name VARCHAR(255) NOT NULL,
  payer_email VARCHAR(255) NOT NULL,
  payer_phone VARCHAR(50),
  
  -- Transaction Details
  fee_type fee_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2), -- Before discount
  discount_applied DECIMAL(10,2) DEFAULT 0,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  
  -- Payment Method
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  
  -- For EFT/Bank Transfer
  payment_reference VARCHAR(100), -- Reference number from bank
  proof_of_payment_url TEXT, -- Upload proof
  bank_statement_url TEXT,
  
  -- For Online Payments
  gateway_transaction_id VARCHAR(255), -- PayFast, Ozow, etc.
  gateway_response JSONB,
  
  -- Verification
  verified_by UUID, -- Staff member who verified
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  -- Refunds
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refund_date TIMESTAMP,
  
  -- Metadata
  due_date DATE,
  payment_date TIMESTAMP,
  academic_year VARCHAR(10) DEFAULT '2026',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_org ON payment_transactions(organization_id);
CREATE INDEX idx_payments_registration ON payment_transactions(registration_request_id);
CREATE INDEX idx_payments_status ON payment_transactions(payment_status);
CREATE INDEX idx_payments_method ON payment_transactions(payment_method);

-- 4. FEE STRUCTURES PER ORGANIZATION
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Fee Configuration
  fee_type fee_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  
  -- Applicability
  applies_to_grades TEXT[], -- NULL = all grades
  mandatory BOOLEAN DEFAULT true,
  
  -- Payment Terms
  payment_frequency VARCHAR(50), -- 'once', 'monthly', 'quarterly', 'annual'
  due_day_of_month INTEGER, -- For recurring fees
  grace_period_days INTEGER DEFAULT 7,
  late_payment_penalty_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Active Period
  academic_year VARCHAR(10) DEFAULT '2026',
  active BOOLEAN DEFAULT true,
  
  -- Description
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_org ON organization_fee_structures(organization_id, academic_year);

-- 5. REGISTRATION FEE TRACKING (Link to registration_requests)
-- =====================================================

ALTER TABLE registration_requests
ADD COLUMN IF NOT EXISTS registration_fee_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS registration_fee_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_fee_payment_id UUID REFERENCES payment_transactions(id),
ADD COLUMN IF NOT EXISTS campaign_applied UUID REFERENCES marketing_campaigns(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2);

-- 6. CAMPAIGN REDEMPTIONS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  registration_request_id UUID NOT NULL REFERENCES registration_requests(id) ON DELETE CASCADE,
  
  -- Redemption Details
  redeemed_by_email VARCHAR(255) NOT NULL,
  discount_applied DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  
  -- Verification
  promo_code_used VARCHAR(50),
  auto_applied BOOLEAN DEFAULT false,
  
  redeemed_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(campaign_id, registration_request_id)
);

-- 7. SAMPLE DATA: YOUNG EAGLES EARLY BIRD CAMPAIGN
-- =====================================================

INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  terms_conditions,
  discount_type,
  discount_value,
  promo_code,
  max_redemptions,
  start_date,
  end_date,
  auto_apply,
  auto_apply_conditions,
  active,
  featured
)
SELECT 
  id,
  'Early Bird Registration 2026',
  'early_bird',
  'Register before January 31st, 2026 and save 20% on your registration fee!',
  'Offer valid for new students only. Registration must be completed by January 31, 2026. Cannot be combined with other offers.',
  'percentage',
  20.00,
  'EARLYBIRD2026',
  100, -- First 100 registrations
  '2025-11-16 00:00:00',
  '2026-01-31 23:59:59',
  true, -- Auto-apply
  '{"registered_before": "2026-01-31"}',
  true,
  true
FROM organizations WHERE slug = 'young-eagles';

-- Sample Fee Structure for Young Eagles
INSERT INTO organization_fee_structures (
  organization_id,
  fee_type,
  amount,
  mandatory,
  payment_frequency,
  academic_year,
  description
)
SELECT 
  id,
  'registration_fee',
  500.00,
  true,
  'once',
  '2026',
  'One-time registration fee for new students'
FROM organizations WHERE slug = 'young-eagles';

INSERT INTO organization_fee_structures (
  organization_id,
  fee_type,
  amount,
  mandatory,
  payment_frequency,
  due_day_of_month,
  academic_year,
  description
)
SELECT 
  id,
  'tuition_monthly',
  2500.00,
  true,
  'monthly',
  5, -- Due on 5th of each month
  '2026',
  'Monthly tuition fee'
FROM organizations WHERE slug = 'young-eagles';

-- 8. VIEWS FOR EASY ACCESS
-- =====================================================

CREATE OR REPLACE VIEW active_campaigns AS
SELECT 
  c.*,
  o.name as organization_name,
  o.slug as organization_slug,
  CASE 
    WHEN c.end_date < NOW() THEN 'expired'
    WHEN c.start_date > NOW() THEN 'upcoming'
    WHEN c.current_redemptions >= c.max_redemptions THEN 'fully_redeemed'
    ELSE 'active'
  END as campaign_status
FROM marketing_campaigns c
JOIN organizations o ON c.organization_id = o.id
WHERE c.active = true;

GRANT SELECT ON active_campaigns TO authenticated, anon;

-- 9. FUNCTIONS
-- =====================================================

-- Function to apply campaign discount
CREATE OR REPLACE FUNCTION apply_campaign_discount(
  p_registration_id UUID,
  p_campaign_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
  v_registration RECORD;
  v_fee_amount DECIMAL(10,2);
  v_discount DECIMAL(10,2);
  v_final_amount DECIMAL(10,2);
BEGIN
  -- Get campaign details
  SELECT * INTO v_campaign FROM marketing_campaigns WHERE id = p_campaign_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Campaign not found');
  END IF;
  
  -- Check if campaign is active and valid
  IF v_campaign.active = false OR 
     NOW() < v_campaign.start_date OR 
     NOW() > v_campaign.end_date OR
     (v_campaign.max_redemptions IS NOT NULL AND v_campaign.current_redemptions >= v_campaign.max_redemptions) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Campaign is not valid');
  END IF;
  
  -- Get registration fee
  SELECT amount INTO v_fee_amount 
  FROM organization_fee_structures 
  WHERE organization_id = v_campaign.organization_id 
    AND fee_type = 'registration_fee' 
    AND active = true;
  
  -- Calculate discount
  IF v_campaign.discount_type = 'percentage' THEN
    v_discount := v_fee_amount * (v_campaign.discount_value / 100);
    IF v_campaign.max_discount_amount IS NOT NULL AND v_discount > v_campaign.max_discount_amount THEN
      v_discount := v_campaign.max_discount_amount;
    END IF;
  ELSIF v_campaign.discount_type = 'fixed_amount' THEN
    v_discount := v_campaign.discount_value;
  ELSIF v_campaign.discount_type = 'waive_registration' THEN
    v_discount := v_fee_amount;
  END IF;
  
  v_final_amount := v_fee_amount - v_discount;
  
  -- Update registration request
  UPDATE registration_requests 
  SET 
    campaign_applied = p_campaign_id,
    registration_fee_amount = v_fee_amount,
    discount_amount = v_discount,
    final_amount = v_final_amount
  WHERE id = p_registration_id;
  
  -- Track redemption
  INSERT INTO campaign_redemptions (
    campaign_id, 
    registration_request_id, 
    redeemed_by_email,
    discount_applied,
    original_amount,
    final_amount,
    auto_applied
  )
  SELECT 
    p_campaign_id,
    p_registration_id,
    guardian_email,
    v_discount,
    v_fee_amount,
    v_final_amount,
    v_campaign.auto_apply
  FROM registration_requests WHERE id = p_registration_id;
  
  -- Update campaign redemption count
  UPDATE marketing_campaigns 
  SET current_redemptions = current_redemptions + 1
  WHERE id = p_campaign_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'original_amount', v_fee_amount,
    'discount', v_discount,
    'final_amount', v_final_amount
  );
END;
$$ LANGUAGE plpgsql;

-- 10. RLS POLICIES
-- =====================================================

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_redemptions ENABLE ROW LEVEL SECURITY;

-- Public can view active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON marketing_campaigns FOR SELECT
USING (active = true AND start_date <= NOW() AND end_date >= NOW());

-- Public can view published landing pages
CREATE POLICY "Anyone can view published landing pages"
ON organization_landing_pages FOR SELECT
USING (published = true);

-- Organizations manage their own campaigns
CREATE POLICY "Organizations manage own campaigns"
ON marketing_campaigns FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
));

-- Organizations manage their own payments
CREATE POLICY "Organizations manage own payments"
ON payment_transactions FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
));

COMMENT ON TABLE marketing_campaigns IS 'Promotional campaigns and discount offers for organizations';
COMMENT ON TABLE organization_landing_pages IS 'Marketing landing pages for each organization';
COMMENT ON TABLE payment_transactions IS 'Payment tracking for all transaction types';
COMMENT ON TABLE organization_fee_structures IS 'Fee configuration per organization and academic year';
