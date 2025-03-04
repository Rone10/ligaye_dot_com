'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useJobForm } from "./JobFormProvider";
import { SaveDraftButton } from './SaveDraftButton';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createJob } from '@/app/actions/employer/new_jobs';

// Validation functions for each step
export const validateBasics = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.trim()) errors.title = 'Job title is required';
  if (!data.locationId && !data.newLocation?.city) errors.location = 'Location is required';
  if (!data.jobLanguage) errors.jobLanguage = 'Job posting language is required';
  
  return errors;
};

export const validateDetails = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.jobType?.length) errors.jobType = 'At least one job type is required';
  if (!data.workLocation) errors.workLocation = 'Work location type is required';
  
  if (data.jobType?.includes('FIXED_TERM_CONTRACT')) {
    if (!data.contractLength) errors.contractLength = 'Contract length is required';
    if (!data.contractPeriod) errors.contractPeriod = 'Contract period is required';
  }
  
  if (data.expectedHours && (isNaN(data.expectedHours) || data.expectedHours <= 0)) {
    errors.expectedHours = 'Expected hours must be a positive number';
  }
  
  return errors;
};

export const validateCompensation = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.salaryDisplayType) errors.salaryDisplayType = 'Salary display type is required';
  if (!data.salaryCurrency) errors.salaryCurrency = 'Currency is required';
  if (!data.salaryFrequency) errors.salaryFrequency = 'Salary frequency is required';
  
  if (data.salaryDisplayType === 'RANGE') {
    if (!data.salaryRangeMin) errors.salaryRangeMin = 'Minimum salary is required';
    if (!data.salaryRangeMax) errors.salaryRangeMax = 'Maximum salary is required';
    if (Number(data.salaryRangeMin) >= Number(data.salaryRangeMax)) {
      errors.salaryRangeMax = 'Maximum salary must be greater than minimum salary';
    }
  } else if (data.salaryDisplayType === 'STARTING_FROM' && !data.salaryRangeMin) {
    errors.salaryRangeMin = 'Starting salary is required';
  } else if (data.salaryDisplayType === 'UP_TO' && !data.salaryRangeMax) {
    errors.salaryRangeMax = 'Maximum salary is required';
  }
  
  return errors;
};

export const validateDescription = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.description?.trim()) errors.description = 'Job description is required';
  if (data.description?.trim().length < 100) errors.description = 'Description should be at least 100 characters';
  
  return errors;
};

export const validatePreferences = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.applicationMethod) errors.applicationMethod = 'Application method is required';
  
  // Validate application deadline if it's set
  if (data.applicationDeadline) {
    const deadline = new Date(data.applicationDeadline);
    const now = new Date();
    
    if (deadline <= now) {
      errors.applicationDeadline = 'Application deadline must be in the future';
    }
  }
  
  return errors;
};

export function JobFormFooter() {
  const { state, dispatch } = useJobForm();
  const router = useRouter();
  const { toast } = useToast();

  const getStepPath = (step: number) => {
    switch (step) {
      case 1: return '/employer/jobs/new/basics';
      case 2: return '/employer/jobs/new/details';
      case 3: return '/employer/jobs/new/compensation';
      case 4: return '/employer/jobs/new/description';
      case 5: return '/employer/jobs/new/review';
      default: return '/employer/jobs/new/basics';
    }
  };

  const validateCurrentStep = () => {
    const { step, formData } = state;
    let errors = {};

    switch (step) {
      case 1: errors = validateBasics(formData); break;
      case 2: errors = validateDetails(formData); break;
      case 3: errors = validateCompensation(formData); break;
      case 4: errors = validateDescription(formData); break;
      case 5: errors = validatePreferences(formData); break;
      default: errors = {};
    }

    return errors;
  };

  const handleNext = async () => {
    const errors = validateCurrentStep();
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      dispatch({ type: 'SET_ERRORS', errors });
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    dispatch({ type: 'CLEAR_ERRORS' });

    // Submit the form if we're on the last step
    if (state.step === 5) {
      try {
        dispatch({ type: 'SUBMIT_START' });
        
        // Call the server action instead of making an API request
        const result = await createJob(state.formData);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to submit job');
        }
        
        dispatch({ type: 'SUBMIT_SUCCESS' });
        
        // Navigate to confirmation page
        router.push('/employer/jobs/new/confirmation');
      } catch (error) {
        console.error('Error submitting job:', error);
        dispatch({ 
          type: 'SUBMIT_ERROR', 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        });
        
        toast({
          title: 'Error',
          description: 'Failed to submit job. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Otherwise go to the next step
    dispatch({ type: 'NEXT_STEP' });
    router.push(getStepPath(state.step + 1));
  };

  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: 'PREV_STEP' });
      router.push(getStepPath(state.step - 1));
    }
  };

  return (
    <div className="flex justify-between mt-10 border-t pt-6">
      <div>
        {state.step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={state.isSubmitting}
          >
            Back
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <SaveDraftButton />
        
        <Button 
          type="button"
          onClick={handleNext}
          disabled={state.isSubmitting}
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : state.step === 5 ? (
            'Submit Job'
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  );
} 