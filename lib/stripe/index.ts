import Stripe from 'stripe';

// Ensure the Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Create a Stripe client instance with the API version specified
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
  appInfo: {
    name: 'Ligaye Job Board',
    version: '1.0.0',
  },
});

export default stripe; 