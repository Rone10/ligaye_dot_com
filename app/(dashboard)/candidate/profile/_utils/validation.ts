import { z } from 'zod';
import { experienceLevelEnum } from '@/lib/db/schema';

// Validation schema for basic profile information
export const profileSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  linkedinUrl: z.string().min(1, "LinkedIn URL cannot be empty if provided.").optional().or(z.literal('')),
  githubUrl: z.string().min(1, "GitHub URL cannot be empty if provided.").optional().or(z.literal('')),
  portfolioUrl: z.string().min(1, "Portfolio URL cannot be empty if provided.").optional().or(z.literal('')),
  experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
});

// Validation schema for education
export const educationSchema = z.object({
  institution: z.string().min(2, "Institution name must be at least 2 characters").max(100, "Institution name must be at most 100 characters"),
  degree: z.string().min(2, "Degree must be at least 2 characters").max(100, "Degree must be at most 100 characters"),
  fieldOfStudy: z.string().min(2, "Field of study must be at least 2 characters").max(100, "Field of study must be at most 100 characters").optional(),
  startDate: z.date({
    required_error: "Please enter a valid start date",
    invalid_type_error: "Please enter a valid start date",
  }),
  endDate: z.date({
    invalid_type_error: "Please enter a valid end date",
  }).optional().nullable(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
});

// Validation schema for experience
export const experienceSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters").max(100, "Job title must be at most 100 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name must be at most 100 characters"),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  startDate: z.date({
    required_error: "Please enter a valid start date",
    invalid_type_error: "Please enter a valid start date",
  }),
  endDate: z.date({
    invalid_type_error: "Please enter a valid end date",
  }).optional().nullable(),
  isCurrent: z.boolean().optional(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
});

// Validation schema for skills
export const skillsSchema = z.object({
  skills: z.array(z.string().uuid()).min(1, "Please select at least one skill"),
});

// Validation function for profile data
export function validateProfileData(data: Record<string, any>) {
  return profileSchema.parse(data);
}

// Validation function for education data
export function validateEducationData(data: Record<string, any>) {
  return educationSchema.parse(data);
}

// Validation function for experience data
export function validateExperienceData(data: Record<string, any>) {
  return experienceSchema.parse(data);
}

// Validation function for skills data
export function validateSkillsData(data: Record<string, any>) {
  return skillsSchema.parse(data);
} 