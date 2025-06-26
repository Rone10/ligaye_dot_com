'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteCoupon } from '../_actions'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import type { Coupon } from '@/lib/db/schema'

interface DeleteCouponDialogProps {
  coupon: Coupon
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteCouponDialog({ coupon, open, onOpenChange }: DeleteCouponDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)

    let result
    try {
      result = await deleteCoupon(coupon.id)
    } catch (error) {
      console.error('Error during delete:', error)
      setIsDeleting(false)
      toast.error('An error occurred while communicating with the server.')
      return
    }

    if (result && result.success) {
      toast.success('Coupon deleted successfully')
      onOpenChange(false)
      setIsDeleting(false)

      startTransition(() => {
        router.refresh()
      })
    } else {
      const errorMessage = result?.error || 'Failed to delete coupon'
      toast.error(errorMessage)
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDeleting) {
      return
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Coupon
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the coupon <strong className="font-mono">{coupon.code}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <p className="text-sm text-muted-foreground">
            This coupon has been used <strong>{coupon.usedCount || 0}</strong> time{coupon.usedCount !== 1 ? 's' : ''}.
          </p>
          {coupon.description && (
            <p className="text-sm text-muted-foreground">
              Description: {coupon.description}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
          >
            {isDeleting || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Coupon'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}