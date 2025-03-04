# Job Creation Flow Implementation Guide for Cursor IDE

## Overview

This guide outlines how to implement a job posting flow similar to Indeed.com using your existing database schema with the recommended enhancements. I'll break down each step of the flow, match it to your database fields, and provide implementation guidance.

## Flow Architecture

The job creation process should be implemented as a multi-step form with state management:

```typescript
// Job creation state interface
interface JobCreationState {
  step: number;
  formData: NewJob & {
    // Additional fields for form state that aren't in the final job record
    skillIds: string[];
    industryIds: string[];
    // Any other temporary form state
  };
}
```

## Step 1: Job Basics

### UI Components
- Page title: "Add job basics"
- Language and location selector 
- Company information (pre-filled from employer profile)
- Job title input
- Number of openings input
- Location type selector and address fields
- Language requirements checkboxes

### Database Fields
```typescript
// Main job fields
jobs.title
jobs.numberOfOpenings
jobs.jobLanguage
jobs.locationId
jobs.displayAddress
jobs.languageRequirements
jobs.languageTrainingProvided

// Location fields (create new or select existing)
locations.city
locations.town
locations.region
locations.country
```

### Implementation Notes
```typescript
// In your Cursor IDE, implement this step with:

// 1. Form validation
const validateJobBasics = (data: Partial<JobCreationState['formData']>) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.trim()) errors.title = 'Job title is required';
  if (!data.locationId && !data.newLocation) errors.location = 'Location is required';
  
  return errors;
};

// 2. Location handling
const handleLocationSelection = async (address: string) => {
  // Use geocoding service to parse address
  const geocodingResult = await geocodeAddress(address);
  
  // Create location object
  const newLocation = {
    city: geocodingResult.city,
    town: geocodingResult.town,
    region: geocodingResult.region,
    country: geocodingResult.country,
    latitude: geocodingResult.latitude,
    longitude: geocodingResult.longitude,
    // Other fields...
  };
  
  return newLocation;
};
```

## Step 2: Job Details

### UI Components
- Page title: "Add job details"
- Job type multi-select (Full-time, Part-time, etc.)
- Expected hours input with format selector
- Contract length inputs (for fixed-term contracts)
- Work schedule selector with multiple options
- Start date picker with yes/no toggle

### Database Fields
```typescript
jobs.jobType
jobs.workLocation
jobs.expectedHours
jobs.hoursType
jobs.contractLength
jobs.contractPeriod
jobs.schedule
jobs.plannedStartDate
```

### Implementation Notes
```typescript
// Dynamic field rendering based on job type selection
const renderContractFields = (selectedTypes: string[]) => {
  if (selectedTypes.includes('FIXED_TERM_CONTRACT')) {
    return (
      <div className="contract-fields">
        <h3>How long is the contract?</h3>
        <div className="flex gap-4">
          <TextField 
            label="Length" 
            name="contractLength" 
            type="number"
          />
          <SelectField 
            label="Period" 
            name="contractPeriod"
            options={[
              { value: 'DAYS', label: 'day(s)' },
              { value: 'WEEKS', label: 'week(s)' },
              { value: 'MONTHS', label: 'month(s)' },
              // etc.
            ]}
          />
        </div>
      </div>
    );
  }
  return null;
};
```

## Step 3: Pay and Benefits

### UI Components
- Page title: "Add pay and benefits"
- Salary display format selector (range, fixed, etc.)
- Minimum and maximum salary inputs with currency selector
- Pay frequency selector
- Supplemental pay options (overtime, bonuses, etc.)
- Benefits selection with expandable list
- Benefits comparison tool

### Database Fields
```typescript
jobs.salaryRangeMin
jobs.salaryRangeMax
jobs.salaryCurrency
jobs.salaryFrequency
jobs.salaryDisplayType
jobs.supplementalPay
jobs.benefits
```

