import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
// import Stripe from 'stripe';

// In a production app, you would initialize Stripe with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2023-10-16',
// });

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

    const { serviceId, isDeposit, amount, appointmentId } = await request.json();

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    let paymentAmount = amount;

    // If amount is not provided, fetch the service price from the database
    if (!paymentAmount) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('price')
        .eq('id', serviceId)
        .single();

      if (serviceError) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // Calculate amount based on whether it's a deposit or full payment
      paymentAmount = isDeposit ? Math.round(service.price * 0.25) : service.price;
    }

    // In a production app, you would create a payment intent with Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: paymentAmount,
    //   currency: 'usd',
    //   metadata: {
    //     user_id: session.user.id,
    //     service_id: serviceId,
    //     appointment_id: appointmentId || '',
    //     is_deposit: isDeposit ? 'true' : 'false',
    //   },
    // });

    // return NextResponse.json({
    //   clientSecret: paymentIntent.client_secret,
    //   amount: paymentAmount,
    //   isDeposit: isDeposit,
    // });

    // Mock response for demo purposes
    return NextResponse.json({
      clientSecret: 'mock_client_secret',
      amount: paymentAmount,
      isDeposit: isDeposit,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
