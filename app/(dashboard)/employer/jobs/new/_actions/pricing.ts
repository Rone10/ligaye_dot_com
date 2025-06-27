'use server'

import { getActivePricing as getActivePricingFromUtils } from '@/lib/utils/pricing'
import { getDefaultPricing } from '@/lib/utils/pricing-client'
import type { PricingConfig } from '@/lib/db/schema'

export async function fetchActivePricing(): Promise<PricingConfig | null> {
  try {
    const pricing = await getActivePricingFromUtils()
    return pricing
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return null
  }
}