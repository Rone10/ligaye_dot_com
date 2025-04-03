'use server'

import { approveCashPayment, rejectCashPayment } from './_queries'
import { revalidatePath } from 'next/cache'

// Server action to approve a cash payment
export async function handleApproveCashPayment(formData: FormData) {
  try {
    // Get payment ID from form data
    const paymentId = formData.get('paymentId') as string
    
    if (!paymentId) {
      return { error: 'Payment ID is required' }
    }
    
    // Approve the payment
    const result = await approveCashPayment(paymentId)
    
    if (result.error) {
      return { error: result.error }
    }
    
    // Revalidate the payments page
    revalidatePath('/admin/payments')
    
    return { success: true, message: 'Payment approved successfully' }
  } catch (error) {
    console.error('Error approving payment:', error)
    return { error: 'Failed to approve payment' }
  }
}

// Server action to reject a cash payment
export async function handleRejectCashPayment(formData: FormData) {
  try {
    // Get payment ID from form data
    const paymentId = formData.get('paymentId') as string
    
    if (!paymentId) {
      return { error: 'Payment ID is required' }
    }
    
    // Reject the payment
    const result = await rejectCashPayment(paymentId)
    
    if (result.error) {
      return { error: result.error }
    }
    
    // Revalidate the payments page
    revalidatePath('/admin/payments')
    
    return { success: true, message: 'Payment rejected successfully' }
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return { error: 'Failed to reject payment' }
  }
} 