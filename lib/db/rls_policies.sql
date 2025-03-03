-- Row Level Security (RLS) Policies for Gambian Job Board
-- These policies define who can access and modify which rows in each table

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_industries ENABLE ROW LEVEL SECURITY;

-- Create application functions to use in policies
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  -- Implement your admin check logic here
  -- Example: RETURN auth.uid() IN (SELECT user_id FROM admins);
  RETURN FALSE; -- Default implementation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is the owner of a profile
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = profile_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is an employer
CREATE OR REPLACE FUNCTION public.is_employer() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'employer'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is a candidate
CREATE OR REPLACE FUNCTION public.is_candidate() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'candidate'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is the owner of a job
CREATE OR REPLACE FUNCTION public.is_job_owner(job_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = job_id 
    AND employer_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is the owner of a tender
CREATE OR REPLACE FUNCTION public.is_tender_owner(tender_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenders 
    WHERE id = tender_id 
    AND user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if this is the user's application
CREATE OR REPLACE FUNCTION public.is_own_application(application_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications 
    WHERE id = application_id 
    AND candidate_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if this application belongs to the employer's job
CREATE OR REPLACE FUNCTION public.is_application_for_own_job(application_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN profiles p ON j.employer_id = p.id
    WHERE a.id = application_id 
    AND p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILE POLICIES ----------------------------------------------------------
-- Profiles are visible to authenticated users
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can only update their own profile
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the user themselves or admins can delete their profile
CREATE POLICY profiles_delete_policy ON profiles
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- EMPLOYER PROFILES POLICIES ------------------------------------------------
-- Employer profiles are visible to authenticated users
CREATE POLICY employer_profiles_select_policy ON employer_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND (deleted = false OR is_profile_owner(profile_id)));

-- Users can only update their own employer profile
CREATE POLICY employer_profiles_update_policy ON employer_profiles
  FOR UPDATE USING (is_profile_owner(profile_id));

-- Users can only insert their own employer profile if they are employers
CREATE POLICY employer_profiles_insert_policy ON employer_profiles
  FOR INSERT WITH CHECK (is_profile_owner(profile_id) AND is_employer());

-- Only the user themselves or admins can delete their employer profile
CREATE POLICY employer_profiles_delete_policy ON employer_profiles
  FOR DELETE USING (is_profile_owner(profile_id) OR is_admin());

-- CANDIDATE PROFILES POLICIES -----------------------------------------------
-- Candidate profiles are visible to authenticated users, but full details only to employers and profile owners
CREATE POLICY candidate_profiles_select_policy ON candidate_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND (deleted = false OR is_profile_owner(profile_id)));

-- Users can only update their own candidate profile
CREATE POLICY candidate_profiles_update_policy ON candidate_profiles
  FOR UPDATE USING (is_profile_owner(profile_id));

-- Users can only insert their own candidate profile if they are candidates
CREATE POLICY candidate_profiles_insert_policy ON candidate_profiles
  FOR INSERT WITH CHECK (is_profile_owner(profile_id) AND is_candidate());

-- Only the user themselves or admins can delete their candidate profile
CREATE POLICY candidate_profiles_delete_policy ON candidate_profiles
  FOR DELETE USING (is_profile_owner(profile_id) OR is_admin());

-- LOCATIONS POLICIES --------------------------------------------------------
-- Locations are visible to all authenticated users
CREATE POLICY locations_select_policy ON locations
  FOR SELECT USING (auth.uid() IS NOT NULL AND deleted = false);

-- Only admins can insert locations
CREATE POLICY locations_insert_policy ON locations
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can update locations
CREATE POLICY locations_update_policy ON locations
  FOR UPDATE USING (is_admin());

-- Only admins can delete locations
CREATE POLICY locations_delete_policy ON locations
  FOR DELETE USING (is_admin());

-- JOBS POLICIES -------------------------------------------------------------
-- Active jobs are visible to all authenticated users
CREATE POLICY jobs_select_policy ON jobs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    ((deleted = false AND isActive = true) OR 
     is_job_owner(id))
  );

-- Only employers can create jobs
CREATE POLICY jobs_insert_policy ON jobs
  FOR INSERT WITH CHECK (
    is_employer() AND 
    employer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Only job owners can update their jobs
CREATE POLICY jobs_update_policy ON jobs
  FOR UPDATE USING (is_job_owner(id));

-- Only job owners and admins can delete jobs
CREATE POLICY jobs_delete_policy ON jobs
  FOR DELETE USING (is_job_owner(id) OR is_admin());

-- APPLICATIONS POLICIES -----------------------------------------------------
-- Candidates can see their own applications
-- Employers can see applications for their jobs
CREATE POLICY applications_select_policy ON applications
  FOR SELECT USING (
    (is_candidate() AND candidate_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) OR
    (is_employer() AND job_id IN (SELECT id FROM jobs WHERE employer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))) OR
    is_admin()
  );

-- Candidates can apply for jobs
CREATE POLICY applications_insert_policy ON applications
  FOR INSERT WITH CHECK (
    is_candidate() AND 
    candidate_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    deleted = false
  );

-- Candidates can update their own applications, employers can update status of applications for their jobs
CREATE POLICY applications_update_policy ON applications
  FOR UPDATE USING (
    (is_candidate() AND is_own_application(id)) OR
    (is_employer() AND is_application_for_own_job(id)) OR
    is_admin()
  );

-- Only application owners, job owners, or admins can delete applications
CREATE POLICY applications_delete_policy ON applications
  FOR DELETE USING (
    is_own_application(id) OR 
    is_application_for_own_job(id) OR 
    is_admin()
  );

-- SAVED JOBS POLICIES -------------------------------------------------------
-- Users can see their own saved jobs
CREATE POLICY saved_jobs_select_policy ON saved_jobs
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    deleted = false
  );

