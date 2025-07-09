'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { formatPrice, calculateTotalPrice } from '@/lib/utils/pricing-client'
import type { PricingConfig } from '@/lib/db/schema'
import { fetchActivePricing } from '../../_actions/pricing'
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, ArrowLeft, Loader2, Tag, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { JobFormValues } from '../../_utils/validation'
import { applicationMethodEnum } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { useCouponValidation } from '../../_hooks/useCouponValidation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Editor } from '@/components/RichTextEditor/editor'
import { generateJobDescription, fetchAIContextData } from '../../_actions'
import { useToast } from '@/hooks/use-toast'

interface PostingSettingsStepProps {
  form: UseFormReturn<JobFormValues>
  onPrevious: () => void
  isSubmitting: boolean
  onCouponValidated?: (couponData: { couponId: string; code: string; discountAmount: number; finalAmount: number } | null) => void
}

export default function PostingSettingsStep({ 
  form, 
  onPrevious, 
  isSubmitting, 
  onCouponValidated
}: PostingSettingsStepProps) {
  const { isValidating, validationResult, validateCoupon, clearValidation } = useCouponValidation()
  const [couponCode, setCouponCode] = useState('')
  const [showCouponField, setShowCouponField] = useState(false)
  const [hasValidatedCoupon, setHasValidatedCoupon] = useState(false)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [contextData, setContextData] = useState<{
    skills: Array<{ id: string; name: string }>
    industries: Array<{ id: string; name: string }>
    locations: Array<{ id: string; region: string; district?: string | null; city?: string | null }>
    employerProfile: { companyName: string; industryId?: string } | null
  }>({ skills: [], industries: [], locations: [], employerProfile: null })
  const [loadingContext, setLoadingContext] = useState(false)
  const { toast } = useToast()
  const jobDuration = form.watch('jobDuration') || 1
  
  // Fetch pricing configuration
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricing = await fetchActivePricing()
        setPricingConfig(pricing)
      } catch (error) {
        console.error('Error fetching pricing:', error)
      } finally {
        setLoadingPricing(false)
      }
    }
    fetchPricing()
  }, [])
  
  // Fetch context data for AI generation when component mounts
  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoadingContext(true)
        
        const result = await fetchAIContextData()
        
        if (result.success && result.data) {
          setContextData(result.data)
        } else {
          console.error('Failed to fetch context data:', result.error)
        }
      } catch (error) {
        console.error('Error fetching context data:', error)
      } finally {
        setLoadingContext(false)
      }
    }
    fetchContext()
  }, [])
  
  // Calculate base price using dynamic pricing or fallback
  const basePrice = pricingConfig 
    ? calculateTotalPrice(pricingConfig.pricePerMonth, jobDuration)
    : jobDuration * 350000 // Fallback to 3,500 GMD per month in bututs
  const finalPrice = validationResult?.valid ? validationResult.finalAmount || 0 : basePrice
  
  const handleCouponValidation = async () => {
    if (couponCode.trim()) {
      const result = await validateCoupon(couponCode, basePrice)
      if (result) {
        setHasValidatedCoupon(true)
      }
    }
  }
  
  const handleClearCoupon = () => {
    setCouponCode('')
    clearValidation()
    setHasValidatedCoupon(false)
    onCouponValidated?.(null)
  }
  
  const handleCancelCoupon = () => {
    setShowCouponField(false)
    setCouponCode('')
    clearValidation()
    setHasValidatedCoupon(false)
    onCouponValidated?.(null)
  }
  
  // Only clear validation when coupon code is completely empty
  useEffect(() => {
    if (!couponCode.trim()) {
      clearValidation()
      setHasValidatedCoupon(false)
      onCouponValidated?.(null)
    }
  }, [couponCode, clearValidation, onCouponValidated])
  
  // Update parent component when validation changes
  useEffect(() => {
    if (validationResult?.valid && validationResult.coupon) {
      onCouponValidated?.({
        couponId: validationResult.coupon.id,
        code: validationResult.coupon.code,
        discountAmount: validationResult.discountAmount || 0,
        finalAmount: validationResult.finalAmount || 0
      })
    } else if (validationResult && !validationResult.valid) {
      onCouponValidated?.(null)
    }
  }, [validationResult, onCouponValidated])
  
  // Re-validate when duration changes BUT only if we already have a validated coupon
  useEffect(() => {
    if (couponCode.trim() && hasValidatedCoupon && validationResult?.valid) {
      validateCoupon(couponCode, basePrice)
    }
  }, [jobDuration, couponCode, hasValidatedCoupon, validationResult?.valid, validateCoupon, basePrice])
  
  // Handle AI generation with full context
  const handleGenerateDescription = async () => {
    const formValues = form.getValues()
    
    if (!formValues.title || formValues.title.trim().length < 3) {
      toast({
        title: "Missing information",
        description: "Please complete the job title before generating a description",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Get location name from locationId
      const selectedLocation = contextData.locations.find(loc => loc.id === formValues.locationId)
      const locationName = selectedLocation 
        ? [selectedLocation.city, selectedLocation.district, selectedLocation.region]
            .filter(Boolean)
            .join(', ')
        : ''
      
      // Get selected skill names
      const selectedSkills = formValues.skillIds
        .map(id => contextData.skills.find(skill => skill.id === id)?.name)
        .filter(Boolean) as string[]
      
      // Get selected industry names
      const selectedIndustries = formValues.industryIds
        .map(id => contextData.industries.find(industry => industry.id === id)?.name)
        .filter(Boolean) as string[]
      
      // Get company industry name if employer profile exists
      const companyIndustryName = contextData.employerProfile?.industryId
        ? contextData.industries.find(ind => ind.id === contextData.employerProfile?.industryId)?.name || ''
        : ''
      
      // Gather all context from the form
      const result = await generateJobDescription({
        title: formValues.title,
        location: locationName,
        experienceLevel: formValues.experienceLevel || '',
        workLocation: formValues.workLocation,
        jobType: formValues.jobType,
        industries: selectedIndustries,
        skills: selectedSkills,
        numberOfOpenings: formValues.numberOfOpenings,
        companyName: contextData.employerProfile?.companyName || '',
        companyIndustry: companyIndustryName,
        jobLanguage: formValues.jobLanguage,
        benefits: formValues.benefits || [],
        supplementalPay: formValues.supplementalPay || [],
        educationRequirements: formValues.educationRequirementsRichText || '',
        experienceRequirements: formValues.experienceRequirementsRichText || '',
        requestId: '' // Will be generated in the action
      })

      if (result.success && result.description) {
        form.setValue('description', result.description, { shouldDirty: true })
        toast({
          title: "Description generated!",
          description: "AI has generated a job description based on all the details you provided. Feel free to edit it as needed.",
        })
      } else {
        throw new Error(result.error || 'Failed to generate description')
      }
    } catch (error) {
      console.error('Error generating description:', error)
      toast({
        title: "Generation failed",
        description: "Unable to generate description. Please try again or write manually.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Posting Settings & Payment</h2>
      
      <FormField
        control={form.control}
        name="applicationMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Method</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select application method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {applicationMethodEnum.enumValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === 'PLATFORM' ? 'Apply Through Platform' : 
                     value === 'EMAIL' ? 'Apply via Email' :
                     value === 'WEBSITE' ? 'Apply on Company Website' :
                     value === 'PHONE' ? 'Apply by Phone' : 'Apply in Person'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              How should candidates apply to this job?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('applicationMethod') === 'EMAIL' && (
        <FormField
          control={form.control}
          name="applicationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. jobs@company.com" 
                  type="email"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Email address where applications should be sent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {form.watch('applicationMethod') === 'WEBSITE' && (
        <FormField
          control={form.control}
          name="applicationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. https://company.com/careers/job123" 
                  type="url"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URL where candidates can apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="applicationInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Instructions</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide any specific instructions for applicants..." 
                {...field} 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              Additional instructions for applicants
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Job Description</FormLabel>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGenerating || loadingContext}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Enhance with AI'}
              </Button> */}
            </div>
            <FormControl>
              <Editor
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Comprehensive job description based on all the details you've provided
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="applicationDeadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Application Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Last date candidates can submit applications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plannedStartDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Planned Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When do you expect the successful candidate to start?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="resumeRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Resume Required</FormLabel>
                <FormDescription>
                  Require candidates to submit a resume
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="allowCandidateContact"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Candidate Contact</FormLabel>
                <FormDescription>
                  Allow candidates to contact you directly
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="jobDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posting Duration</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                max={12}
                placeholder="e.g. 1" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              How many months should this job posting be active? (1-12 months)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Payment Method</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="stripe" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Pay Online (Stripe)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="cash" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Pay with Cash (Manual Approval)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormDescription>
              Select how you&apos;d like to pay for this job posting
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Price Display */}
      <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[#9aa3bc]">Duration:</span>
          <span className="font-medium text-[#1a1e2d]">{jobDuration} month{jobDuration > 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#9aa3bc]">Base Price:</span>
          <span className="font-medium text-[#1a1e2d]">{formatPrice(basePrice)}</span>
        </div>
        {validationResult?.valid && (
          <>
            <div className="flex justify-between items-center text-[#05ce91]">
              <span>Discount:</span>
              <span className="font-medium">-{formatPrice(validationResult.discountAmount!)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold text-[#1a1e2d]">Total:</span>
              <span className="font-bold text-lg text-[#1a1e2d]">
                {formatPrice(finalPrice)}
              </span>
            </div>
          </>
        )}
        {!validationResult?.valid && (
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold text-[#1a1e2d]">Total:</span>
            <span className="font-bold text-lg text-[#1a1e2d]">{formatPrice(basePrice)}</span>
          </div>
        )}
      </div>
      
      {/* Coupon Section */}
      <div className="space-y-3">
        {!showCouponField ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCouponField(true)}
            className="w-full flex items-center justify-center"
          >
            <Tag className="mr-2 h-4 w-4" />
            Have a coupon code?
          </Button>
        ) : (
          <div className="space-y-3">
            {!hasValidatedCoupon || !validationResult?.valid ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCouponValidation()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleCouponValidation}
                  disabled={isValidating || !couponCode.trim()}
                  variant="secondary"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelCoupon}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={`${couponCode} - Applied`}
                  disabled
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleClearCoupon}
                  variant="outline"
                >
                  Remove
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelCoupon}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {validationResult && (
              <Alert className={validationResult.valid ? 'border-[#05ce91]' : 'border-destructive'}>
                {validationResult.valid ? (
                  <CheckCircle className="h-4 w-4 text-[#05ce91]" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertDescription>
                  {validationResult.valid 
                    ? `Coupon "${validationResult.coupon?.code}" applied successfully!` 
                    : validationResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
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
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff] transition-colors duration-300 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Job Posting'
          )}
        </Button>
      </div>
    </div>
  )
} 