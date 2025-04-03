import { Suspense } from 'react'
import { Clock } from 'lucide-react'
import { getPendingCashPayments, getPaymentStats } from './_queries'
import PaymentsTable from './_components/PaymentsTable'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Payments - Admin Dashboard',
  description: 'Review and manage payment transactions',
}

export default async function PaymentsPage() {
  const paymentsResult = await getPendingCashPayments()
  const statsResult = await getPaymentStats()
  
  // Handle potential error responses
  const payments = 'pendingPayments' in paymentsResult && paymentsResult.pendingPayments ? paymentsResult.pendingPayments : []
  const stats = 'stats' in statsResult && statsResult.stats ? statsResult.stats : { pendingCash: 0, succeeded: 0, failed: 0 }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Payments Management"
        description="Review and approve cash payments for job postings"
      />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCash}</div>
            <p className="text-xs text-muted-foreground">
              Cash payments awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.succeeded}</div>
            <p className="text-xs text-muted-foreground">
              Payments successfully processed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Payments that were declined
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Pending Cash Payments</h2>
        <Suspense fallback={<PaymentsTableSkeleton />}>
          <PaymentsTable payments={payments} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

function PaymentsTableSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="h-12 bg-muted px-4 flex items-center border-b">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px] ml-auto" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-[90px] rounded-md" />
              <Skeleton className="h-9 w-[90px] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 