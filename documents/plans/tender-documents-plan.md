# Tender Documents Feature Implementation Plan

## Overview
This plan implements a feature enabling users to upload documents associated with tenders. Documents can be free or require payment via Stripe. The feature integrates with existing tender flows and introduces a purchase flow accessible to both authenticated and unauthenticated users.

**Project Context:** Ligaye.com (Job & Tender Board for Gambia)  
**Architecture:** Granular Vertical Slice Architecture (VSA) within `app/` route segments  
**Technologies:** Next.js 15, Supabase (Auth, DB, Storage), Drizzle ORM, Stripe, Tailwind CSS, Shadcn UI

---

## Phase 1: Database Schema Implementation

### 1.1 Schema Modifications (`lib/db/schema.ts`)

#### A. New Table: `tenderDocuments`
```typescript
export const tenderDocuments = pgTable('tender_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
  storagePath: text('storage_path').notNull(), // e.g., tender-documents/tender_uuid/document_uuid_filename.pdf
  originalFilename: text('original_filename').notNull(),
  fileSize: integer('file_size'), // In bytes
  mimeType: text('mime_type'), // E.g., 'application/pdf'
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    tenderIdIdx: index('tender_documents_tender_id_idx').on(table.tenderId),
    deletedIdx: index('tender_documents_deleted_idx').on(table.deleted),
  };
});
```

#### B. Modify Existing `tenders` Table
Add these fields to the existing `tenders` table definition:
```typescript
// Add to existing tenders table
documentsArePaid: boolean('documents_are_paid').default(false).notNull(),
documentPrice: real('document_price'), // Nullable: Price if documentsArePaid is true
documentCurrency: text('document_currency').default('GMD'), // Default currency
```

#### C. New Table: `tenderPayments`
```typescript
export const tenderPayments = pgTable('tender_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in smallest currency unit
  currency: text('currency').notNull().default('GMD'),
  method: text('method').notNull().default('stripe'), // 'stripe'
  status: text('status').notNull(), // 'pending', 'succeeded', 'failed'
  transactionId: text('transaction_id').unique(), // Stripe Payment Intent ID
  stripeSessionId: text('stripe_session_id').unique(), // Stripe Checkout Session ID
  purchaserFullName: text('purchaser_full_name').notNull(),
  purchaserEmail: text('purchaser_email').notNull(),
  purchaserPhone: text('purchaser_phone'), // Optional
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    tenderIdIdx: index('tender_payments_tender_id_idx').on(table.tenderId),
    transactionIdIdx: index('tender_payments_transaction_id_idx').on(table.transactionId),
    stripeSessionIdIdx: index('tender_payments_stripe_session_id_idx').on(table.stripeSessionId),
    purchaserEmailIdx: index('tender_payments_purchaser_email_idx').on(table.purchaserEmail),
    statusIdx: index('tender_payments_status_idx').on(table.status),
    deletedIdx: index('tender_payments_deleted_idx').on(table.deleted),
  };
});
```

#### D. New Table: `tenderDocumentPurchases`
```typescript
export const tenderDocumentPurchases = pgTable('tender_document_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
  tenderPaymentId: uuid('tender_payment_id').notNull().unique().references(() => tenderPayments.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    tenderPaymentUniqueIdx: uniqueIndex('tender_doc_purchase_payment_unique_idx').on(table.tenderPaymentId),
    tenderIdIdx: index('tender_doc_purchase_tender_id_idx').on(table.tenderId),
    deletedIdx: index('tender_doc_purchase_deleted_idx').on(table.deleted),
  };
});
```

