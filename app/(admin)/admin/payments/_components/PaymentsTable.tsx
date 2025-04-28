'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, AlertCircle } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { handleApproveCashPayment, handleRejectCashPayment } from '../_actions'
import { useToast } from '@/hooks/use-toast'

// Define the payment type
interface Payment {
  payment: {
    id: string
    amount: number
    currency: string
    method: string
    status: string
    createdAt: Date
    updatedAt: Date
  }
  job: {
    id: string
    title: string
    status: string
  }
  employer: {
    id: string
    companyName: string
    profileId: string
  }
  employerUser: {
    fullName: string
  }
}

interface PaymentsTableProps {
  payments: Payment[]
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  // Handle open approve dialog
  const openApproveDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsApproving(true)
  }
  
  // Handle open reject dialog
  const openRejectDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsRejecting(true)
  }
  
  // Handle approve payment
  const approvePayment = async () => {
    if (!selectedPayment) return
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('paymentId', selectedPayment.payment.id)
      
      const result = await handleApproveCashPayment(formData)
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Payment approved successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve payment',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
      setSelectedPayment(null)
      setIsSubmitting(false)
    }
  }
  
  // Handle reject payment
  const rejectPayment = async () => {
    if (!selectedPayment) return
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('paymentId', selectedPayment.payment.id)
      
      const result = await handleRejectCashPayment(formData)
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Payment rejected successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject payment',
        variant: 'destructive',
      })
    } finally {
      setIsRejecting(false)
      setSelectedPayment(null)
      setIsSubmitting(false)
    }
  }
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GM', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100) // Convert cents to dollars/dalasi
  }
  
  if (payments.length === 0) {
    return (
      <Card className="bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-xl shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No pending payments</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no pending cash payments that require admin approval.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <div className="rounded-xl overflow-hidden border bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Submitted On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.payment.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-medium">{payment.job.title}</p>
                    <p className="text-xs text-muted-foreground">ID: {payment.job.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{payment.employer.companyName}</p>
                    <p className="text-xs text-muted-foreground">{payment.employerUser.fullName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-amber-50">
                    {formatCurrency(payment.payment.amount, payment.payment.currency)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(payment.payment.createdAt), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                      onClick={() => openApproveDialog(payment)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                      onClick={() => openRejectDialog(payment)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Approve Payment Dialog */}
      <AlertDialog open={isApproving} onOpenChange={setIsApproving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this cash payment? The job posting will become active immediately.
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p><strong>Job Title:</strong> {selectedPayment?.job.title}</p>
                <p><strong>Employer:</strong> {selectedPayment?.employer.companyName}</p>
                <p><strong>Amount:</strong> {selectedPayment && formatCurrency(selectedPayment.payment.amount, selectedPayment.payment.currency)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                approvePayment()
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Approving...' : 'Approve Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reject Payment Dialog */}
      <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this cash payment? The job posting will be returned to draft status.
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p><strong>Job Title:</strong> {selectedPayment?.job.title}</p>
                <p><strong>Employer:</strong> {selectedPayment?.employer.companyName}</p>
                <p><strong>Amount:</strong> {selectedPayment && formatCurrency(selectedPayment.payment.amount, selectedPayment.payment.currency)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                rejectPayment()
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 