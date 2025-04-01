import { z } from 'zod';
import { companySizeEnum } from '@/lib/db/schema';

// Validation schema for employer profile
export const employerProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name cannot exceed 100 characters'),
  companySize: z.enum(companySizeEnum.enumValues).optional(),
  industryId: z.string().uuid('Invalid industry selection').optional().nullable(),
  companyDescription: z.string().max(1000, 'Company description cannot exceed 1000 characters').optional().nullable(),
  website: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('')),
  locationId: z.string().uuid('Invalid location selection').optional().nullable(),
  hqAddressDisplay: z.string().max(200, 'Address cannot exceed 200 characters').optional().nullable(),
});

// Validation schema for logo upload
export const logoUploadSchema = z.object({
  logo: z.instanceof(File, { message: 'Please upload a valid file' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are supported'
    ),
});

// Validation function for employer profile data
export function validateEmployerProfileData(data: Record<string, any>) {
  return employerProfileSchema.parse(data);
}

// Validation function for logo upload
export function validateLogoUpload(file: File) {
  return logoUploadSchema.shape.logo.parse(file);
} 