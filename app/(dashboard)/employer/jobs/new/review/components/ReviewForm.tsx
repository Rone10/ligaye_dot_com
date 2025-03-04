'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { useState } from "react";
import { FormField } from "../../basics/components/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Application method options
const applicationMethods = [
  { value: 'PLATFORM', label: 'Apply through platform' },
  { value: 'EMAIL', label: 'Apply via email' },
  { value: 'WEBSITE', label: 'Apply on company website' },
  { value: 'CALL', label: 'Call to apply' },
  { value: 'IN_PERSON', label: 'Apply in person' },
];

export function ReviewForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;
  const [showDeadlineSelector, setShowDeadlineSelector] = useState(!!formData.applicationDeadline);

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  // Format the current date
  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'PPP') : 'Not specified';
  };

  return (
    <FormStepGuard requiredStep={5}>
      <div className="space-y-10">
        {/* Job Summary */}
        <section className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">Job Summary</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Title</h3>
                <p className="text-base">{formData.title || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-base">
                  {formData.locationId 
                    ? 'Selected location' 
                    : formData.newLocation?.city 
                      ? `${formData.newLocation.city}, ${formData.newLocation.country}` 
                      : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                <p className="text-base">{formData.jobType?.join(', ') || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Work Location</h3>
                <p className="text-base">{formData.workLocation || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                <p className="text-base">
                  {formData.salaryDisplayType === 'RANGE' 
                    ? `${formData.salaryCurrency} ${formData.salaryRangeMin || 0} - ${formData.salaryRangeMax || 0} per ${formData.salaryFrequency}` 
                    : formData.salaryDisplayType === 'STARTING_FROM' 
                      ? `${formData.salaryCurrency} ${formData.salaryRangeMin || 0}+ per ${formData.salaryFrequency}`
                      : formData.salaryDisplayType === 'UP_TO'
                        ? `${formData.salaryCurrency} Up to ${formData.salaryRangeMax || 0} per ${formData.salaryFrequency}`
                        : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Planned Start Date</h3>
                <p className="text-base">{formatDate(formData.plannedStartDate)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description Preview</h3>
              <p className="text-base line-clamp-3">{formData.description || 'No description provided'}</p>
            </div>
          </div>
        </section>

        {/* Application Preferences */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Application Preferences</h2>
          <form className="space-y-6">
            <FormField 
              label="Application Method" 
              error={errors.applicationMethod}
              required
              description="How candidates should apply for this job"
            >
              <Select 
                value={formData.applicationMethod || ''} 
                onValueChange={(value) => handleFieldChange('applicationMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application method" />
                </SelectTrigger>
                <SelectContent>
                  {applicationMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField 
              label="Application Instructions" 
              error={errors.applicationInstructions}
              description="Provide any specific instructions for applicants"
            >
              <Textarea
                id="applicationInstructions"
                placeholder="Provide any specific instructions for applicants..."
                value={formData.applicationInstructions || ''}
                onChange={(e) => handleFieldChange('applicationInstructions', e.target.value)}
                className="h-24"
              />
            </FormField>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="resumeRequired"
                  checked={formData.resumeRequired} 
                  onCheckedChange={(checked) => 
                    handleFieldChange('resumeRequired', checked === true)
                  }
                />
                <Label htmlFor="resumeRequired">Resume/CV required for application</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allowCandidateContact"
                  checked={formData.allowCandidateContact} 
                  onCheckedChange={(checked) => 
                    handleFieldChange('allowCandidateContact', checked === true)
                  }
                />
                <Label htmlFor="allowCandidateContact">Allow candidates to contact you with questions</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showDeadline"
                  checked={showDeadlineSelector} 
                  onCheckedChange={(checked) => {
                    setShowDeadlineSelector(checked === true);
                    if (checked === false) {
                      handleFieldChange('applicationDeadline', undefined);
                    }
                  }}
                />
                <Label htmlFor="showDeadline">Set application deadline</Label>
              </div>
              
              {showDeadlineSelector && (
                <div className="ml-6 mt-2">
                  <FormField 
                    label="Application Deadline" 
                    error={errors.applicationDeadline}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.applicationDeadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.applicationDeadline ? (
                            format(formData.applicationDeadline, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.applicationDeadline}
                          onSelect={(date) => handleFieldChange('applicationDeadline', date)}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormField>
                </div>
              )}
            </div>
          </form>
        </section>

        <JobFormFooter />
      </div>
    </FormStepGuard>
  );
} 