-- Enable Row Level Security for pricing_config table
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean setup)
DROP POLICY IF EXISTS "Anyone can view active pricing" ON pricing_config;
DROP POLICY IF EXISTS "Admins can view all pricing configs" ON pricing_config;
DROP POLICY IF EXISTS "Only admins can create pricing configs" ON pricing_config;
DROP POLICY IF EXISTS "Only admins can update pricing configs" ON pricing_config;
DROP POLICY IF EXISTS "Only admins can delete pricing configs" ON pricing_config;

-- Policy 1: Anyone can view active pricing (needed for public pricing display)
CREATE POLICY "Anyone can view active pricing" 
ON pricing_config 
FOR SELECT 
USING (active = true);

-- Policy 2: Admins can view all pricing configs (including inactive ones for history)
CREATE POLICY "Admins can view all pricing configs" 
ON pricing_config 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Only admins can create new pricing configs
CREATE POLICY "Only admins can create pricing configs" 
ON pricing_config 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 4: Only admins can update pricing configs
CREATE POLICY "Only admins can update pricing configs" 
ON pricing_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Only admins can delete pricing configs (though we typically just deactivate)
CREATE POLICY "Only admins can delete pricing configs" 
ON pricing_config 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_pricing_config_updated_at 
BEFORE UPDATE ON pricing_config 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert default pricing if no pricing exists (optional - adjust the admin user ID)
-- Note: Replace 'YOUR_ADMIN_USER_ID' with an actual admin user's profile ID
-- You can find this by running: SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;
/*
INSERT INTO pricing_config (price_per_month, currency, active, created_by)
SELECT 350000, 'GMD', true, id
FROM profiles
WHERE role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;
*/