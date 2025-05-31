'use server';

import stripe from '@/lib/stripe';
import { getTenderPurchaseInfo } from './_queries';
import { db } from '@/lib/db';
import { tenderPayments } from '@/lib/db/schema';

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
  console.log('inside initiateDocumentPurchaseAction');
  try {
    console.log('inside initiateDocumentPurchaseAction try');
    // Get tender details
    const tender = await getTenderPurchaseInfo(tenderId);
    console.log('tender details inside initiateDocumentPurchaseAction', tender);
    if (!tender) {
      console.log('insidetender not found');
      return { success: false, error: 'Tender not found' };
    }

    if (!tender.documentsArePaid || !tender.documentPrice) {
      console.log('inside tender.documentsArePaid || !tender.documentPrice');
      return { success: false, error: 'Documents are free' };
    }

    // Convert price to smallest currency unit (e.g., bututs for GMD)
    const amountInSmallestUnit = Math.round(tender.documentPrice * 100);

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('baseUrl inside initiateDocumentPurchaseAction', baseUrl);
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (tender.documentCurrency || 'GMD').toLowerCase(),
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
      success_url: `${baseUrl}/tenders/${tenderId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/tenders/${tenderId}/purchase/cancel`,
      metadata: {
        tenderId,
        purchaseType: 'TENDER_DOCUMENT',
        purchaserFullName: purchaserInfo.fullName,
        purchaserEmail: purchaserInfo.email,
        purchaserPhone: purchaserInfo.phone || '',
      },
    });
    console.log('stripesession inside initiateDocumentPurchaseAction', session);
    
    if (!session.url) {
      console.log('inside stripe session.url');
      return { success: false, error: 'Failed to create checkout session' };
    }

    // Create a pending payment record in the database
    await db().insert(tenderPayments).values({
      tenderId,
      amount: amountInSmallestUnit,
      currency: tender.documentCurrency || 'GMD',
      method: 'stripe',
      status: 'pending',
      transactionId: null, // Will be updated when payment completes
      stripeSessionId: session.id,
      purchaserFullName: purchaserInfo.fullName,
      purchaserEmail: purchaserInfo.email,
      purchaserPhone: purchaserInfo.phone || null,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('inside stripe session.url', session.url);
    return { success: true, checkoutUrl: session.url };
  } catch (error) {
    console.error('Purchase initiation error:', error);
    return { success: false, error: 'Failed to initiate purchase' };
  }
} 