### 1.2 Relations Updates
```typescript
// Update existing tendersRelations
export const tendersRelations = relations(tenders, ({ one, many }) => ({
  // ... existing relations
  documents: many(tenderDocuments, { relationName: 'tenderToDocuments' }),
  payments: many(tenderPayments, { relationName: 'tenderToPayments' }),
  purchases: many(tenderDocumentPurchases, { relationName: 'tenderToPurchases' }),
}));

// New relations
export const tenderDocumentsRelations = relations(tenderDocuments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderDocuments.tenderId],
    references: [tenders.id],
    relationName: 'tenderToDocuments'
  }),
}));

export const tenderPaymentsRelations = relations(tenderPayments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderPayments.tenderId],
    references: [tenders.id],
    relationName: 'tenderToPayments'
  }),
  purchaseRecord: one(tenderDocumentPurchases, {
    fields: [tenderPayments.id],
    references: [tenderDocumentPurchases.tenderPaymentId],
    relationName: 'paymentToPurchaseRecord'
  })
}));

export const tenderDocumentPurchasesRelations = relations(tenderDocumentPurchases, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderDocumentPurchases.tenderId],
    references: [tenders.id],
    relationName: 'tenderToPurchases'
  }),
  payment: one(tenderPayments, {
    fields: [tenderDocumentPurchases.tenderPaymentId],
    references: [tenderPayments.id],
    relationName: 'paymentToPurchaseRecord'
  }),
}));
```

### 1.3 Type Definitions
```typescript
export type TenderDocument = InferSelectModel<typeof tenderDocuments>;
export type NewTenderDocument = InferInsertModel<typeof tenderDocuments>;
export type TenderPayment = InferSelectModel<typeof tenderPayments>;
export type NewTenderPayment = InferInsertModel<typeof tenderPayments>;
export type TenderDocumentPurchase = InferSelectModel<typeof tenderDocumentPurchases>;
export type NewTenderDocumentPurchase = InferInsertModel<typeof tenderDocumentPurchases>;
```

### 1.4 Migration Generation
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## Phase 2: Supabase Storage Configuration

### 2.1 Storage Bucket Setup
- **Bucket Name:** `tender-documents`
- **Access:** Private (public access via signed URLs only)
- **File Types:** PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP
- **Max File Size:** 50MB per file
- **Path Structure:** `tender-documents/{tenderId}/{documentId}-{filename}`

### 2.2 Row Level Security (RLS) Policies

#### Policy 1: Tender Owner Access
```sql
CREATE POLICY "Tender owners can read their documents"
ON storage.objects FOR SELECT USING (
  bucket_id = 'tender-documents' AND
  auth.role() = 'authenticated' AND
  auth.uid() = (
    SELECT t.user_id FROM public.tenders t
    WHERE t.id = (string_to_array(storage.objects.name, '/'))[1]::uuid
  )
);
```

#### Policy 2: Service Role Upload Access
```sql
CREATE POLICY "Service role can upload documents"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'tender-documents' AND
  auth.role() = 'service_role'
);
```

#### Policy 3: Service Role Delete Access
```sql
CREATE POLICY "Service role can delete documents"
ON storage.objects FOR DELETE USING (
  bucket_id = 'tender-documents' AND
  auth.role() = 'service_role'
);
```

