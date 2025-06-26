'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Tag, Users, DollarSign, TrendingUp } from 'lucide-react'
import CouponFormDialog from '../../_components/CouponFormDialog'
import type { Coupon } from '@/lib/db/schema'

interface CouponDetailsClientProps {
  coupon: Coupon
  redemptions: any[]
  stats: {
    totalRedemptions: number
    totalDiscountGiven: number
    averageDiscount: number
  }
}

export default function CouponDetailsClient({ coupon, redemptions, stats }: CouponDetailsClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  const getDiscountDisplay = () => {
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        return `${coupon.discountValue}%`
      case 'FIXED':
        return `$${(coupon.discountValue / 100).toFixed(2)}`
      case 'FREE':
        return '100% (Free)'
      default:
        return '-'
    }
  }
  
  const getStatusBadge = () => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null
    
    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (validFrom > now) {
      return <Badge variant="secondary">Scheduled</Badge>
    }
    
    if (validUntil && validUntil < now) {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return <Badge variant="destructive">Exhausted</Badge>
    }
    
    return <Badge variant="default" className="bg-[#05ce91]">Active</Badge>
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Coupons
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1e2d] flex items-center gap-2">
              <code className="font-mono">{coupon.code}</code>
              {getStatusBadge()}
            </h1>
            {coupon.description && (
              <p className="text-[#9aa3bc] mt-1">{coupon.description}</p>
            )}
          </div>
        </div>
        <Button 
          onClick={() => setEditDialogOpen(true)}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff]"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Coupon
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount Type</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDiscountDisplay()}</div>
            <p className="text-xs text-muted-foreground">
              {coupon.applicableTo.replace('_', ' ').toLowerCase()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              {coupon.maxUses ? `of ${coupon.maxUses} max` : 'Unlimited'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalDiscountGiven / 100).toFixed(2)}</div>
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
              ${(stats.averageDiscount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per redemption
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Coupon Details */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valid From</p>
              <p className="font-medium">{format(new Date(coupon.validFrom), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Until</p>
              <p className="font-medium">
                {coupon.validUntil ? format(new Date(coupon.validUntil), 'PPP') : 'No expiry'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Per User Limit</p>
              <p className="font-medium">{coupon.maxUsesPerUser || 'Unlimited'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minimum Purchase</p>
              <p className="font-medium">
                {coupon.minPurchaseAmount ? `$${(coupon.minPurchaseAmount / 100).toFixed(2)}` : 'None'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle>Redemption History</CardTitle>
          <CardDescription>
            All uses of this coupon code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions && redemptions.length > 0 ? (
            <div className="space-y-4">
              {redemptions.map((redemption) => (
                <div key={redemption.redemption.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{redemption.userFullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {redemption.jobTitle || 'Unknown Job'} • {format(new Date(redemption.redemption.redeemedAt), 'PPP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#05ce91]">
                      -${(redemption.redemption.discountAmount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      from ${(redemption.redemption.originalAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No redemptions yet
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <CouponFormDialog
        mode="edit"
        coupon={coupon}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  )
}