-- WARNING: This script temporarily disables RLS for testing purposes
-- DO NOT use this in production!

-- Temporarily disable RLS on the appointments table
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Insert a test appointment
INSERT INTO appointments (
    user_id,
    service_id,
    appointment_date,
    appointment_time,
    status,
    notes,
    deposit_paid
) VALUES (
    '07101f9f-4cf3-4d4c-901a-3908c68070b6',  -- Ashley's user ID from your logs
    (SELECT id FROM services LIMIT 1),  -- Get the first service ID
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow
    '10:00',
    'pending',
    'Test appointment created with RLS disabled',
    false
);

-- Verify the appointment was created
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 1;

-- Re-enable RLS on the appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: After testing, make sure to run the appointments_rls.sql script again
-- to properly set up the RLS policies
