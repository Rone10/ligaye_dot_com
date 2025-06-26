import { Suspense } from 'react'
import { getCouponsWithStats } from './_queries'
import CouponsTable from './_components/CouponsTable'
import CouponFormDialog from './_components/CouponFormDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Tag, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default async function AdminCouponsPage() {
  const result = await getCouponsWithStats()
  
  if (result.error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  const coupons = result.coupons || []
  
  // Calculate stats
  const activeCoupons = coupons.filter(c => c.coupon.isActive && !c.coupon.deleted)
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.redemptionCount, 0)
  const totalDiscountGiven = coupons.reduce((sum, c) => sum + c.totalDiscountGiven, 0)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1e2d]">Coupons</h1>
          <p className="text-[#9aa3bc] mt-1">Manage discount codes and promotions</p>
        </div>
        <CouponFormDialog mode="create" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCoupons.length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              All time usage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalDiscountGiven / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Given in discounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRedemptions > 0 ? (totalDiscountGiven / totalRedemptions / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per redemption
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            View and manage all discount codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <CouponsTable coupons={coupons} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}