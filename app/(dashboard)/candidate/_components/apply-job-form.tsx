'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyToJob } from '@/app/actions/candidate/applications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  coverLetter: z.string().max(1000, {
    message: 'Cover letter must be less than 1000 characters',
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplyJobFormProps {
  jobId: string;
  jobTitle: string;
}

export function ApplyJobForm({ jobId, jobTitle }: ApplyJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
        router.push('/candidate/applications');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
        <CardDescription>
          Include a cover letter to improve your chances of getting an interview.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the employer why you're a good fit for this position..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly explain your skills and experience relevant to this job.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 