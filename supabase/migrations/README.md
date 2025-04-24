# Database Migrations for Guest Appointment Booking

This directory contains SQL migration scripts to fix the issue where non-authenticated users' appointment information is not being correctly displayed in the admin panel.

## The Problem

When a non-authenticated user (guest) books an appointment by entering their name and email, the admin panel shows a different client's information instead of the person who actually booked the appointment.

## The Solution

These migration scripts:

1. Add guest information fields to the appointments table
2. Add an is_guest flag to the profiles table
3. Update the appointment_details view to properly display guest information
4. Create a helper function to get the correct client name

## How to Apply These Migrations

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the scripts in the following order:
   - `add_guest_fields_to_appointments.sql`
   - `update_appointment_details_view.sql`

## What These Changes Do

1. **add_guest_fields_to_appointments.sql**:
   - Adds guest_name, guest_email, and guest_phone columns to the appointments table
   - Adds is_guest column to the profiles table
   - Creates a get_client_name function to retrieve the correct client name

2. **update_appointment_details_view.sql**:
   - Updates the appointment_details view to include guest information
   - Uses COALESCE to prioritize profile information but fall back to guest information

After applying these migrations, the booking system will:
1. Create a profile for non-authenticated users
2. Store their information directly in the appointments table as a backup
3. Display the correct client information in the admin panel
