import { z } from "zod";
import { experienceLevelEnum, companySizeEnum } from "@/lib/db/schema";

// Base profile validation schema
export const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  avatarUrl: z.string().url().optional().nullable()
});

// Candidate profile validation schema
export const candidateProfileSchema = z.object({
  title: z.string().min(2).max(100).optional().nullable(),
  experienceLevel: z.enum(experienceLevelEnum.enumValues).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable()
});

// Employer profile validation schema
export const employerProfileSchema = z.object({
  companyName: z.string().min(2).max(100),
  companySize: z.enum(companySizeEnum.enumValues).optional().nullable(),
  industryId: z.string().uuid().optional().nullable(),
  companyDescription: z.string().max(1000).optional().nullable(),
  website: z.string().url().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  hqAddressDisplay: z.string().max(200).optional().nullable()
});

// Education validation schema
export const educationSchema = z.object({
  institution: z.string().min(2).max(100),
  degree: z.string().min(2).max(100),
  fieldOfStudy: z.string().max(100).optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  description: z.string().max(500).optional().nullable()
});

// Experience validation schema
export const experienceSchema = z.object({
  jobTitle: z.string().min(2).max(100),
  companyName: z.string().min(2).max(100),
  location: z.string().max(100).optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(500).optional().nullable()
});

// Validate profile data
export function validateProfileData(data: Record<string, any>) {
  return profileSchema.parse(data);
}

// Validate candidate profile data
export function validateCandidateProfileData(data: Record<string, any>) {
  return candidateProfileSchema.parse(data);
}

// Validate employer profile data
export function validateEmployerProfileData(data: Record<string, any>) {
  return employerProfileSchema.parse(data);
}

// Validate education data
export function validateEducationData(data: Record<string, any>) {
  return educationSchema.parse(data);
}

// Validate experience data
export function validateExperienceData(data: Record<string, any>) {
  return experienceSchema.parse(data);
} 