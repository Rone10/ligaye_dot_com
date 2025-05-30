import { db } from '@/lib/db';
import { tenders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getTenderPurchaseInfo(tenderId: string) {
  try {
    const database = await db();
    
    const [tender] = await database
      .select({
        id: tenders.id,
        title: tenders.title,
        organizationName: tenders.organizationName,
        documentsArePaid: tenders.documentsArePaid,
        documentPrice: tenders.documentPrice,
        documentCurrency: tenders.documentCurrency,
      })
      .from(tenders)
      .where(eq(tenders.id, tenderId));

    return tender || null;
  } catch (error) {
    console.error('Error fetching tender purchase info:', error);
    return null;
  }
} 