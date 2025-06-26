'use server'

import { db } from '@/lib/db'
import { coupons, couponRedemptions, profiles, payments, jobs } from '@/lib/db/schema'
import { eq, and, desc, sql, gte, lte, or, isNull } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getUser } from '@/lib/supabase/server'
import type { Coupon } from '@/lib/db/schema'

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  coupon: (id: string) => `coupon-${id}`,
  couponCollection: 'coupons-collection',
  adminCouponData: 'admin-coupon-data',
  couponStats: 'coupon-stats',
  couponRedemptions: 'coupon-redemptions'
};

// Helper function to check if user is admin (outside cache scope)
async function checkAdminAccess(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  
  if (user.user_metadata.role === 'admin') {
    return true
  }
  
  // Fallback check in database
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  return adminProfile?.role === 'admin'
}

// Internal function for coupons with stats without caching (no auth check inside)
async function getCouponsWithStatsInternal() {
  try {
    const couponsData = await db()
      .select({
        coupon: coupons,
        redemptionCount: sql<number>`count(distinct ${couponRedemptions.id})`.mapWith(Number),
        totalDiscountGiven: sql<number>`coalesce(sum(${couponRedemptions.discountAmount}), 0)`.mapWith(Number)
      })
      .from(coupons)
      .leftJoin(couponRedemptions, and(
        eq(couponRedemptions.couponId, coupons.id),
        eq(couponRedemptions.deleted, false)
      ))
      .where(eq(coupons.deleted, false))
      .groupBy(coupons.id)
      .orderBy(desc(coupons.createdAt))
    
    return { coupons: couponsData }
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return { error: 'Failed to fetch coupons' }
  }
}

// Internal function for coupon details without caching (no auth check inside)
async function getCouponDetailsInternal(couponId: string) {
  try {
    // Wave 1: Parallel data fetching - get coupon and redemptions simultaneously
    const [couponData, redemptions] = await Promise.all([
      db()
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.id, couponId),
          eq(coupons.deleted, false)
        ))
        .limit(1)
        .then(res => res[0]),
      
      db()
        .select({
          redemption: couponRedemptions,
          userFullName: profiles.fullName,
          jobTitle: jobs.title,
          paymentAmount: payments.amount,
          paymentStatus: payments.status
        })
        .from(couponRedemptions)
        .innerJoin(profiles, eq(profiles.id, couponRedemptions.userId))
        .leftJoin(jobs, eq(jobs.id, couponRedemptions.jobId))
        .leftJoin(payments, eq(payments.id, couponRedemptions.paymentId))
        .where(and(
          eq(couponRedemptions.couponId, couponId),
          eq(couponRedemptions.deleted, false)
        ))
        .orderBy(desc(couponRedemptions.redeemedAt))
    ])
    
    if (!couponData) {
      return { error: 'Coupon not found' }
    }
    
    // Calculate stats
    const stats = {
      totalRedemptions: redemptions.length,
      totalDiscountGiven: redemptions.reduce((sum, r) => sum + r.redemption.discountAmount, 0),
      averageDiscount: redemptions.length > 0 
        ? redemptions.reduce((sum, r) => sum + r.redemption.discountAmount, 0) / redemptions.length 
        : 0
    }
    
    return { 
      coupon: couponData, 
      redemptions,
      stats 
    }
  } catch (error) {
    console.error('Error fetching coupon details:', error)
    return { error: 'Failed to fetch coupon details' }
  }
}

// Public functions with auth checks outside cache scope
export const getCouponsWithStats = async () => {
  // Auth check outside cache scope
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Cache the data fetching (without auth logic)
  const cachedFunction = unstable_cache(
    async () => getCouponsWithStatsInternal(),
    ['admin-coupons-with-stats'],
    {
      tags: [CACHE_TAGS.couponCollection, CACHE_TAGS.adminCouponData, CACHE_TAGS.couponStats]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

export const getCouponDetails = async (couponId: string) => {
  // Auth check outside cache scope
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Cache the data fetching (without auth logic)
  const cachedFunction = unstable_cache(
    async () => getCouponDetailsInternal(couponId),
    [`coupon-details-${couponId}`],
    {
      tags: [CACHE_TAGS.coupon(couponId), CACHE_TAGS.couponRedemptions, CACHE_TAGS.adminCouponData]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

// Request-level cache for repeated calls within same request
export const getCouponsWithStatsCached = cache(getCouponsWithStats)
export const getCouponDetailsCached = cache(getCouponDetails)

// Create a new coupon
export async function createCoupon(data: {
  code: string
  description: string | null
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE'
  discountValue: number
  maxUses: number | null
  maxUsesPerUser: number | null
  validFrom: Date
  validUntil: Date | null
  applicableTo: 'JOB_POSTING' | 'TENDER' | 'ALL'
  minPurchaseAmount: number | null
}) {
  // Verify user is admin (outside any cache scope)
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }
  
  try {
    // Check if code already exists
    const existing = await db()
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, data.code.toUpperCase()))
      .limit(1)
      .then(res => res[0])
    
    if (existing) {
      return { success: false, error: 'A coupon with this code already exists' }
    }
    
    // Create the coupon
    const [newCoupon] = await db()
      .insert(coupons)
      .values({
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser || 1,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        applicableTo: data.applicableTo,
        minPurchaseAmount: data.minPurchaseAmount,
        isActive: true,
        usedCount: 0,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()
    
    // ON-DEMAND cache invalidation
    await invalidateCouponCache()
    
    return { success: true, coupon: newCoupon }
  } catch (error) {
    console.error('Error creating coupon:', error)
    return { success: false, error: 'Failed to create coupon' }
  }
}

// Update coupon
export async function updateCoupon(
  couponId: string,
  data: Partial<{
    description: string | null
    maxUses: number | null
    maxUsesPerUser: number | null
    validUntil: Date | null
    minPurchaseAmount: number | null
    isActive: boolean
  }>
) {
  // Verify user is admin (outside any cache scope)
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }
  
  try {
    await db()
      .update(coupons)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, couponId))
    
    // ON-DEMAND cache invalidation
    await invalidateCouponCache(couponId)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating coupon:', error)
    return { error: 'Failed to update coupon' }
  }
}

// Delete (soft) a coupon
export async function deleteCoupon(couponId: string) {
  // Verify user is admin (outside any cache scope)
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }
  
  try {
    await db()
      .update(coupons)
      .set({
        deleted: true,
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, couponId))
    
    // ON-DEMAND cache invalidation
    await invalidateCouponCache(couponId)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return { error: 'Failed to delete coupon' }
  }
}

// Cache invalidation helpers - call these when data changes
export async function invalidateCouponCache(couponId?: string) {
  const { revalidateTag } = await import('next/cache')
  
  const tags = [
    CACHE_TAGS.couponCollection,
    CACHE_TAGS.adminCouponData,
    CACHE_TAGS.couponStats
  ]
  
  if (couponId) {
    tags.push(CACHE_TAGS.coupon(couponId))
  }
  
  await Promise.all(tags.map(tag => revalidateTag(tag)))
}

export async function invalidateCouponRedemptionCache(couponId: string) {
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.coupon(couponId)),
    revalidateTag(CACHE_TAGS.couponRedemptions),
    revalidateTag(CACHE_TAGS.couponStats),
    revalidateTag(CACHE_TAGS.couponCollection),
    revalidateTag(CACHE_TAGS.adminCouponData)
  ])
}