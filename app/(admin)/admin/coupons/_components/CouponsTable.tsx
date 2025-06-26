'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, Edit, Trash, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCoupon, updateCoupon } from '../_actions'
import { toast } from 'sonner'
import type { Coupon } from '@/lib/db/schema'

interface CouponsTableProps {
  coupons: {
    coupon: Coupon
    redemptionCount: number
    totalDiscountGiven: number
  }[]
}

export default function CouponsTable({ coupons }: CouponsTableProps) {
  const router = useRouter();
  // const { toast } = useToast()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
      toast.success(`Coupon code ${code} copied to clipboard`)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }
  
  const handleToggleActive = async (couponId: string, currentStatus: boolean) => {
    try {
      const result = await updateCoupon(couponId, { isActive: !currentStatus })
      if (result.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update coupon')
      }
    } catch (error) {
      toast.error('Failed to update coupon')
    }
  }
  
  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }
    
    try {
      const result = await deleteCoupon(couponId)
      if (result.success) {
        toast.success('Coupon deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete coupon')
      }
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }
  
  const getDiscountDisplay = (coupon: Coupon) => {
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
  
  const getStatusBadge = (coupon: Coupon) => {
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
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid Period</TableHead>
            <TableHead>Total Discount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No coupons found. Create your first coupon to get started.
              </TableCell>
            </TableRow>
          ) : (
            coupons.map(({ coupon, redemptionCount, totalDiscountGiven }) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-semibold">{coupon.code}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyCode(coupon.code)}
                    >
                      {copiedCode === coupon.code ? (
                        <CheckCircle className="h-3 w-3 text-[#05ce91]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{getDiscountDisplay(coupon)}</div>
                  {coupon.minPurchaseAmount && (
                    <p className="text-xs text-muted-foreground">
                      Min: ${(coupon.minPurchaseAmount / 100).toFixed(2)}
                    </p>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(coupon)}</TableCell>
                <TableCell>
                  <div>{redemptionCount}</div>
                  {coupon.maxUses && (
                    <p className="text-xs text-muted-foreground">
                      of {coupon.maxUses}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(coupon.validFrom), 'MMM d, yyyy')}
                  </div>
                  {coupon.validUntil && (
                    <div className="text-xs text-muted-foreground">
                      to {format(new Date(coupon.validUntil), 'MMM d, yyyy')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    ${(totalDiscountGiven / 100).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/coupons/${coupon.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/coupons/${coupon.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}