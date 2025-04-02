'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { salaryFrequencyEnum, salaryDisplayTypeEnum } from '@/lib/db/schema'
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { JobFormValues } from '../../_utils/validation'

interface CompensationStepProps {
  form: UseFormReturn<JobFormValues>
  onNext: () => void
  onPrevious: () => void
}

export default function CompensationStep({ form, onNext, onPrevious }: CompensationStepProps) {
  const [tempBenefit, setTempBenefit] = useState('')
  const [tempSupplementalPay, setTempSupplementalPay] = useState('')
  
  const handleAddBenefit = () => {
    if (tempBenefit.trim()) {
      const current = form.getValues('benefits') || []
      form.setValue('benefits', [...current, tempBenefit.trim()])
      setTempBenefit('')
    }
  }
  
  const handleRemoveBenefit = (index: number) => {
    const current = form.getValues('benefits') || []
    form.setValue('benefits', current.filter((_, i) => i !== index))
  }
  
  const handleAddSupplementalPay = () => {
    if (tempSupplementalPay.trim()) {
      const current = form.getValues('supplementalPay') || []
      form.setValue('supplementalPay', [...current, tempSupplementalPay.trim()])
      setTempSupplementalPay('')
    }
  }
  
  const handleRemoveSupplementalPay = (index: number) => {
    const current = form.getValues('supplementalPay') || []
    form.setValue('supplementalPay', current.filter((_, i) => i !== index))
  }
  
  const handleNext = () => {
    // We can just proceed since salary fields are optional
    onNext()
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Compensation & Benefits</h2>
      
      <FormField
        control={form.control}
        name="salaryDisplayType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Salary Display Type</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select how to display salary" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {salaryDisplayTypeEnum.enumValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === 'RANGE' ? 'Salary Range' : 
                     value === 'FIXED' ? 'Fixed Amount' :
                     value === 'STARTING_AMOUNT' ? 'Starting From' :
                     value === 'MAXIMUM_AMOUNT' ? 'Up To' : 'Negotiable'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              How do you want to display salary information?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('salaryDisplayType') !== 'NEGOTIABLE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(form.watch('salaryDisplayType') === 'RANGE' || 
            form.watch('salaryDisplayType') === 'STARTING_AMOUNT' || 
            form.watch('salaryDisplayType') === 'FIXED') && (
            <FormField
              control={form.control}
              name="salaryRangeMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('salaryDisplayType') === 'FIXED' 
                      ? 'Salary Amount' 
                      : form.watch('salaryDisplayType') === 'STARTING_AMOUNT'
                      ? 'Starting Salary'
                      : 'Minimum Salary'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 30000" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      value={field.value === undefined ? '' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {(form.watch('salaryDisplayType') === 'RANGE' || 
            form.watch('salaryDisplayType') === 'MAXIMUM_AMOUNT') && (
            <FormField
              control={form.control}
              name="salaryRangeMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('salaryDisplayType') === 'MAXIMUM_AMOUNT' 
                      ? 'Maximum Salary' 
                      : 'Maximum Salary'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 50000" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      value={field.value === undefined ? '' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="salaryCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GMD">GMD (Gambian Dalasi)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="salaryFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Frequency</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {salaryFrequencyEnum.enumValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value === 'HOUR' ? 'Per Hour' : 
                         value === 'DAY' ? 'Per Day' :
                         value === 'WEEK' ? 'Per Week' :
                         value === 'MONTH' ? 'Per Month' : 'Per Year'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="space-y-4">
        <FormLabel>Benefits</FormLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.watch('benefits')?.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {benefit}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveBenefit(index)} 
              />
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input 
            value={tempBenefit} 
            onChange={(e) => setTempBenefit(e.target.value)}
            placeholder="e.g. Health Insurance" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddBenefit()
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleAddBenefit}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <FormDescription>
          Add benefits offered with this position
        </FormDescription>
      </div>
      
      <div className="space-y-4">
        <FormLabel>Supplemental Pay</FormLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.watch('supplementalPay')?.map((pay, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {pay}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveSupplementalPay(index)} 
              />
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input 
            value={tempSupplementalPay} 
            onChange={(e) => setTempSupplementalPay(e.target.value)}
            placeholder="e.g. Performance Bonus" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddSupplementalPay()
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleAddSupplementalPay}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <FormDescription>
          Add additional compensation types offered (bonuses, commissions, etc.)
        </FormDescription>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          type="button" 
          onClick={handleNext}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff] transition-colors duration-300 flex items-center"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 