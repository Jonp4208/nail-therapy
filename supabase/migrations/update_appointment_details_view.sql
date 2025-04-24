-- Drop the existing view
DROP VIEW IF EXISTS public.appointment_details;

-- Recreate the view with guest information
CREATE VIEW public.appointment_details AS
SELECT 
    a.id,
    a.created_at,
    a.user_id,
    a.service_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    a.deposit_paid,
    a.guest_name,
    a.guest_email,
    a.guest_phone,
    s.name AS service_name,
    s.price AS service_price,
    s.duration AS service_duration,
    COALESCE(p.full_name, a.guest_name) AS client_name,
    COALESCE(p.email, a.guest_email) AS client_email,
    COALESCE(p.phone, a.guest_phone) AS client_phone
FROM 
    appointments a
LEFT JOIN 
    services s ON a.service_id = s.id
LEFT JOIN 
    profiles p ON a.user_id = p.id;

-- Grant appropriate permissions
GRANT SELECT ON public.appointment_details TO authenticated;
GRANT SELECT ON public.appointment_details TO anon;
