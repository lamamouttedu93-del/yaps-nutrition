import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/customSupabaseClient';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const redirectToCheckout = async (planId, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: { planId, userId },
    });

    if (error) {
      throw new Error(`Error invoking function: ${error.message}`);
    }

    if (data.error) {
      throw new Error(`Error from function: ${data.error}`);
    }

    const { sessionId } = data;
    if (!sessionId) {
      throw new Error('Could not retrieve a checkout session.');
    }

    const stripe = await getStripe();
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

    if (stripeError) {
      throw new Error(`Stripe error: ${stripeError.message}`);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};