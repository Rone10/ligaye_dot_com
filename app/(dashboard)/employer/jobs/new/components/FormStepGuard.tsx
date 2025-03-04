'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobForm } from './JobFormProvider';

interface FormStepGuardProps {
  children: React.ReactNode;
  requiredStep: number;
}

export function FormStepGuard({ children, requiredStep }: FormStepGuardProps) {
  const { state } = useJobForm();
  const router = useRouter();
  
  useEffect(() => {
    // If form data is missing, redirect to step 1
    if (requiredStep > 1 && !state.formData.title) {
      router.replace('/employer/jobs/new/basics');
    }
  }, [state, router, requiredStep]);
  
  if (requiredStep > 1 && !state.formData.title) {
    // Show a loading state while redirecting
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
} 