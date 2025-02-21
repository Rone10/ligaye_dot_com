import * as z from 'zod';

export const searchSchema = z.object({
  keyword: z.string().min(2, 'Enter at least 2 characters'),
  location: z.string().optional(),
  filters: z.object({
    jobType: z.array(z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship'])),
    workLocation: z.array(z.enum(['Remote', 'Hybrid', 'On-site'])),
    experienceLevel: z.array(z.enum(['Entry', 'Mid', 'Senior'])),
    salaryRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }),
    datePosted: z.string(),
  }),
});