import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendAppointmentUpdateEmail,
  AppointmentEmailData
} from '@/lib/email';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request data
    const {
      emailType,
      appointmentId,
      updateType
    } = await request.json();

    if (!emailType || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch appointment data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        services (
          id,
          name,
          service_categories (
            id,
            name
          )
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to send email for this appointment
    const isAdmin = session.user.id === appointment.user_id || await checkIsAdmin(supabase, session.user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to send email for this appointment' },
        { status: 403 }
      );
    }

    // Prepare email data
    const emailData: AppointmentEmailData = {
      customerName: appointment.profiles.full_name,
      customerEmail: appointment.profiles.email,
      serviceName: appointment.services.name,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      appointmentId: appointment.id,
    };

    // Send appropriate email based on type
    let result;

    switch (emailType) {
      case 'confirmation':
        result = await sendAppointmentConfirmationEmail(emailData);
        break;
      case 'reminder':
        result = await sendAppointmentReminderEmail(emailData);
        break;
      case 'update':
        if (!updateType) {
          return NextResponse.json(
            { error: 'Update type is required for update emails' },
            { status: 400 }
          );
        }
        result = await sendAppointmentUpdateEmail(emailData, updateType);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result.data
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if user is an admin
async function checkIsAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return !!data.is_admin;
}
