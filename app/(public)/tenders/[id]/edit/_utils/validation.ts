import { z } from 'zod';
import { tenderTypeEnum, tenderStatusEnum } from '@/lib/db/schema';

// Custom URL validation that allows flexible input
const flexibleUrlSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((value) => {
    if (!value || value === '') return '';
    
    // If it already has a protocol, validate as-is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Add https:// if no protocol is provided
    return `https://${value}`;
  })
  .refine((value) => {
    if (!value || value === '') return true;
    
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, {
    message: 'Please enter a valid URL (e.g., example.com or https://example.com)'
  });

export const updateTenderSchema = z.object({
  id: z.string().uuid('Invalid tender ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  tenderType: z.enum(tenderTypeEnum.enumValues),
  sectorId: z.string().uuid('Invalid sector').optional().or(z.literal('')),
  locationId: z.string().uuid('Invalid location').optional().or(z.literal('')),
  deadline: z.date().optional(),
  budgetRange: z.string().optional(),
  contactInformation: z.string().optional(),
  externalLink: flexibleUrlSchema,
  status: z.enum(tenderStatusEnum.enumValues),
});

export type UpdateTenderSchemaType = z.infer<typeof updateTenderSchema>; 