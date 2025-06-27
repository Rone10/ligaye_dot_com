'use server'

import { db } from '@/lib/db';
import { pricingConfig } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cache } from 'react';

export const getActivePricing = cache(async () => {
  const database = await db();
  const configs = await database
    .select()
    .from(pricingConfig)
    .where(eq(pricingConfig.active, true))
    .orderBy(desc(pricingConfig.createdAt))
    .limit(1);
  
  return configs[0] || null;
});

export const getAllPricingHistory = cache(async () => {
  const database = await db();
  return await database
    .select()
    .from(pricingConfig)
    .orderBy(desc(pricingConfig.createdAt));
});