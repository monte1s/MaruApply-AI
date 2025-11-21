-- Create profiles table migration
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on profile_data for JSON queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_data ON profiles USING GIN (profile_data);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE SETUP FOR RESUME PDFs
-- ============================================
-- IMPORTANT: You MUST create the storage bucket MANUALLY before running the policies below!
-- Storage buckets cannot be created via SQL - they must be created in the Supabase dashboard.
--
-- STEP 1: Create the bucket manually:
--   1. Go to Storage in your Supabase dashboard (left sidebar)
--   2. Click "Create a new bucket" button
--   3. Name it exactly: "resumes" (lowercase, no spaces)
--   4. Choose PUBLIC or PRIVATE:
--      - PUBLIC: Files are accessible via public URLs (simpler, but less secure)
--      - PRIVATE: Files require authentication (more secure, but requires signed URLs for access)
--   5. Click "Create bucket"
--
-- STEP 2: After the bucket is created, run the following SQL policies:
-- (The policies below will fail if the bucket doesn't exist yet!)
--
-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload own resume"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own resumes
CREATE POLICY "Users can view own resume"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own resumes
CREATE POLICY "Users can update own resume"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resume"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );