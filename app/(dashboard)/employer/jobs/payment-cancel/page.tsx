'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job_id')

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Payment Cancelled"
        description="Your payment was not completed"
      />

      <Card className="max-w-xl mx-auto bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)]">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment process was cancelled and your job posting has not been activated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm">
              Your job posting is still saved as a draft. You can complete the payment process
              anytime by selecting the job from your dashboard and choosing to publish it.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/employer/jobs')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to My Jobs
          </Button>
          {jobId && (
            <Button
              onClick={() => router.push(`/employer/jobs/${jobId}/edit`)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              Complete Posting
            </Button>
          )}
        </CardFooter>
      </Card>
    </DashboardShell>
  )
} 