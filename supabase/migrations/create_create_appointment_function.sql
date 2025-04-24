-- Create a function that can bypass RLS to create appointments
CREATE OR REPLACE FUNCTION create_appointment(
  p_service_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_status TEXT,
  p_notes TEXT,
  p_deposit_paid BOOLEAN,
  p_guest_name TEXT,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  v_appointment_id UUID;
  v_result JSON;
BEGIN
  -- Insert the appointment
  INSERT INTO appointments (
    service_id,
    appointment_date,
    appointment_time,
    status,
    notes,
    deposit_paid,
    guest_name,
    guest_email,
    guest_phone,
    user_id
  ) VALUES (
    p_service_id,
    p_appointment_date,
    p_appointment_time,
    p_status,
    p_notes,
    p_deposit_paid,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_user_id
  )
  RETURNING id INTO v_appointment_id;
  
  -- Get the created appointment
  SELECT json_build_object(
    'id', a.id,
    'service_id', a.service_id,
    'appointment_date', a.appointment_date,
    'appointment_time', a.appointment_time,
    'status', a.status,
    'notes', a.notes,
    'deposit_paid', a.deposit_paid,
    'guest_name', a.guest_name,
    'guest_email', a.guest_email,
    'guest_phone', a.guest_phone,
    'user_id', a.user_id,
    'created_at', a.created_at
  )
  INTO v_result
  FROM appointments a
  WHERE a.id = v_appointment_id;
  
  RETURN v_result;
END;
$$;
