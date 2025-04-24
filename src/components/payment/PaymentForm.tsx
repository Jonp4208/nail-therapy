'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { useSupabaseContext } from '@/context/SupabaseProvider';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  isDeposit?: boolean;
  appointmentId?: string;
  serviceId?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  isDeposit = false,
  appointmentId,
  serviceId
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { supabase } = useSupabaseContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Call API to create a payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          isDeposit,
          serviceId,
          appointmentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // For demo purposes, if we don't have a real client secret, use a mock
      if (!clientSecret || clientSecret === 'mock_client_secret') {
        // Mock successful payment for demo purposes
        setTimeout(() => {
          onSuccess('mock_payment_id');
          setIsProcessing(false);
        }, 2000);
        return;
      }

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'An error occurred with your payment');
        onError(result.error.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        onSuccess(result.paymentIntent.id);
      }
    } catch (error) {
      setErrorMessage('An error occurred while processing your payment');
      onError('Payment processing error');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">
          {isDeposit ? 'Deposit Amount:' : 'Total Amount:'} ${(amount / 100).toFixed(2)}
        </div>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay ${isDeposit ? 'Deposit' : 'Now'}`}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
