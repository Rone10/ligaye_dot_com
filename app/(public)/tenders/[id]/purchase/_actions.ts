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