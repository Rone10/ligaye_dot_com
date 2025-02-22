'use server';

import { JobPosting } from '@/app/types';

export interface JobDetails extends Omit<JobPosting, 'company'> {
  company: {
    name: string;
    logo: string;
    description: string;
    website: string;
    linkedin: string;
  };
  responsibilities: string[];
  requirements: string[];
  education: string;
}

// Mock data that will be replaced with database queries later
const mockJob: JobDetails = {
  id: '1',
  title: 'Senior Frontend Developer',
  company: {
    name: 'TechCorp Solutions',
    logo: '/company-logo.png',
    description: 'TechCorp Solutions is a leading software development company specializing in creating innovative web applications.',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/company/techcorp',
  },
  location: 'New York, NY',
  type: 'Full-Time',
  workLocation: 'On-site',
  experienceLevel: 'Senior',
  description: 'We are seeking a talented Senior Frontend Developer to join our growing team...',
  skills: ['React', 'TypeScript', 'Next.js'],
  salaryRange: {
    min: 120000,
    max: 150000,
  },
  postedDate: new Date('2024-03-20'),
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
  education: 'Bachelor\'s degree in Computer Science or related field',
};

const mockSimilarJobs: JobPosting[] = [
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Tech StartUp Inc.',
    location: 'New York, NY',
    type: 'Full-Time',
    workLocation: 'Remote',
    experienceLevel: 'Mid',
    description: 'Join our fast-growing startup as a Frontend Developer...',
    skills: ['React', 'JavaScript', 'CSS'],
    salaryRange: {
      min: 90000,
      max: 120000,
    },
    postedDate: new Date('2024-03-21'),
  },
  {
    id: '3',
    title: 'Senior React Developer',
    company: 'Digital Solutions LLC',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    workLocation: 'Hybrid',
    experienceLevel: 'Senior',
    description: 'Looking for a Senior React Developer to join our team...',
    skills: ['React', 'TypeScript', 'Redux'],
    salaryRange: {
      min: 130000,
      max: 160000,
    },
    postedDate: new Date('2024-03-19'),
  },
];

export async function getJobById(id: string): Promise<JobDetails> {
  // TODO: Replace with database query
  if (id === '1') {
    return mockJob;
  }
  throw new Error('Job not found');
}

export async function getSimilarJobs(jobId: string): Promise<JobPosting[]> {
  // TODO: Replace with database query to find similar jobs
  return mockSimilarJobs;
} 