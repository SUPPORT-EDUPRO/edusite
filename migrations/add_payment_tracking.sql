-- Add payment tracking columns to registration_requests
ALTER TABLE registration_requests
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'payfast', 'cash', 'other')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

-- Update existing columns if they exist with wrong type
DO $$ 
BEGIN
  -- registration_fee_amount should already exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registration_requests' AND column_name = 'registration_fee_amount') THEN
    ALTER TABLE registration_requests ADD COLUMN registration_fee_amount DECIMAL(10,2);
  END IF;
  
  -- registration_fee_paid should already exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registration_requests' AND column_name = 'registration_fee_paid') THEN
    ALTER TABLE registration_requests ADD COLUMN registration_fee_paid BOOLEAN DEFAULT false;
  END IF;
  
  -- registration_fee_payment_id should already exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registration_requests' AND column_name = 'registration_fee_payment_id') THEN
    ALTER TABLE registration_requests ADD COLUMN registration_fee_payment_id TEXT;
  END IF;
END $$;

COMMENT ON COLUMN registration_requests.payment_method IS 'Method used for payment: bank_transfer, payfast, cash, other';
COMMENT ON COLUMN registration_requests.payment_date IS 'Date when payment was received/verified';
COMMENT ON COLUMN registration_requests.proof_of_payment_url IS 'URL to uploaded proof of payment document';
COMMENT ON COLUMN registration_requests.registration_fee_amount IS 'Final amount to be paid (after discounts)';
COMMENT ON COLUMN registration_requests.registration_fee_paid IS 'Whether registration fee has been paid';
COMMENT ON COLUMN registration_requests.registration_fee_payment_id IS 'Payment reference or transaction ID';
