-- Add guest fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add is_guest field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Create a function to get client name (either from profile or guest fields)
CREATE OR REPLACE FUNCTION get_client_name(appointment_row appointments)
RETURNS TEXT AS $$
DECLARE
    client_name TEXT;
BEGIN
    -- First try to get name from the associated profile
    IF appointment_row.user_id IS NOT NULL THEN
        SELECT full_name INTO client_name
        FROM profiles
        WHERE id = appointment_row.user_id;
    END IF;
    
    -- If no name found and guest_name exists, use that
    IF client_name IS NULL AND appointment_row.guest_name IS NOT NULL THEN
        client_name := appointment_row.guest_name;
    END IF;
    
    -- If still no name, return 'Unknown'
    IF client_name IS NULL THEN
        client_name := 'Unknown';
    END IF;
    
    RETURN client_name;
END;
$$ LANGUAGE plpgsql;