-- Users can save jobs
CREATE POLICY saved_jobs_insert_policy ON saved_jobs
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Users can update their own saved jobs (though this is rare)
CREATE POLICY saved_jobs_update_policy ON saved_jobs
  FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Users can only delete their own saved jobs
CREATE POLICY saved_jobs_delete_policy ON saved_jobs
  FOR DELETE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    is_admin()
  );

-- TENDERS POLICIES ----------------------------------------------------------
-- Published tenders are visible to all authenticated users, drafts only to owners
CREATE POLICY tenders_select_policy ON tenders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    (
      (status = 'PUBLISHED'::tender_status AND deletedAt IS NULL) OR
      is_tender_owner(id) OR
      is_admin()
    )
  );

-- Only authenticated users can create tenders
CREATE POLICY tenders_insert_policy ON tenders
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Only tender owners can update their tenders
CREATE POLICY tenders_update_policy ON tenders
  FOR UPDATE USING (
    is_tender_owner(id) OR
    is_admin()
  );

-- Only tender owners and admins can delete tenders
CREATE POLICY tenders_delete_policy ON tenders
  FOR DELETE USING (
    is_tender_owner(id) OR
    is_admin()
  );

-- SKILLS POLICIES -----------------------------------------------------------
-- Skills are visible to all authenticated users
CREATE POLICY skills_select_policy ON skills
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    deleted = false
  );

-- Only admins can insert skills (to maintain quality)
CREATE POLICY skills_insert_policy ON skills
  FOR INSERT WITH CHECK (
    is_admin()
  );

-- Only admins can update skills
CREATE POLICY skills_update_policy ON skills
  FOR UPDATE USING (
    is_admin()
  );

-- Only admins can delete skills
CREATE POLICY skills_delete_policy ON skills
  FOR DELETE USING (
    is_admin()
  );

-- JOB SKILLS POLICIES -------------------------------------------------------
-- Job skills are visible to all authenticated users
CREATE POLICY job_skills_select_policy ON job_skills
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    deleted = false
  );

-- Job owners can add skills to their jobs
CREATE POLICY job_skills_insert_policy ON job_skills
  FOR INSERT WITH CHECK (
    is_job_owner(job_id) OR
    is_admin()
  );

-- Job owners can update skills on their jobs
CREATE POLICY job_skills_update_policy ON job_skills
  FOR UPDATE USING (
    is_job_owner(job_id) OR
    is_admin()
  );

-- Job owners can remove skills from their jobs
CREATE POLICY job_skills_delete_policy ON job_skills
  FOR DELETE USING (
    is_job_owner(job_id) OR
    is_admin()
  );

-- INDUSTRIES POLICIES -------------------------------------------------------
-- Industries are visible to all authenticated users
CREATE POLICY industries_select_policy ON industries
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    deleted = false
  );

-- Only admins can create industries (to maintain quality and prevent duplicates)
CREATE POLICY industries_insert_policy ON industries
  FOR INSERT WITH CHECK (
    is_admin()
  );

-- Only admins can update industries
CREATE POLICY industries_update_policy ON industries
  FOR UPDATE USING (
    is_admin()
  );

-- Only admins can delete industries
CREATE POLICY industries_delete_policy ON industries
  FOR DELETE USING (
    is_admin()
  );

-- JOB INDUSTRIES POLICIES ---------------------------------------------------
-- Job industries are visible to all authenticated users
CREATE POLICY job_industries_select_policy ON job_industries
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    deleted = false
  );

-- Job owners can add industries to their jobs
CREATE POLICY job_industries_insert_policy ON job_industries
  FOR INSERT WITH CHECK (
    is_job_owner(job_id) OR
    is_admin()
  );

-- Job owners can update industries on their jobs
CREATE POLICY job_industries_update_policy ON job_industries
  FOR UPDATE USING (
    is_job_owner(job_id) OR
    is_admin()
  );

-- Job owners can remove industries from their jobs
CREATE POLICY job_industries_delete_policy ON job_industries
  FOR DELETE USING (
    is_job_owner(job_id) OR
    is_admin()
  );

-- Grant permissions to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow anon users to read some tables
GRANT SELECT ON locations, skills, industries, jobs TO anon;
