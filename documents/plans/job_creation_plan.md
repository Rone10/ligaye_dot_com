# Job Creation Implementation Plan

## Overview

This document outlines the detailed implementation plan for the multi-step job creation flow, based on the Indeed.com model and adapted for our database schema. The plan excludes rich editor templates and AI enhancement features, which will be implemented later.

## Architecture

### State Management

```typescript
// Job creation state interface
interface JobCreationState {
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
```

### React Context Structure

```typescript
import { createContext, useReducer, useContext, ReactNode } from 'react';

const JobFormContext = createContext<{
  state: JobCreationState;
  dispatch: React.Dispatch<JobFormAction>;
} | null>(null);

type JobFormAction =
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

// Reducer implementation and provider component
```

### Form Persistence Strategy

```typescript
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
```

## File Structure

```
app/
├── employer/
│   └── jobs/
│       ├── new/
│       │   ├── page.tsx             # Entry point/redirects to step 1
│       │   ├── components/          # Shared components
│       │   │   ├── JobFormProvider.tsx
│       │   │   ├── JobFormFooter.tsx
│       │   │   ├── StepIndicator.tsx
│       │   │   └── SaveDraftButton.tsx
│       │   ├── basics/              # Step 1
│       │   │   ├── page.tsx
│       │   │   └── components/
│       │   ├── details/             # Step 2
│       │   │   ├── page.tsx
│       │   │   └── components/
│       │   ├── compensation/        # Step 3
│       │   │   ├── page.tsx
│       │   │   └── components/
│       │   ├── description/         # Step 4
│       │   │   ├── page.tsx
│       │   │   └── components/
│       │   ├── review/              # Step 5
│       │   │   ├── page.tsx
│       │   │   └── components/
│       │   └── confirmation/        # Step 6
│       │       ├── page.tsx
│       │       └── components/
│       └── layout.tsx              # Shared layout for job creation flow
```

## Component Breakdown

### Step 1: Job Basics

**Components:**
- `JobTitleInput` - For entering job title with suggestions
- `OpeningsInput` - Number input for openings
- `LanguageSelector` - Dropdown for job posting language
- `LocationSelector` - Autocomplete with geocoding
- `AddressVisibilityToggle` - Toggle for displaying address
- `LanguageRequirementsCheckboxes` - Multi-select for languages

**Validation:**
```typescript
const validateBasics = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.trim()) errors.title = 'Job title is required';
  if (!data.locationId && !data.newLocation?.city) errors.location = 'Location is required';
  if (!data.jobLanguage) errors.jobLanguage = 'Job posting language is required';
  
  return errors;
};
```

### Step 2: Job Details

**Components:**
- `JobTypeSelector` - Multi-select with checkboxes
- `WorkLocationSelector` - Radio buttons for options
- `ExpectedHoursInput` - Number input with type selector
- `ContractDetailsInputs` - Conditional fields for contract details
- `ScheduleSelector` - Multi-select with checkboxes
- `StartDateInput` - Date picker with toggle

**Validation:**
```typescript
const validateDetails = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.jobType?.length) errors.jobType = 'At least one job type is required';
  if (!data.workLocation) errors.workLocation = 'Work location type is required';
  
  if (data.jobType?.includes('FIXED_TERM_CONTRACT')) {
    if (!data.contractLength) errors.contractLength = 'Contract length is required';
    if (!data.contractPeriod) errors.contractPeriod = 'Contract period is required';
  }
  
  return errors;
};
```

### Step 3: Pay and Benefits

**Components:**
- `SalaryDisplayTypeSelector` - Radio buttons for display options
- `SalaryRangeInputs` - Dynamic inputs based on display type
- `CurrencySelector` - Dropdown for currencies
- `FrequencySelector` - Dropdown for payment frequency
- `SupplementalPaySelector` - Multi-select checkboxes
- `BenefitsSelector` - Multi-select checkboxes

**Validation:**
```typescript
const validateCompensation = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.salaryDisplayType) errors.salaryDisplayType = 'Salary display type is required';
  if (!data.salaryCurrency) errors.salaryCurrency = 'Currency is required';
  if (!data.salaryFrequency) errors.salaryFrequency = 'Pay frequency is required';
  
  if (data.salaryDisplayType === 'RANGE') {
    if (!data.salaryRangeMin) errors.salaryRangeMin = 'Minimum salary is required';
    if (!data.salaryRangeMax) errors.salaryRangeMax = 'Maximum salary is required';
    if (data.salaryRangeMin && data.salaryRangeMax && 
        data.salaryRangeMin > data.salaryRangeMax) {
      errors.salaryRangeMax = 'Maximum salary must be greater than minimum';
    }
  } else if (data.salaryDisplayType === 'STARTING_FROM' || data.salaryDisplayType === 'EXACT') {
    if (!data.salaryRangeMin) errors.salaryRangeMin = 'Salary amount is required';
  }
  
  return errors;
};
```

