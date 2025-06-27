-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_month INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GMD',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS pricing_config_active_idx ON pricing_config(active);
CREATE INDEX IF NOT EXISTS pricing_config_created_at_idx ON pricing_config(created_at);

-- Insert default pricing (3,500 GMD per month in bututs)
-- Note: You'll need to replace 'YOUR_ADMIN_USER_ID' with an actual admin user ID
-- INSERT INTO pricing_config (price_per_month, currency, active, created_by) 
-- VALUES (350000, 'GMD', true, 'YOUR_ADMIN_USER_ID');