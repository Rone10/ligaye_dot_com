import { z } from "zod"

// Define allowed file types
const ALLOWED_RESUME_TYPES = [
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Validation schema for the application form
export const applicationFormSchema = z.object({
  // Resume selection
  resumeOption: z.enum(["profile", "upload"]),
  resumeFile: z.instanceof(File)
    .refine(file => file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 5MB`,
    })
    .refine(file => file.size === 0 || ALLOWED_RESUME_TYPES.includes(file.type), {
      message: "File must be a PDF or Word document",
    })
    .optional()
    .nullable(),
  
  // Cover letter selection
  coverLetterOption: z.enum(["none", "upload", "text"]),
  coverLetterFile: z.instanceof(File)
    .refine(file => file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 5MB`,
    })
    .refine(file => file.size === 0 || ALLOWED_RESUME_TYPES.includes(file.type), {
      message: "File must be a PDF or Word document",
    })
    .optional()
    .nullable(),
  coverLetterText: z.string().max(5000).optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationFormSchema> 