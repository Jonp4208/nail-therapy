-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;

-- Create a policy that allows anyone to create appointments
CREATE POLICY "Public can create appointments"
ON appointments FOR INSERT
WITH CHECK (true);  -- Allow any insert

-- List all policies after creation to verify
SELECT * FROM pg_policies WHERE tablename = 'appointments';