### 2.3 Supabase Service Role Client
Create `lib/supabase/admin.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

---

## Phase 3: File Upload Utilities

### 3.1 File Upload Utility (`lib/utils/file-upload.ts`)
```typescript
import { supabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

export interface UploadFileParams {
  file: File;
  tenderId: string;
  bucket?: string;
}

export interface UploadResult {
  success: boolean;
  storagePath?: string;
  error?: string;
}

export async function uploadTenderDocument({
  file,
  tenderId,
  bucket = 'tender-documents'
}: UploadFileParams): Promise<UploadResult> {
  try {
    // Validate file
    const validationResult = validateFile(file);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Generate unique storage path
    const documentId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const storagePath = `${tenderId}/${documentId}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    }

    return { success: true, storagePath };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // File size validation (50MB max)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  // File type validation
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
}

export async function deleteTenderDocument(storagePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('tender-documents')
      .remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export async function generateSignedUrl(storagePath: string, expiresIn: number = 900): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('tender-documents')
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return null;
  }
}
```

---

## Phase 4: Tender Creation/Update Enhancement

### 4.1 Update Validation Schema (`app/(public)/tenders/new/_utils/validation.ts`)
```typescript
import { z } from 'zod';

// Update existing schema to include document fields
export const newTenderSchema = z.object({
  // ... existing fields
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

export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).max(10, "Maximum 10 files allowed"),
});

export type NewTenderSchemaType = z.infer<typeof newTenderSchema>;
export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;
```

### 4.2 Enhanced Form Component (`app/(public)/tenders/new/_components/NewTenderForm.tsx`)

Add these sections to the existing form:

```typescript
// Add to imports
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from './_components/FileUpload';

// Add state for file management
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [documentsArePaid, setDocumentsArePaid] = useState(false);

// Add to form after existing fields
{/* Document Upload Section */}
<div className="space-y-lg border-t border-theme-gray pt-lg">
  <h3 className="text-xl font-semibold text-theme-dark">Document Upload</h3>
  
  <FileUpload
    files={selectedFiles}
    onFilesChange={setSelectedFiles}
    maxFiles={10}
    maxSize={50 * 1024 * 1024} // 50MB
  />
  
  {/* Document Payment Settings */}
  <div className="space-y-md">
    <div className="flex items-center space-x-2">
      <Checkbox
        id="documentsArePaid"
        checked={documentsArePaid}
        onCheckedChange={(checked) => {
          setDocumentsArePaid(checked as boolean);
          form.setValue('documentsArePaid', checked as boolean);
        }}
      />
      <label htmlFor="documentsArePaid" className="text-sm font-medium">
        Charge for document access
      </label>
    </div>
    
    {documentsArePaid && (
      <div className="grid grid-cols-2 gap-md">
        <FormField
          control={form.control}
          name="documentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Price *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="documentCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GMD">GMD (Gambian Dalasi)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )}
  </div>
</div>
```

### 4.3 File Upload Component (`app/(public)/tenders/new/_components/FileUpload.tsx`)
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  className
}: FileUploadProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => {
        const error = errors[0];
        if (error.code === 'file-too-large') {
          return `${file.name}: File too large (max 50MB)`;
        }
        if (error.code === 'file-invalid-type') {
          return `${file.name}: File type not supported`;
        }
        return `${file.name}: Upload error`;
      });
      setErrors(newErrors);
    }

    // Add accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    }
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip']
    },
    maxSize,
    maxFiles: maxFiles - files.length
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-md", className)}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-lg">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-xl text-center cursor-pointer transition-colors duration-standard",
              isDragActive
                ? "border-primary-blue bg-primary-blue/5"
                : "border-theme-gray hover:border-primary-blue hover:bg-theme-light/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-theme-gray-dark mb-md" />
            <p className="text-lg font-medium text-theme-dark mb-xs">
              {isDragActive ? "Drop files here" : "Upload Documents"}
            </p>
            <p className="text-sm text-theme-gray-dark mb-md">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-theme-gray-dark">
              Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP (max 50MB each)
            </p>
            <Button type="button" variant="outline" className="mt-md">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-md">
            <div className="flex items-start gap-sm">
              <AlertCircle className="h-5 w-5 text-red-500 mt-xs flex-shrink-0" />
              <div className="space-y-xs">
                <p className="text-sm font-medium text-red-700">Upload Errors:</p>
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-lg">
            <h4 className="font-medium text-theme-dark mb-md">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-sm">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-sm bg-theme-light rounded-md"
                >
                  <div className="flex items-center gap-sm">
                    <FileText className="h-4 w-4 text-theme-gray-dark" />
                    <div>
                      <p className="text-sm font-medium text-theme-dark">{file.name}</p>
                      <p className="text-xs text-theme-gray-dark">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

This is the first part of the implementation plan. The plan continues with the remaining phases covering server actions, purchase flow, webhook updates, and more. Would you like me to continue with the next sections?

---

## Phase 5: Server Actions & Queries

