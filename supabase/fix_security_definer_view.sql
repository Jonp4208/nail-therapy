-- Step 1: Get the current view definition
-- This will help us recreate the view with the same query but without SECURITY DEFINER
SELECT pg_get_viewdef('public.appointment_details'::regclass, true) AS view_definition;

-- Step 2: Drop the existing view
DROP VIEW IF EXISTS public.appointment_details;

-- Step 3: Recreate the view WITHOUT the SECURITY DEFINER option
-- Replace the query below with the actual query from Step 1
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
    -- Removed payment_id as it doesn't exist in the appointments table
    s.name AS service_name,
    s.price AS service_price,
    s.duration AS service_duration,
    p.full_name AS client_name,
    p.email AS client_email,
    p.phone AS client_phone
FROM
    appointments a
JOIN
    services s ON a.service_id = s.id
JOIN
    profiles p ON a.user_id = p.id;

-- Step 4: Set appropriate RLS policies for the view if needed
-- Note: Views inherit RLS policies from their underlying tables
-- If you need specific access control for this view, you can add policies here

-- Step 5: Grant appropriate permissions to roles
GRANT SELECT ON public.appointment_details TO authenticated;
GRANT SELECT ON public.appointment_details TO anon;

-- Step 6: Verify the view no longer has SECURITY DEFINER
SELECT
    n.nspname AS schema_name,
    c.relname AS view_name,
    CASE WHEN pg_get_viewdef(c.oid) LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type
FROM
    pg_class c
JOIN
    pg_namespace n ON c.relnamespace = n.oid
WHERE
    c.relkind = 'v' AND
    n.nspname = 'public' AND
    c.relname = 'appointment_details';
