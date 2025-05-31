# RLS Policies for Tender Document System

This document outlines the Row Level Security (RLS) policies created for the new tender document purchase system.

## Tables Covered

1. **tender_documents** - Stores tender document metadata
2. **tender_payments** - Tracks payments for document purchases
3. **tender_document_purchases** - Links payments to document access

## Security Model

### Tender Documents (`tender_documents`)

**Access Control:**
- **Everyone (including unauthenticated)**: Can view tender document metadata (filename, size, etc.)
- **Tender Owners**: Full CRUD access to their own tender documents
- **Admins**: Full CRUD access to all tender documents

**Key Policies:**
- `"Anyone can view tender document metadata"` - Allows everyone to see document information (but not download files)
- `"Tender owners can manage their tender documents"` - Allows tender creators to manage their documents
- `"Admins can manage all tender documents"` - Admin oversight and management capability

**Important Note:** While document metadata is publicly viewable, the actual document files are protected by storage policies and require payment for access.

### Tender Payments (`tender_payments`)

**Access Control:**
- **Payment Creators**: Can view their own payments (matched by email)
- **Tender Owners**: Can view payments made for their tenders
- **Anyone**: Can create new payments (for document purchases)
- **Admins**: Can update payment status and view all payments

**Key Policies:**
- `"Users can view their own tender payments"` - Users can see payments they made
- `"Anyone can create tender payments"` - Allows anonymous document purchases
- `"Admins can update tender payments"` - Admin control over payment status
- `"Tender owners can view payments for their tenders"` - Revenue visibility for tender creators

### Tender Document Purchases (`tender_document_purchases`)

**Access Control:**
- **Purchasers**: Can view their own purchase records (via payment email)
- **Tender Owners**: Can view purchase records for their tenders
- **System**: Can create purchase records after successful payments
- **Admins**: Full CRUD access to all purchase records

**Key Policies:**
- `"Users can view their own document purchases"` - Purchase history visibility
- `"System can create document purchase records"` - Automated record creation
- `"Tender owners can view purchase records for their tenders"` - Sales tracking
- `"Admins can manage all document purchase records"` - Admin oversight

## Storage Policies (The Paywall)

### Tender Documents Storage (`tender-documents` bucket)

**Access Control:**
- **Upload**: Only tender owners can upload documents to their tender folders
- **Download**: Only tender owners, document purchasers (with successful payments), and admins can download files
- **Update**: Only tender owners can update their documents
- **Delete**: Only tender owners can delete their documents

**Folder Structure:**
Documents are organized by tender ID: `tender-documents/{tender_id}/{document_files}`

**Key Features:**
- **Public Metadata, Private Files**: Document information is publicly visible, but file access requires payment
- **Payment Verification**: Download access verified through successful payment records
- **Folder-based Access Control**: Uses tender IDs for organization and access control
- **Admin Override**: Admins can access all documents for support and moderation

## Security Features

1. **Two-Tier Access Model**: 
   - **Metadata Level**: Public access to document information (encourages purchases)
   - **File Level**: Restricted access requiring successful payment
2. **Email-based Purchase Verification**: Uses purchaser email from payments to verify document access
3. **Payment Status Validation**: Only successful payments grant document download access
4. **Soft Delete Awareness**: Respects deleted flags in purchase and payment records
5. **Admin Override**: Admins have comprehensive access for support and moderation
6. **Tender Ownership**: Tender creators maintain full control over their documents

## Usage Patterns

### Public Browsing Flow
1. Anyone can view tenders and see available documents
2. Document metadata (filename, size, type) is visible to encourage purchases
3. Download links are only provided after successful payment

### Document Purchase Flow
1. User views tender and sees available documents (metadata only)
2. User creates payment record (`tender_payments`) to purchase access
3. Payment is processed externally (Stripe)
4. System creates purchase record (`tender_document_purchases`) after successful payment
5. User gains download access to documents via storage policies

### Access Verification
- **Metadata Access**: No verification required (public)
- **File Download Access**: Verified through the chain: `user_email` → `tender_payments` → `tender_document_purchases` → storage access
- All verification includes payment status and deletion flag checks

## Migration Files

- `0003_uneven_talisman.sql` - Creates the tables and indexes
- `0004_tender_rls_policies.sql` - Implements the RLS policies
- `lib/db/rls_policies.sql` - Updated to include new tables in RLS enable list 