-- Clean up overlapping and potentially conflicting RLS policies

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can insert appointments for any user" ON appointments;
DROP POLICY IF EXISTS "Admins can update any appointment" ON appointments;
DROP POLICY IF EXISTS "Admins can delete any appointment" ON appointments;
DROP POLICY IF EXISTS "Service workers can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Only admins can delete appointments" ON appointments;

-- Drop the is_admin function if it exists and recreate it
DROP FUNCTION IF EXISTS is_admin();

-- Create the is_admin function
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

-- Create simplified policies with clear separation between admin and regular users

-- 1. Regular user policies - only for their own appointments
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

-- 2. Admin policies - can manage all appointments
CREATE POLICY "Admins can view all appointments"
ON appointments FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert any appointment"
ON appointments FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update any appointment"
ON appointments FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any appointment"
ON appointments FOR DELETE
USING (is_admin());

-- Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'appointments'
ORDER BY
    policyname;
