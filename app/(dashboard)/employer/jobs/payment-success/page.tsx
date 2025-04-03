'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { processPayment } from './actions'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Process the payment if session_id is present
    if (sessionId) {
      const handlePayment = async () => {
        try {
          // Call the server action to process payment
          const result = await processPayment(sessionId)
          
          if (!result.success) {
            setError(result.error || 'There was an error processing your payment. Please contact support.')
          }
          
          setIsProcessing(false)
        } catch (err) {
          console.error('Error in payment confirmation:', err)
          setError('There was an error processing your payment. Please contact support.')
          setIsProcessing(false)
        }
      }

      handlePayment()
    } else {
      setError('No payment session found. Please contact support if your job posting is not active.')
      setIsProcessing(false)
    }
  }, [sessionId])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Payment Confirmation"
        description="Thank you for your payment"
      />

      <Card className="max-w-xl mx-auto bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)]">
        <CardHeader className="text-center">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          ) : error ? (
            <div className="text-destructive text-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 mx-auto mb-4"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {isProcessing
              ? 'Processing Your Payment'
              : error
              ? 'Payment Error'
              : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? 'Please wait while we confirm your payment...'
              : error
              ? error
              : 'Your job posting has been successfully activated.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isProcessing && !error && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="font-medium">
                Your job posting is now live and will be visible to all job seekers.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push('/employer/jobs')}
            className="gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Go to My Jobs
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
} 