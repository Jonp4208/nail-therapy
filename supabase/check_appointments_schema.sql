-- Check the schema of the appointments table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'appointments'
ORDER BY 
    ordinal_position;

-- Check the current definition of the appointment_details view
SELECT 
    pg_get_viewdef('public.appointment_details'::regclass, true) AS view_definition;
