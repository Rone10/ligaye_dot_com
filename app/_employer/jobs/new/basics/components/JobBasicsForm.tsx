'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { FormField } from "./FormField";

// Languages options
const languages = [
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Wolof', label: 'Wolof' },
  { value: 'Mandinka', label: 'Mandinka' },
];

// Country options
const countries = [
  { value: 'GAMBIA', label: 'The Gambia' },
  { value: 'SENEGAL', label: 'Senegal' },
  { value: 'NIGERIA', label: 'Nigeria' },
  { value: 'GHANA', label: 'Ghana' },
  { value: 'CANADA', label: 'Canada' },
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'OTHER', label: 'Other' },
];

// Language requirements options
const languageRequirementsOptions = [
  { id: 'english', label: 'English' },
  { id: 'french', label: 'French' },
  { id: 'arabic', label: 'Arabic' },
  { id: 'wolof', label: 'Wolof' },
  { id: 'mandinka', label: 'Mandinka' },
];

export function JobBasicsForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;
  
  const [useNewLocation, setUseNewLocation] = useState(!formData.locationId);

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleLanguageRequirementChange = (language: string, checked: boolean) => {
    const updatedRequirements = checked
      ? [...formData.languageRequirements, language]
      : formData.languageRequirements.filter(lang => lang !== language);
    
    handleFieldChange('languageRequirements', updatedRequirements);
  };

  return (
    <FormStepGuard requiredStep={1}>
      <form className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Job Information</h2>
          
          <FormField
            label="Job title"
            error={errors.title}
          >
            <Input
              id="title"
              placeholder="e.g. Software Engineer, Marketing Manager, etc."
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
          </FormField>
          
          <FormField
            label="Number of openings"
            error={errors.numberOfOpenings}
          >
            <Input
              id="numberOfOpenings"
              type="number"
              min={1}
              value={formData.numberOfOpenings}
              onChange={(e) => handleFieldChange('numberOfOpenings', parseInt(e.target.value) || 1)}
            />
          </FormField>
          
          <FormField
            label="Job posting language"
            error={errors.jobLanguage}
          >
            <Select
              value={formData.jobLanguage}
              onValueChange={(value) => handleFieldChange('jobLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Job Location</h2>
          
          {useNewLocation ? (
            <>
              <FormField
                label="City"
                error={errors.location}
              >
                <Input
                  id="city"
                  placeholder="e.g. Banjul, Serrekunda"
                  value={formData.newLocation?.city || ''}
                  onChange={(e) => handleFieldChange('newLocation', {
                    ...formData.newLocation,
                    city: e.target.value
                  })}
                />
              </FormField>
              
              <FormField
                label="Town/Area"
                error={errors['newLocation.town']}
              >
                <Input
                  id="town"
                  placeholder="e.g. Bakau, Latrikunda"
                  value={formData.newLocation?.town || ''}
                  onChange={(e) => handleFieldChange('newLocation', {
                    ...formData.newLocation,
                    town: e.target.value
                  })}
                />
              </FormField>
              
              <FormField
                label="Region"
                error={errors['newLocation.region']}
              >
                <Input
                  id="region"
                  placeholder="e.g. Greater Banjul Area"
                  value={formData.newLocation?.region || ''}
                  onChange={(e) => handleFieldChange('newLocation', {
                    ...formData.newLocation,
                    region: e.target.value
                  })}
                />
              </FormField>
              
              <FormField
                label="Country"
                error={errors['newLocation.country']}
              >
                <Select
                  value={formData.newLocation?.country || ''}
                  onValueChange={(value) => handleFieldChange('newLocation', {
                    ...formData.newLocation,
                    country: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </>
          ) : (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500">Location selection from saved locations will be implemented later.</p>
              <button 
                type="button"
                className="text-sm text-primary mt-2"
                onClick={() => setUseNewLocation(true)}
              >
                Add a new location instead
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="displayAddress"
              checked={formData.displayAddress}
              onCheckedChange={(checked) => handleFieldChange('displayAddress', !!checked)}
            />
            <Label htmlFor="displayAddress">Display full address in job posting</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Language Requirements</h2>
          
          <div className="space-y-2">
            {languageRequirementsOptions.map((language) => (
              <div key={language.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language.id}`}
                  checked={formData.languageRequirements.includes(language.id)}
                  onCheckedChange={(checked) => 
                    handleLanguageRequirementChange(language.id, !!checked)
                  }
                />
                <Label htmlFor={`language-${language.id}`}>{language.label}</Label>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="languageTrainingProvided"
              checked={formData.languageTrainingProvided}
              onCheckedChange={(checked) => 
                handleFieldChange('languageTrainingProvided', !!checked)
              }
            />
            <Label htmlFor="languageTrainingProvided">Language training will be provided</Label>
          </div>
        </div>

        <JobFormFooter />
      </form>
    </FormStepGuard>
  );
} 