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

// Custom UUID validation that allows empty strings
const optionalUuidSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => {
    if (!value || value === '') return true;
    // UUID regex pattern
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }, {
    message: 'Invalid UUID format'
  });

// Update existing schema to include document fields
export const newTenderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  tenderType: z.enum(tenderTypeEnum.enumValues),
  sectorId: optionalUuidSchema,
  locationId: optionalUuidSchema,
  deadline: z.date().optional(),
  budgetRange: z.string().optional(),
  contactInformation: z.string().optional(),
  externalLink: flexibleUrlSchema,
  status: z.enum(tenderStatusEnum.enumValues).default('DRAFT'),
  documentsArePaid: z.boolean().default(false),
  documentPrice: z.number().positive().optional(),
  documentCurrency: z.string().default('GMD'),
}).refine((data) => {
  // If documents are paid, price must be provided
  if (data.documentsArePaid && !data.documentPrice) {
    return false;
  }
  return true;
}, {
  message: "Document price is required when documents are paid",
  path: ["documentPrice"]
});

export type NewTenderSchemaType = z.infer<typeof newTenderSchema>; 