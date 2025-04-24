-- First, let's check the current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments';

-- Enable Row Level Security for appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can insert appointments for any user" ON appointments;
DROP POLICY IF EXISTS "Admins can update any appointment" ON appointments;
DROP POLICY IF EXISTS "Admins can delete any appointment" ON appointments;

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
CREATE POLICY "Users can view their own appointments"
ON appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
ON appointments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
ON appointments FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for admin users
CREATE POLICY "Admins can view all appointments"
ON appointments FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert appointments for any user"
ON appointments FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update any appointment"
ON appointments FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any appointment"
ON appointments FOR DELETE
USING (is_admin());

-- Let's also create a policy that allows service workers to view appointments
CREATE POLICY "Service workers can view all appointments"
ON appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.is_admin = true OR
      profiles.is_admin = 'true' OR
      profiles.is_admin = 't' OR
      profiles.is_admin = '1'
    )
  )
);

-- List all policies after creation to verify
SELECT * FROM pg_policies WHERE tablename = 'appointments';
