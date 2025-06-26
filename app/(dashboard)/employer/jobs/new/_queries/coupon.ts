'use server'

import { db } from '@/lib/db'
import { coupons, couponRedemptions, profiles } from '@/lib/db/schema'
import { eq, and, or, gte, lte, isNull, sql } from 'drizzle-orm'
import { getUser } from '@/lib/supabase/server'

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon?: {
    id: string
    code: string
    discountType: 'PERCENTAGE' | 'FIXED' | 'FREE'
    discountValue: number
    description?: string | null
  }
  discountAmount?: number
  finalAmount?: number
}

/**
 * Validates a coupon code for job posting
 */
export async function validateCouponForJobPosting(
  couponCode: string, 
  originalAmount: number
): Promise<CouponValidationResult> {
  try {
    // Get current user
    const user = await getUser()
    if (!user) {
      return { valid: false, error: 'You must be logged in to use a coupon' }
    }

    // Get user profile
    const userProfile = await db()
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])

    if (!userProfile) {
      return { valid: false, error: 'User profile not found' }
    }

    // Find the coupon
    const coupon = await db()
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.code, couponCode.toUpperCase()),
        eq(coupons.isActive, true),
        eq(coupons.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' }
    }

    // Check if coupon is valid for job postings
    if (coupon.applicableTo !== 'JOB_POSTING' && coupon.applicableTo !== 'ALL') {
      return { valid: false, error: 'This coupon is not valid for job postings' }
    }

    // Check validity dates
    const now = new Date()
    if (coupon.validFrom > now) {
      return { valid: false, error: 'This coupon is not yet active' }
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return { valid: false, error: 'This coupon has expired' }
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: 'This coupon has reached its usage limit' }
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && originalAmount < coupon.minPurchaseAmount) {
      const minAmount = (coupon.minPurchaseAmount / 100).toFixed(2)
      return { 
        valid: false, 
        error: `Minimum purchase amount of $${minAmount} required for this coupon` 
      }
    }

    // Check per-user usage limit
    if (coupon.maxUsesPerUser) {
      const userRedemptions = await db()
        .select({ count: sql<number>`count(*)` })
        .from(couponRedemptions)
        .where(and(
          eq(couponRedemptions.couponId, coupon.id),
          eq(couponRedemptions.userId, userProfile.id),
          eq(couponRedemptions.deleted, false)
        ))
        .then(res => res[0]?.count || 0)

      if (userRedemptions >= coupon.maxUsesPerUser) {
        return { 
          valid: false, 
          error: `You have already used this coupon ${userRedemptions} time${userRedemptions > 1 ? 's' : ''}` 
        }
      }
    }

    // Calculate discount
    let discountAmount = 0
    let finalAmount = originalAmount

    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = Math.floor(originalAmount * (coupon.discountValue / 100))
        finalAmount = originalAmount - discountAmount
        break
      case 'FIXED':
        discountAmount = Math.min(coupon.discountValue * 100, originalAmount) // Convert to cents
        finalAmount = originalAmount - discountAmount
        break
      case 'FREE':
        discountAmount = originalAmount
        finalAmount = 0
        break
    }

    // Ensure final amount is not negative
    finalAmount = Math.max(0, finalAmount)

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description
      },
      discountAmount,
      finalAmount
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return { valid: false, error: 'Failed to validate coupon' }
  }
}

/**
 * Records a coupon redemption
 */
export async function recordCouponRedemption(
  couponId: string,
  userId: string,
  paymentId: string,
  jobId: string,
  originalAmount: number,
  discountAmount: number,
  finalAmount: number
) {
  try {
    await db().insert(couponRedemptions).values({
      couponId,
      userId,
      paymentId,
      jobId,
      originalAmount,
      discountAmount,
      finalAmount,
      redeemedAt: new Date(),
      deleted: false
    })

    return { success: true }
  } catch (error) {
    console.error('Error recording coupon redemption:', error)
    return { success: false, error: 'Failed to record coupon redemption' }
  }
}