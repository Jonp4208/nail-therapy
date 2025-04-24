-- This is a simplified version of the test script that doesn't use DO blocks

-- First, get a valid service ID
SELECT id AS service_id FROM services LIMIT 1;

-- Copy the service_id from the result above and use it in the INSERT statement below
-- Replace 'paste-service-id-here' with the actual UUID from the query above

-- Insert an appointment for Ashley (client ID from your logs)
INSERT INTO appointments (
    user_id,
    service_id,
    appointment_date,
    appointment_time,
    status,
    notes,
    deposit_paid
) VALUES (
    '07101f9f-4cf3-4d4c-901a-3908c68070b6',  -- Ashley's ID
    'paste-service-id-here',  -- Replace with the service ID you got from the query above
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow
    '14:00',
    'pending',
    'Test appointment created by admin',
    false
);

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
