import { z } from 'zod';
import { tenderTypeEnum, tenderStatusEnum } from '@/lib/db/schema';

export const newTenderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  tenderType: z.enum(tenderTypeEnum.enumValues),
  sectorId: z.string().uuid('Invalid sector').optional().or(z.literal('')),
  locationId: z.string().uuid('Invalid location').optional().or(z.literal('')),
  deadline: z.date().optional(),
  budgetRange: z.string().optional(),
  contactInformation: z.string().optional(),
  externalLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(tenderStatusEnum.enumValues).default('DRAFT'),
});

export type NewTenderSchemaType = z.infer<typeof newTenderSchema>; 