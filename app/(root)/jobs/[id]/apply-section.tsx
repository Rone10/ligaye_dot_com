'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApplyJobForm } from '@/app/(dashboard)/candidate/_components/apply-job-form';
import { checkIfApplied } from '@/app/actions/candidate/applications';
import { createClient } from '@/lib/supabase/client';

interface ApplySectionProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ApplySection({ jobId, jobTitle, companyName }: ApplySectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkUserAndApplicationStatus() {
      try {
        // Check if user is logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has already applied
        const alreadyApplied = await checkIfApplied(jobId);
        setHasApplied(alreadyApplied);
        
        // If they haven't applied but the check didn't throw a profile error,
        // we can assume they have a profile
        setHasProfile(true);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking application status:', error);
        setIsLoading(false);
      }
    }
    
    checkUserAndApplicationStatus();
  }, [jobId]);

  function handleApplyClick() {
    if (!isAuthenticated) {
      // Redirect to login
      router.push(`/sign-in?redirect=/jobs/${jobId}`);
      return;
    }
    
    if (!hasProfile) {
      // Prompt to create a profile
      toast({
        title: 'Profile required',
        description: 'Please complete your profile before applying.',
        variant: 'destructive',
      });
      router.push('/create-profile');
      return;
    }
    
    setShowForm(true);
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (hasApplied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Submitted</CardTitle>
          <CardDescription>You have already applied for this job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-green-600 gap-2 mb-4">
            <CheckCircle2 className="h-6 w-6" />
            <span>Your application has been submitted</span>
          </div>
          <p className="text-muted-foreground">
            You can view the status of your application in your dashboard.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => router.push('/candidate/applications')}
            className="w-full"
          >
            View My Applications
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (showForm) {
    return (
      <ApplyJobForm 
        jobId={jobId} 
        jobTitle={jobTitle} 
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interested in this job?</CardTitle>
        <CardDescription>Apply now at {companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthenticated && (
          <div className="flex items-center text-amber-600 gap-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>You need to sign in to apply</span>
          </div>
        )}
        <p className="text-muted-foreground mb-4">
          This job was posted on Ligaye. Apply now to be considered for this position.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleApplyClick}
          className="w-full"
        >
          {isAuthenticated ? 'Apply Now' : 'Sign In to Apply'}
        </Button>
      </CardFooter>
    </Card>
  );
} 