'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import useJobForm from '../_hooks/useJobForm'
import { createJobPosting } from '../_actions'
import BasicDetailsStep from './form-steps/BasicDetailsStep'
import RequirementsStep from './form-steps/RequirementsStep'
import CompensationStep from './form-steps/CompensationStep'
import PostingSettingsStep from './form-steps/PostingSettingsStep'

interface NewJobFormProps {}

export default function NewJobForm() {
  const router = useRouter()
  const { form, step, totalSteps, nextStep, prevStep, isSubmitting, setIsSubmitting } = useJobForm()
  const [error, setError] = useState<string | null>(null)
  const [stripeUrl, setStripeUrl] = useState<string | null>(null)
  const stripeFormRef = useRef<HTMLFormElement>(null)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [paymentDetails, setPaymentDetails] = useState<{sessionId?: string, jobId?: string} | null>(null)
  const [couponData, setCouponData] = useState<{ couponId: string; code: string; discountAmount: number; finalAmount: number } | null>(null)
  
  // Listen for messages from the Stripe window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[Form Debug] Received message:', event.data);
      
      // Make sure the message is from a trusted source
      if (typeof event.data === 'object' && event.data) {
        // Handle payment success message
        if (event.data.type === 'PAYMENT_SUCCESS') {
          console.log('[Form Debug] Received payment success message:', event.data);
          
          // Store payment details
          setPaymentDetails({
            sessionId: event.data.sessionId,
            jobId: event.data.jobId
          });
          
          // Update payment status
          setPaymentStatus('success');
        }
        
        // Handle window closing message
        if (event.data.type === 'PAYMENT_SUCCESS_CLOSING') {
          console.log('[Form Debug] Payment window is closing, updating UI');
          
          // Ensure modal remains open to show success state
          setTimeout(() => {
            // Display success state
            setPaymentStatus('success');
          }, 500);
        }
      }
    };
    
    // Add the message event listener
    window.addEventListener('message', handleMessage);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Auto-redirect after successful payment if modal is closed
  useEffect(() => {
    if (paymentStatus === 'success' && !showPaymentModal) {
      // Delay navigation to ensure UI updates are visible
      const timer = setTimeout(() => {
        router.push('/employer/jobs');
        router.refresh();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, showPaymentModal, router]);
  
  // If stripeUrl is set, submit the form to redirect to Stripe
  useEffect(() => {
    if (stripeUrl && stripeFormRef.current) {
      console.log('[Form Debug] Submitting form to Stripe URL:', stripeUrl);
      stripeFormRef.current.submit();
    }
  }, [stripeUrl]);
  
  // Add this useEffect to prevent form unload
  useEffect(() => {
    // This function is called before the page unloads
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSubmitting) {
        // Cancel the event and show a confirmation dialog
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = '';
      }
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting]);
  
  const handleStripeRedirect = () => {
    if (stripeUrl) {
      // Track that we've opened the payment window
      setPaymentStatus('pending');
      
      // Open in a new window (not tab) with a reference the parent can use
      const stripeWindow = window.open(
        stripeUrl, 
        'stripeCheckout', 
        'width=1000,height=800,top=100,left=100,resizable=yes,scrollbars=yes'
      );
      
      // If window is blocked by popup blocker, fallback to redirect
      if (!stripeWindow) {
        console.log('[Form Debug] Popup blocked, falling back to redirect');
        window.location.href = stripeUrl;
      } else {
        console.log('[Form Debug] Opened Stripe window successfully');
        
        // Focus the new window
        stripeWindow.focus();
      }
    }
  };
  
  const goToJobsList = () => {
    router.push('/employer/jobs');
  };
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      console.log('[Form Debug] Submitting form with payment method:', data.paymentMethod);
      console.log('[Form Debug] Coupon data:', couponData);
      
      // Add coupon data to form submission
      const dataWithCoupon = {
        ...data,
        coupon: couponData
      }
      
      // Execute server action directly
      const result = await createJobPosting(dataWithCoupon)
      
      // Add even more verbose logging
      console.log('[Form Debug] Raw result received:', result);
      console.log('[Form Debug] Result type:', typeof result);
      
      // Check for error
      if (result && typeof result === 'object' && 'error' in result) {
        console.error('[Form Debug] Error detected:', result.error);
        setError(result.error || 'An unexpected error occurred');
        return;
      }
      
      // Store job ID regardless of payment method
      if (result && typeof result === 'object' && 'jobId' in result) {
        setCreatedJobId(result.jobId);
      }
      
      // Check if this is a Stripe payment that needs redirection
      if (
        result && 
        typeof result === 'object' && 
        'paymentMethod' in result && 
        result.paymentMethod === 'stripe' &&
        'paymentUrl' in result && 
        result.paymentUrl
      ) {
        console.log('[Form Debug] Stripe payment detected with URL');
        setStripeUrl(result.paymentUrl);
        setShowPaymentModal(true);
        return;
      }
      
      // Handle cash payment or other status
      if (result && typeof result === 'object' && 'status' in result) {
        console.log('[Form Debug] Status received, redirecting to jobs list');
        router.push('/employer/jobs?status=pending');
        return;
      }
      
      // Default fallback
      console.log('[Form Debug] Using fallback redirection to jobs page');
      router.push('/employer/jobs');
      
    } catch (err) {
      console.error('[Form Debug] Exception caught:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Post a New Job</h1>
        <p className="text-gray-600">Fill out the details below to create a new job posting</p>
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Complete Your Payment</h3>
            
            {paymentStatus === 'success' ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 text-green-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-center mb-2">Payment Successful!</h4>
                <p className="text-center mb-6">Your job posting has been activated and is now live.</p>
              </>
            ) : (
              <p className="mb-4">Your job has been created successfully, but payment is required to publish it.</p>
            )}
            
            <div className="flex flex-col gap-3 mt-6">
              {paymentStatus !== 'success' && (
                <Button 
                  type="button" 
                  onClick={handleStripeRedirect}
                  className="bg-[#4a6cfa] hover:bg-[#7b90ff] flex items-center justify-center"
                >
                  Proceed to Payment <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              <Button 
                type="button"
                variant={paymentStatus === 'success' ? 'default' : 'outline'}
                onClick={goToJobsList}
              >
                {paymentStatus === 'success' ? 'Go to My Jobs' : 'Pay Later'}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              {paymentStatus === 'success' 
                ? 'Your job posting is now live and visible to job seekers.' 
                : 'Note: Your job will remain in DRAFT status until payment is completed.'}
            </p>
          </div>
        </div>
      )}

      <Card className="p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <BasicDetailsStep form={form} onNext={nextStep} />}
            {step === 2 && <RequirementsStep form={form} onNext={nextStep} onPrevious={prevStep} />}
            {step === 3 && <CompensationStep form={form} onNext={nextStep} onPrevious={prevStep} />}
            {step === 4 && <PostingSettingsStep form={form} onPrevious={prevStep} isSubmitting={isSubmitting} onCouponValidated={setCouponData} />}
            
            <div className="pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}% complete</span>
              </div>
              <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4a6cfa] transition-all duration-300" 
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </>
  )
} 