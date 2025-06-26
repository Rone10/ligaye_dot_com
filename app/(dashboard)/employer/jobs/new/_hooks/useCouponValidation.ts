'use client'

import { useState, useCallback } from 'react'
import { validateCoupon as validateCouponAction } from '../_actions'

// Define the type locally to avoid importing from server file
interface CouponValidationResult {
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

export function useCouponValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null)

  const validateCoupon = useCallback(async (couponCode: string, originalAmount: number) => {
    if (!couponCode.trim()) {
      setValidationResult(null)
      return null
    }

    setIsValidating(true)
    try {
      const result = await validateCouponAction(couponCode.trim(), originalAmount)
      setValidationResult(result)
      return result
    } catch (error) {
      console.error('Error validating coupon:', error)
      const errorResult: CouponValidationResult = {
        valid: false,
        error: 'Failed to validate coupon'
      }
      setValidationResult(errorResult)
      return errorResult
    } finally {
      setIsValidating(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    isValidating,
    validationResult,
    validateCoupon,
    clearValidation
  }
}