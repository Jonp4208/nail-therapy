import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  sendAppointmentConfirmationSms,
  sendAppointmentReminderSms,
  sendAppointmentUpdateSms,
  AppointmentSmsData
} from '@/lib/sms';

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
      smsType,
      appointmentId,
      updateType
    } = await request.json();

    if (!smsType || !appointmentId) {
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
          phone
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

    // Check if user has permission to send SMS for this appointment
    const isAdmin = session.user.id === appointment.user_id || await checkIsAdmin(supabase, session.user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to send SMS for this appointment' },
        { status: 403 }
      );
    }

    // Check if customer has a phone number
    if (!appointment.profiles.phone) {
      return NextResponse.json(
        { error: 'Customer does not have a phone number' },
        { status: 400 }
      );
    }

    // Prepare SMS data
    const smsData: AppointmentSmsData = {
      customerName: appointment.profiles.full_name,
      customerPhone: appointment.profiles.phone,
      serviceName: appointment.services.name,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      appointmentId: appointment.id,
    };

    // Send appropriate SMS based on type
    let result;

    switch (smsType) {
      case 'confirmation':
        result = await sendAppointmentConfirmationSms(smsData);
        break;
      case 'reminder':
        result = await sendAppointmentReminderSms(smsData);
        break;
      case 'update':
        if (!updateType) {
          return NextResponse.json(
            { error: 'Update type is required for update SMS' },
            { status: 400 }
          );
        }
        result = await sendAppointmentUpdateSms(smsData, updateType);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      data: result.data
    });
  } catch (error: any) {
    console.error('Error sending SMS:', error);
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
