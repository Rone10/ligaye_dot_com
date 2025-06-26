'use server'

import { revalidatePath } from 'next/cache'
import { 
  createCoupon as createCouponQuery,
  updateCoupon as updateCouponQuery,
  deleteCoupon as deleteCouponQuery
} from './_queries'

export async function createCoupon(formData: FormData) {
  console.log('[Server Action] createCoupon called')
  try {
    const code = formData.get('code') as string
    const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FIXED' | 'FREE'
    const discountValueStr = formData.get('discountValue') as string
    
    console.log('[Server Action] Received data:', { code, discountType, discountValueStr })
    
    // Basic validation
    if (!code || !code.trim()) {
      return { error: 'Coupon code is required', success: false }
    }
    
    if (!discountType) {
      return { error: 'Discount type is required', success: false }
    }
    
    let discountValue = 0
    if (discountType !== 'FREE') {
      if (!discountValueStr || isNaN(parseFloat(discountValueStr))) {
        return { error: 'Discount value is required and must be a number', success: false }
      }
      discountValue = parseFloat(discountValueStr)
    } else {
      discountValue = 100 // 100% for FREE type
    }
    
    const data = {
      code: code.trim().toUpperCase(),
      description: formData.get('description') as string || null,
      discountType,
      discountValue,
      maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null,
      maxUsesPerUser: formData.get('maxUsesPerUser') ? parseInt(formData.get('maxUsesPerUser') as string) : null,
      validFrom: new Date(formData.get('validFrom') as string),
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
      applicableTo: formData.get('applicableTo') as 'JOB_POSTING' | 'TENDER' | 'ALL',
      minPurchaseAmount: formData.get('minPurchaseAmount') ? parseFloat(formData.get('minPurchaseAmount') as string) * 100 : null,
    }
    
    // Convert percentage to decimal if needed
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 1) {
      data.discountValue = data.discountValue
    }
    
    // Convert fixed amount to cents
    if (data.discountType === 'FIXED') {
      data.discountValue = data.discountValue * 100
    }
    
    console.log('[Server Action] Calling createCouponQuery with data:', data)
    const result = await createCouponQuery(data)
    console.log('[Server Action] createCouponQuery result:', result)
    
    if (result.success) {
      // Try to revalidate but don't let it fail the whole operation
      try {
        revalidatePath('/admin/coupons')
      } catch (revalidateError) {
        console.error('Error revalidating path:', revalidateError)
        // Continue anyway - the coupon was created successfully
      }
      console.log('[Server Action] Returning success')
      return { success: true, error: null }
    }
    
    console.log('[Server Action] Returning error:', result.error)
    return { success: false, error: result.error || 'Failed to create couponssssssssss' }
  } catch (error) {
    console.error('[Server Action] Caught error:', error)
    return { success: false, error: 'Failed to create couponssssssssss222222' }
  }
}

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
  try {
    const result = await updateCouponQuery(couponId, data)
    
    if (result.success) {
      revalidatePath('/admin/coupons')
      revalidatePath(`/admin/coupons/${couponId}`)
      return { success: true }
    }
    
    return { error: result.error || 'Failed to update coupon' }
  } catch (error) {
    console.error('Error updating coupon:', error)
    return { error: 'Failed to update coupon' }
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    const result = await deleteCouponQuery(couponId)
    
    if (result.success) {
      revalidatePath('/admin/coupons')
      return { success: true }
    }
    
    return { error: result.error || 'Failed to delete coupon' }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return { error: 'Failed to delete coupon' }
  }
}

export async function editCoupon(couponId: string, formData: FormData) {
  console.log('[Server Action] editCoupon called')
  try {
    const data: any = {
      description: formData.get('description') as string || null,
      maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null,
      maxUsesPerUser: formData.get('maxUsesPerUser') ? parseInt(formData.get('maxUsesPerUser') as string) : null,
      validFrom: new Date(formData.get('validFrom') as string),
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
      minPurchaseAmount: formData.get('minPurchaseAmount') ? parseFloat(formData.get('minPurchaseAmount') as string) * 100 : null,
    }
    
    const result = await updateCouponQuery(couponId, data)
    
    if (result.success) {
      try {
        revalidatePath('/admin/coupons')
        revalidatePath(`/admin/coupons/${couponId}`)
      } catch (revalidateError) {
        console.error('Error revalidating path:', revalidateError)
      }
      return { success: true, error: null }
    }
    
    return { success: false, error: result.error || 'Failed to update coupon' }
  } catch (error) {
    console.error('[Server Action] Caught error:', error)
    return { success: false, error: 'Failed to update coupon' }
  }
}