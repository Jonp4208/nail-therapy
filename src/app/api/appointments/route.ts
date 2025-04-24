import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create a new appointment
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    // Get request data
    const {
      serviceId,
      date,
      time,
      notes,
      depositPaid,
      firstName,
      lastName,
      email,
      phone
    } = await request.json();

    // Validate required fields
    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the appointment using the admin client (bypasses RLS)
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        user_id: session ? session.user.id : null,
        service_id: serviceId,
        appointment_date: date,
        appointment_time: time,
        status: 'pending',
        notes: notes || '',
        deposit_paid: depositPaid || false,
        guest_name: !session ? `${firstName} ${lastName}` : null,
        guest_email: !session ? email : null,
        guest_phone: !session ? phone : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch service details for the email
    const { data: serviceData } = await supabaseAdmin
      .from('services')
      .select('name, price, duration')
      .eq('id', serviceId)
      .single();

    // Send confirmation email
    try {
      const recipientEmail = session ? session.user.email : email;
      const clientName = session ?
        (session.user.user_metadata?.full_name || session.user.email) :
        `${firstName} ${lastName}`;

      if (recipientEmail) {
        // Call our email API
        const emailResponse = await fetch(new URL('/api/send-email', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject: 'Your Appointment Confirmation - Nail Therapy by Agustina',
            appointmentDetails: {
              serviceName: serviceData?.name || 'Nail Service',
              servicePrice: serviceData?.price || 0,
              appointmentDate: date,
              appointmentTime: time,
              clientName: clientName,
              notes: notes || ''
            }
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email:', await emailResponse.text());
        }
      }
    } catch (emailError) {
      // Log the error but don't fail the appointment creation
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all appointments for the current user
export async function GET(request: Request) {
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

    // In a real app, you would:
    // 1. Fetch the user's appointments from the database
    // 2. Return them to the frontend

    // Mock response
    return NextResponse.json({
      appointments: [
        {
          id: '1',
          userId: session.user.id,
          serviceId: '2',
          serviceName: 'Gel Manicure',
          appointmentDate: '2023-05-15',
          appointmentTime: '10:00',
          notes: null,
          status: 'confirmed',
          depositPaid: true,
          paymentId: 'mock_payment_id',
        },
        {
          id: '2',
          userId: session.user.id,
          serviceId: '5',
          serviceName: 'Eyebrow Shaping',
          appointmentDate: '2023-05-22',
          appointmentTime: '14:30',
          notes: 'First time client',
          status: 'pending',
          depositPaid: false,
          paymentId: null,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
