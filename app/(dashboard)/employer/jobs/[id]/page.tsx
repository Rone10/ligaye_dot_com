import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { fetchJob, updateJobActiveStatus, removeJob } from '@/app/actions/employer/jobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar, Clock, DollarSign, Briefcase, MapPin, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

interface JobDetailsPageProps {
  params: Promise<{id: string}>
}

const JOB_TYPES: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  PERMANENT: 'Permanent',
  FIXED_TERM_CONTRACT: 'Fixed Term Contract',
  CASUAL: 'Casual',
  SEASONAL: 'Seasonal',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
  INTERNSHIP: 'Internship'
};

const WORK_LOCATIONS: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site'
};

const EXPERIENCE_LEVELS: Record<string, string> = {
  ENTRY_LEVEL: 'Entry Level',
  MID_LEVEL: 'Mid Level',
  SENIOR_LEVEL: 'Senior Level',
  DIRECTOR: 'Director',
  EXECUTIVE: 'Executive'
};

const SALARY_FREQUENCIES: Record<string, string> = {
  HOURLY: 'Per Hour',
  DAILY: 'Per Day',
  WEEKLY: 'Per Week',
  MONTHLY: 'Per Month',
  ANNUALLY: 'Per Year'
};

async function toggleJobStatus(formData: FormData) {
  'use server';
  
  const jobId = formData.get('jobId') as string;
  const currentStatus = formData.get('isActive') === 'true';
  
  if (!jobId) return;
  
  await updateJobActiveStatus(jobId, !currentStatus);
  revalidatePath(`/employer/jobs/${jobId}`);
}

async function deleteJob(formData: FormData) {
  'use server';
  
  const jobId = formData.get('jobId') as string;
  
  if (!jobId) return;
  
  await removeJob(jobId);
  revalidatePath('/employer/jobs');
  redirect('/employer/jobs');
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
    const {id} = await params
  const job = await fetchJob(id);
  
  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">
            Created on {format(job.createdAt, 'PPP')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.isActive ? (
            <Badge className="bg-green-600">Active</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
          )}
          <Link href={`/employer/jobs/${job.id}/edit`}>
            <Button variant="outline">Edit Job</Button>
          </Link>
          <form action={toggleJobStatus}>
            <input type="hidden" name="jobId" value={job.id} />
            <input type="hidden" name="isActive" value={job.isActive.toString()} />
            <Button type="submit" variant="outline">
              {job.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </form>
          <form action={deleteJob}>
            <input type="hidden" name="jobId" value={job.id} />
            <Button type="submit" variant="destructive">Delete</Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                {job.description}
              </div>
            </div>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{JOB_TYPES[job.jobType] || job.jobType}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {WORK_LOCATIONS[job.workLocation] || job.workLocation}
                  {job.locationName && ` • ${job.locationName}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{EXPERIENCE_LEVELS[job.experienceLevel] || job.experienceLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {job.salaryRangeMin && job.salaryRangeMax
                    ? `${formatCurrency(job.salaryRangeMin, job.salaryCurrency || 'GMD')} - ${formatCurrency(job.salaryRangeMax, job.salaryCurrency || 'GMD')} ${SALARY_FREQUENCIES[job.salaryFrequency] || job.salaryFrequency}`
                    : 'Salary not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.applicantCount} Applicant{job.applicantCount !== 1 ? 's' : ''}</span>
              </div>
              {job.expiresAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Expires: {format(job.expiresAt, 'PPP')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicant Statistics</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-4xl font-bold">{job.applicantCount}</div>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </CardContent>
            <CardFooter>
              <Link href={`/employer/jobs/${job.id}/applicants`} className="w-full">
                <Button variant="outline" className="w-full">View All Applicants</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