### Step 4: Job Description

**Components:**
- `DescriptionEditor` - Basic rich text editor (without templates/AI)
- `ExperienceLevelSelector` - Dropdown for experience level
- `EducationRequirementsInput` - Text input with suggestions
- `ExperienceRequirementsInput` - Text input with suggestions
- `SkillsSelector` - Multi-select with autocomplete
- `IndustriesSelector` - Multi-select with autocomplete

**Validation:**
```typescript
const validateDescription = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.description?.trim()) errors.description = 'Job description is required';
  if (!data.skillIds?.length) errors.skillIds = 'At least one skill is required';
  
  return errors;
};
```

### Step 5: Review and Preferences

**Components:**
- `JobPreview` - Read-only view of job posting
- `ApplicationMethodSelector` - Radio buttons for methods
- `ApplicationInstructionsInput` - Text area for instructions
- `ResumeRequiredToggle` - Toggle switch
- `CandidateContactToggle` - Toggle switch
- `ApplicationDeadlineInput` - Date picker with toggle

**Validation:**
```typescript
const validatePreferences = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.applicationMethod) errors.applicationMethod = 'Application method is required';
  
  if (data.applicationMethod === 'EMAIL' && !data.applicationInstructions) {
    errors.applicationInstructions = 'Email address is required';
  }
  
  if (data.applicationMethod === 'WEBSITE' && !data.applicationInstructions) {
    errors.applicationInstructions = 'Application URL is required';
  }
  
  return errors;
};
```

### Step 6: Confirmation

**Components:**
- `SubmissionSummary` - Job posting summary
- `TermsAgreement` - Checkbox for terms
- `SubmitButton` - Button with loading state
- `SuccessMessage` - Success confirmation with next steps

## Navigation and Routing

### Client-Side Navigation Logic

```typescript
// In JobFormFooter component
const handleNext = async () => {
  const validators = {
    1: validateBasics,
    2: validateDetails,
    3: validateCompensation,
    4: validateDescription,
    5: validatePreferences
  };
  
  const currentValidator = validators[state.step as keyof typeof validators];
  if (currentValidator) {
    const errors = currentValidator(state.formData);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }
  }
  
  if (state.step === 5) {
    // Submit the form
    await handleSubmit();
  } else {
    dispatch({ type: 'NEXT_STEP' });
    router.push(`/employer/jobs/new/${getStepPath(state.step + 1)}`);
  }
};

const handleBack = () => {
  dispatch({ type: 'PREV_STEP' });
  router.push(`/employer/jobs/new/${getStepPath(state.step - 1)}`);
};

const getStepPath = (step: number) => {
  const paths = {
    1: 'basics',
    2: 'details',
    3: 'compensation',
    4: 'description',
    5: 'review',
    6: 'confirmation'
  };
  return paths[step as keyof typeof paths];
};
```

### Server-Side Route Protection

```typescript
// In each step's page.tsx
export default function JobDetailsPage() {
  // ...

  return (
    <JobFormProvider>
      <FormStepGuard requiredStep={2}>
        <JobDetailsForm />
      </FormStepGuard>
    </JobFormProvider>
  );
}

// FormStepGuard component
const FormStepGuard = ({ children, requiredStep }) => {
  const { state } = useJobForm();
  const router = useRouter();
  
  useEffect(() => {
    // If form data is missing, redirect to step 1
    if (!state.formData.title && requiredStep > 1) {
      router.replace('/employer/jobs/new/basics');
    }
  }, [state, router, requiredStep]);
  
  if (!state.formData.title && requiredStep > 1) {
    return <LoadingSpinner />;
  }
  
  return <>{children}</>;
};
```

## Data Flow

### API Endpoints

