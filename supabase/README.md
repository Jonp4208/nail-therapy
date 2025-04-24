# Supabase Row Level Security (RLS) Setup

This directory contains SQL files to set up Row Level Security (RLS) policies for your Supabase database tables.

## Fixing the Appointments RLS Issue

The error message "new row violates row-level security policy for table 'appointments'" indicates that your current RLS policies are preventing the insertion of new appointments.

### How to Apply the Fix

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `appointments_rls.sql` file
5. Paste it into the SQL Editor
6. Click "Run" to execute the SQL statements

## What This Fix Does

The SQL script:

1. Enables Row Level Security for the appointments table
2. Drops any existing RLS policies for the appointments table to avoid conflicts
3. Creates new policies that allow:
   - Regular users to view, insert, update, and delete their own appointments
   - Admin users to view, insert, update, and delete any appointment

## Testing the Fix

After applying the fix, you should be able to:

1. Create appointments as an admin user for any client
2. Create appointments as a regular user for yourself
3. View appointments based on your user role (admin sees all, regular users see only their own)

## Troubleshooting

If you continue to experience issues after applying these policies, check:

1. That your user has the correct `is_admin` value in the profiles table
2. That you're properly authenticated when making the request
3. That the user_id in the appointment matches the authenticated user's ID (for non-admin users)

## Additional Notes

- The admin policies check for both boolean `true` and string `'true'` values for the `is_admin` field to handle different data types
- These policies assume your profiles table has an `is_admin` field that identifies admin users
