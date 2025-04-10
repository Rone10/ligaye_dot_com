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
  const autoClose = searchParams.get('auto_close') === 'true'
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Process the payment if session_id is present
    if (sessionId) {
      const handlePayment = async () => {
        try {
          // Call the server action to process payment
          const result = await processPayment(sessionId)
          
          if (!result.success) {
            setError(result.error || 'There was an error processing your payment. Please contact support.')
          } else if (autoClose) {
            // If auto-close is enabled and payment was successful
            // First, try to refresh the parent window (the one that opened this)
            if (window.opener) {
              try {
                // Send a detailed message to the parent window
                window.opener.postMessage({
                  type: 'PAYMENT_SUCCESS',
                  sessionId,
                  jobId: result.jobId,
                  timestamp: new Date().toISOString()
                }, '*');
                
                console.log('Sent success message to parent window');
                
                // Start countdown to auto-close
                const timer = setInterval(() => {
                  setCountdown((prev) => {
                    if (prev <= 1) {
                      clearInterval(timer)
                      
                      // Final confirmation message to parent before closing
                      try {
                        window.opener.postMessage({
                          type: 'PAYMENT_SUCCESS_CLOSING',
                          sessionId
                        }, '*');
                      } catch (e) {
                        console.error('Error sending final message to parent:', e);
                      }
                      
                      // Force close the window after countdown
                      window.close()
                      
                      // If window doesn't close (e.g., it wasn't opened via window.open)
                      // redirect to jobs page
                      setTimeout(() => {
                        router.push('/employer/jobs')
                      }, 500)
                      return 0
                    }
                    return prev - 1
                  })
                }, 1000)
                
                return () => clearInterval(timer)
              } catch (e) {
                console.error('Error communicating with parent window:', e);
                setIsProcessing(false);
              }
            } else {
              // No opener, just show success
              setIsProcessing(false);
            }
          } else {
            setIsProcessing(false);
          }
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
  }, [sessionId, autoClose, router])

  // Add a script to ensure window closes if browser blocks auto-close
  useEffect(() => {
    if (autoClose && !isProcessing && !error) {
      // Create script element for window-close behavior
      const script = document.createElement('script');
      script.textContent = `
        // Try to close after a short delay
        setTimeout(() => {
          try {
            if (window.opener) {
              window.opener.focus();
            }
            window.close();
          } catch (e) {
            console.error('Failed to auto-close window:', e);
          }
        }, ${countdown * 1000 + 500});
      `;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [autoClose, isProcessing, error, countdown]);

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
              : autoClose 
                ? `Your job posting has been activated. This window will close in ${countdown} seconds.`
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
          {autoClose ? (
            <Button
              onClick={() => window.close()}
              className="gap-2"
              disabled={isProcessing}
            >
              Close Window Now
            </Button>
          ) : (
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
          )}
        </CardFooter>
      </Card>
    </DashboardShell>
  )
} 