### Implementation Notes
```typescript
// Implementing the salary range fields
const SalaryRangeInput = ({ formData, onChange }) => {
  const handleSalaryChange = (field: string, value: string) => {
    // Parse numeric value
    const numValue = value ? parseInt(value, 10) : undefined;
    onChange({ ...formData, [field]: numValue });
  };

  return (
    <div className="salary-fields">
      <div className="flex items-center gap-4">
        <SelectField
          label="Show pay by"
          name="salaryDisplayType"
          options={[
            { value: 'RANGE', label: 'Range' },
            { value: 'STARTING_FROM', label: 'Starting from' },
            { value: 'EXACT', label: 'Exact amount' },
          ]}
        />
        
        <div className="currency-inputs flex gap-4">
          <TextField
            label="Minimum"
            name="salaryRangeMin"
            type="number"
            prefix={formData.salaryCurrency || 'GMD'}
            onChange={(e) => handleSalaryChange('salaryRangeMin', e.target.value)}
          />
          
          {formData.salaryDisplayType === 'RANGE' && (
            <TextField
              label="Maximum"
              name="salaryRangeMax"
              type="number"
              prefix={formData.salaryCurrency || 'GMD'}
              onChange={(e) => handleSalaryChange('salaryRangeMax', e.target.value)}
            />
          )}
          
          <SelectField
            label="Rate"
            name="salaryFrequency"
            options={[
              { value: 'HOUR', label: 'per hour' },
              { value: 'DAY', label: 'per day' },
              { value: 'WEEK', label: 'per week' },
              { value: 'MONTH', label: 'per month' },
              { value: 'YEAR', label: 'per year' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
```

## Step 4: Job Description

### UI Components
- Page title: "Describe the job"
- Rich text editor for job description
- Sections for:
  - Job summary
  - Responsibilities
  - Requirements

### Database Fields
```typescript
jobs.description  // Stores the formatted HTML content
jobs.experienceLevel
jobs.educationRequirements
jobs.experienceRequirements
jobs.skillsRequired  // Or linked via jobSkills
```

### Implementation Notes
```typescript
// Rich text editor implementation
import { Editor } from 'use tip tap editor';

const JobDescriptionEditor = ({ value, onChange }) => {
  // Optional: Implement AI suggestion feature
  const handleAIEnhance = async () => {
    const aiSuggestion = await fetchAIJobDescription({
      jobTitle: formData.title,
      industry: selectedIndustry,
      experienceLevel: formData.experienceLevel,
    });
    
    onChange(aiSuggestion);
  };
  
  return (
    <div className="description-editor">
      <div className="toolbar">
        <button 
          type="button" 
          className="ai-enhance-btn"
          onClick={handleAIEnhance}
        >
          Try AI Enhance
        </button>
        {/* Other formatting controls */}
      </div>
      
      <Editor
        value={value}
        onChange={onChange}
        placeholder="Describe the job responsibilities, requirements, and company culture..."
      />
      
 
    </div>
  );
};
```

## Step 5: Review and Preferences

### UI Components
- Page title: "Review" and "Set preferences"
- Complete job listing preview
- Application settings:
  - Email for notifications
  - Resume requirement toggle
  - Allow candidate contact toggle
  - Application deadline toggle and date picker

### Database Fields
```typescript
jobs.applicationMethod
jobs.resumeRequired
jobs.allowCandidateContact
jobs.applicationDeadline
```

### Implementation Notes
```typescript
// Job preview modal
const JobPreviewModal = ({ job, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Job post preview</h2>
          <p>The live post people view may look slightly different.</p>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="job-preview">
          <h1>{job.title}</h1>
          <h2>{job.companyName} – {job.location}</h2>
          
          <button className="apply-btn">Apply Now</button>
          
          <div className="job-summary">
            <h3>Job Summary</h3>
            <div dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>
          
          {/* Display all job details in preview format */}
        </div>
        
        <button onClick={onClose}>Close preview</button>
      </div>
    </div>
  );
};
```

