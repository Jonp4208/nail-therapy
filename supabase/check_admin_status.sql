-- Check current admin users
SELECT id, email, full_name, is_admin, typeof(is_admin) as admin_type
FROM profiles
WHERE is_admin = true OR is_admin = 'true';

-- Check if the is_admin column exists and its data type
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_admin';

-- Fix admin status for a specific user (replace the email with your admin user's email)
UPDATE profiles
SET is_admin = true
WHERE email = 'your-admin-email@example.com';

-- Verify the update worked
SELECT id, email, full_name, is_admin
FROM profiles
WHERE email = 'your-admin-email@example.com';
