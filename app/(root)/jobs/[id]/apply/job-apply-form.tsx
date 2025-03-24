'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyToJob, checkIfApplied } from '@/app/actions/candidate/applications';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TipTapEditor } from '@/components/tiptap-editor';

const formSchema = z.object({
  coverLetter: z.string().max(5000, {
    message: 'Cover letter must be less than 5000 characters',
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface JobApplyFormProps {
  jobId: string;
  jobTitle: string;
}

export function JobApplyForm({ jobId, jobTitle }: JobApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  // Check if user has already applied
  useEffect(() => {
    async function checkApplication() {
      try {
        const alreadyApplied = await checkIfApplied(jobId);
        setHasApplied(alreadyApplied);
      } catch (error) {
        console.error('Error checking application:', error);
      } finally {
        setIsChecking(false);
      }
    }
    
    checkApplication();
  }, [jobId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetter: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('jobId', jobId);
      if (values.coverLetter) {
        formData.append('coverLetter', values.coverLetter);
      }
      
      const result = await applyToJob(formData);
      
      if (result.success) {
        toast({
          title: 'Application submitted',
          description: 'Your application has been successfully submitted!',
        });
        setHasApplied(true);
        setTimeout(() => {
          router.push('/candidate/applications');
        }, 2000);
      } else {
        toast({
          title: 'Application failed',
          description: result.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Application failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isChecking) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (hasApplied) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">Application Submitted</AlertTitle>
        <AlertDescription className="text-green-700">
          Your application for this position has been successfully submitted. You will be redirected to your applications dashboard shortly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter (Optional)</FormLabel>
              <FormControl>
                <TipTapEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Briefly explain your skills and experience relevant to this job. A personalized cover letter can significantly improve your chances of getting an interview.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 