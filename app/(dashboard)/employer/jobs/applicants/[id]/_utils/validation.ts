import { z } from "zod"
import { applicationStatusEnum } from "@/lib/db/schema"

// Schema for application status updates from employers
export const applicationStatusUpdateSchema = z.object({
  status: z.enum(applicationStatusEnum.enumValues),
  interviewDate: z.union([z.string().datetime(), z.undefined(), z.null()]).optional(),
  notes: z.union([z.string().max(1000), z.undefined(), z.null()]).optional(),
})

export type ApplicationStatusUpdateInput = z.infer<typeof applicationStatusUpdateSchema> 