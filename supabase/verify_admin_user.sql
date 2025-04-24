-- Check if your user has admin privileges
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

-- If your user is not an admin, run this to make them an admin
UPDATE profiles
SET is_admin = true
WHERE email = 'jonp4208@gmail.com';  -- Replace with your email

-- Verify the update worked
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

-- Test the is_admin function (this will only work if you've run the appointments_rls.sql script)
SELECT is_admin() as current_user_is_admin;
