import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of a component's render to avoid recreating the Stripe object on every render
export const getStripe = async () => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  
  const stripePromise = loadStripe(stripePublishableKey);
  return stripePromise;
};
