'use server'

import { db } from '@/lib/db'
import { coupons, couponRedemptions, profiles, payments, jobs } from '@/lib/db/schema'
import { eq, and, desc, sql, gte, lte, or, isNull } from 'drizzle-orm'
import { getUser } from '@/lib/supabase/server'
import type { Coupon } from '@/lib/db/schema'

// Get all coupons with usage stats
export async function getCouponsWithStats() {
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' }
  }
  
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

// Get single coupon with detailed stats
export async function getCouponDetails(couponId: string) {
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' }
  }
  
  try {
    // Get coupon details
    const couponData = await db()
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.id, couponId),
        eq(coupons.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!couponData) {
      return { error: 'Coupon not found' }
    }
    
    // Get redemption history
    const redemptions = await db()
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
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  if (!adminProfile || adminProfile.role !== 'admin') {
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
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  if (!adminProfile || adminProfile.role !== 'admin') {
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
    
    return { success: true }
  } catch (error) {
    console.error('Error updating coupon:', error)
    return { error: 'Failed to update coupon' }
  }
}

// Delete (soft) a coupon
export async function deleteCoupon(couponId: string) {
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  if (!adminProfile || adminProfile.role !== 'admin') {
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
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return { error: 'Failed to delete coupon' }
  }
}