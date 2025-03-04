'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "../../basics/components/FormField";

// Experience level options
const experienceLevels = [
  { value: 'ENTRY_LEVEL', label: 'Entry level (0-1 years)' },
  { value: 'JUNIOR', label: 'Junior (1-3 years)' },
  { value: 'MID_LEVEL', label: 'Mid-level (3-5 years)' },
  { value: 'SENIOR', label: 'Senior (5+ years)' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'NOT_SPECIFIED', label: 'Not specified' },
];

// Education level options
const educationLevels = [
  { value: 'NONE', label: 'No formal education required' },
  { value: 'PRIMARY', label: 'Primary education' },
  { value: 'SECONDARY', label: 'Secondary education' },
  { value: 'VOCATIONAL', label: 'Vocational training' },
  { value: 'BACHELORS', label: 'Bachelor\'s degree' },
  { value: 'MASTERS', label: 'Master\'s degree' },
  { value: 'DOCTORATE', label: 'Doctorate degree' },
  { value: 'CERTIFICATION', label: 'Professional certification' },
  { value: 'NOT_SPECIFIED', label: 'Not specified' },
];

export function DescriptionForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  return (
    <FormStepGuard requiredStep={4}>
      <form className="space-y-8">
        <FormField 
          label="Job Description" 
          error={errors.description}
          required
          description="Provide a detailed description of job responsibilities, day-to-day activities, and the team structure"
        >
          <Textarea
            id="description"
            placeholder="Describe the position in detail..."
            className="h-48"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField 
            label="Experience Level" 
            error={errors.experienceLevel}
            description="The overall experience level required for this role"
          >
            <Select 
              value={formData.experienceLevel || ''} 
              onValueChange={(value) => handleFieldChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField 
            label="Education Requirements" 
            error={errors.educationRequirements}
            description="The minimum education level required"
          >
            <Select 
              value={formData.educationRequirements || ''} 
              onValueChange={(value) => handleFieldChange('educationRequirements', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField 
          label="Experience Requirements" 
          error={errors.experienceRequirements}
          description="Specific experience requirements or qualifications for this role"
        >
          <Textarea
            id="experienceRequirements"
            placeholder="Describe specific experience requirements..."
            className="h-32"
            value={formData.experienceRequirements || ''}
            onChange={(e) => handleFieldChange('experienceRequirements', e.target.value)}
          />
        </FormField>

        <JobFormFooter />
      </form>
    </FormStepGuard>
  );
} 