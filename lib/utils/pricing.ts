import { db } from '@/lib/db';
import { pricingConfig } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// Cache tags for pricing data
export const PRICING_CACHE_TAG = 'pricing-config';

// Get the current active pricing configuration
export const getActivePricing = unstable_cache(
  async () => {
    const database = await db();
    const configs = await database
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.active, true))
      .orderBy(desc(pricingConfig.createdAt))
      .limit(1);
    
    return configs[0] || null;
  },
  ['active-pricing'],
  {
    tags: [PRICING_CACHE_TAG],
    revalidate: 3600, // Cache for 1 hour
  }
);

// Get pricing configuration by ID
export const getPricingById = async (id: string) => {
  const database = await db();
  const configs = await database
    .select()
    .from(pricingConfig)
    .where(eq(pricingConfig.id, id))
    .limit(1);
  
  return configs[0] || null;
};

// Get all pricing configurations (for history)
export const getAllPricingConfigs = async () => {
  const database = await db();
  return await database
    .select()
    .from(pricingConfig)
    .orderBy(desc(pricingConfig.createdAt));
};

// Re-export client-safe functions from pricing-client
export { 
  formatPrice, 
  dalasiToBututs, 
  bututsToDalasi, 
  calculateTotalPrice, 
  validatePrice,
  getDefaultPricing 
} from './pricing-client';