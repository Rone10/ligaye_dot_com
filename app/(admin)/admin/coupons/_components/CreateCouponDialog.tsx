'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner';
import { createCoupon } from '../_actions'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateCouponDialog() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE'>('PERCENTAGE')
  const [validFrom, setValidFrom] = useState<Date>(new Date())
  const [validUntil, setValidUntil] = useState<Date>()
  
  const resetForm = () => {
    setDiscountType('PERCENTAGE')
    setValidFrom(new Date())
    setValidUntil(undefined)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('discountType', discountType)
    formData.append('validFrom', validFrom.toISOString())
    if (validUntil) {
      formData.append('validUntil', validUntil.toISOString())
    }
    
    // Step 1: Isolate the server call in its own try/catch.
    let result;
    try {
      result = await createCoupon(formData)
    } catch (error) {
      console.error('Error during server action call:', error)
      setIsSubmitting(false)
      toast.error('An error occurred while communicating with the server.')
      return
    }

    // Step 2: Handle the result of the server call.
    if (result && result.success) {
      // On success, show toast and reset the form/dialog state.
      toast.success('Coupon created successfully')
      formRef.current?.reset()
      resetForm()
      setOpen(false) 
      setIsSubmitting(false)

      // Finally, refresh the data.
      startTransition(() => {
        router.refresh()
      })
    } else {
      // On failure, show the specific error message from the server.
      const errorMessage = result?.error || 'Failed to create coupon'
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }
  
  // Handle dialog state changes
  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing if currently submitting the form.
    // The pending state of the transition should not block the dialog from closing.
    if (!newOpen && isSubmitting) {
      return
    }
    
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      resetForm()
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#4a6cfa] hover:bg-[#7b90ff]">
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount code for job postings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                name="code"
                className="col-span-3"
                placeholder="e.g., LAUNCH2025"
                required
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  const input = e.target as HTMLInputElement
                  input.value = input.value.toUpperCase()
                }}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3"
                placeholder="Optional description for internal use"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountType" className="text-right">
                Discount Type
              </Label>
              <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  <SelectItem value="FREE">100% Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {discountType !== 'FREE' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountValue" className="text-right">
                  Discount Value
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    min="0"
                    step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    max={discountType === 'PERCENTAGE' ? '100' : undefined}
                    placeholder={discountType === 'PERCENTAGE' ? '20' : '10.00'}
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    {discountType === 'PERCENTAGE' ? '%' : '$'}
                  </span>
                </div>
              </div>
            )}
            
            {discountType === 'FREE' && (
              <input type="hidden" name="discountValue" value="100" />
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="applicableTo" className="text-right">
                Applies To
              </Label>
              <Select name="applicableTo" defaultValue="JOB_POSTING">
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOB_POSTING">Job Postings Only</SelectItem>
                  <SelectItem value="TENDER">Tenders Only</SelectItem>
                  <SelectItem value="ALL">All Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxUses" className="text-right">
                Max Uses
              </Label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                min="1"
                className="col-span-3"
                placeholder="Leave empty for unlimited"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxUsesPerUser" className="text-right">
                Per User Limit
              </Label>
              <Input
                id="maxUsesPerUser"
                name="maxUsesPerUser"
                type="number"
                min="1"
                className="col-span-3"
                placeholder="Default: 1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minPurchaseAmount" className="text-right">
                Min. Purchase
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="minPurchaseAmount"
                  name="minPurchaseAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional minimum amount"
                />
                <span className="text-sm text-muted-foreground">$</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'col-span-3 justify-start text-left font-normal',
                      !validFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validFrom ? format(validFrom, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validFrom}
                    onSelect={(date) => setValidFrom(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'col-span-3 justify-start text-left font-normal',
                      !validUntil && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, 'PPP') : <span>Optional expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={setValidUntil}
                    disabled={(date) => date < validFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Coupon'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}