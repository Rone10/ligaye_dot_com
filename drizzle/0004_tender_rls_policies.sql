-- Enable Row Level Security for new tender-related tables
ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_document_purchases ENABLE ROW LEVEL SECURITY;

-- ========================================
-- TENDER DOCUMENTS POLICIES
-- ========================================

-- Tender owners can manage their tender documents
CREATE POLICY "Tender owners can manage their tender documents" 
ON tender_documents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE tenders.id = tender_documents.tender_id
    AND profiles.user_id = auth.uid()
  )
);

-- Anyone can view tender document metadata (but not the actual files)
CREATE POLICY "Anyone can view tender document metadata" 
ON tender_documents FOR SELECT 
USING (NOT deleted);

-- Admins can manage all tender documents
CREATE POLICY "Admins can manage all tender documents" 
ON tender_documents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ========================================
-- TENDER PAYMENTS POLICIES
-- ========================================

-- Users can view their own payments (by email)
CREATE POLICY "Users can view their own tender payments" 
ON tender_payments FOR SELECT 
USING (
  purchaser_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- Anyone can create tender payments (for purchasing documents)
CREATE POLICY "Anyone can create tender payments" 
ON tender_payments FOR INSERT 
WITH CHECK (true);

-- Only system/admin can update payment status
CREATE POLICY "Admins can update tender payments" 
ON tender_payments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Tender owners can view payments for their tenders
CREATE POLICY "Tender owners can view payments for their tenders" 
ON tender_payments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE tenders.id = tender_payments.tender_id
    AND profiles.user_id = auth.uid()
  )
);

-- ========================================
-- TENDER DOCUMENT PURCHASES POLICIES
-- ========================================

-- Users can view their own document purchases (by payment email)
CREATE POLICY "Users can view their own document purchases" 
ON tender_document_purchases FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tender_payments
    WHERE tender_payments.id = tender_document_purchases.tender_payment_id
    AND tender_payments.purchaser_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- System can create purchase records after successful payment
CREATE POLICY "System can create document purchase records" 
ON tender_document_purchases FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tender_payments
    WHERE tender_payments.id = tender_document_purchases.tender_payment_id
    AND tender_payments.status = 'succeeded'
  )
);

-- Tender owners can view purchase records for their tenders
CREATE POLICY "Tender owners can view purchase records for their tenders" 
ON tender_document_purchases FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE tenders.id = tender_document_purchases.tender_id
    AND profiles.user_id = auth.uid()
  )
);

-- Admins can manage all purchase records
CREATE POLICY "Admins can manage all document purchase records" 
ON tender_document_purchases FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ========================================
-- STORAGE POLICIES FOR TENDER DOCUMENTS
-- ========================================

-- Policy for uploading tender documents (only tender owners can upload)
CREATE POLICY "Tender owners can upload tender documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tender-documents' AND
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE profiles.user_id = auth.uid()
    AND (storage.foldername(name))[1] = tenders.id::text
  )
);

-- Policy for viewing tender documents (only purchasers and tender owners can access actual files)
CREATE POLICY "Authorized users can download tender documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tender-documents' AND
  (
    -- Tender owners can view their documents
    EXISTS (
      SELECT 1 FROM tenders
      JOIN profiles ON profiles.id = tenders.user_id
      WHERE profiles.user_id = auth.uid()
      AND (storage.foldername(name))[1] = tenders.id::text
    )
    OR
    -- Document purchasers can view documents they've purchased
    EXISTS (
      SELECT 1 FROM tender_document_purchases
      JOIN tender_payments ON tender_payments.id = tender_document_purchases.tender_payment_id
      WHERE tender_document_purchases.tender_id::text = (storage.foldername(name))[1]
      AND tender_payments.status = 'succeeded'
      AND tender_payments.purchaser_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND NOT tender_document_purchases.deleted
      AND NOT tender_payments.deleted
    )
    OR
    -- Admins can view all documents
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
);

-- Policy for updating tender documents (only tender owners can update)
CREATE POLICY "Tender owners can update their tender documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tender-documents' AND
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE profiles.user_id = auth.uid()
    AND (storage.foldername(name))[1] = tenders.id::text
  )
)
WITH CHECK (
  bucket_id = 'tender-documents' AND
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE profiles.user_id = auth.uid()
    AND (storage.foldername(name))[1] = tenders.id::text
  )
);

-- Policy for deleting tender documents (only tender owners can delete)
CREATE POLICY "Tender owners can delete their tender documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tender-documents' AND
  EXISTS (
    SELECT 1 FROM tenders
    JOIN profiles ON profiles.id = tenders.user_id
    WHERE profiles.user_id = auth.uid()
    AND (storage.foldername(name))[1] = tenders.id::text
  )
); 