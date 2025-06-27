-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_document_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (NOT deleted);

-- Create policies for candidate_profiles table
CREATE POLICY "Candidates can view their own profile" 
ON candidate_profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = candidate_profiles.profile_id
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Candidates can insert their own profile" 
ON candidate_profiles FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = candidate_profiles.profile_id
  AND profiles.user_id = auth.uid()
  AND profiles.role = 'candidate'
));

CREATE POLICY "Candidates can update their own profile" 
ON candidate_profiles FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = candidate_profiles.profile_id
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Employer can view candidate profiles" 
ON candidate_profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'employer'
) AND NOT deleted);

-- Create policies for employer_profiles table
CREATE POLICY "Employers can view their own profile" 
ON employer_profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = employer_profiles.profile_id
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Employers can insert their own profile" 
ON employer_profiles FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = employer_profiles.profile_id
  AND profiles.user_id = auth.uid()
  AND profiles.role = 'employer'
));

CREATE POLICY "Employers can update their own profile" 
ON employer_profiles FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = employer_profiles.profile_id
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Anyone can view employer profiles" 
ON employer_profiles FOR SELECT 
USING (NOT deleted);

-- Create policies for jobs table
CREATE POLICY "Employers can manage their own jobs" 
ON jobs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM employer_profiles
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE employer_profiles.id = jobs.company_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active jobs" 
ON jobs FOR SELECT 
USING (status = 'ACTIVE');

-- Create policies for applications table
CREATE POLICY "Candidates can view their own applications" 
ON applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = applications.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Candidates can create applications" 
ON applications FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = applications.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Candidates can update their own applications" 
ON applications FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = applications.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Employers can view applications for their jobs" 
ON applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.id = jobs.company_id
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE jobs.id = applications.job_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Employers can update applications for their jobs" 
ON applications FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.id = jobs.company_id
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE jobs.id = applications.job_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create policies for candidate_skills table
CREATE POLICY "Candidates can manage their own skills" 
ON candidate_skills FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = candidate_skills.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view candidate skills" 
ON candidate_skills FOR SELECT 
USING (NOT deleted);

-- Create policies for education table
CREATE POLICY "Candidates can manage their own education" 
ON education FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = education.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view education" 
ON education FOR SELECT 
USING (NOT deleted);

-- Create policies for experience table
CREATE POLICY "Candidates can manage their own experience" 
ON experience FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles
    JOIN profiles ON profiles.id = candidate_profiles.profile_id
    WHERE candidate_profiles.id = experience.candidate_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view experience" 
ON experience FOR SELECT 
USING (NOT deleted);

-- Create policies for industries table (reference data)
CREATE POLICY "Anyone can view industries" 
ON industries FOR SELECT 
USING (NOT deleted);

-- Create policies for job_industries table
CREATE POLICY "Employers can manage job industries for their jobs" 
ON job_industries FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.id = jobs.company_id
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE jobs.id = job_industries.job_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view job industries" 
ON job_industries FOR SELECT 
USING (NOT deleted);

-- Create policies for job_skills table
CREATE POLICY "Employers can manage job skills for their jobs" 
ON job_skills FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.id = jobs.company_id
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE jobs.id = job_skills.job_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view job skills" 
ON job_skills FOR SELECT 
USING (NOT deleted);

-- Create policies for locations table (reference data)
CREATE POLICY "Anyone can view locations" 
ON locations FOR SELECT 
USING (NOT deleted);

-- Create policies for payments table
CREATE POLICY "Employers can view their own payments" 
ON payments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employer_profiles
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE employer_profiles.id = payments.employer_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Employers can create payments" 
ON payments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employer_profiles
    JOIN profiles ON profiles.id = employer_profiles.profile_id
    WHERE employer_profiles.id = payments.employer_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create policies for saved_jobs table
CREATE POLICY "Users can manage their saved jobs" 
ON saved_jobs FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE profiles.id = saved_jobs.user_id
));

-- Create policies for sectors table (reference data)
CREATE POLICY "Anyone can view sectors" 
ON sectors FOR SELECT 
USING (NOT deleted);

-- Create policies for skills table (reference data)
CREATE POLICY "Anyone can view skills" 
ON skills FOR SELECT 
USING (NOT deleted);

-- Create policies for tenders table
CREATE POLICY "Users can manage their own tenders" 
ON tenders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = tenders.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view published tenders" 
ON tenders FOR SELECT 
USING (status = 'PUBLISHED' AND NOT deleted);






-- ########################################################

-- Cover Letters Storage policies
-- Policy for uploading cover letters (only authenticated users can upload)
CREATE POLICY "Users can upload their own cover letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for viewing cover letters (users can only see their own)
CREATE POLICY "Users can view their own cover letters"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating cover letters (users can only update their own)
CREATE POLICY "Users can update their own cover letters"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting cover letters (users can only delete their own)
CREATE POLICY "Users can delete their own cover letters"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- ########################################################
CREATE POLICY "Tender owners can read their documents"
ON storage.objects FOR SELECT USING (
  bucket_id = 'tender-documents' AND
  auth.role() = 'authenticated' AND
  auth.uid() = (
    SELECT t.user_id FROM public.tenders t
    WHERE t.id = (string_to_array(storage.objects.name, '/'))[1]::uuid
  )
);

