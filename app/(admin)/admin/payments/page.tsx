import { Suspense } from 'react'
import { FileText, Clock, CheckCircle } from 'lucide-react'
import { getUnpaidJobs, getJobPaymentStats } from './_queries'
import UnpaidJobsTable from './_components/UnpaidJobsTable'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Unpaid Jobs - Admin Dashboard',
  description: 'Review jobs awaiting payment or in draft status',
}

export default async function UnpaidJobsPage() {
  const jobsResult = await getUnpaidJobs()
  const statsResult = await getJobPaymentStats()
  
  // Handle potential error responses
  const unpaidJobs = 'unpaidJobs' in jobsResult && jobsResult.unpaidJobs ? jobsResult.unpaidJobs : []
  const stats = 'stats' in statsResult && statsResult.stats ? statsResult.stats : { draft: 0, pendingPayment: 0, active: 0 }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Unpaid Jobs Management"
        description="Review jobs that are in Draft or Pending Payment status"
      />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Jobs saved but not yet submitted for payment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayment}</div>
            <p className="text-xs text-muted-foreground">
              Jobs awaiting payment confirmation (Cash or Stripe)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Jobs currently live on the platform
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Jobs Awaiting Payment / Activation</h2>
        <Suspense fallback={<UnpaidJobsTableSkeleton />}>
          <UnpaidJobsTable jobs={unpaidJobs} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

function UnpaidJobsTableSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="h-12 bg-muted px-4 flex items-center border-b">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px] ml-auto" />
        <Skeleton className="h-4 w-[100px] ml-6" />
        <Skeleton className="h-4 w-[100px] ml-6" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
            <Skeleton className="h-4 w-[100px] ml-6" />
            <Skeleton className="h-4 w-[100px] ml-6" />
          </div>
        ))}
      </div>
    </div>
  )
} 