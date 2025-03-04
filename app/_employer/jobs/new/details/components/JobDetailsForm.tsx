'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Job Type options based on enum from database
const jobTypes = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'FIXED_TERM_CONTRACT', label: 'Fixed-term contract' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

// Schedule options based on enum from database
const scheduleOptions = [
  { value: 'MONDAY_TO_FRIDAY', label: 'Monday to Friday' },
  { value: 'WEEKENDS', label: 'Weekends' },
  { value: 'EIGHT_HOUR_SHIFT', label: '8 hour shift' },
  { value: 'DAY_SHIFT', label: 'Day shift' },
  { value: 'EVENING_SHIFT', label: 'Evening shift' },
  { value: 'NIGHT_SHIFT', label: 'Night shift' },
  { value: 'MORNING_SHIFT', label: 'Morning shift' },
  { value: 'OVERTIME', label: 'Overtime' },
  { value: 'ON_CALL', label: 'On call' },
];

// Contract period options based on enum from database
const contractPeriodOptions = [
  { value: 'DAYS', label: 'Day(s)' },
  { value: 'WEEKS', label: 'Week(s)' },
  { value: 'MONTHS', label: 'Month(s)' },
  { value: 'YEARS', label: 'Year(s)' },
];

export function JobDetailsForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;
  
  const [hasStartDate, setHasStartDate] = useState(!!formData.plannedStartDate);

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleJobTypeChange = (type: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...formData.jobType, type]
      : formData.jobType.filter(t => t !== type);
    
    handleFieldChange('jobType', updatedTypes);
  };

  const handleScheduleChange = (schedule: string, checked: boolean) => {
    const updatedSchedule = checked
      ? [...(formData.schedule || []), schedule]
      : (formData.schedule || []).filter(s => s !== schedule);
    
    handleFieldChange('schedule', updatedSchedule);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    handleFieldChange('plannedStartDate', date);
  };

  return (
    <FormStepGuard requiredStep={2}>
      <form className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Job Type</h2>
          <p className="text-sm text-gray-500">Select all that apply</p>
          
          <div className="grid gap-2 md:grid-cols-3">
            {jobTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-type-${type.value}`}
                  checked={formData.jobType.includes(type.value)}
                  onCheckedChange={(checked) => 
                    handleJobTypeChange(type.value, !!checked)
                  }
                />
                <Label htmlFor={`job-type-${type.value}`}>{type.label}</Label>
              </div>
            ))}
          </div>
          
          {errors.jobType && (
            <p className="text-sm font-medium text-destructive">{errors.jobType}</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Work Location</h2>
          
          <FormField
            label="Where will the employee be working from?"
            error={errors.workLocation}
          >
            <RadioGroup
              value={formData.workLocation}
              onValueChange={(value) => handleFieldChange('workLocation', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ON_SITE" id="on-site" />
                <Label htmlFor="on-site">On-site</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HYBRID" id="hybrid" />
                <Label htmlFor="hybrid">Hybrid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REMOTE" id="remote" />
                <Label htmlFor="remote">Remote</Label>
              </div>
            </RadioGroup>
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Hours and Schedule</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Expected hours per week"
              error={errors.expectedHours}
            >
              <Input
                id="expectedHours"
                type="number"
                min={0}
                placeholder="e.g. 40"
                value={formData.expectedHours || ''}
                onChange={(e) => handleFieldChange('expectedHours', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormField>
            
            <FormField
              label="Hours type"
              error={errors.hoursType}
            >
              <Select
                value={formData.hoursType}
                onValueChange={(value) => handleFieldChange('hoursType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hours type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed hours</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible hours</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          
          {formData.jobType.includes('FIXED_TERM_CONTRACT') && (
            <div className="grid gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-md border">
              <h3 className="text-lg font-medium md:col-span-2">Contract Details</h3>
              
              <FormField
                label="Contract length"
                error={errors.contractLength}
              >
                <Input
                  id="contractLength"
                  type="number"
                  min={1}
                  placeholder="e.g. 6"
                  value={formData.contractLength || ''}
                  onChange={(e) => handleFieldChange('contractLength', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormField>
              
              <FormField
                label="Period"
                error={errors.contractPeriod}
              >
                <Select
                  value={formData.contractPeriod || ''}
                  onValueChange={(value) => handleFieldChange('contractPeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractPeriodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {scheduleOptions.map((schedule) => (
                <div key={schedule.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`schedule-${schedule.value}`}
                    checked={formData.schedule?.includes(schedule.value) || false}
                    onCheckedChange={(checked) => 
                      handleScheduleChange(schedule.value, !!checked)
                    }
                  />
                  <Label htmlFor={`schedule-${schedule.value}`}>{schedule.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Start Date</h2>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-start-date"
              checked={hasStartDate}
              onCheckedChange={(checked) => {
                setHasStartDate(!!checked);
                if (!checked) {
                  handleStartDateChange(undefined);
                }
              }}
            />
            <Label htmlFor="has-start-date">This job has a planned start date</Label>
          </div>
          
          {hasStartDate && (
            <FormField
              label="Select start date"
              error={errors.plannedStartDate}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.plannedStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedStartDate ? (
                      format(new Date(formData.plannedStartDate), "PPP")
                    ) : (
                      <span>Select a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.plannedStartDate ? new Date(formData.plannedStartDate) : undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormField>
          )}
        </div>

        <JobFormFooter />
      </form>
    </FormStepGuard>
  );
} 