### 5.1 Enhanced Tender Creation (`app/(public)/tenders/new/_actions.ts`)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { createTenderWithDocuments } from './_queries';
import { uploadTenderDocument } from '@/lib/utils/file-upload';
import { newTenderSchema, type NewTenderSchemaType } from './_utils/validation';

export async function createTenderWithDocumentsAction(
  formData: FormData
): Promise<{ success: boolean; tenderId?: string; error?: string }> {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Extract form data
    const tenderData = Object.fromEntries(formData.entries());
    const files = formData.getAll('files') as File[];

    // Validate tender data
    const validatedData = newTenderSchema.parse({
      ...tenderData,
      documentsArePaid: tenderData.documentsArePaid === 'true',
      documentPrice: tenderData.documentPrice ? parseFloat(tenderData.documentPrice as string) : undefined,
    });

    // Create tender first
    const tender = await createTenderWithDocuments({
      ...validatedData,
      userId: user.id,
    });

    if (!tender.success || !tender.tenderId) {
      return { success: false, error: tender.error || 'Failed to create tender' };
    }

    // Upload documents if any
    if (files.length > 0) {
      const uploadResults = await Promise.allSettled(
        files.map(file => uploadTenderDocument({
          file,
          tenderId: tender.tenderId!
        }))
      );

      // Check for upload failures
      const failedUploads = uploadResults.filter(result => 
        result.status === 'rejected' || !result.value.success
      );

      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} file uploads failed`);
        // Continue anyway - tender is created, some files may have uploaded
      }

      // Save successful uploads to database
      const successfulUploads = uploadResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        await saveTenderDocuments(tender.tenderId!, successfulUploads, files);
      }
    }

    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tender.tenderId}`);

    return { success: true, tenderId: tender.tenderId };
  } catch (error) {
    console.error('Create tender with documents error:', error);
    return { success: false, error: 'Failed to create tender' };
  }
}

async function saveTenderDocuments(
  tenderId: string, 
  uploadResults: any[], 
  originalFiles: File[]
) {
  // Implementation to save document metadata to database
  // This would call a query function to insert into tenderDocuments table
}
```

### 5.2 Enhanced Queries (`app/(public)/tenders/new/_queries.ts`)
```typescript
import { db } from '@/lib/db';
import { tenders, tenderDocuments } from '@/lib/db/schema';
import type { NewTender, NewTenderDocument } from '@/lib/db/schema';

export async function createTenderWithDocuments(
  tenderData: Omit<NewTender, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; tenderId?: string; error?: string }> {
  try {
    const result = await db().transaction(async (tx) => {
      // Insert tender
      const [tender] = await tx
        .insert(tenders)
        .values({
          ...tenderData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: tenders.id });

      return tender;
    });

    return { success: true, tenderId: result.id };
  } catch (error) {
    console.error('Database error creating tender:', error);
    return { success: false, error: 'Database error' };
  }
}

