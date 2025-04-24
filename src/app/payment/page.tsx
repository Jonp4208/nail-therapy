'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StripeProvider from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState(0);

  // Get query parameters
  const serviceId = searchParams.get('serviceId');
  const isDeposit = searchParams.get('isDeposit') === 'true';
  const appointmentId = searchParams.get('appointmentId');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!serviceId || !appointmentId) {
      router.push('/book');
      return;
    }

    const fetchServiceDetails = async () => {
      try {
        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('name, price')
          .eq('id', serviceId)
          .single();

        if (serviceError) {
          throw serviceError;
        }

        if (serviceData) {
          setServiceName(serviceData.name);

          // Calculate amount based on whether it's a deposit or full payment
          const fullAmount = serviceData.price;
          const paymentAmount = isDeposit ? Math.round(fullAmount * 0.25) : fullAmount;
          setAmount(paymentAmount);

          setPaymentStatus('idle');
        } else {
          throw new Error('Service not found');
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setPaymentMessage(err.message);
        setPaymentStatus('error');
      }
    };

    fetchServiceDetails();
  }, [supabase, user, authLoading, router, serviceId, appointmentId, isDeposit]);

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          appointment_id: appointmentId,
          amount: amount,
          status: 'succeeded',
          stripe_payment_id: paymentId,
          is_deposit: isDeposit,
        });

      if (paymentError) {
        throw paymentError;
      }

      // Update the appointment with payment information
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          deposit_paid: isDeposit,
          payment_id: paymentId,
        })
        .eq('id', appointmentId);

      if (appointmentError) {
        throw appointmentError;
      }

      setPaymentStatus('success');
      setPaymentMessage('Payment successful! You will be redirected to your dashboard.');

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setPaymentStatus('error');
      setPaymentMessage(`Payment processed but there was an error updating your appointment: ${err.message}`);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setPaymentMessage(`Payment failed: ${error}`);
  };

  if (authLoading || paymentStatus === 'loading') {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Payment</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Complete your payment to confirm your appointment
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                {isDeposit
                  ? 'Pay a deposit to secure your appointment'
                  : 'Complete your payment for the service'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentStatus === 'idle' && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                    <div className="mt-4 flex justify-between">
                      <p className="text-gray-600">{serviceName}</p>
                      <p className="text-gray-900">${(amount / 100).toFixed(2)}</p>
                    </div>
                    {isDeposit && (
                      <p className="mt-2 text-sm text-gray-500">
                        This is a deposit payment. The remaining balance will be due at the time of your appointment.
                      </p>
                    )}
                  </div>

                  <StripeProvider>
                    <PaymentForm
                      amount={amount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      isDeposit={isDeposit}
                    />
                  </StripeProvider>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Successful</h3>
                  <p className="mt-2 text-sm text-gray-500">{paymentMessage}</p>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Failed</h3>
                  <p className="mt-2 text-sm text-gray-500">{paymentMessage}</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-500"
                  >
                    Try again
                  </button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t px-6 py-4">
              <p className="text-center text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:support@nailsalon.com" className="font-medium text-pink-600 hover:text-pink-500">
                  support@nailsalon.com
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