CREATE POLICY "Service role can upload documents"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'tender-documents' AND
  auth.role() = 'service_role'
);

CREATE POLICY "Service role can delete documents"
ON storage.objects FOR DELETE USING (
  bucket_id = 'tender-documents' AND
  auth.role() = 'service_role'
);


-- ########################################################

 -- Allow admin users to upload to the blog-images bucket
     CREATE POLICY "Admin users can upload blog images"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (
       bucket_id = 'blog-images' AND
       auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin') -- Check against profiles.userId which links to auth.uid()
     );

     -- Allow public read access to blog-images (if bucket is public, this is often default, but explicit is good)
     CREATE POLICY "Public can read blog images"
     ON storage.objects FOR SELECT
     USING ( bucket_id = 'blog-images' );

     -- Allow public read for PUBLISHED and not deleted posts
     CREATE POLICY "Public can read published blog posts"
     ON public.blog_posts FOR SELECT
     USING (status = 'PUBLISHED' AND deleted = false);

     -- Allow admin users to read all blog posts
     CREATE POLICY "Admins can read all blog posts"
     ON public.blog_posts FOR SELECT
     TO authenticated
     USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));

   -- Allow admins to create blog posts

     CREATE POLICY "Admins can create blog posts"
     ON public.blog_posts FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));

   -- Allow admins to update blog posts

     CREATE POLICY "Admins can update blog posts"
     ON public.blog_posts FOR UPDATE
     TO authenticated
     USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'))
     WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));



  -- ########################################################
  -- Coupons
    1. Enable RLS on the tables

  -- Enable RLS
  ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
  ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

  2. Policies for coupons table

  -- Policy: Anyone can view active, non-deleted coupons that are currently valid
  CREATE POLICY "Public can view active coupons" ON coupons
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true
    AND deleted = false
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW())
  );

  -- Policy: Only admins can view all coupons (including inactive/deleted)
  CREATE POLICY "Admins can view all coupons" ON coupons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  );

  -- Policy: Only admins can insert coupons
  CREATE POLICY "Only admins can create coupons" ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  );

  -- Policy: Only admins can update coupons
  CREATE POLICY "Only admins can update coupons" ON coupons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  );

  -- Policy: Only admins can delete coupons (soft delete)
  CREATE POLICY "Only admins can delete coupons" ON coupons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  );

  3. Policies for coupon_redemptions table

  -- Policy: Users can view their own redemptions
  CREATE POLICY "Users can view own redemptions" ON coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.deleted = false
    )
    AND deleted = false
  );

  -- Policy: Admins can view all redemptions
  CREATE POLICY "Admins can view all redemptions" ON coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
  );

  -- Policy: System can insert redemptions (through server-side actions)
  -- Note: This should typically be handled server-side, not through direct client access
  CREATE POLICY "Authenticated users can create redemptions" ON coupon_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.deleted = false
    )
  );

  -- Policy: Nobody can update redemptions (immutable records)
  -- Redemptions should be immutable once created

  -- Policy: Only admins can soft delete redemptions
  CREATE POLICY "Only admins can delete redemptions" ON coupon_redemptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
    AND deleted = false
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.deleted = false
    )
    AND deleted = true -- Only allow setting deleted to true
  );

  4. Additional considerations

  You may also want to create a function to handle the increment of used_count on the coupons table when a redemption is created:

  -- Function to increment coupon used_count
  CREATE OR REPLACE FUNCTION increment_coupon_used_count()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE coupons
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = NEW.coupon_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger to call the function
  CREATE TRIGGER increment_coupon_used_count_trigger
  AFTER INSERT ON coupon_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_used_count();


  -- ########################################################
  -- Pricing Config
   -- Enable Row Level Security for pricing_config table
     ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

     -- Drop existing policies if any (for clean setup)
     DROP POLICY IF EXISTS "Anyone can view active pricing" ON
     pricing_config;
     DROP POLICY IF EXISTS "Admins can view all pricing configs" ON
     pricing_config;
     DROP POLICY IF EXISTS "Only admins can create pricing configs" ON
     pricing_config;
     DROP POLICY IF EXISTS "Only admins can update pricing configs" ON
     pricing_config;
     DROP POLICY IF EXISTS "Only admins can delete pricing configs" ON
     pricing_config;

     -- Policy 1: Anyone can view active pricing (needed for public 
     pricing display)
     CREATE POLICY "Anyone can view active pricing"
     ON pricing_config
     FOR SELECT
     USING (active = true);

     -- Policy 2: Admins can view all pricing configs (including 
     inactive ones for history)
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

     -- Policy 5: Only admins can delete pricing configs (though we 
     typically just deactivate)
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

     -- Create a function to automatically update the updated_at 
     timestamp
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

     -- Insert default pricing if no pricing exists (optional - adjust 
     the admin user ID)
     -- Note: Replace 'YOUR_ADMIN_USER_ID' with an actual admin user's 
     profile ID
     -- You can find this by running: SELECT id FROM profiles WHERE 
     role = 'admin' LIMIT 1;
     /*
     INSERT INTO pricing_config (price_per_month, currency, active, 
     created_by)
     SELECT 350000, 'GMD', true, id
     FROM profiles
     WHERE role = 'admin'
     LIMIT 1
     ON CONFLICT DO NOTHING;
     */