'use client';

import { useJobForm } from "./JobFormProvider";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: 'Basics', path: 'basics' },
  { id: 2, name: 'Details', path: 'details' },
  { id: 3, name: 'Compensation', path: 'compensation' },
  { id: 4, name: 'Description', path: 'description' },
  { id: 5, name: 'Review', path: 'review' },
];

export function StepIndicator() {
  const { state } = useJobForm();
  const currentStep = state.step;

  return (
    <div className="mb-8">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li key={step.id} className={cn(
            "flex items-center",
            index < steps.length - 1 ? "w-full" : "",
          )}>
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              currentStep >= step.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-200 text-gray-600",
            )}>
              <span>{step.id}</span>
            </div>
            
            <span className={cn(
              "ml-2 text-sm font-medium hidden sm:inline-block",
              currentStep >= step.id ? "text-primary" : "text-gray-500",
            )}>
              {step.name}
            </span>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4",
                currentStep > step.id ? "bg-primary" : "bg-gray-200",
              )}></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
} 