## Step 6: Confirmation and Submission

### UI Components
- Confirmation dialog with terms acceptance
- Submit button with loading state
- Success confirmation

### Database Operations
```typescript
// Multiple database operations:
1. Create or update location record
2. Create main job record
3. Create job_skills relations
4. Create job_industries relations
```

### Implementation Notes
```typescript
// Submit job posting
const submitJobPosting = async (formData: JobCreationState['formData']) => {
  try {
    // Start transaction
    const { data, error } = await supabase.rpc('create_job_posting', {
      job_data: {
        title: formData.title,
        description: formData.description,
        // Map all form fields to the job record structure
        
        // Handle many-to-many relationships
        skills: formData.skillIds,
        industries: formData.industryIds,
        
        // Handle location
        location: formData.newLocation ? formData.newLocation : { id: formData.locationId }
      }
    });
    
    if (error) throw error;
    
    // Handle success
    return { success: true, jobId: data.id };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error };
  }
};
```

## Backend Implementation (Stored Procedure)

Create a stored procedure to handle the entire job creation process in a transaction:

```sql
CREATE OR REPLACE FUNCTION create_job_posting(job_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_location_id UUID;
  v_skill_id UUID;
  v_industry_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- Handle location creation if needed
    IF job_data->>'newLocation' IS NOT NULL THEN
      INSERT INTO locations (
        street_address,
        town,
        region,
        country,
        latitude,
        longitude,
        -- other fields
      )
      VALUES (
        job_data->'newLocation'->>'streetAddress',
        job_data->'newLocation'->>'town',
        job_data->'newLocation'->>'region',
        job_data->'newLocation'->>'country',
        (job_data->'newLocation'->>'latitude')::text,
        (job_data->'newLocation'->>'longitude')::text
        -- other fields
      )
      RETURNING id INTO v_location_id;
    ELSE
      v_location_id := (job_data->>'locationId')::UUID;
    END IF;
    
    -- Create the job record
    INSERT INTO jobs (
      title,
      employer_id,
      company_id,
      location_id,
      description,
      -- Map all fields
    )
    VALUES (
      job_data->>'title',
      auth.uid(), -- Current user
      job_data->>'companyId',
      v_location_id,
      job_data->>'description'
      -- All other fields
    )
    RETURNING id INTO v_job_id;
    
    -- Create skill relationships
    FOR v_skill_id IN SELECT value FROM jsonb_array_elements_text(job_data->'skills')
    LOOP
      INSERT INTO job_skills (job_id, skill_id)
      VALUES (v_job_id, v_skill_id::UUID);
    END LOOP;
    
    -- Create industry relationships
    FOR v_industry_id IN SELECT value FROM jsonb_array_elements_text(job_data->'industries')
    LOOP
      INSERT INTO job_industries (job_id, industry_id)
      VALUES (v_job_id, v_industry_id::UUID);
    END LOOP;
    
    RETURN v_job_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;
```

## Next Steps and Additional Features

1. **Front-end route structure**:
   ```
   /employer/jobs/new
   /employer/jobs/new/basics
   /employer/jobs/new/details
   /employer/jobs/new/compensation
   /employer/jobs/new/description
   /employer/jobs/new/review
   /employer/jobs/new/confirmation
   ```

2. **Form state persistence**:
   - Use local storage to prevent data loss during the flow
   - Implement auto-save between steps

3. **Validation rules**:
   - Validate each step before allowing progression
   - Implement field-level validation with clear error messages

4. **Advanced features**:
   - Draft saving functionality
   - Job template creation from existing jobs
   - Bulk job creation tools
   - Integration with company career page

This implementation guide provides a comprehensive roadmap for recreating Indeed's job posting flow with your existing database schema. Each step is carefully mapped to your data model, with consideration for both frontend UX and backend data integrity.
