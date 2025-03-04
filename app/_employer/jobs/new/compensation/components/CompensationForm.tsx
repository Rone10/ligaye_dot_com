'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  RadioGroup,
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { FormField } from "../../basics/components/FormField";

// Currency options
const currencies = [
  { value: 'GMD', label: 'Gambian Dalasi (GMD)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'NGN', label: 'Nigerian Naira (NGN)' },
  { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
  { value: 'XOF', label: 'CFA Franc (XOF)' },
];

// Salary frequency options
const frequencies = [
  { value: 'HOUR', label: 'per hour' },
  { value: 'DAY', label: 'per day' },
  { value: 'WEEK', label: 'per week' },
  { value: 'MONTH', label: 'per month' },
  { value: 'YEAR', label: 'per year' },
];

// Supplemental pay options
const supplementalPayOptions = [
  { id: 'bonus', label: 'Bonus pay' },
  { id: 'commission', label: 'Commission pay' },
  { id: 'overtime', label: 'Overtime pay' },
  { id: 'tips', label: 'Tips' },
  { id: 'shift_allowance', label: 'Shift allowance' },
  { id: 'performance_incentives', label: 'Performance incentives' },
  { id: 'profit_sharing', label: 'Profit sharing' },
];

// Benefits options
const benefitsOptions = [
  { id: 'health_insurance', label: 'Health insurance' },
  { id: 'dental_insurance', label: 'Dental insurance' },
  { id: 'vision_insurance', label: 'Vision insurance' },
  { id: 'retirement_plan', label: 'Retirement plan' },
  { id: 'paid_time_off', label: 'Paid time off' },
  { id: 'flexible_schedule', label: 'Flexible schedule' },
  { id: 'parental_leave', label: 'Parental leave' },
  { id: 'tuition_reimbursement', label: 'Tuition reimbursement' },
  { id: 'company_car', label: 'Company car' },
  { id: 'meals_provided', label: 'Meals provided' },
  { id: 'housing_allowance', label: 'Housing allowance' },
  { id: 'relocation_assistance', label: 'Relocation assistance' },
  { id: 'work_from_home', label: 'Work from home' },
];

export function CompensationForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleSupplementalPayChange = (pay: string, checked: boolean) => {
    const updatedPay = checked
      ? [...formData.supplementalPay, pay]
      : formData.supplementalPay.filter(p => p !== pay);
    
    handleFieldChange('supplementalPay', updatedPay);
  };

  const handleBenefitChange = (benefit: string, checked: boolean) => {
    const updatedBenefits = checked
      ? [...formData.benefits, benefit]
      : formData.benefits.filter(b => b !== benefit);
    
    handleFieldChange('benefits', updatedBenefits);
  };

  return (
    <FormStepGuard requiredStep={3}>
      <form className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compensation</h2>
          
          <FormField
            label="How would you like to show pay for this job?"
            error={errors.salaryDisplayType}
          >
            <RadioGroup
              value={formData.salaryDisplayType}
              onValueChange={(value) => handleFieldChange('salaryDisplayType', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RANGE" id="salary-range" />
                <Label htmlFor="salary-range">Range</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="STARTING_FROM" id="salary-starting" />
                <Label htmlFor="salary-starting">Starting from</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EXACT" id="salary-exact" />
                <Label htmlFor="salary-exact">Exact amount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEGOTIABLE" id="salary-negotiable" />
                <Label htmlFor="salary-negotiable">To be negotiated</Label>
              </div>
            </RadioGroup>
          </FormField>
          
          {formData.salaryDisplayType !== 'NEGOTIABLE' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label={formData.salaryDisplayType === 'RANGE' ? 'Minimum' : 'Amount'}
                  error={errors.salaryRangeMin}
                >
                  <div className="flex">
                    <Select
                      value={formData.salaryCurrency}
                      onValueChange={(value) => handleFieldChange('salaryCurrency', value)}
                    >
                      <SelectTrigger className="w-24 rounded-r-none border-r-0">
                        <SelectValue placeholder="GMD" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="rounded-l-none flex-1"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.salaryRangeMin || ''}
                      onChange={(e) => handleFieldChange('salaryRangeMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </FormField>
                
                {formData.salaryDisplayType === 'RANGE' && (
                  <FormField
                    label="Maximum"
                    error={errors.salaryRangeMax}
                  >
                    <div className="flex">
                      <Select
                        value={formData.salaryCurrency}
                        onValueChange={(value) => handleFieldChange('salaryCurrency', value)}
                        disabled
                      >
                        <SelectTrigger className="w-24 rounded-r-none border-r-0">
                          <SelectValue placeholder="GMD" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Currency is linked to the minimum field */}
                        </SelectContent>
                      </Select>
                      <Input
                        className="rounded-l-none flex-1"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={formData.salaryRangeMax || ''}
                        onChange={(e) => handleFieldChange('salaryRangeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </FormField>
                )}
              </div>
              
              <FormField
                label="Rate"
                error={errors.salaryFrequency}
              >
                <Select
                  value={formData.salaryFrequency}
                  onValueChange={(value) => handleFieldChange('salaryFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((frequency) => (
                      <SelectItem key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Supplemental Pay</h2>
          <p className="text-sm text-gray-500">Select all that apply</p>
          
          <div className="grid gap-2 md:grid-cols-3">
            {supplementalPayOptions.map((pay) => (
              <div key={pay.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`pay-${pay.id}`}
                  checked={formData.supplementalPay.includes(pay.id)}
                  onCheckedChange={(checked) => 
                    handleSupplementalPayChange(pay.id, !!checked)
                  }
                />
                <Label htmlFor={`pay-${pay.id}`}>{pay.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Benefits</h2>
          <p className="text-sm text-gray-500">Select all that apply</p>
          
          <div className="grid gap-2 md:grid-cols-3">
            {benefitsOptions.map((benefit) => (
              <div key={benefit.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`benefit-${benefit.id}`}
                  checked={formData.benefits.includes(benefit.id)}
                  onCheckedChange={(checked) => 
                    handleBenefitChange(benefit.id, !!checked)
                  }
                />
                <Label htmlFor={`benefit-${benefit.id}`}>{benefit.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <JobFormFooter />
      </form>
    </FormStepGuard>
  );
} 