export async function saveTenderDocumentMetadata(
  documents: Array<{
    tenderId: string;
    storagePath: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
  }>
): Promise<boolean> {
  try {
    await db().insert(tenderDocuments).values(
      documents.map(doc => ({
        ...doc,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    return true;
  } catch (error) {
    console.error('Error saving document metadata:', error);
    return false;
  }
}
```

---

## Phase 6: Document Purchase Flow

### 6.1 Purchase Page (`app/(public)/tenders/[id]/purchase/page.tsx`)
```typescript
import { notFound } from 'next/navigation';
import { getTenderPurchaseInfo } from './_queries';
import { PurchaseForm } from './_components/PurchaseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenderPurchasePage({ params }: PageProps) {
  const { id } = await params;
  
  const tender = await getTenderPurchaseInfo(id);
  
  if (!tender) {
    notFound();
  }

  if (!tender.documentsArePaid || !tender.documentPrice) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto max-w-2xl px-md py-xl">
          <Card>
            <CardContent className="p-xl text-center">
              <FileText className="mx-auto h-16 w-16 text-theme-gray-dark mb-lg" />
              <h1 className="text-2xl font-bold text-theme-dark mb-md">
                Documents are Free
              </h1>
              <p className="text-theme-gray-dark mb-lg">
                The documents for this tender are available for free download.
              </p>
              <Link href={`/tenders/${id}`}>
                <Button>View Tender Details</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-2xl px-md py-xl">
        {/* Back Navigation */}
        <div className="mb-xl">
          <Link href={`/tenders/${id}`}>
            <Button variant="ghost" className="gap-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to Tender
            </Button>
          </Link>
        </div>

        {/* Purchase Header */}
        <Card className="mb-xl">
          <CardHeader>
            <div className="flex items-center gap-md">
              <div className="p-sm bg-primary-blue/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary-blue" />
              </div>
              <div>
                <CardTitle className="text-2xl">Purchase Documents</CardTitle>
                <p className="text-theme-gray-dark mt-xs">
                  Complete your purchase to access tender documents
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-theme-light rounded-lg p-lg">
              <h3 className="font-semibold text-theme-dark mb-sm">{tender.title}</h3>
              <p className="text-sm text-theme-gray-dark mb-md">{tender.organizationName}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-theme-gray-dark">Document Access Price:</span>
                <span className="text-xl font-bold text-primary-blue">
                  {tender.documentCurrency} {tender.documentPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Form */}
        <PurchaseForm tender={tender} />
      </div>
    </div>
  );
}
```

### 6.2 Purchase Form Component (`app/(public)/tenders/[id]/purchase/_components/PurchaseForm.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { initiateDocumentPurchaseAction } from '../_actions';

const purchaseSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

type PurchaseSchemaType = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  tender: {
    id: string;
    title: string;
    documentPrice: number;
    documentCurrency: string;
  };
}

export function PurchaseForm({ tender }: PurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseSchemaType>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: PurchaseSchemaType) => {
    setIsSubmitting(true);

    try {
      const result = await initiateDocumentPurchaseAction({
        tenderId: tender.id,
        purchaserInfo: data,
      });

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || 'Failed to initiate purchase');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Purchase error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchaser Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-theme-light rounded-lg p-lg">
              <div className="flex justify-between items-center mb-md">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-primary-blue">
                  {tender.documentCurrency} {tender.documentPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-theme-gray-dark">
                You will be redirected to Stripe to complete your payment securely.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### 6.3 Purchase Actions (`app/(public)/tenders/[id]/purchase/_actions.ts`)
```typescript
'use server';

import stripe from '@/lib/stripe';
import { getTenderPurchaseInfo } from './_queries';

interface PurchaseParams {
  tenderId: string;
  purchaserInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export async function initiateDocumentPurchaseAction({
  tenderId,
  purchaserInfo,
}: PurchaseParams): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    // Get tender details
    const tender = await getTenderPurchaseInfo(tenderId);
    
    if (!tender) {
      return { success: false, error: 'Tender not found' };
    }

    if (!tender.documentsArePaid || !tender.documentPrice) {
      return { success: false, error: 'Documents are free' };
    }

    // Convert price to smallest currency unit (e.g., bututs for GMD)
    const amountInSmallestUnit = Math.round(tender.documentPrice * 100);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: tender.documentCurrency.toLowerCase(),
            product_data: {
              name: `Tender Documents: ${tender.title}`,
              description: `Document access for tender by ${tender.organizationName}`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: purchaserInfo.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenders/${tenderId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenders/${tenderId}/purchase/cancel`,
      metadata: {
        tenderId,
        purchaseType: 'TENDER_DOCUMENT',
        purchaserFullName: purchaserInfo.fullName,
        purchaserEmail: purchaserInfo.email,
        purchaserPhone: purchaserInfo.phone || '',
      },
    });

    if (!session.url) {
      return { success: false, error: 'Failed to create checkout session' };
    }

    return { success: true, checkoutUrl: session.url };
  } catch (error) {
    console.error('Purchase initiation error:', error);
    return { success: false, error: 'Failed to initiate purchase' };
  }
}
```

---

## Phase 7: Stripe Webhook Enhancement

### 7.1 Update Webhook Handler (`app/api/webhook/stripe/route.ts`)
```typescript
// Add to existing webhook handler in the checkout.session.completed case

