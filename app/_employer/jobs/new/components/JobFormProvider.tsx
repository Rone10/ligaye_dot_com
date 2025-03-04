'use client';

import { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';

// Define the job creation state interface
export interface JobCreationState {
  step: number;
  formData: {
    // Job basics
    title: string;
    numberOfOpenings: number;
    jobLanguage: string;
    locationId?: string;
    newLocation?: {
      streetAddress?: string;
      city?: string;
      town?: string;
      region?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
    displayAddress: boolean;
    languageRequirements: string[];
    languageTrainingProvided: boolean;

    // Job details
    jobType: string[];
    workLocation: string;
    expectedHours?: number;
    hoursType: string;
    contractLength?: number;
    contractPeriod?: string;
    schedule?: string[];
    plannedStartDate?: Date;

    // Pay and benefits
    salaryRangeMin?: number;
    salaryRangeMax?: number;
    salaryCurrency: string;
    salaryFrequency: string;
    salaryDisplayType: string;
    supplementalPay: string[];
    benefits: string[];

    // Job description
    description: string;
    experienceLevel?: string;
    educationRequirements?: string;
    experienceRequirements?: string;

    // Skills and industries
    skillIds: string[];
    industryIds: string[];

    // Application preferences
    applicationMethod: string;
    applicationInstructions?: string;
    resumeRequired: boolean;
    allowCandidateContact: boolean;
    applicationDeadline?: Date;
  };
  errors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Define action types
export type JobFormAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'LOAD_SAVED_DATA'; data: Partial<JobCreationState['formData']> };

// Initial state
const initialState: JobCreationState = {
  step: 1,
  formData: {
    title: '',
    numberOfOpenings: 1,
    jobLanguage: 'English',
    displayAddress: true,
    languageRequirements: [],
    languageTrainingProvided: false,
    jobType: [],
    workLocation: '',
    hoursType: 'FIXED',
    schedule: [],
    salaryCurrency: 'GMD',
    salaryFrequency: '',
    salaryDisplayType: 'RANGE',
    supplementalPay: [],
    benefits: [],
    description: '',
    skillIds: [],
    industryIds: [],
    applicationMethod: '',
    resumeRequired: true,
    allowCandidateContact: true,
  },
  errors: {},
  isDirty: false,
  isSubmitting: false,
};

// Create the context
const JobFormContext = createContext<{
  state: JobCreationState;
  dispatch: React.Dispatch<JobFormAction>;
} | null>(null);

// Reducer function
function jobFormReducer(state: JobCreationState, action: JobFormAction): JobCreationState {
  switch (action.type) {
    case 'SET_FIELD': {
      const { field, value } = action;
      
      // Special handling for fields that must be arrays
      if (field === 'skillIds' || field === 'industryIds') {
        const arrayValue = Array.isArray(value) ? value : [];
        return {
          ...state,
          formData: {
            ...state.formData,
            [field]: arrayValue
          },
          isDirty: true
        };
      }
      
      return {
        ...state,
        formData: {
          ...state.formData,
          [field]: value
        },
        isDirty: true
      };
    }
    case 'NEXT_STEP': {
      return {
        ...state,
        step: state.step + 1,
      };
    }
    case 'PREV_STEP': {
      return {
        ...state,
        step: Math.max(1, state.step - 1),
      };
    }
    case 'SET_STEP': {
      return {
        ...state,
        step: action.step,
      };
    }
    case 'SET_ERRORS': {
      return {
        ...state,
        errors: action.errors,
      };
    }
    case 'CLEAR_ERRORS': {
      return {
        ...state,
        errors: {},
      };
    }
    case 'SUBMIT_START': {
      return {
        ...state,
        isSubmitting: true,
      };
    }
    case 'SUBMIT_SUCCESS': {
      return {
        ...state,
        isSubmitting: false,
        isDirty: false,
      };
    }
    case 'SUBMIT_ERROR': {
      return {
        ...state,
        isSubmitting: false,
        errors: { ...state.errors, submit: action.error },
      };
    }
    case 'LOAD_SAVED_DATA': {
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.data,
        },
      };
    }
    default:
      return state;
  }
}

// Provider component
export function JobFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobFormReducer, initialState);

  // Save to localStorage on state changes
  useEffect(() => {
    if (state.isDirty) {
      localStorage.setItem('jobFormData', JSON.stringify(state.formData));
      localStorage.setItem('jobFormStep', state.step.toString());
    }
  }, [state.formData, state.isDirty, state.step]);

  // Load from localStorage on initialization
  useEffect(() => {
    const savedData = localStorage.getItem('jobFormData');
    const savedStep = localStorage.getItem('jobFormStep');
    
    if (savedData) {
      dispatch({ type: 'LOAD_SAVED_DATA', data: JSON.parse(savedData) });
    }
    
    if (savedStep) {
      dispatch({ type: 'SET_STEP', step: parseInt(savedStep, 10) });
    }
  }, []);

  return (
    <JobFormContext.Provider value={{ state, dispatch }}>
      {children}
    </JobFormContext.Provider>
  );
}

// Custom hook for using the context
export function useJobForm() {
  const context = useContext(JobFormContext);
  
  if (!context) {
    throw new Error('useJobForm must be used within a JobFormProvider');
  }
  
  return context;
}

// Helper function to clear job form data from localStorage
export function clearJobFormData() {
  localStorage.removeItem('jobFormData');
  localStorage.removeItem('jobFormStep');
} 