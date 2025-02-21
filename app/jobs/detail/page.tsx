'use client'

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { JobHeader } from '@/app/components/jobs/job-header';
import { JobDescription } from '@/app/components/jobs/job-description';
import { CompanyInfo } from '@/app/components/jobs/company-info';
import { JobDetailsSidebar } from '@/app/components/jobs/job-details-sidebar';
import { SimilarJobs } from '@/app/components/jobs/similar-jobs';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for demonstration
const jobDetails = {
  id: '1',
  title: 'Senior Frontend Developer',
  company: {
    name: 'TechCorp Solutions',
    logo: '/company-logo.png',
    description: 'TechCorp Solutions is a leading software development company...',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/company/techcorp',
  },
  location: 'New York, NY',
  type: 'Full-time',
  workLocation: 'On-site',
  salary: {
    min: 120000,
    max: 150000,
    period: 'year',
  },
  description: 'We are seeking a talented Senior Frontend Developer to join our growing team...',
  responsibilities: [
    'Lead the development of complex frontend applications',
    'Mentor junior developers and provide technical guidance',
    'Collaborate with UX designers and backend developers',
  ],
  requirements: [
    '5+ years of experience in frontend development',
    'Expert knowledge of React, TypeScript, and Next.js',
    'Strong understanding of web performance optimization',
  ],
  requiredSkills: ['React', 'TypeScript', 'Next.js'],
  experienceLevel: 'Senior (5+ years)',
  education: 'Bachelor\'s degree in Computer Science or related field',
};

const similarJobs = [
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Tech StartUp Inc.',
    location: 'New York',
    salary: { min: 100000, max: 130000 },
  },
  {
    id: '3',
    title: 'Senior React Developer',
    company: 'Digital Solutions LLC',
    location: 'Remote',
    salary: { min: 130000, max: 160000 },
  },
];


function JobDetailsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:w-1/3 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        <Suspense fallback={<JobDetailsLoading />}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <JobHeader job={jobDetails} />
              <JobDescription job={jobDetails} />
              <CompanyInfo company={jobDetails.company} />
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              <JobDetailsSidebar job={jobDetails} />
              <SimilarJobs jobs={similarJobs} />
            </div>
          </div>
        </Suspense>
      </motion.div>
    </div>
  );
}