case 'checkout.session.completed':
  const session = event.data.object;
  
  if (session.payment_status === 'paid') {
    const metadata = session.metadata;
    
    if (metadata?.purchaseType === 'TENDER_DOCUMENT') {
      // Handle Tender Document Purchase
      await handleTenderDocumentPurchase(session);
    } else {
      // Existing job payment logic
      await handleSuccessfulPayment(session.id);
    }
  }
  break;
```

### 7.2 Tender Purchase Handler (`lib/stripe/tender-stripe-actions.ts`)
```typescript
import { db } from '@/lib/db';
import { tenderPayments, tenderDocumentPurchases } from '@/lib/db/schema';
import stripe from '@/lib/stripe';

export async function handleTenderDocumentPurchase(session: any) {
  try {
    const metadata = session.metadata;
    const tenderId = metadata.tenderId;
    const purchaserFullName = metadata.purchaserFullName;
    const purchaserEmail = metadata.purchaserEmail;
    const purchaserPhone = metadata.purchaserPhone;

    if (!tenderId || !purchaserFullName || !purchaserEmail) {
      throw new Error('Missing required metadata for tender document purchase');
    }

    // Get payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    if (!paymentIntentId) {
      throw new Error('Missing payment intent ID');
    }

    // Record the purchase in database
    await db().transaction(async (tx) => {
      // Create payment record
      const [payment] = await tx
        .insert(tenderPayments)
        .values({
          tenderId,
          amount: session.amount_total,
          currency: session.currency.toUpperCase(),
          method: 'stripe',
          status: 'succeeded',
          transactionId: paymentIntentId,
          stripeSessionId: session.id,
          purchaserFullName,
          purchaserEmail,
          purchaserPhone: purchaserPhone || null,
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: tenderPayments.id });

      // Create purchase entitlement record
      await tx
        .insert(tenderDocumentPurchases)
        .values({
          tenderId,
          tenderPaymentId: payment.id,
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    });

    console.log(`Tender document purchase completed for tender ${tenderId}`);
  } catch (error) {
    console.error('Error handling tender document purchase:', error);
    throw error;
  }
}
```

---

## Phase 8: Success & Download Flow

### 8.1 Success Page (`app/(public)/tenders/[id]/purchase/success/page.tsx`)
```typescript
import { notFound } from 'next/navigation';
import { verifyPurchaseAndGetDocuments } from './_queries';
import { DownloadLinks } from './_components/DownloadLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PurchaseSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;
  
  if (!session_id) {
    notFound();
  }

  const purchaseData = await verifyPurchaseAndGetDocuments(id, session_id);
  
  if (!purchaseData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-3xl px-md py-xl">
        {/* Success Header */}
        <Card className="mb-xl">
          <CardHeader>
            <div className="flex items-center gap-md">
              <div className="p-sm bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-700">Purchase Successful!</CardTitle>
                <p className="text-theme-gray-dark mt-xs">
                  Your payment has been processed and documents are now available for download.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-theme-light rounded-lg p-lg">
              <h3 className="font-semibold text-theme-dark mb-sm">{purchaseData.tender.title}</h3>
              <p className="text-sm text-theme-gray-dark mb-md">{purchaseData.tender.organizationName}</p>
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <span className="text-theme-gray-dark">Amount Paid:</span>
                  <span className="font-medium ml-sm">
                    {purchaseData.payment.currency} {(purchaseData.payment.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-theme-gray-dark">Transaction ID:</span>
                  <span className="font-mono text-xs ml-sm">{purchaseData.payment.transactionId}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-md">
              <Download className="h-6 w-6 text-primary-blue" />
              <CardTitle>Download Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-lg">
              <p className="text-theme-gray-dark mb-md">
                Your documents are ready for download. These links will expire in 15 minutes for security.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-md">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please download all documents now. 
                  You can return to this page using the link in your email receipt.
                </p>
              </div>
            </div>
            
            <DownloadLinks documents={purchaseData.documents} />
            
            <div className="mt-xl pt-lg border-t border-theme-gray">
              <Link href={`/tenders/${id}`}>
                <Button variant="outline">Back to Tender Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 8.2 Download Links Component (`app/(public)/tenders/[id]/purchase/success/_components/DownloadLinks.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface Document {
  id: string;
  originalFilename: string;
  fileSize: number;
  signedUrl: string;
}

interface DownloadLinksProps {
  documents: Document[];
}

export function DownloadLinks({ documents }: DownloadLinksProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownload = async (document: Document) => {
    setDownloadingIds(prev => new Set(prev).add(document.id));
    
    try {
      // Open download in new tab
      window.open(document.signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      // Remove from downloading set after a delay
      setTimeout(() => {
        setDownloadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(document.id);
          return newSet;
        });
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-xl">
        <FileText className="mx-auto h-16 w-16 text-theme-gray-dark mb-md" />
        <p className="text-theme-gray-dark">No documents available for download.</p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between p-md bg-theme-light rounded-lg hover:bg-theme-gray/10 transition-colors duration-standard"
        >
          <div className="flex items-center gap-sm">
            <FileText className="h-5 w-5 text-theme-gray-dark" />
            <div>
              <p className="font-medium text-theme-dark">{document.originalFilename}</p>
              <p className="text-sm text-theme-gray-dark">{formatFileSize(document.fileSize)}</p>
            </div>
          </div>
          
          <Button
            onClick={() => handleDownload(document)}
            disabled={downloadingIds.has(document.id)}
            className="gap-xs"
          >
            {downloadingIds.has(document.id) ? (
              'Downloading...'
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>
      ))}
      
      <div className="mt-lg p-md bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Right-click on download buttons and select "Save link as..." 
          to save files directly to your preferred location.
        </p>
      </div>
    </div>
  );
}
```

---

## Phase 9: Document Display on Tender Details

### 9.1 Enhanced Tender Detail Display (`app/(public)/tenders/[id]/_components/TenderDetailDisplay.tsx`)

Add document section to existing component:

```typescript
// Add to imports
import { DocumentSection } from './DocumentSection';

// Add to component after existing sections
<DocumentSection tender={tender} />
```

### 9.2 Document Section Component (`app/(public)/tenders/[id]/_components/DocumentSection.tsx`)
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Lock, Download, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getTenderDocuments } from '../_queries';
import { FreeDocumentDownload } from './FreeDocumentDownload';

interface DocumentSectionProps {
  tender: {
    id: string;
    title: string;
    documentsArePaid: boolean;
    documentPrice?: number | null;
    documentCurrency?: string;
  };
}

export async function DocumentSection({ tender }: DocumentSectionProps) {
  const documents = await getTenderDocuments(tender.id);

  if (documents.length === 0) {
    return null; // Don't show section if no documents
  }

  return (
    <Card className="animate-appear">
      <CardHeader>
        <div className="flex items-center gap-md">
          <FileText className="h-6 w-6 text-primary-blue" />
          <CardTitle>Documents</CardTitle>
          {tender.documentsArePaid && (
            <div className="flex items-center gap-xs text-sm bg-yellow-100 text-yellow-800 px-sm py-xs rounded-full">
              <Lock className="h-3 w-3" />
              Paid Access
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tender.documentsArePaid ? (
          // Paid Documents
          <div className="space-y-lg">
            <div className="bg-theme-light rounded-lg p-lg">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <h4 className="font-semibold text-theme-dark">Document Access Required</h4>
                  <p className="text-sm text-theme-gray-dark mt-xs">
                    Purchase access to download {documents.length} document{documents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-blue">
                    {tender.documentCurrency} {tender.documentPrice?.toFixed(2)}
                  </div>
                  <div className="text-sm text-theme-gray-dark">One-time payment</div>
                </div>
              </div>
              
              <div className="space-y-sm mb-lg">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-sm text-sm">
                    <FileText className="h-4 w-4 text-theme-gray-dark" />
                    <span className="text-theme-dark">{doc.originalFilename}</span>
                    <span className="text-theme-gray-dark">
                      ({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ))}
              </div>
              
              <Link href={`/tenders/${tender.id}/purchase`}>
                <Button className="w-full gap-xs" size="lg">
                  <CreditCard className="h-4 w-4" />
                  Purchase Document Access
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Free Documents
          <div className="space-y-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-md mb-lg">
              <p className="text-sm text-green-800">
                <strong>Free Download:</strong> These documents are available for free download.
              </p>
            </div>
            
            {documents.map((doc) => (
              <FreeDocumentDownload key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9.3 Free Document Download Component (`app/(public)/tenders/[id]/_components/FreeDocumentDownload.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getFreeDocumentDownloadUrl } from '../_actions';

interface Document {
  id: string;
  originalFilename: string;
  fileSize: number;
}

interface FreeDocumentDownloadProps {
  document: Document;
}

export function FreeDocumentDownload({ document }: FreeDocumentDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const result = await getFreeDocumentDownloadUrl(document.id);
      
      if (result.success && result.downloadUrl) {
        // Open download in new tab
        window.open(result.downloadUrl, '_blank');
      } else {
        toast.error(result.error || 'Failed to generate download link');
      }
    } catch (error) {
      toast.error('Download failed');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-md bg-theme-light rounded-lg hover:bg-theme-gray/10 transition-colors duration-standard">
      <div className="flex items-center gap-sm">
        <FileText className="h-5 w-5 text-theme-gray-dark" />
        <div>
          <p className="font-medium text-theme-dark">{document.originalFilename}</p>
          <p className="text-sm text-theme-gray-dark">{formatFileSize(document.fileSize)}</p>
        </div>
      </div>
      
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="outline"
        className="gap-xs"
      >
        {isDownloading ? (
          'Generating...'
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download
          </>
        )}
      </Button>
    </div>
  );
}
```

---

## Phase 10: Testing Strategy

### 10.1 Unit Tests
- File upload validation
- Document metadata saving
- Stripe session creation
- Webhook processing
- Signed URL generation

### 10.2 Integration Tests
- Complete tender creation with documents
- Purchase flow end-to-end
- Document download after purchase
- Free document download

### 10.3 Manual Testing Checklist
- [ ] Create tender with free documents
- [ ] Create tender with paid documents
- [ ] Upload various file types and sizes
- [ ] Test file validation (size, type)
- [ ] Purchase flow with valid card
- [ ] Purchase flow with declined card
- [ ] Download documents after purchase
- [ ] Download free documents
- [ ] Webhook processing
- [ ] Email notifications (if implemented)

---

## Phase 11: Deployment Considerations

### 11.1 Environment Variables
```bash
# Add to .env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 11.2 Supabase Setup
1. Create `tender-documents` storage bucket
2. Apply RLS policies
3. Test file upload/download permissions

### 11.3 Stripe Configuration
1. Configure webhook endpoint
2. Test webhook delivery
3. Set up payment methods for target markets

---

## Implementation Timeline

**Week 1:** Database schema, migrations, basic file upload
**Week 2:** Tender creation/update with documents, file management
**Week 3:** Purchase flow, Stripe integration, webhook handling
**Week 4:** Document display, download functionality, testing
**Week 5:** Polish, error handling, deployment preparation

---

## Success Metrics

- [ ] Users can upload documents during tender creation
- [ ] Free documents can be downloaded immediately
- [ ] Paid documents require successful payment
- [ ] Purchase flow works for unauthenticated users
- [ ] Webhook processing is reliable
- [ ] File storage is secure and efficient
- [ ] UI/UX follows project style guide
- [ ] All error cases are handled gracefully
