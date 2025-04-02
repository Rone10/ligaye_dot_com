import { z } from 'zod'
import { 
  workLocationEnum, 
  jobTypeEnum, 
  experienceLevelEnum,
  scheduleTypeEnum,
  contractPeriodEnum,
  salaryFrequencyEnum,
  salaryDisplayTypeEnum,
  applicationMethodEnum
} from '@/lib/db/schema'

// Helper validation schema for array fields
const textArrayValidator = z.string().array().optional().default([])

export const jobFormSchema = z.object({
  // Basic job details
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  jobLanguage: z.string().default("English"),
  numberOfOpenings: z.coerce.number().int().min(1).default(1),
  displayAddress: z.boolean().default(true),
  
  // Location
  locationId: z.string().uuid().optional(),
  workLocation: z.enum(workLocationEnum.enumValues),
  
  // Requirements
  educationRequirements: textArrayValidator,
  experienceRequirements: textArrayValidator,
  experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
  
  // Language
  languageRequirements: textArrayValidator,
  languageTrainingProvided: z.boolean().default(false),
  
  // Job type and schedule
  jobType: z.enum(jobTypeEnum.enumValues),
  schedule: z.enum(scheduleTypeEnum.enumValues).array().optional().default([]),
  expectedHours: z.coerce.number().int().min(1).optional(),
  hoursType: z.string().default("FIXED"),
  
  // Contract details (conditional based on job type)
  contractLength: z.coerce.number().int().min(1).optional(),
  contractPeriod: z.enum(contractPeriodEnum.enumValues).optional(),
  
  // Start date
  plannedStartDate: z.coerce.date().optional(),
  
  // Salary
  salaryRangeMin: z.coerce.number().int().min(0).optional(),
  salaryRangeMax: z.coerce.number().int().min(0).optional(),
  salaryCurrency: z.string().default("GMD"),
  salaryFrequency: z.enum(salaryFrequencyEnum.enumValues).optional(),
  salaryDisplayType: z.enum(salaryDisplayTypeEnum.enumValues).default("NEGOTIABLE"),
  
  // Benefits & supplemental pay
  supplementalPay: textArrayValidator,
  benefits: textArrayValidator,
  
  // Skills & industries
  skillIds: z.array(z.string().uuid()).min(1, "Select at least one skill"),
  industryIds: z.array(z.string().uuid()).min(1, "Select at least one industry"),
  
  // Application settings
  applicationMethod: z.enum(applicationMethodEnum.enumValues).default("PLATFORM"),
  applicationInstructions: z.string().optional(),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  applicationEmail: z.string().email().optional().or(z.literal('')),
  resumeRequired: z.boolean().default(true),
  allowCandidateContact: z.boolean().default(false),
  applicationDeadline: z.coerce.date().optional(),
  
  // Job posting settings
  jobDuration: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
  paymentMethod: z.enum(["stripe", "cash"])
})

export type JobFormValues = z.infer<typeof jobFormSchema> 