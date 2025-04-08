'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// @ts-ignore - useActionState is available in React 19 but TypeScript definitions may be outdated
import { useActionState } from 'react';
import { employerProfileSchema } from '../_utils/validation';
import { updateEmployerProfileDetails } from '../_actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import CompanyDetails from './company-details';
import IndustrySelector from './industry-selector';
import LocationSelector from './location-selector';
import LogoUpload from './logo-upload';
import { Industry, Location } from '@/lib/db/schema';

interface EmployerProfileFormProps {
  initialData?: {
    profile: any;
    employerProfile: any;
    industry: any;
    location: any;
  };
  industries: Industry[];
  locations: Location[];
}

// Define tab order
const tabOrder: string[] = ['details', 'industry', 'location', 'logo'];

// Initial state for form submission
const initialState = {
  success: false,
  message: undefined
};

export default function EmployerProfileForm({ 
  initialData, 
  industries,
  locations 
}: EmployerProfileFormProps) {
  const [activeTab, setActiveTab] = useState(tabOrder[0]); // Use tabOrder for initial state
  
  // Use useActionState to track server action state
  const [state, formAction] = useActionState(updateEmployerProfileDetails, initialState);

  const form = useForm({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: initialData?.employerProfile?.companyName || '',
      companySize: initialData?.employerProfile?.companySize || '',
      industryId: initialData?.employerProfile?.industryId || null,
      companyDescription: initialData?.employerProfile?.companyDescription || '',
      website: initialData?.employerProfile?.website || '',
      locationId: initialData?.employerProfile?.locationId || null,
      hqAddressDisplay: initialData?.employerProfile?.hqAddressDisplay || '',
    },
  });

  const currentTabIndex = tabOrder.indexOf(activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabOrder.length - 1;

  function goToNextTab() {
    if (!isLastTab) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
    }
  }

  function goToPreviousTab() {
    if (!isFirstTab) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form action={(formData) => {
          // Debug log the form data
          console.log('Form data before submission:', Object.fromEntries(formData.entries()));
          
          // Get all current form values
          const currentValues = form.getValues();
          
          // Ensure all form values are included regardless of which tab is active
          const formFields = [
            'companyName', 
            'companySize', 
            'industryId', 
            'companyDescription', 
            'website', 
            'locationId', 
            'hqAddressDisplay'
          ];
          
          formFields.forEach(field => {
            if (!formData.get(field as keyof typeof currentValues) && currentValues[field as keyof typeof currentValues]) {
              formData.append(field as keyof typeof currentValues, currentValues[field as keyof typeof currentValues]);
            }
          });
          
          console.log('Form data after adding missing fields:', Object.fromEntries(formData.entries()));
          
          return formAction(formData);
        }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="details">Company Details</TabsTrigger>
              <TabsTrigger value="industry">Industry</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="logo">Company Logo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <CompanyDetails form={form} />
            </TabsContent>
            
            <TabsContent value="industry">
              <IndustrySelector form={form} industries={industries} />
            </TabsContent>
            
            <TabsContent value="location">
              <LocationSelector form={form} locations={locations} />
            </TabsContent>
            
            <TabsContent value="logo">
              <LogoUpload 
                currentLogoUrl={initialData?.employerProfile?.companyLogoUrl} 
                hasProfile={!!initialData?.employerProfile} 
              />
            </TabsContent>
          </Tabs>
          
          {/* Navigation and Save Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <Button 
              type="button" // Prevent form submission
              variant="outline"
              onClick={goToPreviousTab}
              disabled={isFirstTab}
              className={isFirstTab ? 'invisible' : 'bg-blue-100'} // Hide instead of just disabling for layout consistency
            >
              Previous
            </Button>
            
            <Button 
              type="button" // Prevent form submission
              variant="ghost"
              onClick={goToNextTab}
              disabled={isLastTab}
              className={isLastTab ? 'invisible' : 'bg-blue-100'} // Hide instead of just disabling for layout consistency
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 