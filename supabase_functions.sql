-- Create the get_all_profiles function
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated;
