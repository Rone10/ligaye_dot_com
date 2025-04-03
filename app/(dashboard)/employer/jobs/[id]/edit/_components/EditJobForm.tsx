'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner'; // Using sonner for notifications
import { Loader2 } from 'lucide-react';

// TODO: Import the actual server action and types
// import { updateJobAction } from '../_actions';
// import type { JobForEditing, FormData } from '../_queries'; // Assuming types are defined there

// Placeholder types - replace with imports
type JobForEditing = any;
type FormDataProps = { locations: any[], industries: any[], skills: any[] };

// Define the Zod schema for form validation.
// This should mirror the schema in _actions.ts initially.
// TODO: Extract this to a shared `_utils/validation.ts` file within this route segment.
const editJobFormSchema = z.object({
  // Basic Info
  title: z.string().min(5, { message: 'Job title must be at least 5 characters long.' }).max(100),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long.' }),
  // ... Add all other fields from the `jobs` schema that should be editable
  // E.g., locationId, workLocation, jobType, experienceLevel, salary info, etc.
  // Ensure types match the database schema (string, number, enum, array etc.)
  locationId: z.string().uuid().optional().nullable(), // Example: Optional location selection
  // Add more fields here...
});

interface EditJobFormProps {
  job: JobForEditing;
  locations: FormDataProps['locations'];
  industries: FormDataProps['industries'];
  skills: FormDataProps['skills'];
}

export function EditJobForm({ job, locations, industries, skills }: EditJobFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof editJobFormSchema>>({
    resolver: zodResolver(editJobFormSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      locationId: job?.locationId || null,
      // ... map other `job` fields to form defaults
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof editJobFormSchema>) {
    setServerError(null);
    startTransition(async () => {
      try {
        console.log('Form submitted with values:', values);
        // Placeholder for calling the server action
        // const result = await updateJobAction(job.id, values);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate server action
        const result: { error?: string } | void = values.title.toLowerCase().includes('fail')
            ? { error: 'Simulated action failure based on title.' }
            : undefined;

        if (result?.error) {
          setServerError(result.error);
          toast.error('Failed to update job', { description: result.error });
        } else {
          toast.success('Job updated successfully!');
          // Optionally reset form or navigate, depending on desired UX
          // form.reset(); // Reset form fields after successful submission
        }
      } catch (error: any) {
        console.error('Error calling server action:', error);
        const errorMessage = error.message || 'An unexpected error occurred.';
        setServerError(errorMessage);
        toast.error('Error updating job', { description: errorMessage });
      }
    });
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Job Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Section */}          
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title for the job.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use markdown for formatting if needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TODO: Add fields for all other editable properties */}
            {/* Example: Location Select */}
            {/* <FormField control={form.control} name="locationId" render={...} /> */}
            {/* Example: Work Location Radio Group */}
            {/* <FormField control={form.control} name="workLocation" render={...} /> */}
            {/* Example: Job Type Select */}
            {/* <FormField control={form.control} name="jobType" render={...} /> */}
            {/* Example: Skills Multi-Select/Tags Input */}
            {/* <FormField control={form.control} name="skillIds" render={...} /> */}
            {/* ... etc. for all fields in the schema ... */}

            {serverError && (
              <p className="text-sm font-medium text-destructive">{serverError}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 