```typescript
// Server action for job submission
'use server'

export async function createJob(formData: JobCreationState['formData']) {
  try {
    // Validate the form data
    const errors = validateAllSteps(formData);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }
    
    // Handle location creation or selection
    let locationId = formData.locationId;
    if (!locationId && formData.newLocation) {
      const location = await createLocation(formData.newLocation);
      locationId = location.id;
    }
    
    // Create the job
    const job = await db.insert(jobs).values({
      title: formData.title,
      numberOfOpenings: formData.numberOfOpenings,
      locationId,
      jobLanguage: formData.jobLanguage,
      displayAddress: formData.displayAddress,
      languageRequirements: formData.languageRequirements,
      languageTrainingProvided: formData.languageTrainingProvided,
      jobType: formData.jobType,
      workLocation: formData.workLocation,
      expectedHours: formData.expectedHours,
      hoursType: formData.hoursType,
      contractLength: formData.contractLength,
      contractPeriod: formData.contractPeriod,
      schedule: formData.schedule,
      plannedStartDate: formData.plannedStartDate,
      salaryRangeMin: formData.salaryRangeMin,
      salaryRangeMax: formData.salaryRangeMax,
      salaryCurrency: formData.salaryCurrency,
      salaryFrequency: formData.salaryFrequency,
      salaryDisplayType: formData.salaryDisplayType,
      supplementalPay: formData.supplementalPay,
      benefits: formData.benefits,
      description: formData.description,
      experienceLevel: formData.experienceLevel,
      educationRequirements: formData.educationRequirements,
      experienceRequirements: formData.experienceRequirements,
      applicationMethod: formData.applicationMethod,
      applicationInstructions: formData.applicationInstructions,
      resumeRequired: formData.resumeRequired,
      allowCandidateContact: formData.allowCandidateContact,
      applicationDeadline: formData.applicationDeadline,
      employerId: auth.userId,
      // Set other fields with defaults or derived values
    }).returning({ id: jobs.id });
    
    // Create skill relationships
    if (formData.skillIds?.length) {
      await Promise.all(formData.skillIds.map(skillId => 
        db.insert(jobSkills).values({
          jobId: job[0].id,
          skillId
        })
      ));
    }
    
    // Create industry relationships
    if (formData.industryIds?.length) {
      await Promise.all(formData.industryIds.map(industryId => 
        db.insert(jobIndustries).values({
          jobId: job[0].id,
          industryId
        })
      ));
    }
    
    // Clear form data from localStorage
    clearJobFormData();
    
    return { success: true, jobId: job[0].id };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: 'Failed to create job' };
  }
}
```

### Helper Functions for Location Handling

```typescript
async function geocodeAddress(address: string) {
  // Implementation using a geocoding service API
  // Returns location data including coordinates
}

async function createLocation(locationData: JobCreationState['formData']['newLocation']) {
  // Implementation to create a new location record
  return await db.insert(locations).values({
    streetAddress: locationData.streetAddress,
    city: locationData.city,
    town: locationData.town,
    region: locationData.region,
    country: locationData.country,
    latitude: locationData.latitude,
    longitude: locationData.longitude
  }).returning();
}
```

## Validation Strategy

```typescript
// Centralized validation for all steps
function validateAllSteps(data: Partial<JobCreationState['formData']>) {
  const errors = {
    ...validateBasics(data),
    ...validateDetails(data),
    ...validateCompensation(data),
    ...validateDescription(data),
    ...validatePreferences(data)
  };
  
  return errors;
}

// Custom input component with validation
function FormField({ 
  name, 
  label, 
  error,
  ...props 
}: {
  name: string;
  label: string;
  error?: string;
  [key: string]: any;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...props} className={error ? 'error' : ''} />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
```

## Draft Management

```typescript
// Save draft function
const saveDraft = async () => {
  try {
    const { data, error } = await supabase
      .from('job_drafts')
      .upsert({
        employer_id: user.id,
        form_data: state.formData,
        last_completed_step: state.step,
        updated_at: new Date()
      });
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { success: false, error };
  }
};

// Load draft function
const loadDraft = async (draftId: string) => {
  try {
    const { data, error } = await supabase
      .from('job_drafts')
      .select('*')
      .eq('id', draftId)
      .single();
      
    if (error) throw error;
    
    dispatch({ type: 'LOAD_SAVED_DATA', data: data.form_data });
    dispatch({ type: 'SET_STEP', step: data.last_completed_step });
    router.push(`/employer/jobs/new/${getStepPath(data.last_completed_step)}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error loading draft:', error);
    return { success: false, error };
  }
};
```

## UI Components Implementation

### Common Form Controls

```typescript
// Example implementation of reusable job form components

