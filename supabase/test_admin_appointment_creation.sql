-- This script tests if your admin user can create appointments
-- It should be run after setting up the proper RLS policies

-- First, verify your admin status
SELECT
    id,
    email,
    full_name,
    is_admin,
    pg_typeof(is_admin) as admin_type
FROM
    profiles
WHERE
    email = 'jonp4208@gmail.com';  -- Replace with your email

-- Test the is_admin function
SELECT is_admin() as current_user_is_admin;

-- Get a client ID to use for the test
SELECT
    id,
    full_name,
    email,
    is_admin
FROM
    profiles
WHERE
    is_admin IS NOT TRUE
    OR is_admin = 'false'
    OR is_admin = 'f'
    OR is_admin = '0'
LIMIT 1;

-- Get a service ID to use for the test
SELECT
    id,
    name,
    price
FROM
    services
LIMIT 1;

-- Now, try to create an appointment as the admin user
-- First, get a valid service ID (this will be a UUID)
DO $$
DECLARE
    client_id UUID := '07101f9f-4cf3-4d4c-901a-3908c68070b6';  -- Ashley's ID from your logs
    service_id UUID;
BEGIN
    -- Get a valid service ID
    SELECT id INTO service_id FROM services LIMIT 1;

    -- Insert the appointment using the valid service ID
    INSERT INTO appointments (
        user_id,
        service_id,
        appointment_date,
        appointment_time,
        status,
        notes,
        deposit_paid
    ) VALUES (
        client_id,
        service_id,
        CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow
        '14:00',
        'pending',
        'Test appointment created by admin',
        false
    );
END
$$;

-- Verify the appointment was created
SELECT
    a.id,
    a.user_id,
    p.full_name as client_name,
    a.service_id,
    s.name as service_name,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    a.deposit_paid,
    a.created_at
FROM
    appointments a
JOIN
    profiles p ON a.user_id = p.id
JOIN
    services s ON a.service_id = s.id
ORDER BY
    a.created_at DESC
LIMIT 1;
