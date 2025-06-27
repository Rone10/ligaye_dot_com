'use server';

import { db } from '@/lib/db';
import { pricingConfig, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';
import { PRICING_CACHE_TAG } from '@/lib/utils/pricing';
import { validatePrice } from '@/lib/utils/pricing-client';

export async function updatePricing(priceInDalasi: number) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Convert dalasi to bututs
    const priceInBututs = Math.round(priceInDalasi * 100);
    
    // Validate the price
    const validation = validatePrice(priceInBututs);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const database = await db();
    
    // Get the profile ID for the authenticated user
    const profile = await database
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    
    if (!profile[0]) {
      return { success: false, error: 'Profile not found' };
    }
    
    // Start a transaction to deactivate old pricing and create new one
    await database.transaction(async (tx) => {
      // Deactivate all current active pricing configs
      await tx
        .update(pricingConfig)
        .set({ active: false })
        .where(eq(pricingConfig.active, true));
      
      // Create new pricing config
      await tx.insert(pricingConfig).values({
        pricePerMonth: priceInBututs,
        currency: 'GMD',
        active: true,
        createdBy: profile[0].id, // Use the profile ID, not the auth user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Revalidate pricing cache
    revalidateTag(PRICING_CACHE_TAG);
    revalidateTag('admin-pricing');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating pricing:', error);
    return { success: false, error: 'Failed to update pricing' };
  }
}

export async function deactivatePricing(pricingId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const database = await db();
    
    await database
      .update(pricingConfig)
      .set({ 
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(pricingConfig.id, pricingId));

    // Revalidate pricing cache
    revalidateTag(PRICING_CACHE_TAG);
    revalidateTag('admin-pricing');
    
    return { success: true };
  } catch (error) {
    console.error('Error deactivating pricing:', error);
    return { success: false, error: 'Failed to deactivate pricing' };
  }
}