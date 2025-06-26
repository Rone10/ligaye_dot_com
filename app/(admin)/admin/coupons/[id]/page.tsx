import { notFound } from 'next/navigation'
import { getCouponDetails } from '../_queries'
import CouponDetailsClient from './_components/CouponDetailsClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CouponDetailsPage({ params }: PageProps) {
  const { id } = await params
  const result = await getCouponDetails(id)
  
  if (result.error || !result.coupon) {
    notFound()
  }
  
  const { coupon, redemptions, stats } = result
  
  return (
    <CouponDetailsClient 
      coupon={coupon} 
      redemptions={redemptions || []} 
      stats={stats}
    />
  )
}