// Multi-select checkbox component
const CheckboxGroup = ({ 
  options, 
  selectedValues, 
  onChange,
  name,
  error
}: {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  name: string;
  error?: string;
}) => {
  const handleChange = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };
  
  return (
    <div className="checkbox-group">
      {options.map(option => (
        <div key={option.value} className="checkbox-item">
          <input
            type="checkbox"
            id={`${name}-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onChange={() => handleChange(option.value)}
          />
          <label htmlFor={`${name}-${option.value}`}>{option.label}</label>
        </div>
      ))}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

// Date picker with toggle
const ToggleableDatePicker = ({
  label,
  toggleLabel,
  date,
  onChange,
  onToggle,
  enabled,
  name,
  error
}: {
  label: string;
  toggleLabel: string;
  date?: Date;
  onChange: (date: Date | undefined) => void;
  onToggle: (enabled: boolean) => void;
  enabled: boolean;
  name: string;
  error?: string;
}) => {
  return (
    <div className="toggleable-date-picker">
      <div className="toggle-container">
        <input
          type="checkbox"
          id={`toggle-${name}`}
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
        />
        <label htmlFor={`toggle-${name}`}>{toggleLabel}</label>
      </div>
      
      {enabled && (
        <div className="date-picker-container">
          <label htmlFor={name}>{label}</label>
          <input
            type="date"
            id={name}
            name={name}
            value={date ? date.toISOString().split('T')[0] : ''}
            onChange={e => onChange(e.target.value ? new Date(e.target.value) : undefined)}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};
```

## UI/UX Considerations

### Mobile-Responsive Design

```typescript
// Example responsive component
const ResponsiveJobTypeSelector = ({ 
  jobTypes, 
  selectedTypes, 
  onChange,
  error
}: {
  jobTypes: { value: string; label: string }[];
  selectedTypes: string[];
  onChange: (values: string[]) => void;
  error?: string;
}) => {
  return (
    <div className="job-type-selector">
      <h3>Job type</h3>
      <p>Select all that apply</p>
      
      {/* Mobile view (stacked) */}
      <div className="md:hidden">
        <CheckboxGroup
          options={jobTypes}
          selectedValues={selectedTypes}
          onChange={onChange}
          name="jobType"
          error={error}
        />
      </div>
      
      {/* Desktop view (grid) */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        {jobTypes.map(type => (
          <div key={type.value} className="checkbox-item">
            <input
              type="checkbox"
              id={`jobType-${type.value}`}
              checked={selectedTypes.includes(type.value)}
              onChange={() => {
                const newValues = selectedTypes.includes(type.value)
                  ? selectedTypes.filter(v => v !== type.value)
                  : [...selectedTypes, type.value];
                onChange(newValues);
              }}
            />
            <label htmlFor={`jobType-${type.value}`}>{type.label}</label>
          </div>
        ))}
      </div>
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
```

### Loading States and Transitions

```typescript
// Loading state component with Framer Motion transitions
import { motion } from 'framer-motion';

const LoadingSubmit = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="loading-container"
    >
      <div className="spinner"></div>
      <p>Submitting your job posting...</p>
    </motion.div>
  );
};

// Step transitions
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const StepContainer = ({ children, step }: { children: ReactNode; step: number }) => {
  return (
    <motion.div
      key={step}
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

## Testing Strategy

```typescript
// Example test cases for each step
describe('Job Basics Step', () => {
  it('validates required fields', () => {
    const errors = validateBasics({});
    expect(errors.title).toBeDefined();
    expect(errors.location).toBeDefined();
  });
  
  it('allows valid data to pass', () => {
    const validData = {
      title: 'Software Engineer',
      jobLanguage: 'English',
      newLocation: { city: 'Banjul', country: 'GAMBIA' }
    };
    const errors = validateBasics(validData);
    expect(Object.keys(errors).length).toBe(0);
  });
});

// Integration test for form flow
describe('Job Form Flow', () => {
  it('navigates through steps properly', async () => {
    // Test implementation
  });
  
  it('persists data between steps', async () => {
    // Test implementation
  });
  
  it('submits complete data successfully', async () => {
    // Test implementation
  });
});
```

## Performance Considerations

1. **Code Splitting**: Implement dynamic imports for each step to reduce initial load time
2. **Optimistic UI**: Update UI optimistically for better perceived performance
3. **Selective Re-rendering**: Use React.memo and useCallback to prevent unnecessary renders
4. **Form Field Memoization**: Optimize heavy form fields with memoization
5. **Debounced Validation**: Implement debounced validation for better user experience

## Accessibility Considerations

1. **Keyboard Navigation**: Ensure all form controls are keyboard accessible
2. **ARIA Attributes**: Add proper ARIA roles and labels
3. **Focus Management**: Implement proper focus management between steps
4. **Error Announcements**: Use aria-live regions for error announcements
5. **Contrast Ratios**: Ensure sufficient color contrast for all UI elements

## Deployment Plan

1. **Feature Flagging**: Implement feature flags to gradually roll out the new job creation flow
2. **A/B Testing**: Setup A/B testing to compare completion rates with old flow
3. **Analytics Integration**: Add analytics to track form completion rates
4. **Error Monitoring**: Implement error tracking for production issues
5. **User Feedback Collection**: Add mechanisms to collect user feedback

## Extension Points

1. **Resume Parser Integration**: Add integration points for resume parsing
2. **Draft Management**: Implement comprehensive draft management system
3. **Job Template Creation**: Add ability to create and use job templates
4. **Company Profile Integration**: Pull company details from profile
5. **Integration with Recommendation System**: Connect to job recommendation engine
