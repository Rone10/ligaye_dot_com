import Stripe from 'stripe';

// Improved environment variable checks
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: Missing STRIPE_SECRET_KEY environment variable');
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.warn('WARNING: Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

// Log that Stripe is being initialized (without revealing keys)
console.log('Initializing Stripe client with API version: 2025-03-31.basil');

// Create a Stripe client instance with the API version specified
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
  appInfo: {
    name: 'Ligaye Job Board',
    version: '1.0.0',
  },
});

export default stripe; 