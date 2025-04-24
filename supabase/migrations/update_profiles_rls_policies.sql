-- First, check the current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';

-- Enable Row Level Security for profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service can create profiles" ON profiles;
DROP POLICY IF EXISTS "Public can create guest profiles" ON profiles;

-- Create a temporary function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.is_admin = true OR 
      profiles.is_admin = 'true' OR 
      profiles.is_admin = 't' OR 
      profiles.is_admin = '1'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for regular users
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policies for admin users
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (is_admin());

-- Create a policy that allows the service to create profiles for authenticated users
CREATE POLICY "Service can create profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create a policy that allows creating guest profiles from public
CREATE POLICY "Public can create guest profiles"
ON profiles FOR INSERT
WITH CHECK (
  -- Allow insertion of guest profiles from public
  is_guest = true
);

-- List all policies after creation to verify
SELECT * FROM pg_policies WHERE tablename = 'profiles';
